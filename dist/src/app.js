import {VALUES,axisSummary,population,samplePopulation,simpson} from "./model.js";
import {expose,tool,number} from "./ui.js";
const $=s=>document.querySelector(s),NS="http://www.w3.org/2000/svg",data=population();
let active="axis",baseline=0,size=20,mode="random",seed=1,aEasy=10,bEasy=80,sample=samplePopulation(data,size,mode,seed);
const percent=n=>(n*100).toFixed(1)+"%";
function selectCase(name){if(!["axis","sample","simpson"].includes(name))throw new TypeError("Unknown case");active=name;for(const tab of document.querySelectorAll("[data-case]")){const yes=tab.dataset.case===name;tab.setAttribute("aria-selected",String(yes));tab.tabIndex=yes?0:-1;$("#panel-"+tab.dataset.case).hidden=!yes;}return summary();}
function summary(){const s=simpson(aEasy,bEasy);return {active,axis:axisSummary(baseline),sample:{size,mode,seed,populationMean:sample.populationMean,sampleMean:sample.sampleMean,error:sample.error},simpson:{aEasy,bEasy,A:s.A.total.rate,B:s.B.total.rate,overallWinner:s.overallWinner,reversed:s.reversed}};}
function configure(input){
  const next={baseline,size,mode,aEasy,bEasy,...input};number(next.baseline,0,51,"baseline");number(next.size,5,80,"size");if(!Number.isInteger(next.size)||!["random","high","low"].includes(next.mode))throw new TypeError("Invalid sampling");
  simpson(next.aEasy,next.bEasy);if(input.active!==undefined&&!["axis","sample","simpson"].includes(input.active))throw new TypeError("Unknown case");
  const nextSample=samplePopulation(data,next.size,next.mode,seed);
  baseline=next.baseline;size=next.size;mode=next.mode;aEasy=next.aEasy;bEasy=next.bEasy;sample=nextSample;
  if(input.active!==undefined)selectCase(input.active);render();return summary();
}
function svg(container,tag,attrs,text){const node=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);if(text!==undefined)node.textContent=text;container.append(node);}
function bars(container,start,color){
  container.replaceChildren();const top=60,bottom=232,toY=value=>bottom-(value-start)/(top-start)*190;
  for(let k=0;k<=4;k++){const value=start+(top-start)*k/4,y=toY(value);svg(container,"line",{x1:46,y1:y,x2:425,y2:y,stroke:"#d9cbbc","stroke-width":1});svg(container,"text",{x:38,y:y+4,"text-anchor":"end",fill:"#9a8270","font-size":11},Number(value.toFixed(1)));}
  VALUES.forEach((v,i)=>{const x=70+i*70,y=toY(v);svg(container,"rect",{x,y,width:42,height:bottom-y,rx:2,fill:color});svg(container,"text",{x:x+21,y:y-8,"text-anchor":"middle",fill:"#745b4d","font-size":13,"font-weight":700},v);svg(container,"text",{x:x+21,y:255,"text-anchor":"middle",fill:"#9a8270","font-size":11},String(i+1)+"월");});
  if(start>0)svg(container,"text",{x:235,y:283,"text-anchor":"middle",fill:"#aa6650","font-size":11},"세로축 0이 생략되어 있습니다");
}
function renderAxis(){const info=axisSummary(baseline);$("#baseline").value=baseline;$("#baselineOut").textContent=baseline;$("#baselineCaption").textContent=baseline;bars($("#originalChart"),0,"#687f86");bars($("#alteredChart"),baseline,"#e7644d");$("#axisFeedback").textContent="숫자는 52 → 56, 실제 증가율은 "+info.actualGrowth.toFixed(1)+"%입니다. 막대 높이의 비율은 "+info.heightRatio.toFixed(2)+"배로 보입니다.";}
function renderSample(){
  $("#sampleSize").value=size;$("#sizeOut").textContent=size+"명";$("#sampleMode").value=mode;$("#populationMean").textContent=sample.populationMean.toFixed(1);$("#sampleMean").textContent=sample.sampleMean.toFixed(1);$("#sampleError").textContent=(sample.error>=0?"+":"")+sample.error.toFixed(1);
  const canvas=$("#distribution"),ctx=canvas.getContext("2d"),x=v=>55+(v-20)/80*800,chosen=new Set(sample.sample.map(p=>p.id));
  ctx.clearRect(0,0,900,300);ctx.font="12px system-ui";ctx.textAlign="center";
  for(let v=20;v<=100;v+=20){ctx.strokeStyle="#e8dfd2";ctx.beginPath();ctx.moveTo(x(v),45);ctx.lineTo(x(v),246);ctx.stroke();ctx.fillStyle="#a08b73";ctx.fillText(v,x(v),270);}
  for(const p of data){ctx.beginPath();ctx.arc(x(p.score),65+(p.id%12)*13,chosen.has(p.id)?5:3,0,Math.PI*2);ctx.fillStyle=chosen.has(p.id)?"#e7644d":"#a9ada655";ctx.fill();}
  for(const [value,color]of [[sample.populationMean,"#4f6570"],[sample.sampleMean,"#dc5e43"]]){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(x(value),30);ctx.lineTo(x(value),245);ctx.stroke();ctx.setLineDash([]);}
  canvas.setAttribute("aria-label","모집단 평균 "+sample.populationMean.toFixed(1)+", 표본 평균 "+sample.sampleMean.toFixed(1)+", 차이 "+sample.error.toFixed(1)+"인 점수 분포");
  $("#sampleFeedback").textContent=mode==="random"?"전체에서 무작위로 "+size+"명을 뽑았습니다. 다시 뽑아 평균이 얼마나 흔들리는지 살펴보세요.":(mode==="high"?"높은":"낮은")+" 점수 집단만 뽑았습니다. 표본은 "+size+"명이지만 모집단 평균과 "+Math.abs(sample.error).toFixed(1)+"점 차이가 납니다.";
}
function row(label,rate,b=false){const div=document.createElement("div");div.className="bar-row"+(b?" b":"");const span=document.createElement("span"),track=document.createElement("div"),fill=document.createElement("i"),strong=document.createElement("strong");span.textContent=label;track.className="bar-track";fill.style.width=rate*100+"%";track.append(fill);strong.textContent=percent(rate);div.append(span,track,strong);return div;}
function renderSimpson(){
  const s=simpson(aEasy,bEasy);$("#aEasy").value=aEasy;$("#bEasy").value=bEasy;$("#aOut").textContent=aEasy+"회";$("#bOut").textContent=bEasy+"회";
  $("#conditionBars").replaceChildren(...[["easy","쉬운 과제"],["hard","어려운 과제"]].map(([key,name])=>{const div=document.createElement("div"),heading=document.createElement("h3");div.className="condition";heading.textContent=name;div.append(heading,row("A",s.A[key].rate),row("B",s.B[key].rate,true));return div;}));
  $("#overallBars").replaceChildren(row("A",s.A.total.rate),row("B",s.B.total.rate,true));
  $("#simpsonTable").replaceChildren(...[["easy","쉬운 과제"],["hard","어려운 과제"],["total","전체"]].map(([key,name])=>{const tr=document.createElement("tr");for(const value of [name,s.A[key].success.toFixed(0)+" / "+s.A[key].n,s.B[key].success.toFixed(0)+" / "+s.B[key].n]){const td=document.createElement("td");td.textContent=value;tr.append(td);}return tr;}));
  $("#simpsonFeedback").textContent=s.reversed?"각 조건에서는 A가 앞서지만, 합치면 B가 "+percent(s.B.total.rate)+"로 앞섭니다. B가 쉬운 과제를 더 많이 맡았기 때문입니다.":s.overallWinner==="tie"?"각 조건에서는 A가 앞서지만, 합산 성공률은 같습니다. 조건별 시도 횟수를 함께 살펴보세요.":"전체에서도 A가 "+percent(s.A.total.rate)+"로 앞섭니다. 각 조건의 성공률은 그대로지만, 맡은 과제의 비율이 달라졌습니다.";
}
function render(){renderAxis();renderSample();renderSimpson();}
function resample(){sample=samplePopulation(data,size,mode,++seed);renderSample();return summary();}
for(const tab of document.querySelectorAll("[data-case]")){tab.addEventListener("click",()=>selectCase(tab.dataset.case));tab.addEventListener("keydown",e=>{const names=["axis","sample","simpson"],i=names.indexOf(active);let next;if(e.key==="ArrowRight")next=names[(i+1)%3];if(e.key==="ArrowLeft")next=names[(i+2)%3];if(e.key==="Home")next=names[0];if(e.key==="End")next=names[2];if(next){e.preventDefault();selectCase(next);$("#tab-"+next).focus();}});}
$("#baseline").addEventListener("input",e=>configure({baseline:Number(e.target.value)}));
for(const b of document.querySelectorAll("[data-answer]"))b.addEventListener("click",()=>{for(const item of document.querySelectorAll("[data-answer]"))item.setAttribute("aria-pressed",String(item===b));$("#answerFeedback").textContent=b.dataset.answer==="7.7"?"맞습니다. (56 − 52) ÷ 52 × 100 ≈ 7.7%. 축을 바꿔도 증가율은 변하지 않습니다.":"막대의 높이가 아니라 원래 값을 비교합니다. (56 − 52) ÷ 52 × 100을 계산해 보세요.";});
$("#sampleSize").addEventListener("input",e=>configure({size:Number(e.target.value)}));$("#sampleMode").addEventListener("change",e=>configure({mode:e.target.value}));$("#resample").addEventListener("click",resample);
$("#aEasy").addEventListener("input",e=>configure({aEasy:Number(e.target.value)}));$("#bEasy").addEventListener("input",e=>configure({bEasy:Number(e.target.value)}));$("#reversal").addEventListener("click",()=>configure({aEasy:10,bEasy:80}));$("#balanced").addEventListener("click",()=>configure({aEasy:40,bEasy:40}));
render();selectCase("axis");
expose([
  tool("read_data_mirage","Read actual axis, sample and aggregate calculations; no personal or external data.",{},()=>summary(),true),
  tool("configure_data_mirage","Change the same axis, sampling and aggregation controls shown in the page.",{active:{type:"string",enum:["axis","sample","simpson"]},baseline:{type:"number",minimum:0,maximum:51},size:{type:"integer",minimum:5,maximum:80},mode:{type:"string",enum:["random","high","low"]},aEasy:{type:"integer",minimum:10,maximum:80},bEasy:{type:"integer",minimum:10,maximum:80}},configure),
  tool("resample_data_mirage","Draw another non-repeating sample with the current sampling controls.",{},resample)
]);
