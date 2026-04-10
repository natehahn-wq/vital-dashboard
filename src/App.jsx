import { useState, useEffect } from "react";
import { P, FF, setActiveTheme } from "./lib/theme.js";

import { useIsMobile } from "./hooks/useIsMobile.js";
import { useWhoopLive } from "./hooks/useWhoopLive.js";
import { useGoogleFonts } from "./hooks/useGoogleFonts.js";
import { CorrelationsPage } from "./pages/CorrelationsPage.jsx";
import { Overview } from "./pages/Overview.jsx";
import { ReadinessPage } from "./pages/ReadinessPage.jsx";
import { FuelingPage } from "./pages/FuelingPage.jsx";
import { ScorePage } from "./pages/ScorePage.jsx";
import { TodayPage } from "./pages/TodayPage.jsx";
import { Labs } from "./pages/Labs.jsx";
import { BodyComp } from "./pages/BodyComp.jsx";
import { Trends } from "./pages/Trends.jsx";
import { FitnessPage } from "./pages/FitnessPage.jsx";
import { CalendarPage } from "./pages/CalendarPage.jsx";
import { ImportPage } from "./pages/ImportPage.jsx";
import { PelotonPage } from "./pages/PelotonPage.jsx";
import { SupplementsPage } from "./pages/SupplementsPage.jsx";
import { ProgressPage } from "./pages/ProgressPage.jsx";
import { SleepPage } from "./pages/SleepPage.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Topbar } from "./components/Topbar.jsx";
import { MobileTopbar } from "./components/MobileTopbar.jsx";
import { MobileNav } from "./components/MobileNav.jsx";
import { UserModal } from "./components/UserModal.jsx";


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

  const PAGES = {
    today:        <TodayPage setPage={setPage} whoopStatus={whoopStatus}/>,
      sleep:        <SleepPage/>,
    overview:     <Overview setPage={setPage}/>,
    score:        <ScorePage/>,
    fitness:      <FitnessPage/>,
    calendar:     <CalendarPage/>,
    body:         <BodyComp/>,
    labs:         <Labs/>,
    trends:       <Trends/>,
    correlations: <CorrelationsPage/>,
    progress:     <ProgressPage setPage={setPage}/>,
    readiness:    <ReadinessPage/>,
    fueling:      <FuelingPage/>,
    supps:        <SupplementsPage/>,
    peloton:      <PelotonPage/>,
    import:       <ImportPage/>,
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
          {PAGES[page] || <TodayPage setPage={setPage}/>}
        </div>
        {mob&&<MobileNav active={page} set={setPage}/>}
      </div>
    </div>
  );
}
