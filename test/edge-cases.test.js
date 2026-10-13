import test from 'node:test';
import assert from 'node:assert/strict';
import {numericAnswer,problem,grade} from '../dist/src/problem-bank.js';
import {exercise,submitExercise} from '../dist/src/exercises.js';
import {axisSummary,population,samplePopulation,simpson} from '../dist/src/model.js';
import {fairCoinP,boundedInterval,pearson,huntDataset,intervalSample} from '../dist/src/statistics.js';
import {OWN_KEY,SUMMARY_KEY,readAchievements,saveAchievements,clearAchievements,syncSummary} from '../dist/src/progress.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9, a+' vs '+b);
test('edge: numeric parser signed fraction/exponent, exact length and magnitude boundaries',()=>{
  for(const [s,n]of [['−.5/2e-1',-2.5],['+1.',1],['1e8',1e8],['-1e8',-1e8],['0'.repeat(47)+'1',1],['  .5  ',.5]])close(numericAnswer(s),n);
  for(const s of ['0'.repeat(48)+'1','100000000.000001','-100000000.000001','1e309','NaN','Infinity','0/0','1/-0','1/','1//2',{},[],null,1,NaN,Infinity])assert.throws(()=>numericAnswer(s));
});
test('edge: invalid second answer does not mutate grading inputs and corrected resubmit uses canonical problem',()=>{
  const q=problem('pooled',1907),copy=structuredClone(q),answers=q.fields.map(f=>f.value.toFixed(6));
  assert.throws(()=>grade(q,[answers[0],'1/0']));assert.deepEqual(q,copy);
  const outcome=grade(q,answers);assert.equal(outcome.correct,true);
  assert.throws(()=>grade(q,answers,outcome));assert.throws(()=>grade(q,[...answers,'3']));
  const forged={...q,fields:[{value:999},{value:999}],steps:[]};assert.equal(grade(forged,answers).correct,true);
});
test('edge: exercise input endpoints are valid attempts, just outside and nonfinite keep attempt open',()=>{
  const q=exercise('axis',1);
  for(const s of ['-1000','1000','+'+'0'.repeat(30)+'1'])assert.equal(submitExercise(q,s).correct,false);
  for(const s of ['-1000.001','1000.001','0'.repeat(33),'NaN','Infinity','1/0',null,NaN])assert.throws(()=>submitExercise(q,s));
  assert.equal(submitExercise(q,q.expected.toFixed(1)).correct,true);
});
test('edge: axis/sample/Simpson min and max cases retain independent totals and input snapshots',()=>{
  close(axisSummary(0).heightRatio,56/52);assert.equal(axisSummary(51).heightRatio,5);
  for(const x of [-Number.EPSILON,51.0001,NaN,Infinity])assert.throws(()=>axisSummary(x));
  const data=population(),copy=structuredClone(data);
  for(const n of [5,80])for(const mode of ['random','high','low']){
    const s=samplePopulation(data,n,mode,4294967295);assert.equal(s.sample.length,n);assert.equal(new Set(s.sample.map(x=>x.id)).size,n);
    close(s.sampleMean,s.sample.reduce((v,x)=>v+x.score,0)/n);
  }
  for(const n of [4,81,5.1,'5',NaN,Infinity])assert.throws(()=>samplePopulation(data,n));
  assert.deepEqual(data,copy);
  for(const a of [10,80])for(const b of [10,80]){const s=simpson(a,b);for(const side of [s.A,s.B])assert.equal(side.easy.n+side.hard.n,90);}
  for(const n of [0,9,11,81,NaN,Infinity,null,'10'])assert.throws(()=>simpson(n,10));
});
test('edge: fair coin n=1/80 and interval n=1/200 validate just-outside counts and clipping',()=>{
  assert.equal(fairCoinP(0,1),1);assert.equal(fairCoinP(80,80),2**-79);
  for(const n of [1,200])for(const k of [0,n]){const r=boundedInterval(k,n,.99);assert.equal(k===0?r.low:r.high,k===0?0:1);}
  for(const args of [[-1,1],[2,1],[0,0],[0,201],[NaN,20],[0,Infinity],[0,'20']])assert.throws(()=>boundedInterval(...args));
  for(const points of [[],[{x:1,y:2}], [{x:1,y:Infinity},{x:2,y:3}],null])assert.throws(()=>pearson(points));
  assert.equal(pearson([{x:0,y:2},{x:1,y:2}]),null);
});
test('edge: uint32 endpoint streams/sample prefixes survive maximum workload and remain immutable',()=>{
  for(const seed of [1,4294967295]){
    const a=huntDataset(seed,1),b=huntDataset(seed,12);assert.deepEqual(b.streams[0],a.streams[0]);assert.equal(b.streams.length,12);
    const short=intervalSample(seed,20,'biased'),long=intervalSample(seed,200,'biased');assert.deepEqual(long.draws.slice(0,20),short.draws);
  }
});
test('edge: private/shared read caps accept exact boundary and reject one-over without overwriting',()=>{
  const initial=JSON.stringify({version:1,completed:['axis']});
  for(const size of [512,513]){
    let own=initial+' '.repeat(size-initial.length);const before=own;
    const s={getItem:k=>k===OWN_KEY?own:null,setItem:(k,v)=>{if(k===OWN_KEY)own=v;}};
    assert.equal(readAchievements(s).valid,size===512);
    assert.equal(saveAchievements(s,['hunt']).durable,size===512);
    if(size===513)assert.equal(own,before);
  }
  const shared=JSON.stringify({version:1,apps:{}});
  for(const size of [8192,8193]){
    const map=new Map([[OWN_KEY,initial],[SUMMARY_KEY,shared+' '.repeat(size-shared.length)]]),before=map.get(SUMMARY_KEY);
    const s={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
    assert.equal(syncSummary(s),size===8192);if(size===8193)assert.equal(map.get(SUMMARY_KEY),before);
  }
});
test('edge: private write followed by denied readback reports partial durability; denied remove keeps siblings',()=>{
  const map=new Map([[SUMMARY_KEY,'sibling bytes']]);let reads=0;
  const s={getItem(k){if(k===OWN_KEY&&++reads>1)throw Error('denied readback');return map.get(k)??null;},setItem:(k,v)=>map.set(k,v),removeItem(){throw Error('denied remove');}};
  assert.deepEqual(saveAchievements(s,['axis']),{durable:true,summary:false});
  assert.equal(JSON.parse(map.get(OWN_KEY)).completed[0],'axis');assert.equal(map.get(SUMMARY_KEY),'sibling bytes');
  assert.deepEqual(clearAchievements(s),{durable:false,summary:false});assert.equal(map.get(SUMMARY_KEY),'sibling bytes');
});

