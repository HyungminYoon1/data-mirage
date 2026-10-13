// Manual isolated Chrome harness; npm test/CI does not execute tools/edge-browser.mjs.
// Start tools/serve.mjs first. EDGE_URL must be an owned loopback server.
// Uses the approved reusable Playwright installation; no personal browser profile.
import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const qaRequire=createRequire(resolve(process.env.PLAYWRIGHT_PACKAGE ?? '../output/playwright/implement-20261012/package.json'));
const {chromium}=qaRequire('playwright');
const url=process.env.EDGE_URL;
if(!url || new URL(url).hostname!=='127.0.0.1')throw Error('Set EDGE_URL to the owned loopback URL');
const out=resolve('output/playwright/edge-20261013');
let browser;
before(async()=>{await mkdir(out,{recursive:true});browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:false,args:['--mute-audio']});});
after(async()=>{await browser?.close();});
async function fresh(t,init){
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  t.after(()=>context.close());if(init)await context.addInitScript(init);
  const page=await context.newPage();page.setDefaultTimeout(5000);await page.goto(url);return page;
}
async function views(page,name,locator){
  for(const [width,height]of [[1440,1000],[390,844],[320,780]]){
    await page.setViewportSize({width,height});if(locator)await locator.scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'page overflow '+width);
    await page.screenshot({path:resolve(out,name+'-'+width+'.png'),scale:'css'});
  }
}

async function desk(p){await p.getByRole('button',{name:'문제 풀기',exact:true}).click();await p.getByLabel('문제 단계',{exact:true}).selectOption('0');await p.getByLabel('문제 유형',{exact:true}).selectOption('pooled');}
test('edge-browser: stale next callback cannot discard a fresh problem',async t=>{
  const p=await fresh(t);await desk(p);
  for(const i of await p.locator('.problem-fields input').all())await i.fill('999');
  await p.getByRole('button',{name:'답 확인',exact:true}).click();
  await p.evaluate(()=>window.oldNext=document.querySelector('.problem-result button'));
  await p.getByRole('button',{name:'다음 문제 →',exact:true}).click();
  const before=await p.locator('.problem-prompt').textContent();
  await p.evaluate(()=>window.oldNext.click());
  assert.equal(await p.locator('.problem-prompt').textContent(),before,'late next must preserve new problem and inputs');
});

test('edge-browser: review history cap, scratch reset, wrong terminal attempt and repeated next',async t=>{
  const p=await fresh(t);await desk(p);
  await p.locator('.problem-notebook > summary').click();await p.getByLabel('문제 풀이 메모').fill('중간 계산 보존');
  for(let j=0;j<13;j++){
    for(const i of await p.locator('.problem-fields input').all())await i.fill('999');
    await p.getByRole('button',{name:'답 확인',exact:true}).click();
    assert.equal(await p.locator('.problem-fields input:disabled').count(),2);
    assert.equal(await p.locator('.problem-review > div > details').count(),Math.min(j+1,12));
    if(j<12){await p.getByRole('button',{name:'다음 문제 →',exact:true}).click();assert.equal(await p.getByLabel('문제 풀이 메모').inputValue(),'');}
  }
  assert.match(await p.locator('.problem-stats').textContent(),/13문제 제출 \/ 0문제 모두 정답/);
});
test('edge-browser: changing investigation discards pending exercise without durable award',async t=>{
  const p=await fresh(t);await p.getByRole('button',{name:'보조 실험 ↗',exact:true}).click();await p.locator('#startExercise').click();
  await p.locator('#exerciseInput').fill('999');await p.locator('#tab-interval').click();
  assert.equal(await p.locator('#exerciseForm').isHidden(),true);
  await p.evaluate(()=>document.querySelector('#exerciseForm').requestSubmit());
  assert.match(await p.locator('#exerciseProgress').textContent(),/0\/6/);
  assert.equal(await p.evaluate(()=>localStorage.getItem('data-mirage-achievements-v1')),null);
});

