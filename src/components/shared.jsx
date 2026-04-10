// Shared UI primitives used across pages: layout grid, sparkline, rings,
// stat cards, biomarker cards, and the master/sub-score rings on the Health Score page.
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { P, FF, S } from "../lib/theme.js";
import { SCORE_COLOR, SCORE_LABEL, easeOut, easeSpring } from "../lib/utils.js";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { useAnimNum } from "../hooks/useAnimNum.js";
import { useAnimRing } from "../hooks/useAnimRing.js";
import { useCountUp } from "../hooks/useCountUp.js";

export function RGrid({cols,mobCols=1,gap=12,children,style={}}){
  const mob=useIsMobile();
  return <div style={{display:"grid",gridTemplateColumns:`repeat(${mob?mobCols:cols},1fr)`,gap,...style}}>{children}</div>;
}

export function Spark({data,color,height=40}){
  const safeId="s"+color.replace(/[^a-zA-Z0-9]/g,"");
  return(<ResponsiveContainer width="100%" height={height}><AreaChart data={data} margin={{top:2,right:0,left:0,bottom:0}}><defs><linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={.2}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${safeId})`} dot={false} isAnimationActive={false}/></AreaChart></ResponsiveContainer>);
}

export function Ring({value,max=100,color,size=60,stroke=5,label}){
  const r=(size-stroke*2)/2,circ=2*Math.PI*r,dash=circ*(value/max),gap=circ-dash;
  return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={P.border} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 4px ${color}88)`,transition:"stroke-dasharray .8s ease"}}/>
    </svg>
    {label&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.m,fontSize:10,fontWeight:600,color}}>{label}</div>}
  </div>);
}

export function StatCard({icon,label,value,unit,color,delta,sparkData,dark,sub}){
  const n=parseFloat(value)||0;const a=useAnimNum(n);const disp=Number.isInteger(n)?Math.round(a):a.toFixed(1);
  const bg=dark?P.cardDk:P.card;const bd=dark?P.borderDk:P.border;const txt=dark?P.textInv:P.text;const st=dark?P.mutedDk:P.sub;
  const dPos=delta>=0;const dCol=dPos?"#3A5C48":"#C4604A";const dBg=dPos?"#EBF0EC":"#FDF1EE";
  return(<div style={{background:bg,border:"none",borderRadius:14,padding:"16px 18px",position:"relative",overflow:"hidden",cursor:"default",transition:"all .25s",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.10)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.06)";}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
      <span style={{fontSize:18,lineHeight:1,opacity:.85}}>{icon}</span>
      {delta!=null&&<span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:dCol,background:dBg,padding:"2px 7px",borderRadius:99,letterSpacing:"0.02em"}}>{dPos?"+":""}{delta}%</span>}
    </div>
    <div style={{fontFamily:FF.r,fontSize:38,fontWeight:600,color:txt,lineHeight:1,marginBottom:1,letterSpacing:"-0.01em"}}>{disp}<span style={{fontSize:14,fontWeight:400,color:st,marginLeft:4,fontFamily:FF.s}}>{unit}</span></div>
    <div style={{fontFamily:FF.s,fontSize:11,fontWeight:400,color:st,letterSpacing:"0.01em"}}>{label}</div>
    {sub&&<div style={{fontFamily:FF.s,fontSize:9,color:st,opacity:0.7,marginBottom:sparkData?8:0}}>{sub}</div>}
    {sparkData&&<Spark data={sparkData.slice(-14)} color={color}/>}
  </div>);
}

export function SLabel({children,color=P.sage,right,dark}){
  const t=dark?P.mutedDk:P.sub;const r=dark?P.mutedDk:P.muted;
  return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
    <span style={{fontFamily:FF.s,fontSize:10,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:t}}>{children}</span>
    {right&&<span style={{fontFamily:FF.s,fontSize:10,color:r}}>{right}</span>}
  </div>);
}

