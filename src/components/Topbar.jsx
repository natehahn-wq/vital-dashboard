// Desktop topbar — shows the page title, the current date or context label,
// and a small "Recovery + HRV" health-status pill on the right.
import { P, FF, S } from "../lib/theme.js";

export function Topbar({page}){
  const hour = new Date().getHours();
  const todGreet =
    hour < 6  ? "You're up early, Nate" :
    hour < 12 ? "Good morning, Nate" :
    hour < 14 ? "Good afternoon, Nate" :
    hour < 17 ? "Good afternoon, Nate" :
    hour < 21 ? "Good evening, Nate" :
               "Good night, Nate";
  const labels={today:todGreet,import:"Import Data",peloton:"Peloton",supps:"Supplements",progress:"Progress",sleep:"Sleep",correlations:"Correlations",fueling:"Fueling",readiness:"Readiness",overview:"Dashboard",score:"Health Score",fitness:"Fitness & Training",calendar:"Calendar",body:"Body Composition",labs:"Labs",trends:"Trends"};
  const dates={score:"May 23, 2025",labs:"May 23, 2025",body:"May 23, 2025",fitness:"6mo"};
  return(<div style={{height:58,background:P.card,borderBottom:"none",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 26px",position:"sticky",top:0,zIndex:10}}>
    <div>
      <div style={{fontFamily:FF.r,fontWeight:600,fontSize:17,color:P.text,letterSpacing:"0.01em"}}>{labels[page]||page}</div>
      <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginTop:1}}>{dates[page]||new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
    </div>
    <div style={S.row10}>
      <div style={{display:"flex",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:"rgba(255,255,255,0.6)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:P.sage}}/>
            <span style={S.sub9}>Recovery + HRV</span>
          </div>
      </div>
    </div>
  </div>);
}
