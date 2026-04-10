// Supplements page — local stack management with presets, dose log, and category badges.
import { useState } from "react";
import { P, FF, S } from "../lib/theme.js";

const SUPPS_STORAGE = "vital_supplements_v1";

// Preset supplement templates
const SUPP_PRESETS = [
  {name:"Vitamin D3",      icon:"☀",  unit:"IU",   freq:"Daily",    timing:"Morning",   defaultDose:5000,  category:"Vitamins",   purpose:"Bone health, immune, hormone support"},
  {name:"Magnesium Glycinate",icon:"🌙",unit:"mg", freq:"Daily",    timing:"Evening",   defaultDose:400,   category:"Minerals",   purpose:"Sleep quality, muscle recovery, HRV"},
  {name:"Omega-3 Fish Oil",icon:"🐟",  unit:"mg EPA/DHA",freq:"Daily",timing:"Morning",defaultDose:2000,  category:"Fats",       purpose:"Cardiovascular, inflammation reduction"},
  {name:"DHEA",            icon:"⚗",  unit:"mg",   freq:"Daily",    timing:"Morning",   defaultDose:25,    category:"Hormonal",   purpose:"Adrenal support — monitor DHEA-S labs"},
  {name:"Zinc",            icon:"🔩",  unit:"mg",   freq:"Daily",    timing:"Evening",   defaultDose:30,    category:"Minerals",   purpose:"Testosterone support, immune"},
  {name:"Creatine",        icon:"💪",  unit:"g",    freq:"Daily",    timing:"Post-workout",defaultDose:5,   category:"Performance","purpose":"Muscle strength & power"},
  {name:"CoQ10",           icon:"⚡",  unit:"mg",   freq:"Daily",    timing:"Morning",   defaultDose:200,   category:"Mitochondrial","purpose":"Energy, cardiovascular"},
  {name:"NMN",             icon:"🔬",  unit:"mg",   freq:"Daily",    timing:"Morning",   defaultDose:500,   category:"Longevity",  purpose:"NAD+ precursor, cellular energy"},
  {name:"Collagen Peptides",icon:"🦴", unit:"g",    freq:"Daily",    timing:"Morning",   defaultDose:20,    category:"Structural", purpose:"Joint, skin, connective tissue"},
  {name:"Ashwagandha",     icon:"🌿",  unit:"mg",   freq:"Daily",    timing:"Evening",   defaultDose:600,   category:"Adaptogen",  purpose:"Cortisol regulation, stress"},
  {name:"B Complex",       icon:"🅱",  unit:"capsule",freq:"Daily",  timing:"Morning",   defaultDose:1,     category:"Vitamins",   purpose:"Energy metabolism, methylation"},
  {name:"Vitamin K2",      icon:"🩸",  unit:"mcg",  freq:"Daily",    timing:"Morning",   defaultDose:180,   category:"Vitamins",   purpose:"Calcium directs to bones not arteries"},
  {name:"Berberine",       icon:"🌱",  unit:"mg",   freq:"Daily",    timing:"With meals",defaultDose:500,   category:"Metabolic",  purpose:"Blood glucose, metabolic health"},
  {name:"Melatonin",       icon:"🌙",  unit:"mg",   freq:"As needed",timing:"Bedtime",   defaultDose:0.5,   category:"Sleep",      purpose:"Circadian rhythm support"},
];

const CAT_COLORS = {
  Vitamins:"#C47830", Minerals:"#3A5C48", Fats:"#4A6070", Hormonal:"#7A5A80",
  Performance:"#C4604A", Mitochondrial:"#C4A830", Longevity:"#5BC4F0",
  Structural:"#8B6057", Adaptogen:"#3A7A5A", Sleep:"#6B4A7A", Metabolic:"#4A7090",
};

