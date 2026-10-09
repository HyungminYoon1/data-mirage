import test from "node:test";
import assert from "node:assert/strict";
import {fairCoinP,huntDataset,assessHunt,huntExperiment,pearson,correlationDataset,correlationSummary,BINARY_POPULATION,boundedInterval,intervalSample,intervalExperiment,missionFeedback,LOOKS} from "../dist/src/statistics.js";
import {seedNumber} from "../dist/src/math.js";

const close=(a,b,tolerance=1e-12)=>assert.ok(Math.abs(a-b)<tolerance,a+" vs "+b);
// Independent oracle: convolve a two-outcome distribution, then sum outcomes
// at least as far from n/2. Does not use the implementation's coefficient recurrence.
function fairMasses(n){let mass=[1];for(let i=0;i<n;i++){const next=Array(i+2).fill(0);mass.forEach((p,k)=>{next[k]+=p/2;next[k+1]+=p/2;});mass=next;}return mass;}
function oracleP(k,n){return fairMasses(n).reduce((sum,p,j)=>sum+(Math.abs(2*j-n)>=Math.abs(2*k-n)?p:0),0);}
// Exact path probability under independent fair flips: absorb paths when a
// planned look rejects. This explicitly accounts for dependence between looks.
function exactStoppingRisk(threshold,looks){
  let alive=[1],risk=0;
  for(let n=1;n<=80;n++){
    const next=Array(n+1).fill(0);alive.forEach((p,k)=>{next[k]+=p/2;next[k+1]+=p/2;});
    if(looks.includes(n))for(let k=0;k<=n;k++)if(oracleP(k,n)<=threshold){risk+=next[k];next[k]=0;}
    alive=next;
  }
  close(risk+alive.reduce((a,b)=>a+b,0),1);return risk;
}
function algebraicR(points){const n=points.length,sx=points.reduce((s,p)=>s+p.x,0),sy=points.reduce((s,p)=>s+p.y,0),sxx=points.reduce((s,p)=>s+p.x*p.x,0),syy=points.reduce((s,p)=>s+p.y*p.y,0),sxy=points.reduce((s,p)=>s+p.x*p.y,0);return (n*sxy-sx*sy)/Math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy));}

test("exact two-sided p agrees with independent probability convolution at all planned looks",()=>{
  for(const n of [1,7,...LOOKS])for(let k=0;k<=n;k++){close(fairCoinP(k,n),oracleP(k,n));close(fairCoinP(k,n),fairCoinP(n-k,n));}
  assert.equal(fairCoinP(10,20),1);assert.equal(fairCoinP(15,20),.04138946533203125);assert.equal(fairCoinP(14,20),.11531829833984375);assert.equal(fairCoinP(0,80),2**(-79));
});

test("exact path oracle establishes optional-stopping inflation and family correction bound",()=>{
  const fixed=exactStoppingRisk(.05,[80]),peek=exactStoppingRisk(.05,LOOKS),adjusted=exactStoppingRisk(.05/24,LOOKS);
  assert.ok(fixed<=.05);assert.ok(peek>fixed+.03);assert.ok(1-(1-peek)**6>.35);assert.ok(6*adjusted<=.05);
  const h=huntExperiment(42,6,"null","peek","raw"),b=huntExperiment(42,6,"null","peek","bonferroni");
  assert.ok(Math.abs(h.rate-(1-(1-peek)**6))<.15);assert.ok(b.rate<.1);assert.ok(b.flagged<h.flagged);
});

test("an early false discovery vanishes at fixed endpoint on the identical observations",()=>{
  const counts=[15,20,30,40],dataset={streams:[{id:0,checkpoints:LOOKS.map((n,i)=>({n,successes:counts[i],p:oracleP(counts[i],n)}))}]},copy=structuredClone(dataset);
  const early=assessHunt(dataset,"peek","raw"),fixed=assessHunt(dataset,"fixed","raw"),corrected=assessHunt(dataset,"peek","bonferroni");
  assert.equal(early.firstHit.n,20);assert.equal(early.trialsObserved,20);assert.equal(early.tests,4);assert.equal(fixed.rejected,false);assert.equal(corrected.rejected,false);assert.equal(fixed.tests,1);close(corrected.threshold,.0125);assert.deepEqual(dataset,copy);
});

