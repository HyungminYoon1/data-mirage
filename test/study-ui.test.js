// Node DOM double: deterministic lifecycle evidence, not browser/layout/OS IME.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mountStudy} from '../dist/src/study-ui.js';
class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.attributes={};this.dataset={};this.events={};this._text='';this.value='';}
  set textContent(v){this._text=String(v);this.children=[];}
  get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  append(...children){this.children.push(...children);if(this.tagName==='select'&&!this.value)this.value=String(children[0]?.value??'');}
  prepend(...children){this.children.unshift(...children);}
  replaceChildren(...children){this.children=[];this._text='';if(this.tagName==='select')this.value='';this.append(...children);}
  setAttribute(k,v){this.attributes[k]=String(v);}
  removeAttribute(k){delete this.attributes[k];}
  addEventListener(k,v){this.events[k]=v;}
  querySelectorAll(s){return this.children.flatMap(c=>[...(s===c.tagName||s==='.'+c.className?[c]:[]),...c.querySelectorAll(s)]);}
  click(){this.events.click?.();}
}
function setup(t){
  const original=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};t.after(()=>{globalThis.document=original;});
  const root=new Element('div');let seed=1907;mountStudy(root,{randomSeed:()=>seed+=7919,onExperiment:()=>{}});
  const button=text=>root.querySelectorAll('button').find(b=>b.textContent===text);
  button('문제 풀기').click();const form=root.querySelectorAll('form')[0];
  const inputs=()=>root.querySelectorAll('.problem-fields')[0].querySelectorAll('input');
  return {root,button,inputs,submit:()=>form.events.submit({preventDefault(){}}),stats:()=>root.querySelectorAll('.problem-stats')[0].textContent,prompt:()=>root.querySelectorAll('.problem-prompt')[0].textContent};
}
test('edge DOM double: stale next after navigation cannot discard an active problem',t=>{
  const a=setup(t);a.inputs().forEach(i=>i.value='999');a.submit();
  const next=a.button('다음 문제 →');next.click();const prompt=a.prompt();
  a.inputs()[0].value='unfinished';next.click();
  assert.equal(a.prompt(),prompt);assert.equal(a.inputs()[0].value,'unfinished');
});
test('edge DOM double: invalid second field leaves attempt open then wrong first submission closes once',t=>{
  const a=setup(t);a.inputs()[0].value='999';a.inputs()[1].value='1/0';a.submit();
  assert.match(a.stats(),/0문제 제출/);assert.ok(a.inputs().every(i=>!i.disabled));
  a.inputs()[1].value='999';a.submit();assert.ok(a.inputs().every(i=>i.disabled));assert.match(a.stats(),/1문제 제출/);
  const stats=a.stats();a.submit();assert.equal(a.stats(),stats);
  a.button('개념 학습').click();a.button('문제 풀기').click();assert.equal(a.stats(),stats);
});
test('edge DOM double: review retains twelve recent solutions and next resets scratch',t=>{
  const a=setup(t),scratch=a.root.querySelectorAll('textarea')[0];
  for(let n=1;n<=13;n++){scratch.value='calculation';a.inputs().forEach(i=>i.value='999');a.submit();
    const container=a.root.querySelectorAll('.problem-review')[0].children[1];assert.equal(container.children.length,Math.min(n,12));
    a.button('다음 문제 →').click();assert.equal(scratch.value,'');
  }
  assert.match(a.stats(),/13문제 제출/);
});

