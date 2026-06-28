// Body composition page — Hume Pod daily BIA tracking with translucent
// medical body visualization, animated scan line, and trend charts.
import { useState, useEffect } from "react";
import {
  ResponsiveContainer, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { P, FF, S } from "../lib/theme.js";
import { HUME_DATA } from "../lib/data/body.js";
import { useIsMobile } from "../hooks/useIsMobile.js";

const SCAN_CSS = `
@keyframes scanLine{0%{transform:translateY(-10px)}100%{transform:translateY(440px)}}
@keyframes bodyPulse{0%,100%{filter:drop-shadow(0 0 8px rgba(100,180,220,0.25))}50%{filter:drop-shadow(0 0 18px rgba(100,180,220,0.45))}}
@keyframes labelFadeIn{0%{opacity:0;transform:translateX(-8px)}100%{opacity:1;transform:translateX(0)}}
@keyframes labelFadeInR{0%{opacity:0;transform:translateX(8px)}100%{opacity:1;transform:translateX(0)}}
@keyframes dotPulse{0%,100%{r:3;opacity:0.8}50%{r:5;opacity:1}}
`;

export function BodyComp(){
  const mob = useIsMobile();
  const [ready, setReady] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setReady(true),100);return()=>clearTimeout(t);},[]);

  const humeSorted = HUME_DATA.slice().sort((a,b) => a.d.localeCompare(b.d));
  const humeLatest = humeSorted.length ? humeSorted[humeSorted.length - 1] : null;
  const humeFirst  = humeSorted.length ? humeSorted[0] : null;
  const hume30     = humeSorted.slice(-30);
  const humeWtChart = humeSorted.map(r => ({d:r.d.slice(5), v:r.wt, bf:r.bf}));
  const humeLeanChart = humeSorted.map(r => ({d:r.d.slice(5), v:+(r.wt * (1 - r.bf/100)).toFixed(1)}));
  const humeFatMassChart = humeSorted.map(r => ({d:r.d.slice(5), v:+(r.wt * r.bf/100).toFixed(1)}));

  const humeWtDelta  = humeLatest && humeFirst ? +(humeLatest.wt - humeFirst.wt).toFixed(1) : null;
  const humeBfDelta  = humeLatest && humeFirst ? +(humeLatest.bf - humeFirst.bf).toFixed(1) : null;
  const humeLeanNow  = humeLatest ? +(humeLatest.wt * (1 - humeLatest.bf/100)).toFixed(1) : null;
  const humeLeanFirst= humeFirst  ? +(humeFirst.wt * (1 - humeFirst.bf/100)).toFixed(1) : null;
  const humeLeanDelta= humeLeanNow && humeLeanFirst ? +(humeLeanNow - humeLeanFirst).toFixed(1) : null;
  const humeFatNow   = humeLatest ? +(humeLatest.wt * humeLatest.bf/100).toFixed(1) : null;
  const humeFatFirst = humeFirst  ? +(humeFirst.wt * humeFirst.bf/100).toFixed(1) : null;
  const humeFatDelta = humeFatNow && humeFatFirst ? +(humeFatNow - humeFatFirst).toFixed(1) : null;
  const avg30Wt = hume30.length ? +(hume30.reduce((s,r)=>s+r.wt,0)/hume30.length).toFixed(1) : null;
  const avg30Bf = hume30.length ? +(hume30.reduce((s,r)=>s+r.bf,0)/hume30.length).toFixed(1) : null;

  const wtMin = humeSorted.length ? Math.floor(Math.min(...humeSorted.map(r=>r.wt))/2)*2 - 2 : 190;
  const wtMax = humeSorted.length ? Math.ceil(Math.max(...humeSorted.map(r=>r.wt))/2)*2 + 2 : 225;
  const bfMin = humeSorted.length ? Math.floor(Math.min(...humeSorted.map(r=>r.bf))) - 1 : 10;
  const bfMax = humeSorted.length ? Math.ceil(Math.max(...humeSorted.map(r=>r.bf))) + 1 : 22;
  const leanPct = humeLatest ? +(100 - humeLatest.bf).toFixed(1) : 85;
  const bmiVal  = humeLatest ? +(humeLatest.bmi || (humeLatest.wt / (72*72) * 703)).toFixed(1) : 29;

  const ax={tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};
  const DeltaBadge = ({val, unit, invert}) => {
    if (val == null) return null;
    const good = invert ? val > 0 : val < 0;
    const c = good ? "#3A9C68" : val === 0 ? P.muted : "#C4604A";
    return <span style={{fontFamily:FF.m,fontSize:11,fontWeight:600,color:c}}>{val > 0 ? "+" : ""}{val}{unit}</span>;
  };

  // Medical label with connector line
  const MedLabel = ({x,y,side,label,val,unit,delay,color="#1B3A5C"}) => {
    const lx = side==="left" ? -10 : 210;
    const anim = side==="left" ? "labelFadeIn" : "labelFadeInR";
    return(<g style={{animation:ready?`${anim} 0.6s ease-out ${delay}s both`:"none",opacity:ready?undefined:0}}>
      <line x1={x} y1={y} x2={lx+(side==="left"?40:-40)} y2={y} stroke="#8FB8D8" strokeWidth="0.6" strokeDasharray="2 2" strokeOpacity="0.6"/>
      <circle cx={x} cy={y} r="3" fill="#8FB8D8" fillOpacity="0.8" style={{animation:"dotPulse 2.5s ease-in-out infinite"}}/>
      <foreignObject x={side==="left"?-120:170} y={y-18} width="120" height="40">
        <div style={{fontFamily:FF.s,textAlign:side==="left"?"right":"left"}}>
          <div style={{fontSize:7,color:"#8FB8D8",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:1}}>{label}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:3,justifyContent:side==="left"?"flex-end":"flex-start"}}>
            <span style={{fontFamily:FF.r,fontSize:17,fontWeight:600,color,lineHeight:1}}>{val}</span>
            {unit&&<span style={{fontSize:8,color:"#8FB8D8"}}>{unit}</span>}
          </div>
        </div>
      </foreignObject>
    </g>);
  };

  return(<div style={S.col18}>
    <style>{SCAN_CSS}</style>
    <div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>HUME HEALTH POD · BIA DAILY TRACKING · {humeFirst?.d} → {humeLatest?.d}</div>
      <div style={S.h18}>Daily Body Composition</div>
    </div>

    {/* ── Medical body visualization ── */}
    <div style={{background:"linear-gradient(180deg, #F0F4F8 0%, #E8EEF4 40%, #F2F6FA 100%)",border:"1px solid #D8E2EC",borderRadius:20,padding:mob?"20px":"32px 48px",boxShadow:"0 2px 12px rgba(20,60,100,0.06)",display:"flex",flexDirection:mob?"column":"row",alignItems:"center",gap:mob?24:0,justifyContent:"center",position:"relative",overflow:"hidden"}}>
      {/* Subtle grid background */}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 1px 1px, #C8D6E4 0.5px, transparent 0.5px)",backgroundSize:"24px 24px",opacity:0.3,pointerEvents:"none"}}/>

      <div style={{position:"relative",flexShrink:0,width:mob?280:400}}>
        <svg viewBox="-120 -10 440 480" width="100%" style={{display:"block",animation:"bodyPulse 4s ease-in-out infinite"}}>
          <defs>
            <linearGradient id="bodyBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7EC8E8" stopOpacity="0.35"/>
              <stop offset="30%" stopColor="#64B4DC" stopOpacity="0.28"/>
              <stop offset="70%" stopColor="#4A9CC8" stopOpacity="0.22"/>
              <stop offset="100%" stopColor="#3888B8" stopOpacity="0.30"/>
            </linearGradient>
            <linearGradient id="bodyEdge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5AACCF" stopOpacity="0.5"/>
              <stop offset="50%" stopColor="#88CCE8" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#5AACCF" stopOpacity="0.5"/>
            </linearGradient>
            <radialGradient id="innerGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#B8E4F8" stopOpacity="0.4"/>
              <stop offset="60%" stopColor="#88CCE8" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#64B4DC" stopOpacity="0"/>
            </radialGradient>
            <filter id="glowF" x="-30%" y="-10%" width="160%" height="120%">
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <clipPath id="bodyClip">
              <path d="M 79 8 C 70 8 63 13 61 21 C 58 31 59 43 64 52 C 66 56 67 60 67 64 L 67 70 C 67 74 70 77 75 79 L 100 82 L 125 79 C 130 77 133 74 133 70 L 133 64 C 133 60 134 56 136 52 C 141 43 142 31 139 21 C 137 13 130 8 121 8 Z
                M 88 79 L 87 92 C 87 96 88 99 91 100 L 100 102 L 109 100 C 112 99 113 96 113 92 L 112 79 Z
                M 87 92 C 80 90 70 88 58 88 C 46 88 36 94 34 104 L 34 120 C 34 126 37 130 42 132 L 52 134 C 44 136 38 142 34 150 L 28 176 C 26 184 28 188 32 190 L 26 218 C 24 226 22 232 20 236 C 18 240 20 244 24 244 C 28 244 32 240 34 234 L 42 210 L 42 186 C 36 192 40 190 42 186 L 50 160 C 52 154 54 148 58 144 L 60 100 C 56 106 54 116 56 128 L 58 144 C 58 168 60 192 62 210 L 64 230 C 66 238 72 244 80 246 L 100 250 L 120 246 C 128 244 134 238 136 230 L 138 210 C 140 192 142 168 142 144 L 144 128 C 146 116 144 106 140 100 L 113 92 C 120 90 130 88 142 88 C 154 88 164 94 166 104 L 166 120 C 166 126 163 130 158 132 L 148 134 C 156 136 162 142 166 150 L 172 176 C 174 184 172 188 168 190 L 174 218 C 176 226 178 232 180 236 C 182 240 180 244 176 244 C 172 244 168 240 166 234 L 158 210 L 158 186
                M 77 246 C 72 252 68 264 66 280 L 64 310 C 64 320 66 330 70 338 L 74 348 C 76 352 80 354 84 352 L 90 348 C 92 344 92 338 90 332 L 86 310 C 86 296 88 280 92 268 L 100 257 L 86 254 Z
                M 123 246 C 128 252 132 264 134 280 L 136 310 C 136 320 134 330 130 338 L 126 348 C 124 352 120 354 116 352 L 110 348 C 108 344 108 338 110 332 L 114 310 C 114 296 112 280 108 268 L 100 257 L 114 254 Z
                M 70 338 C 68 350 66 364 64 378 L 62 400 C 62 406 64 410 68 412 L 74 414 C 78 414 82 410 84 406 L 86 396 C 86 384 86 370 86 358 L 90 332 L 74 348 Z
                M 130 338 C 132 350 134 364 136 378 L 138 400 C 138 406 136 410 132 412 L 126 414 C 122 414 118 410 116 406 L 114 396 C 114 384 114 370 114 358 L 110 332 L 126 348 Z
                M 62 408 C 58 412 55 418 56 424 L 88 424 L 90 416 C 90 412 88 408 85 406 L 74 414 Z
                M 138 408 C 142 412 145 418 144 424 L 112 424 L 110 416 C 110 412 112 408 115 406 L 126 414 Z"/>
            </clipPath>
          </defs>

          {/* Head */}
          <path d="M 79 8 C 70 8 63 13 61 21 C 58 31 59 43 64 52 C 66 56 67 60 67 64 L 67 70 C 67 74 70 77 75 79 L 100 82 L 125 79 C 130 77 133 74 133 70 L 133 64 C 133 60 134 56 136 52 C 141 43 142 31 139 21 C 137 13 130 8 121 8 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.8" strokeOpacity="0.6"/>
          <ellipse cx="100" cy="30" rx="18" ry="14" fill="url(#innerGlow)"/>
          {/* Ears */}
          <path d="M 61 35 C 57 37 55 42 56 48 C 57 54 61 57 64 55 L 64 32 Z" fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.4" strokeOpacity="0.4"/>
          <path d="M 139 35 C 143 37 145 42 144 48 C 143 54 139 57 136 55 L 136 32 Z" fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.4" strokeOpacity="0.4"/>
          {/* Face hints */}
          <path d="M 80 38 C 85 35 90 34 95 35" fill="none" stroke="#5AACCF" strokeWidth="0.4" strokeOpacity="0.3"/>
          <path d="M 120 38 C 115 35 110 34 105 35" fill="none" stroke="#5AACCF" strokeWidth="0.4" strokeOpacity="0.3"/>
          {/* Neck */}
          <path d="M 88 79 L 87 92 C 87 96 88 99 91 100 L 100 102 L 109 100 C 112 99 113 96 113 92 L 112 79 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.5" strokeOpacity="0.5"/>
          {/* Shoulders + upper arms */}
          <path d="M 87 92 C 80 90 70 88 58 88 C 46 88 36 94 34 104 L 34 120 C 34 126 37 130 42 132 L 52 134 C 44 136 38 142 34 150 L 28 176 C 26 184 28 188 32 190 C 36 192 40 190 42 186 L 50 160 C 52 154 54 148 58 144"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.6" strokeOpacity="0.5"/>
          <path d="M 113 92 C 120 90 130 88 142 88 C 154 88 164 94 166 104 L 166 120 C 166 126 163 130 158 132 L 148 134 C 156 136 162 142 166 150 L 172 176 C 174 184 172 188 168 190 C 164 192 160 190 158 186 L 150 160 C 148 154 146 148 142 144"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.6" strokeOpacity="0.5"/>
          {/* Forearms + hands */}
          <path d="M 32 190 L 26 218 C 24 226 22 232 20 236 C 18 240 20 244 24 244 C 28 244 32 240 34 234 L 42 210 L 42 186"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.5" strokeOpacity="0.4"/>
          <path d="M 168 190 L 174 218 C 176 226 178 232 180 236 C 182 240 180 244 176 244 C 172 244 168 240 166 234 L 158 210 L 158 186"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.5" strokeOpacity="0.4"/>
          {/* Torso */}
          <path d="M 60 100 C 56 106 54 116 56 128 L 58 144 C 58 168 60 192 62 210 L 64 230 C 66 238 72 244 80 246 L 100 250 L 120 246 C 128 244 134 238 136 230 L 138 210 C 140 192 142 168 142 144 L 144 128 C 146 116 144 106 140 100 L 113 92 L 100 90 L 87 92 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.7" strokeOpacity="0.5" filter="url(#glowF)"/>
          <ellipse cx="100" cy="165" rx="30" ry="50" fill="url(#innerGlow)"/>
          {/* Skeleton hints */}
          <path d="M 72 118 C 82 124 92 126 100 124 C 108 126 118 124 128 118" fill="none" stroke="#5AACCF" strokeWidth="0.4" strokeOpacity="0.2"/>
          <line x1="100" y1="128" x2="100" y2="242" stroke="#5AACCF" strokeWidth="0.3" strokeOpacity="0.15"/>
          <path d="M 82 155 L 100 155" fill="none" stroke="#5AACCF" strokeWidth="0.2" strokeOpacity="0.12"/>
          <path d="M 82 175 L 118 175" fill="none" stroke="#5AACCF" strokeWidth="0.2" strokeOpacity="0.12"/>
          <path d="M 84 195 L 116 195" fill="none" stroke="#5AACCF" strokeWidth="0.2" strokeOpacity="0.12"/>
          {/* Pelvis */}
          <path d="M 77 234 C 77 242 80 250 86 254 L 100 257 L 114 254 C 120 250 123 242 123 234 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.5" strokeOpacity="0.4"/>
          {/* Thighs */}
          <path d="M 77 246 C 72 252 68 264 66 280 L 64 310 C 64 320 66 330 70 338 L 74 348 C 76 352 80 354 84 352 L 90 348 C 92 344 92 338 90 332 L 86 310 C 86 296 88 280 92 268 L 100 257 L 86 254 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.6" strokeOpacity="0.4"/>
          <path d="M 123 246 C 128 252 132 264 134 280 L 136 310 C 136 320 134 330 130 338 L 126 348 C 124 352 120 354 116 352 L 110 348 C 108 344 108 338 110 332 L 114 310 C 114 296 112 280 108 268 L 100 257 L 114 254 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.6" strokeOpacity="0.4"/>
          {/* Shins */}
          <path d="M 70 338 C 68 350 66 364 64 378 L 62 400 C 62 406 64 410 68 412 L 74 414 C 78 414 82 410 84 406 L 86 396 C 86 384 86 370 86 358 L 90 332 L 74 348 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.5" strokeOpacity="0.35"/>
          <path d="M 130 338 C 132 350 134 364 136 378 L 138 400 C 138 406 136 410 132 412 L 126 414 C 122 414 118 410 116 406 L 114 396 C 114 384 114 370 114 358 L 110 332 L 126 348 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.5" strokeOpacity="0.35"/>
          {/* Feet */}
          <path d="M 62 408 C 58 412 55 418 56 424 L 88 424 L 90 416 C 90 412 88 408 85 406 L 74 414 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.4" strokeOpacity="0.3"/>
          <path d="M 138 408 C 142 412 145 418 144 424 L 112 424 L 110 416 C 110 412 112 408 115 406 L 126 414 Z"
            fill="url(#bodyBlue)" stroke="#5AACCF" strokeWidth="0.4" strokeOpacity="0.3"/>

          {/* Animated scan line */}
          <g style={{animation:"scanLine 3.5s ease-in-out infinite"}}>
            <line x1="15" y1="0" x2="185" y2="0" stroke="#64B4DC" strokeWidth="1" strokeOpacity="0.5"/>
            <line x1="25" y1="0" x2="175" y2="0" stroke="#88CCE8" strokeWidth="0.5" strokeOpacity="0.3"/>
            <rect x="15" y="-20" width="170" height="20" fill="url(#bodyBlue)" opacity="0.15"/>
          </g>

          {/* Floating metric labels */}
          <MedLabel x={60} y={30} side="left" label="Weight" val={humeLatest?.wt.toFixed(1)} unit="lbs" delay={0.2} color="#1B3A5C"/>
          <MedLabel x={140} y={120} side="right" label="Body Fat" val={humeLatest?.bf.toFixed(1)} unit="%" delay={0.4} color="#3A7CA5"/>
          <MedLabel x={55} y={170} side="left" label="Lean Mass" val={humeLeanNow} unit="lbs" delay={0.6} color="#2D6B4F"/>
          <MedLabel x={145} y={270} side="right" label="Fat Mass" val={humeFatNow} unit="lbs" delay={0.8} color="#8B5A3C"/>
          <MedLabel x={55} y={310} side="left" label="BMI" val={bmiVal} unit="" delay={1.0} color="#1B3A5C"/>
        </svg>
      </div>

      {/* Right-side glass cards */}
      <div style={{display:"flex",flexDirection:"column",gap:12,flex:1,maxWidth:mob?undefined:320,zIndex:1}}>
        {/* Composition donut */}
        <div style={{background:"rgba(255,255,255,0.75)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:"1px solid rgba(100,180,220,0.2)",borderRadius:16,padding:"20px",textAlign:"center",boxShadow:"0 2px 8px rgba(20,60,100,0.06)"}}>
          <div style={{fontFamily:FF.s,fontSize:8,color:"#6A9AB8",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:12}}>Body Composition</div>
          <svg viewBox="0 0 120 120" width="110" height="110" style={{display:"block",margin:"0 auto"}}>
            <circle cx="60" cy="60" r="48" fill="none" stroke="#E8EEF4" strokeWidth="10"/>
            <circle cx="60" cy="60" r="48" fill="none" stroke="#64B4DC" strokeWidth="10"
              strokeDasharray={`${leanPct * 3.015} ${(humeLatest?.bf||15) * 3.015}`}
              strokeDashoffset="75" strokeLinecap="round"
              style={{transition:"stroke-dasharray 1.5s ease-out"}}/>
            <circle cx="60" cy="60" r="48" fill="none" stroke="#C8A882" strokeWidth="10"
              strokeDasharray={`${(humeLatest?.bf||15) * 3.015} ${leanPct * 3.015}`}
              strokeDashoffset={75 - leanPct * 3.015} strokeLinecap="round"
              style={{transition:"stroke-dasharray 1.5s ease-out"}}/>
            <text x="60" y="56" textAnchor="middle" fontFamily={FF.r} fontSize="22" fontWeight="600" fill="#1B3A5C">{leanPct}%</text>
            <text x="60" y="72" textAnchor="middle" fontFamily={FF.s} fontSize="8" fill="#6A9AB8" letterSpacing="0.08em">LEAN MASS</text>
          </svg>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:10}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#64B4DC"}}/>
              <span style={{fontFamily:FF.s,fontSize:9,color:"#1B3A5C"}}>Lean {leanPct}%</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#C8A882"}}/>
              <span style={{fontFamily:FF.s,fontSize:9,color:"#1B3A5C"}}>Fat {humeLatest?.bf.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        {/* Metric pills */}
        {[
          {label:"30-Day Avg Weight", val:`${avg30Wt} lbs`, delta:humeWtDelta, dUnit:" lbs", inv:false},
          {label:"30-Day Avg Body Fat", val:`${avg30Bf}%`, delta:humeBfDelta, dUnit:"%", inv:false},
        ].map(({label,val,delta,dUnit,inv})=>(
          <div key={label} style={{background:"rgba(255,255,255,0.70)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",border:"1px solid rgba(100,180,220,0.15)",borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 4px rgba(20,60,100,0.04)"}}>
            <div>
              <div style={{fontFamily:FF.s,fontSize:7,color:"#6A9AB8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>{label}</div>
              <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:"#1B3A5C"}}>{val}</div>
            </div>
            <DeltaBadge val={delta} unit={dUnit} invert={inv}/>
          </div>
        ))}
        {/* BIA scanned badge */}
        <div style={{background:"rgba(100,180,220,0.10)",border:"1px solid rgba(100,180,220,0.25)",borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
          <span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:"#3A7CA5",letterSpacing:"0.08em"}}>BIA SCANNED · {humeLatest?.d}</span>
        </div>
      </div>
    </div>

    {/* ── Stat cards ── */}
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(4,1fr)",gap:11}}>
      {[
        {label:"Weight",       val:humeLatest.wt.toFixed(1), unit:"lbs",  delta:humeWtDelta,   dUnit:" lbs", color:P.text, sub:`30d avg: ${avg30Wt} lbs`, invert:false},
        {label:"Body Fat (BIA)",val:humeLatest.bf.toFixed(1),unit:"%",    delta:humeBfDelta,   dUnit:"%",    color:"#C47830", sub:`30d avg: ${avg30Bf}%`, invert:false},
        {label:"Lean Mass (est.)",val:humeLeanNow,            unit:"lbs",  delta:humeLeanDelta, dUnit:" lbs", color:"#3A9C68", sub:"Weight x (1 - BF%)", invert:true},
        {label:"Fat Mass (est.)", val:humeFatNow,             unit:"lbs",  delta:humeFatDelta,  dUnit:" lbs", color:"#C4604A", sub:"Weight x BF%", invert:false},
      ].map(({label,val,unit,delta,dUnit,color,sub,invert})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{label}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:8}}>
            <span style={{fontFamily:FF.r,fontSize:28,fontWeight:600,color,lineHeight:1,letterSpacing:"-0.01em"}}>{val}</span>
            <span style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>{unit}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
            <DeltaBadge val={delta} unit={dUnit} invert={invert}/>
            <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>since {humeFirst?.d?.slice(5)}</span>
          </div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:4}}>{sub}</div>
        </div>
      ))}
    </div>

    {/* ── Trend charts ── */}
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px"}}>
        <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Weight Trend (lbs)</div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={humeWtChart} margin={{top:4,right:8,left:-20,bottom:0}}>
            <defs><linearGradient id="gHumeWt2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.sage} stopOpacity="0.20"/><stop offset="100%" stopColor={P.sage} stopOpacity="0"/></linearGradient></defs>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax} interval={Math.max(1,Math.floor(humeWtChart.length/8))}/>
            <YAxis {...ax} domain={[wtMin,wtMax]}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,color:P.sage,fontWeight:600}}>{payload[0]?.value} lbs</div></div>):null}/>
            <Area type="monotone" dataKey="v" stroke={P.sage} strokeWidth={1.8} fill="url(#gHumeWt2)" dot={false} animationDuration={900}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px"}}>
        <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Body Fat % Trend (BIA)</div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={humeWtChart} margin={{top:4,right:8,left:-20,bottom:0}}>
            <defs><linearGradient id="gHumeBf2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C47830" stopOpacity="0.20"/><stop offset="100%" stopColor="#C47830" stopOpacity="0"/></linearGradient></defs>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax} interval={Math.max(1,Math.floor(humeWtChart.length/8))}/>
            <YAxis {...ax} domain={[bfMin,bfMax]}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,color:"#C47830",fontWeight:600}}>{payload[0]?.value}%</div></div>):null}/>
            <Area type="monotone" dataKey="bf" stroke="#C47830" strokeWidth={1.8} fill="url(#gHumeBf2)" dot={false} animationDuration={900}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px"}}>
        <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Lean Mass Trend (est. lbs)</div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={humeLeanChart} margin={{top:4,right:8,left:-20,bottom:0}}>
            <defs><linearGradient id="gHumeLm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3A9C68" stopOpacity="0.20"/><stop offset="100%" stopColor="#3A9C68" stopOpacity="0"/></linearGradient></defs>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax} interval={Math.max(1,Math.floor(humeLeanChart.length/8))}/>
            <YAxis {...ax} domain={['auto','auto']}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,color:"#3A9C68",fontWeight:600}}>{payload[0]?.value} lbs</div></div>):null}/>
            <Area type="monotone" dataKey="v" stroke="#3A9C68" strokeWidth={1.8} fill="url(#gHumeLm)" dot={false} animationDuration={900}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px"}}>
        <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Fat Mass Trend (est. lbs)</div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={humeFatMassChart} margin={{top:4,right:8,left:-20,bottom:0}}>
            <defs><linearGradient id="gHumeFm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C4604A" stopOpacity="0.20"/><stop offset="100%" stopColor="#C4604A" stopOpacity="0"/></linearGradient></defs>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax} interval={Math.max(1,Math.floor(humeFatMassChart.length/8))}/>
            <YAxis {...ax} domain={['auto','auto']}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,color:"#C4604A",fontWeight:600}}>{payload[0]?.value} lbs</div></div>):null}/>
            <Area type="monotone" dataKey="v" stroke="#C4604A" strokeWidth={1.8} fill="url(#gHumeFm)" dot={false} animationDuration={900}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>);
}
