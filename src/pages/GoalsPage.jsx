// Goals page — multi-category goal tracker with milestones, edit, and progress bars.
import { useState } from "react";
import { P, FF, S, CS } from "../lib/theme.js";
import { SLabel } from "../components/shared.jsx";
import { LAB_OVERDUE, LAB_FRESHNESS } from "../lib/data/labs.js";

const GOALS_STORAGE = "vital_goals_v1";

// Default goals seeded from Nate's actual data
const DEFAULT_GOALS = [
  {
    id:"g1", category:"Body Comp", icon:"⚖", color:"#7A5A80",
    metric:"Body Fat %", current:26.4, target:18.0, unit:"%",
    direction:"down", sourceLabel:"DXA Jan 2026",
    deadline:"2026-12-31", note:"DXA gold standard — Overfat→Athletic category",
    milestones:[{val:24,label:"Overweight threshold"},{val:20,label:"Fitness"},{val:18,label:"Athletic"}],
  },
  {
    id:"g2", category:"Cardiovascular", icon:"❤️", color:"#C4604A",
    metric:"Resting HRV", current:43, target:52, unit:"ms",
    direction:"up", sourceLabel:"WHOOP 3-mo avg",
    deadline:"2026-09-01", note:"Personal mean 44.4ms — target Elevated zone >49ms consistently",
    milestones:[{val:46,label:"Baseline high"},{val:49,label:"Elevated zone"},{val:52,label:"Peak zone"}],
  },
  {
    id:"g3", category:"Strength", icon:"💪", color:"#3A5C48",
    metric:"Lean Mass %", current:69.4, target:74.0, unit:"%",
    direction:"up", sourceLabel:"DXA Jan 2026",
    deadline:"2026-12-31", note:"Add ~6 lbs lean while reducing fat — requires progressive overload + protein",
    milestones:[{val:71,label:"Solid"},{val:73,label:"Good"},{val:74,label:"Target"}],
  },
  {
    id:"g4", category:"Hormonal", icon:"⚗", color:"#7A5A80",
    metric:"Testosterone", current:377, target:500, unit:"ng/dL",
    direction:"up", sourceLabel:"May 23, 2025 labs",
    deadline:"2026-12-31", note:"Low-mid range at 377 — optimize sleep, zinc, training. Retest at next draw.",
    milestones:[{val:400,label:"Lower-normal"},{val:450,label:"Mid-range"},{val:500,label:"Optimal"}],
  },
  {
    id:"g5", category:"Running", icon:"🏃", color:"#C47830",
    metric:"5K Time", current:null, target:23.0, unit:"min",
    direction:"down", sourceLabel:"Personal Bests",
    deadline:"2026-06-30", note:"No logged time yet — establish baseline, then build aerobic base",
    milestones:[{val:28,label:"Establish baseline"},{val:25,label:"Good"},{val:23,label:"Target"}],
  },
  {
    id:"g6", category:"Longevity", icon:"♾️", color:"#5BC4F0",
    metric:"Vitamin D", current:36.5, target:60.0, unit:"ng/mL",
    direction:"up", sourceLabel:"May 23, 2025 labs",
    deadline:"2026-06-01", note:"Optimal 50–70 ng/mL. Currently at 36.5 — increase D3 dose, retest in 90 days.",
    milestones:[{val:40,label:"Sufficient"},{val:50,label:"Optimal threshold"},{val:60,label:"Target"}],
  },
];

