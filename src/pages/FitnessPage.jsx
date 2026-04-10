// Fitness page — workouts log, weekly load, sport breakdown, calendar feed.
import { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { P, FF, S, CS } from "../lib/theme.js";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { SLabel, AnimRingArc, AnimRing } from "../components/shared.jsx";
import { WHOOP } from "../lib/data/whoop.js";
import { WEEKLY_REAL, WEEKLY_PHYSIO, WEEKLY_ACTS, ACT_META, FITNESS_LOAD, ZONE_CFG } from "../lib/data/workouts.js";
import { CAL_DATA, CAL_RICH, RECENT_WORKOUTS } from "../lib/data/calendar.js";

export function FitnessPage(){
  const [range,setRange]=useState(16);
  const [activeAct,setActiveAct]=useState(null);
  const _todayKey = (()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();

  // --- Live history: fetch daily data from cron and extend static weekly arrays ---
  const [historyDays, setHistoryDays] = useState([]);
  useEffect(() => {
    fetch('/api/whoop/history').then(r => r.ok ? r.json() : null)
      .then(res => { if (res && res.days && res.days.length) setHistoryDays(res.days); })
      .catch(() => {});
  }, []);
  const _wkLabel = (ds) => { const d=new Date(ds+'T12:00:00'),dy=d.getDay(),df=d.getDate()-dy+(dy===0?-6:1),m=new Date(d.getFullYear(),d.getMonth(),df); return (m.getMonth()+1)+'/'+m.getDate(); };
  const {mergedReal,mergedPhysio,mergedLoad} = useMemo(() => {
    if(!historyDays.length) return {mergedReal:WEEKLY_REAL,mergedPhysio:WEEKLY_PHYSIO,mergedLoad:FITNESS_LOAD};
    const lastLbl = WEEKLY_REAL.length ? WEEKLY_REAL[WEEKLY_REAL.length-1].label : '';
    const wkMap = {};
    historyDays.forEach(day => { const wk=_wkLabel(day.date); if(!wkMap[wk]) wkMap[wk]=[]; wkMap[wk].push(day); });
    const nR=[], nP=[];
    Object.keys(wkMap).sort().forEach(wk => {
      if(lastLbl){const[sm,sd]=lastLbl.split('/').map(Number),[wm,wd]=wk.split('/').map(Number);const sy=sm>6?2025:2026,wy=wm>6?2025:2026;if(new Date(wy,wm-1,wd)<=new Date(sy,sm-1,sd))return;}
      const days=wkMap[wk]; let ts=0,td=0,tc=0,tn=0;
      days.forEach(d=>{(d.workouts||[]).forEach(w=>{ts+=+(w.strain||0);td+=+(w.dur||0);tc+=+(w.cal||0);tn++;});});
      nR.push({label:wk,strain:+ts.toFixed(1),dur:Math.round(td),cal:Math.round(tc),count:tn,z1m:0,z2m:0,z3m:0,z4m:0,z5m:0});
      const vd=days.filter(d=>d.recovery>0);
      if(vd.length){const av=(a,k)=>+(a.reduce((s,d)=>s+(+d[k]||0),0)/a.length).toFixed(1);nP.push({label:wk,hrv:av(vd,'hrv'),rec:av(vd,'recovery'),rhr:av(vd,'rhr'),strain:av(vd,'strain')});}
    });
    const mR=[...WEEKLY_REAL,...nR],mP=[...WEEKLY_PHYSIO,...nP];
    const mL=mR.map((w,i)=>{const a=mR.slice(Math.max(0,i-3),i+1).reduce((s,x)=>s+x.strain,0)/Math.min(4,i+1),c=mR.slice(Math.max(0,i-11),i+1).reduce((s,x)=>s+x.strain,0)/Math.min(12,i+1);return{label:w.label,atl:+a.toFixed(1),ctl:+c.toFixed(1),tsb:+(c-a).toFixed(1)};});
    return {mergedReal:mR,mergedPhysio:mP,mergedLoad:mL};
  }, [historyDays]);

  // richDays = all days with workouts, sorted oldest→newest
  // allNavDays = union of richDays + today so today is always reachable
  const richDays   = Object.keys(CAL_RICH).sort();
  const allNavDays = [...new Set([...richDays, _todayKey])].sort();

  // Default to most recent workout day (last in allNavDays that has data, or today)
  const [viewDay, setViewDay] = useState(()=>{
    // Start on the most recent day that has workout data
    const lastWorkoutDay = richDays[richDays.length - 1];
    return lastWorkoutDay || _todayKey;
  });

  // Navigation: left (‹) = go back in time, right (›) = go forward in time
  const viewIdx  = allNavDays.indexOf(viewDay);
  const canPrev  = viewIdx > 0;                          // can go further back
  const canNext  = viewIdx < allNavDays.length - 1;      // can go forward toward today
  const prevDay  = () => canPrev && setViewDay(allNavDays[viewIdx - 1]);
  const nextDay  = () => canNext && setViewDay(allNavDays[viewIdx + 1]);
  const isToday  = viewDay === _todayKey;

  // Format display date
  const viewDate = new Date(viewDay+"T12:00:00");
  const viewDateLabel = viewDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  const viewDayShort  = viewDate.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  const ax={tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  const wkSlice   = mergedReal.slice(-range);
  const ldSlice   = mergedLoad.slice(-range);
  const physSlice = mergedPhysio.slice(-range);
  const actSlice  = WEEKLY_ACTS.slice(-range);

 
  const actTotals = Object.entries(
    actSlice.reduce((acc, wk) => {
      Object.entries(wk).forEach(([key, val]) => {
        if (key === 'label' || !val || typeof val !== 'object') return;
        if (!acc[key]) acc[key] = { count:0, strain:0, dur:0 };
        acc[key].count  += val.c || 0;
        acc[key].strain += val.s || 0;
        acc[key].dur    += val.d || 0;
      });
      return acc;
    }, {})
  )
  .map(([id, v]) => ({
    id,
    ...(ACT_META[id] || { label: id, icon:"⚡", color: P.steel }),
    count:  v.count,
    avgStrain: v.count ? +(v.strain / v.count).toFixed(1) : 0,
    totalDur:  v.dur,
  }))
  .filter(a => a.count > 0)
  .sort((a, b) => b.count - a.count);

  const actTotal = actTotals.reduce((s, a) => s + a.count, 0);
  const maxCount = actTotals.length ? actTotals[0].count : 1;

  // Totals for selected range
  const rStrain  = wkSlice.reduce((s,w)=>s+w.strain,0).toFixed(1);
  const rDur     = wkSlice.reduce((s,w)=>s+w.dur,0);
  const rCal     = wkSlice.reduce((s,w)=>s+w.cal,0);
  const rCount   = wkSlice.reduce((s,w)=>s+w.count,0);
  const rZ       = wkSlice.reduce((a,w)=>{a[0]+=w.z1m;a[1]+=w.z2m;a[2]+=w.z3m;a[3]+=w.z4m;a[4]+=w.z5m;return a;},[0,0,0,0,0]);
  const rZSum    = rZ.reduce((a,b)=>a+b,0);

  const zStackData = wkSlice.map(w=>({label:w.label,z1:Math.round(w.z1m),z2:Math.round(w.z2m),z3:Math.round(w.z3m),z4:Math.round(w.z4m),z5:Math.round(w.z5m),strain:+w.strain.toFixed(1)}));

  const filteredLog = activeAct
    ? RECENT_WORKOUTS.filter(w=>w.activity.toLowerCase().includes(activeAct))
    : RECENT_WORKOUTS;
  const NOTES_KEY = "vital_workout_notes_v1";
  const [allNotes, setAllNotes] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem(NOTES_KEY)||"{}"); }catch(e){ return {}; }
  });
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteDraft,   setNoteDraft]   = useState("");

  const saveNote = (day, text) => {
    const next = {...allNotes};
    if(text.trim()) next[day] = {text:text.trim(), saved:new Date().toISOString()};
    else delete next[day];
    setAllNotes(next);
    try{ localStorage.setItem(NOTES_KEY, JSON.stringify(next)); }catch(e){}
    setNoteEditing(false);
    setNoteDraft("");
  };

  const startEditing = (day) => {
    setNoteDraft(allNotes[day]?.text || "");
    setNoteEditing(true);
  };

  // Debug: log saves to console
  const saveNoteDebug = (day, text) => {
    saveNote(day, text);
  };

 
  useEffect(()=>{
    setNoteEditing(false);
    setNoteDraft("");
  }, [viewDay]);

  // Peloton overlay — merges distance/pace/power into WHOOP sessions
  const peloOverlay = (()=>{
    try{ return JSON.parse(localStorage.getItem("vital_cal_rich_overlay")||"{}"); }
    catch(e){ return {}; }
  })();
  const mergePelo = (w, dateKey) => {
    const p = (peloOverlay[dateKey]||{})[w.cat];
    if(!p) return w;
    return {...w,
      distance:   w.distance   ||p.distance,
      avgPace:    w.avgPace    ||p.avgPace,
      avgSpeed:   w.avgSpeed   ||p.avgSpeed,
      output:     w.output     ||p.output,
      avgWatts:   w.avgWatts   ||p.avgWatts,
      maxWatts:   w.maxWatts   ||p.maxWatts,
      avgCadence: w.avgCadence ||p.avgCadence,
      avgResist:  w.avgResist  ||p.avgResist,
      peloTitle:  w.peloTitle  ||p.peloTitle,
      peloInst:   w.peloInst   ||p.peloInst,
      peloMerged: true,
    };
  };

  const currentNote = allNotes[viewDay];
  const todayCalDay   = CAL_DATA[viewDay] || {};
  const todayWorkouts = (CAL_RICH[viewDay] || []).map(w=>mergePelo(w,viewDay));
  const todayRec      = todayCalDay.rec;
  const todaySlp      = todayCalDay.slp;
  const todayStrain   = todayWorkouts.reduce((s,w)=>s+w.strain,0);
  const todayCal      = todayWorkouts.reduce((s,w)=>s+w.cal,0);
  const todayDur      = todayWorkouts.reduce((s,w)=>s+w.dur,0);

  const CAT_META_LOCAL = {
    running:{icon:"🏃",color:"#C47830",label:"Running"},
    fitness:{icon:"🏋",color:"#3A5C48",label:"Functional Fitness"},
    spin:   {icon:"🚴",color:"#C4604A",label:"Spin"},
    walking:{icon:"🚶",color:"#7A5A80",label:"Walking"},
    other:  {icon:"⚡",color:"#6B6057",label:"Activity"},
  };
  const catMeta = cat => CAT_META_LOCAL[cat] || CAT_META_LOCAL.other;
  const strColor = s => s>=16?P.terra:s>=12?P.amber:P.sage;
  const zoneColors = ["#6B7C8A","#3A5C48","#C47830","#C4604A","#8A3020"];
  const zoneLabels = ["Z1 Warmup","Z2 Aerobic","Z3 Tempo","Z4 Threshold","Z5 Max"];

  return(<div style={S.col18}>
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={prevDay} disabled={!canPrev}
          style={{width:32,height:32,borderRadius:8,border:`1px solid ${P.border}`,background:P.card,
            cursor:canPrev?"pointer":"default",fontSize:16,color:canPrev?P.text:P.border,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
            transition:"all .15s"}}>‹</button>

        <div style={{flex:1,textAlign:"center",padding:"0 12px"}}>
          <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color:P.text,letterSpacing:"-0.01em"}}>
            {isToday?"Today · ":""}{viewDateLabel}
          </div>
          {todayWorkouts.length>0&&<div style={S.mut9t2}>
            {todayWorkouts.length} workout{todayWorkouts.length>1?"s":""} · {todayStrain.toFixed(1)} strain · {todayCal.toLocaleString()} kcal
          </div>}
        </div>

        <button onClick={nextDay} disabled={!canNext}
          style={{width:32,height:32,borderRadius:8,border:`1px solid ${P.border}`,background:P.card,
            cursor:canNext?"pointer":"default",fontSize:16,color:canNext?P.text:P.border,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
            transition:"all .15s"}}>›</button>
      </div>

