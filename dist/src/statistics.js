import {rng,integer,seedNumber} from "./math.js";

export const LOOKS=Object.freeze([20,40,60,80]);
export const REPLICATES=160;
const choose=(value,allowed,label)=>{if(!allowed.includes(value))throw new RangeError("Invalid "+label);return value;};

// Exact symmetric binomial tail for H0: p=1/2. No normal approximation.
export function fairCoinP(successes,n) {
  integer(n,1,80,"n");integer(successes,0,n,"successes");
  const k=Math.min(successes,n-successes);
  let mass=2**(-n),tail=mass;
  for(let i=1;i<=k;i++){mass*= (n-i+1)/i;tail+=mass;}
  return Math.min(1,2*tail);
}
const nullTails=new Map(LOOKS.map(n=>[n,Array.from({length:n+1},(_,k)=>fairCoinP(k,n))]));

export function huntDataset(seed,metrics=6,truth="null") {
  seedNumber(seed);integer(metrics,1,12,"metrics");choose(truth,["null","signal"],"truth");
  // Each stream has its own seed: adding metrics preserves existing streams.
  const streams=Array.from({length:metrics},(_,id)=>{
    const random=rng((seed+Math.imul(id+1,2654435761))>>>0);
    const probability=truth==="signal"&&id===0 ? .65 : .5;
    const flips=Array.from({length:80},()=>Number(random()<probability));
    let successes=0;
    const checkpoints=[];
    flips.forEach((v,i)=>{successes+=v;if(LOOKS.includes(i+1))checkpoints.push({n:i+1,successes,p:nullTails.get(i+1)[successes]});});
    return {id,probability,flips,checkpoints};
  });
  return {seed,metrics,truth,streams};
}

export function assessHunt(dataset,policy="peek",correction="raw") {
  choose(policy,["fixed","peek"],"policy");choose(correction,["raw","bonferroni"],"correction");
  if(!dataset?.streams?.length||dataset.streams.length>12)throw new TypeError("Invalid hunt data");
  const tests=dataset.streams.length*(policy==="peek"?4:1);
  const threshold=.05/(correction==="bonferroni"?tests:1);
  const schedule=policy==="peek"?LOOKS:[80];
  const inspected=[];
  let firstHit=null;
  for(const n of schedule){
    for(const stream of dataset.streams){
      const row=stream.checkpoints.find(p=>p.n===n);
      const observed={metric:stream.id,...row};inspected.push(observed);
      if(!firstHit&&row.p<=threshold)firstHit=observed;
    }
    if(firstHit)break; // all metrics at this look are observed, then stop
  }
  const best=inspected.reduce((a,b)=>a.p<=b.p?a:b);
  return {tests,threshold,firstHit,best,rejected:!!firstHit,stopN:firstHit?.n??80,inspected,
    trialsObserved:dataset.streams.length*(firstHit?.n??80)};
}

export function huntExperiment(seed,metrics=6,truth="null",policy="peek",correction="raw") {
  const dataset=huntDataset(seed,metrics,truth),current=assessHunt(dataset,policy,correction);
  let flagged=0;
  for(let i=1;i<=REPLICATES;i++){
    const nextSeed=((seed+Math.imul(i,2246822519))>>>0)||1;
    if(assessHunt(huntDataset(nextSeed,metrics,truth),policy,correction).rejected)flagged++;
  }
  const alternatives=[];
  for(const rule of ["fixed","peek"])for(const adjustment of ["raw","bonferroni"]){
    alternatives.push({policy:rule,correction:adjustment,...assessHunt(dataset,rule,adjustment)});
  }
  return {dataset,current,alternatives,flagged,replicates:REPLICATES,rate:flagged/REPLICATES};
}

