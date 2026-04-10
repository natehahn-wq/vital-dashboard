// Score page — VITAL master health score breakdown across 7 clinical domains.
// Shows master ring, sub-score cards, drill-down driver grid, full history
// chart, top-3 actions, and the lab integration panel.
import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { P, FF, S, CS } from "../lib/theme.js";
import { SCORE_COLOR, SCORE_LABEL, SCORE_GRADE } from "../lib/utils.js";
import { SCORES_NOW, SCORE_HISTORY, METABOLIC_AGE } from "../lib/data/scores.js";
import { LAB_OVERDUE } from "../lib/data/labs.js";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { MasterRing, SubScoreCard, SLabel, CTip } from "../components/shared.jsx";

export function ScorePage(){
  const [activeDetail,setActiveDetail]=useState("cardiovascular");
  const ax={tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};
  const detail=SCORES_NOW[activeDetail];
  const subKeys=["cardiovascular","metabolic","bodyComp","strength","hormonal","longevity","recovery"];

  return(<div style={S.col18}>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>{(()=>{const mob=useIsMobile();return(
      <div style={{display:"flex",flexDirection:mob?"column":"row",gap:mob?18:32,alignItems:mob?"center":"center",flexWrap:"nowrap"}}>
      <div style={{flexShrink:0}}>
        <MasterRing score={SCORES_NOW.master.score}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>VITAL Health Score · Nate Hahn · 47yo Male</div>
        <div style={{fontFamily:FF.s,fontWeight:800,fontSize:22,color:P.text,marginBottom:4}}>
          {SCORE_GRADE(SCORES_NOW.master.score)} · {SCORE_LABEL(SCORES_NOW.master.score)}
        </div>
        <div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.7,maxWidth:"100%",marginBottom:16}}>
          Your score reflects 7 clinical domains anchored to the most recent source for each — <span style={{color:P.cyan,fontWeight:700}}>Recovery, Strength, and Cardiovascular use 90-day rolling WHOOP averages</span> ({window.__VITAL_90DAY_RANGE__ || "Jan 1 2026 \u2013 Apr 1 2026"}) rather than single-day snapshots. Labs: Jan 15 '26 (lipids/metabolic) + May 23 '25 (hormones/CRP/HbA1c) — most recent per biomarker. Body comp: Jan 23 '26 DXA. Score is <span style={{color:P.cyan,fontWeight:700}}>+2 pts</span> since Feb '25 — lipid and longevity gains are partially offset by 3-month recovery averaging (63.9% avg vs 66.6% baseline) and a running-heavy training block with limited functional strength work.
          Primary opportunities: Monitor testosterone decline (560→377), DHEA-S now elevated (needs recalibration), watch eGFR trend (97→77).
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {[
            {label:"Feb 14 Score",val:68,color:P.amber},
            {label:"Current Score",val:SCORES_NOW.master.score,color:P.cyan},
            {label:"Change",val:`+${SCORES_NOW.master.score-SCORES_NOW.master.prev} pts`,color:P.green},
            {label:"Percentile Est.",val:"Top 35%",color:P.violet},
          ].map(({label,val,color})=>(
            <div key={label} style={{padding:"10px 16px",background:P.panel,borderRadius:10,border:`1px solid ${P.border}`}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{label}</div>
              <div style={{fontFamily:FF.m,fontSize:18,fontWeight:600,color}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      {!mob&&<div style={{width:220,flexShrink:0}}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Score History</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={SCORE_HISTORY} margin={{top:4,right:4,left:-28,bottom:0}}>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax} interval={1}/>
            <YAxis {...ax} domain={[55,85]}/>
            <Tooltip content={<CTip/>}/>
            <ReferenceLine y={SCORES_NOW.master.prev} stroke={P.border} strokeDasharray="3 3" strokeWidth={1}/>
            <Line type="monotone" dataKey="master" stroke={P.sage} strokeWidth={3.5} isAnimationActive={true} animationDuration={1400} animationEasing="ease-out"
              dot={(p)=>p.index===3||p.index===6?<circle cx={p.cx} cy={p.cy} r={5} fill={P.sage} stroke={P.card} strokeWidth={2}/>:<span/>}
              name="VITAL Score"/>

          <ReferenceLine y={SCORES_NOW.master.score} stroke={P.cyan} strokeDasharray="6 3" label={{value:"Now",position:"right",fill:P.cyan,fontSize:10}} /></LineChart>
        </ResponsiveContainer>
      </div>}
      </div>);})()}
    </div>

      {/* ── Metabolic Age + Domain Contributions ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
        {/* Left – Perceived Metabolic Age card */}
        <div style={{background:P.cardDk,borderRadius:16,padding:"28px 24px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:16}}>Perceived Metabolic Age</div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
            <div style={{fontFamily:FF.r,fontSize:64,fontWeight:600,color:P.textInv,lineHeight:1,letterSpacing:"-0.03em"}}>{METABOLIC_AGE.perceived}</div>
            <div style={{fontFamily:FF.s,fontSize:13,color:P.mutedDk}}>years</div>
          </div>
          <div style={{fontFamily:FF.s,fontSize:12,color:P.muted,marginBottom:8}}>Chronological: {METABOLIC_AGE.chrono}</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:99,background:"rgba(106,168,79,0.12)",alignSelf:"flex-start"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:P.sage}}></div>
            <span style={{fontFamily:FF.s,fontSize:11,fontWeight:500,color:P.sage}}>{Math.round(METABOLIC_AGE.chrono - METABOLIC_AGE.perceived)} years younger</span>
          </div>
        </div>
        {/* Right – Domain Contributions */}
        <div style={{background:P.card,borderRadius:16,padding:"24px 22px"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:18}}>Domain Contributions</div>
          {METABOLIC_AGE.factors.map((f,i)=>(
            <div key={i} style={{marginBottom:i<METABOLIC_AGE.factors.length-1?12:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:FF.s,fontSize:11,color:P.text}}>{f.name}</span>
                <span style={{fontFamily:FF.s,fontSize:11,color:f.delta<0?P.sage:P.terra,fontWeight:600}}>{f.delta<0?"":"+"}{f.delta} yrs</span>
              </div>
              <div style={{height:5,borderRadius:3,background:P.border}}>
                <div style={{height:5,borderRadius:3,width:Math.min(Math.abs(f.delta)/6*100,100)+"%",background:f.delta<0?P.sage:P.terra}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
      {subKeys.map(k=><SubScoreCard key={k} data={SCORES_NOW[k]} active={activeDetail===k} onClick={()=>setActiveDetail(k)}/>)}
    </div>
    <div style={CS(14,"18px 20px","none")}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>{detail.icon} {detail.label} · {detail.dataDate||"Multiple sources"}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:12}}>
            <span style={{fontFamily:FF.m,fontSize:42,fontWeight:600,color:SCORE_COLOR(detail.score),lineHeight:1}}>{detail.score}</span>
            <span style={{fontFamily:FF.s,fontSize:12,color:P.sub}}>/100 · {SCORE_LABEL(detail.score)}</span>
            <span style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:detail.score>detail.prev?P.green:detail.score<detail.prev?P.coral:P.muted}}>
              {detail.score>detail.prev?`+${detail.score-detail.prev}`:detail.score<detail.prev?detail.score-detail.prev:"no change"} pts since Feb '25
            </span>
          </div>
        </div>
        <div style={{width:"min(180px,100%)",minWidth:120}}>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={SCORE_HISTORY} margin={{top:4,right:0,left:-28,bottom:0}}>
              <Line type="monotone" dataKey={activeDetail==="bodyComp"?"bodyComp":activeDetail} stroke={detail.color} strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={800}/>
              <Tooltip content={<CTip/>}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:9}}>
        {detail.drivers.map((d,i)=>{
          const dc=SCORE_COLOR(d.score);
          return(<div key={i} style={{padding:"12px",background:P.card,borderRadius:10,border:`1px solid ${d.trend==="flag"?dc+"44":P.border}`,boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
              <span style={{fontFamily:FF.s,fontSize:9,color:P.sub,lineHeight:1.4,flex:1}}>{d.name}</span>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,marginLeft:6,flexShrink:0}}>
                <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:dc,background:dc+"18",padding:"1px 6px",borderRadius:3}}>{d.score}</span>
                {d.trend!=="stable"&&<span style={{fontSize:9}}>{d.trend==="up"?"↗":d.trend==="flag"?"⚠️":"→"}</span>}
              </div>
            </div>
            <div style={{fontFamily:FF.m,fontSize:14,fontWeight:600,color:dc,lineHeight:1,marginBottom:3}}>{d.val}</div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.4}}>{d.note}</div>
            <div style={{marginTop:6,height:3,background:P.border,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${d.score}%`,background:dc,borderRadius:2,transition:`width 0.8s cubic-bezier(0.34,1.2,0.64,1) ${i*50}ms`}}/>
            </div>
          </div>);
        })}
      </div>
    </div>
    <div style={CS(14,"18px 20px","none")}>
      <SLabel color={P.cyan} right="Nov 2024 → May 2025">All Category Score Trends</SLabel>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={SCORE_HISTORY} margin={{top:8,right:16,left:-20,bottom:0}}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" {...ax}/><YAxis {...ax} domain={[50,90]}/>
          <Tooltip content={<CTip/>}/>
          <Line type="monotone" dataKey="master"         stroke={P.cyan}   strokeWidth={3} dot={false} name="VITAL Score"/>
          <Line type="monotone" dataKey="cardiovascular" stroke={P.coral}  strokeWidth={1.5} dot={false} name="Cardio" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="metabolic"      stroke={P.amber}  strokeWidth={1.5} dot={false} name="Metabolic" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="bodyComp"       stroke={P.violet} strokeWidth={1.5} dot={false} name="Body Comp" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="strength"       stroke={P.blue}   strokeWidth={1.5} dot={false} name="Strength" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="hormonal"       stroke={P.pink}   strokeWidth={1.5} dot={false} name="Hormonal" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="recovery"       stroke={P.green}  strokeWidth={1.5} dot={false} name="Recovery" strokeDasharray="4 2"/>
        </LineChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:10}}>
        {[
          {label:"VITAL Score",color:P.cyan,w:3},
          {label:"Cardio",color:P.coral,w:1.5},
          {label:"Metabolic",color:P.amber,w:1.5},
          {label:"Body Comp",color:P.violet,w:1.5},
          {label:"Strength",color:P.blue,w:1.5},
          {label:"Hormonal",color:P.pink,w:1.5},
          {label:"Recovery",color:P.green,w:1.5},
        ].map(({label,color})=>(
          <div key={label} style={S.row5}>
            <div style={{width:16,height:2,background:color,borderRadius:1}}/>
            <span style={S.sub10}>{label}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={CS(14,"18px 20px","none")}>
      <SLabel color={P.amber}>Top 3 Priority Actions</SLabel>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:12}}>
        {[
          {rank:1,cat:"Longevity",score:64,action:"Investigate elevated Ferritin (394.5)",detail:"Retest fasting ferritin + iron panel. Consider HFE gene test. Ferritin is your lowest single driver.",color:P.coral,impact:"+3–5 pts"},
          {rank:2,cat:"Hormonal",score:66,action:"Supplement Vitamin D3 + K2",detail:"At 26.5 ng/mL you're insufficient. Target 50–70 ng/mL with 5,000 IU/day D3. Impacts immunity, hormones, mood.",color:P.amber,impact:"+2–4 pts"},
          {rank:3,cat:"Hormonal",score:66,action:"Address low DHEA-S (119.1)",detail:"Below range for 47yo. Discuss 25–50mg DHEA supplementation with Dr. Greene. Supports testosterone and energy.",color:P.amber,impact:"+2–3 pts"},
        ].map(({rank,cat,score,action,detail,color,impact})=>(
          <div key={rank} style={{padding:"16px 18px",background:P.card,borderRadius:12,border:`1px solid ${P.border}`,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:22,height:22,borderRadius:6,background:color+"22",border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.m,fontSize:11,fontWeight:700,color,flexShrink:0}}>{rank}</div>
              <div>
                <span style={{fontFamily:FF.s,fontSize:8,color:color,background:color+"15",padding:"1px 6px",borderRadius:3,marginRight:5}}>{cat}</span>
                <span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.green}}>{impact}</span>
              </div>
            </div>
            <div style={{fontFamily:FF.s,fontWeight:700,fontSize:11,color:P.text,marginBottom:5,lineHeight:1.3}}>{action}</div>
            <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>{detail}</div>
          </div>
        ))}
      </div>
    </div>


      {/* ── Lab Integration Panel ── */}
      <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:16,padding:"22px 24px",marginTop:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontFamily:FF.s,fontSize:13,fontWeight:600,color:P.text,marginBottom:2}}>Lab Integration</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>What Would Move Your Score</div>
          </div>
          {LAB_OVERDUE&&LAB_OVERDUE.length>0&&<div style={{padding:"4px 10px",borderRadius:99,background:"rgba(194,84,56,0.12)",fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.terra}}>{LAB_OVERDUE.length} overdue</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            {domain:"Hormonal",color:P.pink,score:SCORES_NOW.hormonal.score,labs:["Testosterone","Estradiol","DHEA-S"],warn:["Testosterone"],impact:"+4"},
            {domain:"Longevity",color:P.green,score:SCORES_NOW.recovery.score,labs:["IGF-1","hsCRP","HbA1c"],warn:["hsCRP"],impact:"+3"},
            {domain:"Cardiovascular",color:P.coral,score:SCORES_NOW.cardiovascular.score,labs:["ApoB","Lp(a)","LP-PLA2"],warn:[],impact:"+2"},
            {domain:"Metabolic",color:P.amber,score:SCORES_NOW.metabolic.score,labs:["Fasting Insulin","HOMA-IR","Triglycerides"],warn:["HOMA-IR"],impact:"+3"}
          ].map((d,i)=>(
            <div key={i} style={{background:P.panel,borderRadius:12,padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:d.color}}>{d.domain}</span>
                <span style={{fontFamily:FF.r,fontSize:15,fontWeight:700,color:P.text}}>{d.score}</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {d.labs.map((lab,j)=>(
                  <span key={j} style={{padding:"2px 8px",borderRadius:99,fontSize:9,fontFamily:FF.s,background:d.warn.includes(lab)?"rgba(194,84,56,0.12)":P.border,color:d.warn.includes(lab)?P.terra:P.muted}}>
                    {d.warn.includes(lab)&&"⚠ "}{lab}
                  </span>
                ))}
              </div>
              <div style={{fontFamily:FF.s,fontSize:10,color:P.sage,fontWeight:600}}>Potential: {d.impact} pts</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12,fontFamily:FF.s,fontSize:9,color:P.muted,textAlign:"center"}}>Import lab results to unlock personalized score projections</div>
      </div></div>);
}