test("seeded streams keep finite binary observations, stable prefixes and independently audited counts",()=>{
  const d=huntDataset(20261009,12),again=huntDataset(20261009,12),short=huntDataset(20261009,3),signal=huntDataset(20261009,12,"signal");
  assert.deepEqual(d,again);assert.deepEqual(d.streams.slice(0,3),short.streams);assert.notDeepEqual(d,huntDataset(20261010,12));
  for(const s of d.streams){assert.equal(s.flips.length,80);assert.ok(s.flips.every(v=>v===0||v===1));for(const c of s.checkpoints){assert.equal(c.successes,s.flips.slice(0,c.n).filter(Boolean).length);close(c.p,oracleP(c.successes,c.n));}}
  assert.equal(signal.streams[0].probability,.65);assert.deepEqual(signal.streams.slice(1),d.streams.slice(1));
  const h=huntExperiment(7,3,"null","fixed","bonferroni");assert.equal(h.replicates,160);assert.equal(h.rate,h.flagged/160);assert.equal(h.current.tests,3);assert.equal(h.current.trialsObserved,240);
});

test("Pearson handles analytic correlations, translation/scaling invariance and undefined coordinates",()=>{
  const p=[{x:1,y:4},{x:2,y:1},{x:3,y:3},{x:4,y:2}];close(pearson(p),-.4);close(pearson(p),algebraicR(p));
  close(pearson(p.map(q=>({x:q.x*3+100,y:q.y*2-200}))),-.4);
  assert.equal(pearson([{x:0,y:0},{x:1,y:1}]),1);assert.equal(pearson([{x:0,y:1},{x:1,y:0}]),-1);assert.equal(pearson([{x:1,y:0},{x:1,y:4}]),null);
});

test("confounding reverses within-group direction; influential point reverses remaining direction",()=>{
  for(const seed of [1,7,42,20261009,4294967295]){
    const points=correlationDataset(seed),copy=structuredClone(points),c=correlationSummary(points);
    assert.equal(points.length,24);assert.deepEqual(points,correlationDataset(seed));assert.deepEqual(c.groups.map(g=>g.n),[12,12]);assert.ok(c.r>.7&&c.withinR<-.8);assert.ok(c.groups.every(g=>g.r<-.8));close(c.r,algebraicR(points));
    for(const row of c.leaveOneOut)close(row.r,algebraicR(points.filter(p=>p.id!==row.id)));
    const centered=points.map(p=>{const members=points.filter(q=>q.group===p.group);return {x:p.x-members.reduce((s,q)=>s+q.x,0)/12,y:p.y-members.reduce((s,q)=>s+q.y,0)/12};});close(c.withinR,algebraicR(centered));assert.deepEqual(points,copy);
    const outlier=correlationDataset(seed,"outlier"),all=correlationSummary(outlier);assert.ok(all.r>.6);assert.ok(pearson(outlier.slice(0,23))<-.9);assert.equal(all.groups[1].r,null);assert.deepEqual(outlier[23],{id:23,x:100,y:100,group:"influential"});
  }
});

test("bounded intervals match independently solved Hoeffding bound and preserve clipping/width rules",()=>{
  const c=boundedInterval(40,80,.95);close(c.estimate,.5);
  // Solve exp(-2 n epsilon^2) = alpha/2 by bisection, independently of sqrt(log()).
  let lo=0,hi=1;for(let i=0;i<60;i++){const middle=(lo+hi)/2;if(2*Math.exp(-160*middle*middle)>.05)lo=middle;else hi=middle;}
  close(c.epsilon,(lo+hi)/2);close(c.low,.5-c.epsilon);close(c.high,.5+c.epsilon);
  assert.equal(boundedInterval(0,20).low,0);assert.equal(boundedInterval(20,20).high,1);
  close(boundedInterval(10,20).epsilon/boundedInterval(40,80).epsilon,2);
  assert.ok(boundedInterval(40,80,.99).epsilon>boundedInterval(40,80,.95).epsilon);
  for(const n of [20,80,200])for(const confidence of [.9,.95,.99])for(let successes=0;successes<=n;successes++){const r=boundedInterval(successes,n,confidence);assert.ok(r.low>=0&&r.low<=r.estimate&&r.high>=r.estimate&&r.high<=1);}
});

