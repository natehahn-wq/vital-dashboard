// Labs page — switches between metabolic / lipid / CBC / hormone / special
// chem panels, renders BioCard grid for the active panel, mini trend charts
// per metric (with reference lines), and a clinical analysis summary grid.
import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { P, FF, S } from "../lib/theme.js";
import { LABS, LABS_MERGED, LAB_HISTORY, LAB_REFS, PANEL_TREND_KEYS } from "../lib/data/labs.js";
import { SLabel, BioCard } from "../components/shared.jsx";

export function Labs(){
  const [activePanel, setActivePanel]=useState("metabolic");
  const panels=[
    {id:"metabolic",label:"Metabolic Panel",color:P.blue},
    {id:"lipids",   label:"Lipid Studies", color:P.amber},
    {id:"cbc",      label:"CBC",           color:P.cyan},
    {id:"hormones", label:"Hormones",      color:P.violet},
    {id:"special",  label:"Special Chem",  color:P.coral},
  ];
  const data = (LABS_MERGED.panels[activePanel] || LABS.panels[activePanel] || []);
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{background:`linear-gradient(135deg,${P.coral}12,${P.card})`,border:`1px solid ${P.coral}44`,borderRadius:14,padding:"16px 18px",display:"flex",gap:16,alignItems:"flex-start"}}>
      <div style={{width:36,height:36,borderRadius:9,background:P.terracottaBg,border:`1px solid ${"#C4604A33"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🧬</div>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
          <div style={{fontFamily:FF.s,fontWeight:700,fontSize:14,color:P.text}}>Lab Results · Most Recent Per Biomarker</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:6}}>
          {[
            {label:"Jan 15, 2026",sublabel:"ExamOne · lipids, metabolic, liver",badge:"LATEST",color:P.sage},
            {label:"May 23, 2025",sublabel:"BioLab · hormones, HbA1c, CRP, ApoB, Ferritin",badge:"MOST RECENT FOR THESE",color:P.steel},
          ].map(({label,sublabel,badge,color})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 11px",
              borderRadius:7,background:color+"0C",border:`1px solid ${color}33`}}>
              <div>
                <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color}}>{label} </span>
                <span style={{fontFamily:FF.s,fontSize:7.5,fontWeight:700,color,background:color+"18",
                  padding:"1px 6px",borderRadius:3,letterSpacing:"0.06em"}}>{badge}</span>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:1}}>{sublabel}</div>
              </div>
            </div>
          ))}
          <div style={{fontFamily:FF.s,fontSize:8.5,color:P.muted,alignSelf:"center"}}>↕ trend vs prior panel shown on each marker</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {LABS.outOfRange.map(f=>(
            <div key={f.name} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:7,background:f.status==="high"?P.coralBg:P.amberBg,border:`1px solid ${(f.status==="high"?P.coral:P.amber)}44`}}>
              <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:f.status==="high"?P.coral:P.amber}}>{f.status==="high"?"↑":"↓"} {f.name}</span>
              <span style={{fontFamily:FF.m,fontSize:10,color:f.status==="high"?P.coral:P.amber}}>{f.val} {f.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{display:"flex",gap:6}}>
      {panels.map(p=><button key={p.id} onClick={()=>setActivePanel(p.id)} style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"6px 14px",borderRadius:7,cursor:"pointer",transition:"all .15s",background:activePanel===p.id?P.cardDk:P.card,color:activePanel===p.id?P.textInv:P.sub,border:`1px solid ${activePanel===p.id?P.cardDk:P.border}`,fontWeight:activePanel===p.id?600:400}}>{p.label}</button>)}
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px"}}>
      <SLabel color={panels.find(p=>p.id===activePanel)?.color} right={`${data.length} markers · most recent per biomarker`}>{panels.find(p=>p.id===activePanel)?.label}</SLabel>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:9}}>
        {data.map((b,i)=><BioCard key={i} {...b}/>)}
      </div>
      {data.some(b=>b.notRedrawn)&&(
        <div style={{fontFamily:FF.s,fontSize:8.5,color:P.amber,padding:"7px 10px",
          borderRadius:7,background:"rgba(196,120,48,0.07)",border:"1px solid rgba(196,120,48,0.2)",marginTop:8}}>
          * Not drawn in Jan 2026 — value shown is May 23, 2025 (BioLab), the most recent available.
        </div>
      )}
    </div>
    {PANEL_TREND_KEYS[activePanel] && (() => {
      const histData = LAB_HISTORY[activePanel] || [];
      const keys = PANEL_TREND_KEYS[activePanel];
      const panelColor = panels.find(p=>p.id===activePanel)?.color || P.cyan;
      const ax = { tick:{fontFamily:FF.m,fontSize:9,fill:P.muted}, axisLine:{stroke:P.border}, tickLine:false };

      // Single-metric mini chart
      const MiniTrend = ({metricKey, historyData}) => {
        const ref = LAB_REFS[metricKey];
        if (!ref) return null;
        const color = ref.color;
        const latest = historyData[historyData.length-1]?.[metricKey];
        const prev    = historyData[historyData.length-2]?.[metricKey];
        const delta   = latest != null && prev != null ? +(latest-prev).toFixed(1) : null;
        const isHigh  = ref.high  && latest > ref.high;
        const isLow   = ref.low   && latest < ref.low;
        const statusColor = isHigh||isLow ? (isHigh?P.coral:P.amber) : P.green;
        const statusLabel = isHigh?"HIGH":isLow?"LOW":"OK";
        return (
          <div style={{background:P.card,border:`1px solid ${isHigh||isLow?statusColor+"55":P.border}`,borderRadius:12,padding:"14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:3}}>{ref.label}</div>
                <div style={{fontFamily:FF.m,fontSize:20,fontWeight:600,color:statusColor,lineHeight:1}}>{latest}<span style={{fontSize:9,color:P.muted,marginLeft:3}}>{ref.unit}</span></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:statusColor,background:statusColor+"18",padding:"2px 6px",borderRadius:3,border:`1px solid ${statusColor}33`}}>{statusLabel}</span>
                {delta!=null&&<span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:delta>0?P.coral:delta<0?P.green:P.muted}}>{delta>0?`+${delta}`:delta}</span>}
              </div>
            </div>
            <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:6}}>
              {ref.optimal&&`Optimal: ${ref.optimal} ${ref.unit}`}
              {ref.optimal&&(ref.high||ref.low)&&" · "}
              {ref.high&&`Upper ref: ${ref.high}`}
              {ref.low&&`Lower ref: ${ref.low}`}
            </div>
            <ResponsiveContainer width="100%" height={72}>
              <LineChart data={historyData} margin={{top:4,right:4,left:-28,bottom:0}}>
                <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
                <XAxis dataKey="d" {...ax} interval={0} tick={{fontFamily:FF.m,fontSize:7,fill:P.muted}}/>
                <YAxis {...ax} domain={["auto","auto"]} tick={{fontFamily:FF.m,fontSize:7,fill:P.muted}}/>
                <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.panel,border:`1px solid ${P.border}`,borderRadius:6,padding:"6px 10px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.sub,marginBottom:2}}>{label}</div><div style={{fontFamily:FF.m,fontWeight:600,color}}>{payload[0]?.value} {ref.unit}</div></div>):null}/>
                {ref.high&&<ReferenceLine y={ref.high} stroke="#C4604A" strokeDasharray="4 3" strokeWidth={1}/>}
                {ref.low&&<ReferenceLine y={ref.low} stroke={P.border} strokeDasharray="3 3" strokeWidth={1}/>}
                {ref.optimal&&<ReferenceLine y={ref.optimal} stroke="#3A5C48" strokeDasharray="4 3" strokeWidth={1}/>}
                <Line type="monotone" dataKey={metricKey} stroke={color} strokeWidth={2} name={ref.label} isAnimationActive={true} animationDuration={900} animationEasing="ease-out"
                  dot={(p)=>{
                    const val=p.value;const isFlag=(ref.high&&val>ref.high)||(ref.low&&val<ref.low);
                    return p.index===historyData.length-1
                      ?<circle key={p.index} cx={p.cx} cy={p.cy} r={5} fill={isFlag?statusColor:color} stroke={P.panel} strokeWidth={2}/>
                      :<circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill={isFlag?statusColor:color} stroke={P.panel} strokeWidth={1}/>;
                  }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      };

      return (
        <div style={{background:P.card,border:`1px solid ${panelColor}33`,borderRadius:14,padding:"18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={S.row8}>
              <div style={{width:3,height:13,borderRadius:2,background:panelColor}}/>
              <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.sub}}>
                {panels.find(p=>p.id===activePanel)?.label} · Trend Since Feb 2023
              </span>
            </div>
            <div style={S.row6}>
              <div style={{width:8,height:1,background:P.coral,borderRadius:1}}/><span style={S.mut8}>upper ref</span>
              <div style={{width:8,height:1,background:P.amber,borderRadius:1,marginLeft:4}}/><span style={S.mut8}>lower ref</span>
              <div style={{width:8,height:1,background:P.green,borderRadius:1,marginLeft:4}}/><span style={S.mut8}>optimal</span>
              <div style={{marginLeft:6,padding:"2px 8px",borderRadius:4,background:P.panel,border:`1px solid ${P.border}`,fontFamily:FF.s,fontSize:8,color:P.muted}}>
                • Feb 14 '25 = real data · prior points estimated
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(keys.length,3)},1fr)`,gap:12}}>
            {keys.map(k=><MiniTrend key={k} metricKey={k} historyData={histData}/>)}
          </div>
        </div>
      );
    })()}
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <SLabel color={P.cyan}>Clinical Analysis</SLabel>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,padding:"3px 10px",borderRadius:5,background:P.panel,border:`1px solid ${P.border}`}}>
          Latest: Jan 15 '26 (lipids/metabolic) · May 23 '25 (hormones/CRP/HbA1c) · Feb 14 '25 (baseline)
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {[
          {title:"Lipid Panel — Jan 2026 Confirmed",color:P.sage,flag:false,badge:"CONFIRMED",
           note:"Jan 15 2026: TG 80 (↓ from 183), HDL 62, LDL 71 — sustained improvement"},
          {title:"Iron Status — Resolved",color:P.sage,flag:false,badge:"RESOLVED",
           note:"Ferritin normalized from 394.5 (Feb 14) to 178.2 ng/mL (May 23) — now well"},
          {title:"Vitamin D — Improved, Continue Protocol",color:P.amber,flag:true,badge:"MONITOR",
           note:"Vitamin D improved from 26.5 (insufficient) to 36.5 ng/mL (May 23) — now i"},
          {title:"BUN — Resolved",color:P.sage,flag:false,badge:"RESOLVED",
           note:"BUN was mildly elevated at 21.0 mg/dL in May '25 (ref 8.9–20.6). Jan '26 E"},
          {title:"Testosterone — Watch Trend",color:P.violet,flag:true,badge:"WATCH",
           note:"Testosterone improved slightly from 342→377 ng/dL (Feb→May), but remains i"},
          {title:"Metabolic Health — Strong",color:P.sage,flag:false,badge:"GOOD",
           note:"Jan '26: Glucose 97 (normal), ALT 24, AST 21, GGT 12 — liver enzymes trend"},
        ].map(({title,color,flag,badge,note})=>(
          <div key={title} style={{padding:"12px 14px",background:flag?color+"08":P.panel,borderRadius:9,border:`1px solid ${flag?color+"44":P.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,flexWrap:"wrap"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:color,flexShrink:0}}/>
              <span style={{fontFamily:FF.s,fontWeight:700,fontSize:11,color:flag?color:P.text,flex:1}}>{title}</span>
              <span style={{fontFamily:FF.s,fontSize:7.5,fontWeight:700,color:color,background:color+"18",padding:"2px 6px",borderRadius:3,border:`1px solid ${color}33`,letterSpacing:"0.06em"}}>{badge}</span>
            </div>
            <div style={{fontFamily:FF.s,fontSize:10.5,color:P.sub,lineHeight:1.65}}>{note}</div>
          </div>
        ))}
      </div>
    </div>
  </div>);
}
