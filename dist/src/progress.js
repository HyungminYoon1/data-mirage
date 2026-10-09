import {ACHIEVEMENTS,completedAchievements} from "./exercises.js";

export const SUMMARY_KEY="web-lab-progress-v1";
export const OWN_KEY="data-mirage-achievements-v1";
export const REPO_ID="data-mirage";
export const REPO_IDS=Object.freeze(["data-mirage","echo-vault","light-route","logic-foundry","neon-tactics","orbit-courier","packet-journey","parcel-panic","pixel-kitchen","pocket-city","route-race","sense-lab","swarm-garden","think-forge","traffic-lab"]);
const object=value=>value!==null&&typeof value==="object"&&!Array.isArray(value);
const exact=(value,keys)=>object(value)&&Object.keys(value).length===keys.length&&keys.every(k=>Object.hasOwn(value,k));
function summaryFrom(raw) {
  if(raw===null)return {version:1,apps:{}};
  if(typeof raw!=="string"||raw.length>8192)throw new RangeError("Summary too large");
  const value=JSON.parse(raw);
  if(!exact(value,["version","apps"])||value.version!==1||!object(value.apps)||Object.keys(value.apps).length>15)throw new TypeError("Invalid summary");
  for(const [id,record]of Object.entries(value.apps)){
    if(!REPO_IDS.includes(id)||!exact(record,["completed","total","updatedAt"])||!Number.isInteger(record.total)||record.total<0||record.total>1000||!Number.isInteger(record.completed)||record.completed<0||record.completed>record.total)throw new RangeError("Invalid summary record");
    if(typeof record.updatedAt!=="string"||record.updatedAt.length!==24||!Number.isFinite(Date.parse(record.updatedAt))||new Date(record.updatedAt).toISOString()!==record.updatedAt)throw new RangeError("Invalid update time");
  }
  return value;
}
export function browserStorage() {
  try{return window.localStorage;}catch{return null;}
}
export function readAchievements(storage) {
  try{
    if(!storage)return {valid:false,completed:[]};
    const raw=storage.getItem(OWN_KEY);
    if(raw===null)return {valid:true,completed:[]};
    if(typeof raw!=="string"||raw.length>512)throw new RangeError("Record too large");
    const value=JSON.parse(raw);
    if(!exact(value,["version","completed"])||value.version!==1)throw new TypeError("Invalid record");
    return {valid:true,completed:completedAchievements(value.completed)};
  }catch{return {valid:false,completed:[]};}
}
export function syncSummary(storage,now=new Date()) {
  try{
    if(!storage)return false;
    const durable=readAchievements(storage);
    if(!durable.valid)return false;
    const own=durable.completed,value=summaryFrom(storage.getItem(SUMMARY_KEY));
    if(own.length===0){
      if(!Object.hasOwn(value.apps,REPO_ID))return true;
      delete value.apps[REPO_ID];
    }else{
      if(!(now instanceof Date)||!Number.isFinite(now.getTime()))throw new RangeError("Invalid time");
      value.apps[REPO_ID]={completed:own.length,total:ACHIEVEMENTS.length,updatedAt:now.toISOString()};
    }
    storage.setItem(SUMMARY_KEY,JSON.stringify(value));
    return true;
  }catch{return false;}
}
export function saveAchievements(storage,completed,now=new Date()) {
  try{
    const own=completedAchievements(completed),previous=readAchievements(storage);
    if(!storage||!previous.valid)return {durable:false,summary:false};
    const merged=completedAchievements([...new Set([...previous.completed,...own])]);
    storage.setItem(OWN_KEY,JSON.stringify({version:1,completed:merged}));
    return {durable:true,summary:syncSummary(storage,now)};
  }catch{return {durable:false,summary:false};}
}
export function clearAchievements(storage) {
  try{
    if(!storage)return {durable:false,summary:false};
    storage.removeItem(OWN_KEY);
    return {durable:true,summary:syncSummary(storage)};
  }catch{return {durable:false,summary:false};}
}
