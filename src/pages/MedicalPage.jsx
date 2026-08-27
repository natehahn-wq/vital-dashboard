// Medical page — the clinical record layer: allergies, medications, supplements,
// condition history, preventive-care screenings, BP log, and family history.
import { P, FF, S } from "../lib/theme.js";
import { SLabel } from "../components/shared.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import {
  MEDICATIONS, SUPPLEMENTS_CURRENT, SUPPLEMENTS_STOPPED, ALLERGIES,
  CONDITIONS, FAMILY_HISTORY, SCREENINGS, BP_LOG,
} from "../lib/data/medical.js";

const STATUS_META = {
  overdue: { label:"Overdue",   color:P.terra, bg:P.terracottaBg },
  action:  { label:"To do",     color:P.amber, bg:P.amberBg },
  pending: { label:"Pending",   color:P.steel, bg:P.steelBg },
  current: { label:"Current",   color:P.sage,  bg:P.sageBg },
  closed:  { label:"Closed ✓",  color:P.sage,  bg:P.sageBg },
};

function Pill({ status }) {
  const m = STATUS_META[status] || STATUS_META.current;
  return (
    <span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:m.color,background:m.bg,
      padding:"3px 9px",borderRadius:99,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>
      {m.label}
    </span>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,
      padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,.04)",...style}}>
      {children}
    </div>
  );
}

function AllergyBanner() {
  return (
    <div style={{background:P.terracottaBg,border:`1.5px solid ${P.terra}55`,borderRadius:14,
      padding:"16px 18px",display:"flex",gap:14,alignItems:"flex-start"}}>
      <div style={{width:34,height:34,borderRadius:8,background:P.terra+"1A",display:"flex",
        alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>⚠️</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.terra,
          letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>Allergy — flag before any imaging</div>
        {ALLERGIES.map(a=>(
          <div key={a.allergen}>
            <div style={{fontFamily:FF.s,fontSize:15,fontWeight:700,color:P.text,marginBottom:3}}>{a.allergen}</div>
            <div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.6}}>
              {a.reaction} · documented at {a.documented}
            </div>
            <div style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.terra,marginTop:5}}>{a.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedRow({ m }) {
  return (
    <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 0",
      borderBottom:`1px solid ${P.border}`}}>
      <div style={{width:3,alignSelf:"stretch",minHeight:34,borderRadius:2,
        background:m.critical?P.terra:P.steel,flexShrink:0}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
          <span style={{fontFamily:FF.s,fontSize:14,fontWeight:600,color:P.text}}>{m.name}</span>
          <span style={{fontFamily:FF.m,fontSize:12,color:P.steel}}>{m.dose}</span>
          <span style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>{m.freq}</span>
        </div>
        <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,marginTop:3}}>
          {m.indication} · started {m.started}
        </div>
        {m.note&&<div style={{fontFamily:FF.s,fontSize:11,color:m.critical?P.terra:P.muted,
          marginTop:4,lineHeight:1.5}}>{m.note}</div>}
      </div>
    </div>
  );
}

function TimelineItem({ c, isLast }) {
  const sevColor = c.severity==="major"?P.terra:c.severity==="moderate"?P.amber:P.sage;
  return (
    <div style={{display:"flex",gap:14,position:"relative"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
        <div style={{width:11,height:11,borderRadius:6,background:sevColor,
          border:`2px solid ${P.card}`,boxShadow:`0 0 0 2px ${sevColor}44`,marginTop:3}}/>
        {!isLast&&<div style={{width:2,flex:1,background:P.border,marginTop:4,minHeight:20}}/>}
      </div>
      <div style={{flex:1,minWidth:0,paddingBottom:isLast?0:20}}>
        <div style={{fontFamily:FF.m,fontSize:10,color:P.muted,letterSpacing:"0.06em",
          textTransform:"uppercase",marginBottom:3}}>{c.dateLabel}</div>
        <div style={{fontFamily:FF.s,fontSize:14,fontWeight:600,color:P.text,marginBottom:2}}>
          {c.title}
        </div>
        {c.facility&&<div style={{fontFamily:FF.s,fontSize:11,color:P.muted,marginBottom:4}}>{c.facility}</div>}
        {c.detail&&<div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.6,marginBottom:6}}>{c.detail}</div>}
        {c.findings?.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:6}}>
            {c.findings.map((f,i)=>(
              <div key={i} style={{display:"flex",gap:7,alignItems:"flex-start"}}>
                <span style={{color:sevColor,fontSize:11,lineHeight:1.5,flexShrink:0}}>—</span>
                <span style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.55}}>{f}</span>
              </div>
            ))}
          </div>
        )}
        {c.incidental&&(
          <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,marginTop:7,padding:"7px 10px",
            background:P.panel,borderRadius:7,lineHeight:1.5,fontStyle:"italic"}}>
            Incidental: {c.incidental}
          </div>
        )}
      </div>
    </div>
  );
}

