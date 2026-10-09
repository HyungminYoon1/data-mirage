import {rng,seedNumber} from "./math.js";
import {population,samplePopulation,simpson} from "./model.js";
import {assessHunt,huntDataset,correlationDataset,correlationSummary,intervalSample} from "./statistics.js";

export const ACHIEVEMENTS=Object.freeze(["axis","sample","simpson","hunt","correlation","interval"]);
const labels={axis:"축",sample:"표본",simpson:"합산",hunt:"검정 가족",correlation:"상관",interval:"구간"};
export function exercise(mission,seed) {
  if(!ACHIEVEMENTS.includes(mission))throw new RangeError("Unknown exercise");
  seedNumber(seed);
  const random=rng(seed),pick=values=>values[Math.floor(random()*values.length)];
  let prompt,expected,unit,explanation,evidence;
  if(mission==="axis"){
    const first=20+Math.floor(random()*81),last=first+1+Math.floor(random()*20),baseline=first-1;
    evidence={first,last,baseline};expected=(last-first)/first*100;unit="%";
    prompt=`새 자료: ${first} → ${last} (세로축 시작 ${baseline}). 원래 값의 증가율은? 소수 첫째 자리까지 입력하세요.`;
    explanation=`(${last}−${first})÷${first}×100 = ${expected.toFixed(1)}%.`;
  }
  if(mission==="sample"){
    const mode=pick(["random","high","low"]),n=pick([20,80]),s=samplePopulation(population(),n,mode,seed);
    // The question uses the displayed rounded means, so its answer is unambiguous.
    const populationMean=Number(s.populationMean.toFixed(1)),sampleMean=Number(s.sampleMean.toFixed(1));
    evidence={mode,n,populationMean,sampleMean};expected=Number((sampleMean-populationMean).toFixed(1));unit="점";
    prompt=`새 ${n}명 표본: 모집단 평균 ${populationMean.toFixed(1)}, 표본 평균 ${sampleMean.toFixed(1)}. 표본−모집단 차이는? 음수는 − 부호를 붙이세요.`;
    explanation=`${sampleMean.toFixed(1)}−${populationMean.toFixed(1)} = ${expected.toFixed(1)}점. 차이의 크기만으로 추출 편향을 판정할 수는 없습니다.`;
  }
  if(mission==="simpson"){
    const aEasy=pick([10,20,30,40,50,60,70,80]),bEasy=pick([10,20,30,40,50,60,70,80]),s=simpson(aEasy,bEasy);
    evidence={aEasy,bEasy,A:s.A,B:s.B};expected=(s.A.total.rate-s.B.total.rate)*100;unit="%p";
    prompt=`새 구성: A 쉬움 ${s.A.easy.success}/${s.A.easy.n}, 어려움 ${s.A.hard.success}/${s.A.hard.n}; B 쉬움 ${s.B.easy.success}/${s.B.easy.n}, 어려움 ${s.B.hard.success}/${s.B.hard.n}. 합산 성공률 A−B는 몇 %p인가요? 소수 첫째 자리까지 입력하세요.`;
    explanation=`${s.A.total.success}/90−${s.B.total.success}/90 = ${expected.toFixed(1)}%p. 조건별 비율의 단순 평균과 다릅니다.`;
  }
  if(mission==="hunt"){
    const metrics=pick([1,3,6,12]),policy=pick(["fixed","peek"]),d=huntDataset(seed,metrics),c=assessHunt(d,policy,"bonferroni");
    evidence={metrics,policy,tests:c.tests,inspected:c.inspected.length};expected=c.threshold;unit="p 문턱";
    prompt=`새 계획: ${metrics}지표 × ${policy==="peek"?"4시점 (20·40·60·80회)":"최종 1시점"}. 전체 거짓 양성 상한 5%를 위한 Bonferroni 문턱은? 소수 넷째 자리까지 입력하세요.`;
    explanation=`0.05÷${c.tests} = ${expected.toFixed(4)}. 중간에 멈춰도 사전에 정한 가족 수를 사용합니다.`;
  }
  if(mission==="correlation"){
    const scenario=pick(["confounding","outlier"]),points=correlationDataset(seed,scenario),full=correlationSummary(points),without=correlationSummary(points.slice(0,23));
    const compared=scenario==="confounding"?full.withinR:without.r;
    evidence={scenario,all:full.r,compared};expected=compared<0?-1:compared>0?1:0;unit="−1 / 0 / 1";
    prompt=`새 자료: 전체 r=${full.r.toFixed(3)}, ${scenario==="confounding"?"집단 중심화 후":"24번 제외 후"} r=${compared.toFixed(3)}. 비교 후 관계의 방향은? 음수 −1, 0이면 0, 양수 1을 입력하세요.`;
    explanation=`비교 후 r=${compared.toFixed(3)}이므로 ${expected}. 좌표의 관계를 비교한 결과이며 인과 효과를 뜻하지 않습니다.`;
  }
  if(mission==="interval"){
    const mode=pick(["random","biased"]),n=pick([20,80,200]),confidence=pick([.9,.95,.99]),c=intervalSample(seed,n,mode,confidence);
    evidence={mode,n,confidence,poolSize:c.poolSize};expected=c.poolTarget*100;unit="%";
    prompt=`새 표집: ${c.poolSize}개 중 120개가 1인 풀에서 독립 복원 추출 ${n}회. Hoeffding 포함 확률 하한 ${confidence*100}%. 보장의 대상인 풀 평균은 몇 %인가요? 소수 첫째 자리까지 입력하세요.`;
    explanation=`120÷${c.poolSize}×100 = ${expected.toFixed(1)}%. 포함 확률 하한과 추정 대상의 평균은 다른 수치입니다.`;
  }
  return {mission,seed,label:labels[mission],prompt,expected,unit,explanation,evidence};
}

// Invalid input leaves an attempt open; a valid submitted answer closes it once.
export function submitExercise(challenge,input,previous=null) {
  if(!challenge||!ACHIEVEMENTS.includes(challenge.mission))throw new TypeError("Exercise required");
  const actual=exercise(challenge.mission,challenge.seed);
  if(previous!==null)throw new RangeError("Attempt already submitted");
  if(typeof input!=="string"||input.length>32)throw new RangeError("Numeric answer required");
  const normalized=input.trim().replace(/^−/,"-");
  if(!/^[-+]?\d+(?:\.\d+)?$/.test(normalized))throw new RangeError("Numeric answer required");
  const answer=Number(normalized),digits=actual.mission==="hunt"?4:1;
  if(!Number.isFinite(answer)||Math.abs(answer)>1000)throw new RangeError("Answer out of bounds");
  const rounded=Number(actual.expected.toFixed(digits));
  const correct=Math.abs(answer-rounded)<(actual.mission==="hunt"?0.000051:0.051);
  return {mission:actual.mission,correct,explanation:actual.explanation};
}

export function completedAchievements(value) {
  if(!Array.isArray(value)||value.length>ACHIEVEMENTS.length||new Set(value).size!==value.length||value.some(id=>!ACHIEVEMENTS.includes(id)))throw new RangeError("Invalid achievements");
  return ACHIEVEMENTS.filter(id=>value.includes(id));
}
export function awardAchievement(current,outcome) {
  const completed=completedAchievements(current);
  if(!outcome||!ACHIEVEMENTS.includes(outcome.mission)||typeof outcome.correct!=="boolean")throw new TypeError("Outcome required");
  return outcome.correct?completedAchievements([...new Set([...completed,outcome.mission])]):completed;
}
