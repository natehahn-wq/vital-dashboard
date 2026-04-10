// Readiness page — HRV zones, recovery debt tracker, and 55-week HRV trend.
// Anchored to a personal HRV baseline of 44.4 ms ± 5.0.
import { useState } from "react";
import {
  ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis,
  ReferenceLine, Tooltip, Bar, Cell, Line, Area,
} from "recharts";
import { P, FF, S, CS } from "../lib/theme.js";
import { WHOOP, HRV_ZONES, RECOVERY_DEBT_SERIES } from "../lib/data/whoop.js";
import { SLabel } from "../components/shared.jsx";

function getZone(hrv){ return HRV_ZONES.find(z=>hrv>z.min&&hrv<=z.max)||HRV_ZONES[2]; }

export function ReadinessPage(){
  const [view,setView]=useState("today");
  const ax={tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  const todayHRV  = WHOOP.hrv;
  const todayRec  = WHOOP.recovery;
  const todayRHR  = WHOOP.rhr;
  const todayZone = getZone(todayHRV);

  const current   = RECOVERY_DEBT_SERIES[RECOVERY_DEBT_SERIES.length-1];
  const prev4     = RECOVERY_DEBT_SERIES.slice(-5,-1);
  const avg4wkHRV = +(prev4.reduce((s,w)=>s+w.hrv,0)/prev4.length).toFixed(1);
  const currentDebt=current.debt;

  const strainRec={
    4:{min:15,max:21,label:"Push hard — 15–21 strain",color:"#5BC4F0"},
    3:{min:12,max:16,label:"Go strong — 12–16 strain",color:"#3A9C68"},
    2:{min:8, max:13,label:"Moderate — 8–13 strain",  color:"#C47830"},
    1:{min:4, max:8, label:"Easy only — 4–8 strain",  color:"#C4604A"},
    0:{min:0, max:4, label:"Rest day — <4 strain",    color:"#8B2020"},
  }[todayZone.id];

  const chartData=view==="today"?RECOVERY_DEBT_SERIES.slice(-4):view==="week"?RECOVERY_DEBT_SERIES.slice(-13):RECOVERY_DEBT_SERIES;

  return(<div style={S.col16}>
    <div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>WHOOP · 55-week baseline</div>
      <div style={S.h18}>HRV Zones & Recovery Debt</div>
    </div>
    <div style={{background:`linear-gradient(135deg,${todayZone.color}18 0%,${todayZone.color}08 100%)`,border:`1.5px solid ${todayZone.color}55`,borderRadius:18,padding:"22px 24px",boxShadow:`0 4px 24px ${todayZone.color}18`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Today's Readiness Zone</div>
          <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:6}}>
            <div style={{fontFamily:FF.r,fontSize:52,fontWeight:700,color:todayZone.color,letterSpacing:"-0.03em",lineHeight:1}}>{todayHRV}</div>
            <div>
              <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginBottom:2}}>ms HRV</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:99,background:todayZone.color+"22",border:`1px solid ${todayZone.color}55`}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:todayZone.color,boxShadow:`0 0 8px ${todayZone.color}`}}/>
                <span style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:todayZone.color,letterSpacing:"0.04em"}}>{todayZone.label.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.6,maxWidth:360}}>{todayZone.desc}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12,minWidth:160}}>
          {[
            {label:"Recovery", val:`${todayRec}%`,  note:todayRec>=76?"Above avg":todayRec>=58?"Normal":"Below avg", color:todayRec>=76?P.sage:todayRec>=58?P.amber:P.terra},
            {label:"RHR",      val:`${todayRHR} bpm`,note:todayRHR<=48?"Excellent":todayRHR<=52?"Normal":"Elevated",color:todayRHR<=48?P.sage:todayRHR<=52?P.amber:P.terra},
            {label:"4-wk HRV", val:`${avg4wkHRV} ms`,note:"rolling avg",color:P.steel},
          ].map(({label,val,note,color})=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,0.5)",border:`1px solid ${P.border}`}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:FF.m,fontSize:12,fontWeight:600,color}}>{val}</div>
                <div style={S.mut8}>{note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:16,paddingTop:14,borderTop:`1px solid ${todayZone.color}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Training Prescription</div>
            <div style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.text}}>{todayZone.training}</div>
          </div>
          <div style={{padding:"8px 16px",borderRadius:10,background:strainRec.color+"18",border:`1px solid ${strainRec.color}44`}}>
            <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:2}}>Target Strain</div>
            <div style={{fontFamily:FF.m,fontSize:14,fontWeight:700,color:strainRec.color}}>{strainRec.label}</div>
          </div>
        </div>
        <div style={{marginTop:12}}>
          <div style={{height:8,borderRadius:4,background:"linear-gradient(to right,#8B2020,#C4604A,#C47830,#3A9C68,#5BC4F0)",position:"relative",overflow:"visible"}}>
            <div style={{position:"absolute",top:-4,left:`${Math.min(95,Math.max(2,(todayHRV-30)/35*100))}%`,width:16,height:16,borderRadius:"50%",background:"#fff",border:`3px solid ${todayZone.color}`,boxShadow:`0 2px 8px ${todayZone.color}66`,transform:"translateX(-50%)"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            {HRV_ZONES.slice().reverse().map(z=>(<div key={z.id} style={{fontFamily:FF.s,fontSize:7.5,color:z.id===todayZone.id?z.color:P.muted,fontWeight:z.id===todayZone.id?700:400}}>{z.label}</div>))}
          </div>
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
      {HRV_ZONES.slice().reverse().map(z=>(
        <div key={z.id} style={{padding:"12px 14px",borderRadius:12,background:z.id===todayZone.id?z.bg:P.panel,border:`1px solid ${z.id===todayZone.id?z.color+"66":P.border}`,boxShadow:z.id===todayZone.id?`0 2px 12px ${z.color}22`:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:z.color,boxShadow:z.id===todayZone.id?`0 0 8px ${z.color}`:""}}/>
            <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:z.id===todayZone.id?z.color:P.sub}}>{z.label}</span>
            {z.id===todayZone.id&&<span style={{fontFamily:FF.s,fontSize:7,color:z.color,background:z.color+"15",padding:"1px 5px",borderRadius:3,marginLeft:"auto",letterSpacing:"0.06em"}}>NOW</span>}
          </div>
          <div style={{fontFamily:FF.m,fontSize:10,fontWeight:600,color:z.id===todayZone.id?z.color:P.muted,marginBottom:4}}>{z.range}</div>
          <div style={{fontFamily:FF.s,fontSize:8.5,color:P.muted,lineHeight:1.5}}>{z.desc}</div>
        </div>
      ))}
    </div>
    <div style={CS(16,"20px","0 1px 4px rgba(0,0,0,.05)")}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <SLabel color={P.steel}>Recovery Debt Tracker</SLabel>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-10}}>Distance from your personal recovery baseline (66.6%). Positive = surplus, negative = deficit.</div>
        </div>
        <div style={{padding:"8px 14px",borderRadius:10,background:currentDebt>=0?"rgba(58,156,104,0.12)":"rgba(196,96,74,0.10)",border:`1px solid ${currentDebt>=0?P.sage:P.terra}44`}}>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.08em"}}>Current</div>
          <div style={{fontFamily:FF.r,fontSize:22,fontWeight:700,color:currentDebt>=0?P.sage:P.terra,lineHeight:1}}>{currentDebt>0?"+":""}{currentDebt.toFixed(1)}%</div>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:2}}>{currentDebt>=4?"Surplus — push hard":currentDebt>=-2?"Near baseline":currentDebt>=-6?"Mild deficit — back off":"Significant deficit"}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{k:"today",l:"4 wks"},{k:"week",l:"13 wks"},{k:"full",l:"Full year"}].map(({k,l})=>(
          <button key={k} onClick={()=>setView(k)} style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:7,cursor:"pointer",transition:"all .15s",background:view===k?P.cardDk:P.card,color:view===k?P.textInv:P.sub,border:`1px solid ${view===k?P.cardDk:P.border}`}}>{l}</button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={chartData} margin={{top:8,right:8,left:-18,bottom:0}}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={view==="full"?7:view==="week"?2:0}/>
          <YAxis {...ax} domain={[-12,14]} tickFormatter={v=>v>0?`+${v}`:v}/>
          <ReferenceLine y={0} stroke={P.muted} strokeWidth={1.5}/>
          <ReferenceLine y={9}  stroke={P.sage}  strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}/>
          <ReferenceLine y={-9} stroke={P.terra} strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,padding:"10px 14px",fontFamily:FF.s,fontSize:10,boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}><div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:6}}>{label}</div>{payload.map(p=><div key={p.name} style={{display:"flex",justifyContent:"space-between",gap:18,marginBottom:3}}><span style={{color:P.muted}}>{p.name}</span><span style={{fontFamily:FF.m,fontWeight:600,color:p.name==="Debt"?(p.value>=0?P.sage:P.terra):P.steel}}>{p.name==="Debt"?(p.value>0?"+":"")+p.value+"%":p.value+" ms"}</span></div>)}</div>):null}/>
          <Bar dataKey="debt" name="Debt" radius={[2,2,0,0]} isAnimationActive={true} animationDuration={900} maxBarSize={20}>
            {chartData.map((d,i)=><Cell key={i} fill={d.debt>=0?P.sage:P.terra} opacity={0.65}/>)}
          </Bar>
          <Line type="monotone" dataKey="hrv" name="HRV" stroke={P.steel} strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={900}/>
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap"}}>
        {[{c:P.sage,l:"Recovery surplus"},{c:P.terra,l:"Recovery deficit"},{c:P.steel,l:"HRV (ms)"}].map(({c,l})=>(<div key={l} style={S.row5}><div style={{width:10,height:10,borderRadius:2,background:c,opacity:0.7}}/><span style={{fontFamily:FF.s,fontSize:8.5,color:P.muted}}>{l}</span></div>))}
      </div>
    </div>
    <div style={CS(16,"20px","0 1px 4px rgba(0,0,0,.05)")}>
      <SLabel color={P.sage}>HRV Trend · 55 Weeks · Personal Zones</SLabel>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-10,marginBottom:14}}>4-week rolling average with personal zone thresholds.</div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={RECOVERY_DEBT_SERIES} margin={{top:8,right:8,left:-18,bottom:0}}>
          <defs><linearGradient id="gHRVLine" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.sage} stopOpacity="0.20"/><stop offset="100%" stopColor={P.sage} stopOpacity="0"/></linearGradient></defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={7}/>
          <YAxis {...ax} domain={[28,58]}/>
          {[{y:49.4,c:"#5BC4F0",l:"Peak"},{y:46.9,c:"#3A9C68",l:"Elevated"},{y:44.4,c:P.muted,l:"Mean 44.4"},{y:41.9,c:"#C4604A",l:"Low"},{y:38.9,c:"#8B2020",l:"Suppressed"}].map(({y,c,l})=>(
            <ReferenceLine key={y} y={y} stroke={c} strokeDasharray={y===44.4?"6 3":"3 3"} strokeOpacity={0.45} strokeWidth={y===44.4?1.5:1}
              label={{value:l,position:"right",fontFamily:FF.s,fontSize:7.5,fill:c,opacity:0.7}}/>
          ))}
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,padding:"10px 14px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,fontSize:9,marginBottom:6}}>{label}</div>{payload.map(p=>{const z=getZone(p.value);return(<div key={p.name} style={{display:"flex",justifyContent:"space-between",gap:16}}><span style={{color:P.muted}}>HRV</span><span style={{fontFamily:FF.m,fontWeight:700,color:z.color}}>{p.value} ms — {z.label}</span></div>);})}</div>):null}/>
          <Area type="monotone" dataKey="hrv" stroke={P.sage} strokeWidth={2} fill="url(#gHRVLine)"
            dot={(p)=>p.index%4===0?<circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill={getZone(p.value).color} stroke={P.card} strokeWidth={1.5}/>:<g key={p.index}/>}
            isAnimationActive={true} animationDuration={1000} name="HRV (4wk rolling)"/>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <div style={{background:P.cardDk,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"18px"}}>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Key Readiness Insights · From Your Data</div>
      <div style={S.col10}>
        {[
          {icon:"📈",text:`You're in a positive HRV trend — up +4.1 ms over the last 13 weeks. Recovery debt is currently ${currentDebt>0?"+":""}${currentDebt.toFixed(1)}% — ${currentDebt>0?"you have a surplus to spend on hard training.":"monitor and protect recovery."}`},
          {icon:"📅",text:"May and September are historically your Peak Zone months (50 ms avg). Plan your most ambitious training blocks around these windows. August is your trough — don't force peak performance in summer heat."},
          {icon:"⚠",text:"Jan–Feb 2026 was your longest Low Zone stretch (8 consecutive weeks). Watch for this pattern repeating next winter."},
          {icon:"💡",text:`Current zone (${todayZone.label}) recommends: ${todayZone.training}. Your personal 'go hard' threshold is HRV ≥ 47ms. Today at ${todayHRV}ms you're ${todayHRV>=47?"above":"below"} that threshold.`},
        ].map(({icon,text})=>(
          <div key={text.slice(0,20)} style={{display:"flex",gap:12,padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}>
            <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
            <div style={{fontFamily:FF.s,fontSize:10,color:P.mutedDk,lineHeight:1.7}}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  </div>);
}
