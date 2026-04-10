// Personal Bests page — running and lifting PRs with age-graded scoring.
import { useState } from "react";
import { P, FF, S } from "../lib/theme.js";
import { SLabel } from "../components/shared.jsx";
import { HUME_DATA } from "../lib/data/body.js";

// Running: based on WMA age-grading factors + USATF standards for M45-49
// Lifting: based on ExRx strength standards for 200-215 lb male (age-adjusted -15% from open)
// Score = 0-100 where 100 = world-class age-group performance

function scoreRunning(eventKey, timeStr) {
  if (!timeStr || timeStr.trim() === "") return null;
  // Parse time string: mm:ss or h:mm:ss
  const parts = timeStr.split(":").map(Number);
  let secs = 0;
  if (parts.length === 2) secs = parts[0]*60 + parts[1];
  else if (parts.length === 3) secs = parts[0]*3600 + parts[1]*60 + parts[2];
  else return null;
  if (isNaN(secs) || secs <= 0) return null;

  // [worldClass, excellent, good, average, belowAvg] in seconds for 47yo male
  const BENCHMARKS = {
    mile:   [268, 330, 390, 480, 600],        // 4:28, 5:30, 6:30, 8:00, 10:00
    fiveK:  [960, 1170, 1380, 1680, 2100],    // 16:00, 19:30, 23:00, 28:00, 35:00
    tenK:   [1980, 2430, 2880, 3480, 4320],   // 33:00, 40:30, 48:00, 58:00, 72:00
    halfM:  [4500, 5400, 6300, 7800, 9600],   // 1:15, 1:30, 1:45, 2:10, 2:40
  };
  const b = BENCHMARKS[eventKey];
  if (!b) return null;
  const [wc, exc, good, avg, bad] = b;
  // Lower time = better for running
  if (secs <= wc)  return 97;
  if (secs <= exc) return Math.round(80 + (exc-secs)/(exc-wc)*17);
  if (secs <= good)return Math.round(60 + (good-secs)/(good-exc)*20);
  if (secs <= avg) return Math.round(40 + (avg-secs)/(avg-good)*20);
  if (secs <= bad) return Math.round(20 + (bad-secs)/(bad-avg)*20);
  return Math.max(5, Math.round(15 - (secs-bad)/60*2));
}

function scoreLifting(eventKey, weightLbs, bodyweightLbs) {
  if (!weightLbs || weightLbs <= 0) return null;
  const bw = bodyweightLbs || 213;
  const ratio = weightLbs / bw;

 
  // [worldClass, excellent, good, average, belowAvg] as bodyweight multiples
  const BENCHMARKS = {
    bench:    [1.55, 1.30, 1.05, 0.80, 0.55],
    squat:    [2.10, 1.75, 1.40, 1.05, 0.75],
    deadlift: [2.55, 2.10, 1.70, 1.30, 0.95],
  };
  const b = BENCHMARKS[eventKey];
  if (!b) return null;
  const [wc, exc, good, avg, bad] = b;
  // Higher ratio = better for lifting
  if (ratio >= wc)  return 97;
  if (ratio >= exc) return Math.round(80 + (ratio-exc)/(wc-exc)*17);
  if (ratio >= good)return Math.round(60 + (ratio-good)/(exc-good)*20);
  if (ratio >= avg) return Math.round(40 + (ratio-avg)/(good-avg)*20);
  if (ratio >= bad) return Math.round(20 + (ratio-bad)/(avg-bad)*20);
  return Math.max(5, Math.round(15 * (ratio/bad)));
}

