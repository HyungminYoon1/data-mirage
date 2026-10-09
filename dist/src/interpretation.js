import {huntExperiment,huntDataset,assessHunt,correlationDataset,correlationSummary,intervalExperiment} from "./statistics.js";
import {seedNumber,integer} from "./math.js";

export const INVESTIGATIONS=Object.freeze(["hunt","correlation","interval"]);
export const TRACE_MAX_BYTES=4*1024*1024;
export function investigationResult(mission,seed,settings) {
  seedNumber(seed);
  if(!settings||typeof settings!=="object"||Array.isArray(settings))throw new TypeError("Settings required");
  if(mission==="hunt"){
    integer(settings.huntMetrics,1,12,"metrics");
    if(!["null","signal"].includes(settings.huntTruth)||!["peek","fixed"].includes(settings.huntPolicy)||!["raw","bonferroni"].includes(settings.huntCorrection))throw new RangeError("Invalid hunt settings");
    return huntExperiment(seed,settings.huntMetrics,settings.huntTruth,settings.huntPolicy,settings.huntCorrection);
  }
  if(mission==="correlation"){
    if(!["all","centered","without"].includes(settings.correlationView)||!["confounding","outlier"].includes(settings.correlationScenario))throw new RangeError("Invalid correlation settings");
    const points=correlationDataset(seed,settings.correlationScenario);
    return {points,full:correlationSummary(points),without:correlationSummary(points.filter(p=>p.id!==23)),scenario:settings.correlationScenario};
  }
  if(mission==="interval"){
    if(![20,80,200].includes(settings.intervalSize)||!["random","biased"].includes(settings.intervalMode)||![.9,.95,.99].includes(settings.intervalConfidence))throw new RangeError("Invalid interval settings");
    return intervalExperiment(seed,settings.intervalSize,settings.intervalMode,settings.intervalConfidence);
  }
  throw new RangeError("Unknown investigation");
}

const decimal=n=>n.toFixed(3),pct=n=>(100*n).toFixed(1)+"%";
const rtext=n=>n===null?"미정의":decimal(n);
// Adds comparisons derived from the current observations, rather than a second verdict label.
export function interpretation(mission,seed,settings) {
  const result=investigationResult(mission,seed,settings);
  if(mission==="hunt"){
    const c=result.current;
    const fixed=result.alternatives.find(a=>a.policy==="fixed"&&a.correction===settings.huntCorrection);
    const adjusted=result.alternatives.find(a=>a.policy===settings.huntPolicy&&a.correction==="bonferroni");
    const outcome=a=>a.rejected?"기각":"기각 없음";
    const decisive=c.firstHit??c.best;
    return `현재 검사는 지표 ${decisive.metric+1}의 ${decisive.successes}/${decisive.n}에서 p=${decisive.p.toPrecision(4)}를 얻었습니다. 같은 80회 자료의 최종 검사: ${outcome(fixed)}. 현재 일정에 가족 보정 적용: ${outcome(adjusted)} (문턱 ${(0.05/c.tests).toPrecision(4)}). `+
      (settings.huntTruth==="null"?`160회 중 ${result.flagged}회의 기각은 생성 규칙상 거짓 양성입니다.`:
        settings.huntMetrics===1?`160회 중 ${result.flagged}회는 신호가 있는 지표 1의 기각 횟수입니다.`:`160회 중 ${result.flagged}회의 기각에는 지표 1 이외의 발견도 들어갈 수 있습니다.`)+
      (c.tests===1?" 단일 검정이라 가족 보정 문턱도 0.05입니다.":` 가족은 수행된 ${c.inspected.length}회가 아닌 계획된 ${c.tests}회입니다.`);
  }
  if(mission==="correlation"){
    const finite=result.full.leaveOneOut.filter(p=>p.r!==null);
    const most=finite.reduce((a,b)=>Math.abs(b.r-result.full.r)>Math.abs(a.r-result.full.r)?b:a);
    const changed=Math.sign(most.r)!==Math.sign(result.full.r);
    const groups=result.full.groups.map(g=>`${g.group}: ${g.n}점, r=${rtext(g.r)}`).join(" · ");
    const view={all:"전체 좌표",centered:"집단 평균을 뺀 좌표",without:"24번 제외"}[settings.correlationView];
    return `${groups}. 전체 r에서 가장 크게 달라지는 제외는 ${most.id+1}번: r=${rtext(most.r)} (${changed?"방향 반전":"방향 유지"}). 현재 보기는 ${view}입니다. `+
      (result.scenario==="confounding"?`집단 중심화 후 r=${rtext(result.full.withinR)}로, 집단 내 방향과 합산 방향을 구분할 수 있습니다.`:"단독 집단의 24번 점은 중심화하면 (0,0)이 됩니다. 제외와 중심화의 비슷한 결과가 인과 효과의 근거는 아닙니다.");
  }
  const c=result.current;
  const poolCovered=result.replications.filter(r=>r.low<=c.poolTarget&&c.poolTarget<=r.high).length;
  const distance=Math.abs(c.poolTarget-c.target);
  return `선택 풀 평균 ${decimal(c.poolTarget)}의 포함: ${poolCovered}/160, 전체 목표 ${decimal(c.target)}의 포함: ${result.covered}/160. 두 평균의 차이 ${decimal(distance)}, 절단 전 반폭 ${decimal(c.epsilon)}. `+
    (distance===0?`동일한 대상을 추정하며 ${pct(c.confidence)}는 반복 절차의 포함 확률 하한입니다.`:
      (distance>c.epsilon?"풀과 목표의 차이가 반폭보다 큽니다. 표본을 늘려도 추정 대상은 선택 풀입니다.":"현재 반폭이 풀과 목표의 차이를 덮을 수 있어도, 포함 보장의 대상은 선택 풀입니다."));
}

// A complete current synthetic run, not a visitor action history. Callers bound serialization.
export function investigationTrace(mission,seed,settings) {
  const result=investigationResult(mission,seed,settings);
  const keys={hunt:["huntMetrics","huntTruth","huntPolicy","huntCorrection"],correlation:["correlationScenario","correlationView"],interval:["intervalSize","intervalMode","intervalConfidence"]}[mission];
  const selected=Object.fromEntries(keys.map(k=>[k,settings[k]]));
  const trace={version:1,kind:"synthetic-investigation",mission,seed,settings:selected,result};
  if(mission==="hunt"){
    integer(result.replicates,160,160,"replicates");
    // Each call has a fixed bound of 161 trials, 12 streams, 80 binary observations.
    trace.replications=Array.from({length:160},(_,i)=>{
      const nextSeed=((seed+Math.imul(i+1,2246822519))>>>0)||1;
      // Generate only the single trial here, not another repeated experiment.
      const dataset=huntDataset(nextSeed,settings.huntMetrics,settings.huntTruth);
      return {seed:nextSeed,dataset,assessment:assessHunt(dataset,settings.huntPolicy,settings.huntCorrection)};
    });
  }
  return trace;
}
export function serializeTrace(mission,seed,settings) {
  const json=JSON.stringify(investigationTrace(mission,seed,settings));
  if(new TextEncoder().encode(json).byteLength>TRACE_MAX_BYTES)throw new RangeError("Trace too large");
  return json;
}
