import {rng,number} from "./ui.js";
export const VALUES=Object.freeze([52,53,54,55,56]);
export function mean(values){
  if(!Array.isArray(values)||!values.length||values.some(v=>!Number.isFinite(v)))throw new TypeError("Finite nonempty values required");
  return values.reduce((s,v)=>s+v,0)/values.length;
}
export function axisSummary(baseline){
  number(baseline,0,51,"baseline");
  return {baseline,values:[...VALUES],actualGrowth:(VALUES.at(-1)-VALUES[0])/VALUES[0]*100,heightRatio:(VALUES.at(-1)-baseline)/(VALUES[0]-baseline)};
}
export function population(seed=7){
  const random=rng(seed);
  return Array.from({length:200},(_,id)=>({id,group:id<80?"high":"low",score:id<80?75+Math.round(random()*20):30+Math.round(random()*40)}));
}
export function samplePopulation(data,size,mode="random",seed=1){
  number(size,5,80,"sample size");if(!Number.isInteger(size)||!["random","high","low"].includes(mode)||!Array.isArray(data)||data.length!==200)throw new TypeError("Invalid sample");
  const pool=data.filter(item=>mode==="random"||item.group===mode).map(item=>({...item})),random=rng(seed);
  if(pool.length<size)throw new RangeError("Sample exceeds pool");
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const sample=pool.slice(0,size),populationMean=mean(data.map(p=>p.score)),sampleMean=mean(sample.map(p=>p.score));
  return {sample,populationMean,sampleMean,error:sampleMean-populationMean,size,mode,seed};
}
export function simpson(aEasy=10,bEasy=80){
  for(const n of [aEasy,bEasy])if(!Number.isInteger(n)||n<10||n>80||n%10)throw new RangeError("Easy-case count must be a multiple of ten between 10 and 80");
  const make=(n,easyRate,hardRate)=>({easy:{n,success:n*easyRate,rate:easyRate},hard:{n:90-n,success:(90-n)*hardRate,rate:hardRate},total:{n:90,success:n*easyRate+(90-n)*hardRate,rate:(n*easyRate+(90-n)*hardRate)/90}});
  const A=make(aEasy,.9,.3),B=make(bEasy,.8,.2);
  return {A,B,reversed:A.total.rate<B.total.rate,overallWinner:A.total.rate===B.total.rate?"tie":A.total.rate>B.total.rate?"A":"B"};
}