function formatRunTime(secs) {
  if (!secs) return "";
  const h = Math.floor(secs/3600);
  const m = Math.floor((secs%3600)/60);
  const s = secs%60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${m}:${String(s).padStart(2,"0")}`;
}

function pbLabel(score) {
  if (!score) return {label:"—",color:"#999"};
  if (score >= 90) return {label:"World Class",color:"#5BC4F0"};
  if (score >= 80) return {label:"Elite",      color:"#3A9C68"};
  if (score >= 65) return {label:"Excellent",  color:"#3A9C68"};
  if (score >= 50) return {label:"Good",       color:"#C47830"};
  if (score >= 35) return {label:"Average",    color:"#C4604A"};
  return               {label:"Developing",   color:"#8B3A3A"};
}

const STORAGE_KEY = "vital_pbs_v1";

export function PersonalBestsPage({setPage}) {

  const loadSaved = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };

  const [bests,   setBests]   = useState(loadSaved);
  const [goals,   setGoals]   = useState(()=>{
    try{ const r=localStorage.getItem(STORAGE_KEY+"_goals"); return r?JSON.parse(r):{}; }catch{ return {}; }
  });
  const [editing,    setEditing]    = useState(null);
  const [editVal,    setEditVal]    = useState("");
  const [goalEdit,   setGoalEdit]   = useState(null);   // key with goal slider open
  const [goalDraft,  setGoalDraft]  = useState("");
  const bodyweight = HUME_DATA[0]?.wt || 213;

  const save = (key, val) => {
    const next = {...bests, [key]: val};
    setBests(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setEditing(null);
    setEditVal("");
  };

  const RUNNING_EVENTS = [
    { key:"mile",  label:"Mile",          placeholder:"5:45",  hint:"mm:ss",      icon:"🏃" },
    { key:"fiveK", label:"5K",            placeholder:"23:30", hint:"mm:ss",      icon:"🏃" },
    { key:"tenK",  label:"10K",           placeholder:"49:00", hint:"mm:ss",      icon:"🏃" },
    { key:"halfM", label:"Half Marathon", placeholder:"1:50:00",hint:"h:mm:ss",   icon:"🏃" },
  ];

  const LIFTING_EVENTS = [
    { key:"bench",    label:"Bench Press", placeholder:"185",  hint:"lbs", icon:"🏋" },
    { key:"squat",    label:"Back Squat",  placeholder:"225",  hint:"lbs", icon:"🏋" },
    { key:"deadlift", label:"Deadlift",    placeholder:"275",  hint:"lbs", icon:"🏋" },
  ];

  // Compute scores
  const scores = {};
  RUNNING_EVENTS.forEach(e => {
    scores[e.key] = bests[e.key] ? scoreRunning(e.key, bests[e.key]) : null;
  });
  LIFTING_EVENTS.forEach(e => {
    const lbs = parseFloat(bests[e.key]);
    scores[e.key] = lbs > 0 ? scoreLifting(e.key, lbs, bodyweight) : null;
  });

  const validScores = Object.values(scores).filter(s => s !== null);
  const overallScore = validScores.length > 0
    ? Math.round(validScores.reduce((a,b)=>a+b,0)/validScores.length)
    : null;

  // Arc ring for overall score
  const ARC_R = 44, ARC_C = 2*Math.PI*ARC_R;
  const arcDash = overallScore ? ARC_C*(overallScore/100) : 0;
  const arcCol = overallScore ? (overallScore>=80?P.sage:overallScore>=60?P.amber:P.terra) : P.border;

  // Benchmark rows for tooltip reference
  const RUNNING_REFS = {
    mile:  [{l:"World class",t:"4:28"},{l:"Excellent",t:"5:30"},{l:"Good",t:"6:30"},{l:"Average",t:"8:00"}],
    fiveK: [{l:"World class",t:"16:00"},{l:"Excellent",t:"19:30"},{l:"Good",t:"23:00"},{l:"Average",t:"28:00"}],
    tenK:  [{l:"World class",t:"33:00"},{l:"Excellent",t:"40:30"},{l:"Good",t:"48:00"},{l:"Average",t:"58:00"}],
    halfM: [{l:"World class",t:"1:15"},{l:"Excellent",t:"1:30"},{l:"Good",t:"1:45"},{l:"Average",t:"2:10"}],
  };
  const LIFTING_REFS = {
    bench:    [{l:"World class",t:"1.55× BW"},{l:"Excellent",t:"1.30×"},{l:"Good",t:"1.05×"},{l:"Average",t:"0.80×"}],
    squat:    [{l:"World class",t:"2.10× BW"},{l:"Excellent",t:"1.75×"},{l:"Good",t:"1.40×"},{l:"Average",t:"1.05×"}],
    deadlift: [{l:"World class",t:"2.55× BW"},{l:"Excellent",t:"2.10×"},{l:"Good",t:"1.70×"},{l:"Average",t:"1.30×"}],
  };

  const EventCard = ({event, isLifting}) => {
    const val    = bests[event.key] || "";
    const goal   = goals[event.key] || "";
    const score  = scores[event.key];
    const {label:sl, color:sc} = pbLabel(score);
    const isEdit     = editing  === event.key;
    const isGoalOpen = goalEdit === event.key;
    const refs   = isLifting ? LIFTING_REFS[event.key] : RUNNING_REFS[event.key];
    const bwMult = (isLifting && val) ? (parseFloat(val)/bodyweight).toFixed(2)+"× BW" : null;

    // Goal progress calculation
    const parseTime = s => { const p=s.split(":").map(Number); return p.length===2?p[0]*60+p[1]:p[0]*3600+p[1]*60+p[2]; };
    const goalPct = (() => {
      if(!goal || !val) return null;
      if(isLifting){
        const cur=parseFloat(val), tgt=parseFloat(goal);
        if(!cur||!tgt) return null;
        return Math.min(100, Math.round((cur/tgt)*100));
      } else {
        // Running: lower is better
        try{
          const cur=parseTime(val), tgt=parseTime(goal);
          if(!cur||!tgt) return null;
          // pct = how close cur is to tgt — if cur <= tgt → 100%
          // scale: at 2× goal time = 0%, at goal time = 100%
          const pct = Math.min(100, Math.max(0, Math.round((1-(cur-tgt)/(tgt))*100)));
          return cur<=tgt ? 100 : pct;
        }catch{return null;}
      }
    })();
    // Slider config
    const sliderCfg = isLifting
      ? { min:45, max:500, step:5,   unit:"lbs",    fmt:(v)=>v+"lbs" }
      : { min:300,max:7200,step:15,  unit:"min:sec", fmt:(v)=>`${Math.floor(v/60)}:${String(v%60).padStart(2,"0")}` };

    return (
      <div style={{background:P.card,border:`1px solid ${score?sc+"44":P.border}`,borderRadius:14,
        padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.05)",transition:"border-color .2s"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:9,background:score?sc+"14":P.panel,
              border:`1px solid ${score?sc+"30":P.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
              {event.icon}
            </div>
            <div>
              <div style={{fontFamily:FF.s,fontSize:12,fontWeight:700,color:P.text}}>{event.label}</div>
              <div style={S.mut8}>47yo male · age-graded</div>
            </div>
          </div>
          {score && (
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:FF.r,fontSize:28,fontWeight:600,color:sc,lineHeight:1,letterSpacing:"-0.02em"}}>{score}</div>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:sc,marginTop:1}}>{sl}</div>
            </div>
          )}
        </div>

        {/* Progress bar — score if no goal, goal-progress if goal set */}
        {(score||goalPct!==null) && (
          <div style={{marginBottom:10}}>
            {goalPct!==null&&(
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted}}>Goal: <span style={{color:P.amber,fontWeight:600}}>{goal}{isLifting?" lbs":""}</span></div>
                <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:goalPct>=100?P.sage:P.amber}}>{goalPct>=100?"✓ Achieved!":goalPct+"%"}</div>
              </div>
            )}
            <div style={{height:5,borderRadius:3,background:P.panel,overflow:"hidden",border:`1px solid ${P.border}`}}>
              <div style={{height:"100%",
                width:`${goalPct!==null?goalPct:score}%`,
                background:`linear-gradient(to right,${goalPct!==null?(goalPct>=100?P.sage:P.amber)+"bb":(sc+"bb")},${goalPct!==null?(goalPct>=100?P.sage:P.amber):sc})`,
                borderRadius:3,transition:"width 0.8s cubic-bezier(0.34,1.1,0.64,1)"}}/>
            </div>
          </div>
        )}
        {isEdit ? (
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input
              autoFocus
              type="text"
              value={editVal}
              onChange={e=>setEditVal(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")save(event.key,editVal);if(e.key==="Escape"){setEditing(null);setEditVal("");}}}
              placeholder={event.placeholder}
              style={{flex:1,padding:"8px 12px",borderRadius:8,border:`2px solid ${P.amber}`,
                fontFamily:FF.m,fontSize:14,background:P.panel,color:P.text,outline:"none"}}
            />
            <button onClick={()=>save(event.key,editVal)}
              style={{padding:"8px 14px",borderRadius:8,border:"none",background:P.sage,
                color:"#fff",fontFamily:FF.s,fontSize:11,fontWeight:700,cursor:"pointer"}}>Save</button>
            <button onClick={()=>{setEditing(null);setEditVal("");}}
              style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${P.border}`,background:P.panel,
                color:P.muted,fontFamily:FF.s,fontSize:11,cursor:"pointer"}}>✕</button>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              {val ? (
                <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                  <div style={{fontFamily:FF.m,fontSize:22,fontWeight:600,color:score?sc:P.text,lineHeight:1}}>{val}</div>
                  <div style={S.mut10}>{isLifting?"lbs":""}</div>
                  {bwMult&&<div style={S.mut9}>{bwMult}</div>}
                </div>
              ) : (
                <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,fontStyle:"italic"}}>Not logged yet</div>
              )}
            </div>
            <button onClick={()=>{setEditing(event.key);setEditVal(val);}}
              style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${P.border}`,
                background:P.panel,fontFamily:FF.s,fontSize:10,fontWeight:600,
                color:P.sub,cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=P.card;e.currentTarget.style.borderColor=P.amber;}}
              onMouseLeave={e=>{e.currentTarget.style.background=P.panel;e.currentTarget.style.borderColor=P.border;}}>
              {val?"Edit":"+ Log"}
            </button>
          </div>
        )}
        {/* Goal setter */}
        {isGoalOpen ? (
          <div style={{marginTop:10,padding:"12px 14px",background:P.panel,borderRadius:10,
            border:`1px solid ${P.amber}44`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>
                Set Goal {isLifting?"(lbs)":"(time)"}
              </div>
              <button onClick={()=>{setGoalEdit(null);setGoalDraft("");}}
                style={{background:"none",border:"none",cursor:"pointer",color:P.muted,fontSize:14}}>✕</button>
            </div>
            {isLifting ? (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={S.mut9}>Target weight</span>
                  <span style={{fontFamily:FF.m,fontSize:13,fontWeight:700,color:P.amber}}>
                    {goalDraft||sliderCfg.min} lbs
                  </span>
                </div>
                <input type="range"
                  min={sliderCfg.min} max={sliderCfg.max} step={sliderCfg.step}
                  value={goalDraft||sliderCfg.min}
                  onChange={e=>setGoalDraft(e.target.value)}
                  style={{width:"100%",accentColor:P.amber,cursor:"pointer"}}
                />
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={S.mut8}>{sliderCfg.min} lbs</span>
                  <span style={S.mut8}>{sliderCfg.max} lbs</span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={S.mut9}>Target time</span>
                  <span style={{fontFamily:FF.m,fontSize:13,fontWeight:700,color:P.amber}}>
                    {goalDraft?sliderCfg.fmt(Number(goalDraft)):"—"}
                  </span>
                </div>
                <input type="range"
                  min={sliderCfg.min} max={sliderCfg.max} step={sliderCfg.step}
                  value={goalDraft||(sliderCfg.min+sliderCfg.max)/2}
                  onChange={e=>setGoalDraft(e.target.value)}
                  style={{width:"100%",accentColor:P.amber,cursor:"pointer"}}
                />
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={S.mut8}>{sliderCfg.fmt(sliderCfg.min)}</span>
                  <span style={S.mut8}>{sliderCfg.fmt(sliderCfg.max)}</span>
                </div>
              </div>
            )}
            <button onClick={()=>saveGoal(event.key, isLifting?goalDraft:sliderCfg.fmt(Number(goalDraft)))}
              style={{marginTop:10,width:"100%",padding:"8px 0",borderRadius:8,border:"none",
                background:P.amber,color:"#fff",fontFamily:FF.s,fontSize:11,fontWeight:700,cursor:"pointer"}}>
              Set Goal
            </button>
            {goal&&<button onClick={()=>saveGoal(event.key,"")}
              style={{marginTop:6,width:"100%",padding:"6px 0",borderRadius:8,border:`1px solid ${P.border}`,
                background:"none",color:P.muted,fontFamily:FF.s,fontSize:10,cursor:"pointer"}}>
              Clear goal
            </button>}
          </div>
        ) : (
          <button onClick={()=>{setGoalEdit(event.key);setGoalDraft(
            isLifting&&goal?goal:(!isLifting&&goal?String(parseTime(goal)):"")
          );}}
            style={{marginTop:8,width:"100%",padding:"7px 0",borderRadius:8,
              border:`1px solid ${goal?P.amber+"44":P.border}`,
              background:goal?P.amber+"08":"none",color:goal?P.amber:P.muted,
              fontFamily:FF.s,fontSize:10,fontWeight:goal?700:400,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <span>{goal?"🎯":"+"}</span>
            {goal?`Goal: ${goal}${isLifting?" lbs":""}  · Edit`:"Set a goal"}
          </button>
        )}

        <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${P.border}`,
          display:"flex",gap:8,flexWrap:"wrap"}}>
          {refs.map(r=>(
            <div key={r.l} style={S.mut8}>
              <span style={{color:P.sub,fontWeight:600}}>{r.t}</span>
              <span style={{color:P.muted,marginLeft:2}}>{r.l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return(<div style={S.col18}>
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          Age-graded · 47yo Male · {bodyweight} lbs
        </div>
        <div style={S.h18}>Personal Bests</div>
      </div>
      <div style={{fontFamily:FF.s,fontSize:9,color:"#FC4C02",fontWeight:600,padding:"5px 12px",borderRadius:6,
        background:"#FC4C0210",border:"1px solid #FC4C0244",cursor:"pointer"}}
        onClick={()=>typeof setPage==="function"&&setPage("import")}>
        🏆 Connect Strava →
      </div>
    </div>
    {overallScore && (
      <div style={{background:P.cardDk,border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"20px 24px",
        display:"flex",alignItems:"center",gap:24}}>
        <div style={{position:"relative",flexShrink:0}}>
          <svg width={100} height={100} style={{transform:"rotate(-90deg)"}}>
            <circle cx={50} cy={50} r={ARC_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7}/>
            <circle cx={50} cy={50} r={ARC_R} fill="none" stroke={arcCol} strokeWidth={7}
              strokeDasharray={`${arcDash} ${ARC_C-arcDash}`} strokeLinecap="round"
              style={{filter:`drop-shadow(0 0 8px ${arcCol}88)`,transition:"stroke-dasharray 1s ease"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:FF.r,fontSize:26,fontWeight:600,color:arcCol,lineHeight:1}}>{overallScore}</div>
            <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,marginTop:2}}>/ 100</div>
          </div>
        </div>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:6}}>
            Overall Performance Score
          </div>
          <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:arcCol,marginBottom:4}}>
            {pbLabel(overallScore).label}
          </div>
          <div style={{fontFamily:FF.s,fontSize:10,color:P.mutedDk,lineHeight:1.6,maxWidth:360}}>
            Composite across {validScores.length} logged {validScores.length===1?"event":"events"}.
            Scores are age-graded for a 47-year-old male — meaning an 80 here is 80th percentile for your age group, not open.
            {bests.bench&&` Lifting ratios based on ${bodyweight} lbs current bodyweight.`}
          </div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:12,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {[...RUNNING_EVENTS,...LIFTING_EVENTS].filter(e=>scores[e.key]!==null).map(e=>{
            const s=scores[e.key];const {color:c}=pbLabel(s);
            return(<div key={e.key} style={{textAlign:"center",minWidth:48}}>
              <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:c,lineHeight:1}}>{s}</div>
              <div style={{fontFamily:FF.s,fontSize:7.5,color:P.mutedDk,marginTop:2}}>{e.label}</div>
            </div>);
          })}
        </div>
      </div>
    )}
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <div style={{width:3,height:14,borderRadius:2,background:P.amber}}/>
        <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.sub,letterSpacing:"0.10em",textTransform:"uppercase"}}>
          Running
        </div>
        <div style={S.divider}/>
        <div style={S.mut9}>
          WMA age-graded standards · M45-49
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {RUNNING_EVENTS.map(e=><EventCard key={e.key} event={e} isLifting={false}/>)}
      </div>
    </div>
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <div style={{width:3,height:14,borderRadius:2,background:P.sage}}/>
        <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.sub,letterSpacing:"0.10em",textTransform:"uppercase"}}>
          Strength
        </div>
        <div style={S.divider}/>
        <div style={S.mut9}>
          ExRx age-adjusted standards · {bodyweight} lbs BW
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {LIFTING_EVENTS.map(e=><EventCard key={e.key} event={e} isLifting={true}/>)}
      </div>
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px 18px",
      boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <SLabel color={P.steel}>Scoring Methodology</SLabel>
      <div style={S.g240}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text,marginBottom:8}}>Running — WMA Age-Graded</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[{l:"World Class",t:"90–100",c:"#5BC4F0"},{l:"Elite",t:"80–89",c:"#3A9C68"},{l:"Excellent",t:"65–79",c:"#3A9C68"},
              {l:"Good",t:"50–64",c:"#C47830"},{l:"Average",t:"35–49",c:"#C4604A"},{l:"Developing",t:"<35",c:"#8B3A3A"}].map(row=>(
              <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"4px 10px",borderRadius:6,background:row.c+"10",border:`1px solid ${row.c}22`}}>
                <span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:row.c}}>{row.l}</span>
                <span style={{fontFamily:FF.m,fontSize:9,color:P.muted}}>{row.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text,marginBottom:8}}>Lifting — Age-Adjusted Bodyweight Ratio</div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.7}}>
            Standards based on ExRx.net strength norms, adjusted −15% for 45-50 age bracket vs open standards.
            Calculated as lifted weight ÷ bodyweight ({bodyweight} lbs current). Higher ratio = higher score.
          </div>
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
            {[
              {ev:"Bench",wc:"1.55×",gd:"1.05×",avg:"0.80×"},
              {ev:"Squat",wc:"2.10×",gd:"1.40×",avg:"1.05×"},
              {ev:"Deadlift",wc:"2.55×",gd:"1.70×",avg:"1.30×"},
            ].map(r=>(
              <div key={r.ev} style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,width:52}}>{r.ev}</span>
                <span style={S.mut8}>Elite {r.wc}</span>
                <span style={S.mut8}>· Good {r.gd}</span>
                <span style={S.mut8}>· Avg {r.avg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  </div>);
}
