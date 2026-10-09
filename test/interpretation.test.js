import test from "node:test";
import assert from "node:assert/strict";
import {interpretation,investigationTrace,investigationResult,serializeTrace,TRACE_MAX_BYTES} from "../dist/src/interpretation.js";
import {huntDataset,assessHunt,intervalSample,correlationDataset,missionFeedback} from "../dist/src/statistics.js";

const settings={huntMetrics:6,huntTruth:"null",huntPolicy:"peek",huntCorrection:"raw",correlationScenario:"confounding",correlationView:"all",intervalSize:200,intervalMode:"random",intervalConfidence:.95};
test("hunt interpretation compares actual identical-data outcomes and planned versus inspected family",()=>{
  const s={...settings},copy=structuredClone(s),text=interpretation("hunt",42,s);
  assert.match(text,/15\/20/);assert.match(text,/p=0.04139/);assert.match(text,/최종 검사: 기각 없음/);assert.match(text,/가족 보정 적용: 기각 없음/);
  assert.match(text,/160회 중 79회/);assert.match(text,/수행된 6회가 아닌 계획된 24회/);assert.deepEqual(s,copy);
  const corrected=interpretation("hunt",42,{...s,huntCorrection:"bonferroni"});assert.match(corrected,/160회 중 3회/);assert.notEqual(corrected,text);
  const one=interpretation("hunt",42,{...s,huntMetrics:1,huntPolicy:"fixed"});assert.match(one,/단일 검정/);
  const signal=interpretation("hunt",42,{...s,huntMetrics:1,huntTruth:"signal"});assert.match(signal,/지표 1의 기각 횟수/);assert.doesNotMatch(signal,/지표 1 이외/);
});
test("correlation interpretation identifies largest leave-one-out effect from coordinates",()=>{
  for(const scenario of ["confounding","outlier"]){
    const s={...settings,correlationScenario:scenario},r=investigationResult("correlation",42,s),text=interpretation("correlation",42,s);
    const changes=r.full.leaveOneOut.map(p=>({id:p.id,r:p.r,change:Math.abs(p.r-r.full.r)})).sort((a,b)=>b.change-a.change);
    assert.ok(text.includes(`${changes[0].id+1}번: r=${changes[0].r.toFixed(3)}`));
    if(scenario==="outlier"){assert.match(text,/방향 반전/);assert.match(text,/influential: 1점, r=미정의/);assert.match(text,/\(0,0\)/);}
    else{assert.match(text,/I: 12점/);assert.match(text,/중심화 후 r=-0.905/);}
    assert.match(interpretation("correlation",42,{...s,correlationView:"without"}),/현재 보기는 24번 제외/);
  }
});
test("interval feedback separates pool coverage from target coverage, even when width spans bias",()=>{
  for(const n of [20,80,200])for(const mode of ["random","biased"])for(const confidence of [.9,.95,.99]){
    const s={...settings,intervalSize:n,intervalMode:mode,intervalConfidence:confidence},r=investigationResult("interval",42,s),text=interpretation("interval",42,s);
    const poolHits=r.replications.filter(c=>c.low<=c.poolTarget&&c.poolTarget<=c.high).length;
    assert.ok(text.includes(`포함: ${poolHits}/160`));assert.ok(text.includes(`포함: ${r.covered}/160`));
    assert.ok(text.includes(`절단 전 반폭 ${r.current.epsilon.toFixed(3)}`));
    if(mode==="random")assert.match(text,/동일한 대상을 추정/);
    else if(Math.abs(r.current.poolTarget-.6)>r.current.epsilon)assert.match(text,/차이가 반폭보다 큽니다/);
    else assert.match(text,/포함 보장의 대상은 선택 풀/);
    assert.match(missionFeedback("interval","probability",r).text,new RegExp(Math.round(confidence*100)+"%"));
  }
});
test("trace contains every current and repeated observation and replays all actual calculations",()=>{
  for(const mission of ["hunt","correlation","interval"]){
    const trace=investigationTrace(mission,42,settings);
    assert.deepEqual(trace,investigationTrace(mission,42,settings));
    assert.equal(trace.version,1);assert.equal(trace.kind,"synthetic-investigation");
    assert.ok(Object.keys(trace.settings).every(k=>k.startsWith(mission)));
    if(mission==="hunt"){
      assert.equal(trace.replications.length,160);
      assert.equal(new Set(trace.replications.map(r=>r.seed)).size,160);
      let flagged=0;
      for(const r of trace.replications){assert.deepEqual(r.dataset,huntDataset(r.seed,6));assert.deepEqual(r.assessment,assessHunt(r.dataset));if(r.assessment.rejected)flagged++;}
      assert.equal(flagged,trace.result.flagged);
    }
    if(mission==="interval")for(const r of trace.result.replications)assert.deepEqual(r,intervalSample(r.seed,200));
    if(mission==="correlation")assert.deepEqual(trace.result.points,correlationDataset(42));
  }
});
test("largest supported trace stays below the 4 MiB download cap",()=>{
  for(const mission of ["hunt","interval"]){
    const s={...settings,huntMetrics:12,intervalSize:200},json=serializeTrace(mission,4294967295,s);
    assert.ok(Buffer.byteLength(json,"utf8")<TRACE_MAX_BYTES);
    assert.deepEqual(JSON.parse(json),investigationTrace(mission,4294967295,s)); // No omitted rows to meet the cap.
  }
});
test("feedback and trace reject unknown missions, missing rules and negative or coerced bounds",()=>{
  for(const fn of [interpretation,investigationTrace,investigationResult,serializeTrace]){
    for(const [mission,seed,s]of [["unknown",42,settings],["hunt",0,settings],["hunt","42",settings],["hunt",42,{...settings,huntMetrics:13}],["hunt",42,{...settings,huntMetrics:0}],["hunt",42,{}],["hunt",42,{...settings,huntPolicy:"unlimited"}],["correlation",42,{...settings,correlationView:"cause"}],["interval",42,{...settings,intervalSize:201}],["interval",42,{...settings,intervalConfidence:.5}],["interval",42,{...settings,intervalMode:"private"}],["hunt",42,null]])assert.throws(()=>fn(mission,seed,s));
  }
});
