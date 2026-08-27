// Lab Trends — small-multiples of every historical biomarker series.
// Real draws (★) render as solid points; estimated baselines render hollow on a
// dashed segment and can be hidden entirely, so synthetic values are never
// mistaken for measurements.
import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, ReferenceArea, ReferenceLine, CartesianGrid,
} from "recharts";
import { P, FF, S } from "../lib/theme.js";
import { LAB_HISTORY, LAB_REFS } from "../lib/data/labs.js";
import { SLabel } from "../components/shared.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";

const PANELS = [
  { id:"lipids",    label:"Lipids",          color:P.terra,  keys:["chol","ldl","hdl","trig","apob","crp"] },
  { id:"metabolic", label:"Metabolic",       color:P.amber,  keys:["hba1c","glucose","creatinine","egfr","alt","ast"] },
  { id:"hormones",  label:"Hormones",        color:P.violet, keys:["testo","dheas","vitd","tsh","cortisol"] },
  { id:"special",   label:"Special Chem",    color:P.steel,  keys:["ferritin","homocysteine","psa"] },
  { id:"cbc",       label:"CBC",             color:P.sage,   keys:["hgb","hct","rbc","wbc","plt"] },
];

const isReal = d => typeof d === "string" && d.includes("★");
const cleanLabel = d => (d || "").replace(" ★", "").trim();

// Direction of "good" per metric, for coloring the latest delta.
const LOWER_IS_BETTER = new Set(["trig","ldl","chol","apob","crp","hba1c","alt","ast","creatinine","ferritin","homocysteine","psa"]);

function MetricChart({ metricKey, rows, showEstimates }) {
  const ref = LAB_REFS[metricKey];
  if (!ref) return null;

  const source = showEstimates ? rows : rows.filter(r => isReal(r.d));
  const data = source
    .filter(r => r[metricKey] != null)
    .map(r => ({ d: cleanLabel(r.d), v: r[metricKey], real: isReal(r.d) }));

  if (data.length === 0) return null;

  const values  = data.map(p => p.v);
  const latest  = data[data.length - 1];
  const prior   = data.length > 1 ? data[data.length - 2] : null;
  const delta   = prior ? +(latest.v - prior.v).toFixed(2) : null;

  // Y domain padded around both the data and any reference bounds.
  const bounds = [...values, ref.high, ref.low, ref.optimal].filter(v => v != null);
  const lo = Math.min(...bounds), hi = Math.max(...bounds);
  const pad = (hi - lo) * 0.15 || Math.abs(hi * 0.1) || 1;
  const domain = [+(lo - pad).toFixed(2), +(hi + pad).toFixed(2)];

  // In-range shading: between low and high where defined.
  const bandLo = ref.low  != null ? ref.low  : domain[0];
  const bandHi = ref.high != null ? ref.high : domain[1];

  const inRange =
    (ref.high == null || latest.v <= ref.high) &&
    (ref.low  == null || latest.v >= ref.low);

  let deltaColor = P.muted;
  if (delta != null && delta !== 0) {
    const improving = LOWER_IS_BETTER.has(metricKey) ? delta < 0 : delta > 0;
    deltaColor = improving ? P.sage : P.terra;
  }

  const hasEstimates = data.some(p => !p.real);

  return (
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,
      padding:"13px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
        gap:8,marginBottom:8}}>
        <div style={{minWidth:0}}>
          <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.sub,lineHeight:1.3}}>
            {ref.label}
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:3}}>
            <span style={{fontFamily:FF.r,fontSize:21,fontWeight:600,lineHeight:1,
              letterSpacing:"-0.01em",color:inRange?P.text:P.terra}}>
              {latest.v}
            </span>
            <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>{ref.unit}</span>
            {delta != null && delta !== 0 && (
              <span style={{fontFamily:FF.m,fontSize:9,fontWeight:700,color:deltaColor}}>
                {delta > 0 ? "↑" : "↓"}{Math.abs(delta)}
              </span>
            )}
          </div>
        </div>
        <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.04em",
          padding:"2px 7px",borderRadius:99,whiteSpace:"nowrap",
          color:inRange?P.sage:P.terra,background:inRange?P.sageBg:P.terracottaBg}}>
          {inRange ? "In range" : "Out"}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={92}>
        <LineChart data={data} margin={{top:4,right:6,left:-22,bottom:0}}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          {(ref.low != null || ref.high != null) && (
            <ReferenceArea y1={bandLo} y2={bandHi} fill={P.sage} fillOpacity={0.07} stroke="none"/>
          )}
          {ref.high != null && (
            <ReferenceLine y={ref.high} stroke={P.terra} strokeDasharray="3 3" strokeOpacity={0.5}/>
          )}
          {ref.low != null && (
            <ReferenceLine y={ref.low} stroke={P.terra} strokeDasharray="3 3" strokeOpacity={0.5}/>
          )}
          <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:7.5,fill:P.muted}}
            axisLine={{stroke:P.border}} tickLine={false} interval="preserveStartEnd"/>
          <YAxis domain={domain} tick={{fontFamily:FF.m,fontSize:7.5,fill:P.muted}}
            axisLine={false} tickLine={false} width={40}/>
          <Tooltip
            contentStyle={{background:P.card,border:`1px solid ${P.border}`,borderRadius:9,
              fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}
            labelStyle={{color:P.muted,fontSize:9}}
            formatter={(v,_n,p)=>[
              `${v} ${ref.unit}${p?.payload?.real ? "" : "  (estimated)"}`,
              ref.label,
            ]}
          />
          <Line type="monotone" dataKey="v" stroke={ref.color} strokeWidth={1.8}
            isAnimationActive={false}
            dot={({cx,cy,payload,index})=>(
              <circle key={index} cx={cx} cy={cy} r={payload.real?3.4:3}
                fill={payload.real?ref.color:P.card}
                stroke={ref.color} strokeWidth={payload.real?0:1.4}
                strokeDasharray={payload.real?"0":"2 1.5"}/>
            )}
            activeDot={{r:5,fill:ref.color}}/>
        </LineChart>
      </ResponsiveContainer>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        marginTop:5,gap:6}}>
        <span style={{fontFamily:FF.s,fontSize:8,color:P.muted}}>
          {ref.low != null && ref.high != null ? `Ref ${ref.low}–${ref.high}`
            : ref.high != null ? `Ref <${ref.high}`
            : ref.low  != null ? `Ref >${ref.low}` : ""}
          {ref.optimal != null ? ` · optimal ~${ref.optimal}` : ""}
        </span>
        {hasEstimates && (
          <span style={{fontFamily:FF.s,fontSize:7.5,color:P.amber}}>incl. estimates</span>
        )}
      </div>
    </div>
  );
}

