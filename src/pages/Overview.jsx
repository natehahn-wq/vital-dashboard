// Overview / "Dashboard" page — top-level summary tying together VITAL master
// score, latest WHOOP stats, body comp from Hume, lab snapshot, HRV trend, and
// the weekly sleep card. Hosts the "Export Weekly Report" entry point.
import { useState, useEffect } from "react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid,
  XAxis, YAxis, Tooltip,
} from "recharts";
import { P, FF, S } from "../lib/theme.js";
import { SCORE_COLOR, SCORE_LABEL, fmtH } from "../lib/utils.js";
import { SCORES_NOW } from "../lib/data/scores.js";
import { LATEST } from "../lib/data/body.js";
import { WHOOP, T } from "../lib/data/whoop.js";
import { LABS } from "../lib/data/labs.js";
import { generateWeeklyReport } from "../lib/weekly-report.js";
import { AnimRing, StatCard, SLabel, CTip } from "../components/shared.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";

export function Overview({setPage}){
  const mob = useIsMobile();
  const ax={tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};
  const masterScore=SCORES_NOW.master.score;
  const masterPrev=SCORES_NOW.master.prev;
  const masterDelta=masterScore-masterPrev;
  const scoreColor=SCORE_COLOR(masterScore);
  // Reactive weight — reads from localStorage so imports reflect without full reload
  const [liveWeight, setLiveWeight] = useState(()=>{
    try{
      const imp=JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
      return imp.length>0 ? imp[0].wt : LATEST.weight;
    }catch(e){ return LATEST.weight; }
  });
  const [liveWeightDate, setLiveWeightDate] = useState(()=>{
    try{
      const imp=JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
      return imp.length>0 ? imp[0].d : LATEST.weightDate;
    }catch(e){ return LATEST.weightDate; }
  });
  useEffect(()=>{
    const onStorage=()=>{
      try{
        const imp=JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
        if(imp.length>0){ setLiveWeight(imp[0].wt); setLiveWeightDate(imp[0].d); }
      }catch(e){}
    };
    window.addEventListener("storage",onStorage);
    return()=>window.removeEventListener("storage",onStorage);
  },[]);

  return(<div style={{display:"flex",flexDirection:"column",gap:20}}>
    {/* Weekly Report Export */}
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}>
      <button onClick={generateWeeklyReport}
        style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:9,
          border:`1px solid ${P.border}`,background:P.card,cursor:"pointer",
          fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.sub,
          boxShadow:"0 1px 3px rgba(0,0,0,.04)",transition:"all .15s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=P.amber;e.currentTarget.style.color=P.amber;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.color=P.sub;}}>
        <span style={{fontSize:14}}>📄</span> Export Weekly Report
      </button>
    </div>

    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"auto 1fr",gap:16,alignItems:"stretch"}}>
      <div onClick={()=>setPage("score")} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"28px 32px",cursor:"pointer",transition:"box-shadow .2s",boxShadow:"0 1px 4px rgba(0,0,0,.06)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:220}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.10)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.06)"}>
        <div style={{position:"relative",marginBottom:14}}>
          <svg width={160} height={160} style={{transform:"rotate(-90deg)"}}>
            <circle cx={80} cy={80} r={66} fill="none" stroke={P.panel} strokeWidth={8}/>
            <AnimRing cx={80} cy={80} r={66} stroke={scoreColor} sw={8} pct={masterScore/100} color={scoreColor} delay={200}/>
            {[0,20,40,60,80].map(pct=>{
              const angle=(pct/100)*2*Math.PI-Math.PI/2;
              const x1=80+62*Math.cos(angle),y1=80+62*Math.sin(angle);
              const x2=80+70*Math.cos(angle),y2=80+70*Math.sin(angle);
              return <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.border} strokeWidth={1.5}/>;
            })}
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:FF.r,fontSize:64,fontWeight:600,color:P.text,lineHeight:1,letterSpacing:"-0.02em"}}>{masterScore}</div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:3}}>/ 100</div>
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>VITAL Score</div>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color:scoreColor,letterSpacing:"-0.01em"}}>{SCORE_LABEL(masterScore)}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:6}}>
            <span style={{fontFamily:FF.s,fontSize:11,color:masterDelta>0?P.sage:P.terra,fontWeight:500}}>
              {masterDelta>0?"+":""}{masterDelta} pts since Feb
            </span>
            <span style={S.mut10}>· B+ grade</span>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
        <StatCard icon="💚" label="Recovery"    value={WHOOP.recovery}   unit="/100" color={P.sage}   delta={null} sparkData={T.rec}/>
        <StatCard icon="💓" label="HRV"         value={WHOOP.hrv}        unit="ms"   color={P.steel}  delta={2.1}  sparkData={T.hrv}/>
        <StatCard icon="❤" label="Resting HR"  value={WHOOP.rhr}        unit="bpm"  color={P.terra}  delta={-1.4} sparkData={T.rhr}/>
        <StatCard icon="⚖" label="Weight"      value={liveWeight}       unit="lbs"  color={P.steel}  delta={LATEST.weight7dDelta} sub={`Hume · ${liveWeightDate}`}/>
        <StatCard icon="🫀" label="Body Fat"    value={LATEST.bodyFat}   unit="%"    color={P.clay}   delta={-11.6}/>
        <StatCard icon="💪" label="Lean Mass"   value={LATEST.leanMass}  unit="lbs"  color={P.sage}   delta={5.7}/>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
      <div onClick={()=>setPage("labs")} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"20px",cursor:"pointer",transition:"box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)"}>
        <SLabel color={P.terra}>Latest Labs · May 23</SLabel>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {LABS.outOfRange.map(f=>(
            <div key={f.name} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:7,background:f.status==="high"?P.terracottaBg:P.amberBg,border:`1px solid ${f.status==="high"?"#C4604A33":"#C4783033"}`}}>
              <span style={{fontFamily:FF.s,fontSize:10,fontWeight:500,color:f.status==="high"?P.terra:P.amber}}>{f.status==="high"?"↑":"↓"} {f.name}</span>
            </div>
          ))}
        </div>
        {[
          {name:"HbA1c",   val:"5.3%",    status:"normal", range:"<5.7"},
          {name:"LDL",     val:"72",      status:"normal", range:"<100 mg/dL"},
          {name:"CRP",     val:"<0.2",    status:"normal", range:"<1.0 mg/L"},
          {name:"Ferritin",val:"178.2",   status:"normal", range:"<274.7"},
          {name:"Vit D",   val:"36.5",    status:"normal", range:"30–100"},
          {name:"Testo.",  val:"377.1",   status:"normal", range:"300–890"},
        ].map(b=>{
          const c=b.status==="normal"?P.sage:P.terra;
          return(<div key={b.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${P.panel}`}}>
            <span style={{fontFamily:FF.s,fontSize:11,color:P.sub}}>{b.name}</span>
            <div style={S.row8}>
              <span style={{fontFamily:FF.m,fontSize:11,fontWeight:500,color:P.text}}>{b.val}</span>
              <span style={{fontFamily:FF.s,fontSize:8,color:c,background:c+"15",padding:"1px 7px",borderRadius:99}}>{b.status==="normal"?"Optimal":"Flag"}</span>
            </div>
          </div>);
        })}
        <div style={{marginTop:12,fontFamily:FF.s,fontSize:10,color:P.muted}}>View full panel →</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"18px 20px",flex:1,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <SLabel color={P.sage} right="WHOOP · 30 days">HRV Trend</SLabel>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={T.hrv} margin={{top:4,right:0,left:-22,bottom:0}}>
              <defs><linearGradient id="gHrvOv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.sage} stopOpacity={.15}/>
                <stop offset="100%" stopColor={P.sage} stopOpacity={0}/>
              </linearGradient></defs>
              <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="d" {...ax} interval={5}/>
              <YAxis {...ax} domain={["auto","auto"]}/>
              <Tooltip content={<CTip/>}/>
              <Area type="monotone" dataKey="v" stroke={P.sage} strokeWidth={1.5} fill="url(#gHrvOv)" dot={false} name="HRV ms" isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" activeDot={{r:3,fill:P.sage}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <SLabel color={P.steel}>Sleep · WHOOP</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12}}>
            {[
              {label:"Avg Night",  val:fmtH(WHOOP.sleep.hours), color:P.steel},
              {label:"Performance",val:`${WHOOP.sleep.score}%`,color:P.sage},
              {label:"REM",       val:fmtH(WHOOP.sleep.rem),  color:P.violet},
              {label:"Deep SWS",  val:fmtH(WHOOP.sleep.deep), color:P.steel},
            ].map(({label,val,color})=>(
              <div key={label} style={{padding:"10px 12px",background:P.panel,borderRadius:10}}>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
                <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>);
}