export function GoalsPage(){
  const [goals, setGoals] = useState(()=>{
    try{
      const stored = JSON.parse(localStorage.getItem(GOALS_STORAGE)||"null");
      return stored||DEFAULT_GOALS;
    }catch(e){ return DEFAULT_GOALS; }
  });
  const [editingId, setEditingId] = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [newGoal,   setNewGoal]   = useState({metric:"",current:"",target:"",unit:"",direction:"down",deadline:"",note:"",icon:"🎯",color:P.sage,category:"Custom"});

  const saveGoals = (g) => {
    setGoals(g);
    try{ localStorage.setItem(GOALS_STORAGE, JSON.stringify(g)); }catch(e){}
  };

  const updateGoal = (id, changes) => saveGoals(goals.map(g=>g.id===id?{...g,...changes}:g));
  const removeGoal = (id) => saveGoals(goals.filter(g=>g.id!==id));
  const addGoal    = () => {
    if(!newGoal.metric||!newGoal.target) return;
    saveGoals([...goals, {...newGoal, id:`g${Date.now()}`,
      current: parseFloat(newGoal.current)||null,
      target:  parseFloat(newGoal.target),
      milestones:[]}]);
    setShowAdd(false);
    setNewGoal({metric:"",current:"",target:"",unit:"",direction:"down",deadline:"",note:"",icon:"🎯",color:P.sage,category:"Custom"});
  };

  const progress = (g) => {
    if(g.current===null||g.current===undefined) return 0;
    const range = Math.abs(g.target - (g.milestones?.[0]?.val||g.current));
    if(range===0) return 100;
    const done  = g.direction==="down"
      ? (g.current - g.target)
      : (g.target - g.current);
    const start = g.direction==="down"
      ? ((g.milestones?.[0]?.val||g.current) - g.target)
      : (g.target - (g.milestones?.[0]?.val||g.current));
    return Math.min(100, Math.max(0, Math.round((1 - done/Math.max(start,0.001))*100)));
  };

  const daysLeft = (deadline) => {
    if(!deadline) return null;
    return Math.ceil((new Date(deadline) - new Date("2026-03-22")) / 86400000);
  };

  const CAT_ORDER = ["Body Comp","Cardiovascular","Strength","Hormonal","Running","Longevity","Custom"];
  const goalsByCategory = CAT_ORDER.map(cat=>({
    cat, goals: goals.filter(g=>g.category===cat)
  })).filter(x=>x.goals.length>0);

  // Lab freshness alerts for goals
  const overdueForGoals = LAB_OVERDUE.slice(0,4);

  return(<div style={S.col16}>
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          Progress · Mar 2026
        </div>
        <div style={S.h18}>Health Goals</div>
      </div>
      <button onClick={()=>setShowAdd(!showAdd)}
        style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"6px 14px",borderRadius:8,cursor:"pointer",
          background:showAdd?P.cardDk:P.card,color:showAdd?P.textInv:P.sub,
          border:`1px solid ${showAdd?P.cardDk:P.border}`,transition:"all .15s"}}>
        {showAdd?"Cancel":"+ Add Goal"}
      </button>
    </div>
    {LAB_OVERDUE.length>0&&(
      <div style={{background:P.terracottaBg,border:`1px solid ${P.terra}44`,borderRadius:12,
        padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:12}}>
        <span style={{fontSize:18,flexShrink:0}}>🧬</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.terra,marginBottom:4}}>
            {LAB_OVERDUE.length} biomarkers overdue for retesting
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {LAB_OVERDUE.slice(0,6).map(b=>(
              <div key={b.name} style={{fontFamily:FF.s,fontSize:9,color:P.terra,
                background:"rgba(196,96,74,0.08)",padding:"2px 8px",borderRadius:4,border:`1px solid ${P.terra}33`}}>
                {b.name} · {b.daysSince}d ago
              </div>
            ))}
            {LAB_OVERDUE.length>6&&<span style={S.mut9}>+{LAB_OVERDUE.length-6} more</span>}
          </div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:4}}>
            Next draw recommended: schedule with Vitals Vault or your lab. Import results in the Import page.
          </div>
        </div>
      </div>
    )}
    {showAdd&&(
      <div style={{background:P.card,border:`1px solid ${P.amber}44`,borderRadius:14,padding:"18px"}}>
        <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.text,marginBottom:12}}>New Goal</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8,marginBottom:10}}>
          {[
            {id:"metric",  label:"Metric",    type:"text",     placeholder:"e.g. HRV, Weight, 5K"},
            {id:"current", label:"Current",   type:"number",   placeholder:"Current value"},
            {id:"target",  label:"Target",    type:"number",   placeholder:"Goal value"},
            {id:"unit",    label:"Unit",      type:"text",     placeholder:"ms, lbs, %..."},
            {id:"deadline",label:"Deadline",  type:"date",     placeholder:""},
            {id:"note",    label:"Note",      type:"text",     placeholder:"Optional context"},
          ].map(f=>(
            <div key={f.id}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>{f.label}</div>
              <input type={f.type} placeholder={f.placeholder} value={newGoal[f.id]||""}
                onChange={e=>setNewGoal(g=>({...g,[f.id]:e.target.value}))}
                style={{width:"100%",padding:"7px 10px",borderRadius:7,border:`1px solid ${P.border}`,
                  fontFamily:FF.s,fontSize:11,background:P.panel,color:P.text,outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
          <span style={S.mut10}>Direction:</span>
          {["down","up"].map(d=>(
            <button key={d} onClick={()=>setNewGoal(g=>({...g,direction:d}))}
              style={{fontFamily:FF.s,fontSize:10,fontWeight:600,padding:"5px 12px",borderRadius:6,cursor:"pointer",
                background:newGoal.direction===d?P.cardDk:P.panel,
                color:newGoal.direction===d?P.textInv:P.sub,
                border:`1px solid ${newGoal.direction===d?P.cardDk:P.border}`}}>
              {d==="down"?"↓ Lower is better":"↑ Higher is better"}
            </button>
          ))}
        </div>
        <button onClick={addGoal} disabled={!newGoal.metric||!newGoal.target}
          style={{fontFamily:FF.s,fontSize:11,fontWeight:700,padding:"8px 20px",borderRadius:8,
            border:"none",background:newGoal.metric&&newGoal.target?P.sage:"rgba(0,0,0,0.08)",
            color:newGoal.metric&&newGoal.target?"#fff":P.muted,cursor:"pointer"}}>
          Save Goal
        </button>
      </div>
    )}
    {goalsByCategory.map(({cat,goals:catGoals})=>(
      <div key={cat}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.sub,letterSpacing:"0.10em",textTransform:"uppercase"}}>{cat}</div>
          <div style={S.divider}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {catGoals.map(g=>{
            const pct     = progress(g);
            const dl      = daysLeft(g.deadline);
            const isEditing = editingId===g.id;
            const achieved  = g.direction==="down" ? (g.current!==null&&g.current<=g.target)
                                                    : (g.current!==null&&g.current>=g.target);
            return(
              <div key={g.id} style={{background:P.card,border:`1.5px solid ${achieved?g.color+"66":P.border}`,
                borderRadius:14,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.05)",
                position:"relative",overflow:"hidden"}}>

                {achieved&&<div style={{position:"absolute",top:0,right:0,background:g.color,
                  color:"#fff",fontFamily:FF.s,fontSize:8,fontWeight:700,padding:"3px 8px",
                  borderRadius:"0 14px 0 8px",letterSpacing:"0.06em"}}>ACHIEVED ✓</div>}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                  <div style={S.row8}>
                    <div style={{width:32,height:32,borderRadius:8,background:g.color+"14",
                      border:`1px solid ${g.color}30`,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:16}}>{g.icon}</div>
                    <div>
                      <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.text}}>{g.metric}</div>
                      <div style={S.mut8}>{g.sourceLabel}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>setEditingId(isEditing?null:g.id)}
                      style={{fontFamily:FF.s,fontSize:9,padding:"3px 8px",borderRadius:5,
                        border:`1px solid ${P.border}`,background:P.panel,color:P.muted,cursor:"pointer"}}>
                      {isEditing?"Done":"Edit"}
                    </button>
                    <button onClick={()=>removeGoal(g.id)}
                      style={{fontFamily:FF.s,fontSize:9,padding:"3px 7px",borderRadius:5,
                        border:`1px solid ${P.border}`,background:P.panel,color:P.terra,cursor:"pointer"}}>✕</button>
                  </div>
                </div>

                {isEditing?(
                  <div style={S.col7}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,width:60}}>Current</div>
                      <input type="number" defaultValue={g.current||""}
                        onBlur={e=>updateGoal(g.id,{current:parseFloat(e.target.value)||null})}
                        style={{flex:1,padding:"5px 8px",borderRadius:6,border:`1px solid ${P.border}`,
                          fontFamily:FF.m,fontSize:11,background:P.panel,color:P.text,outline:"none"}}/>
                      <span style={S.mut10}>{g.unit}</span>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,width:60}}>Target</div>
                      <input type="number" defaultValue={g.target}
                        onBlur={e=>updateGoal(g.id,{target:parseFloat(e.target.value)||g.target})}
                        style={{flex:1,padding:"5px 8px",borderRadius:6,border:`1px solid ${P.border}`,
                          fontFamily:FF.m,fontSize:11,background:P.panel,color:P.text,outline:"none"}}/>
                      <span style={S.mut10}>{g.unit}</span>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,width:60}}>Deadline</div>
                      <input type="date" defaultValue={g.deadline||""}
                        onBlur={e=>updateGoal(g.id,{deadline:e.target.value})}
                        style={{flex:1,padding:"5px 8px",borderRadius:6,border:`1px solid ${P.border}`,
                          fontFamily:FF.s,fontSize:11,background:P.panel,color:P.text,outline:"none"}}/>
                    </div>
                  </div>
                ):(
                  <>
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                        {g.current!==null ? (
                          <>
                            <span style={{fontFamily:FF.r,fontSize:28,fontWeight:600,color:g.color,lineHeight:1,letterSpacing:"-0.02em"}}>
                              {g.current}
                            </span>
                            <span style={S.mut10}>{g.unit}</span>
                          </>
                        ) : (
                          <span style={{fontFamily:FF.s,fontSize:11,color:P.muted,fontStyle:"italic"}}>Not logged</span>
                        )}
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={S.mut9}>
                          {g.direction==="down"?"↓":"↑"} Target: <span style={{fontWeight:600,color:P.text}}>{g.target} {g.unit}</span>
                        </div>
                        {g.current!==null&&(
                          <div style={{fontFamily:FF.m,fontSize:10,color:achieved?P.sage:g.color,fontWeight:600}}>
                            {Math.abs(g.current-g.target).toFixed(1)} {g.unit} {g.direction==="down"?"to go":"to go"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{position:"relative",height:10,background:P.panel,borderRadius:5,overflow:"hidden",
                      border:`1px solid ${P.border}`}}>
                      <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(to right,${g.color}99,${g.color})`,
                        borderRadius:5,transition:"width 1s ease"}}/>
                    </div>
                    {g.milestones&&g.milestones.length>0&&(
                      <div style={{position:"relative",height:16,marginTop:2}}>
                        {g.milestones.map((m,mi)=>{
                          const range = Math.abs(
                            (g.milestones[0].val) - g.target
                          );
                          const pos = g.direction==="down"
                            ? Math.min(100,Math.max(0,Math.round(((g.milestones[0].val-m.val)/Math.max(range,1))*100)))
                            : Math.min(100,Math.max(0,Math.round(((m.val-g.milestones[0].val)/Math.max(range,1))*100)));
                          const passed = g.current!==null&&(g.direction==="down"?g.current<=m.val:g.current>=m.val);
                          return(
                            <div key={mi} style={{position:"absolute",left:`${pos}%`,top:0,transform:"translateX(-50%)"}}>
                              <div style={{width:1,height:5,background:passed?g.color:P.border,margin:"0 auto"}}/>
                              <div style={{fontFamily:FF.s,fontSize:7,color:passed?g.color:P.muted,
                                whiteSpace:"nowrap",textAlign:"center",letterSpacing:"-0.01em"}}>{m.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {g.note&&(
                    <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.5,
                      borderTop:`1px solid ${P.border}`,paddingTop:8,marginTop:4}}>
                      {g.note}
                    </div>
                  )}
                  {dl!==null&&(
                    <div style={{display:"flex",alignItems:"center",gap:4,marginTop:6}}>
                      <span style={{fontSize:10}}>📅</span>
                      <span style={{fontFamily:FF.s,fontSize:9,color:dl<30?P.terra:P.muted}}>
                        {dl>0?`${dl} days to deadline`:"Past deadline"} · {g.deadline}
                      </span>
                    </div>
                  )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}
    <div style={CS(14,"18px","none")}>
      <SLabel color={P.steel}>🧬 Lab Freshness — Most Recent Draw Per Biomarker</SLabel>
      <div style={S.col7}>
        {LAB_FRESHNESS.map(b=>{
          const col = b.status==="overdue"?P.terra:b.status==="due_soon"?P.amber:P.sage;
          const bg  = b.status==="overdue"?P.terracottaBg:b.status==="due_soon"?P.amberBg:P.sageBg;
          return(
            <div key={b.name} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",
              borderRadius:8,background:bg,border:`1px solid ${col}22`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text}}>{b.name}</span>
                  <span style={S.mut8}>{b.panel}</span>
                </div>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:1}}>Last: {b.date} · {b.daysSince} days ago</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:col}}>
                  {b.status==="overdue"?"OVERDUE":b.status==="due_soon"?"DUE SOON":"OK"}
                </div>
                <div style={S.mut8}>
                  {b.daysUntilDue>0?`${b.daysUntilDue}d remaining`:`${Math.abs(b.daysUntilDue)}d overdue`}
                </div>
              </div>
              <div style={{width:40,flexShrink:0}}>
                <div style={{height:4,borderRadius:2,background:P.border,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${b.pctFresh}%`,background:col,borderRadius:2}}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:12,lineHeight:1.6}}>
        Targets: lipids/hormones 180 days · metabolic markers 180 days · longevity panel 365 days.
        Import new results via the <strong>Import Data</strong> page to reset freshness.
      </div>
    </div>

  </div>);
}
