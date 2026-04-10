// Correlations & Insights page — renders the curated cross-domain findings
// from CORR_DATA plus a static "What to do" action list.
import { P, FF, S } from "../lib/theme.js";
import { CORR_DATA } from "../lib/data/correlations.js";

export function CorrelationsPage(){
  const ax={tick:{fontFamily:FF.s,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};
  const Divider=()=><div style={S.divider}/>;
  const Finding=({icon,title,text,stat,statColor})=>(
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
        <div style={{width:36,height:36,borderRadius:9,background:P.panel,border:`1px solid ${P.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:FF.r,fontSize:13,fontWeight:600,color:P.text,marginBottom:4}}>{title}</div>
          <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.7}}>{text}</div>
        </div>
      </div>
      {stat&&(
        <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",
          borderRadius:6,background:statColor+"12",border:`1px solid ${statColor}33`}}>
          <span style={{fontFamily:FF.m,fontSize:11,fontWeight:700,color:statColor}}>{stat}</span>
        </div>
      )}
    </div>
  );

  return(<div style={S.col16}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
      <div>
        <div style={S.mut9uc}>55 weeks · Dec 2024 – Mar 2026</div>
        <div style={S.h18}>Correlations & Insights</div>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))",gap:12}}>
      {CORR_DATA.map((d,i)=>(
        <Finding key={i} icon={d.icon} title={d.title} text={d.text} stat={d.stat} statColor={d.statColor}/>
      ))}
    </div>

    <div style={{background:P.cardDk,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"18px 20px"}}>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>
        What to do
      </div>
      {[
        {icon:"🚫",priority:"High",text:"Eliminate weeknight alcohol — the recovery cost is 26 pts. Even 1 drink on a Thursday destroys Friday training quality."},
        {icon:"📅",priority:"High",text:"Plan key workouts or performance events in May or September — your body is measurably at its best."},
        {icon:"😴",priority:"Medium",text:"Protect the 7.5h sleep floor — your variance is high. On nights you can't get 8h, prioritize sleep quality over duration."},
        {icon:"🏋",priority:"Medium",text:"2 FF sessions/week is your HRV-positive sweet spot. Adding a 3rd before your aerobic base is rebuilt will suppress recovery."},
      ].map(({icon,priority,text},i)=>(
        <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<3?12:0}}>
          <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
          <div style={{flex:1}}>
            <span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:priority==="High"?P.terra:P.amber,
              textTransform:"uppercase",letterSpacing:"0.08em",marginRight:6}}>{priority}</span>
            <span style={{fontFamily:FF.s,fontSize:11,color:P.textInv,lineHeight:1.6}}>{text}</span>
          </div>
        </div>
      ))}
    </div>

  </div>);
}
