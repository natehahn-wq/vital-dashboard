// Mobile topbar — compact 52px header showing the page label, current
// recovery/HRV stats, the master health score badge, and a profile avatar.
import { P, FF } from "../lib/theme.js";
import { WHOOP } from "../lib/data/whoop.js";
import { SCORES_NOW } from "../lib/data/scores.js";

export function MobileTopbar({page, onProfile}){
  const hour = new Date().getHours();
  const todGreet = hour<6?"Up early":hour<12?"Good morning":hour<17?"Good afternoon":hour<21?"Good evening":"Good night";
  const labels={today:todGreet,import:"Import Data",supps:"Supplements",progress:"Progress",sleep:"Sleep",
    strava:"Strava",peloton:"Peloton",correlations:"Correlations",
    fueling:"Fueling",readiness:"Readiness",
    overview:"Dashboard",score:"Health Score",fitness:"Fitness",
    calendar:"Calendar",body:"Body Comp",labs:"Labs",trends:"Trends"};
  return(
    <div style={{height:52,background:P.card,borderBottom:`1px solid ${P.border}`,
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"0 14px",position:"sticky",top:0,zIndex:20}}>
      <div style={{fontFamily:FF.r,fontWeight:600,fontSize:16,color:P.text,flex:1,minWidth:0,
        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {labels[page]||page}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <div style={{fontFamily:FF.m,fontSize:9,color:P.muted,display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
          <span>{WHOOP.recovery}% rec</span>
          <span>{WHOOP.hrv}ms HRV</span>
        </div>
        <div style={{width:30,height:30,borderRadius:7,background:P.amber+"22",
          border:`1px solid ${P.amber}44`,display:"flex",alignItems:"center",
          justifyContent:"center",fontFamily:FF.m,fontSize:10,fontWeight:700,color:P.amber,flexShrink:0}}>
          {SCORES_NOW.master.score}
        </div>
        <div onClick={onProfile}
          style={{width:30,height:30,borderRadius:"50%",background:P.cardDk,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:FF.r,fontWeight:600,fontSize:12,color:P.textInv,
            cursor:"pointer",flexShrink:0,border:`1px solid ${P.border}`}}>
          N
        </div>
      </div>
    </div>
  );
}
