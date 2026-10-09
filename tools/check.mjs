import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const root = resolve("dist");
let count = 0;
let textCount = 0;
async function verifiedText(path) {
  const bytes=await readFile(path);
  assert(!(bytes[0]===239&&bytes[1]===187&&bytes[2]===191),"Unexpected BOM: "+path);
  const source=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  assert(!/(?<!\r)\n|\r(?!\n)/.test(source),"Expected CRLF: "+path);
  textCount++;
  return source;
}
async function walk(dir) {
  for (const e of await readdir(dir, {withFileTypes:true})) {
    const p = resolve(dir,e.name);
    if(e.isDirectory()) { await walk(p); continue; }
    count++;
    const source=/\.(js|css|html)$/.test(e.name)?await verifiedText(p):null;
    if(e.name.endsWith(".js")) {
      execFileSync(process.execPath,["--check",p],{stdio:"inherit"});
      assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|sessionStorage|indexedDB|serviceWorker)\b|document\.cookie/.test(source),"Network or forbidden persistence primitive: "+p);
      if(p===resolve(root,"src/progress.js")) {
        // D08 explicitly permits only two bounded local keys in this boundary.
        assert(source.includes('SUMMARY_KEY="web-lab-progress-v1"')&&source.includes('OWN_KEY="data-mirage-achievements-v1"'),"Unexpected storage keys");
        assert((source.match(/\blocalStorage\b/g)??[]).length===1&&source.includes("return window.localStorage"),"Unbounded storage access");
        assert(!/storage\.(?:clear|key|length)\b/.test(source),"Cross-app storage operation");
        for(const [,key]of source.matchAll(/storage\.(?:getItem|setItem|removeItem)\(\s*([^,\)]+)/g))assert(["SUMMARY_KEY","OWN_KEY"].includes(key),"Unexpected storage target");
      } else assert(!/\blocalStorage\b|\.(?:getItem|setItem|removeItem)\(/.test(source),"Storage outside progress boundary: "+p);
      for(const [,ref] of source.matchAll(/\bfrom\s+["']([^"']+)["']/g)) {
        assert(ref.startsWith("./"),"Nonlocal module: "+p);
        const target=resolve(dirname(p),ref);
        assert(target.startsWith(root+sep),"Module escaped dist");await readFile(target);
      }
      if(["model.js","statistics.js","math.js","interpretation.js","exercises.js","curriculum.js","problem-bank.js"].includes(e.name)) {
        assert(!/\b(?:document|window|navigator|crypto)\b/.test(source),"Browser access in pure calculation: "+p);
        assert(!/from\s+["']\.\/(?:ui|app|investigations|progress|exercise-ui)\.js/.test(source),"UI/storage dependency in pure calculation: "+p);
      }
    }
    if(e.name.endsWith(".css"))assert(!/@import|url\(\s*["']?https?:/i.test(source),"Remote CSS asset");
    if(!e.name.endsWith(".html")) continue;
    const html=source;
    assert(html.includes('lang="ko"')&&html.includes('name="viewport"')&&html.includes('<title>'),"Missing metadata");
    assert(html.includes("connect-src 'none'")&&html.includes("object-src 'none'"),"Missing connection policy");
    assert(!/<iframe\b|\son\w+=/i.test(html),"Inline execution or frame");
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert(new Set(ids).size===ids.length,"Duplicate HTML id");
    const tabs=[...html.matchAll(/<button\s+id="(tab-[^"]+)"\s+role="tab"[^>]+aria-controls="([^"]+)"/g)];
    assert(tabs.length===6,"Expected six investigation tabs");
    for(const [,tab,panel]of tabs)assert(html.includes('id="'+panel+'" role="tabpanel" aria-labelledby="'+tab+'"'),"Broken tab relation");
    for(const jsName of ["app.js","investigations.js","exercise-ui.js"]) {
      const js=await readFile(resolve(root,"src",jsName),"utf8");
      for(const [,id]of js.matchAll(/\$\("#([A-Za-z][A-Za-z0-9]*)"\)/g))assert(ids.includes(id),"Missing UI target: "+id);
    }
    for(const [,ref] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      if(/^(https?:|data:)/.test(ref)) continue;
      const target=resolve(dirname(p),ref.endsWith("/")?ref+"index.html":ref);
      assert(target.startsWith(root+sep),"Asset escaped dist");
      await readFile(target);
    }
    assert(!/<(?:script|link|img)[^>]+(?:src|href)="https?:/i.test(html),"Remote executable or asset");
  }
}
await walk(root);
for(const file of ["architecture.md","README.md","docs/decisions.md","docs/verification.md","test/model.test.js","test/statistics.test.js","test/interpretation.test.js","test/exercises.test.js","test/progress.test.js","tools/check.mjs","tools/serve.mjs","package.json",".gitattributes"])await verifiedText(resolve(file));
for(const file of ["tools/check.mjs","tools/serve.mjs"])execFileSync(process.execPath,["--check",resolve(file)],{stdio:"inherit"});
console.log(`PASS: ${count} public files, ${textCount} UTF-8/no-BOM/CRLF files; syntax, local references/imports, tab/DOM targets, metadata, CSP, pure-model boundaries, no runtime network or remote assets; local storage restricted to the approved two-key progress boundary.`);
