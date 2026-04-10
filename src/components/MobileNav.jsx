// Mobile bottom nav with drawer for secondary pages.
import { useState } from "react";
import { P, FF, S } from "../lib/theme.js";

export function MobileNav({active,set}){
  const [drawerOpen, setDrawerOpen] = useState(false);

  const PRIMARY_TABS=[
    {id:"today",    icon:"☀",    label:"Today"},
    {id:"score",    icon:"⚡",   label:"Score"},
    {id:"fitness",  icon:"🏃", label:"Fitness"},
    {id:"calendar", icon:"📅",label:"Calendar"},
  ];
  const DRAWER_PAGES=[
    {group:"Daily",items:[
      {id:"today",        icon:"☀",   label:"Today"},
      {id:"overview",     icon:"⊞",   label:"Overview"},
      {id:"readiness",    icon:"📡",   label:"Readiness"},
      {id:"fueling",      icon:"🥗",   label:"Fueling"},
    ]},
    {group:"Health",items:[
      {id:"score",        icon:"⚡",   label:"Health Score"},
      {id:"labs",         icon:"🧬",   label:"Labs"},
      {id:"body",         icon:"📐",   label:"Body Comp"},
      {id:"trends",       icon:"↗",    label:"Trends"},
      {id:"correlations", icon:"🔗",   label:"Correlations"},
    ]},
    {group:"Fitness",items:[
      {id:"fitness",      icon:"🏃",   label:"Fitness"},
      {id:"sleep",        icon:"🌙",   label:"Sleep"},
      {id:"progress",     icon:"📈",   label:"Progress"},
      {id:"calendar",     icon:"📅",   label:"Calendar"},
    ]},
    {group:"More",items:[
      {id:"supps",        icon:"💊",   label:"Supplements"},
      {id:"peloton",      icon:"🚴",   label:"Peloton"},
      {id:"import",       icon:"⬆",    label:"Import Data"},
    ]},
  ];

  const isMoreActive = !PRIMARY_TABS.some(t=>t.id===active) || drawerOpen;
  const navTo = (id) => { set(id); setDrawerOpen(false); };

  return(
    <>
      {drawerOpen&&(
        <div onClick={()=>setDrawerOpen(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:28,backdropFilter:"blur(2px)"}}/>
      )}
      <div style={{
        position:"fixed",bottom:64,left:0,right:0,zIndex:29,
        background:P.card,borderTop:`1px solid ${P.border}`,
        borderRadius:"16px 16px 0 0",padding:"16px 16px 8px",
        boxShadow:"0 -8px 32px rgba(0,0,0,0.18)",
        transform:drawerOpen?"translateY(0)":"translateY(100%)",
        transition:"transform 0.28s cubic-bezier(0.32,0.72,0,1)",
        maxHeight:"70vh",overflowY:"auto",
      }}>
        <div style={{width:36,height:4,borderRadius:2,background:P.border,margin:"0 auto 16px"}}/>
        <div style={S.mut9}>All Pages</div>
        {DRAWER_PAGES.map(({group,items})=>(
          <div key={group} style={{marginBottom:16,marginTop:10}}>
            <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.muted,
              letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>{group}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:6}}>
              {items.map(({id,icon,label})=>{
                const isActive=active===id;
                return(
                  <button key={id} onClick={()=>navTo(id)}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",
                      justifyContent:"center",gap:4,padding:"10px 4px",
                      borderRadius:10,border:`1.5px solid ${isActive?P.amber+"88":P.border}`,
                      background:isActive?P.amber+"12":"transparent",
                      cursor:"pointer",transition:"all .15s"}}>
                    <span style={{fontSize:20,lineHeight:1}}>{icon}</span>
                    <span style={{fontFamily:FF.s,fontSize:8,fontWeight:isActive?700:400,
                      color:isActive?P.amber:P.sub,textAlign:"center",lineHeight:1.2}}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,height:64,zIndex:30,
        background:P.card,borderTop:`1px solid ${P.border}`,
        display:"flex",alignItems:"stretch",boxShadow:"0 -2px 12px rgba(0,0,0,.08)"}}>
        {PRIMARY_TABS.map(({id,icon,label})=>{
          const isActive=active===id&&!drawerOpen;
          return(
            <button key={id} onClick={()=>{ setDrawerOpen(false); set(id); }}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",gap:3,border:"none",background:"transparent",
                cursor:"pointer",transition:"all .15s",
                borderTop:`2px solid ${isActive?P.amber:"transparent"}`}}>
              <span style={{fontSize:18,lineHeight:1,opacity:isActive?1:0.45}}>{icon}</span>
              <span style={{fontFamily:FF.s,fontSize:9,fontWeight:isActive?700:400,
                color:isActive?P.amber:P.muted,letterSpacing:"0.04em"}}>{label}</span>
            </button>
          );
        })}
        <button onClick={()=>setDrawerOpen(o=>!o)}
          style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",gap:3,border:"none",background:"transparent",
            cursor:"pointer",transition:"all .15s",
            borderTop:`2px solid ${isMoreActive?P.amber:"transparent"}`}}>
          <span style={{fontSize:18,lineHeight:1,opacity:isMoreActive?1:0.45,
            transition:"transform .2s",display:"inline-block",
            transform:drawerOpen?"rotate(180deg)":"none"}}>⋯</span>
          <span style={{fontFamily:FF.s,fontSize:9,fontWeight:isMoreActive?700:400,
            color:isMoreActive?P.amber:P.muted,letterSpacing:"0.04em"}}>
            {drawerOpen?"Close":"More"}
          </span>
        </button>
      </div>
    </>
  );
}
