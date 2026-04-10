// Calendar page — month grid with workout/recovery/HRV indicators and day detail.
import { useState, Fragment } from "react";
import { P, FF, S, CS } from "../lib/theme.js";
import { fmt } from "../lib/utils.js";
import { SLabel } from "../components/shared.jsx";
import { HUME_DATA, LATEST } from "../lib/data/body.js";
import { WHOOP, HRV_ZONES } from "../lib/data/whoop.js";
import { SCORES_NOW } from "../lib/data/scores.js";
import { CAL_DATA, CAL_RICH, RECENT_WORKOUTS } from "../lib/data/calendar.js";

export function CalendarPage(){
  const [viewMonth, setViewMonth] = useState({y:new Date().getFullYear(),m:new Date().getMonth()}); // 0-indexed
  const [selected,  setSelected]  = useState(null);

  // Category → icon + color
  const CAT = {
    running: {icon:"🏃",color:"#C47830"},
    fitness: {icon:"🏋",color:"#3A5C48"},
    spin:    {icon:"🚴",color:"#C4604A"},
    walking: {icon:"🚶",color:"#7A5A80"},
    other:   {icon:"⚡",color:"#6B6057"},
  };
  const catOf = w => CAT[w.cat] || CAT.other;

  // Color helpers
  const recColor  = r => !r?P.border:r>=80?"#3A5C48":r>=60?"#C47830":"#C4604A";
  const slpColor  = s => !s?P.muted:s>=90?"#3A5C48":s>=75?"#4A6070":"#C47830";
  const strColor  = s => s>=16?P.terra:s>=12?P.amber:P.sage;

  const {y,m} = viewMonth;
  const firstDay = new Date(y,m,1).getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const prevMonth = ()=>setViewMonth(p=>p.m===0?{y:p.y-1,m:11}:{y:p.y,m:p.m-1});
  const nextMonth = ()=>setViewMonth(p=>p.m===11?{y:p.y+1,m:0}:{y:p.y,m:p.m+1});
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateKey = d=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const today = new Date().toLocaleDateString('en-CA');

  // Month-level stats
  const mKeys = Array.from({length:daysInMonth},(_,i)=>dateKey(i+1));
  const mWorkouts = mKeys.filter(k=>CAL_RICH[k]?.length).length;
  const mAlc      = mKeys.filter(k=>CAL_DATA[k]?.alc).length;
  const mRecDays  = mKeys.filter(k=>CAL_DATA[k]?.rec!=null);
  const mAvgRec   = mRecDays.length ? Math.round(mRecDays.reduce((s,k)=>s+(CAL_DATA[k].rec||0),0)/mRecDays.length) : null;
  const mSlpDays  = mKeys.filter(k=>CAL_DATA[k]?.slp!=null);
  const mAvgSlp   = mSlpDays.length ? Math.round(mSlpDays.reduce((s,k)=>s+(CAL_DATA[k].slp||0),0)/mSlpDays.length) : null;
  const mStrain   = mKeys.reduce((s,k)=>{const r=CAL_RICH[k];return s+(r?.reduce((a,w)=>a+w.strain,0)||0);},0);

  const sel = selected ? {...CAL_DATA[selected], w:CAL_RICH[selected]} : null;

  return(<div style={S.col18}>
    <div style={S.rowsb}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>WHOOP · Dec – Mar</div>
        <div style={S.h18}>Activity Calendar</div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <button onClick={prevMonth} style={{width:32,height:32,borderRadius:8,background:P.card,border:`1px solid ${P.border}`,cursor:"pointer",fontSize:14,color:P.text}}>‹</button>
        <div style={{fontFamily:FF.r,fontWeight:600,fontSize:15,color:P.text,minWidth:130,textAlign:"center"}}>{MONTHS[m]} {y}</div>
        <button onClick={nextMonth} style={{width:32,height:32,borderRadius:8,background:P.card,border:`1px solid ${P.border}`,cursor:"pointer",fontSize:14,color:P.text}}>›</button>
      </div>
    </div>
    <div style={S.g120}>
      {[
        {icon:"🏋",label:"Active Days",  val:mWorkouts,             unit:"",  color:P.sage,   sub:`of ${daysInMonth} days`},
        {icon:"⚡",label:"Total Strain", val:mStrain.toFixed(0),    unit:"",  color:P.amber,  sub:"month total"},
        {icon:"💚",label:"Avg Recovery", val:mAvgRec||"—",          unit:mAvgRec?"%":"", color:recColor(mAvgRec),sub:"daily avg"},
        {icon:"🌙",label:"Avg Sleep",    val:mAvgSlp||"—",          unit:mAvgSlp?"%":"", color:slpColor(mAvgSlp),sub:"performance"},
        {icon:"🍷",label:"Alcohol Days", val:mAlc,                  unit:"",  color:mAlc>8?P.terra:P.clay,sub:`${(mAlc/(daysInMonth/7)).toFixed(1)}/week`},
      ].map(({icon,label,val,unit,color,sub})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"13px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{width:26,height:26,borderRadius:6,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,marginBottom:8}}>{icon}</div>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,lineHeight:1,letterSpacing:"-0.01em",marginBottom:2}}>{val}<span style={{fontSize:11,color:P.muted,fontFamily:FF.s,fontWeight:400,marginLeft:2}}>{unit}</span></div>
          <div style={S.sub10}>{label}</div>
          <div style={S.mut9}>{sub}</div>
        </div>
      ))}
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,padding:"10px 16px",display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>Legend</span>
      {[
        {icon:"🏋",color:"#3A5C48",l:"Fitness"},
        {icon:"🏃",color:"#C47830",l:"Running"},
        {icon:"🚴",color:"#C4604A",l:"Spin"},
        {icon:"🚶",color:"#7A5A80",l:"Walk"},
      ].map(({icon,color,l})=>(
        <div key={l} style={S.row5}>
          <span style={{fontSize:12}}>{icon}</span>
          <span style={S.sub9}>{l}</span>
        </div>
      ))}
      <div style={{width:1,height:14,background:P.border,margin:"0 4px"}}/>
      <div style={S.row5}>
        <div style={{width:3,height:14,borderRadius:2,background:"#B8902A"}}/>
        <span style={{fontFamily:FF.s,fontSize:10}}>🍷</span>
        <span style={S.sub9}>Alcohol day</span>
      </div>
      <div style={S.row5}>
        <div style={{width:3,height:14,borderRadius:2,background:P.sage}}/>
        <span style={S.sub9}>Recovery bar</span>
      </div>
      <div style={S.row5}>
        <div style={{width:3,height:14,borderRadius:2,background:"#4A6070"}}/>
        <span style={S.sub9}>Sleep bar</span>
      </div>
      <span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:"auto"}}>Click any day for detail</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:selected?"1fr 300px":"1fr",gap:18,alignItems:"start"}}>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,.06)",overflowX:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:8,minWidth:280}}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d} style={{textAlign:"center",fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",paddingBottom:6}}>{d}</div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,minWidth:280}}>
          {Array.from({length:firstDay},(_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const day=i+1, key=dateKey(day), d={...(CAL_DATA[key]||{}), w:CAL_RICH[key]};
            const inRange=key>="2025-12-01"&&key<=today; // extended to today
            const isSel=selected===key, isToday=key===today;
            const dayStrain=d.w?.reduce((s,w)=>s+w.strain,0)||0;
            const acts=d.w||[];
            const rec=d.rec, slp=d.slp;

            return(
              <div key={day}
                onClick={()=>inRange&&setSelected(isSel?null:key)}
                style={{
                  height:90, borderRadius:10, padding:"6px 6px 4px",
                  cursor:inRange?"pointer":"default", position:"relative",
                  background:isSel?P.cardDk:inRange&&rec?`rgba(${recColor(rec)==="#3A5C48"?"58,92,72":recColor(rec)==="#C47830"?"196,120,48":"196,96,74"},0.07)`:"transparent",
                  border:`1.5px solid ${isSel?P.amber:isToday?"#C47830":inRange?P.border:"transparent"}`,
                  transition:"all .15s", opacity:inRange?1:0.25,
                  display:"flex",flexDirection:"column",gap:2,
                }}
                onMouseEnter={e=>{if(inRange&&!isSel){e.currentTarget.style.background=P.panel;e.currentTarget.style.transform="translateY(-1px)";}}}
                onMouseLeave={e=>{if(!isSel){const r=CAL_DATA[key]?.rec;e.currentTarget.style.background=isSel?P.cardDk:inRange&&r?`rgba(${recColor(r)==="#3A5C48"?"58,92,72":recColor(r)==="#C47830"?"196,120,48":"196,96,74"},0.07)`:"transparent";e.currentTarget.style.transform="none";}}}>
                <div style={{fontFamily:FF.m,fontSize:10,fontWeight:isSel||isToday?700:400,color:isSel?P.textInv:isToday?P.amber:P.sub,lineHeight:1}}>{day}</div>
                {acts.length>0&&(
                  <div style={{display:"flex",gap:2,alignItems:"center",flexWrap:"wrap",minHeight:18}}>
                    {acts.slice(0,3).map((w,wi)=>{
                      const meta=catOf(w);
                      return(<span key={wi} style={{fontSize:13,lineHeight:1,filter:isSel?"brightness(1.4)":"none"}} title={`${w.name} · ${w.strain} strain`}>{meta.icon}</span>);
                    })}
                    {acts.length>3&&<span style={{fontFamily:FF.m,fontSize:8,color:isSel?P.mutedDk:P.muted}}>+{acts.length-3}</span>}
                  </div>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:2,flex:1,justifyContent:"flex-end"}}>
                  {dayStrain>0&&(
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <div style={{flex:1,height:3,borderRadius:1,background:isSel?"rgba(255,255,255,0.1)":P.panel,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.min(100,(dayStrain/20)*100)}%`,background:strColor(dayStrain),borderRadius:1,transition:"width .6s"}}/>
                      </div>
                      <span style={{fontFamily:FF.m,fontSize:8,fontWeight:600,color:isSel?strColor(dayStrain):strColor(dayStrain),lineHeight:1,minWidth:14,textAlign:"right"}}>{dayStrain.toFixed(0)}</span>
                    </div>
                  )}
                  {slp&&(
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <div style={{flex:1,height:3,borderRadius:1,background:isSel?"rgba(255,255,255,0.1)":P.panel,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${slp}%`,background:slpColor(slp),borderRadius:1,transition:"width .6s"}}/>
                      </div>
                      <span style={{fontFamily:FF.m,fontSize:8,color:isSel?P.mutedDk:P.muted,lineHeight:1,minWidth:14,textAlign:"right"}}>{slp}</span>
                    </div>
                  )}
                </div>
                {d.alc&&(
                  <>
                    {/* Amber left-edge alcohol stripe */}
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"10px 0 0 10px",background:"#B8902A",opacity:isSel?0.6:0.85}}/>
                    {/* 🍷 label in bottom-right */}
                    <div style={{position:"absolute",bottom:4,right:5,fontFamily:FF.s,fontSize:9,color:"#B8902A",opacity:0.9,lineHeight:1}}>🍷</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {selected&&sel&&(()=>{
        const [sy,sm,sd]=selected.split('-').map(Number);
        const dayName=new Date(sy,sm-1,sd).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
        const totalStrain=sel.w?.reduce((s,w)=>s+w.strain,0)||0;
        return(
          <div style={{background:P.cardDk,border:`1px solid ${P.borderDk}`,borderRadius:16,padding:"18px",boxShadow:"0 6px 24px rgba(0,0,0,0.12)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>Day Detail</div>
                <div style={{fontFamily:FF.r,fontSize:14,fontWeight:600,color:P.textInv,lineHeight:1.3}}>{dayName}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,0.1)",border:"none",color:P.mutedDk,fontSize:14,cursor:"pointer",borderRadius:6,padding:"4px 8px"}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginBottom:14}}>
              {[
                {label:"Recovery",  val:sel.rec,  color:recColor(sel.rec), icon:"💚"},
                {label:"Sleep",     val:sel.slp,  color:slpColor(sel.slp), icon:"🌙"},
              ].map(({label,val,color,icon})=>(
                <div key={label} style={{padding:"10px",background:"rgba(255,255,255,0.06)",borderRadius:10}}>
                  {val!=null?(()=>{
                    const r=26,circ=2*Math.PI*r;
                    return(<>
                      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
                        <div style={{position:"relative"}}>
                          <svg width={60} height={60} style={{transform:"rotate(-90deg)"}}>
                            <circle cx={30} cy={30} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5}/>
                            <circle cx={30} cy={30} r={r} fill="none" stroke={color} strokeWidth={5}
                              strokeDasharray={`${circ*(val/100)} ${circ*(1-val/100)}`} strokeLinecap="round"/>
                          </svg>
                          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.m,fontSize:12,fontWeight:600,color}}>{val}</div>
                        </div>
                      </div>
                      <div style={{textAlign:"center",fontFamily:FF.s,fontSize:9,color:P.mutedDk}}>{icon} {label}</div>
                    </>);
                  })():<div style={{textAlign:"center",fontFamily:FF.s,fontSize:9,color:P.mutedDk,padding:"14px 0"}}>{icon} {label}<br/><span style={{opacity:.5}}>No data</span></div>}
                </div>
              ))}
            </div>
            {(sel.hrv||sel.rhr)&&(
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {sel.hrv&&<div style={{flex:1,padding:"7px 10px",background:"rgba(255,255,255,0.05)",borderRadius:8}}>
                  <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,marginBottom:2}}>HRV</div>
                  <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.textInv}}>{sel.hrv}<span style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,marginLeft:2}}>ms</span></div>
                </div>}
                {sel.rhr&&<div style={{flex:1,padding:"7px 10px",background:"rgba(255,255,255,0.05)",borderRadius:8}}>
                  <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,marginBottom:2}}>RHR</div>
                  <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.textInv}}>{sel.rhr}<span style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,marginLeft:2}}>bpm</span></div>
                </div>}
              </div>
            )}
            {sel.w?.length>0&&(
              <div style={{marginBottom:12}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>
                  Workouts · {totalStrain.toFixed(1)} strain
                </div>
                {sel.w.map((w,i)=>{
                  const meta=catOf(w);
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(255,255,255,0.05)",borderRadius:8,marginBottom:4}}>
                      <span style={{fontSize:18,lineHeight:1,flexShrink:0}}>{meta.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:FF.s,fontSize:10,fontWeight:500,color:P.textInv,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.name}</div>
                        <div style={{fontFamily:FF.m,fontSize:9,color:P.mutedDk}}>{w.dur}m · {w.cal} cal</div>
                      </div>
                      <div style={{flexShrink:0,textAlign:"right"}}>
                        <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:strColor(w.strain)}}>{w.strain}</div>
                        <div style={{fontFamily:FF.s,fontSize:7,color:P.mutedDk}}>strain</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {sel.alc&&(
                <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:99,background:"rgba(184,144,42,0.2)",border:"1px solid rgba(184,144,42,0.4)"}}>
                  <span style={{fontSize:12}}>🍷</span>
                  <span style={{fontFamily:FF.s,fontSize:10,color:"#D4AD5A"}}>Alcohol logged</span>
                </div>
              )}
              {sel.wt&&(
                <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:99,background:"rgba(74,96,112,0.2)",border:"1px solid rgba(74,96,112,0.4)"}}>
                  <span style={{fontSize:10}}>⚖</span>
                  <span style={{fontFamily:FF.s,fontSize:10,color:"#7AACCA"}}>{sel.wt} lb</span>
                </div>
              )}
              {!sel.w?.length&&!sel.alc&&<span style={{fontFamily:FF.s,fontSize:10,color:P.mutedDk,padding:"5px 0"}}>Rest day</span>}
            </div>
          </div>
        );
      })()}
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"16px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:P.muted}}>
          Activity & Alcohol · {MONTHS[m]} {y}
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          {[
            {c:"#B8902A",l:"🍷 Alcohol"},
            {c:P.sage,l:"🏋 Workout"},
            {c:P.panel,bord:P.border,l:"Rest"},
          ].map(({c,bord,l})=>(
            <div key={l} style={S.row5}>
              <div style={{width:12,height:12,borderRadius:2,background:c,border:`1.5px solid ${bord||c}`}}/>
              <span style={S.sub9}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      {(()=>{
        // Build combined 7-column heatmap for the viewed month
        const alcDays = mKeys.filter(k=>CAL_DATA[k]?.alc);
        const wktDays = mKeys.filter(k=>CAL_RICH[k]?.length);
        const restDays = mKeys.filter(k=>!CAL_RICH[k]?.length&&!CAL_DATA[k]?.alc&&CAL_DATA[k]?.rec!=null);
        const alcCount  = alcDays.length;
        const wktCount  = wktDays.length;
        const weeks     = daysInMonth / 7;
        // Build week rows from the month grid
        const allDays = [];
        for(let i=0;i<firstDay;i++) allDays.push(null); // leading blanks
        for(let d=1;d<=daysInMonth;d++) allDays.push(dateKey(d));
        // Pad to full weeks
        while(allDays.length%7!==0) allDays.push(null);
        const weekRows = [];
        for(let i=0;i<allDays.length;i+=7) weekRows.push(allDays.slice(i,i+7));

        return(<>
          <div style={{display:"flex",gap:16,marginBottom:14,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:"#B8902A14",border:"1px solid #B8902A33"}}>
              <span>🍷</span>
              <span style={{fontFamily:FF.m,fontSize:12,fontWeight:700,color:"#B8902A"}}>{alcCount}</span>
              <span style={{fontFamily:FF.s,fontSize:9,color:"#B8902A"}}>alcohol · {weeks>0?(alcCount/weeks).toFixed(1):0}/wk</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:P.sageBg+"44",border:`1px solid ${P.sage}33`}}>
              <span>🏋</span>
              <span style={{fontFamily:FF.m,fontSize:12,fontWeight:700,color:P.sage}}>{wktCount}</span>
              <span style={{fontFamily:FF.s,fontSize:9,color:P.sage}}>workouts · {weeks>0?(wktCount/weeks).toFixed(1):0}/wk</span>
            </div>
            {alcCount>0&&wktCount>0&&(
              <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:P.amberBg+"44",border:`1px solid ${P.amber}33`}}>
                <span style={{fontFamily:FF.s,fontSize:9}}>🔀</span>
                <span style={{fontFamily:FF.s,fontSize:9,color:P.amber}}>
                  {mKeys.filter(k=>CAL_DATA[k]?.alc&&CAL_RICH[k]?.length).length} both same day
                </span>
              </div>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"32px 1fr",gap:"3px 0"}}>
            <div/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4}}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d,i)=>(
                <div key={i} style={{textAlign:"center",fontFamily:FF.s,fontSize:8,fontWeight:600,
                  color:i===0||i===6?P.amber:P.muted,letterSpacing:"0.04em"}}>{d}</div>
              ))}
            </div>
            {weekRows.map((week,wi)=>{
              const wkAlc = week.filter(k=>k&&CAL_DATA[k]?.alc).length;
              const wkLbl = week.find(k=>k) ? week.find(k=>k).slice(5,10).replace("-","/") : "";
              return(<Fragment key={wi}>
                <div style={{fontFamily:FF.m,fontSize:8,color:P.muted,paddingTop:3,textAlign:"right",paddingRight:6}}>{wkLbl}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                  {week.map((key,di)=>{
                    if(!key) return <div key={di}/>;
                    const d={...(CAL_DATA[key]||{}), w:CAL_RICH[key]};
                    const hasAlc=!!d.alc, hasWkt=!!d.w?.length;
                    const inRange=key>="2025-12-01"&&key<=today;
                    const rec=d.rec;
                    const bg = !inRange?"transparent":hasAlc&&hasWkt?"linear-gradient(135deg,#B8902A 40%,"+P.sage+" 40%)":hasAlc?"#B8902A":hasWkt?P.sage+"CC":rec!=null?P.panel:"transparent";
                    const isSelected = selected===key;
                    return(
                      <div key={di}
                        onClick={()=>inRange&&setSelected(isSelected?null:key)}
                        style={{
                          height:24,borderRadius:4,cursor:inRange?"pointer":"default",
                          background:bg,
                          border:`1px solid ${!inRange?"transparent":hasAlc?"#9A7218":hasWkt?P.sage:P.border}`,
                          opacity:inRange?1:0.15,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          position:"relative",
                          boxShadow:isSelected?`0 0 0 2px ${P.amber}`:"none",
                          transition:"opacity .15s",
                        }}
                        title={`${key}${hasAlc?" · 🍷 alcohol":""}${hasWkt?" · 🏋 workout":""}`}
                      >
                        {hasAlc&&hasWkt&&<span style={{fontSize:9}}>🍷</span>}
                        {hasAlc&&!hasWkt&&<span style={{fontSize:9}}>🍷</span>}
                        {!hasAlc&&hasWkt&&(()=>{const ws=d.w||[];return ws.length>0?<span style={{fontSize:9,opacity:0.9}}>{catOf(ws[0]).icon}</span>:null;})()}
                      </div>
                    );
                  })}
                </div>
                {/* Alcohol count for week */}
                {false&&<div/>}
              </Fragment>);
            })}
          </div>
        </>);
      })()}
    </div>
    <div style={S.g240}>
      <div style={CS()}>
        <SLabel color={P.steel}>⚖ Weight Check-ins</SLabel>
        <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginTop:-8,marginBottom:14}}>
          Daily readings from Hume Pod BIA scale via Apple Health.
          {HUME_DATA.length>0&&<span> {HUME_DATA.length} readings loaded.</span>}
        </div>
        {HUME_DATA.slice(0,5).map((r,i)=>{
          const prev = HUME_DATA[i+1];
          const delta = prev ? +(r.wt - prev.wt).toFixed(1) : null;
          const isLatest = i===0;
          return(
            <div key={r.d} style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"11px 14px",
              background:isLatest?P.sage+"0C":P.panel,
              borderRadius:10,marginBottom:7,
              border:`1px solid ${isLatest?P.sage+"44":P.border}`,
            }}>
              <div style={S.row10}>
                <div style={{width:32,height:32,borderRadius:8,
                  background:isLatest?P.sage+"20":P.panel,
                  border:`1px solid ${isLatest?P.sage+"44":P.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                  ⚖
                </div>
                <div>
                  <div style={S.row6}>
                    <div style={{fontFamily:FF.m,fontSize:11,color:P.text}}>{r.d}</div>
                    {isLatest&&<div style={{fontFamily:FF.s,fontSize:7.5,fontWeight:700,color:P.sage,
                      background:P.sage+"18",padding:"1px 6px",borderRadius:3,letterSpacing:"0.06em"}}>LATEST</div>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                    <span style={S.mut9}>Hume Pod BIA</span>
                    {r.bf&&<span style={S.mut9}>· {r.bf}% BF (BIA)</span>}
                    {delta!==null&&(
                      <span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,
                        color:delta>0?P.terra:delta<0?P.sage:P.muted}}>
                        {delta>0?"+":""}{delta} lbs
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,
                  color:isLatest?P.sage:P.steel,letterSpacing:"-0.02em",lineHeight:1}}>
                  {r.wt.toFixed(1)}
                </div>
                <div style={S.mut9t2}>lbs</div>
              </div>
            </div>
          );
        })}
        {HUME_DATA.length>=7&&(()=>{
          const slice7 = HUME_DATA.slice(0,7);
          const minW = Math.min(...slice7.map(x=>x.wt));
          const maxW = Math.max(...slice7.map(x=>x.wt));
          const range = Math.max(maxW-minW, 0.5);
          const delta7 = +(HUME_DATA[0].wt - HUME_DATA[6].wt).toFixed(1);
          return(
            <div style={{padding:"12px 14px",background:P.panel,borderRadius:9,border:`1px solid ${P.border}`,marginTop:4}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>7-day trend</div>
                <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,
                  color:delta7>0?P.terra:delta7<0?P.sage:P.muted}}>
                  {delta7>0?"+":""}{delta7} lbs vs 7 days ago
                </div>
              </div>
              <div style={{display:"flex",gap:3,alignItems:"flex-end",height:36}}>
                {slice7.slice().reverse().map((r,i)=>{
                  const pct=(r.wt-minW)/range;
                  const h=Math.round(6+pct*26);
                  const isToday=i===slice7.length-1;
                  return(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{width:"100%",height:h,borderRadius:2,
                        background:isToday?P.sage:P.steel+"66",
                        transition:`height 0.6s ease ${i*60}ms`}}
                        title={`${r.d}: ${r.wt} lbs`}/>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                <span style={{fontFamily:FF.m,fontSize:7.5,color:P.muted}}>{HUME_DATA[6]?.d}</span>
                <span style={{fontFamily:FF.m,fontSize:7.5,color:P.muted}}>{HUME_DATA[0]?.d}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:6,borderTop:`1px solid ${P.border}`}}>
                <span style={S.mut9}>Range: {minW}–{maxW} lbs</span>
                <span style={S.mut9}>Avg: {(slice7.reduce((s,r)=>s+r.wt,0)/slice7.length).toFixed(1)} lbs</span>
              </div>
            </div>
          );
        })()}
        {HUME_DATA.length < 5&&(
          <div style={{padding:"10px 12px",background:P.panel,borderRadius:8,border:`1px dashed ${P.border}`,marginTop:8,fontFamily:FF.s,fontSize:10,color:P.muted,lineHeight:1.6}}>
            Import more Hume data via the ⬆ Import Data page to see your full weigh-in history.
          </div>
        )}
      </div>
    </div>
  </div>);
}

// HRV_ZONES now lives in src/lib/data/whoop.js

// IMPORT_PROMPT now lives in src/lib/data/prompts.js

