import {correlationSummary,missionFeedback} from "./statistics.js";
import {integer,seedNumber} from "./math.js";
import {investigationResult,interpretation,serializeTrace} from "./interpretation.js";

const $=s=>document.querySelector(s),NS="http://www.w3.org/2000/svg";
const rtext=v=>v===null?"미정의":v.toFixed(3),ptext=v=>v<.0001?v.toExponential(3):v.toFixed(4);
function text(id,value){$("#"+id).textContent=value;}
function table(id,rows){$("#"+id).replaceChildren(...rows.map(row=>{const tr=document.createElement("tr");for(const value of row){const td=document.createElement("td");td.textContent=value;tr.append(td);}return tr;}));}
function svg(parent,tag,attrs,value){const node=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);if(value!==undefined)node.textContent=value;parent.append(node);return node;}

export function createInvestigations(initialSeed){
  let seed=seedNumber(initialSeed);
  const state={huntMetrics:6,huntTruth:"null",huntPolicy:"peek",huntCorrection:"raw",correlationScenario:"confounding",correlationView:"all",intervalSize:80,intervalMode:"random",intervalConfidence:.95};
  const cache=new Map(),answers={};
  const allowed={huntTruth:["null","signal"],huntPolicy:["peek","fixed"],huntCorrection:["raw","bonferroni"],correlationScenario:["confounding","outlier"],correlationView:["all","centered","without"],intervalSize:[20,80,200],intervalMode:["random","biased"],intervalConfidence:[.9,.95,.99]};
  function result(name){
    if(cache.has(name))return cache.get(name);
    const value=investigationResult(name,seed,state);
    cache.set(name,value);return value;
  }
  function feedback(name){
    if(!answers[name])return;
    const f=missionFeedback(name,answers[name],result(name)),target=$("#"+name+"Answer");
    target.dataset.correct=String(f.correct);target.textContent=(f.correct?"맞습니다. ":"다시 판단해 보세요. ")+f.text;
    for(const b of document.querySelectorAll('[data-mission="'+name+'"]'))b.setAttribute("aria-pressed",String(b.dataset.choice===answers[name]));
  }
  function renderHunt(){
    const h=result("hunt"),c=h.current;
    $("#huntMetrics").value=state.huntMetrics;text("huntMetricsOut",state.huntMetrics+"개");
    for(const key of ["huntTruth","huntPolicy","huntCorrection"])$("#"+key).value=state[key];
    text("huntVerdict",c.rejected?"H0 기각":"기각 못함");text("huntFamily",c.tests+"검정");text("huntRate",h.flagged+" / "+h.replicates);
    text("huntEvidence",interpretation("hunt",seed,state));
    table("huntAlternatives",h.alternatives.map(a=>[(a.policy==="peek"?"4시점 탐색":"80회 최종")+" / "+(a.correction==="raw"?"각 5%":"가족 보정"),ptext(a.threshold),(a.rejected?"발견":"미발견")+" / "+a.trialsObserved+"개 (지표당 "+a.stopN+")"]));
    const inspected=new Set(c.inspected.map(p=>p.metric+":"+p.n));
    const rows=h.dataset.streams.flatMap(s=>s.checkpoints.map(p=>({metric:s.id,...p})));
    table("huntPath",rows.map(p=>[p.metric+1,p.successes+" / "+p.n,ptext(p.p),inspected.has(p.metric+":"+p.n)?"검사함":"검사하지 않음"]));
    [...$("#huntPath").children].forEach((tr,i)=>{const p=rows[i];tr.classList.toggle("detected",inspected.has(p.metric+":"+p.n)&&p.p<=c.threshold);});
    $("#huntRaw").replaceChildren(...h.dataset.streams.map(s=>{const p=document.createElement("p");p.textContent="지표 "+(s.id+1)+" / 생성 성공확률 "+s.probability+" / "+s.flips.join("");return p;}));
  }
  function renderCorrelation(){
    const d=result("correlation");for(const key of ["correlationScenario","correlationView"])$("#"+key).value=state[key];
    let points=d.points;
    if(state.correlationView==="without")points=points.filter(p=>p.id!==23);
    if(state.correlationView==="centered")points=points.map(p=>{const g=d.full.groups.find(g=>g.group===p.group);return {...p,x:p.x-g.mx,y:p.y-g.my};});
    const current=correlationSummary(points),chart=$("#scatter");chart.replaceChildren();
    const xs=points.map(p=>p.x),ys=points.map(p=>p.y),xmin=Math.min(...xs)-3,xmax=Math.max(...xs)+3,ymin=Math.min(...ys)-3,ymax=Math.max(...ys)+3;
    const x=v=>55+(v-xmin)/(xmax-xmin)*520,y=v=>285-(v-ymin)/(ymax-ymin)*255;
    for(let i=0;i<=4;i++){
      const xv=xmin+(xmax-xmin)*i/4,yv=ymin+(ymax-ymin)*i/4;
      svg(chart,"line",{x1:x(xv),x2:x(xv),y1:30,y2:285,stroke:"#e2d9cb"});svg(chart,"line",{x1:55,x2:575,y1:y(yv),y2:y(yv),stroke:"#e2d9cb"});
      svg(chart,"text",{x:x(xv),y:308,"text-anchor":"middle","font-size":12,fill:"#786f63"},xv.toFixed(1));svg(chart,"text",{x:47,y:y(yv)+4,"text-anchor":"end","font-size":12,fill:"#786f63"},yv.toFixed(1));
    }
    for(const p of points){const dot=svg(chart,"circle",{cx:x(p.x),cy:y(p.y),r:p.id===23?7:5,fill:["II","influential"].includes(p.group)?"#e7644d":"#607fa3"});svg(dot,"title",{},"관측 "+(p.id+1)+" / "+p.group+" / X "+p.x+" / Y "+p.y);}
    svg(chart,"text",{x:315,y:334,"text-anchor":"middle","font-size":12,fill:"#786f63"},state.correlationView==="centered"?"X − 집단 평균 (단위: 가상 점수)":"X (단위: 가상 점수)");
    svg(chart,"text",{x:55,y:17,"font-size":12,fill:"#786f63"},state.correlationView==="centered"?"Y − 집단 평균":"Y (가상 점수)");
    chart.setAttribute("aria-label",points.length+"점, 현재 r "+rtext(current.r)+", X 범위 "+xmin.toFixed(1)+"부터 "+xmax.toFixed(1)+", Y 범위 "+ymin.toFixed(1)+"부터 "+ymax.toFixed(1));
    text("scatterCaption","파랑: "+d.full.groups[0].group+" · 주황: "+d.full.groups[1].group+" / 비교 조건마다 축 범위가 바뀝니다. 원자료는 아래 표에서 확인하세요.");
    text("correlationAll",rtext(d.full.r));text("correlationCurrent",rtext(current.r)+" / "+points.length);text("correlationWithin",rtext(d.full.withinR));
    text("correlationEvidence",interpretation("correlation",seed,state));
    table("correlationGroups",d.full.groups.map(g=>[g.group,g.n,rtext(g.r)]));
    table("correlationRaw",d.points.map((p,i)=>[(p.id+1)+" / "+p.group,p.x,p.y,rtext(d.full.leaveOneOut[i].r)]));
  }
  function renderInterval(){
    const d=result("interval"),c=d.current;for(const key of ["intervalSize","intervalMode","intervalConfidence"])$("#"+key).value=state[key];
    text("intervalEstimate",c.successes+" / "+c.n);text("intervalBounds",c.low.toFixed(3)+" … "+c.high.toFixed(3));text("intervalCoverage",d.covered+" / "+d.replicates);
    text("intervalEvidence",interpretation("interval",seed,state));
    const chart=$("#intervalChart");chart.replaceChildren();const x=v=>50+v*520;
    for(let i=0;i<=5;i++){const v=i/5;svg(chart,"line",{x1:x(v),x2:x(v),y1:25,y2:425,stroke:"#e2d9cb"});svg(chart,"text",{x:x(v),y:447,"text-anchor":"middle","font-size":12,fill:"#786f63"},v.toFixed(1));}
    svg(chart,"line",{x1:x(.6),x2:x(.6),y1:20,y2:425,stroke:"#303d48","stroke-width":2});
    d.replications.slice(0,40).forEach((r,i)=>{const y=30+i*10;svg(chart,"line",{x1:x(r.low),x2:x(r.high),y1:y,y2:y,stroke:r.covers?"#607fa3":"#e7644d","stroke-width":3});const dot=svg(chart,"circle",{cx:x(r.estimate),cy:y,r:3,fill:r.covers?"#607fa3":"#e7644d"});svg(dot,"title",{},"반복 "+(i+1)+": "+r.successes+" / "+r.n+", 구간 "+r.low.toFixed(3)+" … "+r.high.toFixed(3));});
    chart.setAttribute("aria-label","160회 중 목표 포함 "+d.covered+"회. 첫 40개 구간의 가로축은 0부터 1, 세로 순서는 반복 1부터 40.");
    text("intervalDraws","토큰 번호는 1부터 200. 1…120은 값 1, 121…200은 값 0. 복원 추출 순서: "+c.draws.map(p=>p.id+1).join(", "));
    table("intervalRaw",d.replications.map((r,i)=>[(i+1)+" / "+r.seed,r.successes+" / "+r.n,r.low.toFixed(3)+" … "+r.high.toFixed(3),r.covers?"포함":"미포함"]));
  }
  function render(name){
    if(!["hunt","correlation","interval"].includes(name))return;
    if(name==="hunt")renderHunt();if(name==="correlation")renderCorrelation();if(name==="interval")renderInterval();feedback(name);
    text(name+"ExportStatus","");
  }
  function configure(input){
    if(!input||typeof input!=="object"||Array.isArray(input))throw new TypeError("Object required");
    const next={...state};
    for(const [key,value]of Object.entries(input)){
      if(!Object.hasOwn(state,key))throw new TypeError("Unknown investigation setting");
      if(key==="huntMetrics")integer(value,1,12,key);else if(!allowed[key].includes(value))throw new RangeError("Invalid "+key);
      next[key]=value;
    }
    Object.assign(state,next);
    for(const name of ["hunt","correlation","interval"])if(Object.keys(input).some(k=>k.startsWith(name))){cache.delete(name);render(name);}
    return summary();
  }
  function summary(){return {seed,settings:{...state},computed:[...cache.keys()],hunt:cache.has("hunt")?{...result("hunt").current,flagged:result("hunt").flagged,replicates:160}:null,correlation:cache.has("correlation")?result("correlation").full:null,interval:cache.has("interval")?{estimate:result("interval").current.estimate,low:result("interval").current.low,high:result("interval").current.high,covered:result("interval").covered,replicates:160}:null};}
  function setSeed(value){seed=seedNumber(value);cache.clear();}
  for(const key of Object.keys(state)){
    const control=$("#"+key);control.addEventListener(key==="huntMetrics"?"input":"change",()=>configure({[key]:typeof state[key]==="number"?Number(control.value):control.value}));
  }
  for(const button of document.querySelectorAll("[data-mission]"))button.addEventListener("click",()=>{const name=button.dataset.mission;answers[name]=button.dataset.choice;feedback(name);});
  function exportTrace(name){
    const json=serializeTrace(name,seed,state),blob=new Blob([json],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download="data-mirage-"+name+"-"+seed+".json";
    link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  for(const button of document.querySelectorAll("[data-export]"))button.addEventListener("click",()=>{
    const name=button.dataset.export;
    try{exportTrace(name);text(name+"ExportStatus","현재 조건의 파일을 준비했습니다.");}
    catch{text(name+"ExportStatus","내려받을 수 없습니다.");}
  });
  return {render,configure,summary,setSeed};
}
