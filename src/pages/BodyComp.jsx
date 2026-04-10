// Body composition page — DXA/Styku/Hume composite, anatomical figure SVG with
// clickable regions, regional table, BMD card, and weight + BF% trend charts.
import { useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { P, FF, S, CS } from "../lib/theme.js";
import { DXA, SCAN_HISTORY, HUME_WT_TREND, HUME_BF_TREND } from "../lib/data/body.js";
import { SLabel } from "../components/shared.jsx";

export function BodyComp(){
  const [activeRegion, setActiveRegion] = useState(null);
  const ax = {tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  const fatColor = pct =>
    pct < 22 ? "#3A9C68" :    // bright sage-green (lean)
    pct < 26 ? "#C47830" :    // amber (average)
    pct < 30 ? "#C4604A" : "#8B2020"; // terra / high
  const fatLabel = pct =>
    pct < 22 ? "Lean" : pct < 26 ? "Average" : pct < 30 ? "Above Avg" : "High";
  const fatGlow = pct =>
    pct < 22 ? "rgba(58,156,104,0.35)" :
    pct < 26 ? "rgba(196,120,48,0.35)" :
    "rgba(196,96,74,0.40)";

  const REGIONS = [
    {id:"lArm",  name:"Left Arm",  ...DXA.regions.lArm },
    {id:"rArm",  name:"Right Arm", ...DXA.regions.rArm },
    {id:"trunk", name:"Trunk",     ...DXA.regions.trunk },
    {id:"lLeg",  name:"Left Leg",  ...DXA.regions.lLeg },
    {id:"rLeg",  name:"Right Leg", ...DXA.regions.rLeg },
  ];
  const active = REGIONS.find(r=>r.id===activeRegion)||null;
  const trendData=[
    {d:"Feb '25",fat:23.9,lean:151.7,src:"Styku"},
    {d:"May '25",fat:21.1,lean:160.3,src:"Styku"},
    {d:"Jan '26",fat:26.4,lean:149.8,src:"DXA"},
  ];


  const RegionCard = ({id,name,leanLbs,fatLbs,totalLbs,fatPct,bmd,onClick,active:isAct})=>{
    const c = fatColor(fatPct); const gl = fatGlow(fatPct);
    return(
      <div onClick={onClick} style={{
        padding:"12px 14px",borderRadius:12,cursor:"pointer",
        background:isAct?"rgba(20,18,16,0.95)":"rgba(18,16,14,0.82)",
        backdropFilter:"blur(8px)",
        border:`1px solid ${isAct?c+"88":"rgba(255,255,255,0.10)"}`,
        boxShadow:isAct?`0 0 20px ${gl}, 0 4px 16px rgba(0,0,0,0.4)`:"0 2px 12px rgba(0,0,0,0.3)",
        transition:"all .25s",minWidth:120,
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.55)",letterSpacing:"0.06em",textTransform:"uppercase"}}>{name}</div>
          <span style={{fontSize:10,color:isAct?c:"rgba(255,255,255,0.25)"}}>→</span>
        </div>
        <div style={{fontFamily:FF.r,fontSize:22,fontWeight:700,color:"rgba(255,255,255,0.90)",letterSpacing:"-0.02em",lineHeight:1,marginBottom:2}}>
          {leanLbs}<span style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:400,marginLeft:3}}>lbs</span>
        </div>
        <div style={{fontFamily:FF.s,fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:6}}>Lean mass</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:4,background:c+"22",border:`1px solid ${c}44`}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:c}}/>
          <span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:c}}>{fatLabel(fatPct)} · {fatPct}% fat</span>
        </div>
      </div>
    );
  };


  const FigureSVG = ()=>{
    const hA  = id => activeRegion === id;
    const col = id => fatColor(REGIONS.find(r=>r.id===id)?.fatPct||26);
    const op  = id => hA(id) ? 0.80 : 0.42;

    const sk  = 'rgba(140,200,180,0.22)';
    const sl  = 'rgba(170,225,205,0.18)';
    const sm  = 'rgba(170,225,205,0.10)';

    return(
      <svg viewBox="0 0 200 460" style={{width:'100%',height:'auto',maxHeight:420,display:'block'}}
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="fg2" x="-25%" y="-5%" width="150%" height="110%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="sk_g" x1="0.25" y1="0" x2="0.75" y2="1">
            <stop offset="0%"   stopColor="#8EC8B8" stopOpacity="0.30"/>
            <stop offset="50%"  stopColor="#60A888" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#3A8868" stopOpacity="0.08"/>
          </linearGradient>
          <linearGradient id="sk_side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#3A8868" stopOpacity="0.18"/>
            <stop offset="30%"  stopColor="#8EC8B8" stopOpacity="0.28"/>
            <stop offset="70%"  stopColor="#8EC8B8" stopOpacity="0.28"/>
            <stop offset="100%" stopColor="#3A8868" stopOpacity="0.18"/>
          </linearGradient>
          <radialGradient id="sk_face" cx="50%" cy="45%" r="55%">
            <stop offset="0%"   stopColor="#9ED8C8" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#5AA888" stopOpacity="0.12"/>
          </radialGradient>
        </defs>

        {/* ── HEAD ─────────────────────────────── */}
        {/* Cranium — slightly wider than jaw */}
        <path d="M 79 8 C 70 8 63 13 61 21 C 58 31 59 43 64 52
                    C 66 56 67 60 67 64 L 67 70
                    C 67 74 70 77 75 79 L 100 82 L 125 79
                    C 130 77 133 74 133 70 L 133 64
                    C 133 60 134 56 136 52 C 141 43 142 31 139 21
                    C 137 13 130 8 121 8 Z"
          fill="url(#sk_face)" stroke={sl} strokeWidth="0.8"/>
        {/* Ear left */}
        <path d="M 61 35 C 57 37 55 42 56 48 C 57 54 61 57 64 55 L 64 32 Z"
          fill="url(#sk_g)" stroke={sm} strokeWidth="0.5"/>
        {/* Ear right */}
        <path d="M 139 35 C 143 37 145 42 144 48 C 143 54 139 57 136 55 L 136 32 Z"
          fill="url(#sk_g)" stroke={sm} strokeWidth="0.5"/>
        {/* Face features — brow ridge */}
        <path d="M 80 38 C 85 35 90 34 95 35" fill="none" stroke={sm} strokeWidth="0.6"/>
        <path d="M 120 38 C 115 35 110 34 105 35" fill="none" stroke={sm} strokeWidth="0.6"/>
        {/* Nose bridge */}
        <path d="M 100 40 L 100 52 C 97 54 93 55 91 53" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Chin */}
        <path d="M 88 70 Q 100 76 112 70" fill="none" stroke={sm} strokeWidth="0.5"/>

        {/* ── NECK ─────────────────────────────── */}
        <path d="M 88 79 L 87 92 C 87 96 88 99 91 100 L 100 102 L 109 100
                    C 112 99 113 96 113 92 L 112 79 Z"
          fill="url(#sk_g)" stroke={sl} strokeWidth="0.7"/>
        {/* Sternocleidomastoid lines */}
        <line x1="92" y1="80" x2="89" y2="100" stroke={sm} strokeWidth="0.5"/>
        <line x1="108" y1="80" x2="111" y2="100" stroke={sm} strokeWidth="0.5"/>

        {/* ── SHOULDERS + UPPER CHEST ──────────── */}
        {/* Trapezius / shoulder caps */}
        <path d="M 87 92 C 80 90 70 88 58 88 C 46 88 36 94 34 104 L 34 120
                    C 34 126 37 130 42 132 L 52 134"
          fill="url(#sk_g)" stroke={sl} strokeWidth="0.6"/>
        <path d="M 113 92 C 120 90 130 88 142 88 C 154 88 164 94 166 104 L 166 120
                    C 166 126 163 130 158 132 L 148 134"
          fill="url(#sk_g)" stroke={sl} strokeWidth="0.6"/>

        {/* ── TRUNK / TORSO (clickable) ─────────── */}
        <path
          d="M 52 100
             C 44 102 36 110 34 122 L 34 190
             C 34 204 40 214 52 218 L 66 222
             C 72 224 76 228 77 234 L 123 234
             C 124 228 128 224 134 222 L 148 218
             C 160 214 166 204 166 190 L 166 122
             C 164 110 156 102 148 100
             C 136 96 122 93 110 91 L 90 91
             C 78 93 64 96 52 100 Z"
          fill={col('trunk')} fillOpacity={op('trunk')}
          stroke={col('trunk')} strokeWidth={hA('trunk')?1.4:0.6} strokeOpacity={0.65}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='trunk'?null:'trunk')}/>

        {/* ── ARMS ─────────────────────────────── */}
        {/* LEFT DELTOID (upper arm taper) */}
        <path
          d="M 34 122 C 26 126 19 136 18 148
             C 17 160 21 172 28 178 L 35 182 L 34 190 L 34 122 Z"
          fill={col('lArm')} fillOpacity={op('lArm')}
          stroke={col('lArm')} strokeWidth={hA('lArm')?1.4:0.5} strokeOpacity={0.6}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='lArm'?null:'lArm')}/>
        {/* Left forearm — tapers to wrist */}
        <path
          d="M 18 148 C 14 160 13 174 15 186 L 18 200
             C 20 210 26 218 33 222 L 34 190 L 35 182
             L 28 178 C 22 172 18 162 18 148 Z"
          fill={col('lArm')} fillOpacity={op('lArm')*0.82}
          stroke={col('lArm')} strokeWidth="0.4" strokeOpacity="0.45"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='lArm'?null:'lArm')}/>
        {/* Left hand */}
        <path d="M 15 196 C 12 202 11 210 13 218 C 15 224 20 228 26 228
                    C 30 228 34 224 35 220 L 33 222 C 26 218 20 210 18 200 Z"
          fill={col('lArm')} fillOpacity={op('lArm')*0.65}
          stroke={col('lArm')} strokeWidth="0.4" strokeOpacity="0.35"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='lArm'?null:'lArm')}/>

        {/* RIGHT DELTOID */}
        <path
          d="M 166 122 C 174 126 181 136 182 148
             C 183 160 179 172 172 178 L 165 182 L 166 190 L 166 122 Z"
          fill={col('rArm')} fillOpacity={op('rArm')}
          stroke={col('rArm')} strokeWidth={hA('rArm')?1.4:0.5} strokeOpacity={0.6}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='rArm'?null:'rArm')}/>
        {/* Right forearm */}
        <path
          d="M 182 148 C 186 160 187 174 185 186 L 182 200
             C 180 210 174 218 167 222 L 166 190 L 165 182
             L 172 178 C 178 172 182 162 182 148 Z"
          fill={col('rArm')} fillOpacity={op('rArm')*0.82}
          stroke={col('rArm')} strokeWidth="0.4" strokeOpacity="0.45"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='rArm'?null:'rArm')}/>
        {/* Right hand */}
        <path d="M 185 196 C 188 202 189 210 187 218 C 185 224 180 228 174 228
                    C 170 228 166 224 165 220 L 167 222 C 174 218 180 210 182 200 Z"
          fill={col('rArm')} fillOpacity={op('rArm')*0.65}
          stroke={col('rArm')} strokeWidth="0.4" strokeOpacity="0.35"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='rArm'?null:'rArm')}/>

        {/* ── PELVIS / GROIN BRIDGE ────────────── */}
        <path d="M 77 234 C 77 242 80 250 86 254 L 100 257 L 114 254
                    C 120 250 123 242 123 234 Z"
          fill="url(#sk_g)" stroke={sl} strokeWidth="0.5"/>

        {/* ── LEGS ─────────────────────────────── */}
        {/* LEFT THIGH — wide at hip, tapers to knee */}
        <path
          d="M 77 234 C 66 236 57 244 56 255
             L 55 300 C 55 316 57 330 60 340 L 62 360
             C 62 368 64 376 68 380 L 76 384
             C 80 386 84 385 86 382 L 90 370
             C 88 360 86 348 86 334 L 84 295
             C 82 278 80 260 79 244 L 77 234 Z"
          fill={col('lLeg')} fillOpacity={op('lLeg')}
          stroke={col('lLeg')} strokeWidth={hA('lLeg')?1.4:0.5} strokeOpacity={0.6}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='lLeg'?null:'lLeg')}/>
        {/* Left calf — tapers to ankle */}
        <path
          d="M 60 340 C 58 352 57 364 59 374 L 62 392
             C 64 402 68 410 74 414 L 80 416
             C 84 414 87 410 88 404 L 90 390
             C 90 380 88 372 86 364 L 84 350
             C 84 344 84 340 86 338 L 80 340
             C 72 340 66 340 62 340 L 60 340 Z"
          fill={col('lLeg')} fillOpacity={op('lLeg')*0.85}
          stroke={col('lLeg')} strokeWidth="0.4" strokeOpacity="0.45"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='lLeg'?null:'lLeg')}/>
        {/* Left foot */}
        <path d="M 62 408 C 58 412 55 418 56 424 L 88 424 L 90 416
                    C 90 412 88 408 85 406 L 74 414 Z"
          fill={col('lLeg')} fillOpacity={op('lLeg')*0.60}
          stroke={col('lLeg')} strokeWidth="0.4" strokeOpacity="0.30"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='lLeg'?null:'lLeg')}/>

        {/* RIGHT THIGH */}
        <path
          d="M 123 234 C 134 236 143 244 144 255
             L 145 300 C 145 316 143 330 140 340 L 138 360
             C 138 368 136 376 132 380 L 124 384
             C 120 386 116 385 114 382 L 110 370
             C 112 360 114 348 114 334 L 116 295
             C 118 278 120 260 121 244 L 123 234 Z"
          fill={col('rLeg')} fillOpacity={op('rLeg')}
          stroke={col('rLeg')} strokeWidth={hA('rLeg')?1.4:0.5} strokeOpacity={0.6}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='rLeg'?null:'rLeg')}/>
        {/* Right calf */}
        <path
          d="M 140 340 C 142 352 143 364 141 374 L 138 392
             C 136 402 132 410 126 414 L 120 416
             C 116 414 113 410 112 404 L 110 390
             C 110 380 112 372 114 364 L 116 350
             C 116 344 116 340 114 338 L 120 340
             C 128 340 134 340 138 340 L 140 340 Z"
          fill={col('rLeg')} fillOpacity={op('rLeg')*0.85}
          stroke={col('rLeg')} strokeWidth="0.4" strokeOpacity="0.45"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='rLeg'?null:'rLeg')}/>
        {/* Right foot */}
        <path d="M 138 408 C 142 412 145 418 144 424 L 112 424 L 110 416
                    C 110 412 112 408 115 406 L 126 414 Z"
          fill={col('rLeg')} fillOpacity={op('rLeg')*0.60}
          stroke={col('rLeg')} strokeWidth="0.4" strokeOpacity="0.30"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='rLeg'?null:'rLeg')}/>

        {/* ── ANATOMY DETAIL LINES ─────────────── */}
        {/* Collarbone / clavicles */}
        <path d="M 52 100 C 62 96 78 93 90 91" fill="none" stroke={sl} strokeWidth="0.8" opacity="0.5"/>
        <path d="M 148 100 C 138 96 122 93 110 91" fill="none" stroke={sl} strokeWidth="0.8" opacity="0.5"/>
        {/* Clavicle notch */}
        <path d="M 90 91 Q 100 88 110 91" fill="none" stroke={sl} strokeWidth="0.7" opacity="0.4"/>
        {/* Pectorals — curved separation line */}
        <path d="M 52 104 C 62 112 80 116 100 117" fill="none" stroke={sm} strokeWidth="0.7"/>
        <path d="M 148 104 C 138 112 120 116 100 117" fill="none" stroke={sm} strokeWidth="0.7"/>
        {/* Pec lower edge */}
        <path d="M 52 122 C 66 130 84 133 100 133" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 148 122 C 134 130 116 133 100 133" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Linea alba — center vertical */}
        <line x1="100" y1="91" x2="100" y2="200" stroke={sm} strokeWidth="0.5"/>
        {/* Rib cage hint */}
        {[0,1,2].map(i=>(
          <g key={i}>
            <path d={`M 60 ${136+i*14} C 68 ${134+i*14} 84 ${133+i*14} 100 ${133+i*14}`}
              fill="none" stroke={sm} strokeWidth="0.4" opacity="0.5"/>
            <path d={`M 140 ${136+i*14} C 132 ${134+i*14} 116 ${133+i*14} 100 ${133+i*14}`}
              fill="none" stroke={sm} strokeWidth="0.4" opacity="0.5"/>
          </g>
        ))}
        {/* Obliques / flanks */}
        <path d="M 48 155 C 46 168 46 182 50 194" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 152 155 C 154 168 154 182 150 194" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Umbilicus (belly button) */}
        <ellipse cx="100" cy="175" rx="3" ry="2.5"
          fill="none" stroke={sl} strokeWidth="0.6" opacity="0.4"/>
        {/* Inguinal ligament / hip crease */}
        <path d="M 58 210 C 70 204 86 200 100 199" fill="none" stroke={sl} strokeWidth="0.6" opacity="0.4"/>
        <path d="M 142 210 C 130 204 114 200 100 199" fill="none" stroke={sl} strokeWidth="0.6" opacity="0.4"/>
        {/* Deltoid crease (shoulder muscle) */}
        <path d="M 42 124 C 38 130 36 140 36 150" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 158 124 C 162 130 164 140 164 150" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Bicep peak */}
        <path d="M 20 148 C 19 155 19 163 21 170" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 180 148 C 181 155 181 163 179 170" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Knee — patella */}
        <ellipse cx="68" cy="344" rx="9" ry="7"
          fill="rgba(100,180,150,0.12)" stroke={sl} strokeWidth="0.7" opacity="0.6"/>
        <ellipse cx="132" cy="344" rx="9" ry="7"
          fill="rgba(100,180,150,0.12)" stroke={sl} strokeWidth="0.7" opacity="0.6"/>
        {/* VMO (inner quad teardrop above knee) */}
        <path d="M 62 332 C 62 338 64 342 68 344" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 138 332 C 138 338 136 342 132 344" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Quad centerline */}
        <line x1="70" y1="258" x2="67" y2="330" stroke={sm} strokeWidth="0.4" opacity="0.5"/>
        <line x1="130" y1="258" x2="133" y2="330" stroke={sm} strokeWidth="0.4" opacity="0.5"/>
        {/* Tibia shin line */}
        <line x1="64" y1="352" x2="66" y2="404" stroke={sm} strokeWidth="0.4" opacity="0.4"/>
        <line x1="136" y1="352" x2="134" y2="404" stroke={sm} strokeWidth="0.4" opacity="0.4"/>
        {/* Calf belly */}
        <path d="M 59 356 C 57 366 57 378 60 388" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 141 356 C 143 366 143 378 140 388" fill="none" stroke={sm} strokeWidth="0.5"/>

        {/* ── ACTIVE GLOW ──────────────────────── */}
        {activeRegion && (
          <ellipse cx="100" cy="230" rx="75" ry="200"
            fill={col(activeRegion)} opacity="0.04" filter="url(#fg2)"/>
        )}

        {!activeRegion && (
          <text x="100" y="448" textAnchor="middle"
            fontFamily="system-ui,sans-serif" fontSize="7"
            fill="rgba(255,255,255,0.16)" letterSpacing="0.14em">TAP REGION</text>
        )}
      </svg>
    );
  };

  return(<div style={S.col18}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>DXA · Hologic Horizon W · Pueblo Radiology · Jan 23 2026</div>
        <div style={S.h18}>Body Composition</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {SCAN_HISTORY.map(s=>(
          <div key={s.date} style={{padding:"5px 12px",borderRadius:8,background:s.source==="DXA"?P.cardDk:P.card,border:`1px solid ${s.source==="DXA"?P.borderDk:P.border}`,textAlign:"center"}}>
            <div style={{fontFamily:FF.s,fontSize:8,color:s.source==="DXA"?P.mutedDk:P.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>{s.source}</div>
            <div style={{fontFamily:FF.m,fontSize:11,fontWeight:500,color:s.source==="DXA"?P.textInv:P.text}}>{s.fatPct}%</div>
            <div style={{fontFamily:FF.s,fontSize:8,color:s.source==="DXA"?P.mutedDk:P.muted}}>{s.date}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{
      background:"linear-gradient(160deg,#0E1A18 0%,#0A120E 40%,#080C0A 100%)",
      borderRadius:20, padding:"24px 20px 20px",
      boxShadow:"0 12px 48px rgba(0,0,0,0.28)",
      border:"1px solid rgba(58,156,104,0.14)",
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",
        width:"min(400px,80vw)",height:"min(400px,80vw)",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(58,156,104,0.06) 0%,transparent 70%)",
        pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.30)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Total Body Fat</div>
          <div style={{fontFamily:FF.r,fontSize:28,fontWeight:700,color:"rgba(255,255,255,0.90)",letterSpacing:"-0.02em",lineHeight:1}}>26.4%</div>
          <div style={{fontFamily:FF.s,fontSize:10,color:"rgba(196,96,74,0.90)",marginTop:3,fontWeight:500}}>Above Average</div>
        </div>
        <div style={{display:"flex",gap:20}}>
          {[
            {label:"Lean Mass",val:"149.8 lb",color:"#3A9C68"},
            {label:"Fat Mass", val:"56.5 lb", color:"#C4604A"},
            {label:"BMD T-Score",val:"+1.3",  color:"#4A8FA0"},
          ].map(({label,val,color})=>(
            <div key={label} style={{textAlign:"center"}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.28)",marginBottom:3,letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</div>
              <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {[{c:"#3A9C68",l:"Lean <22%"},{c:"#C47830",l:"Avg 22–26%"},{c:"#C4604A",l:"High >26%"}].map(({c,l})=>(
            <div key={l} style={S.row6}>
              <div style={{width:8,height:8,borderRadius:2,background:c,boxShadow:`0 0 6px ${c}`}}/>
              <span style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.32)"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"clamp(110px,20vw,160px) 1fr clamp(110px,20vw,160px)",gap:8,alignItems:"center"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"flex-end"}}>
          <RegionCard {...REGIONS.find(r=>r.id==="trunk")} onClick={()=>setActiveRegion(activeRegion==="trunk"?null:"trunk")} active={activeRegion==="trunk"}/>
          <RegionCard {...REGIONS.find(r=>r.id==="lArm")} onClick={()=>setActiveRegion(activeRegion==="lArm"?null:"lArm")} active={activeRegion==="lArm"}/>
        </div>
        <div style={{minHeight:300,height:"auto",position:"relative",maxWidth:200,margin:"0 auto"}}>
          <FigureSVG/>
        </div>
        <div style={S.col10}>
          <RegionCard {...REGIONS.find(r=>r.id==="rArm")} onClick={()=>setActiveRegion(activeRegion==="rArm"?null:"rArm")} active={activeRegion==="rArm"}/>
          <RegionCard {...REGIONS.find(r=>r.id==="lLeg")} onClick={()=>setActiveRegion(activeRegion==="lLeg"?null:"lLeg")} active={activeRegion==="lLeg"}/>
          <RegionCard {...REGIONS.find(r=>r.id==="rLeg")} onClick={()=>setActiveRegion(activeRegion==="rLeg"?null:"rLeg")} active={activeRegion==="rLeg"}/>
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:11}}>
      {[
        {label:"Body Fat",    val:"26.4",  unit:"%",    color:P.terra, sub:"DXA gold standard"},
        {label:"Fat Mass",    val:"56.5",  unit:"lb",   color:P.terra, sub:"Total adipose"},
        {label:"Lean Mass",   val:"149.8", unit:"lb",   color:P.sage,  sub:"Excl. bone mineral"},
        {label:"Bone Density",val:"1.331", unit:"g/cm²",color:P.steel, sub:"T+1.3 · 111th %ile"},
        {label:"VAT Area",    val:"118",   unit:"cm²",  color:P.amber, sub:"Est. visceral fat"},
        {label:"A/G Ratio",   val:"0.96",  unit:"",     color:P.sage,  sub:"Balanced distribution"},
      ].map(({label,val,unit,color,sub})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"13px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{label}</div>
          <div style={{fontFamily:FF.r,fontSize:24,fontWeight:600,color,lineHeight:1,letterSpacing:"-0.01em"}}>{val}<span style={{fontSize:11,color:P.muted,fontFamily:FF.s,fontWeight:400,marginLeft:3}}>{unit}</span></div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:4}}>{sub}</div>
        </div>
      ))}
    </div>
    <div style={CS()}>
      <SLabel color={P.clay}>Regional Composition · DXA</SLabel>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>
          {["Region","Fat %","Fat (lb)","Lean+BMC (lb)","Total (lb)","BMD (g/cm²)"].map(h=>(
            <th key={h} style={{fontFamily:FF.s,fontSize:8,fontWeight:600,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",textAlign:"left",padding:"0 12px 8px 0",borderBottom:`1px solid ${P.border}`}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {[
            {name:"Left Arm",  ...DXA.regions.lArm,  rid:"lArm"},
            {name:"Right Arm", ...DXA.regions.rArm,  rid:"rArm"},
            {name:"Trunk",     ...DXA.regions.trunk, rid:"trunk"},
            {name:"Left Leg",  ...DXA.regions.lLeg,  rid:"lLeg"},
            {name:"Right Leg", ...DXA.regions.rLeg,  rid:"rLeg"},
            {name:"TOTAL",     fatLbs:56.47,leanLbs:157.16,totalLbs:213.63,fatPct:26.4,bmd:1.331,isTotal:true},
          ].map((r,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${P.border}`,background:r.isTotal?P.panel:"transparent",cursor:r.isTotal?"default":"pointer"}}
              onClick={()=>{if(!r.isTotal&&r.rid)setActiveRegion(r.rid===activeRegion?null:r.rid);}}
              onMouseEnter={e=>{if(!r.isTotal)e.currentTarget.style.background=P.panel;}}
              onMouseLeave={e=>{if(!r.isTotal)e.currentTarget.style.background="transparent";}}>
              <td style={{fontFamily:FF.s,fontSize:11,fontWeight:r.isTotal?600:400,color:P.text,padding:"8px 12px 8px 0"}}>{r.name}</td>
              <td style={{padding:"8px 12px 8px 0"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:36,height:4,borderRadius:2,background:P.panel,overflow:"hidden"}}>
                    <div style={{width:`${r.fatPct}%`,height:"100%",background:fatColor(r.fatPct),borderRadius:2,transition:"width 0.9s cubic-bezier(0.34,1.2,0.64,1)"}}/>
                  </div>
                  <span style={{fontFamily:FF.m,fontSize:11,fontWeight:r.isTotal?600:400,color:fatColor(r.fatPct)}}>{r.fatPct}%</span>
                </div>
              </td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.sub,padding:"8px 12px 8px 0"}}>{r.fatLbs}</td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.sub,padding:"8px 12px 8px 0"}}>{r.leanLbs}</td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.sub,padding:"8px 12px 8px 0"}}>{r.totalLbs}</td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.sub,padding:"8px 12px 8px 0"}}>{r.bmd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div style={S.g240}>
      <div style={{background:P.cardDk,border:`1px solid ${P.borderDk}`,borderRadius:14,padding:"18px"}}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>Bone Mineral Density</div>
        <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:12}}>
          <div style={{fontFamily:FF.r,fontSize:38,fontWeight:600,color:P.steel,letterSpacing:"-0.02em"}}>1.331</div>
          <div style={{fontFamily:FF.s,fontSize:11,color:P.mutedDk}}>g/cm²</div>
          <div style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,background:"#3A5C4844",border:"1px solid #3A5C4888"}}>
            <span style={{fontFamily:FF.m,fontSize:11,fontWeight:600,color:"#7AC49A"}}>T-score +1.3 · 111th %ile</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
          {[{label:"L-Spine",val:"1.483"},{label:"T-Spine",val:"1.131"},{label:"Pelvis",val:"1.469"},{label:"L Leg",val:"1.443"}].map(({label,val})=>(
            <div key={label} style={{padding:"8px 10px",background:"rgba(255,255,255,0.05)",borderRadius:8}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,marginBottom:2}}>{label}</div>
              <div style={{fontFamily:FF.m,fontSize:12,fontWeight:500,color:P.textInv}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px",gridColumn:"1/-1"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <SLabel color={P.amber}>Body Composition Trend</SLabel>
          <div style={{display:"flex",gap:12}}>
            {[{c:P.steel,l:"DXA"},{c:P.clay,l:"Styku"},{c:"#60B090",l:"Hume BIA (daily)"}].map(({c,l})=>(
              <div key={l} style={S.row4}>
                <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                <span style={S.mut9}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:14}}>
          ⚠ DXA is the gold standard. BIA (Hume) reads body fat ~11pts lower than DXA — use for daily <em>trend direction</em>, not absolute value.
          Weight trend (Hume scale) is reliable day-to-day.
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Daily Weight · Hume Pod (lbs)</div>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={HUME_WT_TREND} margin={{top:4,right:8,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gHumeWt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A8070" stopOpacity="0.22"/>
                  <stop offset="100%" stopColor="#4A8070" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
              <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:7,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} interval={7}/>
              <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} domain={[208,228]}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,color:"#60B090",fontWeight:600}}>{payload[0]?.value} lbs</div></div>):null}/>
              <ReferenceLine y={216} stroke={P.steel} strokeDasharray="4 3" strokeOpacity={0.5} strokeWidth={1}/>
              <Area type="monotone" dataKey="v" stroke="#60B090" strokeWidth={1.8} fill="url(#gHumeWt)" dot={false} isAnimationActive={true} animationDuration={900} name="Weight lbs"/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textAlign:"right",marginTop:3}}>Blue dashed = DXA reference (216 lbs)</div>
        </div>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Body Fat % · Method Comparison</div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart margin={{top:4,right:8,left:-20,bottom:0}}>
              <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
              <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:7,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} interval={7}/>
              <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} domain={[12,30]}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div>{payload.map(p=><div key={p.name} style={{color:p.color,fontFamily:FF.m,fontWeight:600,fontSize:10}}>{p.name}: {p.value}%</div>)}</div>):null}/>
              <Line data={trendData} type="monotone" dataKey="fat" stroke={P.terra} strokeWidth={2.5}
                dot={p=><circle key={p.index} cx={p.cx} cy={p.cy} r={6} fill={P.terra} stroke={P.card} strokeWidth={2}/>}
                name="DXA/Styku" isAnimationActive={true} animationDuration={900}/>
              <Line data={HUME_BF_TREND} type="monotone" dataKey="v" stroke="#60B090" strokeWidth={1.5}
                strokeDasharray="4 2" dot={false} name="Hume BIA" isAnimationActive={true} animationDuration={1000}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>);
}
