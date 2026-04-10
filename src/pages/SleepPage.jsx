// Sleep page — daily sleep score, duration, and stage breakdown.
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { P, FF, S, CS } from "../lib/theme.js";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { SLabel } from "../components/shared.jsx";
import { WHOOP, SLEEP_PIE } from "../lib/data/whoop.js";
import { WEEKLY_SLEEP } from "../lib/data/workouts.js";
import { CAL_DATA } from "../lib/data/calendar.js";

export function SleepPage(){
  const [range, setRange] = useState(16);
  const mob = useIsMobile();
  const ax = {tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  // Build daily data from CAL_DATA
  const dailyData = Object.entries(CAL_DATA)
    .filter(([,d])=>d.slp!=null&&d.sdur!=null)
    .sort(([a],[b])=>a.localeCompare(b))
    .map(([date,d])=>({
      d: date.slice(5),       // "MM-DD"
      date,
      score: d.slp,
      dur:   d.sdur,
      alc:   d.alc||0,
      rec:   d.rec||null,
    }));

  const sliceDays  = dailyData.slice(-range*7);
  const sliceWeeks = WEEKLY_SLEEP.slice(-range);

  // Stats
  const avg = (arr, key) => arr.length ? +(arr.reduce((s,v)=>s+(v[key]||0),0)/arr.length).toFixed(1) : 0;
  const avgScore = avg(sliceDays,'score');
  const avgDur   = avg(sliceDays,'dur');
  const sub100   = sliceDays.filter(d=>d.score<80).length;
  const over9    = sliceDays.filter(d=>d.dur>=9).length;
  const alcNights= sliceDays.filter(d=>d.alc);
  const alcAvg   = alcNights.length ? +(alcNights.reduce((s,d)=>s+d.score,0)/alcNights.length).toFixed(1) : null;
  const noAlcAvg = sliceDays.filter(d=>!d.alc).length
    ? +(sliceDays.filter(d=>!d.alc).reduce((s,d)=>s+d.score,0)/sliceDays.filter(d=>!d.alc).length).toFixed(1) : null;

  // Tonight optimal window
  const optBed  = "9:30 PM";
  const optWake = "6:15 AM";
  const targetHr = 8.75;

  const STAGE_TARGET = [
    {name:"REM",    val:WHOOP.sleep.rem,   target:2.0, color:P.violet, tip:"Memory consolidation & emotional processing"},
    {name:"Deep SWS",val:WHOOP.sleep.deep, target:1.5, color:P.sage,   tip:"Physical repair, immune function, HGH release"},
    {name:"Light",  val:WHOOP.sleep.light, target:3.5, color:P.steel,  tip:"Brain maintenance & memory encoding"},
    {name:"Awake",  val:WHOOP.sleep.awake, target:0.2, color:P.muted,  tip:"<5% ideal. Fragmentation hurts deep sleep."},
  ];

  return(<div style={{display:"flex",flexDirection:"column",gap:18}}>

    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          WHOOP · {dailyData.length} nights
        </div>
        <div style={S.h18}>Sleep Trends</div>
      </div>
      <div style={{display:"flex",gap:5}}>
        {[{v:4,l:"4W"},{v:8,l:"8W"},{v:16,l:"16W"}].map(r=>(
          <button key={r.v} onClick={()=>setRange(r.v)}
            style={{fontFamily:FF.s,fontSize:10,fontWeight:600,padding:"5px 11px",borderRadius:7,cursor:"pointer",
              border:`1px solid ${range===r.v?P.steel:P.border}`,
              background:range===r.v?P.steel+"18":P.card,
              color:range===r.v?P.steel:P.muted}}>
            {r.l}
          </button>
        ))}
      </div>
    </div>

    {/* Hero stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12}}>
      {[
        {icon:"🌙",label:"Avg Score",    val:`${avgScore}%`,  color:P.steel,  sub:`last ${sliceDays.length} nights`},
        {icon:"⏱",label:"Avg Duration", val:`${Math.floor(avgDur)}h ${Math.round((avgDur%1)*60)}m`, color:P.violet, sub:"per night"},
        {icon:"💤",label:"≥9h Nights",  val:`${over9}`,      color:P.sage,   sub:`${Math.round(over9/sliceDays.length*100)}% of nights`},
        {icon:"⚠",label:"<80% Score",  val:`${sub100}`,     color:sub100>4?P.terra:P.amber, sub:"nights needing attention"},
        {icon:"🍷",label:"Alc Impact",  val:alcAvg?`−${(noAlcAvg-alcAvg).toFixed(1)} pts`:"—", color:P.terra, sub:"vs sober nights"},
      ].map(({icon,label,val,color,sub})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:16,marginBottom:5}}>{icon}</div>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,letterSpacing:"-0.01em",marginBottom:1}}>{val}</div>
          <div style={S.mut9}>{label}</div>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:1}}>{sub}</div>
        </div>
      ))}
    </div>

    {/* Sleep Score trend */}
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <SLabel color={P.steel}>Sleep Performance Score</SLabel>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8}}>Daily score · target ≥95%</div>
        </div>
        <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:P.steel}}>{avgScore}<span style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginLeft:3}}>avg</span></div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart data={sliceDays} margin={{top:4,right:4,left:-22,bottom:0}}>
          <defs>
            <linearGradient id="gSlp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.steel} stopOpacity={0.25}/>
              <stop offset="100%" stopColor={P.steel} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" {...ax} interval={Math.max(1,Math.floor(sliceDays.length/8))}/>
          <YAxis {...ax} domain={[60,102]}/>
          <ReferenceLine y={95} stroke={P.sage} strokeDasharray="4 3" strokeOpacity={0.5}
            label={{value:"95%",position:"right",fontFamily:FF.s,fontSize:8,fill:P.sage,opacity:0.7}}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(
            <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px"}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:3}}>{label}</div>
              <div style={{fontFamily:FF.m,fontSize:12,color:P.steel}}>{payload[0]?.value}%</div>
              {payload[0]?.payload?.alc?<div style={{fontFamily:FF.s,fontSize:8,color:P.terra,marginTop:2}}>🍷 alcohol night</div>:null}
            </div>):null}/>
          <Area type="monotone" dataKey="score" stroke={P.steel} strokeWidth={1.8}
            fill="url(#gSlp)" dot={false}
            activeDot={{r:3,fill:P.steel,stroke:P.card,strokeWidth:2}}/>
          {/* Alcohol dot markers */}
          {sliceDays.filter(d=>d.alc).map((d,i)=>(
            <ReferenceLine key={i} x={d.d} stroke={P.terra} strokeOpacity={0.3} strokeWidth={1}/>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>

    {/* Tonight's sleep stage targets */}
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <SLabel color={P.violet}>Last Night · Stage Breakdown</SLabel>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8}}>
            {WHOOP.sleep.score}% performance · {Math.floor(WHOOP.sleep.hours)}h {Math.round((WHOOP.sleep.hours%1)*60)}m total
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:P.violet,letterSpacing:"-0.01em"}}>{WHOOP.sleep.score}%</div>
          <div style={S.mut9}>Sleep Performance</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {STAGE_TARGET.map(({name,val,target,color,tip})=>{
          const pct = Math.min(100,(val/target)*100);
          const over = val >= target;
          return(
            <div key={name}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
                  <span style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>{name}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>target {target}h</span>
                  <span style={{fontFamily:FF.m,fontSize:13,fontWeight:600,color:over?P.sage:P.amber}}>
                    {Math.floor(val)}h {String(Math.round((val%1)*60)).padStart(2,"0")}m
                  </span>
                  {over
                    ? <span style={{fontFamily:FF.s,fontSize:8,color:P.sage,fontWeight:700}}>✓</span>
                    : <span style={{fontFamily:FF.s,fontSize:8,color:P.amber}}>−{((target-val)*60).toFixed(0)}m</span>
                  }
                </div>
              </div>
              <div style={{height:7,background:P.panel,borderRadius:4,overflow:"hidden",border:`1px solid ${P.border}`}}>
                <div style={{height:"100%",width:`${Math.min(100,pct)}%`,
                  background:`linear-gradient(to right,${color}88,${color})`,
                  borderRadius:4,transition:"width 0.7s cubic-bezier(0.34,1.1,0.64,1)"}}/>
              </div>
              <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:3}}>{tip}</div>
            </div>
          );
        })}
      </div>

      {/* Stage pie */}
      <div style={{display:"flex",alignItems:"center",gap:20,marginTop:16,paddingTop:12,borderTop:`1px solid ${P.border}`}}>
        <ResponsiveContainer width={100} height={100}>
          <PieChart>
            <Pie data={SLEEP_PIE} dataKey="v" cx="50%" cy="50%" innerRadius={28} outerRadius={46}
              paddingAngle={2} isAnimationActive={true} animationDuration={700}>
              {SLEEP_PIE.map((e,i)=><Cell key={i} fill={e.col}/>)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
          {SLEEP_PIE.map(({name,v,col})=>(
            <div key={name} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
              <span style={{fontFamily:FF.s,fontSize:10,color:P.sub,flex:1}}>{name}</span>
              <span style={{fontFamily:FF.m,fontSize:11,fontWeight:600,color:P.text}}>{Math.floor(v)}h {String(Math.round((v%1)*60)).padStart(2,"0")}m</span>
              <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>{Math.round(v/WHOOP.sleep.hours*100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Duration + Weekly avg */}
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:16}}>

      {/* Daily duration */}
      <div style={CS()}>
        <SLabel color={P.violet}>Sleep Duration · Daily</SLabel>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8,marginBottom:10}}>Hours slept · dashed = 8h floor / 9h optimal</div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={sliceDays} margin={{top:4,right:4,left:-22,bottom:0}}>
            <defs>
              <linearGradient id="gDur" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.violet} stopOpacity={0.20}/>
                <stop offset="100%" stopColor={P.violet} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax} interval={Math.max(1,Math.floor(sliceDays.length/6))}/>
            <YAxis {...ax} domain={[5.5,12]}/>
            <ReferenceLine y={8} stroke={P.amber} strokeDasharray="3 3" strokeOpacity={0.5}/>
            <ReferenceLine y={9} stroke={P.sage} strokeDasharray="4 3" strokeOpacity={0.4}/>
            <Tooltip content={({active,payload})=>active&&payload?.length?(
              <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontFamily:FF.m,fontSize:12,color:P.violet}}>{payload[0]?.value}h</div>
              </div>):null}/>
            <Area type="monotone" dataKey="dur" stroke={P.violet} strokeWidth={1.8}
              fill="url(#gDur)" dot={false}
              activeDot={{r:3,fill:P.violet,stroke:P.card,strokeWidth:2}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly avg */}
      <div style={CS()}>
        <SLabel color={P.sage}>Weekly Sleep Score Avg</SLabel>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8,marginBottom:10}}>7-day rolling average</div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={sliceWeeks} margin={{top:4,right:4,left:-22,bottom:0}}>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="label" {...ax} interval={0}/>
            <YAxis {...ax} domain={[75,102]}/>
            <ReferenceLine y={95} stroke={P.sage} strokeDasharray="3 3" strokeOpacity={0.4}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(
              <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>{label}</div>
                <div style={{fontFamily:FF.m,fontSize:12,color:P.sage}}>{payload[0]?.value}%</div>
              </div>):null}/>
            <Bar dataKey="score" radius={[3,3,0,0]} isAnimationActive={true} animationDuration={800}>
              {sliceWeeks.map((w,i)=>(
                <Cell key={i} fill={w.score>=95?P.sage:w.score>=88?P.amber:P.terra}
                  opacity={0.8}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Alcohol impact */}
    <div style={CS()}>
      <SLabel color={P.terra}>🍷 Alcohol Impact on Sleep</SLabel>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8,marginBottom:14}}>
        Based on {Object.values(CAL_DATA).filter(d=>d.alc).length} alcohol nights vs {Object.values(CAL_DATA).filter(d=>!d.alc&&d.slp).length} sober nights
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        {[
          {label:"Sober Nights",     val:"95.1%", sub:"avg sleep score",       color:P.sage},
          {label:"After Alcohol",    val:"88.3%", sub:"avg sleep score",       color:P.terra},
          {label:"Score Drop",       val:"−6.8 pts", sub:"per drinking night", color:P.terra},
        ].map(({label,val,sub,color})=>(
          <div key={label} style={{padding:"10px 12px",background:P.panel,borderRadius:10,border:`1px solid ${P.border}`}}>
            <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color,letterSpacing:"-0.01em",marginBottom:1}}>{val}</div>
            <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.text}}>{label}</div>
            <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:1}}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"10px 14px",background:P.terra+"08",borderRadius:8,border:`1px solid ${P.terra}22`}}>
        <span style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6}}>
          Alcohol suppresses deep SWS and REM sleep even in small amounts. Your data shows a consistent
          <span style={{color:P.terra,fontWeight:600}}> 6.8-point drop</span> the night after drinking.
          The HRV impact averages <span style={{color:P.terra,fontWeight:600}}>−13ms</span> the following morning.
        </span>
      </div>
    </div>

    {/* Tonight's optimal window */}
    <div style={{background:P.cardDk,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"18px 20px"}}>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Tonight</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
        {[
          {icon:"🌙",label:"Target Bedtime",  val:optBed,   color:"#C4A850"},
          {icon:"☀",label:"Target Wake",    val:optWake,  color:"#7AC49A"},
          {icon:"🌡",label:"Room Temp",       val:"67–68°F", color:"#6BAED6"},
          {icon:"⏱",label:"Sleep Window",   val:`${targetHr}h`,color:"#A890D0"},
        ].map(({icon,label,val,color})=>(
          <div key={label} style={{padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:9,border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontSize:16,marginBottom:5}}>{icon}</div>
            <div style={{fontFamily:FF.m,fontSize:14,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
            <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",marginTop:1}}>{label}</div>
          </div>
        ))}
      </div>
    </div>

  </div>);
}
