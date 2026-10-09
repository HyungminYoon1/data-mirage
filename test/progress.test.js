import test from "node:test";
import assert from "node:assert/strict";
import {SUMMARY_KEY,OWN_KEY,REPO_IDS,readAchievements,saveAchievements,syncSummary,clearAchievements} from "../dist/src/progress.js";
import {exercise,submitExercise,awardAchievement} from "../dist/src/exercises.js";

function storage(entries=[]){const map=new Map(entries);return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),map};}
const now=new Date("2026-10-09T10:20:30.000Z");
const other={completed:2,total:8,updatedAt:"2026-10-08T12:00:00.000Z"};
const envelope=apps=>JSON.stringify({version:1,apps});
test("opening with no achievements never creates a completion summary",()=>{
  const s=storage();assert.deepEqual(readAchievements(s),{valid:true,completed:[]});
  assert.equal(syncSummary(s,now),true);assert.equal(s.map.size,0);
  assert.equal(REPO_IDS.length,15);assert.equal(new Set(REPO_IDS).size,15);
});
test("first independent correct answer stores only achievement IDs and minimum aggregate",()=>{
  const s=storage([[SUMMARY_KEY,envelope({"parcel-panic":other})],["unrelated","keep"]]);
  const c=exercise("axis",42),outcome=submitExercise(c,c.expected.toFixed(1)),completed=awardAchievement([],outcome);
  assert.deepEqual(saveAchievements(s,completed,now),{durable:true,summary:true});
  assert.deepEqual(JSON.parse(s.getItem(OWN_KEY)),{version:1,completed:["axis"]});
  assert.deepEqual(JSON.parse(s.getItem(SUMMARY_KEY)),{version:1,apps:{"parcel-panic":other,"data-mirage":{completed:1,total:6,updatedAt:now.toISOString()}}});
  assert.equal(s.getItem("unrelated"),"keep");
  assert.deepEqual(saveAchievements(s,completed,now),{durable:true,summary:true});
  assert.equal(JSON.parse(s.getItem(SUMMARY_KEY)).apps["data-mirage"].completed,1);
  assert.doesNotMatch(s.getItem(SUMMARY_KEY),/seed|action|file|name|answer|axis/);
});
test("own aggregate is recomputed from durable IDs; stale saves merge without inflating counts",()=>{
  const s=storage([[SUMMARY_KEY,envelope({"data-mirage":{completed:999,total:1000,updatedAt:now.toISOString()},"parcel-panic":other})]]);
  assert.equal(syncSummary(s,now),true);assert.equal(Object.hasOwn(JSON.parse(s.getItem(SUMMARY_KEY)).apps,"data-mirage"),false);
  saveAchievements(s,["axis","hunt"],now);saveAchievements(s,["interval"],now);
  assert.deepEqual(readAchievements(s).completed,["axis","hunt","interval"]);
  assert.equal(JSON.parse(s.getItem(SUMMARY_KEY)).apps["data-mirage"].completed,3);
  assert.deepEqual(JSON.parse(s.getItem(SUMMARY_KEY)).apps["parcel-panic"],other);
});
test("clear removes only own private record and own shared summary",()=>{
  const s=storage([[SUMMARY_KEY,envelope({"parcel-panic":other})],["other-app-history","keep"]]);
  saveAchievements(s,["axis","sample"],now);
  assert.deepEqual(clearAchievements(s),{durable:true,summary:true});
  assert.equal(s.getItem(OWN_KEY),null);assert.deepEqual(JSON.parse(s.getItem(SUMMARY_KEY)),{version:1,apps:{"parcel-panic":other}});assert.equal(s.getItem("other-app-history"),"keep");
  assert.deepEqual(clearAchievements(s),{durable:true,summary:true});
});
test("shared validation rejects unsafe envelopes without rewriting other apps",()=>{
  const invalid=["bad JSON","x".repeat(8193),JSON.stringify({version:2,apps:{}}),JSON.stringify({version:1,apps:[],extra:true}),envelope({unknown:other}),envelope({"parcel-panic":{...other,completed:-1}}),envelope({"parcel-panic":{...other,completed:9}}),envelope({"parcel-panic":{...other,total:1001}}),envelope({"parcel-panic":{...other,total:2.5}}),envelope({"parcel-panic":{...other,completed:"2"}}),envelope({"parcel-panic":{...other,updatedAt:"yesterday"}}),envelope({"parcel-panic":{...other,updatedAt:"2026-02-30T00:00:00.000Z"}}),envelope({"parcel-panic":{...other,seed:42}})];
  // JSON literal preserves a prototype-looking key that object-literal syntax treats specially.
  invalid.push('{"version":1,"apps":{"__proto__":{"completed":1,"total":1,"updatedAt":"2026-10-09T10:20:30.000Z"}}}');
  for(const raw of invalid){
    const s=storage([[SUMMARY_KEY,raw]]),saved=saveAchievements(s,["axis"],now);
    assert.equal(saved.durable,true);assert.equal(saved.summary,false);assert.equal(s.getItem(SUMMARY_KEY),raw);
    assert.equal(clearAchievements(s).summary,false);assert.equal(s.getItem(SUMMARY_KEY),raw);
  }
});
test("all 15 allowlisted records and integer boundary counts preserve exactly",()=>{
  const apps=Object.fromEntries(REPO_IDS.map((id,i)=>[id,{completed:i%2?1000:0,total:i%2?1000:0,updatedAt:now.toISOString()}]));
  const s=storage([[SUMMARY_KEY,envelope(apps)]]);saveAchievements(s,["axis"],now);
  const actual=JSON.parse(s.getItem(SUMMARY_KEY)).apps;
  assert.equal(Object.keys(actual).length,15);
  for(const id of REPO_IDS)if(id!=="data-mirage")assert.deepEqual(actual[id],apps[id]);
});
test("corrupt private state cannot award or fabricate a gallery count until explicit own clear",()=>{
  for(const raw of ["oops","x".repeat(513),JSON.stringify({version:1,completed:["unknown"]}),JSON.stringify({version:1,completed:["axis","axis"]}),JSON.stringify({version:2,completed:["axis"]}),JSON.stringify({version:1,completed:["axis"],seed:42})]){
    const s=storage([[OWN_KEY,raw],[SUMMARY_KEY,envelope({"parcel-panic":other})]]);
    assert.deepEqual(readAchievements(s),{valid:false,completed:[]});assert.equal(saveAchievements(s,["hunt"],now).durable,false);assert.equal(syncSummary(s,now),false);assert.equal(s.getItem(OWN_KEY),raw);
    assert.equal(clearAchievements(s).durable,true);assert.equal(saveAchievements(s,["hunt"],now).summary,true);
  }
});
test("blocked access, quota failures and invalid clock fail safely with precise partial results",()=>{
  const blocked={getItem(){throw Error("denied");},setItem(){throw Error("denied");},removeItem(){throw Error("denied");}};
  for(const s of [null,blocked]){assert.equal(readAchievements(s).valid,false);assert.equal(saveAchievements(s,["axis"],now).durable,false);assert.equal(clearAchievements(s).durable,false);assert.equal(syncSummary(s,now),false);}
  const quota=storage();quota.setItem=()=>{throw Error("quota");};assert.equal(saveAchievements(quota,["axis"],now).durable,false);
  const partial=storage(),write=partial.setItem;partial.setItem=(k,v)=>{if(k===SUMMARY_KEY)throw Error("quota");write(k,v);};
  assert.deepEqual(saveAchievements(partial,["axis"],now),{durable:true,summary:false});assert.equal(readAchievements(partial).completed.length,1);
  const clock=storage();assert.deepEqual(saveAchievements(clock,["axis"],new Date("bad")),{durable:true,summary:false});assert.equal(clock.getItem(SUMMARY_KEY),null);
  assert.equal(saveAchievements(storage(),["unknown"],now).durable,false);
});
