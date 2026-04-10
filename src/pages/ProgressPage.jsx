// Progress page — tab navigation between Personal Bests and Goals.
import { useState } from "react";
import { P, FF } from "../lib/theme.js";
import { PersonalBestsPage } from "./PersonalBestsPage.jsx";
import { GoalsPage } from "./GoalsPage.jsx";

export function ProgressPage({setPage}){
  const [tab, setTab] = useState("pbs");
  return(
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      <div style={{display:"flex",gap:0,marginBottom:18,background:P.panel,
        borderRadius:12,padding:4,border:`1px solid ${P.border}`}}>
        {[{id:"pbs",icon:"🏆",label:"Personal Bests"},{id:"goals",icon:"🎯",label:"Goals"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
              padding:"9px 0",borderRadius:9,border:"none",cursor:"pointer",transition:"all .15s",
              background:tab===t.id?P.card:"transparent",
              boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,0.08)":"none",
              fontFamily:FF.s,fontSize:12,fontWeight:tab===t.id?700:400,
              color:tab===t.id?P.text:P.muted}}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      {tab==="pbs"   && <PersonalBestsPage setPage={setPage}/>}
      {tab==="goals" && <GoalsPage/>}
    </div>
  );
}
