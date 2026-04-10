// Peloton page — locally-stored workout history with filter/sort/search.
import { useState } from "react";
import { P, FF, S, CS } from "../lib/theme.js";

export function PelotonPage(){
  const [peloData, setPeloData] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem("vital_peloton_v1")||"[]"); }catch(e){ return []; }
  });
  const [filter,   setFilter]   = useState("all");
  const [sortBy,   setSortBy]   = useState("date");
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);

  const DISCIPLINE_META = {
    cycling:    {icon:"🚴",color:"#E60000",label:"Cycling"},
    running:    {icon:"🏃",color:"#C47830",label:"Running"},
    strength:   {icon:"🏋",color:"#3A5C48",label:"Strength"},
    stretching: {icon:"🧘",color:"#7A5A80",label:"Stretching"},
    yoga:       {icon:"🧘",color:"#7A5A80",label:"Yoga"},
    meditation: {icon:"🧠",color:"#4A6070",label:"Meditation"},
    cardio:     {icon:"⚡",color:"#C4604A",label:"Cardio"},
    walking:    {icon:"🚶",color:"#6B6057",label:"Walking"},
    other:      {icon:"⚡",color:"#6B6057",label:"Other"},
  };

  const getMeta = (disc="") => {
    const key = disc.toLowerCase().trim();
    return DISCIPLINE_META[key] || DISCIPLINE_META.other;
  };

  const filtered = peloData.filter(w=>{
    if(filter!=="all" && (w.discipline||"").toLowerCase()!==filter) return false;
    if(search){
      const q = search.toLowerCase();
      if(!(w.title||"").toLowerCase().includes(q) &&
         !(w.instructor||"").toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a,b)=>{
    if(sortBy==="output")    return (b.output||0)-(a.output||0);
    if(sortBy==="calories")  return (b.calories||0)-(a.calories||0);
    if(sortBy==="hr")        return (b.avgHR||0)-(a.avgHR||0);
    if(sortBy==="duration")  return (b.duration||0)-(a.duration||0);
    return (b.dateKey||"").localeCompare(a.dateKey||"");
  });

 
  const hasData = peloData.length > 0;
  const cyclingWorks = peloData.filter(w=>(w.discipline||"").toLowerCase()==="cycling");
  const totalOutput  = cyclingWorks.reduce((s,w)=>s+(w.output||0),0);
  const avgOutput    = cyclingWorks.length ? Math.round(totalOutput/cyclingWorks.length) : 0;
  const totalCal     = peloData.reduce((s,w)=>s+(w.calories||0),0);
  const totalDur     = peloData.reduce((s,w)=>s+(w.duration||0),0);
  const avgHR        = peloData.filter(w=>w.avgHR>0);
  const avgHRVal     = avgHR.length ? Math.round(avgHR.reduce((s,w)=>s+w.avgHR,0)/avgHR.length) : 0;

  // By discipline
  const byDisc = peloData.reduce((acc,w)=>{
    const k=(w.discipline||"other").toLowerCase();
    if(!acc[k]) acc[k]={count:0,cal:0,dur:0};
    acc[k].count++; acc[k].cal+=w.calories||0; acc[k].dur+=w.duration||0;
    return acc;
  },{});

  const fmtDate = (dateKey="") => {
    if(!dateKey) return "—";
    const d = new Date(dateKey+"T12:00:00");
    return isNaN(d)?dateKey:d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"});
  };
  const fmtDur = (mins) => mins>=60?`${Math.floor(mins/60)}h ${mins%60}m`:`${mins}m`;

  return(<div style={S.col16}>
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:"#E60000",letterSpacing:"0.12em",
          textTransform:"uppercase",marginBottom:3,fontWeight:600}}>Peloton · Separate data layer</div>
        <div style={S.h18}>Peloton Workouts</div>
      </div>
      <div style={{display:"flex",gap:6}}>
        {hasData&&(
          <button onClick={()=>{ if(window.confirm("Clear all Peloton data?")){ localStorage.removeItem("vital_peloton_v1"); setPeloData([]); }}}
            style={{fontFamily:FF.s,fontSize:9,padding:"4px 10px",borderRadius:6,
              border:`1px solid ${P.border}`,background:P.panel,color:P.muted,cursor:"pointer"}}>
            Clear data
          </button>
        )}
      </div>
    </div>
    {!hasData&&(
      <div style={{background:P.card,border:`1.5px dashed ${P.border}`,borderRadius:16,
        padding:"48px 32px",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>🚴</div>
        <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.text,marginBottom:6}}>No Peloton data yet</div>
        <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,maxWidth:380,margin:"0 auto",lineHeight:1.8,marginBottom:16}}>
          Sign in at <strong>members.onepeloton.com</strong> → Workouts → <strong>"Download Workouts"</strong> → drag the CSV into Import Data → Peloton tab.
        </div>
        <a href="https://members.onepeloton.com/profile/workouts" target="_blank"
          style={{fontFamily:FF.s,fontSize:11,fontWeight:700,padding:"9px 20px",borderRadius:8,
            background:"#E60000",color:"#fff",textDecoration:"none",display:"inline-block"}}>
          Open Peloton →
        </a>
      </div>
    )}

    {hasData&&(<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12}}>
        {[
          {icon:"🚴",label:"Total Workouts",  val:peloData.length,        color:"#E60000", sub:`${cyclingWorks.length} cycling`},
          {icon:"⚡",label:"Total Output",    val:totalOutput>0?`${totalOutput.toLocaleString()} kJ`:"—", color:P.amber, sub:`${avgOutput} kJ avg/ride`},
          {icon:"⏱",label:"Total Time",      val:fmtDur(totalDur),       color:P.sage,   sub:`${Math.round(totalDur/peloData.length)}m avg`},
          {icon:"🔥",label:"Calories",        val:totalCal.toLocaleString(),color:P.terra, sub:`${Math.round(totalCal/peloData.length)}/session`},
          {icon:"❤",label:"Avg Heart Rate",  val:avgHRVal>0?`${avgHRVal} bpm`:"—", color:P.coral, sub:"across all sessions"},
        ].map(({icon,label,val,color,sub})=>(
          <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,
            padding:"12px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
            <div style={{fontSize:16,marginBottom:6}}>{icon}</div>
            <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,lineHeight:1,marginBottom:2,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"-0.01em"}}>{val}</div>
            <div style={S.sub9}>{label}</div>
            <div style={S.mut8}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={CS(14,"16px 18px","none")}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:12}}>Workout Mix</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
          {Object.entries(byDisc).sort((a,b)=>b[1].count-a[1].count).map(([disc,stats])=>{
            const meta = getMeta(disc);
            const isActive = filter===disc;
            return(
              <div key={disc}
                onClick={()=>setFilter(f=>f===disc?"all":disc)}
                style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",
                  border:`1.5px solid ${isActive?meta.color:P.border}`,
                  background:isActive?meta.color+"08":P.panel,transition:"all .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <span style={{fontSize:16}}>{meta.icon}</span>
                  <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.text}}>{meta.label}</span>
                </div>
                <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:meta.color}}>{stats.count}</div>
                <div style={S.mut8}>
                  {fmtDur(Math.round(stats.dur/stats.count))} avg
                  {stats.cal>0?` · ${Math.round(stats.cal/stats.count)} cal`:""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search title or instructor…"
          style={{flex:1,minWidth:140,padding:"8px 12px",borderRadius:8,border:`1px solid ${P.border}`,
            fontFamily:FF.s,fontSize:11,background:P.card,color:P.text,outline:"none"}}/>
        <div style={{display:"flex",gap:5}}>
          {[
            {id:"date",label:"Date"},
            {id:"output",label:"Output"},
            {id:"calories",label:"Cal"},
            {id:"hr",label:"HR"},
            {id:"duration",label:"Time"},
          ].map(s=>(
            <button key={s.id} onClick={()=>setSortBy(s.id)}
              style={{fontFamily:FF.s,fontSize:10,fontWeight:600,padding:"5px 11px",borderRadius:7,
                border:`1px solid ${sortBy===s.id?"#E60000":P.border}`,
                background:sortBy===s.id?"#E6000012":P.card,
                color:sortBy===s.id?"#E60000":P.muted,cursor:"pointer"}}>
              {s.label}
            </button>
          ))}
        </div>
        {filter!=="all"&&(
          <button onClick={()=>setFilter("all")}
            style={{fontFamily:FF.s,fontSize:10,padding:"5px 10px",borderRadius:7,
              border:`1px solid ${P.border}`,background:P.panel,color:P.muted,cursor:"pointer"}}>
            Clear ✕
          </button>
        )}
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:"auto"}}>
          {filtered.length} of {peloData.length}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filtered.slice(0,100).map((w,i)=>{
          const meta = getMeta(w.discipline);
          const isExp = expanded===i;
          return(
            <div key={i}
              style={{background:P.card,border:`1px solid ${isExp?meta.color+"55":P.border}`,
                borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"border-color .15s"}}
              onClick={()=>setExpanded(isExp?null:i)}>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px"}}>
                <div style={{width:36,height:36,borderRadius:9,background:meta.color+"14",
                  border:`1px solid ${meta.color}30`,display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:18,flexShrink:0}}>{meta.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.text,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.title||meta.label}</div>
                  <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:1}}>
                    {fmtDate(w.dateKey)}{w.instructor?` · ${w.instructor}`:""}{w.duration?` · ${w.duration}min`:""}
                  </div>
                </div>
                <div style={{display:"flex",gap:12,flexShrink:0,alignItems:"center"}}>
                  {w.output>0&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color:P.amber}}>{w.output}</div>
                      <div style={S.mut8}>kJ</div>
                    </div>
                  )}
                  {w.calories>0&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color:P.terra}}>{w.calories}</div>
                      <div style={S.mut8}>cal</div>
                    </div>
                  )}
                  {w.avgHR>0&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color:"#E60000"}}>{w.avgHR}</div>
                      <div style={S.mut8}>bpm</div>
                    </div>
                  )}
                  <span style={{fontFamily:FF.s,fontSize:10,color:P.muted,opacity:0.5}}>{isExp?"▲":"▼"}</span>
                </div>
              </div>
              {isExp&&(
                <div style={{borderTop:`1px solid ${P.border}`,padding:"10px 14px",background:P.panel,
                  display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}}>
                  {[
                    {label:"Output",      val:w.output>0?`${w.output} kJ`:"—"},
                    {label:"Avg Watts",   val:w.avgWatts>0?`${w.avgWatts}w`:"—"},
                    {label:"Max Watts",   val:w.maxWatts>0?`${w.maxWatts}w`:"—"},
                    {label:"Avg Cadence", val:w.avgCadence>0?`${w.avgCadence} rpm`:"—"},
                    {label:"Avg Resist",  val:w.avgResistance>0?`${w.avgResistance}%`:"—"},
                    {label:"Avg Speed",   val:w.avgSpeed>0?`${w.avgSpeed} mph`:"—"},
                    {label:"Distance",    val:w.distance>0?`${w.distance.toFixed(2)} mi`:"—"},
                    {label:"Avg HR",      val:w.avgHR>0?`${w.avgHR} bpm`:"—"},
                    {label:"Max HR",      val:w.maxHR>0?`${w.maxHR} bpm`:"—"},
                    {label:"Calories",    val:w.calories>0?`${w.calories} kcal`:"—"},
                    {label:"Duration",    val:w.duration>0?`${w.duration} min`:"—"},
                    {label:"Instructor",  val:w.instructor||"—"},
                  ].map(({label,val})=>(
                    <div key={label}>
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",
                        letterSpacing:"0.06em",marginBottom:2}}>{label}</div>
                      <div style={{fontFamily:FF.m,fontSize:10,color:P.text}}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length>100&&(
          <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,textAlign:"center",padding:12}}>
            Showing 100 of {filtered.length} — use search or filter
          </div>
        )}
      </div>

    </>)}

  </div>);
}
