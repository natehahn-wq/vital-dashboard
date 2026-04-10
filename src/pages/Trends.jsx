// Performance trends page — WHOOP weekly averages (HRV/recovery/RHR/sleep/strain),
// daily Hume weight + BIA + BMI, and the DXA scan reference card.
import { useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { P, FF, S } from "../lib/theme.js";
import { WT } from "../lib/data/whoop.js";
import { HUME_DATA } from "../lib/data/body.js";

export function Trends(){
  const [range, setRange] = useState(26); // default: 6 months
  const ax = {tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};


  const RANGES = [
    {key:13,  label:"3M",  sub:"3 months"},
    {key:26,  label:"6M",  sub:"6 months"},
    {key:53,  label:"1Y",  sub:"1 year"},
    {key:9999,label:"All", sub:"All time (53 wks)"},
  ];

  const slice = WT.slice(-range);
  const xInterval = range <= 14 ? 1 : range <= 26 ? 2 : range <= 53 ? 4 : 7;
  const rangeLabel = RANGES.find(r=>r.key===range)?.sub || "";

  // Chart card component
  const CC = ({title,dataKey,color,domain,unit,height=130,refLine})=>{
    const safeId = dataKey.replace(/[^a-z]/gi,"");
    return(
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.1em",textTransform:"uppercase"}}>{title}</div>
          {unit&&<div style={S.mut9}>{unit}</div>}
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={slice} margin={{top:4,right:4,left:-22,bottom:0}}>
            <defs>
              <linearGradient id={`gt${safeId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25}/>
                <stop offset="100%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="label" {...ax} interval={xInterval}/>
            <YAxis {...ax} domain={domain||["auto","auto"]}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 12px",fontFamily:FF.s,fontSize:10,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:3,fontSize:9}}>{label}</div>{payload.map(p=><div key={p.name} style={{fontFamily:FF.m,color:p.color,fontWeight:600}}>{p.value} {unit}</div>)}</div>):null}/>
            {refLine&&<ReferenceLine y={refLine} stroke={color} strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}/>}
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.8}
              fill={`url(#gt${safeId})`} dot={false} isAnimationActive={true} animationDuration={900}
              activeDot={{r:3,fill:color,stroke:P.card,strokeWidth:2}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Avg values for selected range
  const avg = key => {
    const vals = slice.map(w=>w[key]).filter(Boolean);
    return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10 : null;
  };

  return(<div style={S.col16}>
    <div style={S.rowsb}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>WHOOP · Weekly Averages</div>
        <div style={S.h18}>Performance Trends</div>
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {RANGES.map(r=>(
          <button key={r.key} onClick={()=>setRange(r.key)}
            style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"5px 14px",borderRadius:7,cursor:"pointer",transition:"all .15s",
              background:range===r.key?P.cardDk:P.card,color:range===r.key?P.textInv:P.sub,
              border:`1px solid ${range===r.key?P.cardDk:P.border}`}}>
            {r.label}
          </button>
        ))}
      </div>
    </div>
    <div style={S.g120}>
      {[
        {label:"Avg HRV",    val:avg("hrv"),  unit:"ms",  color:P.sage},
        {label:"Avg Recovery",val:avg("rec"), unit:"%",   color:P.sage},
        {label:"Avg RHR",   val:avg("rhr"),  unit:"bpm", color:P.coral},
        {label:"Avg Sleep", val:avg("slp"),  unit:"h",   color:P.steel},
        {label:"Avg Weekly Strain",val:avg("strain"),unit:"",color:P.amber},
      ].map(({label,val,unit,color})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:11,padding:"11px 13px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{label}</div>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,lineHeight:1,letterSpacing:"-0.01em"}}>{val||"—"}<span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:3}}>{unit}</span></div>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:3}}>{rangeLabel}</div>
        </div>
      ))}
    </div>
    <CC title="Heart Rate Variability" dataKey="hrv" color={P.sage} domain={[25,75]} unit="ms" height={160} refLine={avg("hrv")}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
      <CC title="Recovery Score" dataKey="rec" color="#3A5C48" domain={[30,100]} unit="%" height={130} refLine={avg("rec")}/>
      <CC title="Resting Heart Rate" dataKey="rhr" color={P.coral} domain={[40,65]} unit="bpm" height={130} refLine={avg("rhr")}/>
      <CC title="Sleep Duration" dataKey="slp" color={P.steel} domain={[5,11]} unit="h" height={130}/>
      <CC title="Weekly Training Strain" dataKey="strain" color={P.amber} domain={[20,120]} unit="" height={130}/>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:16,margin:"4px 0 2px"}}>
      <div style={S.divider}/>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Weight</div>
      <div style={S.divider}/>
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.1em",textTransform:"uppercase"}}>Daily Weight · Hume Pod</div>
          <div style={S.mut9t2}>
            {HUME_DATA.length>0&&`${HUME_DATA[HUME_DATA.length-1].d} – ${HUME_DATA[0].d} · ${HUME_DATA.length} readings`}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:P.steel,letterSpacing:"-0.02em"}}>{HUME_DATA[0]?.wt}<span style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginLeft:3}}>lbs today</span></div>
          {(()=>{
            if(HUME_DATA.length<2) return null;
            const first = HUME_DATA[HUME_DATA.length-1].wt;
            const last  = HUME_DATA[0].wt;
            const diff  = +(last-first).toFixed(1);
            const col   = diff<0?P.sage:diff>0?"#C4604A":P.muted;
            return <div style={{fontFamily:FF.s,fontSize:9,color:col,marginTop:2}}>{diff>0?"+":""}{diff} lbs since {HUME_DATA[HUME_DATA.length-1].d}</div>;
          })()}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={[...HUME_DATA].reverse()} margin={{top:4,right:8,left:-18,bottom:0}}>
          <defs>
            <linearGradient id="gWtTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.steel} stopOpacity="0.20"/>
              <stop offset="100%" stopColor={P.steel} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            interval={Math.max(1,Math.floor(HUME_DATA.length/8))}/>
          <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            domain={[Math.floor(Math.min(...HUME_DATA.map(r=>r.wt))-2), Math.ceil(Math.max(...HUME_DATA.map(r=>r.wt))+2)]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 12px",fontFamily:FF.s,fontSize:10,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:3,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,fontWeight:600,color:P.steel}}>{payload[0]?.value} lbs</div></div>):null}/>
          <ReferenceLine y={216} stroke={P.terra} strokeDasharray="5 3" strokeOpacity={0.5} strokeWidth={1.2}
            label={{value:"DXA 216",position:"right",fontFamily:FF.s,fontSize:8,fill:P.terra,opacity:0.7}}/>
          <Area type="monotone" dataKey="wt" stroke={P.steel} strokeWidth={2}
            fill="url(#gWtTrend)" dot={false}
            isAnimationActive={true} animationDuration={900} name="Weight lbs"
            activeDot={{r:4,fill:P.steel,stroke:P.card,strokeWidth:2}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:16,margin:"4px 0 2px"}}>
      <div style={S.divider}/>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Daily Measurements · Hume Pod</div>
      <div style={S.divider}/>
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.1em",textTransform:"uppercase"}}>Body Fat % · Daily BIA</div>
          <div style={S.mut9t2}>Hume Pod BIA · Dec 2025–Mar 2026 · {HUME_DATA.length} readings</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color:P.amber,letterSpacing:"-0.01em"}}>{HUME_DATA[0]?.bf}%<span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:4}}>today</span></div>
          {(()=>{
            const first=HUME_DATA[HUME_DATA.length-1]?.bf, last=HUME_DATA[0]?.bf;
            if(!first||!last) return null;
            const diff=+(last-first).toFixed(2);
            return <div style={{fontFamily:FF.s,fontSize:9,color:diff<0?P.sage:"#C4604A",marginTop:2}}>{diff>0?"+":""}{diff}% since {HUME_DATA[HUME_DATA.length-1].d}</div>;
          })()}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={[...HUME_DATA].reverse()} margin={{top:4,right:8,left:-18,bottom:0}}>
          <defs>
            <linearGradient id="gHumeBF" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.amber} stopOpacity="0.22"/>
              <stop offset="100%" stopColor={P.amber} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            interval={Math.max(1,Math.floor(HUME_DATA.length/8))}/>
          <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            domain={[12,22]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 12px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,fontWeight:600,color:P.amber}}>{payload[0]?.value}% BIA</div><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:2}}>Note: BIA reads ~11pts lower than DXA</div></div>):null}/>
          <Area type="monotone" dataKey="bf" stroke={P.amber} strokeWidth={1.8}
            fill="url(#gHumeBF)" dot={false} isAnimationActive={true} animationDuration={900} name="BF % BIA"
            activeDot={{r:3,fill:P.amber,stroke:P.card,strokeWidth:2}}/>
        </AreaChart>
      </ResponsiveContainer>
      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:6,padding:"6px 10px",background:P.panel,borderRadius:6}}>
        ⚠ BIA consistently reads ~11 pts lower than DXA gold standard. Use this chart for <strong>trend direction</strong> only — not absolute body fat. DXA scan below is the clinical reference.
      </div>
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.1em",textTransform:"uppercase"}}>BMI · Daily</div>
          <div style={S.mut9t2}>Hume Pod · weight-based</div>
        </div>
        <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color:P.steel,letterSpacing:"-0.01em"}}>{HUME_DATA[0]?.bmi}</div>
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={[...HUME_DATA].reverse()} margin={{top:4,right:8,left:-18,bottom:0}}>
          <defs>
            <linearGradient id="gHumeBMI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.steel} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={P.steel} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            interval={Math.max(1,Math.floor(HUME_DATA.length/8))}/>
          <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} domain={[27,32]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 12px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,fontWeight:600,color:P.steel}}>BMI {payload[0]?.value}</div></div>):null}/>
          <ReferenceLine y={25} stroke="#3A5C48" strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}
            label={{value:"25",position:"right",fontFamily:FF.s,fontSize:8,fill:"#3A5C48",opacity:0.6}}/>
          <ReferenceLine y={30} stroke={P.terra} strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}
            label={{value:"30",position:"right",fontFamily:FF.s,fontSize:8,fill:P.terra,opacity:0.6}}/>
          <Area type="monotone" dataKey="bmi" stroke={P.steel} strokeWidth={1.8}
            fill="url(#gHumeBMI)" dot={false} isAnimationActive={true} animationDuration={900}
            activeDot={{r:3,fill:P.steel,stroke:P.card,strokeWidth:2}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:16,margin:"4px 0 2px"}}>
      <div style={S.divider}/>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>DXA Scan · Gold Standard</div>
      <div style={S.divider}/>
    </div>

    <div style={{background:"linear-gradient(135deg,#1A1714 0%,#111009 100%)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:16,padding:"20px",boxShadow:"0 8px 32px rgba(0,0,0,0.20)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>Hologic Horizon W · Pueblo Radiology</div>
          <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:"rgba(255,255,255,0.90)",letterSpacing:"-0.01em"}}>DXA Scan · Jan 23 2026</div>
          <div style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.40)",marginTop:3}}>Most recent gold-standard body composition measurement</div>
        </div>
        <div style={{padding:"5px 12px",borderRadius:8,background:"rgba(196,96,74,0.18)",border:"1px solid rgba(196,96,74,0.35)"}}>
          <div style={{fontFamily:FF.m,fontSize:20,fontWeight:700,color:"#E8816A",letterSpacing:"-0.01em"}}>26.4%</div>
          <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",marginTop:1}}>Total Body Fat</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:12,marginBottom:18}}>
        {[
          {label:"Fat Mass",   val:"56.5 lb",  color:"#E8816A"},
          {label:"Lean Mass",  val:"149.8 lb", color:"#7AC49A"},
          {label:"BMD",        val:"1.331",     color:"#6BAED6", note:"T+1.3 · 111th %ile"},
          {label:"VAT Area",   val:"118 cm²",   color:"#F0B85A", note:"Est. visceral fat"},
          {label:"A/G Ratio",  val:"0.96",      color:"#7AC49A", note:"Balanced"},
          {label:"BMI",        val:"29.3",      color:"#B0A89E"},
        ].map(({label,val,color,note})=>(
          <div key={label} style={{padding:"10px 12px",background:"rgba(255,255,255,0.05)",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.38)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
            <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color,lineHeight:1}}>{val}</div>
            {note&&<div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.28)",marginTop:3}}>{note}</div>}
          </div>
        ))}
      </div>
      <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:10}}>Regional Fat Distribution</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[
          {name:"Trunk",     fatPct:26.3, leanLbs:77.5,  fatLbs:27.6, bmd:1.131},
          {name:"Left Leg",  fatPct:29.6, leanLbs:24.2,  fatLbs:10.2, bmd:1.443},
          {name:"Right Leg", fatPct:29.3, leanLbs:25.3,  fatLbs:10.5, bmd:1.500},
          {name:"Left Arm",  fatPct:20.9, leanLbs:10.4,  fatLbs:2.8,  bmd:1.080},
          {name:"Right Arm", fatPct:20.0, leanLbs:11.0,  fatLbs:2.8,  bmd:1.213},
        ].map(r=>{
          const col = r.fatPct<22?"#7AC49A":r.fatPct<26?"#F0B85A":"#E8816A";
          const barW = Math.round(r.fatPct*3.2); // scale to ~100px max
          return(
            <div key={r.name} style={{display:"grid",gridTemplateColumns:"72px 1fr 80px 80px",gap:12,alignItems:"center"}}>
              <div style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.70)"}}>{r.name}</div>
              <div style={S.row8}>
                <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.08)",flex:1,overflow:"hidden"}}>
                  <div style={{width:`${r.fatPct*3.2}%`,height:"100%",background:col,borderRadius:3,transition:"width 1s ease"}}/>
                </div>
                <span style={{fontFamily:FF.m,fontSize:10,fontWeight:600,color:col,minWidth:36}}>{r.fatPct}%</span>
              </div>
              <div style={{fontFamily:FF.m,fontSize:9,color:"rgba(255,255,255,0.40)",textAlign:"right"}}>{r.fatLbs} lb fat</div>
              <div style={{fontFamily:FF.m,fontSize:9,color:"rgba(255,255,255,0.40)",textAlign:"right"}}>{r.leanLbs} lb lean</div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:18,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:10}}>Scan History · Body Fat %</div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={[
            {d:"Feb '25",v:23.9,src:"Styku"},
            {d:"May '25",v:21.1,src:"Styku"},
            {d:"Jan '26",v:26.4,src:"DXA"},
          ]} margin={{top:4,right:8,left:-22,bottom:0}}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:8,fill:"rgba(255,255,255,0.35)"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:"rgba(255,255,255,0.35)"}} axisLine={false} tickLine={false} domain={[18,30]}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:"#1A1714",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:"rgba(255,255,255,0.45)",fontSize:9,marginBottom:2}}>{label} · {payload[0]?.payload?.src}</div><div style={{fontFamily:FF.m,fontWeight:600,color:"#E8816A"}}>{payload[0]?.value}%</div></div>):null}/>
            <Line type="monotone" dataKey="v" stroke="#E8816A" strokeWidth={2} isAnimationActive={true} animationDuration={900}
              dot={p=><circle key={p.index} cx={p.cx} cy={p.cy} r={6} fill={p.payload.src==="DXA"?"#E8816A":"#B06050"} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5}/>}
              name="Body Fat %"/>
          </LineChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:16,marginTop:8}}>
          {[{c:"#B06050",l:"Styku 3D optical"},{c:"#E8816A",l:"DXA (gold standard)"}].map(({c,l})=>(
            <div key={l} style={S.row5}>
              <div style={{width:8,height:8,borderRadius:"50%",background:c}}/>
              <span style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>);
}