export function pearson(points) {
  if(!Array.isArray(points)||points.length<2||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw new TypeError("Finite points required");
  const mx=points.reduce((s,p)=>s+p.x,0)/points.length,my=points.reduce((s,p)=>s+p.y,0)/points.length;
  let xy=0,xx=0,yy=0;
  for(const p of points){const x=p.x-mx,y=p.y-my;xy+=x*y;xx+=x*x;yy+=y*y;}
  return xx===0||yy===0?null:Math.max(-1,Math.min(1,xy/Math.sqrt(xx*yy)));
}
export function correlationDataset(seed,scenario="confounding") {
  seedNumber(seed);choose(scenario,["confounding","outlier"],"scenario");const random=rng(seed);
  if(scenario==="outlier")return Array.from({length:24},(_,id)=>id===23?
    {id,x:100,y:100,group:"influential"}:{id,x:id+1,y:30-(id+1)+Math.floor(random()*5)-2,group:"regular"});
  return Array.from({length:24},(_,id)=>{
    const group=id<12?"I":"II",offset=id<12?0:24,x=id%12+1;
    return {id,x:x+offset,y:20-x+offset+Math.floor(random()*5)-2,group};
  });
}
export function correlationSummary(points) {
  const groups=[...new Set(points.map(p=>p.group))].map(group=>{
    const members=points.filter(p=>p.group===group);
    return {group,n:members.length,r:members.length<2?null:pearson(members),
      mx:members.reduce((s,p)=>s+p.x,0)/members.length,my:members.reduce((s,p)=>s+p.y,0)/members.length};
  });
  const centered=points.map(p=>{const g=groups.find(g=>g.group===p.group);return {x:p.x-g.mx,y:p.y-g.my};});
  const leaveOneOut=points.map(p=>({id:p.id,r:pearson(points.filter(q=>q.id!==p.id))}));
  return {n:points.length,r:pearson(points),withinR:pearson(centered),groups,leaveOneOut};
}

export const BINARY_POPULATION=Object.freeze(Array.from({length:200},(_,id)=>Object.freeze({id,value:Number(id<120)})));
// Hoeffding: for iid X in [0,1], P(|mean-E[X]|>epsilon)<=2 exp(-2n epsilon^2).
export function boundedInterval(successes,n,confidence=.95) {
  integer(n,1,200,"n");integer(successes,0,n,"successes");choose(confidence,[.9,.95,.99],"confidence");
  const estimate=successes/n,epsilon=Math.sqrt(Math.log(2/(1-confidence))/(2*n));
  return {successes,n,confidence,estimate,epsilon,low:Math.max(0,estimate-epsilon),high:Math.min(1,estimate+epsilon)};
}
export function intervalSample(seed,n=80,mode="random",confidence=.95) {
  seedNumber(seed);choose(n,[20,80,200],"sample size");choose(mode,["random","biased"],"sampling mode");
  const pool=mode==="random"?BINARY_POPULATION:BINARY_POPULATION.slice(0,140),random=rng(seed);
  const draws=Array.from({length:n},()=>pool[Math.floor(random()*pool.length)]);
  const successes=draws.reduce((s,p)=>s+p.value,0),interval=boundedInterval(successes,n,confidence);
  const target=120/200,poolTarget=pool.reduce((s,p)=>s+p.value,0)/pool.length;
  return {...interval,seed,mode,draws,poolSize:pool.length,target,poolTarget,covers:interval.low<=target&&target<=interval.high};
}
export function intervalExperiment(seed,n=80,mode="random",confidence=.95) {
  const current=intervalSample(seed,n,mode,confidence),replications=[];
  for(let i=1;i<=REPLICATES;i++)replications.push(intervalSample(((seed+Math.imul(i,3266489917))>>>0)||1,n,mode,confidence));
  const covered=replications.filter(r=>r.covers).length;
  return {current,replications,covered,replicates:REPLICATES,coverage:covered/REPLICATES,
    meanEstimate:replications.reduce((s,r)=>s+r.estimate,0)/REPLICATES};
}

// Feedback is conditional on the actual experimental design and computed data.
export function missionFeedback(mission,answer,result) {
  if(mission==="hunt"){
    const r=result.current,correct=r.tests===1?"single":"family";
    const messages={posterior:"p값은 H0가 참일 확률이 아닙니다. H0 아래 현재만큼 극단적인 결과의 꼬리 확률입니다.",
      single:r.tests===1?"80회까지 미리 정한 단일 검정입니다. H0 아래 거짓 양성 확률은 최대 5%이며 정확 이항 검정의 이산성 때문에 더 작을 수 있습니다.":"5%는 한 번의 검정 기준입니다. 현재 "+r.tests+"개의 지표×시점을 탐색하므로 전체 거짓 양성 확률에 그대로 적용할 수 없습니다.",
      family:r.tests===1?"현재는 1지표·최종 시점만 검사합니다. 여러 탐색을 했다는 전제가 맞지 않습니다.":"탐색 가족은 "+r.tests+"검정입니다. Bonferroni 문턱 "+(.05/r.tests).toPrecision(3)+"은 미리 정한 전체 검정에 대한 합집합 상계로 거짓 양성 확률을 최대 5%로 제한합니다. 유의해도 인과·진실을 증명하지는 않습니다."};
    choose(answer,Object.keys(messages),"answer");return {correct:answer===correct,text:messages[answer]};
  }
  if(mission==="correlation"){
    const correct=result.scenario==="confounding"?"groups":"sensitivity";
    const messages={causal:"양의 r만으로 X가 Y를 증가시킨다고 결론낼 수 없습니다. 이 자료는 무작위 개입 실험이 아니며 생성 규칙에는 X의 양의 인과 효과가 없습니다.",
      groups:result.scenario==="confounding"?"전체 r="+result.full.r.toFixed(3)+", 집단 평균을 제거한 r="+result.full.withinR.toFixed(3)+"입니다. 두 집단의 위치 차이가 합산 방향을 뒤집습니다. 중심화 역시 인과 효과 추정은 아닙니다.":"현재 자료는 두 모집집단의 혼입 실험이 아닙니다. 특별한 한 점과 나머지 23점의 민감도를 먼저 확인하세요.",
      sensitivity:result.scenario==="outlier"?"전체 r="+result.full.r.toFixed(3)+", 지정된 24번 점을 제외한 r="+result.without.r.toFixed(3)+"입니다. 결론이 한 관측값에 민감합니다. 오류라는 증거 없이 그 점을 삭제하는 것은 정당화되지 않습니다.":"한 점만 지우는 것으로 두 집단의 위치 차이를 설명할 수 없습니다. 집단별 분모와 중심화한 상관을 비교하세요."};
    choose(answer,Object.keys(messages),"answer");return {correct:answer===correct,text:messages[answer]};
  }
  if(mission==="interval"){
    const c=result.current,correct=c.mode==="random"?"repeat":"bias";
    const messages={probability:"이번에 계산된 구간과 고정된 모집단 평균 0.6은 이미 정해져 있습니다. 95% 같은 수치는 이 한 구간 안에 참값이 있을 사후확률이 아닙니다.",
      repeat:c.mode==="random"?"같은 독립·복원 표집을 반복할 때 이 Hoeffding 절차는 적어도 "+Math.round(c.confidence*100)+"%의 포함 확률을 보장합니다. 보수적 상계이며 이번 160회 포함률이 정확히 그 값일 필요는 없습니다.":"독립 복원 표집이어도 지금은 140개 선택 풀의 평균을 추정합니다. 전체 200개 평균에 대한 포함 보장은 적용되지 않습니다.",
      bias:c.mode==="biased"?"현재 선택 풀은 120/140, 목표 모집단은 120/200입니다. n을 늘리면 잘못된 목표 주변에서 구간이 좁아집니다. 표본 수만으로 선택 편향을 없앨 수 없습니다.":"현재는 전체 200개에서 균등 복원 추출하므로 이 선택 편향 진단은 맞지 않습니다. 반복 포함 확률과 단일 구간의 해석을 구분하세요."};
    choose(answer,Object.keys(messages),"answer");return {correct:answer===correct,text:messages[answer]};
  }
  throw new RangeError("Unknown mission");
}