{(()=>{ const fitMob=useIsMobile(); return (
      todayWorkouts.length > 0 ? (
        <div style={{display:"grid",gridTemplateColumns:fitMob?"1fr":`repeat(${Math.min(todayWorkouts.length,2)},1fr) ${todayWorkouts.length>0?"auto":""}`,gap:16,alignItems:"stretch"}}>
          {todayWorkouts.map((w,i)=>{
            const meta = catMeta(w.cat);
            const zones = [
              {pct:w.z1p, min:w.z1m, color:zoneColors[0], label:"Z1 Warmup",    sub:"<50% HRmax"},
              {pct:w.z2p, min:w.z2m, color:zoneColors[1], label:"Z2 Aerobic",   sub:"50–60%"},
              {pct:w.z3p, min:w.z3m, color:zoneColors[2], label:"Z3 Tempo",     sub:"60–70%"},
              {pct:w.z4p, min:w.z4m, color:zoneColors[3], label:"Z4 Threshold", sub:"70–80%"},
              {pct:w.z5p, min:w.z5m, color:zoneColors[4], label:"Z5 Max",       sub:">80%"},
            ].filter(z=>z.pct>0);
            const hasZones = zones.length>0;
            const maxHRpct = w.avgHR && w.maxHR ? Math.round((w.avgHR/w.maxHR)*100) : null;

            return(
              <div key={i} style={{background:P.card,border:`1px solid ${meta.color}22`,borderRadius:16,padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:46,height:46,borderRadius:13,background:meta.color+"14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:`1px solid ${meta.color}22`,flexShrink:0}}>
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{fontFamily:FF.s,fontWeight:700,fontSize:15,color:P.text}}>{w.peloTitle||w.name}</div>
                      {w.peloMerged&&<div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                        <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,padding:"1px 7px",borderRadius:4,background:"#E6000012",border:"1px solid #E6000033",color:"#E60000",letterSpacing:"0.06em"}}>🚴 PELOTON</span>
                        {w.peloInst&&<span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>{w.peloInst}</span>}
                      </div>}
                      <div style={S.mut9t2}>
                        WHOOP · {w.start}{w.dur?` · ${Math.floor(w.dur/60)?Math.floor(w.dur/60)+"h ":""}${w.dur%60||w.dur}m`:""}
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"center",padding:"8px 14px",borderRadius:12,background:strColor(w.strain)+"14",border:`1px solid ${strColor(w.strain)}22`}}>
                    <div style={{fontFamily:FF.r,fontSize:28,fontWeight:700,color:strColor(w.strain),letterSpacing:"-0.02em",lineHeight:1}}>{w.strain}</div>
                    <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>Strain</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginBottom:16}}>
                  {[
                    {label:"Duration",  val:`${Math.floor(w.dur/60)?Math.floor(w.dur/60)+"h ":""}${w.dur%60||w.dur}m`, color:P.steel},
                    {label:"Calories",  val:w.cal.toLocaleString()+" kcal",       color:P.terra},
                    {label:"Avg HR",    val:w.avgHR?`${w.avgHR} bpm`:"—",         color:"#C47830"},
                    {label:"Max HR",    val:w.maxHR?`${w.maxHR} bpm`:"—",         color:"#C4604A"},
                    // Peloton-sourced fields (only shown when merged data exists)
                    ...(w.distance >0 ? [{label:"Distance",  val:`${w.distance.toFixed(2)} mi`,                color:P.sage}]  : []),
                    ...(w.avgPace  >0 ? [{label:"Avg Pace",  val:`${Math.floor(w.avgPace)}:${String(Math.round((w.avgPace%1)*60)).padStart(2,"0")} /mi`, color:P.sage}] : []),
                    ...(w.output   >0 ? [{label:"Output",    val:`${w.output} kJ`,                             color:P.amber}] : []),
                    ...(w.avgWatts >0 ? [{label:"Avg Watts", val:`${w.avgWatts}w`,                             color:P.amber}] : []),
                    ...(w.avgCadence>0? [{label:"Cadence",   val:`${w.avgCadence} rpm`,                        color:P.steel}] : []),
                    ...(w.avgResist >0? [{label:"Resistance",val:`${w.avgResist}%`,                            color:P.clay}]  : []),
                  ].map(({label,val,color})=>(
                    <div key={label} style={{padding:"9px 10px",background:P.panel,borderRadius:9,border:`1px solid ${P.border}`}}>
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{label}</div>
                      <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color,letterSpacing:"-0.01em",lineHeight:1}}>{val}</div>
                    </div>
                  ))}
                </div>
                {hasZones&&(
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Heart Rate Zones</div>
                      {maxHRpct&&<div style={S.mut9}>Avg {w.avgHR} / Max {w.maxHR} bpm</div>}
                    </div>
                    <div style={{display:"flex",height:12,borderRadius:6,overflow:"hidden",marginBottom:12,gap:1}}>
                      {[w.z1p,w.z2p,w.z3p,w.z4p,w.z5p].map((z,zi)=>
                        z>0?<div key={zi} style={{flex:z,background:zoneColors[zi],minWidth:3}}/>:null
                      )}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {zones.map((z,zi)=>(
                        <div key={zi} style={{display:"grid",gridTemplateColumns:"100px 1fr 44px 44px",gap:8,alignItems:"center"}}>
                          <div style={S.row6}>
                            <div style={{width:8,height:8,borderRadius:2,background:z.color,flexShrink:0}}/>
                            <div>
                              <div style={{fontFamily:FF.s,fontSize:9,fontWeight:500,color:P.text,lineHeight:1}}>{z.label}</div>
                              <div style={{fontFamily:FF.s,fontSize:7,color:P.muted}}>{z.sub}</div>
                            </div>
                          </div>
                          <div style={{height:5,background:P.border,borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${z.pct}%`,background:z.color,borderRadius:3,transition:"width 0.9s cubic-bezier(0.34,1.2,0.64,1)"}}/>
                          </div>
                          <div style={{fontFamily:FF.m,fontSize:9,color:z.color,textAlign:"right",fontWeight:500}}>{z.pct}%</div>
                          <div style={{fontFamily:FF.m,fontSize:9,color:P.muted,textAlign:"right"}}>{z.min}m</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div style={{display:"flex",flexDirection:"column",gap:12,minWidth:160}}>
            {todayRec!=null&&(
              <div style={{background:P.cardDk,borderRadius:14,padding:"16px",border:`1px solid ${P.borderDk}`,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{position:"relative",marginBottom:8}}>
                  {(()=>{
                    const rc=todayRec>=80?"#3A5C48":todayRec>=60?"#C47830":"#C4604A";
                    const r=30,circ=2*Math.PI*r;
                    return(
                      <svg width={68} height={68} style={{transform:"rotate(-90deg)"}}>
                        <circle cx={34} cy={34} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5}/>
                        <AnimRing cx={34} cy={34} r={r} stroke={rc} sw={5} pct={todayRec/100} color={rc} delay={200}/>
                      </svg>
                    );
                  })()}
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.textInv}}>{todayRec}</div>
                  </div>
                </div>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk}}>Recovery</div>
              </div>
            )}
            {todaySlp!=null&&(
              <div style={{background:P.card,borderRadius:12,padding:"12px 14px",border:`1px solid ${P.border}`}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:3}}>Sleep</div>
                <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:"#4A6070",letterSpacing:"-0.01em"}}>{todaySlp}%</div>
              </div>
            )}
            {todayWorkouts.length>1&&(
              <div style={{background:P.panel,borderRadius:12,padding:"12px 14px",border:`1px solid ${P.border}`}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>Day Total</div>
                {[
                  {label:"Strain",val:todayStrain.toFixed(1),color:strColor(todayStrain)},
                  {label:"Cal",   val:todayCal,              color:P.terra},
                  {label:"Time",  val:`${todayDur}m`,        color:P.steel},
                ].map(({label,val,color})=>(
                  <div key={label} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={S.mut9}>{label}</span>
                    <span style={{fontFamily:FF.r,fontSize:12,fontWeight:600,color}}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.04)",display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:28}}>😴</div>
          <div>
            <div style={{fontFamily:FF.s,fontWeight:600,fontSize:13,color:P.text,marginBottom:3}}>Rest day</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>No workouts logged on {viewDayShort}. Active recovery or full rest.</div>
          </div>
          {todayRec!=null&&<div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontFamily:FF.r,fontSize:28,fontWeight:600,color:todayRec>=80?P.sage:P.amber,letterSpacing:"-0.02em"}}>{todayRec}%</div>
            <div style={S.mut9}>Recovery</div>
          </div>}
        </div>
      )
    );})()}
    </div>
    <div style={{background:P.card,border:`1px solid ${noteEditing?P.amber+"66":currentNote?P.sage+"33":P.border}`,
      borderRadius:14,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,.04)",
      transition:"border-color .2s"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:noteEditing||currentNote?10:0}}>
        <div style={S.row8}>
          <span style={{fontSize:15}}>📝</span>
          <div>
            <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>Workout Note</div>
            {currentNote&&!noteEditing&&(
              <div style={S.mut8}>
                Saved {new Date(currentNote.saved).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"})}
              </div>
            )}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {!noteEditing&&(
            <button onClick={()=>startEditing(viewDay)}
              style={{fontFamily:FF.s,fontSize:10,fontWeight:600,padding:"5px 12px",
                borderRadius:7,border:`1px solid ${P.border}`,background:P.panel,
                color:P.sub,cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=P.amber;e.currentTarget.style.color=P.amber;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.color=P.sub;}}>
              {currentNote?"Edit":"+ Add note"}
            </button>
          )}
          {!noteEditing&&currentNote&&(
            <button onClick={()=>saveNoteDebug(viewDay,"")}
              style={{fontFamily:FF.s,fontSize:10,padding:"5px 10px",
                borderRadius:7,border:`1px solid ${P.border}`,background:"transparent",
                color:P.muted,cursor:"pointer"}}
              title="Delete note">✕</button>
          )}
        </div>
      </div>
      {noteEditing ? (
        <div>
          <textarea
            key={viewDay}
            autoFocus
            value={noteDraft}
            onChange={e=>setNoteDraft(e.target.value)}
            onKeyDown={e=>{if(e.key==="Escape"){setNoteEditing(false);setNoteDraft("");}}}
            placeholder={`How did ${viewDayShort} feel? Pace, effort, how the body felt, what you'd do differently...`}
            rows={4}
            style={{
              width:"100%",padding:"10px 12px",borderRadius:9,
              border:`1.5px solid ${P.amber}`,background:P.panel,
              fontFamily:FF.s,fontSize:12,color:P.text,
              resize:"vertical",outline:"none",lineHeight:1.6,
              boxSizing:"border-box",marginBottom:8,
            }}
          />
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{setNoteEditing(false);setNoteDraft("");}}
              style={{fontFamily:FF.s,fontSize:11,padding:"7px 14px",
                borderRadius:8,border:`1px solid ${P.border}`,background:P.panel,
                color:P.muted,cursor:"pointer"}}>Cancel</button>
            <button
              disabled={!noteDraft.trim()}
              onClick={()=>saveNoteDebug(viewDay,noteDraft)}
              style={{fontFamily:FF.s,fontSize:11,fontWeight:700,padding:"7px 16px",
                borderRadius:8,border:"none",
                background:noteDraft.trim()?P.sage:"rgba(0,0,0,0.08)",
                color:noteDraft.trim()?"#fff":P.muted,
                cursor:noteDraft.trim()?"pointer":"not-allowed",
                transition:"all .15s",opacity:noteDraft.trim()?1:0.5}}>
              Save note
            </button>
          </div>
        </div>
      ) : currentNote ? (
        <div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.7,
          padding:"10px 12px",background:P.panel,borderRadius:8,
          borderLeft:`3px solid ${P.sage}`}}>
          {currentNote.text}
        </div>
      ) : (
        <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,fontStyle:"italic"}}>
          No note for {viewDayShort} yet.
        </div>
      )}
    </div>
    <div style={{display:"flex",alignItems:"center",gap:16}}>
      <div style={S.divider}/>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Training History</div>
      <div style={S.divider}/>
    </div>
    <div style={S.rowsb}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          WHOOP · {range===1?"1 Week":range===4?"4 Weeks":`${range} Weeks`} · Mar 2025–Mar 2026
        </div>
        <div style={S.h18}>Fitness Overview</div>
      </div>
      <div style={{display:"flex",gap:5}}>
        {[1,4,8,16,26,52].map(r=>(
          <button key={r} onClick={()=>setRange(r)} style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:7,cursor:"pointer",transition:"all .15s",background:range===r?P.cardDk:P.card,color:range===r?P.textInv:P.sub,border:`1px solid ${range===r?P.cardDk:P.border}`}}>{r}W</button>
        ))}
      </div>
    </div>
    <div style={S.g120}>
      {[
        {icon:"⚡",label:"Total Strain",   val:rStrain,                                    color:P.amber, sub:`${rCount} sessions`},
        {icon:"🏋",label:"Workouts",       val:rCount,                                     color:P.sage,  sub:`${(rCount/range).toFixed(1)}/wk avg`},
        {icon:"⏱",label:"Duration",       val:`${Math.floor(rDur/60)}h ${rDur%60}m`,      color:P.steel, sub:`${rCount?Math.round(rDur/rCount):0}m avg`},
        {icon:"🔥",label:"Calories",       val:rCal.toLocaleString(),                      color:P.terra, sub:`${rCount?Math.round(rCal/rCount):0}/session`},
        {icon:"❤",label:"Zone 2 Time",    val:`${Math.round((rZ[1]/Math.max(1,rZSum))*100)}%`, color:P.sage, sub:`${Math.round(rZ[1])}m aerobic base`},
      ].map(({icon,label,val,color,sub})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{width:28,height:28,borderRadius:7,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginBottom:8}}>{icon}</div>
          <div style={{fontFamily:FF.r,fontSize:26,fontWeight:600,color:P.text,lineHeight:1,marginBottom:2,letterSpacing:"-0.01em"}}>{val}</div>
          <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,marginBottom:2}}>{label}</div>
          <div style={S.mut9}>{sub}</div>
        </div>
      ))}
    </div>
    <div style={S.g240}>
      <div style={CS()}>
        <SLabel color={P.sage} right={`${Math.round(rZSum/60)}h total`}>HR Zone Distribution</SLabel>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
          {(()=>{
            const size=120,cx=60,cy=60,r=44,sw=11,circ=2*Math.PI*r;
            let offset=0;
            const slices=ZONE_CFG.map((z,i)=>{
              const pct=rZ[i]/Math.max(1,rZSum);
              const dash=circ*pct,gap=circ*(1-pct),rot=offset;offset+=pct;
              return{...z,dash,gap,rot,pct,mins:Math.round(rZ[i])};
            });
            return(<div style={{position:"relative"}}>
              <svg width={size} height={size}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.panel} strokeWidth={sw+2}/>
                {slices.map((s,i)=>s.pct>0.01&&(
                  <AnimRingArc key={i} cx={cx} cy={cy} r={r} sw={sw} color={s.color}
                    dash={s.dash} gap={s.gap} rot={s.rot} delay={i*80}/>
                ))}
                <text x={cx} y={cy-5} textAnchor="middle" fontFamily={P.serif} fontSize={16} fontWeight="600" fill={P.text}>{Math.round(rZSum/60)}h</text>
                <text x={cx} y={cy+9} textAnchor="middle" fontFamily={P.sans} fontSize={8} fill={P.muted}>training</text>
              </svg>
            </div>);
          })()}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
          {ZONE_CFG.map((z,i)=>{
            const mins=Math.round(rZ[i]),pct=Math.round((rZ[i]/Math.max(1,rZSum))*100);
            return(<div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                  <div style={{width:7,height:7,borderRadius:2,background:z.color,flexShrink:0}}/>
                  <span style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text,whiteSpace:"nowrap"}}>{z.full}</span>
                  <span style={{fontFamily:FF.s,fontSize:9,color:P.muted,whiteSpace:"nowrap"}}>{z.range}</span>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0,marginLeft:8}}>
                  <span style={{fontFamily:FF.m,fontSize:10,color:z.color,fontWeight:600}}>{pct}%</span>
                  <span style={{fontFamily:FF.m,fontSize:9,color:P.muted,minWidth:28,textAlign:"right"}}>{mins}m</span>
                </div>
              </div>
              <div style={{height:4,background:P.panel,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:z.color,borderRadius:2,
                  transition:"width 0.9s cubic-bezier(0.34,1.2,0.64,1)"}}/>
              </div>
            </div>);
          })}
        </div>

        <div style={{padding:"9px 12px",background:P.panel,borderRadius:8,fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>
          <span style={{color:P.sage,fontWeight:600}}>{Math.round((rZ[1]/Math.max(1,rZSum))*100)}% Zone 2</span>
          {rZ[1]/rZSum>0.3?" — solid aerobic base.":"  — target 35–45% for mitochondrial density."}
          {"  "}<span style={{color:P.amber,fontWeight:600}}>{Math.round(((rZ[3]+rZ[4])/Math.max(1,rZSum))*100)}%</span>{" Z4/Z5."}
        </div>
      </div>
      <div style={CS()}>
        <SLabel color={P.clay} right={`${actTotal} sessions · ${range}W`}>Activity Mix</SLabel>
        {actTotals.map((a,i)=>{
          const pct=Math.round((a.count/Math.max(1,actTotal))*100);
          const isActive=activeAct===a.id;
          return(<div key={a.id} onClick={()=>setActiveAct(isActive?null:a.id)}
            style={{display:"flex",alignItems:"center",gap:12,padding:"9px 10px",borderRadius:9,marginBottom:6,cursor:"pointer",
              background:isActive?a.color+"10":P.panel,border:`1px solid ${isActive?a.color+"44":P.border}`,transition:"all .15s"}}
            onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=P.bg;}}
            onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background=P.panel;}}>
            <div style={{width:26,height:26,borderRadius:6,background:a.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{a.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>{a.label}</span>
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontFamily:FF.m,fontSize:10,color:a.color,fontWeight:500}}>{a.count}×</span>
                  <span style={{fontFamily:FF.m,fontSize:10,color:P.muted}}>{pct}%</span>
                  <span style={{fontFamily:FF.m,fontSize:10,color:P.muted}}>avg {a.avgStrain}</span>
                </div>
              </div>
              <div style={{height:3,background:P.border,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(a.count/maxCount)*100}%`,background:a.color,borderRadius:2,transition:"width 0.85s cubic-bezier(0.34,1.2,0.64,1)"}}/>
              </div>
            </div>
          </div>);
        })}
        <div style={{marginTop:6,padding:"7px 10px",background:P.panel,borderRadius:7,border:`1px solid ${P.border}`,fontFamily:FF.s,fontSize:9,color:P.muted}}>
          💡 Click to filter workout log below
        </div>
      </div>
    </div>
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <SLabel color={P.amber} right="zone minutes + strain">Weekly Training Load</SLabel>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {ZONE_CFG.map(z=>(
            <div key={z.label} style={S.row4}>
              <div style={{width:7,height:7,borderRadius:1,background:z.color}}/>
              <span style={S.mut8}>{z.full}</span>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:4}}>
            <div style={{width:10,height:2,background:P.amber,borderRadius:1}}/>
            <span style={S.mut8}>Strain</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={zStackData} margin={{top:4,right:36,left:-18,bottom:0}} barSize={range<=8?20:range<=16?12:range<=26?7:4}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={range<=16?0:range<=26?1:3} angle={range>=26?-45:0} textAnchor={range>=26?"end":"middle"} height={range>=26?36:20}/>
          <YAxis yAxisId="min" {...ax} domain={[0,"auto"]}/>
          <YAxis yAxisId="str" orientation="right" {...ax} domain={[0,120]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"10px 14px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
            <div style={{color:P.muted,marginBottom:5,fontWeight:600,fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
            {ZONE_CFG.map((z,i)=>{const p=payload.find(x=>x.dataKey===`z${i+1}`);return p&&p.value>0?<div key={i} style={{display:"flex",gap:12,marginBottom:2}}><span style={{color:z.color,minWidth:55}}>{z.full}</span><span style={{fontFamily:FF.m,color:P.text}}>{p.value}m</span></div>:null;})}
            {payload.find(x=>x.dataKey==="strain")&&<div style={{display:"flex",gap:12,marginTop:4,paddingTop:4,borderTop:`1px solid ${P.border}`}}><span style={{color:P.amber}}>Strain</span><span style={{fontFamily:FF.m,color:P.text}}>{payload.find(x=>x.dataKey==="strain").value}</span></div>}
          </div>):null}/>
          <Bar yAxisId="min" dataKey="z1" stackId="a" fill={ZONE_CFG[0].color} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Bar yAxisId="min" dataKey="z2" stackId="a" fill={ZONE_CFG[1].color} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Bar yAxisId="min" dataKey="z3" stackId="a" fill={ZONE_CFG[2].color} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Bar yAxisId="min" dataKey="z4" stackId="a" fill={ZONE_CFG[3].color} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Bar yAxisId="min" dataKey="z5" stackId="a" fill={ZONE_CFG[4].color} radius={[2,2,0,0]} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Line yAxisId="str" type="monotone" dataKey="strain" stroke={P.amber} strokeWidth={2} dot={{r:3,fill:P.amber,stroke:P.card,strokeWidth:1}} name="Strain"/>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <SLabel color={P.steel}>Fitness Load · ATL / CTL / TSB</SLabel>
          <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,marginTop:-8}}>
            <span style={{color:P.terra,fontWeight:500}}>ATL</span> = 4-wk fatigue · <span style={{color:P.steel,fontWeight:500}}>CTL</span> = 12-wk fitness base · <span style={{color:P.sage,fontWeight:500}}>TSB</span> = Form
          </div>
        </div>
        <div style={{display:"flex",gap:12}}>
          {[{c:P.terra,l:"ATL"},{c:P.steel,l:"CTL"},{c:P.sage,l:"TSB"}].map(({c,l})=>(
            <div key={l} style={S.row4}>
              <div style={{width:10,height:2,background:c,borderRadius:1}}/><span style={S.mut9}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={145}>
        <LineChart data={ldSlice} margin={{top:4,right:8,left:-20,bottom:0}}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={range<=16?0:range<=26?1:3} angle={range>=26?-45:0} textAnchor={range>=26?"end":"middle"} height={range>=26?36:20}/>
          <YAxis {...ax} domain={[-12,"auto"]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:4,fontWeight:600,fontSize:9,textTransform:"uppercase"}}>{label}</div>{payload.map(p=><div key={p.name} style={{display:"flex",gap:12,marginBottom:2}}><span style={{color:p.color,minWidth:40}}>{p.name}</span><span style={{fontFamily:FF.m,color:P.text}}>{p.value}</span></div>)}</div>):null}/>
          <ReferenceLine y={0} stroke={P.border} strokeDasharray="3 3"/>
          <Line type="monotone" dataKey="atl" stroke={P.terra}  strokeWidth={1.5} dot={false} name="ATL"/>
          <Line type="monotone" dataKey="ctl" stroke={P.steel}  strokeWidth={2}   dot={false} name="CTL"/>
          <Line type="monotone" dataKey="tsb" stroke={P.sage}   strokeWidth={1.5}
            dot={(p)=><circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill={p.value>=0?P.sage:P.terra} stroke={P.card} strokeWidth={1}/>}
            name="TSB"/>
        </LineChart>
      </ResponsiveContainer>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:12}}>
        {[
          {label:"ATL (Fatigue)", val:ldSlice[ldSlice.length-1]?.atl, color:P.terra, note:"4-wk acute load"},
          {label:"CTL (Fitness)", val:ldSlice[ldSlice.length-1]?.ctl, color:P.steel, note:"12-wk fitness base"},
          {label:"TSB (Form)",    val:ldSlice[ldSlice.length-1]?.tsb, color:(ldSlice[ldSlice.length-1]?.tsb||0)>=0?P.sage:P.terra, note:(ldSlice[ldSlice.length-1]?.tsb||0)>=0?"Fresh & ready":"Fatigue accumulated"},
        ].map(({label,val,color,note})=>(
          <div key={label} style={{padding:"10px 12px",background:P.panel,borderRadius:8,border:`1px solid ${P.border}`}}>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:3}}>{label}</div>
            <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
            <div style={S.mut9t2}>{note}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={CS()}>
      <SLabel color={P.sage} right="weekly averages">Recovery & HRV Trend</SLabel>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={physSlice} margin={{top:4,right:30,left:-20,bottom:0}}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={range<=16?0:range<=26?1:3} angle={range>=26?-45:0} textAnchor={range>=26?"end":"middle"} height={range>=26?36:20}/>
          <YAxis yAxisId="rec" {...ax} domain={[0,100]}/>
          <YAxis yAxisId="hrv" orientation="right" {...ax} domain={[20,80]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:4,fontWeight:600,fontSize:9,textTransform:"uppercase"}}>{label}</div>{payload.map(p=><div key={p.name} style={{display:"flex",gap:12,marginBottom:2}}><span style={{color:p.color,minWidth:50}}>{p.name}</span><span style={{fontFamily:FF.m,color:P.text}}>{p.value}</span></div>)}</div>):null}/>
          <Line yAxisId="rec" type="monotone" dataKey="rec" stroke={P.sage}  strokeWidth={2} dot={(p)=><circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill={P.sage} stroke={P.card} strokeWidth={1}/>} name="Recovery %"/>
          <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke={P.steel} strokeWidth={1.5} dot={false} name="HRV ms" strokeDasharray="4 2"/>
        </LineChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:16,marginTop:8}}>
        {[{c:P.sage,l:"Recovery %",w:2},{c:P.steel,l:"HRV (ms)",w:1.5,dash:"4 2"}].map(({c,l,w,dash})=>(
          <div key={l} style={S.row5}>
            <svg width={16} height={2}><line x1={0} y1={1} x2={16} y2={1} stroke={c} strokeWidth={w} strokeDasharray={dash}/></svg>
            <span style={S.mut10}>{l}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <SLabel color={P.steel} right={`${Math.min(filteredLog.length,20)} sessions`}>Recent Workouts</SLabel>
        {activeAct&&<button onClick={()=>setActiveAct(null)} style={{fontFamily:FF.s,fontSize:10,padding:"3px 10px",borderRadius:5,background:P.panel,border:`1px solid ${P.border}`,color:P.sub,cursor:"pointer"}}>Clear ×</button>}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>
          {["Date","Activity","Duration","Strain","Avg HR","Cal","Zone Split"].map(h=>(
            <th key={h} style={{fontFamily:FF.s,fontSize:8,fontWeight:600,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",textAlign:"left",padding:"0 10px 9px 0",borderBottom:`1px solid ${P.border}`}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {filteredLog.slice(0,20).map((w,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${P.border}`}}
              onMouseEnter={e=>e.currentTarget.style.background=P.panel}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{fontFamily:FF.m,fontSize:10,color:P.muted,padding:"7px 10px 7px 0",whiteSpace:"nowrap"}}>{w.dateStr}</td>
              <td style={{padding:"7px 10px 7px 0"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"2px 8px",borderRadius:5,background:w.color+"14",border:`1px solid ${w.color}28`}}>
                  <span style={{fontSize:10}}>{w.icon}</span>
                  <span style={{fontFamily:FF.s,fontSize:10,fontWeight:500,color:w.color}}>{w.activity}</span>
                </div>
              </td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.text,padding:"7px 10px 7px 0"}}>{w.dur}m</td>
              <td style={{padding:"7px 10px 7px 0"}}><span style={{fontFamily:FF.r,fontSize:13,fontWeight:600,color:w.strain>=15?P.terra:w.strain>=10?P.amber:P.sage}}>{w.strain}</span></td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.text,padding:"7px 10px 7px 0"}}>{w.avgHR} bpm</td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.muted,padding:"7px 10px 7px 0"}}>{w.cal}</td>
              <td style={{padding:"7px 0",minWidth:90}}>
                <div style={{display:"flex",height:8,borderRadius:3,overflow:"hidden",gap:0.5}}>
                  {[w.z1,w.z2,w.z3,w.z4,w.z5].map((z,zi)=>z>0?<div key={zi} style={{flex:z,height:"100%",background:ZONE_CFG[zi].color,minWidth:2}}/>:null)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>);
}

