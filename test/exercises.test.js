import test from "node:test";
import assert from "node:assert/strict";
import {exercise,submitExercise,awardAchievement,completedAchievements,ACHIEVEMENTS} from "../dist/src/exercises.js";

test("independent exercises have executable solutions calculated from their displayed evidence",()=>{
  let completed=[];
  for(const seed of [1,42,20261009,4294967295])for(const mission of ACHIEVEMENTS){
    const c=exercise(mission,seed),e=c.evidence;
    let expected;
    if(mission==="axis")expected=(e.last-e.first)/e.first*100;
    if(mission==="sample")expected=e.sampleMean-e.populationMean;
    if(mission==="simpson")expected=((e.A.easy.success+e.A.hard.success)/(e.A.easy.n+e.A.hard.n)-(e.B.easy.success+e.B.hard.success)/(e.B.easy.n+e.B.hard.n))*100;
    if(mission==="hunt")expected=.05/(e.metrics*(e.policy==="peek"?4:1));
    if(mission==="correlation")expected=Math.sign(e.compared);
    if(mission==="interval")expected=120/e.poolSize*100;
    assert.ok(Math.abs(c.expected-expected)<1e-12);
    const answer=expected.toFixed(mission==="hunt"?4:1),outcome=submitExercise(c,answer);
    assert.equal(outcome.correct,true);completed=awardAchievement(completed,outcome);
    assert.deepEqual(c,exercise(mission,seed));
    assert.equal(submitExercise(c,String(Number(answer)+1)).correct,false);
  }
  assert.deepEqual(completed,ACHIEVEMENTS); // Repeat correct answers never inflate the count.
});
test("wrong first answers close the attempt; viewed data and examples do not create achievements",()=>{
  for(const mission of ACHIEVEMENTS){
    const challenge=exercise(mission,42),wrong=submitExercise(challenge,"999");
    assert.equal(wrong.correct,false);assert.deepEqual(awardAchievement([],wrong),[]);
    assert.throws(()=>submitExercise(challenge,String(challenge.expected),wrong),/already submitted/);
    const next=exercise(mission,43);assert.equal(submitExercise(next,next.expected.toFixed(mission==="hunt"?4:1)).correct,true);
  }
  assert.deepEqual(completedAchievements([]),[]);
});
test("answer validation rejects malformed, oversized, coerced and injected expected values",()=>{
  const challenge=exercise("axis",42),copy=structuredClone(challenge);
  for(const input of [""," ","NaN","Infinity","0x10","1e1","7,7","<script>","1".repeat(33),"1001","-1001",null,7])assert.throws(()=>submitExercise(challenge,input));
  assert.deepEqual(challenge,copy);
  assert.equal(submitExercise({...challenge,expected:999},"999").correct,false);
  assert.equal(submitExercise(exercise("correlation",42),"−1").correct,true);
  for(const seed of [0,-1,1.1,"42",4294967296])assert.throws(()=>exercise("axis",seed));
  assert.throws(()=>exercise("unknown",42));
  for(const value of [["axis","axis"],["unknown"],Array(7).fill("axis"),{completed:1},null])assert.throws(()=>completedAchievements(value));
  assert.throws(()=>awardAchievement([],{mission:"unknown",correct:true}));
  assert.throws(()=>awardAchievement([],{mission:"axis",correct:"true"}));
});
test("rounding tolerances accept declared precision and reject materially different values",()=>{
  const c=exercise("hunt",42),expected=Number(c.expected.toFixed(4));
  assert.equal(submitExercise(c,String(expected)).correct,true);
  assert.equal(submitExercise(c,String(expected+.0002)).correct,false);
  const interval=exercise("interval",42),mean=Number(interval.expected.toFixed(1));
  assert.equal(submitExercise(interval,String(mean)).correct,true);
  assert.equal(submitExercise(interval,String(mean+.2)).correct,false);
});