test('edge-browser: pooled independent microdata oracle, invalid and repeated submissions, lesson transitions',async t=>{
  const p=await fresh(t);const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await views(p,'initial');await desk(p);
  const prompt=await p.locator('.problem-prompt').textContent();
  const m=prompt.match(/크기 (\d+), 평균 (\d+), 모집단 방식 분산 (\d+); B의 크기 (\d+), 평균 (\d+), 모집단 방식 분산 (\d+)/);
  assert.ok(m);const [n1,m1,v1,n2,m2,v2]=m.slice(1).map(Number);
  // Independent synthetic observations reproduce each group's stated moments.
  const xs=[...Array.from({length:n1},()=>[m1-Math.sqrt(v1),m1+Math.sqrt(v1)]).flat(),...Array.from({length:n2},()=>[m2-Math.sqrt(v2),m2+Math.sqrt(v2)]).flat()];
  const mean=xs.reduce((s,x)=>s+x,0)/xs.length,variance=xs.reduce((s,x)=>s+(x-mean)**2,0)/xs.length;
  const inputs=p.locator('.problem-fields input');await inputs.nth(0).fill('1/0');await inputs.nth(1).fill(String(variance));
  await p.getByRole('button',{name:'답 확인',exact:true}).click();assert.equal(await inputs.nth(0).isEnabled(),true);
  await inputs.nth(0).fill(String(mean));await inputs.nth(1).press('Enter');
  assert.match(await p.locator('.problem-result').textContent(),/두 답을 모두 맞/);
  const stats=await p.locator('.problem-stats').textContent();
  await p.evaluate(()=>document.querySelector('.problem-form').requestSubmit());assert.equal(await p.locator('.problem-stats').textContent(),stats);
  await views(p,'answer',p.locator('.problem-result'));
  await p.getByRole('button',{name:'개념 학습',exact:true}).click();await p.getByRole('button',{name:'다음 개념 →',exact:true}).click();
  await p.getByRole('button',{name:'문제 풀기',exact:true}).click();assert.equal(await p.locator('.problem-stats').textContent(),stats);
  await p.getByRole('button',{name:'다음 문제 →',exact:true}).click();assert.equal(await p.locator('.problem-fields input:disabled').count(),0);
  assert.match(await p.locator('.problem-review').textContent(),/내 답/);assert.equal(errors.length,0);
});
test('edge-browser: invalid seed preserves experiment, keyboard tabs, six controls and actual download',async t=>{
  const p=await fresh(t);await p.getByRole('button',{name:'보조 실험 ↗',exact:true}).click();
  await p.locator('#trialSeed').fill('42');await p.locator('#replaySeed').click();
  await p.locator('#tab-hunt').click();assert.equal(await p.locator('#huntRate').textContent(),'79 / 160');
  await p.locator('#huntCorrection').selectOption('bonferroni');assert.equal(await p.locator('#huntRate').textContent(),'3 / 160');
  const before=await p.locator('#huntEvidence').textContent();
  await p.locator('#trialSeed').fill('4294967296');await p.locator('#replaySeed').click();
  assert.equal(await p.locator('#huntEvidence').textContent(),before);
  await p.locator('#tab-hunt').press('Home');assert.equal(await p.evaluate(()=>document.activeElement.id),'tab-axis');
  await p.locator('#tab-axis').press('End');assert.equal(await p.evaluate(()=>document.activeElement.id),'tab-interval');
  await p.locator('#intervalSize').selectOption('200');await p.locator('#intervalMode').selectOption('biased');
  assert.equal(await p.locator('#intervalCoverage').textContent(),'0 / 160');
  for(const id of ['sample','simpson','correlation','hunt','interval','axis'])await p.locator('#tab-'+id).click();
  await p.locator('#tab-correlation').click();await p.locator('#correlationScenario').selectOption('outlier');await p.locator('#correlationView').selectOption('without');
  assert.match(await p.locator('#correlationCurrent').textContent(),/-0.972/);
  const download=p.waitForEvent('download');await p.locator('[data-export="correlation"]').click();const d=await download;await d.saveAs(resolve(out,'correlation.json'));
  const trace=JSON.parse(await readFile(resolve(out,'correlation.json'),'utf8'));assert.equal(trace.seed,42);
  await views(p,'experiment',p.locator('#correlationCurrent'));
});
test('edge-browser: first wrong exercise closes, new correct award reloads, clear preserves sibling',async t=>{
  const p=await fresh(t,()=>{localStorage.setItem('web-lab-progress-v1',JSON.stringify({version:1,apps:{'think-forge':{completed:2,total:48,updatedAt:'2026-10-09T00:00:00.000Z'}}}));});
  await p.getByRole('button',{name:'보조 실험 ↗',exact:true}).click();await p.locator('#tab-correlation').click();
  await p.locator('#startExercise').click();await p.locator('#exerciseInput').fill('NaN');await p.locator('#submitExercise').click();assert.equal(await p.locator('#exerciseInput').isEnabled(),true);
  await p.locator('#exerciseInput').fill('999');await p.locator('#submitExercise').click();assert.equal(await p.locator('#exerciseInput').isDisabled(),true);
  assert.match(await p.locator('#exerciseProgress').textContent(),/0\/6/);
  await p.locator('#startExercise').click();const prompt=await p.locator('#exercisePrompt').textContent();const matches=[...prompt.matchAll(/r=(-?\d+(?:\.\d+)?)/g)];assert.equal(matches.length,2);
  await p.locator('#exerciseInput').fill(String(Math.sign(Number(matches[1][1]))));await p.locator('#exerciseInput').press('Enter');
  assert.match(await p.locator('#exerciseProgress').textContent(),/1\/6/);
  await p.reload();assert.equal(JSON.parse(await p.evaluate(()=>localStorage.getItem('data-mirage-achievements-v1'))).completed.length,1);
  await p.getByRole('button',{name:'보조 실험 ↗',exact:true}).click();await p.locator('#clearProgress').click();
  const summary=JSON.parse(await p.evaluate(()=>localStorage.getItem('web-lab-progress-v1')));
  assert.deepEqual(summary.apps['think-forge'],{completed:2,total:48,updatedAt:'2026-10-09T00:00:00.000Z'});assert.equal(Object.hasOwn(summary.apps,'data-mirage'),false);
});
test('edge-browser: denied storage still permits exercise with failure disclosure',async t=>{
  const p=await fresh(t,()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('QA denied','SecurityError');}});});
  await p.getByRole('button',{name:'보조 실험 ↗',exact:true}).click();await p.locator('#tab-correlation').click();await p.locator('#startExercise').click();
  const text=await p.locator('#exercisePrompt').textContent(),m=[...text.matchAll(/r=(-?\d+(?:\.\d+)?)/g)];
  await p.locator('#exerciseInput').fill(String(Math.sign(Number(m[1][1]))));await p.locator('#submitExercise').click();
  assert.match(await p.locator('#exerciseResult').textContent(),/저장할 수 없습니다/);assert.equal(await p.locator('#exerciseInput').isDisabled(),true);
});

