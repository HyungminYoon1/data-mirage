import {exercise,submitExercise,awardAchievement,ACHIEVEMENTS} from "./exercises.js";
import {browserStorage,readAchievements,saveAchievements,clearAchievements,syncSummary} from "./progress.js";

const $=s=>document.querySelector(s);
export function createExercises(randomSeed) {
  const storage=browserStorage(),loaded=readAchievements(storage);
  let completed=loaded.completed,challenge=null,outcome=null,active="axis";
  if(loaded.valid)syncSummary(storage);
  function recordStatus(){
    $("#exerciseProgress").textContent=`기기에 기록된 항목 ${completed.length}/${ACHIEVEMENTS.length}`;
  }
  function reset(){
    challenge=null;outcome=null;$("#exerciseForm").hidden=true;
    $("#exerciseResult").textContent="";$("#exerciseInput").value="";
    $("#exerciseInput").removeAttribute("aria-invalid");
  }
  function select(mission){active=mission;reset();recordStatus();}
  $("#startExercise").addEventListener("click",()=>{
    reset();challenge=exercise(active,randomSeed());
    $("#exercisePrompt").textContent=challenge.prompt;$("#exerciseUnit").textContent=challenge.unit;
    $("#exerciseForm").hidden=false;$("#submitExercise").disabled=false;$("#exerciseInput").disabled=false;
    $("#exerciseInput").focus();
  });
  $("#exerciseForm").addEventListener("submit",event=>{
    event.preventDefault();if(!challenge||outcome)return;
    try{
      outcome=submitExercise(challenge,$("#exerciseInput").value);
      $("#exerciseInput").removeAttribute("aria-invalid");
      $("#submitExercise").disabled=true;$("#exerciseInput").disabled=true;
      let message=(outcome.correct?"맞습니다. ":"오답입니다. ")+outcome.explanation;
      if(outcome.correct&&!completed.includes(active)){
        const next=awardAchievement(completed,outcome),saved=saveAchievements(storage,next);
        if(saved.durable){completed=readAchievements(storage).completed;message+=" 항목을 기록했습니다.";}
        else message+=" 기기에 저장할 수 없습니다.";
        if(saved.durable&&!saved.summary)message+=" 갤러리 요약을 저장할 수 없습니다.";
      }
      $("#exerciseResult").textContent=message;recordStatus();
    }catch{
      $("#exerciseInput").setAttribute("aria-invalid","true");
      $("#exerciseResult").textContent="−1000부터 1000까지 숫자를 입력하세요.";
    }
  });
  $("#clearProgress").addEventListener("click",()=>{
    const cleared=clearAchievements(storage);reset();
    if(cleared.durable)completed=[];recordStatus();
    $("#exerciseResult").textContent=cleared.durable?(cleared.summary?"이 앱의 기록을 지웠습니다.":"문제 기록은 지웠으나 갤러리 요약을 갱신할 수 없습니다."):"기기 기록에 접근할 수 없습니다.";
  });
  recordStatus();
  return {select};
}
