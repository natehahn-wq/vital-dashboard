// Fueling page — workout-aware nutrition guide. Picks today's session from a
// fixed weekly schedule, computes calorie/macro targets relative to a measured
// RMR + NEAT + exercise estimate, and renders pre/during/post fueling cards.
import { useState } from "react";
import { P, FF, S, CS } from "../lib/theme.js";
import { SLabel } from "../components/shared.jsx";

export function FuelingPage(){
  const [deficit,setDeficit]=useState(false);
  const [deficitSize,setDeficitSize]=useState(500);
  const now=new Date();const hour=now.getHours();const dow=now.getDay();const dowIdx=dow===0?6:dow-1;
  const WEEKLY_SCHEDULE={
    0:{name:"Running",           icon:"🏃",type:"cardio",  strain:11.0,dur:50,timeH:13},
    1:{name:"Functional Fitness",icon:"🏋",type:"strength",strain:11.2,dur:68,timeH:10},
    2:{name:"Running",           icon:"🏃",type:"cardio",  strain:12.8,dur:52,timeH:11},
    3:{name:"Functional Fitness",icon:"🏋",type:"strength",strain:11.5,dur:68,timeH:10},
    4:{name:"Running",           icon:"🏃",type:"cardio",  strain:10.2,dur:50,timeH:13},
    5:{name:"Functional Fitness",icon:"🏋",type:"strength",strain:14.1,dur:76,timeH:7},
    6:{name:"Running",           icon:"🏃",type:"cardio",  strain:11.3,dur:52,timeH:9},
  };
  const sched=WEEKLY_SCHEDULE[dowIdx];const isStrength=sched.type==="strength";const isHigh=sched.strain>=13;const isMorning=sched.timeH<=10;
  const preWorkout=hour<sched.timeH;const duringWindow=hour>=sched.timeH&&hour<sched.timeH+2;const postWorkout=hour>=sched.timeH+1;
  const RMR_KCAL=1858;const NEAT_KCAL=1300;const exCal=Math.round(sched.strain*42);
  const maintenanceTDEE=RMR_KCAL+NEAT_KCAL+exCal;const targetCals=deficit?maintenanceTDEE-deficitSize:maintenanceTDEE;
  const leanLbs=149.8;
  const protein_g=isStrength?Math.round(leanLbs*1.1):Math.round(leanLbs*0.9);const protein_cal=protein_g*4;
  const fat_cal=Math.round(targetCals*(deficit?0.28:0.26));const fat_g=Math.round(fat_cal/9);
  const carb_cal=targetCals-protein_cal-fat_cal;const carb_g=Math.round(carb_cal/4);
  const PRE_FUEL={
    cardio:{timing:isMorning?"30–60 min before":"60–90 min before",meals:isMorning?["Banana + 1 tbsp almond butter (~200 kcal)","Rice cake + honey (~120 kcal)","Half a bagel with jam (~150 kcal)"]:["Oatmeal with berries + protein (~400 kcal)","Greek yogurt + granola + fruit (~350 kcal)","Toast + 2 eggs + avocado (~420 kcal)"],carbs_g:isHigh?"40–60g":"25–40g",protein_g_pre:"10–20g",note:isMorning?"Fasted cardio viable for aerobic runs <60 min. Have the banana as insurance.":"Prioritise carbs 90 min out. Plenty of time to digest."},
    strength:{timing:isMorning?"60–90 min before":"90–120 min before",meals:isMorning?["Protein shake + banana (~300 kcal)","Greek yogurt + berries + granola (~380 kcal)","2 eggs + rice cakes + fruit (~320 kcal)"]:["Chicken + rice + veggies (~550 kcal)","Salmon + sweet potato (~520 kcal)","Ground turkey rice bowl (~500 kcal)"],carbs_g:isHigh?"50–80g":"35–55g",protein_g_pre:"25–35g",note:isHigh?`High-strain day. Load carbs — glycolytic pathway drives FF.`:"Standard strength prep. Balanced meal 90 min out."},
  };
  const DURING_FUEL={
    cardio:{hydration:"500–750ml/hour",electrolytes:"Sodium 500–700mg/hr if >60 min",carbs:sched.dur>=60?"30–45g/hr after first 45 min":"Water only if <60 min"},
    strength:{hydration:"500ml/hour minimum",electrolytes:"Sodium 300–500mg/hr",carbs:isHigh?"20–30g intra-workout":"Water and electrolytes sufficient",note:isHigh?"High-strain FF benefits from intra-workout carbs — keeps intensity in the final third.":"Lower-strain sessions don't need carb fueling mid-workout."},
  };
  const POST_FUEL={
    cardio:{timing:"Within 30–45 min",meals:[`${Math.round(leanLbs*0.25)}g protein + fast carbs (shake + banana, ~450 kcal)`,"Chocolate milk + rice cakes (~380 kcal)","Greek yogurt parfait + granola + honey (~400 kcal)"],protein_g:`${Math.round(leanLbs*0.22)}–${Math.round(leanLbs*0.28)}g`,carbs_g:"60–80g fast carbs"},
    strength:{timing:"Within 30 min",meals:[`${Math.round(leanLbs*0.28)}g protein + moderate carbs (shake + fruit, ~500 kcal)`,"Chicken + white rice + veggies (~600 kcal)","Eggs + toast + cottage cheese (~520 kcal)"],protein_g:`${Math.round(leanLbs*0.25)}–${Math.round(leanLbs*0.30)}g`,carbs_g:"40–60g moderate GI carbs",note:`Hit ${Math.round(leanLbs*0.27)}g protein fast. Leucine-rich sources (whey, chicken, eggs) preferred.`},
  };
  const preFuel=PRE_FUEL[sched.type];const durFuel=DURING_FUEL[sched.type];const postFuel=POST_FUEL[sched.type];
  const macroData=[{name:"Protein",g:protein_g,kcal:protein_cal,color:P.sage},{name:"Carbs",g:carb_g,kcal:carb_cal,color:P.amber},{name:"Fat",g:fat_g,kcal:fat_cal,color:P.terra}];
  const Section=({title,emoji,active})=>(<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:8,background:active?"rgba(196,120,48,0.12)":P.panel,border:`1px solid ${active?P.amber:P.border}`,marginBottom:2}}><span style={{fontSize:14}}>{emoji}</span><span style={{fontFamily:FF.s,fontSize:11,fontWeight:active?700:400,color:active?P.amber:P.sub}}>{title}</span>{active&&<div style={{marginLeft:"auto",fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.amber,background:P.amber+"20",padding:"2px 7px",borderRadius:4,letterSpacing:"0.06em"}}>NOW</div>}</div>);
  const MealOption=({meal,idx})=>(<div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{width:22,height:22,borderRadius:"50%",background:P.card,border:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.m,fontSize:9,fontWeight:700,color:P.muted,flexShrink:0}}>{idx+1}</div><div style={{fontFamily:FF.s,fontSize:11,color:P.text,flex:1,lineHeight:1.5}}>{meal}</div></div>);

  return(<div style={S.col16}>
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>Nutrition · {now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
        <div style={S.h18}>Fueling Guide</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:12,background:deficit?P.cardDk:P.card,border:`1px solid ${deficit?P.borderDk:P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:deficit?P.textInv:P.text,marginBottom:2}}>Calorie Deficit Mode</div>
          <div style={{fontFamily:FF.s,fontSize:9,color:deficit?P.mutedDk:P.muted}}>{deficit?`−${deficitSize} kcal/day below maintenance`:"Maintenance / Performance mode"}</div>
        </div>
        <div onClick={()=>setDeficit(d=>!d)} style={{width:44,height:24,borderRadius:12,cursor:"pointer",transition:"all .2s",background:deficit?"#3A5C48":"rgba(0,0,0,0.12)",position:"relative",flexShrink:0}}>
          <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:deficit?23:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.25)"}}/>
        </div>
      </div>
    </div>
    {deficit&&(<div style={{background:P.cardDk,borderRadius:12,padding:"14px 18px",border:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.textInv}}>Daily Deficit</div><div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:P.terra,letterSpacing:"-0.01em"}}>−{deficitSize} kcal</div></div>
      <input type="range" min={200} max={800} step={50} value={deficitSize} onChange={e=>setDeficitSize(+e.target.value)} style={{width:"100%",accentColor:P.terra,cursor:"pointer"}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk}}>−200 kcal (gentle, ~0.4 lb/wk)</span><span style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk}}>−800 kcal (aggressive, ~1.6 lb/wk)</span></div>
    </div>)}
    <div style={S.g240}>
      <div style={{background:P.cardDk,borderRadius:14,padding:"18px",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Today's Workout</div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:44,height:44,borderRadius:12,background:sched.type==="strength"?"rgba(58,92,72,0.35)":"rgba(196,120,48,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{sched.icon}</div>
          <div><div style={{fontFamily:FF.s,fontSize:13,fontWeight:700,color:P.textInv}}>{sched.name}</div><div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,marginTop:2}}>{sched.dur} min · ~{sched.strain} strain · ~{exCal} kcal</div></div>
          {isHigh&&<div style={{marginLeft:"auto",padding:"3px 9px",borderRadius:5,background:"rgba(196,96,74,0.25)",border:"1px solid rgba(196,96,74,0.4)"}}><span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:"#E8816A"}}>HIGH LOAD</span></div>}
        </div>
        <Section title="Pre-workout window" emoji="⚡" active={preWorkout}/>
        <Section title="During session" emoji="💧" active={duringWindow}/>
        <Section title="Post-workout recovery" emoji="🔄" active={postWorkout}/>
      </div>
      <div style={CS()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>Daily Calorie Target</div>
          <div style={{padding:"3px 8px",borderRadius:5,background:deficit?"rgba(196,96,74,0.10)":"rgba(58,92,72,0.10)",border:`1px solid ${deficit?P.terra:P.sage}44`}}><span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:deficit?P.terra:P.sage}}>{deficit?"DEFICIT":"MAINTENANCE"}</span></div>
        </div>
        <div style={{fontFamily:FF.r,fontSize:42,fontWeight:600,color:P.text,lineHeight:1,letterSpacing:"-0.02em",marginBottom:4}}>{targetCals.toLocaleString()}<span style={{fontFamily:FF.s,fontSize:12,color:P.muted,fontWeight:400,marginLeft:4}}>kcal</span></div>
        {deficit&&<div style={{fontFamily:FF.s,fontSize:9,color:P.terra,marginBottom:10}}>Maintenance is {maintenanceTDEE.toLocaleString()} kcal · deficit −{deficitSize}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:12}}>
          {[{label:"RMR (measured)",val:RMR_KCAL,color:P.sage},{label:"NEAT / lifestyle",val:NEAT_KCAL,color:P.steel},{label:"Exercise",val:exCal,color:P.amber},...(deficit?[{label:"Deficit",val:-deficitSize,color:P.terra}]:[])].map(({label,val,color})=>(<div key={label} style={S.rowsb}><div style={S.row6}><div style={{width:6,height:6,borderRadius:"50%",background:color}}/><span style={S.sub10}>{label}</span></div><span style={{fontFamily:FF.m,fontSize:10,fontWeight:500,color:val<0?P.terra:P.text}}>{val>0?"+":""}{val} kcal</span></div>))}
          <div style={{height:1,background:P.border,margin:"3px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.text}}>Target</span><span style={{fontFamily:FF.m,fontSize:11,fontWeight:700,color:P.text}}>{targetCals.toLocaleString()} kcal</span></div>
        </div>
      </div>
    </div>
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <SLabel color={P.sage}>Macro Targets · {sched.name} Day</SLabel>
        <div style={S.mut9}>149.8 lbs lean mass · {isStrength?"strength (↑ protein)":"cardio (↑ carbs)"}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        {macroData.map(m=>(<div key={m.name} style={{padding:"12px 14px",borderRadius:11,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:9,color:P.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{m.name}</div><div style={{fontFamily:FF.r,fontSize:28,fontWeight:600,color:m.color,lineHeight:1,letterSpacing:"-0.01em"}}>{m.g}<span style={{fontFamily:FF.s,fontSize:11,color:P.muted,fontWeight:400,marginLeft:2}}>g</span></div><div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:3}}>{m.kcal} kcal · {Math.round(m.kcal/targetCals*100)}%</div><div style={{height:4,borderRadius:2,background:P.border,marginTop:8,overflow:"hidden"}}><div style={{width:`${Math.round(m.kcal/targetCals*100)}%`,height:"100%",background:m.color,borderRadius:2}}/></div></div>))}
      </div>
    </div>
    <div style={{background:P.card,border:`1px solid ${preWorkout?P.amber:P.border}`,borderRadius:14,padding:"18px",boxShadow:preWorkout?"0 0 0 2px rgba(196,120,48,0.15)":"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <SLabel color={P.amber}>⚡ Pre-Workout · {preFuel.timing}</SLabel>
        {preWorkout&&<div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.amber,background:"rgba(196,120,48,0.12)",padding:"3px 8px",borderRadius:5,border:`1px solid ${P.amber}44`}}>UPCOMING NOW</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:12}}>
        <div style={{padding:"8px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Target Carbs</div><div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.amber}}>{preFuel.carbs_g}</div></div>
        <div style={{padding:"8px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Target Protein</div><div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.sage}}>{preFuel.protein_g_pre}</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>{preFuel.meals.map((m,i)=><MealOption key={i} meal={m} idx={i}/>)}</div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,padding:"8px 12px",background:P.panel,borderRadius:7,lineHeight:1.6}}>💡 {preFuel.note}</div>
    </div>
    <div style={{background:P.card,border:`1px solid ${duringWindow?P.steel:P.border}`,borderRadius:14,padding:"18px"}}>
      <SLabel color={P.steel}>💧 During Workout</SLabel>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        {[{label:"Hydration",val:durFuel.hydration,color:P.steel},{label:"Electrolytes",val:durFuel.electrolytes.split(" ").slice(0,3).join(" "),color:P.sage},{label:"Carbs",val:durFuel.carbs,color:P.amber}].map(({label,val,color})=>(<div key={label} style={{padding:"9px 11px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{label}</div><div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color,lineHeight:1.5}}>{val}</div></div>))}
      </div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,padding:"8px 12px",background:P.panel,borderRadius:7,lineHeight:1.6}}>💡 {durFuel.note}</div>
    </div>
    <div style={{background:P.card,border:`1px solid ${postWorkout?P.sage:P.border}`,borderRadius:14,padding:"18px",boxShadow:postWorkout?"0 0 0 2px rgba(58,92,72,0.15)":"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <SLabel color={P.sage}>🔄 Post-Workout · {postFuel.timing}</SLabel>
        {postWorkout&&<div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.sage,background:"rgba(58,92,72,0.12)",padding:"3px 8px",borderRadius:5,border:`1px solid ${P.sage}44`}}>WINDOW OPEN</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:12}}>
        <div style={{padding:"8px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Protein Target</div><div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.sage}}>{postFuel.protein_g}</div></div>
        <div style={{padding:"8px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Carbs Target</div><div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.amber}}>{postFuel.carbs_g}</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>{postFuel.meals.map((m,i)=><MealOption key={i} meal={m} idx={i}/>)}</div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,padding:"8px 12px",background:P.panel,borderRadius:7,lineHeight:1.6}}>💡 {postFuel.note}</div>
    </div>
  </div>);
}