export function SupplementsPage(){
  const [stack, setStack] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem(SUPPS_STORAGE)||"[]"); }catch(e){ return []; }
  });
  const [view,    setView]    = useState("stack"); // stack | add | log
  const [search,  setSearch]  = useState("");
  const [editing, setEditing] = useState(null); // supp id being edited
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0,10));

  const save = (newStack) => {
    setStack(newStack);
    try{ localStorage.setItem(SUPPS_STORAGE, JSON.stringify(newStack)); }catch(e){}
  };

  const addSupp = (preset) => {
    const s = {
      id: Date.now().toString(),
      name: preset.name, icon: preset.icon, unit: preset.unit,
      dose: preset.defaultDose, freq: preset.freq,
      timing: preset.timing, category: preset.category,
      purpose: preset.purpose, active: true,
      startDate: new Date().toISOString().slice(0,10),
      notes: "",
    };
    save([...stack, s]);
    setView("stack");
  };

  const removeSupp  = (id) => save(stack.filter(s=>s.id!==id));
  const toggleActive = (id) => save(stack.map(s=>s.id===id?{...s,active:!s.active}:s));
  const updateSupp  = (id, changes) => save(stack.map(s=>s.id===id?{...s,...changes}:s));

  const activeStack  = stack.filter(s=>s.active);
  const pausedStack  = stack.filter(s=>!s.active);

  // Group by timing
  const byTiming = activeStack.reduce((acc,s)=>{
    const t = s.timing||"Other";
    if(!acc[t]) acc[t]=[];
    acc[t].push(s);
    return acc;
  }, {});

  const timingOrder = ["Morning","With meals","Post-workout","Evening","Bedtime","As needed","Other"];
  const sortedTimings = timingOrder.filter(t=>byTiming[t]);

  const filteredPresets = SUPP_PRESETS.filter(p=>
    !stack.find(s=>s.name===p.name && s.active) &&
    (search==="" || p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.category.toLowerCase().includes(search.toLowerCase()) ||
     p.purpose.toLowerCase().includes(search.toLowerCase()))
  );

  const TIMING_ICONS = {Morning:"🌅",Evening:"🌆","Post-workout":"💪",Bedtime:"🌙",
    "With meals":"🍽","As needed":"⚡",Other:"📦"};

  return(<div style={S.col16}>
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          Daily protocol · Nate Hahn
        </div>
        <div style={S.h18}>Supplement Stack</div>
      </div>
      <div style={{display:"flex",gap:6}}>
        {["stack","add"].map(v=>(
          <button key={v} onClick={()=>setView(v)}
            style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"6px 14px",borderRadius:8,cursor:"pointer",
              background:view===v?P.cardDk:P.card,color:view===v?P.textInv:P.sub,
              border:`1px solid ${view===v?P.cardDk:P.border}`,transition:"all .15s"}}>
            {v==="stack"?"My Stack":"+ Add"}
          </button>
        ))}
      </div>
    </div>
    {view==="stack"&&(
      <div style={S.g120}>
        {[
          {label:"Active",val:activeStack.length,color:P.sage,icon:"✓"},
          {label:"Daily supps",val:activeStack.filter(s=>s.freq==="Daily").length,color:P.steel,icon:"📅"},
          {label:"Paused",val:pausedStack.length,color:P.muted,icon:"⏸"},
          {label:"Categories",val:new Set(activeStack.map(s=>s.category)).size,color:P.amber,icon:"🗂"},
        ].map(({label,val,color,icon})=>(
          <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"12px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
            <div style={{fontSize:18,marginBottom:6}}>{icon}</div>
            <div style={{fontFamily:FF.r,fontSize:24,fontWeight:600,color,lineHeight:1}}>{val}</div>
            <div style={S.mut9t2}>{label}</div>
          </div>
        ))}
      </div>
    )}
    {view==="stack"&&(
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {activeStack.length===0&&(
          <div style={{background:P.card,border:`1px dashed ${P.border}`,borderRadius:14,padding:"32px",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:10}}>💊</div>
            <div style={{fontFamily:FF.s,fontSize:13,color:P.sub,marginBottom:6}}>No supplements added yet</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,marginBottom:14}}>Add from our preset library or create your own</div>
            <button onClick={()=>setView("add")}
              style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"8px 18px",borderRadius:8,
                border:"none",background:P.sage,color:"#fff",cursor:"pointer"}}>
              + Add Supplement
            </button>
          </div>
        )}

        {sortedTimings.map(timing=>(
          <div key={timing}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:14}}>{TIMING_ICONS[timing]||"📦"}</span>
              <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.sub,letterSpacing:"0.10em",textTransform:"uppercase"}}>{timing}</div>
              <div style={S.divider}/>
              <div style={S.mut9}>{byTiming[timing].length} item{byTiming[timing].length>1?"s":""}</div>
            </div>
            <div style={S.col7}>
              {byTiming[timing].map(s=>{
                const catColor = CAT_COLORS[s.category]||P.steel;
                const isEditing = editing===s.id;
                return(
                  <div key={s.id} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,
                    padding:"12px 14px",boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}>
                    {isEditing?(
                      <div>
                        <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                          <input defaultValue={s.dose} id={`dose-${s.id}`} type="number"
                            style={{width:80,padding:"6px 10px",borderRadius:7,border:`1px solid ${P.border}`,
                              fontFamily:FF.m,fontSize:12,background:P.panel,color:P.text,outline:"none"}}/>
                          <span style={{fontFamily:FF.s,fontSize:11,color:P.muted,alignSelf:"center"}}>{s.unit}</span>
                          <select defaultValue={s.timing} id={`timing-${s.id}`}
                            style={{padding:"6px 10px",borderRadius:7,border:`1px solid ${P.border}`,
                              fontFamily:FF.s,fontSize:11,background:P.panel,color:P.text,outline:"none",flex:1}}>
                            {timingOrder.map(t=><option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <input defaultValue={s.notes} id={`notes-${s.id}`}
                          placeholder="Notes (e.g. take with food, brand...)"
                          style={{width:"100%",padding:"6px 10px",borderRadius:7,border:`1px solid ${P.border}`,
                            fontFamily:FF.s,fontSize:11,background:P.panel,color:P.text,outline:"none",
                            boxSizing:"border-box",marginBottom:8}}/>
                        <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                          <button onClick={()=>setEditing(null)}
                            style={{fontFamily:FF.s,fontSize:10,padding:"5px 12px",borderRadius:6,
                              border:`1px solid ${P.border}`,background:P.panel,color:P.muted,cursor:"pointer"}}>Cancel</button>
                          <button onClick={()=>{
                            const dose = parseFloat(document.getElementById(`dose-${s.id}`)?.value||s.dose);
                            const timing = document.getElementById(`timing-${s.id}`)?.value||s.timing;
                            const notes = document.getElementById(`notes-${s.id}`)?.value||s.notes;
                            updateSupp(s.id,{dose,timing,notes});
                            setEditing(null);
                          }} style={{fontFamily:FF.s,fontSize:10,fontWeight:600,padding:"5px 12px",borderRadius:6,
                            border:"none",background:P.sage,color:"#fff",cursor:"pointer"}}>Save</button>
                        </div>
                      </div>
                    ):(
                      <div style={S.row10}>
                        <div style={{width:36,height:36,borderRadius:9,background:catColor+"14",
                          border:`1px solid ${catColor}30`,display:"flex",alignItems:"center",
                          justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                            <span style={{fontFamily:FF.s,fontSize:12,fontWeight:700,color:P.text}}>{s.name}</span>
                            <span style={{fontFamily:FF.m,fontSize:10,color:catColor,background:catColor+"12",
                              padding:"1px 6px",borderRadius:4}}>{s.dose} {s.unit}</span>
                            <span style={{fontFamily:FF.s,fontSize:9,color:P.muted,background:P.panel,
                              padding:"1px 6px",borderRadius:4}}>{s.category}</span>
                          </div>
                          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:2,lineHeight:1.4}}>
                            {s.purpose}
                          </div>
                          {s.notes&&<div style={{fontFamily:FF.s,fontSize:9,color:P.sub,marginTop:2,
                            fontStyle:"italic"}}>📝 {s.notes}</div>}
                        </div>
                        <div style={{display:"flex",gap:4,flexShrink:0}}>
                          <button onClick={()=>setEditing(s.id)}
                            style={{fontFamily:FF.s,fontSize:9,padding:"4px 8px",borderRadius:6,
                              border:`1px solid ${P.border}`,background:P.panel,color:P.muted,cursor:"pointer"}}>Edit</button>
                          <button onClick={()=>toggleActive(s.id)}
                            style={{fontFamily:FF.s,fontSize:9,padding:"4px 8px",borderRadius:6,
                              border:`1px solid ${P.border}`,background:P.panel,color:P.amber,cursor:"pointer"}}
                            title="Pause">⏸</button>
                          <button onClick={()=>removeSupp(s.id)}
                            style={{fontFamily:FF.s,fontSize:9,padding:"4px 8px",borderRadius:6,
                              border:`1px solid ${P.border}`,background:P.panel,color:P.terra,cursor:"pointer"}}
                            title="Remove">✕</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {pausedStack.length>0&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:14}}>⏸</span>
              <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.muted,letterSpacing:"0.10em",textTransform:"uppercase"}}>Paused</div>
              <div style={S.divider}/>
            </div>
            {pausedStack.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
                background:P.panel,border:`1px solid ${P.border}`,borderRadius:10,marginBottom:6,opacity:0.6}}>
                <span style={{fontSize:16}}>{s.icon}</span>
                <span style={{fontFamily:FF.s,fontSize:11,color:P.sub,flex:1}}>{s.name} · {s.dose} {s.unit}</span>
                <button onClick={()=>toggleActive(s.id)}
                  style={{fontFamily:FF.s,fontSize:9,padding:"4px 10px",borderRadius:6,
                    border:`1px solid ${P.border}`,background:P.card,color:P.sage,cursor:"pointer"}}>Resume</button>
                <button onClick={()=>removeSupp(s.id)}
                  style={{fontFamily:FF.s,fontSize:9,padding:"4px 8px",borderRadius:6,
                    border:`1px solid ${P.border}`,background:P.panel,color:P.terra,cursor:"pointer"}}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    {view==="add"&&(
      <div>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search supplements by name, category, or goal..."
          style={{width:"100%",padding:"10px 14px",borderRadius:9,border:`1px solid ${P.border}`,
            fontFamily:FF.s,fontSize:12,background:P.card,color:P.text,outline:"none",
            boxSizing:"border-box",marginBottom:12}}/>
        <div style={{background:P.card,border:`1px dashed ${P.border}`,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Custom Supplement</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {["name","dose","unit","timing"].map(field=>(
              <input key={field} id={`custom-${field}`} placeholder={field.charAt(0).toUpperCase()+field.slice(1)}
                style={{flex:field==="name"?2:1,minWidth:60,padding:"8px 10px",borderRadius:7,
                  border:`1px solid ${P.border}`,fontFamily:FF.s,fontSize:11,
                  background:P.panel,color:P.text,outline:"none"}}/>
            ))}
            <button onClick={()=>{
              const name    = document.getElementById("custom-name")?.value?.trim();
              const dose    = parseFloat(document.getElementById("custom-dose")?.value||0);
              const unit    = document.getElementById("custom-unit")?.value?.trim()||"mg";
              const timing  = document.getElementById("custom-timing")?.value?.trim()||"Daily";
              if(!name) return;
              addSupp({name,icon:"💊",unit,defaultDose:dose,freq:"Daily",timing,category:"Custom",purpose:""});
            }} style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"8px 14px",borderRadius:7,
              border:"none",background:P.sage,color:"#fff",cursor:"pointer",alignSelf:"flex-end"}}>Add</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
          {filteredPresets.map(p=>{
            const catColor = CAT_COLORS[p.category]||P.steel;
            return(
              <div key={p.name} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,
                padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                  <div style={S.row8}>
                    <div style={{width:32,height:32,borderRadius:8,background:catColor+"14",
                      border:`1px solid ${catColor}30`,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:16}}>{p.icon}</div>
                    <div>
                      <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.text}}>{p.name}</div>
                      <div style={{fontFamily:FF.s,fontSize:8,color:catColor,fontWeight:600}}>{p.category}</div>
                    </div>
                  </div>
                  <button onClick={()=>addSupp(p)}
                    style={{fontFamily:FF.s,fontSize:10,fontWeight:600,padding:"5px 12px",
                      borderRadius:7,border:"none",background:P.sage,color:"#fff",cursor:"pointer",flexShrink:0}}>
                    + Add
                  </button>
                </div>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.5,marginBottom:6}}>{p.purpose}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontFamily:FF.m,fontSize:8,color:P.sub,background:P.panel,padding:"2px 6px",borderRadius:4}}>
                    {p.defaultDose} {p.unit}
                  </span>
                  <span style={{fontFamily:FF.s,fontSize:8,color:P.muted,background:P.panel,padding:"2px 6px",borderRadius:4}}>
                    {p.timing}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredPresets.length===0&&search&&(
            <div style={{gridColumn:"1/-1",fontFamily:FF.s,fontSize:11,color:P.muted,textAlign:"center",padding:20}}>
              No presets match "{search}" — use Custom above
            </div>
          )}
        </div>
      </div>
    )}

  </div>);
}