test("finite population and replacement draws independently recover numerators and biased target",()=>{
  assert.equal(BINARY_POPULATION.length,200);assert.equal(BINARY_POPULATION.filter(p=>p.value===1).length,120);
  for(const mode of ["random","biased"]){const c=intervalSample(42,200,mode),prefix=intervalSample(42,20,mode);assert.deepEqual(c.draws.slice(0,20),prefix.draws);assert.deepEqual(c,intervalSample(42,200,mode));assert.equal(c.successes,c.draws.filter(p=>p.id<120).length);assert.ok(new Set(c.draws.map(p=>p.id)).size<200);assert.ok(c.draws.every(p=>p.id<(mode==="biased"?140:200)));close(c.poolTarget,mode==="biased"?6/7:.6);close(c.target,.6);assert.equal(c.covers,c.low<=.6&&c.high>=.6);}
  const unbiased=intervalExperiment(42,200),biased=intervalExperiment(42,200,"biased");
  assert.equal(unbiased.replications.length,160);assert.equal(unbiased.covered,unbiased.replications.filter(p=>p.low<=.6&&p.high>=.6).length);
  assert.ok(Math.abs(unbiased.meanEstimate-.6)<.03);assert.ok(Math.abs(biased.meanEstimate-6/7)<.03);assert.ok(unbiased.coverage>.9);assert.ok(biased.coverage<.1);
  assert.equal(new Set(unbiased.replications.map(p=>p.seed)).size,160);
});

test("exact Bernoulli coverage satisfies the advertised bound at every exposed size and confidence",()=>{
  for(const n of [20,80,200])for(const confidence of [.9,.95,.99]){
    let mass=[1];for(let i=0;i<n;i++){const next=Array(i+2).fill(0);mass.forEach((p,k)=>{next[k]+=.4*p;next[k+1]+=.6*p;});mass=next;}
    let coverage=0,oracleCoverage=0;
    mass.forEach((probability,k)=>{
      const c=boundedInterval(k,n,confidence);
      if(c.low<=.6&&c.high>=.6)coverage+=probability;
      // Independent acceptance region from the exponential tail inequality.
      if(2*Math.exp(-2*n*(k/n-.6)**2)>=1-confidence)oracleCoverage+=probability;
    });
    close(coverage,oracleCoverage);assert.ok(coverage>=confidence);assert.ok(coverage<=1+1e-12);
  }
});

test("mission answer validity changes with actual rules and preserves wrong-answer explanations",()=>{
  const fixed=huntExperiment(42,1,"null","fixed"),peek=huntExperiment(42,1,"null","peek");
  assert.equal(missionFeedback("hunt","single",fixed).correct,true);assert.equal(missionFeedback("hunt","single",peek).correct,false);assert.equal(missionFeedback("hunt","family",peek).correct,true);assert.equal(missionFeedback("hunt","posterior",peek).correct,false);
  for(const scenario of ["confounding","outlier"]){const points=correlationDataset(42,scenario),r={scenario,full:correlationSummary(points),without:correlationSummary(points.slice(0,23))};assert.equal(missionFeedback("correlation","groups",r).correct,scenario==="confounding");assert.equal(missionFeedback("correlation","sensitivity",r).correct,scenario==="outlier");assert.equal(missionFeedback("correlation","causal",r).correct,false);}
  for(const mode of ["random","biased"]){const r=intervalExperiment(42,80,mode);assert.equal(missionFeedback("interval","repeat",r).correct,mode==="random");assert.equal(missionFeedback("interval","bias",r).correct,mode==="biased");assert.equal(missionFeedback("interval","probability",r).correct,false);}
  assert.match(missionFeedback("interval","repeat",intervalExperiment(42,80,"random",.99)).text,/99%/);
});

test("invalid seeds, sizes, worlds, counts and mission answers reject without coercion",()=>{
  for(const seed of [0,-1,1.5,NaN,Infinity,4294967296,"42",null])assert.throws(()=>seedNumber(seed));
  for(const seed of [1,4294967295])assert.equal(seedNumber(seed),seed);
  for(const fn of [()=>fairCoinP(21,20),()=>fairCoinP(1,81),()=>huntDataset(1,13),()=>huntDataset(1,2,"real"),()=>assessHunt(huntDataset(1),"whatever"),()=>correlationDataset(1,"other"),()=>pearson([{x:1,y:NaN},{x:2,y:2}]),()=>boundedInterval(1,0),()=>boundedInterval(1,10,.5),()=>intervalSample(1,21),()=>intervalSample(1,80,"unknown"),()=>missionFeedback("unknown","x",{}),()=>missionFeedback("hunt","x",huntExperiment(1))])assert.throws(fn);
});