export function CTip({active,payload,label}){
  if(!active||!payload?.length)return null;
  return(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,padding:"10px 14px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}>
    <div style={{color:P.muted,fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
    {payload.map(p=><div key={p.name} style={{display:"flex",gap:8,marginBottom:2}}>
      <span style={{color:P.sub,minWidth:60}}>{p.name}</span>
      <span style={{fontFamily:FF.m,fontWeight:500,color:P.text}}>{p.value}</span>
    </div>)}
  </div>);
}

export function StatusBadge({status}){
  const c=status==="high"?P.terra:status==="low"?P.amber:P.sage;
  const l=status==="high"?"High":status==="low"?"Low":"Optimal";
  return <span style={{fontFamily:FF.s,fontSize:9,fontWeight:500,color:c,background:c+"15",padding:"2px 8px",borderRadius:99,letterSpacing:"0.01em"}}>{l}</span>;
}

export function BioCard({name,val,unit,range,status,prev,note,drawDate,notRedrawn}){
  const c=status==="high"?P.terra:status==="low"?P.amber:P.sage;
  const bgC=status==="high"?P.terracottaBg:status==="low"?P.amberBg:P.card;
  const bdC=notRedrawn?"rgba(196,120,48,0.2)":status==="high"?"#C4604A33":status==="low"?"#C4783033":P.border;
  const delta = (prev!=null && typeof val==="number" && typeof prev==="number")
    ? +(val-prev).toFixed(1) : null;
  const deltaColor = delta===null ? P.muted
    : status==="high" ? (delta>0 ? P.terra : P.sage)
    : status==="low"  ? (delta<0 ? P.terra : P.sage)
    : P.muted;
  const deltaArrow = delta===null ? "" : delta>0 ? "↑" : delta<0 ? "↓" : "→";
  // Short date label: "Jan '26" or "May '25"
  const dateLabel = drawDate
    ? drawDate.replace("Jan 15, 2026","Jan '26").replace("May 23, 2025","May '25")
    : null;
  return(<div style={{padding:"12px 13px",background:bgC,borderRadius:12,border:`1px solid ${bdC}`,boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
      <span style={{fontFamily:FF.s,fontSize:9,fontWeight:400,color:P.sub,lineHeight:1.3,maxWidth:"75%"}}>{name}</span>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
        <StatusBadge status={status}/>
        {dateLabel&&<span style={{fontFamily:FF.m,fontSize:7,color:notRedrawn?P.amber:P.muted,letterSpacing:"0.04em",fontWeight:notRedrawn?600:400}}>{dateLabel}{notRedrawn?" *":""}</span>}
      </div>
    </div>
    <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:3}}>
      <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color:c,lineHeight:1,letterSpacing:"-0.01em"}}>{val}<span style={{fontSize:10,color:P.muted,marginLeft:2,fontFamily:FF.s,fontWeight:400}}>{unit}</span></div>
      {delta!==null&&<div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:deltaColor,letterSpacing:"0.02em"}}>{deltaArrow} {Math.abs(delta)}<span style={{fontFamily:FF.s,fontSize:7,color:P.muted,marginLeft:1}}>vs prior</span></div>}
    </div>
    {range&&<div style={{fontFamily:FF.s,fontSize:8,color:P.muted,letterSpacing:"0.01em"}}>Ref {range}</div>}
    {notRedrawn&&<div style={{fontFamily:FF.s,fontSize:7.5,color:P.amber,marginTop:3,lineHeight:1.4}}>* Not drawn in Jan '26 — most recent available</div>}
    {note&&status!=="normal"&&<div style={{fontFamily:FF.s,fontSize:8,color:c,marginTop:4,lineHeight:1.45,opacity:0.85}}>{note}</div>}
  </div>);
}

// Animated rotated arc (for stacked zone donuts)
export function AnimRingArc({cx,cy,r,sw,color,dash,gap,rot,delay=0}){
  const circ=2*Math.PI*r;
  const animD=useAnimRing(dash,1100,delay,easeOut);
  return(<circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
    strokeDasharray={`${Math.max(0,animD)} ${Math.max(0,gap+(dash-animD))}`} strokeLinecap="butt"
    style={{transform:`rotate(${rot*360-90}deg)`,transformOrigin:`${cx}px ${cy}px`}}/>);
}

// Inline animated ring helper (for one-off rings not using Ring component)
export function AnimRing({cx,cy,r,stroke,sw,pct,color,delay=0}){
  const circ=2*Math.PI*r;
  const animD=useAnimRing(circ*pct,1200,delay,easeSpring);
  return(<circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
    strokeDasharray={`${Math.max(0,animD)} ${Math.max(0,circ-animD)}`} strokeLinecap="round"/>);
}

