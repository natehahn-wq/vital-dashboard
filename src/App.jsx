import { useState, useEffect, lazy, Suspense } from "react";
import { P, FF, setActiveTheme } from "./lib/theme.js";

import { useIsMobile } from "./hooks/useIsMobile.js";
import { useWhoopLive } from "./hooks/useWhoopLive.js";
import { useGoogleFonts } from "./hooks/useGoogleFonts.js";
import { Sidebar } from "./components/Sidebar.jsx";
import { Topbar } from "./components/Topbar.jsx";
import { MobileTopbar } from "./components/MobileTopbar.jsx";
import { MobileNav } from "./components/MobileNav.jsx";
import { UserModal } from "./components/UserModal.jsx";

// Lazy-load all pages so each becomes its own chunk and recharts is only
// pulled in when a chart-using page is first navigated to.
const TodayPage        = lazy(()=> import("./pages/TodayPage.jsx").then(m=>({default:m.TodayPage})));
const SleepPage        = lazy(()=> import("./pages/SleepPage.jsx").then(m=>({default:m.SleepPage})));
const Overview         = lazy(()=> import("./pages/Overview.jsx").then(m=>({default:m.Overview})));
const ScorePage        = lazy(()=> import("./pages/ScorePage.jsx").then(m=>({default:m.ScorePage})));
const FitnessPage      = lazy(()=> import("./pages/FitnessPage.jsx").then(m=>({default:m.FitnessPage})));
const CalendarPage     = lazy(()=> import("./pages/CalendarPage.jsx").then(m=>({default:m.CalendarPage})));
const BodyComp         = lazy(()=> import("./pages/BodyComp.jsx").then(m=>({default:m.BodyComp})));
const Labs             = lazy(()=> import("./pages/Labs.jsx").then(m=>({default:m.Labs})));
const Trends           = lazy(()=> import("./pages/Trends.jsx").then(m=>({default:m.Trends})));
const CorrelationsPage = lazy(()=> import("./pages/CorrelationsPage.jsx").then(m=>({default:m.CorrelationsPage})));
const ProgressPage     = lazy(()=> import("./pages/ProgressPage.jsx").then(m=>({default:m.ProgressPage})));
const ReadinessPage    = lazy(()=> import("./pages/ReadinessPage.jsx").then(m=>({default:m.ReadinessPage})));
const FuelingPage      = lazy(()=> import("./pages/FuelingPage.jsx").then(m=>({default:m.FuelingPage})));
const SupplementsPage  = lazy(()=> import("./pages/SupplementsPage.jsx").then(m=>({default:m.SupplementsPage})));
const PelotonPage      = lazy(()=> import("./pages/PelotonPage.jsx").then(m=>({default:m.PelotonPage})));
const ImportPage       = lazy(()=> import("./pages/ImportPage.jsx").then(m=>({default:m.ImportPage})));


export default function App(){
  useGoogleFonts();
  const [page,setPage]=useState("today");
  const [showMobileProfile, setShowMobileProfile]=useState(false);
  const { whoopStatus } = useWhoopLive();

  const [theme,setTheme]=useState(()=>{
    try{ return localStorage.getItem("vital_theme")||"warm"; } catch(e){ return "warm"; }
  });

  useEffect(()=>{
    setActiveTheme(theme);
  },[theme]);

  const setThemeAndSave = (t) => {
    try{ localStorage.setItem("vital_theme",t); }catch(e){}
    setTheme(t);
    setActiveTheme(t);
  };

  const mob = useIsMobile();

  const renderPage = () => {
    switch(page){
      case "today":        return <TodayPage setPage={setPage} whoopStatus={whoopStatus}/>;
      case "sleep":        return <SleepPage/>;
      case "overview":     return <Overview setPage={setPage}/>;
      case "score":        return <ScorePage/>;
      case "fitness":      return <FitnessPage/>;
      case "calendar":     return <CalendarPage/>;
      case "body":         return <BodyComp/>;
      case "labs":         return <Labs/>;
      case "trends":       return <Trends/>;
      case "correlations": return <CorrelationsPage/>;
      case "progress":     return <ProgressPage setPage={setPage}/>;
      case "readiness":    return <ReadinessPage/>;
      case "fueling":      return <FuelingPage/>;
      case "supps":        return <SupplementsPage/>;
      case "peloton":      return <PelotonPage/>;
      case "import":       return <ImportPage/>;
      default:             return <TodayPage setPage={setPage} whoopStatus={whoopStatus}/>;
    }
  };

  return(
    <div style={{display:"flex",minHeight:"100vh",background:P.bg,color:P.text,fontFamily:FF.s}}>
      {showMobileProfile&&<UserModal onClose={()=>setShowMobileProfile(false)} theme={theme} setTheme={setThemeAndSave}/>}
      {!mob&&<Sidebar active={page} set={setPage} peloConnected={false} theme={theme} setTheme={setThemeAndSave}/>}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflowX:"hidden"}}>
        {mob
          ? <MobileTopbar page={page} onProfile={()=>setShowMobileProfile(true)}/>
          : <Topbar page={page}/>
        }
        <div style={{
          flex:1,overflowY:"auto",overflowX:"hidden",
          padding: mob?"12px 12px 80px":"22px 28px 48px",
          maxWidth: mob?"100%":1200,
          width:"100%",
          boxSizing:"border-box",
          margin:"0 auto",
        }}>
          <Suspense fallback={<div style={{padding:24,color:P.sub,fontFamily:FF.s,fontSize:13}}>Loading…</div>}>
            {renderPage()}
          </Suspense>
        </div>
        {mob&&<MobileNav active={page} set={setPage}/>}
      </div>
    </div>
  );
}
