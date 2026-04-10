// Today page — morning briefing / midday check-in / evening recap. Adapts
// to time-of-day buckets, surfaces sleep, recovery, todays workout (real WHOOP
// via CAL_RICH), weather, calendar, and quick-nav cards.
import { useState, useEffect } from "react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { P, FF, S, CS } from "../lib/theme.js";
import { SCORE_LABEL, calColor, calLabel, fmtEvtTime } from "../lib/utils.js";
import { WHOOP } from "../lib/data/whoop.js";
import { SCORES_NOW } from "../lib/data/scores.js";
import { CAL_RICH } from "../lib/data/calendar.js";
import { useCalendarEvents } from "../hooks/useCalendarEvents.js";

export function TodayPage({setPage, whoopStatus="loading"}){
  const { events:calEvents, label:calLabel2, error:calError } = useCalendarEvents();
  const now = new Date();
  const hour = now.getHours();

  // Time of day buckets
  const TOD =
    hour < 6  ? "predawn" :
    hour < 12 ? "morning" :
    hour < 14 ? "midday"  :
    hour < 18 ? "afternoon" :
    hour < 21 ? "evening" : "night";

  const greeting =
    TOD === "predawn"   ? "You're up early," :
    TOD === "morning"   ? "Good morning," :
    TOD === "midday"    ? "Good afternoon," :
    TOD === "afternoon" ? "Good afternoon," :
    TOD === "evening"   ? "Good evening," :
                          "Winding down,";

  const isMorning  = ["predawn","morning"].includes(TOD);
  const isMidday   = TOD === "midday";
  const isEvening  = ["evening","night"].includes(TOD);
  const isAfternoon = TOD === "afternoon";

  const timeLabel = now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
  const dateLabel = now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  // User-editable tomorrow plan
  const [tomorrowNote, setTomorrowNote] = useState("");
  const [tomorrowEditing, setTomorrowEditing] = useState(false);
  const [tomorrowCustom, setTomorrowCustom] = useState(null); // null = use pattern

  const [weather, setWeather] = useState({
    temp:73, feels:71, code:1, wind:8, humidity:62, rainPct:0, high:74,
  });

  useEffect(()=>{
    fetch("https://api.open-meteo.com/v1/forecast?latitude=34.4362&longitude=-119.6390&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,precipitation_probability&hourly=temperature_2m,precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FLos_Angeles&forecast_days=1")
      .then(r=>r.json())
      .then(d=>{
        const c=d.current;
        const hourly=d.hourly;
        const afHigh=Math.round(Math.max(...hourly.temperature_2m.slice(hour,18)));
        setWeather({
          temp:Math.round(c.temperature_2m),
          feels:Math.round(c.apparent_temperature),
          code:c.weather_code,
          wind:Math.round(c.wind_speed_10m),
          humidity:c.relative_humidity_2m,
          rainPct:c.precipitation_probability,
          high:afHigh,
        });
      })
      .catch(()=>{});
  },[]);

  const weatherIcon=code=>{
    if(code===0)return{icon:"☀️",label:"Clear & Sunny",good:true};
    if(code<=2) return{icon:"⛅",label:"Partly Cloudy",good:true};
    if(code<=3) return{icon:"☁️",label:"Overcast",good:true};
    if(code<=48)return{icon:"🌫️",label:"Foggy",good:false};
    if(code<=67)return{icon:"🌧️",label:"Rain",good:false};
    return{icon:"🌩️",label:"Unsettled",good:false};
  };
  const wDesc = weatherIcon(weather.code);
  const goodOutdoors = wDesc.good && weather.rainPct < 30;

  // -- Real WHOOP data --
  const REC = WHOOP.recovery, HRV = WHOOP.hrv, RHR = WHOOP.rhr;
  const SLEEP   = {perf:95, dur:8.53, rem:2.25, deep:1.85, light:4.43, eff:98, consistency:84, resp:14.9}; 
 
  const WEEKLY_SCHEDULE = {
    0:{name:"Running",           icon:"🏃",color:"#C47830",time:"13:00",timeH:13,strain:11.0,dur:50,freq:69},
    1:{name:"Functional Fitness",icon:"🏋",color:"#3A5C48",time:"10:00",timeH:10,strain:11.2,dur:68,freq:62},
    2:{name:"Running",           icon:"🏃",color:"#C47830",time:"11:00",timeH:11,strain:12.8,dur:52,freq:69,note:"Wed 11am run · 69% of weeks"},
    3:{name:"Functional Fitness",icon:"🏋",color:"#3A5C48",time:"10:00",timeH:10,strain:11.5,dur:68,freq:79},
    4:{name:"Running",           icon:"🏃",color:"#C47830",time:"13:00",timeH:13,strain:10.2,dur:50,freq:62},
    5:{name:"Functional Fitness",icon:"🏋",color:"#3A5C48",time:"07:00",timeH:7, strain:14.1,dur:76,freq:62},
    6:{name:"Running",           icon:"🏃",color:"#C47830",time:"09:00",timeH:9, strain:11.3,dur:52,freq:41},
  };

  // JS getDay(): 0=Sun → map to Mon=0 index
  const dow = now.getDay();
  const dowIdx = dow === 0 ? 6 : dow - 1;
  const todaySchedule = WEEKLY_SCHEDULE[dowIdx];

 
    // Build doneTodayAll from CAL_RICH (populated by live WHOOP API) instead of hardcoded data
      const iconMap = {running:"\u{1F3C3}",fitness:"\u{1F3CB}",walking:"\u{1F6B6}",cycling:"\u{1F6B4}",spin:"\u{1F6B4}",other:"\u{1F4AA}",sport:"\u26BD"};
      const colorMap = {running:"#C47830",fitness:"#3A5C48",walking:"#7A5AB0",cycling:"#2D7D9A",spin:"#2D7D9A",other:"#666",sport:"#444"};
      const doneTodayAll = (CAL_RICH[now.toLocaleDateString("en-CA")] || []).map(w => ({
              name: w.name || "Activity",
              icon: iconMap[w.cat] || "\u{1F4AA}",
              color: colorMap[w.cat] || "#666",
              strain: w.strain || 0,
              dur: w.dur || 0,
              cal: w.cal || 0,
              timeH: w.timeH != null ? w.timeH : 0,
              time: w.start || "",
              avgHR: w.avgHR || 0,
              maxHR: w.maxHR || 0,
      }));
  const doneToday = doneTodayAll.filter(w => hour >= w.timeH);
  const strainSoFar     = doneToday.reduce((s,w)=>s+w.strain,0);
  const calsBurned = doneToday.reduce((s,w)=>s+w.cal,0);

 
  const canonicalAhead = todaySchedule &&
    hour < todaySchedule.timeH + 2 &&
    !doneToday.some(w=>w.name===todaySchedule.name);

  // Yesterday's training
  const yesterday = [{name:"Running",icon:"🏃",color:"#C47830",strain:13.3,dur:81,cal:775}]; // Mar 21 — WHOOP screenshot
  const tomorrowDow = (dow + 1) % 7; // JS day of week
  const tomorrowIdx = tomorrowDow === 0 ? 6 : tomorrowDow - 1; // Mon=0 index
  const tomorrowSchedule = WEEKLY_SCHEDULE[tomorrowIdx];
  const tomorrowDayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][tomorrowDow];


  const planned = [];
  if(!isEvening && canonicalAhead && hour <= todaySchedule.timeH) {
    planned.push({
      name:todaySchedule.name, icon:todaySchedule.icon, color:todaySchedule.color,
      note:`${todaySchedule.note} · ~${todaySchedule.dur}m · ~${todaySchedule.strain} avg strain`,
      time:todaySchedule.time, freq:todaySchedule.freq, isCanonical:true,
    });
  } else if(!isEvening && !canonicalAhead && strainSoFar < 8 && hour < 18) {
    planned.push({
      name:"Recovery walk",icon:"🚶",color:"#7A5A80",
      note:todaySchedule?.timeH&&hour>todaySchedule.timeH?"Primary window passed — lighter option suggested":"Easy active recovery",
      time:null, freq:null, isCanonical:false,
    });
  }

  // Recovery trend (7-day)
  // 8-day recovery trend — real WHOOP values + Mar 22 screenshot
  const recTrend=[
    {d:"Mar 19",rec:62, hrv:43},
    {d:"Mar 20",rec:69, hrv:45},
    {d:"Mar 21",rec:69, hrv:43},
    {d:"Mar 22",rec:37, hrv:37},
    {d:"Mar 23",rec:87, hrv:52},
    {d:"Mar 24",rec:0,  hrv:0},
    {d:"Mar 25",rec:54, hrv:39},
    {d:"Mar 26",rec:54, hrv:39}, // Today
  ];

  const recColor = r => r>=80?"#3A5C48":r>=60?"#C47830":"#C4604A";
  const recLabel = r => r>=80?"Optimal":r>=60?"Moderate":"Low";
  const rc = recColor(REC);
  const ax ={tick:{fontFamily:FF.m,fontSize:8,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  // -- Time-adaptive guidance --
  const guidance = isMorning ? [
    {
      icon: REC>=80?"🟢":REC>=60?"🟡":"🔴",
      title: REC>=80
        ? `Green light — ${todaySchedule?.name||"train hard"} today`
        : REC>=60
        ? `Moderate effort — ${todaySchedule?.name||"train smart"}`
        : "Recovery day — scale back",
      body: (() => {
        const sched = todaySchedule;
        const baseMsg = sched
          ? `Typical ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][dowIdx]}: ${sched.name} at ${sched.time} (${sched.freq}% of weeks). Expected ~${sched.strain} strain.`
          : "";
        if(REC>=80) return `${baseMsg} HRV ${HRV}ms and recovery ${REC}% are strong — body is primed for full effort.`;
        if(REC>=60) return `${baseMsg} Recovery average (${REC}%). Complete the session but cap intensity — avoid Z4/Z5 today.`;
        return `${baseMsg} Low recovery (${REC}%). Consider skipping or substituting with Zone 2 walk — don't compound fatigue.`;
      })(),
      action:"View Fitness", page:"fitness",
    },
    {
      icon:"🌅",
      title: goodOutdoors ? `${wDesc.icon} Perfect conditions for outdoor training` : "Indoor training day",
      body: goodOutdoors
        ? `${weather.temp}°F in Montecito — ${wDesc.label}. ${weather.rainPct}% rain. Ideal for a run or outdoor session.`
        : `${wDesc.icon} ${wDesc.label}, ${weather.rainPct}% rain. Keep it indoors today.`,
      action: null,
    },
    {
      icon:"⚡",
      title: strainSoFar > 0
        ? `${strainSoFar.toFixed(1)} strain logged · ${canonicalAhead&&todaySchedule?`${todaySchedule.name} ahead`:"watching load"}`
        : todaySchedule
        ? `${todaySchedule.name} at ${todaySchedule.time} expected`
        : "No workout pattern for today",
      body: (() => {
        const weekTotal = 74.3+strainSoFar;
        const expected = todaySchedule?.strain || 0;
        const projectedDay = strainSoFar + (canonicalAhead ? expected : 0);
        if(strainSoFar === 0 && todaySchedule)
          return `${todaySchedule.freq}% probability of ${todaySchedule.name} based on your history. Projected day strain: ~${projectedDay.toFixed(1)}. Week so far: ${weekTotal.toFixed(0)}.`;
        if(strainSoFar > 0 && canonicalAhead)
          return `${strainSoFar.toFixed(1)} done. ${todaySchedule?.name} still ahead — projected ${projectedDay.toFixed(1)} total today. Week running at ${weekTotal.toFixed(0)} total strain.`;
        return strainSoFar < 5
          ? "Light day so far. A Functional Fitness or tempo run would balance the week — you typically train more on this day."
          : strainSoFar < 12
          ? `${strainSoFar.toFixed(1)} strain complete. One more session or rest — week total ${weekTotal.toFixed(0)}.`
          : `Strong load at ${strainSoFar.toFixed(1)} strain. Cap here unless recovery is green tomorrow.`;
      })(),
      action:"View Calendar", page:"calendar",
    },
    {
      icon:"🌙",
      title:"Last night was excellent",
      body:`${SLEEP.dur}h total · ${SLEEP.perf}% performance. Deep SWS ${SLEEP.deep}h, REM ${SLEEP.rem}h. Respiratory rate ${SLEEP.resp} rpm. Well-rested for today.`,
      action:null,
    },
  ] : isMidday ? [
    {
      icon:"☀️",
      title:"Midday check-in",
      body:`${strainSoFar>0?`${strainSoFar.toFixed(1)} strain logged today.`:"Nothing logged yet."} ${strainSoFar<8?"Still time for a quality afternoon session.":" Good load — consider a walk or rest this afternoon."}`,
      action:"View Fitness", page:"fitness",
    },
    {
      icon:"💧",
      title:"Hydration & nutrition window",
      body:"Post-morning workout — prioritise protein and hydration now. 30–60min post-workout window for protein synthesis. Aim 150–200g protein today.",
      action:null,
    },
    {
      icon:"⚡",
      title:`Week load: ${(74.3+strainSoFar).toFixed(0)} total strain`,
      body:"You're in the peak block of the last 4 weeks. Monitor cumulative fatigue — if recovery drops below 50% tomorrow, scale back.",
      action:"View Trends", page:"trends",
    },
    {
      icon:"🌙",
      title:"Set up tonight for quality sleep",
      body:"Avoid caffeine after 2 PM. Last hard effort before 6 PM to allow core temp to drop. Target 9–9.5h in bed given current training load.",
      action:null,
    },
  ] : isAfternoon ? [
    {
      icon:"⚡",
      title:`${strainSoFar.toFixed(1)} strain logged — ${strainSoFar<8?"room to add one more session":"solid day complete"}`,
      body: strainSoFar<8
        ? "Still time for a strength session or tempo run. Aim to finish by 6 PM to protect sleep onset."
        : "Good day of training. Transition to recovery mode — walk, stretch, or rest.",
      action:"View Fitness", page:"fitness",
    },
    {
      icon:"🌤",
      title: goodOutdoors ? `${weather.temp}°F — good afternoon for a walk` : `${wDesc.icon} ${weather.temp}°F outside`,
      body: goodOutdoors
        ? "Afternoon outdoor activity is ideal for cortisol management and light movement. A 30-40 min walk before dinner optimises blood sugar."
        : `Weather: ${wDesc.label}. Indoor stretching or mobility work would be a good close to the day.`,
      action:null,
    },
    {
      icon:"🍽",
      title:"Pre-sleep nutrition window",
      body:"Aim to finish eating 2–3 hours before sleep. A light protein-carb combo (greek yogurt, fruit) is fine. Avoid alcohol — it suppressed deep SWS last time.",
      action:null,
    },
    {
      icon:"💊",
      title:"Evening supplement timing",
      body:"Magnesium glycinate (300–400mg) 45 min before bed supports deep SWS. Vitamin D earlier in the day. Avoid zinc/B vitamins in the evening.",
      action:null,
    },
  ] : /* evening / night */ [
    {
      icon:"🌙",
      title:"Wind-down mode",
      body:`Training is done for the day. ${strainSoFar>0?`${strainSoFar.toFixed(1)} strain logged.`:""} Dim lights, cool the room to 67–68°F, and aim for bed by 9:30 PM for a 9h sleep window.`,
      action:null,
    },
    {
      icon:"💤",
      title:"Optimise tonight's sleep",
      body:`Last night: ${SLEEP.dur}h, ${SLEEP.perf}% performance. Target same or better tonight. HRV ${HRV}ms — ${HRV>=50?"nervous system recovered":"some residual fatigue present"}. No screens 30min before bed.`,
      action:null,
    },
    {
      icon:"🌅",
      title:(()=>{
        const plan = tomorrowCustom || tomorrowSchedule;
        if(!plan) return "Tomorrow — rest day";
        return `Tomorrow: ${plan.name} at ${plan.time||"TBD"}`;
      })(),
      body:(()=>{
        const plan = tomorrowCustom || tomorrowSchedule;
        const weekTotal = (74.3+strainSoFar).toFixed(0);
        if(!plan) return `Rest day tomorrow. Week strain: ${weekTotal}. Good recovery timing.`;
        const isCustom = !!tomorrowCustom;
        const wakeH = plan.timeH ? Math.max(6, plan.timeH-1) : 6;
        const wakeStr = wakeH < 12 ? `${wakeH}:00 AM` : "6:00 AM";
        return `${isCustom?"Custom plan":"Pattern-based"}: ${plan.name} ${plan.time?`at ${plan.time}`:""}. Target wake ${wakeStr} for ${plan.timeH?"a 9h sleep window. ":""}Week strain: ${weekTotal}.${tomorrowNote?" Note: "+tomorrowNote:""}`;
      })(),
      action:"View Fitness", page:"fitness",
    },
  ];

  // Hero gradient adapts to time of day
  const heroBg =
    isMorning   ? "linear-gradient(135deg, #261D14 0%, #362410 60%, #1E2614 100%)" :
    isMidday    ? "linear-gradient(135deg, #14241E 0%, #1A3020 60%, #20240E 100%)" :
    isAfternoon ? "linear-gradient(135deg, #28180A 0%, #341E0C 60%, #2C1210 100%)" :
                  "linear-gradient(135deg, #14142A 0%, #100E22 60%, #121624 100%)";

  const heroAccent =
    isMorning   ? "rgba(196,120,48,0.22)" :
    isMidday    ? "rgba(58,92,72,0.22)"   :
    isAfternoon ? "rgba(184,90,42,0.22)"  :
                  "rgba(74,96,112,0.22)";

  const SectionDivider = ({label, icon}) => (
    <div style={{display:"flex",alignItems:"center",gap:12,margin:"8px 0 4px"}}>
      <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.muted,
        letterSpacing:"0.14em",textTransform:"uppercase"}}>{icon} {label}</span>
      <div style={{flex:1,height:1,background:P.border,opacity:0.6}}/>
    </div>
  );

  return(
    <div style={S.col18}>
      <div style={{
        background:heroBg, borderRadius:18, padding:"28px 32px",
        position:"relative", overflow:"hidden",
        boxShadow:"0 4px 24px rgba(0,0,0,0.14)",
      }}>
        <div style={{position:"absolute",top:-60,right:-40,width:"min(260px,70vw)",height:"min(260px,70vw)",borderRadius:"50%",
          background:`radial-gradient(circle, ${heroAccent} 0%, transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-50,left:-30,width:180,height:180,borderRadius:"50%",
          background:"radial-gradient(circle, rgba(58,92,72,0.12) 0%, transparent 70%)",pointerEvents:"none"}}/>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
              <span style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.72)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{dateLabel}</span>
              <div style={{width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,0.2)"}}/>
              <span style={{fontFamily:FF.m,fontSize:10,color:"rgba(255,255,255,0.55)"}}>{timeLabel}</span>
            </div>
            <div style={{fontFamily:FF.r,fontSize:46,fontWeight:600,color:P.textInv,letterSpacing:"-0.02em",lineHeight:1,marginBottom:8}}>
              {greeting}<br/>Nate.
            </div>
            <div style={{fontFamily:FF.s,fontSize:13,color:"rgba(255,255,255,0.80)",marginTop:8,maxWidth:380,lineHeight:1.6}}>
              {isMorning && `Recovery ${recLabel(REC).toLowerCase()} today · ${SLEEP.dur}h of quality sleep last night.`}
              {isMidday  && `${strainSoFar>0?`${strainSoFar.toFixed(1)} strain already logged.`:"No workouts yet today."} HRV ${HRV}ms.`}
              {isAfternoon && `${strainSoFar>0?`${strainSoFar.toFixed(1)} strain today.`:"Rest day so far."} Transition to recovery mode.`}
              {isEvening && `${strainSoFar>0?`${strainSoFar.toFixed(1)} strain today.`:"Rest day."} Wind-down and optimise tonight's sleep.`}
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0,minWidth:140}}>
            <div style={{fontFamily:FF.r,fontSize:60,fontWeight:600,color:P.textInv,lineHeight:1,letterSpacing:"-0.03em"}}>{weather.temp}°</div>
            <div style={{fontFamily:FF.s,fontSize:13,color:"rgba(255,255,255,0.85)",marginTop:3}}>{wDesc.icon} {wDesc.label}</div>
            <div style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.62)",marginTop:4}}>
              Feels {weather.feels}° · H{weather.high}° · {weather.wind} mph
            </div>
            <div style={{fontFamily:FF.s,fontSize:10,color:weather.rainPct>30?"#C4604A":"rgba(255,255,255,0.3)",marginTop:2}}>
              {weather.rainPct}% chance of rain
            </div>
            <div style={{fontFamily:FF.s,fontSize:9,color:"rgba(255,255,255,0.52)",marginTop:3}}>Montecito · 93108</div>
          </div>
        </div>
        <div style={{display:"flex",gap:2,flexWrap:"wrap",marginTop:22,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.18)"}}>
          {[
            {label:"Recovery",   val:`${REC}%`,        color:rc},
            {label:"HRV",        val:`${HRV} ms`,       color:"rgba(255,255,255,0.90)"},
            {label:"Resting HR", val:`${RHR} bpm`,      color:"rgba(255,255,255,0.65)"},
            {label:"Sleep",      val:`${SLEEP.perf}%`,  color:"#7AC49A"},
            {label:"Strain today",val:strainSoFar>0?strainSoFar.toFixed(1):"—", color:strainSoFar>15?"#C4604A":strainSoFar>8?"#C47830":"rgba(255,255,255,0.90)"},
          ].map(({label,val,color},i)=>(
            <div key={i} style={{flex:1,padding:"12px 16px",background:"rgba(255,255,255,0.08)",borderRadius:10}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.60)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{label}</div>
              <div style={{fontFamily:FF.r,fontSize:26,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
            </div>
          ))}
          {/* WHOOP live status pill */}
          {whoopStatus==="connected"&&(
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(58,156,104,0.12)",borderRadius:8,border:"1px solid rgba(58,156,104,0.25)",alignSelf:"center",flexShrink:0}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#3A9C68",boxShadow:"0 0 5px #3A9C68"}}/>
              <span style={{fontFamily:FF.s,fontSize:8,color:"#7AC49A",fontWeight:600,letterSpacing:"0.08em"}}>LIVE</span>
            </div>
          )}
          {whoopStatus==="disconnected"&&(
            <a href="/api/whoop/login" style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(255,255,255,0.06)",borderRadius:8,border:"1px solid rgba(255,255,255,0.12)",textDecoration:"none",alignSelf:"center",flexShrink:0}}>
              <span style={{fontSize:10}}>⌚</span>
              <span style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.45)",letterSpacing:"0.06em"}}>Connect WHOOP</span>
            </a>
          )}
          {whoopStatus==="stale"&&(
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(196,120,48,0.10)",borderRadius:8,border:"1px solid rgba(196,120,48,0.22)",alignSelf:"center",flexShrink:0}}>
              <span style={{fontSize:10}}>⚠</span>
              <span style={{fontFamily:FF.s,fontSize:8,color:"#C47830",letterSpacing:"0.06em"}}>Stale data</span>
            </div>
          )}
        </div>

      </div>
      {!isEvening ? (
          <>
            <SectionDivider label="Morning Brief" icon="🌅"/>
            {(()=>{
              const hrv = WHOOP.hrv;
              const rec = WHOOP.recovery;
              const rhr = WHOOP.rhr;
              const HRV_MEAN = 44.4;
              const zone =
                hrv >= HRV_MEAN+5  ? {label:"Peak",     color:"#5BC4F0", tip:"Push hard — nervous system primed."} :
                hrv >= HRV_MEAN-3  ? {label:"Normal",   color:"#3A9C68", tip:"Train as planned."} :
                hrv >= HRV_MEAN-10 ? {label:"Reduced",  color:"#C4604A", tip:"Moderate intensity only."} :
                                     {label:"Low",      color:"#8B2020", tip:"Recovery day — skip hard efforts."};
              return(
                <div style={{background:`linear-gradient(135deg,${zone.color}12,${P.card})`,
                  borderRadius:16,padding:"20px 24px",
                  border:`1px solid ${zone.color}30`,
                  boxShadow:`0 2px 16px ${zone.color}14`}}>

                  {/* Top row: zone + HRV gauge */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
                    <div>
                      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.10em",
                        textTransform:"uppercase",marginBottom:6}}>Readiness Zone</div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:zone.color,
                          boxShadow:`0 0 10px ${zone.color}88`,flexShrink:0}}/>
                        <span style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:zone.color,
                          letterSpacing:"-0.01em"}}>{zone.label}</span>
                      </div>
                      <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,marginTop:5,lineHeight:1.5}}>{zone.tip}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:4}}>HRV today vs baseline</div>
                      <div style={{display:"flex",alignItems:"baseline",gap:5,justifyContent:"flex-end"}}>
                        <span style={{fontFamily:FF.r,fontSize:36,fontWeight:600,color:zone.color,
                          letterSpacing:"-0.02em",lineHeight:1}}>{hrv}</span>
                        <span style={{fontFamily:FF.s,fontSize:10,color:P.muted}}>ms</span>
                        <span style={{fontFamily:FF.s,fontSize:11,color:hrv>=HRV_MEAN?P.sage:P.terra,
                          fontWeight:600,marginLeft:4}}>
                          {hrv>=HRV_MEAN?"+":""}{(hrv-HRV_MEAN).toFixed(1)} vs avg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Three stat columns */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    {[
                      {label:"Recovery",val:`${rec}%`,
                        sub:rec>=76?"Above avg":rec>=58?"Normal":"Below avg",
                        color:rec>=76?P.sage:rec>=58?P.amber:P.terra},
                      {label:"Resting HR",val:`${rhr} bpm`,
                        sub:rhr<=48?"Excellent":rhr<=52?"Normal":"Elevated",
                        color:rhr<=48?P.sage:rhr<=52?P.amber:P.terra},
                      {label:"Sleep last night",val:`${WHOOP.sleep.hours}h`,
                        sub:`${WHOOP.sleep.score}% performance`,
                        color:WHOOP.sleep.score>=90?P.sage:WHOOP.sleep.score>=80?P.steel:P.amber},
                    ].map(({label,val,sub,color})=>(
                      <div key={label} style={{padding:"12px 14px",background:"rgba(255,255,255,0.5)",
                        backdropFilter:"blur(4px)",borderRadius:12}}>
                        <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,
                          letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{label}</div>
                        <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color,
                          letterSpacing:"-0.01em",lineHeight:1,marginBottom:3}}>{val}</div>
                        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>{sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          /* Evening: sleep + tomorrow preview */
          <>
          <SectionDivider label="Tonight" icon="🌙"/>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:P.cardDk,border:`1px solid ${P.borderDk}`,borderRadius:16,padding:"18px",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Tonight's Schedule</div>
              {(()=>{
               
                const wakeH = tomorrowSchedule ? Math.max(6, tomorrowSchedule.timeH - 1) : 6;
                const wakeStr = wakeH < 12 ? `${wakeH}:00 AM` : `${wakeH-12}:00 PM`;
                const bedH = wakeH - 9; // 9h sleep window
                const bedStr = bedH <= 0 ? `${12+bedH}:00 AM` : `${bedH}:00 PM`;
                return([
                  {time:"9:00 PM",  action:"Wind-down — dim lights, cool room to 68°F"},
                  {time:"9:30 PM",  action:"Magnesium glycinate (400mg), no screens"},
                  {time:bedStr,     action:"Target sleep onset — 9h window"},
                  {time:wakeStr,    action:tomorrowSchedule
                    ? `Wake for ${tomorrowSchedule.name} at ${tomorrowSchedule.time}`
                    : "Wake target — natural light immediately"},
                  ...(tomorrowSchedule?[{
                    time:tomorrowSchedule.time,
                    action:`${tomorrowSchedule.name} · ~${tomorrowSchedule.dur}m · avg ${tomorrowSchedule.strain} strain`,
                    highlight:true,
                  }]:[]),
                ].map(({time,action,highlight})=>(
                  <div key={time} style={{display:"flex",gap:12,marginBottom:8,alignItems:"flex-start"}}>
                    <span style={{fontFamily:FF.m,fontSize:9,color:highlight?"#7AC49A":P.amber,minWidth:55,marginTop:1,flexShrink:0}}>{time}</span>
                    <span style={{fontFamily:FF.s,fontSize:10,color:highlight?"#A8D8B8":P.sub,lineHeight:1.5,fontWeight:highlight?500:400}}>{action}</span>
                    {highlight&&<span style={{fontSize:10,flexShrink:0}}>{tomorrowSchedule?.icon}</span>}
                  </div>
                )));
              })()}
              <div style={{marginTop:8,padding:"8px 10px",background:"rgba(255,255,255,0.05)",borderRadius:7,fontFamily:FF.s,fontSize:9,color:P.mutedDk}}>
                Last night: {SLEEP.dur}h · {SLEEP.perf}% performance
              </div>
            </div>
            <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>{tomorrowDayName} · Anticipated</div>
                <button onClick={()=>setTomorrowEditing(!tomorrowEditing)}
                  style={{fontFamily:FF.s,fontSize:9,padding:"3px 10px",borderRadius:6,border:`1px solid ${P.border}`,background:tomorrowEditing?P.cardDk:P.panel,color:tomorrowEditing?P.textInv:P.sub,cursor:"pointer"}}>
                  {tomorrowEditing?"Done":"Edit plan"}
                </button>
              </div>

              {tomorrowEditing?(
                /* Edit mode */
                <div>
                  <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,marginBottom:8}}>What are you planning tomorrow?</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                    {[
                      {name:"Functional Fitness",icon:"🏋",color:"#3A5C48"},
                      {name:"Running",            icon:"🏃",color:"#C47830"},
                      {name:"Spin",               icon:"🚴",color:"#C4604A"},
                      {name:"Walking",            icon:"🚶",color:"#7A5A80"},
                      {name:"Rest day",           icon:"😴",color:"#6B6057"},
                    ].map(w=>{
                      const isSelected = tomorrowCustom?.name===w.name;
                      return(
                        <div key={w.name} onClick={()=>setTomorrowCustom(isSelected?null:w)}
                          style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:7,cursor:"pointer",
                            background:isSelected?w.color+"18":P.panel,
                            border:`1px solid ${isSelected?w.color+"55":P.border}`,transition:"all .15s"}}>
                          <span style={{fontSize:13}}>{w.icon}</span>
                          <span style={{fontFamily:FF.s,fontSize:10,fontWeight:isSelected?600:400,color:isSelected?w.color:P.sub}}>{w.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <textarea value={tomorrowNote} onChange={e=>setTomorrowNote(e.target.value)}
                    placeholder="Add a note (e.g. 7am with Jake, targeting tempo pace...)"
                    style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${P.border}`,
                      background:P.panel,fontFamily:FF.s,fontSize:10,color:P.text,resize:"none",
                      outline:"none",lineHeight:1.5,boxSizing:"border-box"}}
                    rows={2}/>
                </div>
              ):(
                /* Display mode */
                <div>
                  {(()=>{
                    const plan = tomorrowCustom || tomorrowSchedule;
                    if(!plan) return <div style={S.mut10}>No workout pattern for {tomorrowDayName}.</div>;
                    const isCustom = !!tomorrowCustom;
                    return(
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:plan.color+"0D",borderRadius:10,border:`1px solid ${plan.color}22`}}>
                        <span style={{fontSize:22}}>{plan.icon}</span>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            <span style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.text}}>{plan.name}</span>
                            {!isCustom&&<span style={{fontFamily:FF.m,fontSize:8,color:plan.color,background:plan.color+"18",padding:"1px 6px",borderRadius:4}}>{plan.freq}%</span>}
                            {isCustom&&<span style={{fontFamily:FF.s,fontSize:8,color:P.sage,background:P.sageBg,padding:"1px 6px",borderRadius:4}}>Custom</span>}
                          </div>
                          <div style={S.mut9}>
                            {isCustom
                              ? (tomorrowNote||"Tap 'Edit plan' to add details")
                              : `${plan.time} · ~${plan.dur}m · ${plan.strain} avg strain · ${plan.freq}% frequency`}
                          </div>
                          {tomorrowNote&&isCustom&&<div style={{fontFamily:FF.s,fontSize:9,color:P.sub,marginTop:3}}>📝 {tomorrowNote}</div>}
                        </div>
                      </div>
                    );
                  })()}
                  {!tomorrowCustom&&tomorrowSchedule&&(
                    <div style={{marginTop:8,fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.5}}>
                      Pattern-based prediction from your training history. Tap "Edit plan" to override.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </>
        )}
        <SectionDivider label="Training" icon="🏋"/>
      <div style={CS(16,"20px","0 1px 4px rgba(0,0,0,.05)")}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:16}}>
            {isMorning?"Today's Training Plan":isEvening?"Today's Training Recap":"Training · Today"}
          </div>
          {doneToday.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.sage,fontWeight:600,marginBottom:6}}>✓ Completed</div>
              {doneToday.map((w,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 11px",background:w.color+"0D",borderRadius:10,border:`1px solid ${w.color}20`,marginBottom:6}}>
                  <span style={{fontSize:18,lineHeight:1}}>{w.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>{w.name}</span>
                      <span style={S.mut9}>{w.time}</span>
                    </div>
                    <div style={{fontFamily:FF.m,fontSize:9,color:P.muted}}>{w.dur}m · {w.cal} cal</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.sage}}>{w.strain}</div>
                    <div style={{fontFamily:FF.s,fontSize:7,color:P.muted}}>strain</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isEvening&&planned.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.amber,fontWeight:600,marginBottom:6}}>
                {planned[0].isCanonical ? `Expected · ${planned[0].time}` : "Alternative"}
              </div>
              {planned.map((w,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 11px",background:w.color+"08",borderRadius:10,border:`1px dashed ${w.color}44`,marginBottom:6}}>
                  <span style={{fontSize:18,lineHeight:1,opacity:.7}}>{w.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={S.rowsb}>
                      <span style={{fontFamily:FF.s,fontSize:11,fontWeight:500,color:P.sub}}>{w.name}</span>
                      {w.freq&&<span style={{fontFamily:FF.m,fontSize:8,color:w.color,background:w.color+"18",padding:"1px 6px",borderRadius:4}}>{w.freq}%</span>}
                    </div>
                    <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {doneToday.length===0&&(
            <div style={{padding:"14px",background:P.panel,borderRadius:10,border:`1px solid ${P.border}`,marginBottom:12}}>
              <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6}}>
                {isEvening?"Rest day — muscle protein synthesis peaks on recovery days. Tonight's sleep is the training.":"No workouts logged yet. "+(isMorning?"Ready when you are.":"Still time for a session today.")}
              </div>
            </div>
          )}
          {isMorning&&(
            <div>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:6}}>Yesterday</div>
              {yesterday.map((w,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 11px",background:P.panel,borderRadius:9,border:`1px solid ${P.border}`,marginBottom:4}}>
                  <span style={{fontSize:16,lineHeight:1}}>{w.icon}</span>
                  <div style={{flex:1}}>
                    <span style={S.sub10}>{w.name}</span>
                    <span style={{fontFamily:FF.m,fontSize:9,color:P.muted,marginLeft:8}}>{w.dur}m · {w.strain} strain</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      <SectionDivider label="Your Day" icon="📅"/>
      <div style={CS(16,"20px","0 1px 4px rgba(0,0,0,.05)")}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>
              {calLabel2==="tomorrow"?"Tomorrow":"Today"}
            </div>
            <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.text}}>Schedule</div>
          </div>
          <div style={{textAlign:"right"}}>
            {calEvents===null&&(
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:P.amber,opacity:0.6}}/>
                <span style={S.mut9}>Loading…</span>
              </div>
            )}
            {calEvents&&(
              <>
                <div style={{fontFamily:FF.r,fontSize:30,fontWeight:600,color:P.amber,
                  letterSpacing:"-0.02em",lineHeight:1}}>{calEvents.length}</div>
                <div style={S.mut9}>
                  event{calEvents.length!==1?"s":""}
                </div>
              </>
            )}
          </div>
        </div>
        {calEvents&&calEvents.length>0&&(
          <div style={S.col7}>
            {calEvents.map((ev,i)=>{
              const col = calColor(ev.calendar);
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,
                  padding:"9px 11px",borderRadius:10,
                  background:P.panel,border:`1px solid ${P.border}`}}>
                  <div style={{width:3,alignSelf:"stretch",borderRadius:2,
                    background:col,flexShrink:0,minHeight:20}}/>
                  <div style={{flexShrink:0,minWidth:58}}>
                    <div style={{fontFamily:FF.m,fontSize:10,fontWeight:600,color:col}}>
                      {ev.allDay?"All day":fmtEvtTime(ev.start)}
                    </div>
                    {!ev.allDay&&ev.end&&(
                      <div style={{fontFamily:FF.m,fontSize:8,color:P.muted}}>
                        – {fmtEvtTime(ev.end)}
                      </div>
                    )}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.summary}</div>
                    {ev.location&&(
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:1,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        📍 {ev.location}
                      </div>
                    )}
                  </div>
                  <div style={{fontFamily:FF.s,fontSize:7.5,fontWeight:600,color:col,
                    background:col+"14",padding:"2px 6px",borderRadius:4,
                    flexShrink:0,letterSpacing:"0.04em"}}>
                    {calLabel(ev.calendar)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {calEvents&&calEvents.length===0&&!calError&&(
          <div style={{padding:"16px",background:P.panel,borderRadius:10,textAlign:"center"}}>
            <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.sage,marginBottom:4}}>Clear day ✓</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>No events scheduled. Good window for deep work or training.</div>
          </div>
        )}
        {calError&&(
          <div style={{fontFamily:FF.s,fontSize:10,color:P.terra,padding:"9px 12px",
            borderRadius:8,background:P.terracottaBg,border:`1px solid ${P.terra}33`}}>
            ⚠ Calendar unavailable — {calError}
          </div>
        )}
      </div>
      <SectionDivider label="Numbers" icon="📊"/>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>7-Day Trend</div>
            <div style={{fontFamily:FF.r,fontSize:14,fontWeight:600,color:P.text}}>Recovery · HRV</div>
          </div>
          <div style={{display:"flex",gap:12}}>
            {[{c:"#3A5C48",l:"Recovery %"},{c:"#4A6070",l:"HRV ms",dash:"4 2"}].map(({c,l,dash})=>(
              <div key={l} style={S.row5}>
                <svg width={14} height={2}><line x1={0} y1={1} x2={14} y2={1} stroke={c} strokeWidth={2} strokeDasharray={dash}/></svg>
                <span style={S.mut9}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={95}>
          <LineChart data={recTrend} margin={{top:4,right:8,left:-24,bottom:0}}>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax}/>
            <YAxis yAxisId="rec" {...ax} domain={[0,100]}/>
            <YAxis yAxisId="hrv" orientation="right" {...ax} domain={[20,80]}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:4,fontSize:9,textTransform:"uppercase"}}>{label}</div>{payload.map(p=><div key={p.name} style={{display:"flex",gap:8,marginBottom:2}}><span style={{color:p.color,minWidth:70}}>{p.name}</span><span style={{fontFamily:FF.m,color:P.text}}>{p.value}</span></div>)}</div>):null}/>
            <ReferenceLine yAxisId="rec" y={80} stroke="#3A5C48" strokeDasharray="3 3" strokeOpacity={0.35}/>
            <Line yAxisId="rec" type="monotone" dataKey="rec" stroke="#3A5C48" strokeWidth={2} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out"
              dot={(p)=><circle key={p.index} cx={p.cx} cy={p.cy} r={p.index===6?5:3} fill={recColor(p.value)} stroke={P.card} strokeWidth={1.5}/>}
              name="Recovery"/>
            <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke="#4A6070" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="HRV ms" isAnimationActive={true} animationDuration={1100} animationEasing="ease-out"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <SectionDivider label={
        isMorning?"Morning Guidance":
        isEvening?"Evening Guidance":
        "Afternoon Guidance"
      } icon={isMorning?"🌤":isEvening?"🌙":"☀"}/>
      <div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:11}}>
          {guidance.map((g,i)=>(
            <div key={i} onClick={g.page?()=>setPage(g.page):undefined}
              style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"15px",cursor:g.page?"pointer":"default",
                transition:"box-shadow .15s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}
              onMouseEnter={e=>{if(g.page)e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.09)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:17,lineHeight:1}}>{g.icon}</span>
                  <span style={{fontFamily:FF.s,fontWeight:600,fontSize:13,color:P.text}}>{g.title}</span>
                </div>
                {g.action&&<span style={{fontFamily:FF.s,fontSize:9,color:P.steel,whiteSpace:"nowrap",marginLeft:8,flexShrink:0}}>{g.action} →</span>}
              </div>
              <div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.70}}>{g.body}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:16,alignItems:"stretch"}}>
        <div onClick={()=>setPage("score")} style={{background:P.cardDk,borderRadius:16,padding:"18px 24px",cursor:"pointer",
          transition:"box-shadow .15s",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:130}}
          onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.15)"}
          onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.08)"}>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Today's Status</div>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>VITAL Score</div>
          <div style={{fontFamily:FF.r,fontSize:58,fontWeight:600,color:P.textInv,lineHeight:1,letterSpacing:"-0.03em"}}>{SCORES_NOW.master.score}</div>
          <div style={{fontFamily:FF.s,fontSize:10,color:P.amber,marginTop:6,fontWeight:500}}>{SCORE_LABEL(SCORES_NOW.master.score)}</div>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,marginTop:8,opacity:0.6}}>Tap for full report →</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
          {[
            {icon:"⚡",label:"Health Score",sub:`${SCORES_NOW.master.score}/100`,    page:"score",   flag:false},
            {icon:"🏃",label:"Fitness",     sub:"8W · 95.2 peak", page:"fitness", flag:false},
            {icon:"📅",label:"Calendar",    sub:"Mar activity",   page:"calendar",flag:false},
            {icon:"🧬",label:"Labs",        sub:"May 23 · 3 flags",page:"labs",   flag:true},
            {icon:"📐",label:"Body Comp",   sub:"DXA Jan 2026",   page:"body",    flag:false},
            {icon:"⊞",label:"Overview",    sub:"All metrics",    page:"overview",flag:false},
          ].map(({icon,label,sub,page,flag})=>(
            <div key={label} onClick={()=>setPage(page)} style={{background:P.card,border:`1px solid ${flag?P.terra+"44":P.border}`,borderRadius:12,
              padding:"12px 14px",cursor:"pointer",transition:"all .15s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.08)";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)";e.currentTarget.style.transform="none";}}>
              <div style={{fontSize:18,marginBottom:6}}>{icon}</div>
              <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:flag?P.terra:P.text,marginBottom:2}}>{label}</div>
              <div style={S.mut9}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Overview now lives in src/pages/Overview.jsx

// LAB_HISTORY, LAB_REFS, PANEL_TREND_KEYS now live in src/lib/data/labs.js