export function LabTrendsPage() {
  const mob = useIsMobile();
  const [showEstimates, setShowEstimates] = useState(false);
  const [activePanel, setActivePanel] = useState("all");

  const visible = activePanel === "all" ? PANELS : PANELS.filter(p => p.id === activePanel);

  // Count how many synthetic points exist across the whole dataset.
  const estimateCount = Object.values(LAB_HISTORY)
    .flat()
    .filter(r => !isReal(r.d)).length;

  return (
    <div style={S.col18}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",
        gap:12,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",
            textTransform:"uppercase",marginBottom:3}}>Longitudinal</div>
          <div style={S.h18}>Lab Trends</div>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",
          padding:"6px 12px",borderRadius:8,background:P.card,border:`1px solid ${P.border}`}}>
          <input type="checkbox" checked={showEstimates}
            onChange={e=>setShowEstimates(e.target.checked)}
            style={{cursor:"pointer",accentColor:P.amber}}/>
          <span style={{fontFamily:FF.s,fontSize:11,color:P.sub}}>
            Show estimated baselines
          </span>
        </label>
      </div>

      {/* Data-provenance notice */}
      <div style={{background:showEstimates?P.amberBg:P.panel,
        border:`1px solid ${showEstimates?P.amber+"44":P.border}`,
        borderRadius:11,padding:"11px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:13,lineHeight:1.2,flexShrink:0}}>{showEstimates?"⚠":"ℹ"}</span>
        <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6}}>
          {showEstimates ? (
            <>
              Showing <strong style={{color:P.amber}}>{estimateCount} estimated baseline points</strong> alongside
              real draws. Estimates are hollow markers. They pre-date the confirmed
              Jul 31 2024 Cedars panel and disagree with it sharply — that draw measured
              TG 91 / HDL 57, while the <em>estimated</em> Aug '24 point claims TG 188 / HDL 38
              four weeks later. Treat estimated points as illustrative only.
            </>
          ) : (
            <>
              Showing <strong style={{color:P.sage}}>confirmed draws only</strong> — every point
              is a real lab result. {estimateCount} estimated baseline points are hidden.
            </>
          )}
        </div>
      </div>

      {/* Panel filter */}
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{display:"flex",gap:6,minWidth:"max-content"}}>
          {[{id:"all",label:"All Panels"},...PANELS].map(p=>(
            <button key={p.id} onClick={()=>setActivePanel(p.id)}
              style={{fontFamily:FF.s,fontSize:11,padding:"6px 14px",borderRadius:7,
                cursor:"pointer",transition:"all .15s",whiteSpace:"nowrap",flexShrink:0,
                background:activePanel===p.id?P.cardDk:P.card,
                color:activePanel===p.id?P.textInv:P.sub,
                border:`1px solid ${activePanel===p.id?P.cardDk:P.border}`,
                fontWeight:activePanel===p.id?600:400}}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {visible.map(panel=>{
        const rows = LAB_HISTORY[panel.id] || [];
        const charts = panel.keys
          .map(k=><MetricChart key={k} metricKey={k} rows={rows} showEstimates={showEstimates}/>)
          .filter(Boolean);
        if (charts.length===0) return null;
        const realCount = rows.filter(r=>isReal(r.d)).length;
        return (
          <div key={panel.id} style={{background:P.card,border:`1px solid ${P.border}`,
            borderRadius:14,padding:"16px"}}>
            <SLabel color={panel.color}
              right={`${realCount} confirmed draw${realCount===1?"":"s"}`}>
              {panel.label}
            </SLabel>
            <div style={{display:"grid",
              gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(240px,1fr))",gap:11}}>
              {charts}
            </div>
          </div>
        );
      })}

      <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,textAlign:"center",
        padding:"6px 0 14px",lineHeight:1.6}}>
        Solid markers are confirmed lab draws · hollow markers are estimated baselines<br/>
        Shaded band = reference range · dashed lines = range bounds
      </div>
    </div>
  );
}
