// User profile modal — identity, health context, data sources, theme picker.
// Local form state only; "Save" closes without persisting (placeholder).
import { useState } from "react";
import { P, FF, S, THEMES } from "../lib/theme.js";

export function UserModal({onClose,theme,setTheme}){
  const [form, setForm] = useState({
    name:"Nate Hahn", dob:"1978-05-24", sex:"Male", height:"72",
    weight:"216", location:"Montecito, CA", email:"",
    goals:"Body recomposition · VO2 max improvement · Longevity",
    physician:"Dr. Greene", notes:"",
  });
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const age = form.dob ? Math.floor((new Date() - new Date(form.dob)) / 3.156e10) : "—";

  const Field = ({label, k, type="text", placeholder=""}) => (
    <div style={{marginBottom:12}}>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{label}</div>
      <input type={type} value={form[k]} onChange={e=>up(k,e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${P.border}`,
          background:P.panel,fontFamily:FF.s,fontSize:11,color:P.text,outline:"none",
          boxSizing:"border-box",transition:"border .15s"}}
        onFocus={e=>e.target.style.borderColor=P.amber}
        onBlur={e=>e.target.style.borderColor=P.border}/>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",
      background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:P.card,borderRadius:20,width:"min(480px,95vw)",maxHeight:"85vh",overflowY:"auto",
        boxShadow:"0 24px 80px rgba(0,0,0,0.25)",border:`1px solid ${P.border}`}}>
        <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${P.border}`,
          display:"flex",justifyContent:"space-between",alignItems:"center",
          background:P.cardDk,borderRadius:"20px 20px 0 0"}}>
          <div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>Profile</div>
            <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.textInv}}>User Demographics</div>
          </div>
          <div style={S.row10}>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color:P.amber,letterSpacing:"-0.01em"}}>{age}<span style={{fontFamily:FF.s,fontSize:10,color:P.mutedDk,marginLeft:3}}>yrs</span></div>
              <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk}}>calculated age</div>
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.10)",
              border:"none",color:P.mutedDk,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
        </div>
        <div style={{padding:"20px 24px"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${P.border}`}}>Identity</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"0 16px"}}>
            <Field label="Full Name"     k="name"/>
            <Field label="Date of Birth" k="dob" type="date"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px"}}>
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Sex</div>
              <select value={form.sex} onChange={e=>up("sex",e.target.value)}
                style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${P.border}`,
                  background:P.panel,fontFamily:FF.s,fontSize:11,color:P.text,outline:"none"}}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <Field label="Height (in)" k="height" type="number" placeholder="72"/>
            <Field label="Weight (lbs)" k="weight" type="number" placeholder="216"/>
          </div>
          <Field label="Location / ZIP" k="location" placeholder="Montecito, CA 93108"/>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.10em",textTransform:"uppercase",margin:"8px 0 12px",paddingBottom:6,borderBottom:`1px solid ${P.border}`}}>Health Context</div>
          <Field label="Physician / Care Team" k="physician" placeholder="Dr. Greene"/>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Health Goals</div>
            <textarea value={form.goals} onChange={e=>up("goals",e.target.value)} rows={2}
              style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${P.border}`,
                background:P.panel,fontFamily:FF.s,fontSize:11,color:P.text,outline:"none",
                resize:"none",lineHeight:1.5,boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Clinical Notes</div>
            <textarea value={form.notes} onChange={e=>up("notes",e.target.value)} rows={2}
              placeholder="Allergies, medications, conditions..."
              style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${P.border}`,
                background:P.panel,fontFamily:FF.s,fontSize:11,color:P.text,outline:"none",
                resize:"none",lineHeight:1.5,boxSizing:"border-box"}}/>
          </div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.10em",textTransform:"uppercase",margin:"8px 0 12px",paddingBottom:6,borderBottom:`1px solid ${P.border}`}}>Data Sources</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {[
              {icon:"⌚",label:"WHOOP",      status:"connected",  color:P.sage,   note:"CSV export active"},
              {icon:"📊",label:"Hume Health",status:"import",     color:P.amber,  note:"Tap to import JSON"},
              {icon:"🏃",label:"Styku",      status:"connected",  color:P.sage,   note:"2 scans loaded"},
              {icon:"🧬",label:"BioLab",     status:"connected",  color:P.sage,   note:"May 23 2025"},
              {icon:"💓",label:"CardioCoach",status:"connected",  color:P.sage,   note:"RMR measured"},
              {icon:"🍎",label:"Apple Health",status:"available", color:P.steel,  note:"Coming soon"},
            ].map(({icon,label,status,color,note})=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",
                borderRadius:10,background:P.panel,border:`1px solid ${status==="import"?P.amber+"44":P.border}`,
                cursor:status==="import"?"pointer":"default"}}
                onClick={status==="import"?()=>alert("Export from Hume Health app → Settings → Export Data → JSON. Then drag the file into the Labs page AI Insights uploader."):undefined}>
                <span style={{fontSize:16}}>{icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:FF.s,fontSize:11,fontWeight:500,color:P.text}}>{label}</div>
                  <div style={S.mut9}>{note}</div>
                </div>
                <div style={{padding:"3px 8px",borderRadius:5,
                  background:status==="connected"?P.sage+"18":status==="import"?P.amber+"18":P.panel,
                  border:`1px solid ${status==="connected"?P.sage+"44":status==="import"?P.amber+"44":P.border}`}}>
                  <span style={{fontFamily:FF.s,fontSize:8,fontWeight:600,
                    color:status==="connected"?P.sage:status==="import"?P.amber:P.muted}}>
                    {status==="connected"?"● Connected":status==="import"?"↑ Import":"Available"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.10em",textTransform:"uppercase",margin:"8px 0 12px",paddingBottom:6,borderBottom:`1px solid ${P.border}`}}>Appearance</div>
          <div style={{marginBottom:16}}>
            <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text,marginBottom:10}}>Color Scheme</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
              {Object.values(THEMES).map(t=>{
                const isActive = (theme||"warm")===t.id;
                return(
                  <div key={t.id} onClick={()=>setTheme&&setTheme(t.id)}
                    style={{
                      display:"flex",alignItems:"center",gap:12,padding:"10px 12px",
                      borderRadius:10,cursor:"pointer",transition:"all .15s",
                      border:`1.5px solid ${isActive?t.accent:(P.border)}`,
                      background:isActive?t.accent+"10":P.panel,
                      boxShadow:isActive?`0 0 0 1px ${t.accent}33`:"none",
                    }}>
                    <div style={{
                      width:28,height:28,borderRadius:8,flexShrink:0,
                      background:t.preview,
                      border:`2px solid ${t.accent}`,
                      boxShadow:`inset 0 0 0 4px ${t.accent}30`,
                    }}/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:FF.s,fontSize:10,fontWeight:isActive?700:500,color:isActive?t.accent:P.text}}>{t.name}</div>
                      {isActive&&<div style={{fontFamily:FF.s,fontSize:8,color:t.accent,marginTop:1,letterSpacing:"0.06em"}}>Active</div>}
                    </div>
                    {isActive&&<div style={{width:8,height:8,borderRadius:"50%",background:t.accent}}/>}
                  </div>
                );
              })}
            </div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:8,lineHeight:1.5}}>
              Changing the theme takes effect immediately. Your preference is saved locally.
            </div>
          </div>

          <div style={{display:"flex",gap:12}}>
            <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:10,border:`1px solid ${P.border}`,
              background:P.panel,fontFamily:FF.s,fontSize:12,fontWeight:500,color:P.sub,cursor:"pointer"}}>
              Cancel
            </button>
            <button onClick={onClose} style={{flex:2,padding:"11px",borderRadius:10,border:"none",
              background:P.cardDk,fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.textInv,cursor:"pointer"}}>
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