export function MasterRing({score,size=200,stroke=10}){
  const r=(size-stroke*2)/2,circ=2*Math.PI*r;
  const dash=circ*(score/100),gap=circ-dash;
  const col=SCORE_COLOR(score);
  const displayed=useCountUp(score);
  // Map score color to warm palette
  const warmCol=col===P.green?P.sage:col===P.cyan?P.sage:col===P.amber?P.amber:col===P.coral?P.terra:P.sage;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={P.panel} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={warmCol} strokeWidth={stroke}
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontFamily:FF.r,fontSize:72,fontWeight:600,color:P.text,lineHeight:1,letterSpacing:"-0.02em"}}>{displayed}</div>
        <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:4}}>out of 100</div>
        <div style={{marginTop:8,padding:"4px 14px",borderRadius:99,background:warmCol+"18",fontFamily:FF.s,fontSize:11,fontWeight:500,color:warmCol,letterSpacing:"0.02em"}}>{SCORE_LABEL(score)}</div>
      </div>
    </div>
  );
}

export function SubScoreCard({data,onClick,active}){
  const {score,prev,label,icon,color,dataDate,drivers,freshness}=data;
  const delta=score-prev;
  const col=SCORE_COLOR(score);
  const displayed=useCountUp(score);
  return(
    <div onClick={onClick} style={{
      background:active?col+"0E":P.card,
      border:`1.5px solid ${active?col+"88":P.border}`,
      borderRadius:14,padding:"16px 18px",cursor:"pointer",transition:"all .18s",
      boxShadow:active?`0 4px 16px ${col}22`:"0 1px 3px rgba(0,0,0,.04)",
    }}
      onMouseEnter={e=>{if(!active){e.currentTarget.style.background=P.panel;e.currentTarget.style.borderColor=col+"44";}}}
      onMouseLeave={e=>{if(!active){e.currentTarget.style.background=P.card;e.currentTarget.style.borderColor=P.border;}}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
        <div style={S.row8}>
          <div style={{width:32,height:32,borderRadius:9,background:col+"16",border:`1px solid ${col}30`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
            {icon}
          </div>
          <div>
            <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:active?col:P.text,lineHeight:1.2}}>{label}</div>
            {dataDate&&<div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:2,letterSpacing:"0.03em"}}>{dataDate}</div>}
          </div>
        </div>
        <div style={{padding:"3px 8px",borderRadius:99,flexShrink:0,
          background:delta>0?P.sage+"18":delta<0?P.terra+"18":"rgba(0,0,0,0.04)",
          border:`1px solid ${delta>0?P.sage+"44":delta<0?P.terra+"44":P.border}`}}>
          <span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,
            color:delta>0?P.sage:delta<0?P.terra:P.muted}}>
            {delta>0?`+${delta}`:delta===0?"—":delta} pts
          </span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}>
        <div style={{fontFamily:FF.r,fontSize:42,fontWeight:600,color:col,lineHeight:1,letterSpacing:"-0.02em"}}>
          {displayed}
        </div>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:1}}>/100</div>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:col}}>{SCORE_LABEL(score)}</div>
        </div>
      </div>
      <div style={{height:5,borderRadius:3,overflow:"hidden",background:P.panel}}>
        <div style={{height:"100%",width:`${score}%`,background:`linear-gradient(to right,${col}cc,${col})`,
          borderRadius:3,transition:"width 1s cubic-bezier(0.34,1.1,0.64,1)"}} />
      </div>
      {drivers&&drivers.length>0&&<div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>Top driver</span>
        <span style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text}}>{drivers[0].name}: {drivers[0].value}</span>
      </div>}
      {freshness&&<div style={{marginTop:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:FF.s,fontSize:8,color:P.muted}}>Data freshness</span>
        <span style={{fontFamily:FF.s,fontSize:8,color:freshness.stale?P.terra:P.sage}}>{freshness.date}</span>
      </div>}
      {active&&<div style={{marginTop:8,fontFamily:FF.s,fontSize:8,color:col,fontWeight:600,letterSpacing:"0.07em"}}>
        ▼ DETAILS BELOW
      </div>}
    </div>
  );
}