export function MedicalPage() {
  const mob = useIsMobile();
  const overdue = SCREENINGS.filter(s=>s.status==="overdue"||s.status==="action");

  return (
    <div style={S.col18}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",
          textTransform:"uppercase",marginBottom:3}}>Clinical Record</div>
        <div style={S.h18}>Medical</div>
      </div>

      <AllergyBanner/>

      {overdue.length>0&&(
        <Card style={{background:P.amberBg,border:`1px solid ${P.amber}44`}}>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.amber,
            letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:9}}>
            {overdue.length} item{overdue.length>1?"s":""} need attention
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {overdue.map(s=>(
              <div key={s.name} style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>
                <Pill status={s.status}/>
                <span style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.text}}>{s.name}</span>
                <span style={{fontFamily:FF.s,fontSize:11,color:P.sub}}>{s.note}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Medications */}
      <Card>
        <SLabel color={P.steel} right={`${MEDICATIONS.length} active`}>Medications</SLabel>
        <div>
          {MEDICATIONS.map(m=><MedRow key={m.name} m={m}/>)}
        </div>
      </Card>

      {/* Supplements */}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
        <Card>
          <SLabel color={P.sage} right={`${SUPPLEMENTS_CURRENT.length} current`}>Supplements — Taking</SLabel>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {SUPPLEMENTS_CURRENT.map(s=>(
              <div key={s.name} style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
                <span style={{fontFamily:FF.s,fontSize:13,fontWeight:600,color:P.text}}>{s.name}</span>
                <span style={{fontFamily:FF.m,fontSize:11,color:P.sage}}>{s.dose}</span>
                <span style={{fontFamily:FF.s,fontSize:10,color:P.muted}}>{s.timing}</span>
                {s.note&&<div style={{fontFamily:FF.s,fontSize:10,color:P.amber,width:"100%",
                  lineHeight:1.45}}>{s.note}</div>}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SLabel color={P.muted} right="~Feb 2026">Supplements — Stopped</SLabel>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {SUPPLEMENTS_STOPPED.map(s=>(
              <div key={s.name}>
                <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                  <span style={{fontFamily:FF.s,fontSize:13,fontWeight:600,color:P.sub,
                    textDecoration:"line-through"}}>{s.name}</span>
                  <span style={{fontFamily:FF.s,fontSize:10,color:P.muted}}>{s.stopped}</span>
                </div>
                <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,lineHeight:1.5,marginTop:2}}>
                  {s.impact}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Screenings */}
      <Card>
        <SLabel color={P.amber} right="preventive care">Screenings & Preventive Care</SLabel>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
          {SCREENINGS.map(s=>{
            const m = STATUS_META[s.status] || STATUS_META.current;
            return (
              <div key={s.name} style={{padding:"12px 13px",borderRadius:11,
                background:s.status==="overdue"?P.terracottaBg:s.status==="action"?P.amberBg:P.panel,
                border:`1px solid ${s.status==="overdue"?P.terra+"33":s.status==="action"?P.amber+"33":P.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
                  gap:8,marginBottom:6}}>
                  <span style={{fontFamily:FF.s,fontSize:12.5,fontWeight:600,color:P.text,
                    lineHeight:1.3}}>{s.name}</span>
                  <Pill status={s.status}/>
                </div>
                <div style={{display:"flex",gap:12,marginBottom:5}}>
                  <div>
                    <div style={{fontFamily:FF.s,fontSize:8.5,color:P.muted,letterSpacing:"0.06em",
                      textTransform:"uppercase"}}>Last</div>
                    <div style={{fontFamily:FF.m,fontSize:11,color:P.sub}}>{s.lastDone}</div>
                  </div>
                  <div>
                    <div style={{fontFamily:FF.s,fontSize:8.5,color:P.muted,letterSpacing:"0.06em",
                      textTransform:"uppercase"}}>Next</div>
                    <div style={{fontFamily:FF.m,fontSize:11,color:m.color,fontWeight:600}}>{s.nextDue}</div>
                  </div>
                </div>
                <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,lineHeight:1.5}}>{s.note}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* BP log */}
      <Card>
        <SLabel color={P.terra} right="all readings normal">Blood Pressure</SLabel>
        <div style={{display:"flex",gap:mob?12:24,flexWrap:"wrap"}}>
          {BP_LOG.map(b=>(
            <div key={b.date}>
              <div style={{fontFamily:FF.r,fontSize:24,fontWeight:600,color:P.sage,
                lineHeight:1,letterSpacing:"-0.01em"}}>
                {b.systolic}<span style={{color:P.muted,fontWeight:400}}>/</span>{b.diastolic}
              </div>
              <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginTop:3}}>{b.dateLabel}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Condition timeline */}
      <Card>
        <SLabel color={P.violet} right={`${CONDITIONS.length} events`}>History & Conditions</SLabel>
        <div style={{marginTop:4}}>
          {CONDITIONS.map((c,i)=>(
            <TimelineItem key={c.date+c.title} c={c} isLast={i===CONDITIONS.length-1}/>
          ))}
        </div>
      </Card>

      {/* Family history */}
      <Card>
        <SLabel color={P.clay} right="1 entry">Family History</SLabel>
        {FAMILY_HISTORY.map(f=>(
          <div key={f.relation+f.condition} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:3,alignSelf:"stretch",minHeight:30,borderRadius:2,
              background:P.clay,flexShrink:0}}/>
            <div>
              <div style={{fontFamily:FF.s,fontSize:13,fontWeight:600,color:P.text}}>
                {f.condition} — {f.relation}
              </div>
              <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,marginTop:2}}>
                Diagnosed in her {f.ageAtDx} · {f.degree}
              </div>
              <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,marginTop:4,lineHeight:1.5}}>
                {f.note}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
