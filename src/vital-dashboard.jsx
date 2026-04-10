import { useState, useRef, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, Cell,
  PieChart, Pie, LineChart, Line, ReferenceLine, ComposedChart,
} from "recharts";

function useIsMobile(){
  const [mob,setMob]=useState(()=>typeof window!=="undefined"&&window.innerWidth<768);
  useEffect(()=>{
    const h=()=>setMob(window.innerWidth<768);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);
  return mob;
}

// Live WHOOP data hook — fetches from /api/whoop/data on moun
// Falls back to hardcoded constants if not connected / on localhost
function useWhoopLive() {
  const [whoopLive, setWhoopLive] = useState(null);
  const [whoopStatus, setWhoopStatus] = useState('loading'); // loading|connected|disconnected|stale

  useEffect(()=>{
    // Skip on localhost without API (avoids console errors)
    const isLocalFile = window.location.protocol === 'file:';
    if(isLocalFile){ setWhoopStatus('disconnected'); return; }

    fetch('/api/whoop/data')
      .then(r => r.ok ? r.json() : null)
      .then(res => {
        if(!res || !res.connected || !res.data){
          setWhoopStatus('disconnected');
          return;
        }
        setWhoopLive(res.data);
        setWhoopStatus(res.stale ? 'stale' : 'connected');
      })
      .catch(()=> setWhoopStatus('disconnected'));
  }, []);

  return { whoopLive, whoopStatus };
}


function RGrid({cols,mobCols=1,gap=12,children,style={}}){
  const mob=useIsMobile();
  return <div style={{display:"grid",gridTemplateColumns:`repeat(${mob?mobCols:cols},1fr)`,gap,...style}}>{children}</div>;
}

function useGoogleFonts() {
  useEffect(() => {
    if (document.getElementById("vf")) return;
    const l = document.createElement("link");
    l.id = "vf"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(l);
  }, []);
}
// Fetches Google Calendar events directly via /api/calendar endpoint
function useCalendarEvents(){
  const [events, setEvents]  = useState(null);   // null=loading, []=empty, [...]=loaded
  const [label,  setLabel]   = useState("today"); // "today" | "tomorrow"
  const [error,  setError]   = useState(null);

  useEffect(()=>{
    const run = async ()=>{
      const now   = new Date();
      const hour  = now.getHours();
      const isAfter6 = hour >= 18;

      // Build date window
      const targetDate = new Date(now);
      if(isAfter6) targetDate.setDate(targetDate.getDate()+1);

      const yyyy = targetDate.getFullYear();
      const mm   = String(targetDate.getMonth()+1).padStart(2,"0");
      const dd   = String(targetDate.getDate()).padStart(2,"0");
      const dayStart = `${yyyy}-${mm}-${dd}T00:00:00`;
      const dayEnd   = `${yyyy}-${mm}-${dd}T23:59:59`;
      const dayLabel = isAfter6 ? "tomorrow" : "today";
      setLabel(dayLabel);

      const CALS = [
        "natehahn@gmail.com",
        "nate@epidemic.agency",
        "nate@lasushico.com",
        "nate@with.partners",
        "family05212513149394648654@group.calendar.google.com",
      ];

      try {
        // Fetch events from all calendars in parallel
        const results = await Promise.all(
          CALS.map(async (calId) => {
            try {
              const url = `/api/calendar?calendarId=${encodeURIComponent(calId)}&timeMin=${encodeURIComponent(dayStart)}&timeMax=${encodeURIComponent(dayEnd)}`;
              const res = await fetch(url);
              if (!res.ok) return [];
              const data = await res.json();
              return (data.items || []).map(ev => ({
                summary: ev.summary || "(No title)",
                start: ev.start && (ev.start.dateTime || ev.start.date) || "",
                end: ev.end && (ev.end.dateTime || ev.end.date) || "",
                location: ev.location || "",
                calendar_id: calId,
              }));
            } catch { return []; }
          })
        );

        // Merge and sort by start time
        const allEvents = results.flat().sort((a, b) => {
          const ta = a.start ? new Date(a.start).getTime() : 0;
          const tb = b.start ? new Date(b.start).getTime() : 0;
          return ta - tb;
        });

        setEvents(allEvents);
        setError(null);
      } catch(e) {
        setEvents([]);
        setError(e.message);
      }
    };
    run();
  }, []);

  return { events, label, error };
}

// Format event time nicely
function fmtEvtTime(t){
  if(!t) return "";
  // Handle ISO datetime strings
  if(t.includes("T")){
    const d = new Date(t);
    return d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
  }
  return t;
}

// Calendar → short source label
function calLabel(id){
  if(!id) return "";
  if(id.includes("epidemic")) return "Epidemic";
  if(id.includes("lasushi"))  return "LA Sushi";
  if(id.includes("with.partners")) return "W/P";
  if(id.includes("family"))   return "Family";
  return "Personal";
}

// Calendar → accent color
function calColor(id){
  if(!id) return P.muted;
  if(id.includes("epidemic")) return "#C47830";
  if(id.includes("lasushi"))  return "#C4604A";
  if(id.includes("with.partners")) return "#4A8070";
  if(id.includes("family"))   return "#3A9C68";
  return P.steel;
}
// 4 schemes: warm (default), obsidian/teal, navy/gold, forest/platinum
const THEMES = {
  warm: {
    id:"warm", name:"Warm Clinical", preview:"#F4EFE8",
    accent:"#C47830", accentDk:"#C47830", dark:false,
    bg:"#F4EFE8", panel:"#EDE7DE", card:"#FFFFFF", cardDk:"#242220",
    border:"#DDD6CC", borderDk:"#4A4642",
    text:"#1C1A17", textInv:"#F4EFE8", sub:"#6B6057", muted:"#A8A09A", mutedDk:"#B0A89E",
  },
 
  calmLuxury: {
    id:"calmLuxury", name:"Calm Luxury", preview:"#F2EFEA",
    accent:"#557373", accentDk:"#272401", dark:false,
    bg:"#F2EFEA", panel:"#E8E5DF", card:"#FAFAF8", cardDk:"#272401",
    border:"rgba(85,115,115,0.18)", borderDk:"rgba(85,115,115,0.32)",
    text:"#0D0D0D", textInv:"#F2EFEA", sub:"rgba(13,13,13,0.60)", muted:"rgba(13,13,13,0.38)", mutedDk:"rgba(242,239,234,0.65)",
   
    terra:"#557373", sage:"#272401", amber:"#557373", steel:"#272401",
    terracottaBg:"#DFE5F3", sageBg:"#DFE5F3", amberBg:"#DFE5F3", steelBg:"#DFE5F3",
    gold:"#557373", clay:"#272401", rose:"#557373", ink:"#272401", violet:"#557373",
  },
 
  blueNeutral: {
    id:"blueNeutral", name:"Blue Neutral", preview:"#07203F",
    accent:"#D9AA90", accentDk:"#D9AA90", dark:true,
    bg:"#07203F", panel:"#0A2848", card:"#0E2E50", cardDk:"#02000D",
    border:"rgba(217,170,144,0.16)", borderDk:"rgba(217,170,144,0.28)",
    text:"#EBDED4", textInv:"#EBDED4", sub:"rgba(235,222,212,0.60)", muted:"rgba(235,222,212,0.38)", mutedDk:"rgba(217,170,144,0.65)",
    terra:"#A65E46", sage:"#D9AA90", amber:"#D9AA90", steel:"#8A9CC0",
    terracottaBg:"rgba(166,94,70,0.18)", sageBg:"rgba(217,170,144,0.14)", amberBg:"rgba(217,170,144,0.14)", steelBg:"rgba(138,156,192,0.14)",
    gold:"#D9AA90", clay:"#A65E46", rose:"#D9AA90", ink:"#02000D", violet:"#8A9CC0",
  },
 
  greenPalette: {
    id:"greenPalette", name:"Green", preview:"#192231",
    accent:"#C0B283", accentDk:"#C0B283", dark:true,
    bg:"#192231", panel:"#222E26", card:"#1E2A26", cardDk:"#101620",
    border:"rgba(192,178,131,0.16)", borderDk:"rgba(192,178,131,0.28)",
    text:"#EDDBCD", textInv:"#EDDBCD", sub:"rgba(237,219,205,0.60)", muted:"rgba(237,219,205,0.38)", mutedDk:"rgba(192,178,131,0.65)",
    terra:"#C0B283", sage:"#404A42", amber:"#C0B283", steel:"#404A42",
    terracottaBg:"rgba(192,178,131,0.14)", sageBg:"rgba(64,74,66,0.30)", amberBg:"rgba(192,178,131,0.14)", steelBg:"rgba(64,74,66,0.30)",
    gold:"#C0B283", clay:"#EDDBCD", rose:"#C0B283", ink:"#192231", violet:"#8A9CB8",
  },

  lifeforce: {
    id:"lifeforce", name:"Lifeforce", preview:"#F7F0E6",
    accent:"#C89A5A", accentDk:"#8B6F4E", dark:false,
    bg:"#F7F0E6", panel:"#EDE4D6", card:"#FBF7F2", cardDk:"#1C1410",
    border:"rgba(214,200,180,0.55)", borderDk:"rgba(139,111,78,0.30)",
    text:"#1C1410", textInv:"#FBF7F2", sub:"#4A3728", muted:"#8C7B6A", mutedDk:"#A89880",
    terra:"#B5301A",   terracottaBg:"#FDDBD6",
    sage:"#2D6A4F",    sageBg:"#D8F3DC",
    amber:"#C47C1A",   amberBg:"#FFF3CD",
    steel:"#2A7D8C",   steelBg:"#D1ECF1",
    gold:"#C89A5A",    clay:"#8B6F4E",
    rose:"#A03820",    ink:"#1C1410",  violet:"#6B5DA0",
  },

};

// Active theme — read from localStorage on load, default to warm
let _activeTheme = "warm";
try { _activeTheme = localStorage.getItem("vital_theme") || "warm"; } catch(e){}

// P is the live palette — properties are mutated in-place when user changes
// theme (not reassigned), so importing P_BASE/P from another module remains
// safe when we split this file in Stage 2 of the migration.
const P_BASE = {...(THEMES[_activeTheme] || THEMES.warm)};
function setActiveTheme(t){
  const next = THEMES[t] || THEMES.warm;
  // Wipe stale keys then copy fresh ones so theme switches are clean.
  for (const k of Object.keys(P_BASE)) delete P_BASE[k];
  Object.assign(P_BASE, next);
}

const P = {
  // Backgrounds — dynamic per theme
  get bg()       { return P_BASE.bg; },
  get panel()    { return P_BASE.panel; },
  get card()     { return P_BASE.card; },
  get cardDk()   { return P_BASE.cardDk; },
  get border()   { return P_BASE.border; },
  get borderDk() { return P_BASE.borderDk; },

  // Text — dynamic per theme
  get text()     { return P_BASE.text; },
  get textInv()  { return P_BASE.textInv; },
  get sub()      { return P_BASE.sub; },
  get muted()    { return P_BASE.muted; },
  get mutedDk()  { return P_BASE.mutedDk; },

 
  get terra()          { return P_BASE.terra      || "#C4604A"; },
  get terracottaBg()   { return P_BASE.terracottaBg|| "#FDF1EE"; },
  get sage()           { return P_BASE.sage       || "#3A5C48"; },
  get sageBg()         { return P_BASE.sageBg     || "#EBF0EC"; },
  get amber()          { return P_BASE.amber      || "#C47830"; },
  get amberBg()        { return P_BASE.amberBg    || "#FDF5E8"; },
  get steel()          { return P_BASE.steel      || "#4A6070"; },
  get steelBg()        { return P_BASE.steelBg    || "#ECF2F6"; },
  get gold()           { return P_BASE.gold       || "#B8902A"; },
  get clay()           { return P_BASE.clay       || "#8A6050"; },
  get rose()           { return P_BASE.rose       || "#9A4558"; },
  get ink()            { return P_BASE.ink        || "#2A3540"; },
  get violet()         { return P_BASE.violet     || "#7A5A80"; },
  get accent()         { return P_BASE.accent     || "#C47830"; },

 
  get cyan()    { return P_BASE.sage   || "#3A5C48"; },
  get cyanBg()  { return P_BASE.sageBg || "#EBF0EC"; },
  get coral()   { return P_BASE.terra  || "#C4604A"; },
  get coralBg() { return P_BASE.terracottaBg || "#FDF1EE"; },
  get blue()    { return P_BASE.steel  || "#4A6070"; },
  get blueBg()  { return P_BASE.steelBg|| "#ECF2F6"; },
  get green()   { return P_BASE.sage   || "#3A5C48"; },
  get greenBg() { return P_BASE.sageBg || "#EBF0EC"; },
  get pink()    { return P_BASE.rose   || "#9A4558"; },
  get pinkBg()  { return P_BASE.roseBg || "#F8ECEF"; },
  get pelo()    { return P_BASE.terra  || "#C4604A"; },
  get peloBg()  { return P_BASE.terracottaBg || "#FDF1EE"; },

  // Fixed
  roseBg:    "#F8ECEF",
  goldBg:    "#FBF5E6",
  inkBg:     "#E8EDF2",
  violetBg:  "#F2EBF6",
  clayBg:    "#F5EDE8",
  coralBg:   "#FDF1EE",
  cyanBg:    "#EBF0EC",
  blueBg:    "#ECF2F6",
  pinkBg:    "#F8ECEF",
  peloBg:    "#FDF1EE",

  mono: '"DM Mono", monospace',
  sans: '"DM Sans", system-ui, sans-serif',
  serif: '"Cormorant Garant", Georgia, serif',

 
  coralBg:   "#FDF1EE",
  greenBg:   "#EBF0EC",
  violetBg:  "#F2EBF6",
  blueBg:    "#ECF2F6",
  cyanBg:    "#EBF0EC",
  pinkBg:    "#F8ECEF",
  peloBg:    "#FDF1EE",
  inkBg:     "#E8EDF2",
};
const FF={s:P.sans,r:P.serif,m:P.mono}; // font shorthand

// Reusable style shorthands (saves ~12KB of repeated inline style objects)
const S={
  mut9:  {fontFamily:FF.s,fontSize:9,color:P.muted},
  mut9t2:{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:2},
  mut8:  {fontFamily:FF.s,fontSize:8,color:P.muted},
  mut8u: {fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em"},
  mut9uc:{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase"},
  mut10: {fontFamily:FF.s,fontSize:10,color:P.muted},
  sub9:  {fontFamily:FF.s,fontSize:9,color:P.sub},
  sub10: {fontFamily:FF.s,fontSize:10,color:P.sub},
  sub10l:{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6},
  h18:   {fontFamily:FF.r,fontWeight:600,fontSize:18,color:P.text},
  divider:{flex:1,height:1,background:P.border},
  col16: {display:"flex",flexDirection:"column",gap:18},
  col18: {display:"flex",flexDirection:"column",gap:22},
  col7:  {display:"flex",flexDirection:"column",gap:7},
  col10: {display:"flex",flexDirection:"column",gap:12},
  row10: {display:"flex",alignItems:"center",gap:12},
  row8:  {display:"flex",alignItems:"center",gap:8},
  row6:  {display:"flex",alignItems:"center",gap:6},
  row5:  {display:"flex",alignItems:"center",gap:5},
  row4:  {display:"flex",alignItems:"center",gap:4},
  rowsb: {display:"flex",justifyContent:"space-between",alignItems:"center"},
  rowsbe:{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12},
  g240:  {display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16},
  g120:  {display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:12},
};
// Card container style helper (82 uses × ~60 chars = ~5KB saved)
const CS=(r=14,p="18px",sh="0 1px 3px rgba(0,0,0,.04)")=>({background:P.card,border:`1px solid ${P.border}`,borderRadius:r,padding:p,boxShadow:sh});

// Styku scans — actual values
const STYKU = {
  scan1: { date:"Feb 14, 2025", weight:208, bodyFat:23.9, fatMass:49.8, leanMass:151.7, bmi:28.0, bmr:1969, healthRisk:20, waistAbd:35.7, waistNarrow:33.7, hip:42.2, chest:40.4 },
  scan2: { date:"May 23, 2025", weight:212, bodyFat:21.1, fatMass:44.8, leanMass:160.3, bmi:28.7, bmr:1993, healthRisk:0,  waistAbd:34.7, waistNarrow:32.9, hip:41.0, chest:41.0 },
  progress: { days:99, weightDelta:+4.0, bfDelta:-2.8, leanDelta:+8.6, fatDelta:-5.0, circumDelta:-11.0 },
};

// DXA Scan — January 23, 2026 · Pueblo Radiology (Hologic Horizon W)
// Gold-standard DEXA measurement — most accurate body composition available
const DXA = {
  date: "Jan 23, 2026",
  age: 47,
  weight: 216.0,       // lbs
  height: 72.0,        // inches
  bmi: 29.3,

  // Total body composition
  totalFatPct:    26.4,
  totalFatLbs:    56.47,
  totalLeanLbs:   149.81,  // lean mass only (excl. BMC)
  totalBMC_lbs:   7.35,    // bone mineral content
  totalLeanBMC:   157.16,  // lean + BMC

 
  vatMass_g:   567,
  vatVol_cm3:  613,
  vatArea_cm2: 118,

  // Android / Gynoid
  android: { fatLbs:4.25, leanLbs:10.22, totalLbs:14.47, fatPct:29.4 },
  gynoid:  { fatLbs:10.68,leanLbs:24.39, totalLbs:35.07, fatPct:30.5 },
  androidGynoidRatio: 0.96,

 
  regions: {
    lArm:  { fatLbs:2.76,  leanLbs:10.43, totalLbs:13.18, fatPct:20.9, bmd:1.080 },
    rArm:  { fatLbs:2.76,  leanLbs:11.04, totalLbs:13.80, fatPct:20.0, bmd:1.213 },
    trunk: { fatLbs:27.60, leanLbs:77.51, totalLbs:105.11,fatPct:26.3, bmd:1.131 },
    lLeg:  { fatLbs:10.18, leanLbs:24.19, totalLbs:34.37, fatPct:29.6, bmd:1.443 },
    rLeg:  { fatLbs:10.49, leanLbs:25.26, totalLbs:35.75, fatPct:29.3, bmd:1.500 },
  },

  // Bone Mineral Density
  bmd: {
    total:  { bmd:1.331, tScore:1.3, zScore:1.3, pr:111, am:112 },
    lSpine: { bmd:1.483 },
    tSpine: { bmd:1.131 },
    pelvis: { bmd:1.469 },
    lLeg:   { bmd:1.443 },
    rLeg:   { bmd:1.500 },
  },

  // Percentile rankings
  percentiles: {
    fatPct_YN: 78, fatPct_AM: 62,   // vs young-normal & age-matched
    lean_YN:   60, lean_AM:   49,
    appendLean_YN: 54, appendLean_AM: 50,
  },
};

// Scan history across all methods (newest first)
const SCAN_HISTORY = [
  { date:"Jan 23, 2026", source:"DXA",   weight:216.0, fatPct:26.4, fatLbs:56.47, leanLbs:149.81, note:"Gold standard" },
  { date:"May 23, 2025", source:"Styku", weight:212.0, fatPct:21.1, fatLbs:44.8,  leanLbs:160.3,  note:"3D optical" },
  { date:"Feb 14, 2025", source:"Styku", weight:208.0, fatPct:23.9, fatLbs:49.8,  leanLbs:151.7,  note:"3D optical" },
];

// Hume Health Pod — daily BIA readings (Dec 2025–Mar 2026)
// Weight corrected from lbs stored in Apple Health. BF% from BIA — trends valid, absolute values ~11pts lower than DXA.
let HUME_DATA=[
  {d:"2026-03-20",wt:212.9,bf:14.82,bmi:29.1},
  {d:"2026-03-19",wt:212.9,bf:14.75,bmi:29.1},
  {d:"2026-03-18",wt:211.5,bf:15.06,bmi:28.9},
  {d:"2026-03-17",wt:212.2,bf:14.85,bmi:29.0},
  {d:"2026-03-16",wt:214.6,bf:14.58,bmi:29.3},
  {d:"2026-03-13",wt:213.2,bf:14.61,bmi:29.1},
  {d:"2026-03-12",wt:213.6,bf:14.82,bmi:29.2},
  {d:"2026-03-11",wt:214.3,bf:14.73,bmi:29.3},
  {d:"2026-03-10",wt:215.1,bf:14.75,bmi:29.4},
  {d:"2026-03-09",wt:216.8,bf:14.87,bmi:29.6},
  {d:"2026-03-06",wt:213.5,bf:15.42,bmi:29.2},
  {d:"2026-03-05",wt:213.8,bf:15.67,bmi:29.2},
  {d:"2026-03-04",wt:215.3,bf:15.97,bmi:29.4},
  {d:"2026-03-03",wt:214.0,bf:15.97,bmi:29.2},
  {d:"2026-03-02",wt:215.5,bf:15.33,bmi:29.4},
  {d:"2026-02-27",wt:214.1,bf:15.73,bmi:29.3},
  {d:"2026-02-26",wt:215.5,bf:15.9,bmi:29.4},
  {d:"2026-02-25",wt:215.4,bf:15.91,bmi:29.4},
  {d:"2026-02-24",wt:214.0,bf:15.57,bmi:29.2},
  {d:"2026-02-23",wt:216.1,bf:15.47,bmi:29.5},
  {d:"2026-02-22",wt:218.3,bf:15.17,bmi:29.8},
  {d:"2026-02-20",wt:217.6,bf:15.22,bmi:29.7},
  {d:"2026-02-19",wt:219.5,bf:15.02,bmi:30.0},
  {d:"2026-02-18",wt:222.7,bf:14.64,bmi:30.4},
  {d:"2026-02-10",wt:219.1,bf:15.14,bmi:30.0},
  {d:"2026-02-06",wt:216.2,bf:15.8,bmi:29.5},
  {d:"2026-02-05",wt:217.6,bf:15.74,bmi:29.7},
  {d:"2026-02-02",wt:219.9,bf:15.45,bmi:30.0},
  {d:"2026-01-30",wt:215.4,bf:16.03,bmi:29.4},
  {d:"2026-01-29",wt:215.4,bf:16.16,bmi:29.4}
];
// ImportPage saves CSV rows to "vital_hume_imported". They are merged here
// so HUME_DATA[0] always reflects the most recent weigh-in available.
(()=>{
  try {
    const stored = localStorage.getItem("vital_hume_imported");
    if(!stored) return;
    const imported = JSON.parse(stored);
    if(!Array.isArray(imported) || imported.length === 0) return;
    const existingDates = new Set(imported.map(r=>r.d));
    const merged = [
      ...imported,
      ...HUME_DATA.filter(r=>!existingDates.has(r.d)),
    ];
    merged.sort((a,b)=>b.d.localeCompare(a.d));
    HUME_DATA.length = 0;
    merged.forEach(r=>HUME_DATA.push(r));
  } catch(e){}
})();

// CardioCoach RMR
const RMR = { measured:1858, lifestyle:1300, exercise:232, total:3390, maintenanceLow:1858, maintenanceHigh:3158, weightLossLow:1488, weightLossHigh:1858, comparison:"NORMAL (-8%)", rer:0.85 };

// LATEST — weight from most recent Hume Pod scan (daily), body comp from DXA (gold standard)
const _humeLatest    = HUME_DATA.length > 0 ? HUME_DATA[0] : null;
const _humeOldest7   = HUME_DATA.length >= 7 ? HUME_DATA[6] : HUME_DATA[HUME_DATA.length-1];
const _importedStored= (()=>{ try{ return !!localStorage.getItem("vital_hume_imported"); }catch(e){ return false; }})();

const LATEST = {
  weight:       _humeLatest ? _humeLatest.wt : 216,
  weightDate:   _humeLatest ? _humeLatest.d  : "2026-01-23",
  weightSource: _importedStored ? "Hume (imported)" : "Hume Pod",
  weight7dAgo:  _humeOldest7 ? _humeOldest7.wt : null,
  weight7dDelta:(_humeLatest && _humeOldest7) ? +(_humeLatest.wt - _humeOldest7.wt).toFixed(1) : null,
  bodyFat:26.4, fatMass:56.47, leanMass:149.81, bmi:29.3,
  bmr:1993, healthRisk:0, waistAbd:34.7, waistNarrow:32.9, hip:41.0, chest:41.0,
};
// Two complete panels — BioLab draws Feb 14 2025 and May 23 2025
// LABS (current) = May 23 2025 — the source of truth for all scoring and analysis
// LABS_PRIOR = Feb 14 2025 — retained only for trend deltas
// LABS        = Jan 15, 2026 · ExamOne/Quest (MOST RECENT — lipid/metabolic/liver screen)
// LABS_PRIOR  = May 23, 2025 · BioLab (full panel — hormones, HbA1c, ferritin, CRP, ApoB)
// LABS_PRIOR2 = Feb 14, 2025 · BioLab (baseline)
// Scoring and clinical analysis anchor to the most recent available data per domain.

const LABS_PRIOR2 = {
  date: "Feb 14, 2025", source:"BioLab",
  panels: {
    metabolic: [
      { name:"Glucose",     val:92,    unit:"mg/dL",  range:"65–99",    status:"normal" },
      { name:"BUN",         val:17.0,  unit:"mg/dL",  range:"8.9–20.6", status:"normal" },
      { name:"Creatinine",  val:1.08,  unit:"mg/dL",  range:"0.75–1.25",status:"normal" },
      { name:"eGFR",        val:80,    unit:"mL/min",  range:">60",      status:"normal" },
      { name:"ALT/SGPT",    val:39,    unit:"U/L",     range:"0–45",     status:"normal" },
      { name:"AST/SGOT",    val:22,    unit:"U/L",     range:"5–34",     status:"normal" },
      { name:"HbA1c",       val:5.3,   unit:"%",       range:"<5.7",     status:"normal" },
    ],
    lipids: [
      { name:"Total Cholesterol",val:162, unit:"mg/dL", range:"<200",  status:"normal" },
      { name:"Triglycerides",    val:183, unit:"mg/dL", range:"0–150", status:"high"   },
      { name:"HDL",              val:38,  unit:"mg/dL", range:"≥40",   status:"low"    },
      { name:"LDL (calc)",       val:87,  unit:"mg/dL", range:"<100",  status:"normal" },
      { name:"Chol/HDL Ratio",   val:4.3, unit:"ratio", range:"0–5.0", status:"normal" },
      { name:"CRP-Cardiac",      val:0.9, unit:"mg/L",  range:"0–3.0", status:"normal" },
    ],
    hormones: [
      { name:"Testosterone (Total)", val:342.0, unit:"ng/dL",  range:"300–890",    status:"normal" },
      { name:"Free Testosterone",    val:6.40,  unit:"ng/dL",  range:"4.26–16.4",  status:"normal" },
      { name:"DHEA-S",               val:398.0, unit:"µg/dL",  range:"136–447",    status:"normal" },
      { name:"TSH",                  val:1.30,  unit:"µIU/mL", range:"0.35–4.94",  status:"normal" },
      { name:"Vitamin D",            val:26.5,  unit:"ng/mL",  range:"30–100",     status:"low"    },
    ],
    special: [
      { name:"Ferritin",      val:394.5, unit:"ng/mL",  range:"21.8–274.7",status:"high"   },
      { name:"Vitamin D",     val:26.5,  unit:"ng/mL",  range:"30–100",    status:"low"    },
      { name:"Homocysteine",  val:12.3,  unit:"µmol/L", range:"5.5–16.2",  status:"normal" },
      { name:"PSA",           val:0.845, unit:"ng/mL",  range:"0–4.0",     status:"normal" },
    ],
  },
};
const LABS_PRIOR = {
  date: "May 23, 2025", source:"BioLab",
  panels: {
    metabolic: [
      { name:"Glucose",     val:84,    unit:"mg/dL",  range:"65–99",    status:"normal", prev:92  },
      { name:"BUN",         val:21.0,  unit:"mg/dL",  range:"8.9–20.6", status:"high",   prev:17.0},
      { name:"Creatinine",  val:1.1,   unit:"mg/dL",  range:"0.75–1.25",status:"normal", prev:1.08},
      { name:"eGFR",        val:77,    unit:"mL/min",  range:">60",      status:"normal", prev:80  },
      { name:"Sodium",      val:135,   unit:"mmol/L",  range:"136–145",  status:"low",    prev:139 },
      { name:"ALT/SGPT",    val:28,    unit:"U/L",     range:"0–45",     status:"normal", prev:39  },
      { name:"AST/SGOT",    val:26,    unit:"U/L",     range:"5–34",     status:"normal", prev:22  },
      { name:"HbA1c",       val:5.3,   unit:"%",       range:"<5.7",     status:"normal", prev:5.3 },
    ],
    lipids: [
      { name:"Total Cholesterol",val:139, unit:"mg/dL", range:"<200",  status:"normal", prev:162 },
      { name:"Triglycerides",    val:66,  unit:"mg/dL", range:"0–150", status:"normal", prev:183 },
      { name:"HDL",              val:60,  unit:"mg/dL", range:"≥40",   status:"normal", prev:38  },
      { name:"LDL (calc)",       val:64,  unit:"mg/dL", range:"<100",  status:"normal", prev:87  },
      { name:"Chol/HDL Ratio",   val:2.3, unit:"ratio", range:"0–5.0", status:"normal", prev:4.3 },
      { name:"CRP-Cardiac",      val:0.1, unit:"mg/L",  range:"0–3.0", status:"normal", prev:0.9 },
      { name:"ApoB",             val:66,  unit:"mg/dL", range:"49–173",status:"normal", prev:null},
    ],
    hormones: [
      { name:"Testosterone (Total)", val:377.1, unit:"ng/dL",  range:"300–890",    status:"normal", prev:342.0},
      { name:"Free Testosterone",    val:6.99,  unit:"ng/dL",  range:"4.26–16.4",  status:"normal", prev:6.40 },
      { name:"SHBG",                 val:34,    unit:"nmol/L",  range:"13.3–89.5",  status:"normal", prev:32   },
      { name:"DHEA-S",               val:460.3, unit:"µg/dL",  range:"136–447",    status:"high",   prev:398.0},
      { name:"TSH",                  val:1.21,  unit:"µIU/mL", range:"0.35–4.94",  status:"normal", prev:1.30 },
      { name:"Vitamin D",            val:36.5,  unit:"ng/mL",  range:"30–100",     status:"normal", prev:26.5 },
      { name:"Estradiol",            val:36,    unit:"pg/mL",  range:"11–44",      status:"normal", prev:null },
      { name:"Cortisol",             val:9.1,   unit:"µg/dL",  range:"3.7–19.4",  status:"normal", prev:null },
    ],
    special: [
      { name:"Ferritin",      val:178.2, unit:"ng/mL",  range:"21.8–274.7",status:"normal", prev:394.5},
      { name:"Vitamin D",     val:36.5,  unit:"ng/mL",  range:"30–100",    status:"normal", prev:26.5 },
      { name:"DHEA-S",        val:460.3, unit:"µg/dL",  range:"136–447",   status:"high",   prev:398.0},
      { name:"Homocysteine",  val:10.2,  unit:"µmol/L", range:"5.5–16.2",  status:"normal", prev:12.3 },
      { name:"PSA",           val:0.766, unit:"ng/mL",  range:"0–4.0",     status:"normal", prev:0.845},
    ],
  },
};
// Lipid/metabolic/liver screen — no hormones, HbA1c, ferritin, or CRP in this panel.
// For those domains, LABS_PRIOR (May 23 BioLab) remains the most recent source.
const LABS = {
  date: "Jan 15, 2026",
  source: "ExamOne / Quest",
  note: "Lipid, metabolic & liver screen. Hormones, HbA1c, CRP, ApoB not drawn — see May 23 BioLab for those.",
  outOfRange: [
    { name:"Albumin",  val:5.5,  unit:"g/dL",  range:"3.8–5.2", status:"high",
      note:"Mildly elevated — commonly seen in well-hydrated athletes with high protei" },
    { name:"BMI",      val:29.4, unit:"",       range:"18.5–24.9",status:"high",
      note:"Reflects current weight 217 lbs. DXA (Jan 23, 2026) provides the gold-stan" },
  ],
  panels: {
    metabolic: [
      { name:"Glucose",           val:97,   unit:"mg/dL",  range:"60–109",   status:"normal", prev:84   },
      { name:"BUN",               val:16,   unit:"mg/dL",  range:"9–25",     status:"normal", prev:21.0,
        note:"BUN now fully normal — was mildly high in May '25 (21.0). Likely protein i" },
      { name:"Creatinine",        val:1.0,  unit:"mg/dL",  range:"0.7–1.5",  status:"normal", prev:1.1  },
      { name:"Total Protein",     val:8.1,  unit:"g/dL",   range:"6.1–8.2",  status:"normal", prev:null },
      { name:"Albumin",           val:5.5,  unit:"g/dL",   range:"3.8–5.2",  status:"high",   prev:null },
      { name:"Globulin",          val:2.6,  unit:"g/dL",   range:"1.9–3.7",  status:"normal", prev:null },
      { name:"Blood Glucose",     val:97,   unit:"mg/dL",  range:"60–109",   status:"normal", prev:84   },
    ],
    lipids: [
      { name:"Total Cholesterol", val:149,  unit:"mg/dL",  range:"140–199",  status:"normal", prev:139  },
      { name:"Triglycerides",     val:80,   unit:"mg/dL",  range:"0–150",    status:"normal", prev:66   },
      { name:"HDL",               val:62,   unit:"mg/dL",  range:"35–80",    status:"normal", prev:60   },
      { name:"LDL",               val:71,   unit:"mg/dL",  range:"0–129",    status:"normal", prev:64   },
      { name:"Chol/HDL Ratio",    val:2.4,  unit:"ratio",  range:"0–4.99",   status:"normal", prev:2.3  },
      { name:"LDL/HDL Ratio",     val:1.15, unit:"ratio",  range:"0.9–5.3",  status:"normal", prev:null },
    ],
    cbc: [],
    liver: [
      { name:"Alkaline Phosphatase",val:48, unit:"U/L",    range:"30–125",   status:"normal", prev:null },
      { name:"Total Bilirubin",     val:0.8,unit:"mg/dL",  range:"0.2–1.5",  status:"normal", prev:null },
      { name:"AST",                 val:21, unit:"U/L",    range:"0–33",     status:"normal", prev:26   },
      { name:"ALT",                 val:24, unit:"U/L",    range:"0–45",     status:"normal", prev:28   },
      { name:"GGT",                 val:12, unit:"U/L",    range:"0–65",     status:"normal", prev:null },
    ],
    hormones: [],
    special:  [],
  },
  physical: {
    weight: 217, weightUnit:"lbs",
    height: "6ft 0in",
    bmi: 29.4,
    bp: "121/79", pulse: 46,
  },
};
// LABS_MERGED: Jan 2026 (lipids/metabolic/liver) + May 2025 (hormones/special/HbA1c/ApoB/CRP)
// notRedrawn flag = true means value is from May 2025, not redrawn in Jan 2026
const LABS_MERGED = {
  date: "Jan 15, 2026",
  panels: {
    metabolic: [
      ...LABS.panels.metabolic,
      { name:"HbA1c",         val:5.3,  unit:"%",     range:"<5.7",   status:"normal", prev:5.3,  notRedrawn:true, drawDate:"May 23, 2025" },
      { name:"eGFR",          val:77,   unit:"mL/min", range:">60",   status:"normal", prev:80,   notRedrawn:true, drawDate:"May 23, 2025" },
    ],
    lipids: [
      ...LABS.panels.lipids,
      { name:"CRP-Cardiac",   val:0.1,  unit:"mg/L",  range:"0–3.0",  status:"normal", prev:0.9,  notRedrawn:true, drawDate:"May 23, 2025" },
      { name:"ApoB",          val:66,   unit:"mg/dL", range:"49–173", status:"normal", prev:null, notRedrawn:true, drawDate:"May 23, 2025" },
    ],
    liver:    [...LABS.panels.liver],
    hormones: LABS_PRIOR.panels.hormones.map(b=>({...b, notRedrawn:true, drawDate:"May 23, 2025"})),
    special:  LABS_PRIOR.panels.special.map(b=>({...b,  notRedrawn:true, drawDate:"May 23, 2025"})),
    cbc:      [],
  },
};


// WHOOP (sample)
// WHOOP real data — latest cycle Mar 19 2026, avg last 90 days
const WHOOP = {
  recovery: 87,    // Mar 23 2026 — screenshot
  hrv:      52,    // Mar 23 (vs 48 30d avg) — above baseline, +9%
  rhr:      49,    // Mar 23 (vs 51 30d avg) — excellent
  strain:   0,     // no workout logged yet today
  spo2:     95,
  skinTemp: 0.0,
  sleep:{ score:100, hours:8.70, eff:99, hoursVsNeeded:100, consistency:91, stressHigh:0, rem:2.75, deep:2.52, light:3.43, awake:0.13, resp:14.2 }, // Mar 23 — 9:36PM–6:26AM
};

function gT(base,mn,mx,d,days=30) {
  let v=base;
  return Array.from({length:days},(_,i)=>{
    const dt=new Date(); dt.setDate(dt.getDate()-(days-1-i));
    v=Math.round(Math.max(mn,Math.min(mx,v+(Math.random()-.47)*d))*10)/10;
    return {d:dt.toLocaleDateString("en-US",{month:"short",day:"numeric"}),v};
  });
}
// Real WHOOP 30-day daily data (Mar 19 → Feb 19, 2026)
const T = {
  hrv: [
    {d:"Feb 19",v:39},{d:"Feb 20",v:50},{d:"Feb 21",v:36},{d:"Feb 22",v:39},{d:"Feb 23",v:42},
    {d:"Feb 24",v:48},{d:"Feb 25",v:40},{d:"Feb 26",v:42},{d:"Feb 27",v:45},{d:"Feb 28",v:110},
    {d:"Mar 1", v:51},{d:"Mar 2", v:50},{d:"Mar 3", v:50},{d:"Mar 4", v:60},{d:"Mar 5", v:58},
    {d:"Mar 6", v:64},{d:"Mar 7", v:40},{d:"Mar 8", v:41},{d:"Mar 9", v:45},{d:"Mar 10",v:45},
    {d:"Mar 11",v:42},{d:"Mar 12",v:41},{d:"Mar 13",v:40},{d:"Mar 14",v:38},{d:"Mar 15",v:44},
    {d:"Mar 16",v:50},{d:"Mar 17",v:44},{d:"Mar 18",v:43},{d:"Mar 19",v:45},{d:"Mar 21",v:43},
  ],
  rec: [
    {d:"Feb 19",v:65},{d:"Feb 20",v:89},{d:"Feb 21",v:52},{d:"Feb 22",v:65},{d:"Feb 23",v:75},
    {d:"Feb 24",v:89},{d:"Feb 25",v:62},{d:"Feb 26",v:75},{d:"Feb 27",v:77},{d:"Feb 28",v:89},
    {d:"Mar 1", v:98},{d:"Mar 2", v:95},{d:"Mar 3", v:93},{d:"Mar 4", v:98},{d:"Mar 5", v:98},
    {d:"Mar 6", v:98},{d:"Mar 7", v:54},{d:"Mar 8", v:49},{d:"Mar 9", v:60},{d:"Mar 10",v:62},
    {d:"Mar 11",v:62},{d:"Mar 12",v:60},{d:"Mar 13",v:57},{d:"Mar 14",v:44},{d:"Mar 15",v:69},
    {d:"Mar 16",v:86},{d:"Mar 17",v:67},{d:"Mar 18",v:62},{d:"Mar 19",v:69},{d:"Mar 21",v:69},
  ],
  rhr: [
    {d:"Feb 19",v:51},{d:"Feb 20",v:53},{d:"Feb 21",v:53},{d:"Feb 22",v:53},{d:"Feb 23",v:50},
    {d:"Feb 24",v:50},{d:"Feb 25",v:51},{d:"Feb 26",v:50},{d:"Feb 27",v:52},{d:"Feb 28",v:53},
    {d:"Mar 1", v:49},{d:"Mar 2", v:48},{d:"Mar 3", v:48},{d:"Mar 4", v:49},{d:"Mar 5", v:51},
    {d:"Mar 6", v:54},{d:"Mar 7", v:60},{d:"Mar 8", v:51},{d:"Mar 9", v:50},{d:"Mar 10",v:50},
    {d:"Mar 11",v:50},{d:"Mar 12",v:51},{d:"Mar 13",v:51},{d:"Mar 14",v:52},{d:"Mar 15",v:52},
    {d:"Mar 16",v:49},{d:"Mar 17",v:50},{d:"Mar 18",v:50},{d:"Mar 19",v:50},{d:"Mar 21",v:49},
  ],
  str: [
    {d:"Feb 19",v:10},{d:"Feb 20",v:11},{d:"Feb 21",v:12},{d:"Feb 22",v:9},{d:"Feb 23",v:14},
    {d:"Feb 24",v:13},{d:"Feb 25",v:11},{d:"Feb 26",v:10},{d:"Feb 27",v:12},{d:"Feb 28",v:8},
    {d:"Mar 1", v:15},{d:"Mar 2", v:13},{d:"Mar 3", v:12},{d:"Mar 4", v:14},{d:"Mar 5", v:13},
    {d:"Mar 6", v:11},{d:"Mar 7", v:10},{d:"Mar 8", v:12},{d:"Mar 9", v:14},{d:"Mar 10",v:13},
    {d:"Mar 11",v:15},{d:"Mar 12",v:14},{d:"Mar 13",v:12},{d:"Mar 14",v:13},{d:"Mar 15",v:10},
    {d:"Mar 16",v:14},{d:"Mar 17",v:12},{d:"Mar 18",v:15},{d:"Mar 19",v:11},{d:"Mar 21",v:15.6},
  ],
  slp: [
    {d:"Feb 19",v:8.1},{d:"Feb 20",v:8.8},{d:"Feb 21",v:9.4},{d:"Feb 22",v:8.5},{d:"Feb 23",v:9.1},
    {d:"Feb 24",v:8.7},{d:"Feb 25",v:9.0},{d:"Feb 26",v:8.3},{d:"Feb 27",v:8.6},{d:"Feb 28",v:9.2},
    {d:"Mar 1", v:8.9},{d:"Mar 2", v:9.5},{d:"Mar 3", v:9.1},{d:"Mar 4", v:8.8},{d:"Mar 5", v:9.3},
    {d:"Mar 6", v:8.4},{d:"Mar 7", v:9.0},{d:"Mar 8", v:8.7},{d:"Mar 9", v:9.2},{d:"Mar 10",v:8.5},
    {d:"Mar 11",v:9.0},{d:"Mar 12",v:9.3},{d:"Mar 13",v:8.6},{d:"Mar 14",v:9.1},{d:"Mar 15",v:8.8},
    {d:"Mar 16",v:9.5},{d:"Mar 17",v:9.0},{d:"Mar 18",v:8.8},{d:"Mar 19",v:9.2},{d:"Mar 21",v:9.2},
  ],
};

// Styku body fat trend (real 2 points + simulated intermediate)
// Multi-method body fat anchors (DXA + Styku = gold standard, Hume = BIA trend)
const BF_TREND = [
  {d:"Feb '25",v:23.9,src:"Styku"},{d:"May '25",v:21.1,src:"Styku"},{d:"Jan '26",v:26.4,src:"DXA"},
];
const LM_TREND = [
  {d:"Feb '25",v:151.7,src:"Styku"},{d:"May '25",v:160.3,src:"Styku"},{d:"Jan '26",v:149.8,src:"DXA"},
];
// Hume daily weight trend (BIA scale, corrected lbs)
const HUME_WT_TREND = HUME_DATA.slice().reverse().map(r=>({d:r.d.slice(5),v:r.wt}));
// Hume BF trend (BIA — offset from DXA but useful for daily direction)
const HUME_BF_TREND = HUME_DATA.slice().reverse().map(r=>({d:r.d.slice(5),v:r.bf}));

// Real sleep stage data from WHOOP (avg last 90 days)
const SLEEP_PIE=[{name:"REM",v:2.75,col:P.violet},{name:"Deep SWS",v:2.52,col:P.sage},{name:"Light",v:3.43,col:P.steel},{name:"Awake",v:0.13,col:P.muted}];
const fmtH=h=>`${Math.floor(h)}h ${Math.round((h%1)*60)}m`;
const pctOf=(v,mx)=>Math.min(100,(v/mx)*100);
const fmt=n=>typeof n==="number"?n.toLocaleString():n;
const SCORE_COLOR = s => s>=80?P.sage:s>=70?P.amber:s>=60?P.clay:P.terra;
const SCORE_GRADE = s => s>=90?"A":s>=80?"B+":s>=70?"B":s>=60?"C+":s>=50?"C":"D";
const SCORE_LABEL = s => s>=90?"Exceptional":s>=80?"Excellent":s>=70?"Good":s>=60?"Fair":s>=50?"Poor":"Critical";

const SCORES_NOW = {
  // Master = weighted avg of 7 domains
 
 
  master:       { score:71, prev:68, label:"VITAL Score",        icon:"⚡", color:P.cyan,   weight:1.0 },

  cardiovascular:{ score:75, prev:70, label:"Cardiovascular",    icon:"❤️", color:P.coral,  weight:.20,
    dataDate:"Lipids: Jan 15, 2026 · ApoB/CRP: May 23, 2025 · WHOOP 3-mo avg",
    drivers:[
      {name:"Triglycerides",        val:"80 mg/dL",  note:"Good ↓ from 183 (Feb '25) — Jan 15, 2026",       score:86, trend:"up"},
      {name:"HDL Cholesterol",      val:"62 mg/dL",  note:"Optimal ↑ from 38 (Feb '25) — Jan 15, 2026",     score:92, trend:"up"},
      {name:"LDL",                  val:"71 mg/dL",  note:"Excellent <100 — Jan 15, 2026",                  score:90, trend:"up"},
      {name:"Chol/HDL Ratio",       val:"2.4",       note:"Excellent ↓ from 4.3 (Feb '25) — Jan 15, 2026",  score:93, trend:"up"},
      {name:"ApoB",                 val:"66 mg/dL",  note:"Excellent <80 — May 23, 2025 (not redrawn)",      score:92, trend:"stable"},
      {name:"CRP-Cardiac",          val:"0.1 mg/L",  note:"Near-zero inflammation — May 23, 2025 (not redrawn)",score:98, trend:"stable"},
      {name:"HRV (3-mo avg)",       val:"43.2 ms",   note:"10-wk avg Dec–Mar — below personal mean 44.4",   score:46, trend:"flag"},
      {name:"RHR (3-mo avg)",       val:"51.0 bpm",  note:"10-wk avg — above athletic threshold of ≤49",    score:54, trend:"flag"},
    ]},

  metabolic:    { score:73, prev:73, label:"Metabolic Health",   icon:"⚗️", color:P.amber,  weight:.15,
    dataDate:"Jan 15, 2026 (metabolic) · May 23, 2025 (HbA1c) · Jan 2026 DXA",
    drivers:[
      {name:"HbA1c",             val:"5.3%",       note:"May '25 BioLab — not drawn Jan '26. No IR risk.",score:92, trend:"stable"},
      {name:"Glucose",           val:"97 mg/dL",   note:"Jan '26 — normal range, ↑ from 84 (May '25)",   score:84, trend:"stable"},
      {name:"RMR (measured)",    val:"1,858 kcal", note:"CardioCoach — −8% vs predicted",               score:78, trend:"stable"},
      {name:"ALT",               val:"24 U/L",     note:"Jan '26 — ↓ from 28 (May '25), excellent",     score:90, trend:"up"},
      {name:"AST",               val:"21 U/L",     note:"Jan '26 — ↓ from 26 (May '25), excellent",     score:90, trend:"up"},
      {name:"GGT",               val:"12 U/L",     note:"Jan '26 — very low, no alcohol or liver signal",score:95, trend:"stable"},
      {name:"Body Fat % (DXA)",  val:"26.4%",      note:"Jan 23, 2026 DXA — overfat category",          score:52, trend:"flag"},
      {name:"VAT Area (DXA)",    val:"118 cm²",    note:"Borderline — target <100 cm²",                  score:62, trend:"flag"},
    ]},

  bodyComp:     { score:58, prev:61, label:"Body Comp",   icon:"📐", color:P.violet, weight:.15,
    dataDate:"Jan 23, 2026 DXA",
    drivers:[
      {name:"Body Fat % (DXA)",  val:"26.4%",      note:"Overfat — DXA gold standard",     score:50, trend:"flag"},
      {name:"Lean Mass (DXA)",   val:"149.8 lbs",  note:"Good foundation — protect it",    score:78, trend:"stable"},
      {name:"VAT (DXA)",         val:"118 cm²",    note:"Borderline — target <100 cm²",     score:60, trend:"flag"},
      {name:"BMD T-score",       val:"+1.3",       note:"Exceptional — 111th percentile",   score:99, trend:"up"},
      {name:"Fat Mass",          val:"56.5 lbs",   note:"Reduction goal: −10 to 15 lbs",   score:48, trend:"flag"},
    ]},

  strength:     { score:76, prev:63, label:"Strength & Muscle",  icon:"💪", color:P.blue,   weight:.15,
    dataDate:"DXA Jan 2026 · Calendar + WHOOP 3-month avg",
    drivers:[
      {name:"Lean Mass (DXA)",      val:"149.8 lbs", note:"Strong absolute lean mass — Jan 2026",             score:80, trend:"stable"},
      {name:"Lean Mass %",          val:"69.4%",     note:"DXA Jan 2026 — target >72%",                      score:65, trend:"stable"},
      {name:"BMD T-score (DXA)",    val:"+1.3",      note:"Exceptional bone density — 111th percentile",      score:99, trend:"up"},
      {name:"Gym sessions (3-mo)",  val:"26 sessions",    score:82, trend:"up"},
      {name:"Weekly strain (3-mo)", val:"73.6/wk",   note:"10-wk WHOOP avg — solid training load",           score:61, trend:"stable"},
      {name:"Total sessions/wk",    val:"~3.5/wk",   note:"Gym 2× + running 1–2× — balanced block",         score:78, trend:"stable"},
    ]},

  hormonal:     { score:72, prev:66, label:"Hormonal Health",    icon:"⚗", color:P.pink,   weight:.15,
    dataDate:"May 23, 2025",
    drivers:[
      {name:"Testosterone Total", val:"377.1 ng/dL",score:62, trend:"flag"},
      {name:"Free Testosterone",  val:"6.99 ng/dL", note:"In range, lower end — ↑ from 6.40",    score:65, trend:"up"},
      {name:"TSH",                val:"1.21 µIU/mL",note:"Optimal thyroid function",              score:92, trend:"stable"},
      {name:"DHEA-S",             val:"460.3 µg/dL",note:"↑ above range — supp working",         score:75, trend:"up"},
      {name:"Vitamin D",          val:"36.5 ng/mL", note:"Now sufficient ↑ from 26.5 (Feb '25)", score:72, trend:"up"},
      {name:"Estradiol",          val:"36 pg/mL",   note:"Mid male range — balanced",             score:80, trend:"stable"},
      {name:"Cortisol",           val:"9.1 µg/dL",  note:"Normal morning level",                 score:82, trend:"stable"},
    ]},

  longevity:    { score:82, prev:64, label:"Longevity",          icon:"♾️", color:P.green,  weight:.10,
    dataDate:"May 23, 2025",
    drivers:[
      {name:"CRP-Cardiac",        val:"0.1 mg/L",   note:"Near-zero — May 23, 2025 (not redrawn Jan '26)", score:98, trend:"stable"},
      {name:"HbA1c",              val:"5.3%",       note:"No IR — May 23, 2025 (not redrawn Jan '26)",     score:90, trend:"stable"},
      {name:"Ferritin",           val:"178.2 ng/mL",            score:85, trend:"up"},
      {name:"Homocysteine",       val:"10.2 µmol/L",              score:76, trend:"up"},
      {name:"PSA",                val:"0.766 ng/mL",      score:90, trend:"stable"},
      {name:"BMD T-score (DXA)",  val:"+1.3",       note:"Exceptional — Jan 23, 2026 DXA",               score:99, trend:"up"},
    ]},

  recovery:     { score:61, prev:79, label:"Recovery & Sleep",   icon:"🌙", color:P.violet, weight:.10,
    dataDate:"WHOOP 90-day rolling avg",
    drivers:[
      {name:"Recovery (3-mo avg)",  val:"63.9%",   note:"10-wk avg — below personal baseline 66.6%", score:64, trend:"flag"},
      {name:"HRV (3-mo avg)",       val:"43.2 ms", note:"Baseline zone — below personal mean 44.4",  score:45, trend:"flag"},
      {name:"RHR (3-mo avg)",       val:"51.0 bpm",      score:49, trend:"flag"},
      {name:"Sleep Duration (avg)", val:"8.5h",    note:"3mo avg — last night 8h 32m (95% perf, 10:02PM–6:44AM)", score:90, trend:"stable"},
      {name:"Recovery today",       val:"37%",     note:"Well below 3mo avg of 63.9% — post-high-strain day",score:37, trend:"flag"},
      {name:"HRV today",            val:"37 ms",   note:"Below 3mo avg 43.2ms — suppressed zone",    score:38, trend:"flag"},
    ]},
};

// Score history — anchored to real data points (Feb 14 labs + May 23 scan)
// Score history — anchored to real data points
// Feb 14 2025 = first real BioLab panel
// May 23 2025 = second BioLab panel (lipids, hormones, special chem dramatically improved)
// Jan 23 2026 = DXA scan updates body comp domain (BF 26.4% vs Styku 21.1%)
// Mar 21 2026 = WHOOP live (recovery domain uses current values)
// Score history anchored to real lab draws + DXA + WHOOP
// Feb 14 '25 = BioLab #1 · May 23 '25 = BioLab #2 · Jan 15 '26 = ExamOne · Jan 23 '26 = DXA · Mar '26 = WHOOP live
const SCORE_HISTORY = [
  {d:"Nov '24", master:62, cardiovascular:68, metabolic:70, bodyComp:55, strength:58, hormonal:60, longevity:60, recovery:76},
  {d:"Feb '25", master:68, cardiovascular:70, metabolic:73, bodyComp:61, strength:63, hormonal:66, longevity:64, recovery:79},
  {d:"May '25", master:76, cardiovascular:92, metabolic:74, bodyComp:65, strength:73, hormonal:72, longevity:82, recovery:80},
  {d:"Jan '26", master:76, cardiovascular:92, metabolic:74, bodyComp:58, strength:75, hormonal:72, longevity:82, recovery:72},
  {d:"Mar '26", master:71, cardiovascular:92, metabolic:74, bodyComp:58, strength:75, hormonal:72, longevity:82, recovery:72},
];
// Note: Body comp score drops in Jan 2026 because DXA (gold standard) shows 26.4% BF
// vs Styku 3D optical estimate of 21.1% from May 2025 — methods differ significantly.
// Recovery domain uses live WHOOP (today 69%) vs prior estimated averages.

/* --- METABOLIC AGE MODEL ----------------------------------------
 * Perceived Metabolic Age draws from 7 biomarker domains.
 * Chronological age: 47. Each domain shifts the perceived age ±.
 * Lower = biologically younger. Sources: BioLab May 23, Styku May 23, CardioCoach, WHOOP.
 */
const METABOLIC_AGE = (() => {
  const chrono = 47;
 
  const factors = [
    { label:"Cardiovascular",  delta:-7.2, note:"CRP <0.2, TG 66, HDL 60, RHR 52",       color:P.terra,  icon:"❤" },
    { label:"Metabolic",       delta:-3.4, note:"HbA1c 5.2%, glucose 84, BMR 1858",       color:P.amber,  icon:"⚗" },
    { label:"Body Comp",delta:+1.8, note:"BF 21.1% — Average tier for 47yo",       color:P.clay,   icon:"📐" },
    { label:"Musculoskeletal", delta:-2.6, note:"+8.6 lbs lean mass, skeletal 75.6%",     color:P.sage,   icon:"💪" },
    { label:"Hormonal",        delta:+1.2, note:"Testosterone 377 ng/dL — lower-mid",     color:P.violet, icon:"⚗" },
    { label:"Recovery/CNS",    delta:-3.8, note:"HRV 67ms, sleep eff 91%, RHR 52",        color:P.steel,  icon:"🌙" },
    { label:"Longevity Markers",delta:-1.4, color:P.sage,   icon:"♾" },
  ];
  const totalDelta = factors.reduce((s,f) => s + f.delta, 0);
  const perceived = Math.round((chrono + totalDelta) * 10) / 10;
 
  const history = [
    {d:"Feb '23", age:43.8},
    {d:"Aug '24", age:42.6},
    {d:"Feb 14",  age:41.9},
    {d:"May 23",  age:41.5},
  ];
  return { chrono, perceived, delta: +(chrono - perceived).toFixed(1), factors, history };
})();

const EMPTY_PELO = {total:0,byDisc:{},recent:[],totalOutput:0,totalCals:0,avgHR:0,avgOutput:0,trend:[],allWorkouts:[]};
function usePelo() { return EMPTY_PELO; }

// Easing: cubic ease-out
function easeOut(t){ return 1-Math.pow(1-t,3); }
// Easing: spring-like overshoot for rings
function easeSpring(t){ return 1-Math.pow(1-t,4)*Math.cos(t*Math.PI*2.2); }

// Animated number (decimal-safe)
function useAnimNum(target,dur=900,ease=easeOut){
  const [val,set]=useState(0);
  useEffect(()=>{
    let st=null,raf;
    const step=ts=>{
      if(!st)st=ts;
      const p=Math.min(1,(ts-st)/dur);
      set(Math.round(ease(p)*target*10)/10);
      if(p<1)raf=requestAnimationFrame(step);
    };
    raf=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(raf);
  },[target,dur]);
  return val;
}

// Animated integer count-up
function useCountUp(target,dur=1100,ease=easeOut){
  const [v,setV]=useState(0);
  useEffect(()=>{
    let st=null,raf;
    const step=ts=>{
      if(!st)st=ts;
      const p=Math.min(1,(ts-st)/dur);
      setV(Math.round(ease(p)*target));
      if(p<1)raf=requestAnimationFrame(step);
    };
    raf=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(raf);
  },[target,dur]);
  return v;
}

// Animated 0→value for SVG strokeDasharray (smooth ring fill)
function useAnimRing(target,dur=1000,delay=0,ease=easeSpring){
  const [v,setV]=useState(0);
  useEffect(()=>{
    let st=null,raf;
    const delayed=ts=>{
      if(!st)st=ts+delay;
      if(ts<st){raf=requestAnimationFrame(delayed);return;}
      const p=Math.min(1,(ts-st)/dur);
      setV(ease(p)*target);
      if(p<1)raf=requestAnimationFrame(delayed);
    };
    raf=requestAnimationFrame(delayed);
    return()=>cancelAnimationFrame(raf);
  },[target,dur,delay]);
  return v;
}

// Animated 0→value for progress bars
function useAnimBar(target,dur=800,delay=0){
  const [v,setV]=useState(0);
  useEffect(()=>{
    let st=null,raf;
    const run=ts=>{
      if(!st)st=ts+delay;
      if(ts<st){raf=requestAnimationFrame(run);return;}
      const p=Math.min(1,(ts-st)/dur);
      setV(easeOut(p)*target);
      if(p<1)raf=requestAnimationFrame(run);
    };
    raf=requestAnimationFrame(run);
    return()=>cancelAnimationFrame(raf);
  },[target,dur,delay]);
  return v;
}

function Spark({data,color,height=40}){
  const safeId="s"+color.replace(/[^a-zA-Z0-9]/g,"");
  return(<ResponsiveContainer width="100%" height={height}><AreaChart data={data} margin={{top:2,right:0,left:0,bottom:0}}><defs><linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={.2}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${safeId})`} dot={false} isAnimationActive={false}/></AreaChart></ResponsiveContainer>);
}

function Ring({value,max=100,color,size=60,stroke=5,label}){
  const r=(size-stroke*2)/2,circ=2*Math.PI*r,dash=circ*(value/max),gap=circ-dash;
  return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={P.border} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 4px ${color}88)`,transition:"stroke-dasharray .8s ease"}}/>
    </svg>
    {label&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.m,fontSize:10,fontWeight:600,color}}>{label}</div>}
  </div>);
}

function StatCard({icon,label,value,unit,color,delta,sparkData,dark,sub}){
  const n=parseFloat(value)||0;const a=useAnimNum(n);const disp=Number.isInteger(n)?Math.round(a):a.toFixed(1);
  const bg=dark?P.cardDk:P.card;const bd=dark?P.borderDk:P.border;const txt=dark?P.textInv:P.text;const st=dark?P.mutedDk:P.sub;
  const dPos=delta>=0;const dCol=dPos?"#3A5C48":"#C4604A";const dBg=dPos?"#EBF0EC":"#FDF1EE";
  return(<div style={{background:bg,border:"none",borderRadius:14,padding:"16px 18px",position:"relative",overflow:"hidden",cursor:"default",transition:"all .25s",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.10)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.06)";}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
      <span style={{fontSize:18,lineHeight:1,opacity:.85}}>{icon}</span>
      {delta!=null&&<span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:dCol,background:dBg,padding:"2px 7px",borderRadius:99,letterSpacing:"0.02em"}}>{dPos?"+":""}{delta}%</span>}
    </div>
    <div style={{fontFamily:FF.r,fontSize:38,fontWeight:600,color:txt,lineHeight:1,marginBottom:1,letterSpacing:"-0.01em"}}>{disp}<span style={{fontSize:14,fontWeight:400,color:st,marginLeft:4,fontFamily:FF.s}}>{unit}</span></div>
    <div style={{fontFamily:FF.s,fontSize:11,fontWeight:400,color:st,letterSpacing:"0.01em"}}>{label}</div>
    {sub&&<div style={{fontFamily:FF.s,fontSize:9,color:st,opacity:0.7,marginBottom:sparkData?8:0}}>{sub}</div>}
    {sparkData&&<Spark data={sparkData.slice(-14)} color={color}/>}
  </div>);
}

function SLabel({children,color=P.sage,right,dark}){
  const t=dark?P.mutedDk:P.sub;const r=dark?P.mutedDk:P.muted;
  return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
    <span style={{fontFamily:FF.s,fontSize:10,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:t}}>{children}</span>
    {right&&<span style={{fontFamily:FF.s,fontSize:10,color:r}}>{right}</span>}
  </div>);
}

function CTip({active,payload,label}){
  if(!active||!payload?.length)return null;
  return(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,padding:"10px 14px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}>
    <div style={{color:P.muted,fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
    {payload.map(p=><div key={p.name} style={{display:"flex",gap:8,marginBottom:2}}>
      <span style={{color:P.sub,minWidth:60}}>{p.name}</span>
      <span style={{fontFamily:FF.m,fontWeight:500,color:P.text}}>{p.value}</span>
    </div>)}
  </div>);
}

function StatusBadge({status}){
  const c=status==="high"?P.terra:status==="low"?P.amber:P.sage;
  const l=status==="high"?"High":status==="low"?"Low":"Optimal";
  return <span style={{fontFamily:FF.s,fontSize:9,fontWeight:500,color:c,background:c+"15",padding:"2px 8px",borderRadius:99,letterSpacing:"0.01em"}}>{l}</span>;
}

function BioCard({name,val,unit,range,status,prev,note,drawDate,notRedrawn}){
  const c=status==="high"?P.terra:status==="low"?P.amber:P.sage;
  const bgC=status==="high"?P.terracottaBg:status==="low"?P.amberBg:P.card;
  const bdC=notRedrawn?"rgba(196,120,48,0.2)":status==="high"?"#C4604A33":status==="low"?"#C4783033":P.border;
  const delta = (prev!=null && typeof val==="number" && typeof prev==="number")
    ? +(val-prev).toFixed(1) : null;
  const deltaColor = delta===null ? P.muted
    : status==="high" ? (delta>0 ? P.terra : P.sage)
    : status==="low"  ? (delta<0 ? P.terra : P.sage)
    : P.muted;
  const deltaArrow = delta===null ? "" : delta>0 ? "↑" : delta<0 ? "↓" : "→";
  // Short date label: "Jan '26" or "May '25"
  const dateLabel = drawDate
    ? drawDate.replace("Jan 15, 2026","Jan '26").replace("May 23, 2025","May '25")
    : null;
  return(<div style={{padding:"12px 13px",background:bgC,borderRadius:12,border:`1px solid ${bdC}`,boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
      <span style={{fontFamily:FF.s,fontSize:9,fontWeight:400,color:P.sub,lineHeight:1.3,maxWidth:"75%"}}>{name}</span>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
        <StatusBadge status={status}/>
        {dateLabel&&<span style={{fontFamily:FF.m,fontSize:7,color:notRedrawn?P.amber:P.muted,letterSpacing:"0.04em",fontWeight:notRedrawn?600:400}}>{dateLabel}{notRedrawn?" *":""}</span>}
      </div>
    </div>
    <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:3}}>
      <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color:c,lineHeight:1,letterSpacing:"-0.01em"}}>{val}<span style={{fontSize:10,color:P.muted,marginLeft:2,fontFamily:FF.s,fontWeight:400}}>{unit}</span></div>
      {delta!==null&&<div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:deltaColor,letterSpacing:"0.02em"}}>{deltaArrow} {Math.abs(delta)}<span style={{fontFamily:FF.s,fontSize:7,color:P.muted,marginLeft:1}}>vs prior</span></div>}
    </div>
    {range&&<div style={{fontFamily:FF.s,fontSize:8,color:P.muted,letterSpacing:"0.01em"}}>Ref {range}</div>}
    {notRedrawn&&<div style={{fontFamily:FF.s,fontSize:7.5,color:P.amber,marginTop:3,lineHeight:1.4}}>* Not drawn in Jan '26 — most recent available</div>}
    {note&&status!=="normal"&&<div style={{fontFamily:FF.s,fontSize:8,color:c,marginTop:4,lineHeight:1.45,opacity:0.85}}>{note}</div>}
  </div>);
}

// Animated rotated arc (for stacked zone donuts)
function AnimRingArc({cx,cy,r,sw,color,dash,gap,rot,delay=0}){
  const circ=2*Math.PI*r;
  const animD=useAnimRing(dash,1100,delay,easeOut);
  return(<circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
    strokeDasharray={`${Math.max(0,animD)} ${Math.max(0,gap+(dash-animD))}`} strokeLinecap="butt"
    style={{transform:`rotate(${rot*360-90}deg)`,transformOrigin:`${cx}px ${cy}px`}}/>);
}

// Inline animated ring helper (for one-off rings not using Ring component)
function AnimRing({cx,cy,r,stroke,sw,pct,color,delay=0}){
  const circ=2*Math.PI*r;
  const animD=useAnimRing(circ*pct,1200,delay,easeSpring);
  return(<circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
    strokeDasharray={`${Math.max(0,animD)} ${Math.max(0,circ-animD)}`} strokeLinecap="round"/>);
}

function MasterRing({score,size=200,stroke=10}){
  const r=(size-stroke*2)/2,circ=2*Math.PI*r;
  const dash=circ*(score/100),gap=circ-dash;
  const col=SCORE_COLOR(score);
  const displayed=useCountUp(score);
  // Map score color to warm palette
  const warmCol=col===P.green?P.sage:col===P.cyan?P.sage:col===P.amber?P.amber:col===P.coral?P.terra:P.sage;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={P.panel} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={warmCol} strokeWidth={stroke}
          strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontFamily:FF.r,fontSize:72,fontWeight:600,color:P.text,lineHeight:1,letterSpacing:"-0.02em"}}>{displayed}</div>
        <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:4}}>out of 100</div>
        <div style={{marginTop:8,padding:"4px 14px",borderRadius:99,background:warmCol+"18",fontFamily:FF.s,fontSize:11,fontWeight:500,color:warmCol,letterSpacing:"0.02em"}}>{SCORE_LABEL(score)}</div>
      </div>
    </div>
  );
}

function SubScoreCard({data,onClick,active}){
  const {score,prev,label,icon,color,dataDate,drivers,freshness}=data;
  const delta=score-prev;
  const col=SCORE_COLOR(score);
  const displayed=useCountUp(score);
  return(
    <div onClick={onClick} style={{
      background:active?col+"0E":P.card,
      border:`1.5px solid ${active?col+"88":P.border}`,
      borderRadius:14,padding:"16px 18px",cursor:"pointer",transition:"all .18s",
      boxShadow:active?`0 4px 16px ${col}22`:"0 1px 3px rgba(0,0,0,.04)",
    }}
      onMouseEnter={e=>{if(!active){e.currentTarget.style.background=P.panel;e.currentTarget.style.borderColor=col+"44";}}}
      onMouseLeave={e=>{if(!active){e.currentTarget.style.background=P.card;e.currentTarget.style.borderColor=P.border;}}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
        <div style={S.row8}>
          <div style={{width:32,height:32,borderRadius:9,background:col+"16",border:`1px solid ${col}30`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
            {icon}
          </div>
          <div>
            <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:active?col:P.text,lineHeight:1.2}}>{label}</div>
            {dataDate&&<div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:2,letterSpacing:"0.03em"}}>{dataDate}</div>}
          </div>
        </div>
        <div style={{padding:"3px 8px",borderRadius:99,flexShrink:0,
          background:delta>0?P.sage+"18":delta<0?P.terra+"18":"rgba(0,0,0,0.04)",
          border:`1px solid ${delta>0?P.sage+"44":delta<0?P.terra+"44":P.border}`}}>
          <span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,
            color:delta>0?P.sage:delta<0?P.terra:P.muted}}>
            {delta>0?`+${delta}`:delta===0?"—":delta} pts
          </span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}>
        <div style={{fontFamily:FF.r,fontSize:42,fontWeight:600,color:col,lineHeight:1,letterSpacing:"-0.02em"}}>
          {displayed}
        </div>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:1}}>/100</div>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:col}}>{SCORE_LABEL(score)}</div>
        </div>
      </div>
      <div style={{height:5,borderRadius:3,overflow:"hidden",background:P.panel}}>
        <div style={{height:"100%",width:`${score}%`,background:`linear-gradient(to right,${col}cc,${col})`,
          borderRadius:3,transition:"width 1s cubic-bezier(0.34,1.1,0.64,1)"}} />
      </div>
      {drivers&&drivers.length>0&&<div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>Top driver</span>
        <span style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text}}>{drivers[0].name}: {drivers[0].value}</span>
      </div>}
      {freshness&&<div style={{marginTop:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:FF.s,fontSize:8,color:P.muted}}>Data freshness</span>
        <span style={{fontFamily:FF.s,fontSize:8,color:freshness.stale?P.terra:P.sage}}>{freshness.date}</span>
      </div>}
      {active&&<div style={{marginTop:8,fontFamily:FF.s,fontSize:8,color:col,fontWeight:600,letterSpacing:"0.07em"}}>
        ▼ DETAILS BELOW
      </div>}
    </div>
  );
}

function ScorePage(){
  const [activeDetail,setActiveDetail]=useState("cardiovascular");
  const ax={tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};
  const detail=SCORES_NOW[activeDetail];
  const subKeys=["cardiovascular","metabolic","bodyComp","strength","hormonal","longevity","recovery"];

  return(<div style={S.col18}>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>{(()=>{const mob=useIsMobile();return(
      <div style={{display:"flex",gap:mob?14:32,alignItems:"center",flexWrap:mob?"wrap":"nowrap"}}>
      <div style={{flexShrink:0}}>
        <MasterRing score={SCORES_NOW.master.score}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8}}>VITAL Health Score · Nate Hahn · 47yo Male</div>
        <div style={{fontFamily:FF.s,fontWeight:800,fontSize:22,color:P.text,marginBottom:4}}>
          {SCORE_GRADE(SCORES_NOW.master.score)} · {SCORE_LABEL(SCORES_NOW.master.score)}
        </div>
        <div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.7,maxWidth:"100%",marginBottom:16}}>
          Your score reflects 7 clinical domains anchored to the most recent source for each — <span style={{color:P.cyan,fontWeight:700}}>Recovery, Strength, and Cardiovascular use 90-day rolling WHOOP averages</span> ({window.__VITAL_90DAY_RANGE__ || "Jan 1 2026 \u2013 Apr 1 2026"}) rather than single-day snapshots. Labs: Jan 15 '26 (lipids/metabolic) + May 23 '25 (hormones/CRP/HbA1c) — most recent per biomarker. Body comp: Jan 23 '26 DXA. Score is <span style={{color:P.cyan,fontWeight:700}}>+2 pts</span> since Feb '25 — lipid and longevity gains are partially offset by 3-month recovery averaging (63.9% avg vs 66.6% baseline) and a running-heavy training block with limited functional strength work.
          Primary opportunities: Monitor testosterone decline (560→377), DHEA-S now elevated (needs recalibration), watch eGFR trend (97→77).
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {[
            {label:"Feb 14 Score",val:68,color:P.amber},
            {label:"Current Score",val:SCORES_NOW.master.score,color:P.cyan},
            {label:"Change",val:`+${SCORES_NOW.master.score-SCORES_NOW.master.prev} pts`,color:P.green},
            {label:"Percentile Est.",val:"Top 35%",color:P.violet},
          ].map(({label,val,color})=>(
            <div key={label} style={{padding:"10px 16px",background:P.panel,borderRadius:10,border:`1px solid ${P.border}`}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{label}</div>
              <div style={{fontFamily:FF.m,fontSize:18,fontWeight:600,color}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      {!mob&&<div style={{width:220,flexShrink:0}}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Score History</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={SCORE_HISTORY} margin={{top:4,right:4,left:-28,bottom:0}}>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax} interval={1}/>
            <YAxis {...ax} domain={[55,85]}/>
            <Tooltip content={<CTip/>}/>
            <ReferenceLine y={SCORES_NOW.master.prev} stroke={P.border} strokeDasharray="3 3" strokeWidth={1}/>
            <Line type="monotone" dataKey="master" stroke={P.sage} strokeWidth={3.5} isAnimationActive={true} animationDuration={1400} animationEasing="ease-out"
              dot={(p)=>p.index===3||p.index===6?<circle cx={p.cx} cy={p.cy} r={5} fill={P.sage} stroke={P.card} strokeWidth={2}/>:<span/>}
              name="VITAL Score"/>
          
          <ReferenceLine y={SCORES_NOW.master.score} stroke={P.cyan} strokeDasharray="6 3" label={{value:"Now",position:"right",fill:P.cyan,fontSize:10}} /></LineChart>
        </ResponsiveContainer>
      </div>}
      </div>);})()}
    </div>
    
      {/* ── Metabolic Age + Domain Contributions ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
        {/* Left – Perceived Metabolic Age card */}
        <div style={{background:P.cardDk,borderRadius:16,padding:"28px 24px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:16}}>Perceived Metabolic Age</div>
          <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
            <div style={{fontFamily:FF.r,fontSize:64,fontWeight:600,color:P.textInv,lineHeight:1,letterSpacing:"-0.03em"}}>{METABOLIC_AGE.perceived}</div>
            <div style={{fontFamily:FF.s,fontSize:13,color:P.mutedDk}}>years</div>
          </div>
          <div style={{fontFamily:FF.s,fontSize:12,color:P.muted,marginBottom:8}}>Chronological: {METABOLIC_AGE.chrono}</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:99,background:"rgba(106,168,79,0.12)",alignSelf:"flex-start"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:P.sage}}></div>
            <span style={{fontFamily:FF.s,fontSize:11,fontWeight:500,color:P.sage}}>{Math.round(METABOLIC_AGE.chrono - METABOLIC_AGE.perceived)} years younger</span>
          </div>
        </div>
        {/* Right – Domain Contributions */}
        <div style={{background:P.card,borderRadius:16,padding:"24px 22px"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:18}}>Domain Contributions</div>
          {METABOLIC_AGE.factors.map((f,i)=>(
            <div key={i} style={{marginBottom:i<METABOLIC_AGE.factors.length-1?12:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:FF.s,fontSize:11,color:P.text}}>{f.name}</span>
                <span style={{fontFamily:FF.s,fontSize:11,color:f.delta<0?P.sage:P.terra,fontWeight:600}}>{f.delta<0?"":"+"}{f.delta} yrs</span>
              </div>
              <div style={{height:5,borderRadius:3,background:P.border}}>
                <div style={{height:5,borderRadius:3,width:Math.min(Math.abs(f.delta)/6*100,100)+"%",background:f.delta<0?P.sage:P.terra}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
      {subKeys.map(k=><SubScoreCard key={k} data={SCORES_NOW[k]} active={activeDetail===k} onClick={()=>setActiveDetail(k)}/>)}
    </div>
    <div style={CS(14,"18px 20px","none")}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>{detail.icon} {detail.label} · {detail.dataDate||"Multiple sources"}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:12}}>
            <span style={{fontFamily:FF.m,fontSize:42,fontWeight:600,color:SCORE_COLOR(detail.score),lineHeight:1}}>{detail.score}</span>
            <span style={{fontFamily:FF.s,fontSize:12,color:P.sub}}>/100 · {SCORE_LABEL(detail.score)}</span>
            <span style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:detail.score>detail.prev?P.green:detail.score<detail.prev?P.coral:P.muted}}>
              {detail.score>detail.prev?`+${detail.score-detail.prev}`:detail.score<detail.prev?detail.score-detail.prev:"no change"} pts since Feb '25
            </span>
          </div>
        </div>
        <div style={{width:"min(180px,100%)",minWidth:120}}>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={SCORE_HISTORY} margin={{top:4,right:0,left:-28,bottom:0}}>
              <Line type="monotone" dataKey={activeDetail==="bodyComp"?"bodyComp":activeDetail} stroke={detail.color} strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={800}/>
              <Tooltip content={<CTip/>}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:9}}>
        {detail.drivers.map((d,i)=>{
          const dc=SCORE_COLOR(d.score);
          return(<div key={i} style={{padding:"12px",background:P.card,borderRadius:10,border:`1px solid ${d.trend==="flag"?dc+"44":P.border}`,boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
              <span style={{fontFamily:FF.s,fontSize:9,color:P.sub,lineHeight:1.4,flex:1}}>{d.name}</span>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,marginLeft:6,flexShrink:0}}>
                <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:dc,background:dc+"18",padding:"1px 6px",borderRadius:3}}>{d.score}</span>
                {d.trend!=="stable"&&<span style={{fontSize:9}}>{d.trend==="up"?"↗":d.trend==="flag"?"⚠️":"→"}</span>}
              </div>
            </div>
            <div style={{fontFamily:FF.m,fontSize:14,fontWeight:600,color:dc,lineHeight:1,marginBottom:3}}>{d.val}</div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.4}}>{d.note}</div>
            <div style={{marginTop:6,height:3,background:P.border,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${d.score}%`,background:dc,borderRadius:2,transition:`width 0.8s cubic-bezier(0.34,1.2,0.64,1) ${i*50}ms`}}/>
            </div>
          </div>);
        })}
      </div>
    </div>
    <div style={CS(14,"18px 20px","none")}>
      <SLabel color={P.cyan} right="Nov 2024 → May 2025">All Category Score Trends</SLabel>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={SCORE_HISTORY} margin={{top:8,right:16,left:-20,bottom:0}}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" {...ax}/><YAxis {...ax} domain={[50,90]}/>
          <Tooltip content={<CTip/>}/>
          <Line type="monotone" dataKey="master"         stroke={P.cyan}   strokeWidth={3} dot={false} name="VITAL Score"/>
          <Line type="monotone" dataKey="cardiovascular" stroke={P.coral}  strokeWidth={1.5} dot={false} name="Cardio" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="metabolic"      stroke={P.amber}  strokeWidth={1.5} dot={false} name="Metabolic" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="bodyComp"       stroke={P.violet} strokeWidth={1.5} dot={false} name="Body Comp" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="strength"       stroke={P.blue}   strokeWidth={1.5} dot={false} name="Strength" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="hormonal"       stroke={P.pink}   strokeWidth={1.5} dot={false} name="Hormonal" strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="recovery"       stroke={P.green}  strokeWidth={1.5} dot={false} name="Recovery" strokeDasharray="4 2"/>
        </LineChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:10}}>
        {[
          {label:"VITAL Score",color:P.cyan,w:3},
          {label:"Cardio",color:P.coral,w:1.5},
          {label:"Metabolic",color:P.amber,w:1.5},
          {label:"Body Comp",color:P.violet,w:1.5},
          {label:"Strength",color:P.blue,w:1.5},
          {label:"Hormonal",color:P.pink,w:1.5},
          {label:"Recovery",color:P.green,w:1.5},
        ].map(({label,color})=>(
          <div key={label} style={S.row5}>
            <div style={{width:16,height:2,background:color,borderRadius:1}}/>
            <span style={S.sub10}>{label}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={CS(14,"18px 20px","none")}>
      <SLabel color={P.amber}>Top 3 Priority Actions</SLabel>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:12}}>
        {[
          {rank:1,cat:"Longevity",score:64,action:"Investigate elevated Ferritin (394.5)",detail:"Retest fasting ferritin + iron panel. Consider HFE gene test. Ferritin is your lowest single driver.",color:P.coral,impact:"+3–5 pts"},
          {rank:2,cat:"Hormonal",score:66,action:"Supplement Vitamin D3 + K2",detail:"At 26.5 ng/mL you're insufficient. Target 50–70 ng/mL with 5,000 IU/day D3. Impacts immunity, hormones, mood.",color:P.amber,impact:"+2–4 pts"},
          {rank:3,cat:"Hormonal",score:66,action:"Address low DHEA-S (119.1)",detail:"Below range for 47yo. Discuss 25–50mg DHEA supplementation with Dr. Greene. Supports testosterone and energy.",color:P.amber,impact:"+2–3 pts"},
        ].map(({rank,cat,score,action,detail,color,impact})=>(
          <div key={rank} style={{padding:"16px 18px",background:P.card,borderRadius:12,border:`1px solid ${P.border}`,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:22,height:22,borderRadius:6,background:color+"22",border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.m,fontSize:11,fontWeight:700,color,flexShrink:0}}>{rank}</div>
              <div>
                <span style={{fontFamily:FF.s,fontSize:8,color:color,background:color+"15",padding:"1px 6px",borderRadius:3,marginRight:5}}>{cat}</span>
                <span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.green}}>{impact}</span>
              </div>
            </div>
            <div style={{fontFamily:FF.s,fontWeight:700,fontSize:11,color:P.text,marginBottom:5,lineHeight:1.3}}>{action}</div>
            <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>{detail}</div>
          </div>
        ))}
      </div>
    </div>
  

      {/* ── Lab Integration Panel ── */}
      <div style={{background:P.card,border:"1px solid "+P.border,borderRadius:16,padding:"22px 24px",marginTop:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontFamily:FF.s,fontSize:13,fontWeight:600,color:P.text,marginBottom:2}}>Lab Integration</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>What Would Move Your Score</div>
          </div>
          {LAB_OVERDUE&&LAB_OVERDUE.length>0&&<div style={{padding:"4px 10px",borderRadius:99,background:"rgba(194,84,56,0.12)",fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.terra}}>{LAB_OVERDUE.length} overdue</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            {domain:"Hormonal",color:P.pink,score:SCORES_NOW.hormonal.score,labs:["Testosterone","Estradiol","DHEA-S"],warn:["Testosterone"],impact:"+4"},
            {domain:"Longevity",color:P.green,score:SCORES_NOW.recovery.score,labs:["IGF-1","hsCRP","HbA1c"],warn:["hsCRP"],impact:"+3"},
            {domain:"Cardiovascular",color:P.coral,score:SCORES_NOW.cardiovascular.score,labs:["ApoB","Lp(a)","LP-PLA2"],warn:[],impact:"+2"},
            {domain:"Metabolic",color:P.amber,score:SCORES_NOW.metabolic.score,labs:["Fasting Insulin","HOMA-IR","Triglycerides"],warn:["HOMA-IR"],impact:"+3"}
          ].map((d,i)=>(
            <div key={i} style={{background:P.panel,borderRadius:12,padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:d.color}}>{d.domain}</span>
                <span style={{fontFamily:FF.r,fontSize:15,fontWeight:700,color:P.text}}>{d.score}</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                {d.labs.map((lab,j)=>(
                  <span key={j} style={{padding:"2px 8px",borderRadius:99,fontSize:9,fontFamily:FF.s,background:d.warn.includes(lab)?"rgba(194,84,56,0.12)":P.border,color:d.warn.includes(lab)?P.terra:P.muted}}>
                    {d.warn.includes(lab)&&"⚠ "}{lab}
                  </span>
                ))}
              </div>
              <div style={{fontFamily:FF.s,fontSize:10,color:P.sage,fontWeight:600}}>Potential: {d.impact} pts</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12,fontFamily:FF.s,fontSize:9,color:P.muted,textAlign:"center"}}>Import lab results to unlock personalized score projections</div>
      </div></div>);
}

const NAV_PRIMARY=[
  {id:"today",    icon:"☀",   label:"Today"},
  {id:"score",    icon:"⚡",   label:"Health Score"},
  {id:"fitness",  icon:"🏃", label:"Fitness"},
  {id:"calendar", icon:"📅",label:"Calendar"},
  {id:"labs",     icon:"🧬",    label:"Labs"},
];
const NAV_MORE=[
  {id:"overview",     icon:"⊞",  label:"Overview"},
  {id:"readiness",    icon:"📡", label:"Readiness"},
  {id:"fueling",      icon:"🥗",   label:"Fueling"},
  {id:"sleep",        icon:"🌙",     label:"Sleep"},
  {id:"progress",     icon:"📈",  label:"Progress"},
  {id:"body",         icon:"📐",      label:"Body Comp"},
  {id:"trends",       icon:"↗",    label:"Trends"},
  {id:"correlations", icon:"🔗",      label:"Correlations"},
  {id:"supps",        icon:"💊",     label:"Supplements"},
  {id:"peloton",      icon:"🚴",   label:"Peloton"},
  {id:"import",       icon:"⬆",   label:"Import Data"},
];
const NAV=[...NAV_PRIMARY,...NAV_MORE];

function UserModal({onClose,theme,setTheme}){
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

function Sidebar({active,set,peloConnected,theme,setTheme}){
  const [showProfile, setShowProfile] = useState(false);
  const [showMore,setShowMore]=useState(false);
  return(<>
    {showProfile&&<UserModal onClose={()=>setShowProfile(false)} theme={theme} setTheme={setTheme}/>}
    <div style={{width:200,flexShrink:0,background:P.card,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0}}>
    <div style={{padding:"22px 20px 18px",borderBottom:`1px solid ${P.border}`}}>
      <div style={S.row10}>
        <div style={{width:30,height:30,borderRadius:"50%",background:P.cardDk,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>
          <span style={{color:P.textInv}}>♥</span>
        </div>
        <div>
          <div style={{fontFamily:FF.r,fontWeight:700,fontSize:15,color:P.text,letterSpacing:"0.06em",lineHeight:1}}>VITAL</div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:1}}>Health OS</div>
        </div>
      </div>
    </div>
    <div style={{padding:"12px 10px",flex:1,overflowY:"auto"}}>
      {NAV_PRIMARY.map((n)=>{
      const on=active===n.id;
      const accent=n.id==="today"?P.amber:n.id==="score"?P.terra:n.id==="fitness"?P.sage:n.id==="labs"?P.terra:n.id==="body"?P.clay:n.id==="peloton"?P.terra:P.sage;
      const flagDot=n.id==="labs";
      return(<div key={n.id} onClick={()=>set(n.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:10,marginBottom:1,cursor:"pointer",transition:"all .15s",background:on?`${accent}12`:"transparent"}}
        onMouseEnter={e=>{if(!on)e.currentTarget.style.background=P.panel}}
        onMouseLeave={e=>{if(!on)e.currentTarget.style.background="transparent"}}>
          <span style={{fontSize:13,lineHeight:1,opacity:on?1:.5}}>{n.icon}</span>
          <span style={{fontFamily:FF.s,fontSize:12,fontWeight:on?600:400,color:on?P.text:P.sub,flex:1}}>{n.label}</span>
          {flagDot&&<div style={{width:6,height:6,borderRadius:"50%",background:P.terra}}/>}
          {on&&!flagDot&&<div style={{width:5,height:5,borderRadius:"50%",background:accent}}/>}
        </div>);
    })}
      <div onClick={()=>setShowMore(!showMore)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:10,marginTop:6,marginBottom:1,cursor:"pointer",transition:"all .15s",opacity:.6}}
        onMouseEnter={e=>{e.currentTarget.style.background=P.panel}}
        onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
        <span style={{fontSize:13,lineHeight:1}}>{showMore?"▴":"▾"}</span>
        <span style={{fontFamily:FF.s,fontSize:11,fontWeight:500,color:P.sub}}>More</span>
      </div>
      {showMore&&<div style={{marginTop:2}}>
        {NAV_MORE.map((n)=>{
      const on=active===n.id;
      const accent=n.id==="today"?P.amber:n.id==="score"?P.terra:n.id==="fitness"?P.sage:n.id==="labs"?P.terra:n.id==="body"?P.clay:n.id==="peloton"?P.terra:P.sage;
      const flagDot=n.id==="labs";
      return(<div key={n.id} onClick={()=>set(n.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:10,marginBottom:1,cursor:"pointer",transition:"all .15s",background:on?`${accent}12`:"transparent"}}
        onMouseEnter={e=>{if(!on)e.currentTarget.style.background=P.panel}}
        onMouseLeave={e=>{if(!on)e.currentTarget.style.background="transparent"}}>
          <span style={{fontSize:13,lineHeight:1,opacity:on?1:.5}}>{n.icon}</span>
          <span style={{fontFamily:FF.s,fontSize:12,fontWeight:on?600:400,color:on?P.text:P.sub,flex:1}}>{n.label}</span>
          {flagDot&&<div style={{width:6,height:6,borderRadius:"50%",background:P.terra}}/>}
          {on&&!flagDot&&<div style={{width:5,height:5,borderRadius:"50%",background:accent}}/>}
        </div>);
    })}
      </div>}
    </div>
    <div style={{padding:"14px 16px",borderTop:`1px solid ${P.border}`}}>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Data Sources</div>
      {[
        {l:"WHOOP",       d:P.amber, s:"CSV loaded"},
        {l:"Styku",       d:P.sage,  s:"2 scans"},
        {l:"BioLab",      d:P.terra, s:"May '25"},
        {l:"CardioCoach", d:P.steel, s:"RMR"},
      ].map(({l,d,s})=>(
        <div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:d}}/>
            <span style={S.sub10}>{l}</span>
          </div>
          <span style={S.mut9}>{s}</span>
        </div>
      ))}
    </div>
    <div onClick={()=>setShowProfile(true)} style={{padding:"12px 16px",borderTop:`1px solid ${P.border}`,cursor:"pointer",transition:"background .15s"}}
      onMouseEnter={e=>e.currentTarget.style.background=P.panel}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={S.row10}>
        <div style={{width:32,height:32,borderRadius:"50%",background:P.cardDk,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.r,fontWeight:600,fontSize:13,color:P.textInv,flexShrink:0}}>N</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:FF.s,fontWeight:600,fontSize:11,color:P.text}}>Nate Hahn</div>
          <div style={S.mut9}>47 · Male · Montecito</div>
        </div>
        <div style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>⚙</div>
      </div>
    </div>

    {/* Privacy footer */}
    <div style={{padding:"10px 16px",borderTop:`1px solid ${P.border}`}}>
      <a href="https://www.privacypolicies.com/live/generic" target="_blank" rel="noopener noreferrer"
        style={{fontFamily:FF.s,fontSize:9,color:P.muted,textDecoration:"none",
          letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:4,opacity:0.6}}
        onMouseEnter={e=>e.currentTarget.style.opacity="1"}
        onMouseLeave={e=>e.currentTarget.style.opacity="0.6"}>
        <span style={{fontSize:10}}>🔒</span> Privacy Policy
      </a>
    </div>
  </div>
  </>);
}

function Topbar({page}){
  const hour = new Date().getHours();
  const todGreet =
    hour < 6  ? "You're up early, Nate" :
    hour < 12 ? "Good morning, Nate" :
    hour < 14 ? "Good afternoon, Nate" :
    hour < 17 ? "Good afternoon, Nate" :
    hour < 21 ? "Good evening, Nate" :
               "Good night, Nate";
  const labels={today:todGreet,import:"Import Data",peloton:"Peloton",supps:"Supplements",progress:"Progress",sleep:"Sleep",correlations:"Correlations",fueling:"Fueling",readiness:"Readiness",overview:"Dashboard",score:"Health Score",fitness:"Fitness & Training",calendar:"Calendar",body:"Body Composition",labs:"Labs",trends:"Trends"};
  const dates={score:"May 23, 2025",labs:"May 23, 2025",body:"May 23, 2025",fitness:"Last 6 months"};
  return(<div style={{height:58,background:P.card,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 26px",position:"sticky",top:0,zIndex:10}}>
    <div>
      <div style={{fontFamily:FF.r,fontWeight:600,fontSize:17,color:P.text,letterSpacing:"0.01em"}}>{labels[page]||page}</div>
      <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginTop:1}}>{dates[page]||new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
    </div>
    <div style={S.row10}>
      {page==="labs"&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:99,background:P.terracottaBg,border:`1px solid ${"#C4604A33"}`}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:P.terra}}/>
        <span style={{fontFamily:FF.s,fontSize:10,fontWeight:500,color:P.terra}}>3 Flags · May 23</span>
      </div>}
      <div style={{display:"flex",gap:4}}>
        <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:"rgba(255,255,255,0.6)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:P.sage}}/>
            <span style={S.sub9}>Recovery + HRV</span>
          </div>
      </div>
    </div>
  </div>);
}

/* --- TODAY PAGE -------------------------------------------------
 * Morning briefing: sleep recap, recovery status, yesterday's training,
 * today's workout already logged, weather, and forward-looking guidance.
 */
function TodayPage({setPage, whoopStatus="loading"}){
  const { events:calEvents, label:calLabel2, error:calError } = useCalendarEvents();
  const now = new Date();
  const hour = now.getHours();

  // Time of day buckets
  const TOD =
    hour < 6  ? "predawn" :
    hour < 12 ? "morning" :
    hour < 14 ? "midday"  :
    hour < 18 ? "afternoon" :
    hour < 21 ? "evening" : "night";

  const greeting =
    TOD === "predawn"   ? "You're up early," :
    TOD === "morning"   ? "Good morning," :
    TOD === "midday"    ? "Good afternoon," :
    TOD === "afternoon" ? "Good afternoon," :
    TOD === "evening"   ? "Good evening," :
                          "Winding down,";

  const isMorning  = ["predawn","morning"].includes(TOD);
  const isMidday   = TOD === "midday";
  const isEvening  = ["evening","night"].includes(TOD);
  const isAfternoon = TOD === "afternoon";

  const timeLabel = now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
  const dateLabel = now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  // User-editable tomorrow plan
  const [tomorrowNote, setTomorrowNote] = useState("");
  const [tomorrowEditing, setTomorrowEditing] = useState(false);
  const [tomorrowCustom, setTomorrowCustom] = useState(null); // null = use pattern

  const [weather, setWeather] = useState({
    temp:73, feels:71, code:1, wind:8, humidity:62, rainPct:0, high:74,
  });

  useEffect(()=>{
    fetch("https://api.open-meteo.com/v1/forecast?latitude=34.4362&longitude=-119.6390&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,precipitation_probability&hourly=temperature_2m,precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FLos_Angeles&forecast_days=1")
      .then(r=>r.json())
      .then(d=>{
        const c=d.current;
        const hourly=d.hourly;
        const afHigh=Math.round(Math.max(...hourly.temperature_2m.slice(hour,18)));
        setWeather({
          temp:Math.round(c.temperature_2m),
          feels:Math.round(c.apparent_temperature),
          code:c.weather_code,
          wind:Math.round(c.wind_speed_10m),
          humidity:c.relative_humidity_2m,
          rainPct:c.precipitation_probability,
          high:afHigh,
        });
      })
      .catch(()=>{});
  },[]);

  const weatherIcon=code=>{
    if(code===0)return{icon:"☀️",label:"Clear & Sunny",good:true};
    if(code<=2) return{icon:"⛅",label:"Partly Cloudy",good:true};
    if(code<=3) return{icon:"☁️",label:"Overcast",good:true};
    if(code<=48)return{icon:"🌫️",label:"Foggy",good:false};
    if(code<=67)return{icon:"🌧️",label:"Rain",good:false};
    return{icon:"🌩️",label:"Unsettled",good:false};
  };
  const wDesc = weatherIcon(weather.code);
  const goodOutdoors = wDesc.good && weather.rainPct < 30;

  // -- Real WHOOP data --
  const REC = WHOOP.recovery, HRV = WHOOP.hrv, RHR = WHOOP.rhr;
  const SLEEP   = {perf:95, dur:8.53, rem:2.25, deep:1.85, light:4.43, eff:98, consistency:84, resp:14.9}; 
 
  const WEEKLY_SCHEDULE = {
    0:{name:"Running",           icon:"🏃",color:"#C47830",time:"13:00",timeH:13,strain:11.0,dur:50,freq:69},
    1:{name:"Functional Fitness",icon:"🏋",color:"#3A5C48",time:"10:00",timeH:10,strain:11.2,dur:68,freq:62},
    2:{name:"Running",           icon:"🏃",color:"#C47830",time:"11:00",timeH:11,strain:12.8,dur:52,freq:69,note:"Wed 11am run · 69% of weeks"},
    3:{name:"Functional Fitness",icon:"🏋",color:"#3A5C48",time:"10:00",timeH:10,strain:11.5,dur:68,freq:79},
    4:{name:"Running",           icon:"🏃",color:"#C47830",time:"13:00",timeH:13,strain:10.2,dur:50,freq:62},
    5:{name:"Functional Fitness",icon:"🏋",color:"#3A5C48",time:"07:00",timeH:7, strain:14.1,dur:76,freq:62},
    6:{name:"Running",           icon:"🏃",color:"#C47830",time:"09:00",timeH:9, strain:11.3,dur:52,freq:41},
  };

  // JS getDay(): 0=Sun → map to Mon=0 index
  const dow = now.getDay();
  const dowIdx = dow === 0 ? 6 : dow - 1;
  const todaySchedule = WEEKLY_SCHEDULE[dowIdx];

 
    // Build doneTodayAll from CAL_RICH (populated by live WHOOP API) instead of hardcoded data
      const iconMap = {running:"\u{1F3C3}",fitness:"\u{1F3CB}",walking:"\u{1F6B6}",cycling:"\u{1F6B4}",spin:"\u{1F6B4}",other:"\u{1F4AA}",sport:"\u26BD"};
      const colorMap = {running:"#C47830",fitness:"#3A5C48",walking:"#7A5AB0",cycling:"#2D7D9A",spin:"#2D7D9A",other:"#666",sport:"#444"};
      const doneTodayAll = (CAL_RICH[now.toLocaleDateString("en-CA")] || []).map(w => ({
              name: w.name || "Activity",
              icon: iconMap[w.cat] || "\u{1F4AA}",
              color: colorMap[w.cat] || "#666",
              strain: w.strain || 0,
              dur: w.dur || 0,
              cal: w.cal || 0,
              timeH: w.timeH != null ? w.timeH : 0,
              time: w.start || "",
              avgHR: w.avgHR || 0,
              maxHR: w.maxHR || 0,
      }));
  const doneToday = doneTodayAll.filter(w => hour >= w.timeH);
  const strainSoFar     = doneToday.reduce((s,w)=>s+w.strain,0);
  const calsBurned = doneToday.reduce((s,w)=>s+w.cal,0);

 
  const canonicalAhead = todaySchedule &&
    hour < todaySchedule.timeH + 2 &&
    !doneToday.some(w=>w.name===todaySchedule.name);

  // Yesterday's training
  const yesterday = [{name:"Running",icon:"🏃",color:"#C47830",strain:13.3,dur:81,cal:775}]; // Mar 21 — WHOOP screenshot
  const tomorrowDow = (dow + 1) % 7; // JS day of week
  const tomorrowIdx = tomorrowDow === 0 ? 6 : tomorrowDow - 1; // Mon=0 index
  const tomorrowSchedule = WEEKLY_SCHEDULE[tomorrowIdx];
  const tomorrowDayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][tomorrowDow];
  const RMR_DAILY      = RMR.measured;       // 1858 kcal measured (CardioCoach)
  const NEAT_DAILY     = RMR.lifestyle;      // 1300 kcal lifestyle (CardioCoach)
  const projectedExCal = canonicalAhead && todaySchedule
    ? Math.round(todaySchedule.strain * 42)  // strain × 42 ≈ kcal for 47yo male
    : 0;
  const estimatedTDEE = RMR_DAILY + NEAT_DAILY + calsBurned + projectedExCal;
  const confirmedTDEE = RMR_DAILY + NEAT_DAILY + calsBurned;

 
  const planned = [];
  if(!isEvening && canonicalAhead && hour <= todaySchedule.timeH) {
    planned.push({
      name:todaySchedule.name, icon:todaySchedule.icon, color:todaySchedule.color,
      note:`${todaySchedule.note} · ~${todaySchedule.dur}m · ~${todaySchedule.strain} avg strain`,
      time:todaySchedule.time, freq:todaySchedule.freq, isCanonical:true,
    });
  } else if(!isEvening && !canonicalAhead && strainSoFar < 8 && hour < 18) {
    planned.push({
      name:"Recovery walk",icon:"🚶",color:"#7A5A80",
      note:todaySchedule?.timeH&&hour>todaySchedule.timeH?"Primary window passed — lighter option suggested":"Easy active recovery",
      time:null, freq:null, isCanonical:false,
    });
  }

  // Recovery trend (7-day)
  // 8-day recovery trend — real WHOOP values + Mar 22 screenshot
  const recTrend=[
    {d:"Mar 19",rec:62, hrv:43},
    {d:"Mar 20",rec:69, hrv:45},
    {d:"Mar 21",rec:69, hrv:43},
    {d:"Mar 22",rec:37, hrv:37},
    {d:"Mar 23",rec:87, hrv:52},
    {d:"Mar 24",rec:0,  hrv:0},
    {d:"Mar 25",rec:54, hrv:39},
    {d:"Mar 26",rec:54, hrv:39}, // Today
  ];

  const recColor = r => r>=80?"#3A5C48":r>=60?"#C47830":"#C4604A";
  const recLabel = r => r>=80?"Optimal":r>=60?"Moderate":"Low";
  const rc = recColor(REC);
  const ax ={tick:{fontFamily:FF.m,fontSize:8,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  // -- Time-adaptive guidance --
  const guidance = isMorning ? [
    {
      icon: REC>=80?"🟢":REC>=60?"🟡":"🔴",
      title: REC>=80
        ? `Green light — ${todaySchedule?.name||"train hard"} today`
        : REC>=60
        ? `Moderate effort — ${todaySchedule?.name||"train smart"}`
        : "Recovery day — scale back",
      body: (() => {
        const sched = todaySchedule;
        const baseMsg = sched
          ? `Typical ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][dowIdx]}: ${sched.name} at ${sched.time} (${sched.freq}% of weeks). Expected ~${sched.strain} strain.`
          : "";
        if(REC>=80) return `${baseMsg} HRV ${HRV}ms and recovery ${REC}% are strong — body is primed for full effort.`;
        if(REC>=60) return `${baseMsg} Recovery average (${REC}%). Complete the session but cap intensity — avoid Z4/Z5 today.`;
        return `${baseMsg} Low recovery (${REC}%). Consider skipping or substituting with Zone 2 walk — don't compound fatigue.`;
      })(),
      action:"View Fitness", page:"fitness",
    },
    {
      icon:"🌅",
      title: goodOutdoors ? `${wDesc.icon} Perfect conditions for outdoor training` : "Indoor training day",
      body: goodOutdoors
        ? `${weather.temp}°F in Montecito — ${wDesc.label}. ${weather.rainPct}% rain. Ideal for a run or outdoor session.`
        : `${wDesc.icon} ${wDesc.label}, ${weather.rainPct}% rain. Keep it indoors today.`,
      action: null,
    },
    {
      icon:"⚡",
      title: strainSoFar > 0
        ? `${strainSoFar.toFixed(1)} strain logged · ${canonicalAhead&&todaySchedule?`${todaySchedule.name} ahead`:"watching load"}`
        : todaySchedule
        ? `${todaySchedule.name} at ${todaySchedule.time} expected`
        : "No workout pattern for today",
      body: (() => {
        const weekTotal = 74.3+strainSoFar;
        const expected = todaySchedule?.strain || 0;
        const projectedDay = strainSoFar + (canonicalAhead ? expected : 0);
        if(strainSoFar === 0 && todaySchedule)
          return `${todaySchedule.freq}% probability of ${todaySchedule.name} based on your history. Projected day strain: ~${projectedDay.toFixed(1)}. Week so far: ${weekTotal.toFixed(0)}.`;
        if(strainSoFar > 0 && canonicalAhead)
          return `${strainSoFar.toFixed(1)} done. ${todaySchedule?.name} still ahead — projected ${projectedDay.toFixed(1)} total today. Week running at ${weekTotal.toFixed(0)} total strain.`;
        return strainSoFar < 5
          ? "Light day so far. A Functional Fitness or tempo run would balance the week — you typically train more on this day."
          : strainSoFar < 12
          ? `${strainSoFar.toFixed(1)} strain complete. One more session or rest — week total ${weekTotal.toFixed(0)}.`
          : `Strong load at ${strainSoFar.toFixed(1)} strain. Cap here unless recovery is green tomorrow.`;
      })(),
      action:"View Calendar", page:"calendar",
    },
    {
      icon:"🌙",
      title:"Last night was excellent",
      body:`${SLEEP.dur}h total · ${SLEEP.perf}% performance. Deep SWS ${SLEEP.deep}h, REM ${SLEEP.rem}h. Respiratory rate ${SLEEP.resp} rpm. Well-rested for today.`,
      action:null,
    },
  ] : isMidday ? [
    {
      icon:"☀️",
      title:"Midday check-in",
      body:`${strainSoFar>0?`${strainSoFar.toFixed(1)} strain logged today.`:"Nothing logged yet."} ${strainSoFar<8?"Still time for a quality afternoon session.":" Good load — consider a walk or rest this afternoon."}`,
      action:"View Fitness", page:"fitness",
    },
    {
      icon:"💧",
      title:"Hydration & nutrition window",
      body:"Post-morning workout — prioritise protein and hydration now. 30–60min post-workout window for protein synthesis. Aim 150–200g protein today.",
      action:null,
    },
    {
      icon:"⚡",
      title:`Week load: ${(74.3+strainSoFar).toFixed(0)} total strain`,
      body:"You're in the peak block of the last 4 weeks. Monitor cumulative fatigue — if recovery drops below 50% tomorrow, scale back.",
      action:"View Trends", page:"trends",
    },
    {
      icon:"🌙",
      title:"Set up tonight for quality sleep",
      body:"Avoid caffeine after 2 PM. Last hard effort before 6 PM to allow core temp to drop. Target 9–9.5h in bed given current training load.",
      action:null,
    },
  ] : isAfternoon ? [
    {
      icon:"⚡",
      title:`${strainSoFar.toFixed(1)} strain logged — ${strainSoFar<8?"room to add one more session":"solid day complete"}`,
      body: strainSoFar<8
        ? "Still time for a strength session or tempo run. Aim to finish by 6 PM to protect sleep onset."
        : "Good day of training. Transition to recovery mode — walk, stretch, or rest.",
      action:"View Fitness", page:"fitness",
    },
    {
      icon:"🌤",
      title: goodOutdoors ? `${weather.temp}°F — good afternoon for a walk` : `${wDesc.icon} ${weather.temp}°F outside`,
      body: goodOutdoors
        ? "Afternoon outdoor activity is ideal for cortisol management and light movement. A 30-40 min walk before dinner optimises blood sugar."
        : `Weather: ${wDesc.label}. Indoor stretching or mobility work would be a good close to the day.`,
      action:null,
    },
    {
      icon:"🍽",
      title:"Pre-sleep nutrition window",
      body:"Aim to finish eating 2–3 hours before sleep. A light protein-carb combo (greek yogurt, fruit) is fine. Avoid alcohol — it suppressed deep SWS last time.",
      action:null,
    },
    {
      icon:"💊",
      title:"Evening supplement timing",
      body:"Magnesium glycinate (300–400mg) 45 min before bed supports deep SWS. Vitamin D earlier in the day. Avoid zinc/B vitamins in the evening.",
      action:null,
    },
  ] : /* evening / night */ [
    {
      icon:"🌙",
      title:"Wind-down mode",
      body:`Training is done for the day. ${strainSoFar>0?`${strainSoFar.toFixed(1)} strain logged.`:""} Dim lights, cool the room to 67–68°F, and aim for bed by 9:30 PM for a 9h sleep window.`,
      action:null,
    },
    {
      icon:"📊",
      title:"Today's training recap",
      body: doneToday.length>0
        ? `${doneToday.map(w=>w.name).join(" + ")} · ${strainSoFar.toFixed(1)} total strain · ${doneToday.reduce((s,w)=>s+w.cal,0)} kcal burned. ${strainSoFar>15?"High load day — recovery is the priority tonight.":"Moderate day — body should recover well overnight."}`
        : "Rest day logged. Muscle protein synthesis peaks on rest days — sleep quality is the training tonight.",
      action:"View Calendar", page:"calendar",
    },
    {
      icon:"💤",
      title:"Optimise tonight's sleep",
      body:`Last night: ${SLEEP.dur}h, ${SLEEP.perf}% performance. Target same or better tonight. HRV ${HRV}ms — ${HRV>=50?"nervous system recovered":"some residual fatigue present"}. No screens 30min before bed.`,
      action:null,
    },
    {
      icon:"🌅",
      title:(()=>{
        const plan = tomorrowCustom || tomorrowSchedule;
        if(!plan) return "Tomorrow — rest day";
        return `Tomorrow: ${plan.name} at ${plan.time||"TBD"}`;
      })(),
      body:(()=>{
        const plan = tomorrowCustom || tomorrowSchedule;
        const weekTotal = (74.3+strainSoFar).toFixed(0);
        if(!plan) return `Rest day tomorrow. Week strain: ${weekTotal}. Good recovery timing.`;
        const isCustom = !!tomorrowCustom;
        const wakeH = plan.timeH ? Math.max(6, plan.timeH-1) : 6;
        const wakeStr = wakeH < 12 ? `${wakeH}:00 AM` : "6:00 AM";
        return `${isCustom?"Custom plan":"Pattern-based"}: ${plan.name} ${plan.time?`at ${plan.time}`:""}. Target wake ${wakeStr} for ${plan.timeH?"a 9h sleep window. ":""}Week strain: ${weekTotal}.${tomorrowNote?" Note: "+tomorrowNote:""}`;
      })(),
      action:"View Fitness", page:"fitness",
    },
  ];

  // Hero gradient adapts to time of day
  const heroBg =
    isMorning   ? "linear-gradient(135deg, #261D14 0%, #362410 60%, #1E2614 100%)" :
    isMidday    ? "linear-gradient(135deg, #14241E 0%, #1A3020 60%, #20240E 100%)" :
    isAfternoon ? "linear-gradient(135deg, #28180A 0%, #341E0C 60%, #2C1210 100%)" :
                  "linear-gradient(135deg, #14142A 0%, #100E22 60%, #121624 100%)";

  const heroAccent =
    isMorning   ? "rgba(196,120,48,0.22)" :
    isMidday    ? "rgba(58,92,72,0.22)"   :
    isAfternoon ? "rgba(184,90,42,0.22)"  :
                  "rgba(74,96,112,0.22)";

  return(
    <div style={S.col18}>
      <div style={{
        background:heroBg, borderRadius:18, padding:"28px 32px",
        position:"relative", overflow:"hidden",
        boxShadow:"0 4px 24px rgba(0,0,0,0.14)",
      }}>
        <div style={{position:"absolute",top:-60,right:-40,width:"min(260px,70vw)",height:"min(260px,70vw)",borderRadius:"50%",
          background:`radial-gradient(circle, ${heroAccent} 0%, transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-50,left:-30,width:180,height:180,borderRadius:"50%",
          background:"radial-gradient(circle, rgba(58,92,72,0.12) 0%, transparent 70%)",pointerEvents:"none"}}/>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
              <span style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.72)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{dateLabel}</span>
              <div style={{width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,0.2)"}}/>
              <span style={{fontFamily:FF.m,fontSize:10,color:"rgba(255,255,255,0.55)"}}>{timeLabel}</span>
            </div>
            <div style={{fontFamily:FF.r,fontSize:46,fontWeight:600,color:P.textInv,letterSpacing:"-0.02em",lineHeight:1,marginBottom:8}}>
              {greeting}<br/>Nate.
            </div>
            <div style={{fontFamily:FF.s,fontSize:13,color:"rgba(255,255,255,0.80)",marginTop:8,maxWidth:380,lineHeight:1.6}}>
              {isMorning && `Recovery ${recLabel(REC).toLowerCase()} today · ${SLEEP.dur}h of quality sleep last night.`}
              {isMidday  && `${strainSoFar>0?`${strainSoFar.toFixed(1)} strain already logged.`:"No workouts yet today."} HRV ${HRV}ms.`}
              {isAfternoon && `${strainSoFar>0?`${strainSoFar.toFixed(1)} strain today.`:"Rest day so far."} Transition to recovery mode.`}
              {isEvening && `${strainSoFar>0?`${strainSoFar.toFixed(1)} strain today.`:"Rest day."} Wind-down and optimise tonight's sleep.`}
            </div>
          </div>
          <div style={{textAlign:"right",flexShrink:0,minWidth:140}}>
            <div style={{fontFamily:FF.r,fontSize:60,fontWeight:600,color:P.textInv,lineHeight:1,letterSpacing:"-0.03em"}}>{weather.temp}°</div>
            <div style={{fontFamily:FF.s,fontSize:13,color:"rgba(255,255,255,0.85)",marginTop:3}}>{wDesc.icon} {wDesc.label}</div>
            <div style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.62)",marginTop:4}}>
              Feels {weather.feels}° · H{weather.high}° · {weather.wind} mph
            </div>
            <div style={{fontFamily:FF.s,fontSize:10,color:weather.rainPct>30?"#C4604A":"rgba(255,255,255,0.3)",marginTop:2}}>
              {weather.rainPct}% chance of rain
            </div>
            <div style={{fontFamily:FF.s,fontSize:9,color:"rgba(255,255,255,0.52)",marginTop:3}}>Montecito · 93108</div>
          </div>
        </div>
        <div style={{display:"flex",gap:2,flexWrap:"wrap",marginTop:22,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.18)"}}>
          {[
            {label:"Recovery",   val:`${REC}%`,        color:rc},
            {label:"HRV",        val:`${HRV} ms`,       color:"rgba(255,255,255,0.90)"},
            {label:"Resting HR", val:`${RHR} bpm`,      color:"rgba(255,255,255,0.65)"},
            {label:"Sleep",      val:`${SLEEP.perf}%`,  color:"#7AC49A"},
            {label:"Strain today",val:strainSoFar>0?strainSoFar.toFixed(1):"—", color:strainSoFar>15?"#C4604A":strainSoFar>8?"#C47830":"rgba(255,255,255,0.90)"},
          ].map(({label,val,color},i)=>(
            <div key={i} style={{flex:1,padding:"12px 16px",background:"rgba(255,255,255,0.08)",borderRadius:10}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.60)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{label}</div>
              <div style={{fontFamily:FF.r,fontSize:26,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
            </div>
          ))}
          {/* WHOOP live status pill */}
          {whoopStatus==="connected"&&(
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(58,156,104,0.12)",borderRadius:8,border:"1px solid rgba(58,156,104,0.25)",alignSelf:"center",flexShrink:0}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#3A9C68",boxShadow:"0 0 5px #3A9C68"}}/>
              <span style={{fontFamily:FF.s,fontSize:8,color:"#7AC49A",fontWeight:600,letterSpacing:"0.08em"}}>LIVE</span>
            </div>
          )}
          {whoopStatus==="disconnected"&&(
            <a href="/api/whoop/login" style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(255,255,255,0.06)",borderRadius:8,border:"1px solid rgba(255,255,255,0.12)",textDecoration:"none",alignSelf:"center",flexShrink:0}}>
              <span style={{fontSize:10}}>⌚</span>
              <span style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.45)",letterSpacing:"0.06em"}}>Connect WHOOP</span>
            </a>
          )}
          {whoopStatus==="stale"&&(
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"rgba(196,120,48,0.10)",borderRadius:8,border:"1px solid rgba(196,120,48,0.22)",alignSelf:"center",flexShrink:0}}>
              <span style={{fontSize:10}}>⚠</span>
              <span style={{fontFamily:FF.s,fontSize:8,color:"#C47830",letterSpacing:"0.06em"}}>Stale data</span>
            </div>
          )}
        </div>

      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
        {!isEvening ? (
          <div style={CS(16,"20px","0 1px 4px rgba(0,0,0,.05)")}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>Last Night</div>
                <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.text}}>Sleep Report</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:FF.r,fontSize:30,fontWeight:600,color:"#3A5C48",letterSpacing:"-0.02em",lineHeight:1}}>{SLEEP.perf}%</div>
                <div style={S.mut9}>performance</div>
              </div>
            </div>
            <div style={{display:"flex",height:14,borderRadius:7,overflow:"hidden",marginBottom:10}}>
              {[{v:SLEEP.light,c:"#4A6070"},{v:SLEEP.rem,c:"#7A5A80"},{v:SLEEP.deep,c:"#3A5C48"}].map(({v,c},i)=>(
                <div key={i} style={{flex:v,background:c,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {v>=1.5&&<span style={{fontFamily:FF.s,fontSize:7,color:"rgba(255,255,255,0.75)",fontWeight:600}}>{v}h</span>}
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:12,marginBottom:14}}>
              {[{label:"Light",v:SLEEP.light,c:"#4A6070"},{label:"REM",v:SLEEP.rem,c:"#7A5A80"},{label:"Deep",v:SLEEP.deep,c:"#3A5C48"}].map(({label,v,c})=>(
                <div key={label} style={S.row4}>
                  <div style={{width:7,height:7,borderRadius:2,background:c}}/>
                  <span style={S.mut9}>{label}</span>
                  <span style={{fontFamily:FF.m,fontSize:9,color:P.text,fontWeight:500}}>{v}h</span>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[
                {l:"Total",   v:`${SLEEP.dur}h`,        c:"#4A6070"},
                {l:"Deep SWS",v:`${SLEEP.deep}h`,       c:"#3A5C48"},
                {l:"Resp Rate",v:`${SLEEP.resp} rpm`,   c:SLEEP.resp>16?"#C4604A":P.muted},
              ].map(({l,v,c})=>(
                <div key={l} style={{padding:"8px 10px",background:P.panel,borderRadius:8}}>
                  <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{l}</div>
                  <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color:c,letterSpacing:"-0.01em"}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Readiness Summary */}
            <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${P.border}`}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",
                textTransform:"uppercase",marginBottom:10}}>Readiness</div>
              {(()=>{
                const hrv   = WHOOP.hrv;
                const rec   = WHOOP.recovery;
                const rhr   = WHOOP.rhr;
                const HRV_MEAN = 44.4;
                // Zone label
                const zone = hrv >= HRV_MEAN+5 ? {label:"Peak",      color:"#3A9C68", icon:"🟢", tip:"Push hard — nervous system primed."}
                           : hrv >= HRV_MEAN-3  ? {label:"Normal",    color:"#C47830", icon:"🟡", tip:"Train as planned, monitor fatigue."}
                           : hrv >= HRV_MEAN-10 ? {label:"Reduced",   color:"#C4604A", icon:"🟠", tip:"Moderate intensity only. Prioritize sleep tonight."}
                                                 : {label:"Low",       color:"#B84A38", icon:"🔴", tip:"Recovery day — no high-intensity work."};
                const recLabel = rec>=76?"High":rec>=58?"Normal":rec>=33?"Low":"Very Low";
                const rhrDelta = rhr - 51; // vs your avg 51 bpm
                const metrics = [
                  {label:"Recovery", val:`${rec}%`,    sub:recLabel,                       color:rec>=76?"#3A9C68":rec>=58?"#C47830":"#C4604A"},
                  {label:"HRV",      val:`${hrv} ms`,  sub:`${hrv>=HRV_MEAN?"+":""}${(hrv-HRV_MEAN).toFixed(0)} vs avg`, color:zone.color},
                  {label:"RHR",      val:`${rhr} bpm`, sub:`${rhrDelta>=0?"+":""}${rhrDelta} vs avg`,                     color:rhr<=48?"#3A9C68":rhr<=52?"#C47830":"#C4604A"},
                ];
                return(
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <span style={{fontSize:16}}>{zone.icon}</span>
                      <div>
                        <span style={{fontFamily:FF.s,fontSize:12,fontWeight:700,color:zone.color}}>{zone.label} Zone</span>
                        <span style={{fontFamily:FF.s,fontSize:10,color:P.sub,marginLeft:6}}>{zone.tip}</span>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {metrics.map(({label,val,sub,color})=>(
                        <div key={label} style={{padding:"8px 10px",background:P.panel,borderRadius:8,
                          border:`1px solid ${color}22`}}>
                          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",
                            letterSpacing:"0.06em",marginBottom:3}}>{label}</div>
                          <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color,
                            letterSpacing:"-0.01em",marginBottom:1}}>{val}</div>
                          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted}}>{sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        ) : (
          /* Evening: sleep + tomorrow preview */
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:P.cardDk,border:`1px solid ${P.borderDk}`,borderRadius:16,padding:"18px",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Tonight's Schedule</div>
              {(()=>{
               
                const wakeH = tomorrowSchedule ? Math.max(6, tomorrowSchedule.timeH - 1) : 6;
                const wakeStr = wakeH < 12 ? `${wakeH}:00 AM` : `${wakeH-12}:00 PM`;
                const bedH = wakeH - 9; // 9h sleep window
                const bedStr = bedH <= 0 ? `${12+bedH}:00 AM` : `${bedH}:00 PM`;
                return([
                  {time:"9:00 PM",  action:"Wind-down — dim lights, cool room to 68°F"},
                  {time:"9:30 PM",  action:"Magnesium glycinate (400mg), no screens"},
                  {time:bedStr,     action:"Target sleep onset — 9h window"},
                  {time:wakeStr,    action:tomorrowSchedule
                    ? `Wake for ${tomorrowSchedule.name} at ${tomorrowSchedule.time}`
                    : "Wake target — natural light immediately"},
                  ...(tomorrowSchedule?[{
                    time:tomorrowSchedule.time,
                    action:`${tomorrowSchedule.name} · ~${tomorrowSchedule.dur}m · avg ${tomorrowSchedule.strain} strain`,
                    highlight:true,
                  }]:[]),
                ].map(({time,action,highlight})=>(
                  <div key={time} style={{display:"flex",gap:12,marginBottom:8,alignItems:"flex-start"}}>
                    <span style={{fontFamily:FF.m,fontSize:9,color:highlight?"#7AC49A":"#C4A850",minWidth:55,marginTop:1,flexShrink:0}}>{time}</span>
                    <span style={{fontFamily:FF.s,fontSize:10,color:highlight?"#A8D8B8":P.sub,lineHeight:1.5,fontWeight:highlight?500:400}}>{action}</span>
                    {highlight&&<span style={{fontSize:10,flexShrink:0}}>{tomorrowSchedule?.icon}</span>}
                  </div>
                )));
              })()}
              <div style={{marginTop:8,padding:"8px 10px",background:"rgba(255,255,255,0.05)",borderRadius:7,fontFamily:FF.s,fontSize:9,color:P.mutedDk}}>
                Last night: {SLEEP.dur}h · {SLEEP.perf}% performance
              </div>
            </div>
            <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>{tomorrowDayName} · Anticipated</div>
                <button onClick={()=>setTomorrowEditing(!tomorrowEditing)}
                  style={{fontFamily:FF.s,fontSize:9,padding:"3px 10px",borderRadius:6,border:`1px solid ${P.border}`,background:tomorrowEditing?P.cardDk:P.panel,color:tomorrowEditing?P.textInv:P.sub,cursor:"pointer"}}>
                  {tomorrowEditing?"Done":"Edit plan"}
                </button>
              </div>

              {tomorrowEditing?(
                /* Edit mode */
                <div>
                  <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,marginBottom:8}}>What are you planning tomorrow?</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                    {[
                      {name:"Functional Fitness",icon:"🏋",color:"#3A5C48"},
                      {name:"Running",            icon:"🏃",color:"#C47830"},
                      {name:"Spin",               icon:"🚴",color:"#C4604A"},
                      {name:"Walking",            icon:"🚶",color:"#7A5A80"},
                      {name:"Rest day",           icon:"😴",color:"#6B6057"},
                    ].map(w=>{
                      const isSelected = tomorrowCustom?.name===w.name;
                      return(
                        <div key={w.name} onClick={()=>setTomorrowCustom(isSelected?null:w)}
                          style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:7,cursor:"pointer",
                            background:isSelected?w.color+"18":P.panel,
                            border:`1px solid ${isSelected?w.color+"55":P.border}`,transition:"all .15s"}}>
                          <span style={{fontSize:13}}>{w.icon}</span>
                          <span style={{fontFamily:FF.s,fontSize:10,fontWeight:isSelected?600:400,color:isSelected?w.color:P.sub}}>{w.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <textarea value={tomorrowNote} onChange={e=>setTomorrowNote(e.target.value)}
                    placeholder="Add a note (e.g. 7am with Jake, targeting tempo pace...)"
                    style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${P.border}`,
                      background:P.panel,fontFamily:FF.s,fontSize:10,color:P.text,resize:"none",
                      outline:"none",lineHeight:1.5,boxSizing:"border-box"}}
                    rows={2}/>
                </div>
              ):(
                /* Display mode */
                <div>
                  {(()=>{
                    const plan = tomorrowCustom || tomorrowSchedule;
                    if(!plan) return <div style={S.mut10}>No workout pattern for {tomorrowDayName}.</div>;
                    const isCustom = !!tomorrowCustom;
                    return(
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:plan.color+"0D",borderRadius:10,border:`1px solid ${plan.color}22`}}>
                        <span style={{fontSize:22}}>{plan.icon}</span>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            <span style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.text}}>{plan.name}</span>
                            {!isCustom&&<span style={{fontFamily:FF.m,fontSize:8,color:plan.color,background:plan.color+"18",padding:"1px 6px",borderRadius:4}}>{plan.freq}%</span>}
                            {isCustom&&<span style={{fontFamily:FF.s,fontSize:8,color:P.sage,background:P.sageBg,padding:"1px 6px",borderRadius:4}}>Custom</span>}
                          </div>
                          <div style={S.mut9}>
                            {isCustom
                              ? (tomorrowNote||"Tap 'Edit plan' to add details")
                              : `${plan.time} · ~${plan.dur}m · ${plan.strain} avg strain · ${plan.freq}% frequency`}
                          </div>
                          {tomorrowNote&&isCustom&&<div style={{fontFamily:FF.s,fontSize:9,color:P.sub,marginTop:3}}>📝 {tomorrowNote}</div>}
                        </div>
                      </div>
                    );
                  })()}
                  {!tomorrowCustom&&tomorrowSchedule&&(
                    <div style={{marginTop:8,fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.5}}>
                      Pattern-based prediction from your training history. Tap "Edit plan" to override.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <div style={CS(16,"20px","0 1px 4px rgba(0,0,0,.05)")}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:16}}>
            {isMorning?"Today's Training Plan":isEvening?"Today's Training Recap":"Training · Today"}
          </div>
          {doneToday.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.sage,fontWeight:600,marginBottom:6}}>✓ Completed</div>
              {doneToday.map((w,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 11px",background:w.color+"0D",borderRadius:10,border:`1px solid ${w.color}20`,marginBottom:6}}>
                  <span style={{fontSize:18,lineHeight:1}}>{w.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>{w.name}</span>
                      <span style={S.mut9}>{w.time}</span>
                    </div>
                    <div style={{fontFamily:FF.m,fontSize:9,color:P.muted}}>{w.dur}m · {w.cal} cal</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.sage}}>{w.strain}</div>
                    <div style={{fontFamily:FF.s,fontSize:7,color:P.muted}}>strain</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isEvening&&planned.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.amber,fontWeight:600,marginBottom:6}}>
                {planned[0].isCanonical ? `Expected · ${planned[0].time}` : "Alternative"}
              </div>
              {planned.map((w,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 11px",background:w.color+"08",borderRadius:10,border:`1px dashed ${w.color}44`,marginBottom:6}}>
                  <span style={{fontSize:18,lineHeight:1,opacity:.7}}>{w.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={S.rowsb}>
                      <span style={{fontFamily:FF.s,fontSize:11,fontWeight:500,color:P.sub}}>{w.name}</span>
                      {w.freq&&<span style={{fontFamily:FF.m,fontSize:8,color:w.color,background:w.color+"18",padding:"1px 6px",borderRadius:4}}>{w.freq}%</span>}
                    </div>
                    <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {doneToday.length===0&&(
            <div style={{padding:"14px",background:P.panel,borderRadius:10,border:`1px solid ${P.border}`,marginBottom:12}}>
              <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6}}>
                {isEvening?"Rest day — muscle protein synthesis peaks on recovery days. Tonight's sleep is the training.":"No workouts logged yet. "+(isMorning?"Ready when you are.":"Still time for a session today.")}
              </div>
            </div>
          )}
          {isMorning&&(
            <div>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:6}}>Yesterday</div>
              {yesterday.map((w,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 11px",background:P.panel,borderRadius:9,border:`1px solid ${P.border}`,marginBottom:4}}>
                  <span style={{fontSize:16,lineHeight:1}}>{w.icon}</span>
                  <div style={{flex:1}}>
                    <span style={S.sub10}>{w.name}</span>
                    <span style={{fontFamily:FF.m,fontSize:9,color:P.muted,marginLeft:8}}>{w.dur}m · {w.strain} strain</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{marginTop:12,background:`linear-gradient(135deg,${P.panel},${P.card})`,borderRadius:12,border:`1px solid ${P.border}`,padding:"12px 14px",overflow:"hidden",position:"relative"}}>
            <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>
              Estimated Daily Calories
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:10}}>
              <div style={{fontFamily:FF.r,fontSize:28,fontWeight:600,color:P.amber,letterSpacing:"-0.02em",lineHeight:1}}>
                {canonicalAhead ? `~${estimatedTDEE.toLocaleString()}` : confirmedTDEE.toLocaleString()}
              </div>
              <div style={S.mut10}>kcal {canonicalAhead?"projected":"burned"}</div>
            </div>
            {[
              {label:"RMR",      val:RMR_DAILY,    pct:RMR_DAILY/estimatedTDEE*100,      color:P.steel,   note:"Resting metabolic rate"},
              {label:"NEAT",     val:NEAT_DAILY,   pct:NEAT_DAILY/estimatedTDEE*100,     color:P.clay,    note:"Lifestyle activity"},
              {label:"Exercise", val:calsBurned,   pct:calsBurned/estimatedTDEE*100,     color:P.terra,   note:doneToday.map(w=>w.name).join(" + ")||"—",done:true},
              ...(projectedExCal>0?[{label:"Expected",val:projectedExCal,pct:projectedExCal/estimatedTDEE*100,color:P.amber,note:`${todaySchedule?.name} ahead`,projected:true}]:[]),
            ].map(({label,val,pct,color,note,done,projected})=>(
              <div key={label} style={{marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <div style={S.row6}>
                    <div style={{width:6,height:6,borderRadius:2,background:color,flexShrink:0,opacity:projected?0.5:1}}/>
                    <span style={{fontFamily:FF.s,fontSize:9,color:projected?P.muted:P.sub,fontStyle:projected?"italic":"normal"}}>{label}</span>
                    <span style={{fontFamily:FF.s,fontSize:8,color:P.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{note}</span>
                  </div>
                  <span style={{fontFamily:FF.m,fontSize:10,fontWeight:500,color:projected?P.muted:color}}>
                    {val.toLocaleString()}
                  </span>
                </div>
                <div style={{height:3,background:P.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.round(pct)}%`,background:color,borderRadius:2,opacity:projected?0.4:1,transition:"width 0.9s cubic-bezier(0.34,1.2,0.64,1)"}}/>
                </div>
              </div>
            ))}
            {canonicalAhead&&<div style={{marginTop:8,fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.5}}>
              Projected total includes ~{projectedExCal} kcal from upcoming {todaySchedule?.name}.
            </div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:6,marginTop:8}}>
            <div style={{padding:"8px 12px",background:P.panel,borderRadius:8,border:`1px solid ${P.border}`}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:2}}>Week strain</div>
              <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.amber,letterSpacing:"-0.01em"}}>
                {(74.3+strainSoFar).toFixed(0)}
              </div>
            </div>
            <div style={{padding:"8px 12px",background:P.panel,borderRadius:8,border:`1px solid ${P.border}`}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:2}}>Exercise cal today</div>
              <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.terra,letterSpacing:"-0.01em"}}>{calsBurned.toLocaleString()}</div>
            </div>
          </div>
        </div>
      <div style={CS(16,"20px","0 1px 4px rgba(0,0,0,.05)")}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>
              {calLabel2==="tomorrow"?"Tomorrow":"Today"}
            </div>
            <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.text}}>Schedule</div>
          </div>
          <div style={{textAlign:"right"}}>
            {calEvents===null&&(
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:P.amber,opacity:0.6}}/>
                <span style={S.mut9}>Loading…</span>
              </div>
            )}
            {calEvents&&(
              <>
                <div style={{fontFamily:FF.r,fontSize:30,fontWeight:600,color:P.amber,
                  letterSpacing:"-0.02em",lineHeight:1}}>{calEvents.length}</div>
                <div style={S.mut9}>
                  event{calEvents.length!==1?"s":""}
                </div>
              </>
            )}
          </div>
        </div>
        {calEvents&&calEvents.length>0&&(
          <div style={S.col7}>
            {calEvents.map((ev,i)=>{
              const col = calColor(ev.calendar);
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,
                  padding:"9px 11px",borderRadius:10,
                  background:P.panel,border:`1px solid ${P.border}`}}>
                  <div style={{width:3,alignSelf:"stretch",borderRadius:2,
                    background:col,flexShrink:0,minHeight:20}}/>
                  <div style={{flexShrink:0,minWidth:58}}>
                    <div style={{fontFamily:FF.m,fontSize:10,fontWeight:600,color:col}}>
                      {ev.allDay?"All day":fmtEvtTime(ev.start)}
                    </div>
                    {!ev.allDay&&ev.end&&(
                      <div style={{fontFamily:FF.m,fontSize:8,color:P.muted}}>
                        – {fmtEvtTime(ev.end)}
                      </div>
                    )}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.summary}</div>
                    {ev.location&&(
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:1,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        📍 {ev.location}
                      </div>
                    )}
                  </div>
                  <div style={{fontFamily:FF.s,fontSize:7.5,fontWeight:600,color:col,
                    background:col+"14",padding:"2px 6px",borderRadius:4,
                    flexShrink:0,letterSpacing:"0.04em"}}>
                    {calLabel(ev.calendar)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {calEvents&&calEvents.length===0&&!calError&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[
              {l:"Meetings",v:"0",c:P.steel},
              {l:"Commitments",v:"0",c:P.muted},
              {l:"Clear day",v:"✓",c:P.sage},
            ].map(({l,v,c})=>(
              <div key={l} style={{padding:"10px",background:P.panel,borderRadius:9}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{l}</div>
                <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:c}}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {calError&&(
          <div style={{fontFamily:FF.s,fontSize:10,color:P.terra,padding:"9px 12px",
            borderRadius:8,background:P.terracottaBg,border:`1px solid ${P.terra}33`}}>
            ⚠ Calendar unavailable — {calError}
          </div>
        )}
      </div>

      </div>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>7-Day Trend</div>
            <div style={{fontFamily:FF.r,fontSize:14,fontWeight:600,color:P.text}}>Recovery · HRV</div>
          </div>
          <div style={{display:"flex",gap:12}}>
            {[{c:"#3A5C48",l:"Recovery %"},{c:"#4A6070",l:"HRV ms",dash:"4 2"}].map(({c,l,dash})=>(
              <div key={l} style={S.row5}>
                <svg width={14} height={2}><line x1={0} y1={1} x2={14} y2={1} stroke={c} strokeWidth={2} strokeDasharray={dash}/></svg>
                <span style={S.mut9}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={95}>
          <LineChart data={recTrend} margin={{top:4,right:8,left:-24,bottom:0}}>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax}/>
            <YAxis yAxisId="rec" {...ax} domain={[0,100]}/>
            <YAxis yAxisId="hrv" orientation="right" {...ax} domain={[20,80]}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:4,fontSize:9,textTransform:"uppercase"}}>{label}</div>{payload.map(p=><div key={p.name} style={{display:"flex",gap:8,marginBottom:2}}><span style={{color:p.color,minWidth:70}}>{p.name}</span><span style={{fontFamily:FF.m,color:P.text}}>{p.value}</span></div>)}</div>):null}/>
            <ReferenceLine yAxisId="rec" y={80} stroke="#3A5C48" strokeDasharray="3 3" strokeOpacity={0.35}/>
            <Line yAxisId="rec" type="monotone" dataKey="rec" stroke="#3A5C48" strokeWidth={2} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out"
              dot={(p)=><circle key={p.index} cx={p.cx} cy={p.cy} r={p.index===6?5:3} fill={recColor(p.value)} stroke={P.card} strokeWidth={1.5}/>}
              name="Recovery"/>
            <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke="#4A6070" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="HRV ms" isAnimationActive={true} animationDuration={1100} animationEasing="ease-out"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>
          {isMorning?"Morning Guidance":isEvening?"Evening Guidance":"Afternoon Guidance"}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:11}}>
          {guidance.map((g,i)=>(
            <div key={i} onClick={g.page?()=>setPage(g.page):undefined}
              style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"15px",cursor:g.page?"pointer":"default",
                transition:"box-shadow .15s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}
              onMouseEnter={e=>{if(g.page)e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.09)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:17,lineHeight:1}}>{g.icon}</span>
                  <span style={{fontFamily:FF.s,fontWeight:600,fontSize:12,color:P.text}}>{g.title}</span>
                </div>
                {g.action&&<span style={{fontFamily:FF.s,fontSize:9,color:P.steel,whiteSpace:"nowrap",marginLeft:8,flexShrink:0}}>{g.action} →</span>}
              </div>
              <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.65}}>{g.body}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:16,alignItems:"stretch"}}>
        <div onClick={()=>setPage("score")} style={{background:P.cardDk,borderRadius:16,padding:"18px 24px",cursor:"pointer",
          transition:"box-shadow .15s",boxShadow:"0 1px 4px rgba(0,0,0,0.08)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:130}}
          onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.15)"}
          onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.08)"}>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>VITAL Score</div>
          <div style={{fontFamily:FF.r,fontSize:58,fontWeight:600,color:P.textInv,lineHeight:1,letterSpacing:"-0.03em"}}>{SCORES_NOW.master.score}</div>
          <div style={{fontFamily:FF.s,fontSize:10,color:"#C4A850",marginTop:6,fontWeight:500}}>{SCORE_LABEL(SCORES_NOW.master.score)}</div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,marginTop:4}}>Full report →</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
          {[
            {icon:"⚡",label:"Health Score",sub:`${SCORES_NOW.master.score}/100`,    page:"score",   flag:false},
            {icon:"🏃",label:"Fitness",     sub:"8W · 95.2 peak", page:"fitness", flag:false},
            {icon:"📅",label:"Calendar",    sub:"Mar activity",   page:"calendar",flag:false},
            {icon:"🧬",label:"Labs",        sub:"May 23 · 3 flags",page:"labs",   flag:true},
            {icon:"📐",label:"Body Comp",   sub:"DXA Jan 2026",   page:"body",    flag:false},
            {icon:"⊞",label:"Overview",    sub:"All metrics",    page:"overview",flag:false},
          ].map(({icon,label,sub,page,flag})=>(
            <div key={label} onClick={()=>setPage(page)} style={{background:P.card,border:`1px solid ${flag?P.terra+"44":P.border}`,borderRadius:12,
              padding:"12px 14px",cursor:"pointer",transition:"all .15s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.08)";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)";e.currentTarget.style.transform="none";}}>
              <div style={{fontSize:18,marginBottom:6}}>{icon}</div>
              <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:flag?P.terra:P.text,marginBottom:2}}>{label}</div>
              <div style={S.mut9}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Overview({setPage}){
  const ax={tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};
  const masterScore=SCORES_NOW.master.score;
  const masterPrev=SCORES_NOW.master.prev;
  const masterDelta=masterScore-masterPrev;
  const scoreColor=SCORE_COLOR(masterScore);
  // Reactive weight — reads from localStorage so imports reflect without full reload
  const [liveWeight, setLiveWeight] = useState(()=>{
    try{
      const imp=JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
      return imp.length>0 ? imp[0].wt : LATEST.weight;
    }catch(e){ return LATEST.weight; }
  });
  const [liveWeightDate, setLiveWeightDate] = useState(()=>{
    try{
      const imp=JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
      return imp.length>0 ? imp[0].d : LATEST.weightDate;
    }catch(e){ return LATEST.weightDate; }
  });
  useEffect(()=>{
    const onStorage=()=>{
      try{
        const imp=JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
        if(imp.length>0){ setLiveWeight(imp[0].wt); setLiveWeightDate(imp[0].d); }
      }catch(e){}
    };
    window.addEventListener("storage",onStorage);
    return()=>window.removeEventListener("storage",onStorage);
  },[]);

  return(<div style={{display:"flex",flexDirection:"column",gap:20}}>
    {/* Weekly Report Export */}
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}>
      <button onClick={generateWeeklyReport}
        style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:9,
          border:`1px solid ${P.border}`,background:P.card,cursor:"pointer",
          fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.sub,
          boxShadow:"0 1px 3px rgba(0,0,0,.04)",transition:"all .15s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=P.amber;e.currentTarget.style.color=P.amber;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.color=P.sub;}}>
        <span style={{fontSize:14}}>📄</span> Export Weekly Report
      </button>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:16,alignItems:"stretch",flexWrap:"wrap"}}>
      <div onClick={()=>setPage("score")} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"28px 32px",cursor:"pointer",transition:"box-shadow .2s",boxShadow:"0 1px 4px rgba(0,0,0,.06)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:220}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.10)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.06)"}>
        <div style={{position:"relative",marginBottom:14}}>
          <svg width={160} height={160} style={{transform:"rotate(-90deg)"}}>
            <circle cx={80} cy={80} r={66} fill="none" stroke={P.panel} strokeWidth={8}/>
            <AnimRing cx={80} cy={80} r={66} stroke={scoreColor} sw={8} pct={masterScore/100} color={scoreColor} delay={200}/>
            {[0,20,40,60,80].map(pct=>{
              const angle=(pct/100)*2*Math.PI-Math.PI/2;
              const x1=80+62*Math.cos(angle),y1=80+62*Math.sin(angle);
              const x2=80+70*Math.cos(angle),y2=80+70*Math.sin(angle);
              return <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.border} strokeWidth={1.5}/>;
            })}
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:FF.r,fontSize:64,fontWeight:600,color:P.text,lineHeight:1,letterSpacing:"-0.02em"}}>{masterScore}</div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:3}}>/ 100</div>
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:5}}>VITAL Score</div>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color:scoreColor,letterSpacing:"-0.01em"}}>{SCORE_LABEL(masterScore)}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:6}}>
            <span style={{fontFamily:FF.s,fontSize:11,color:masterDelta>0?P.sage:P.terra,fontWeight:500}}>
              {masterDelta>0?"+":""}{masterDelta} pts since Feb
            </span>
            <span style={S.mut10}>· B+ grade</span>
          </div>
        </div>
      </div>

    </div>
    
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:12}}>
      <StatCard icon="💚" label="Recovery"    value={WHOOP.recovery}   unit="/100" color={P.sage}   delta={null} sparkData={T.rec}/>
      <StatCard icon="💓" label="HRV"         value={WHOOP.hrv}        unit="ms"   color={P.steel}  delta={2.1}  sparkData={T.hrv}/>
      <StatCard icon="❤" label="Resting HR"  value={WHOOP.rhr}        unit="bpm"  color={P.terra}  delta={-1.4} sparkData={T.rhr}/>
      <StatCard icon="⚖" label="Weight"      value={liveWeight}       unit="lbs"  color={P.steel}  delta={LATEST.weight7dDelta} sub={`Hume · ${liveWeightDate}`}/>
      <StatCard icon="🫀" label="Body Fat"    value={LATEST.bodyFat}   unit="%"    color={P.clay}   delta={-11.6}/>
      <StatCard icon="💪" label="Lean Mass"   value={LATEST.leanMass}  unit="lbs"  color={P.sage}   delta={5.7}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
      <div onClick={()=>setPage("labs")} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"20px",cursor:"pointer",transition:"box-shadow .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)"}>
        <SLabel color={P.terra}>Latest Labs · May 23</SLabel>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {LABS.outOfRange.map(f=>(
            <div key={f.name} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:7,background:f.status==="high"?P.terracottaBg:P.amberBg,border:`1px solid ${f.status==="high"?"#C4604A33":"#C4783033"}`}}>
              <span style={{fontFamily:FF.s,fontSize:10,fontWeight:500,color:f.status==="high"?P.terra:P.amber}}>{f.status==="high"?"↑":"↓"} {f.name}</span>
            </div>
          ))}
        </div>
        {[
          {name:"HbA1c",   val:"5.3%",    status:"normal", range:"<5.7"},
          {name:"LDL",     val:"72",      status:"normal", range:"<100 mg/dL"},
          {name:"CRP",     val:"<0.2",    status:"normal", range:"<1.0 mg/L"},
          {name:"Ferritin",val:"178.2",   status:"normal", range:"<274.7"},
          {name:"Vit D",   val:"36.5",    status:"normal", range:"30–100"},
          {name:"Testo.",  val:"377.1",   status:"normal", range:"300–890"},
        ].map(b=>{
          const c=b.status==="normal"?P.sage:P.terra;
          return(<div key={b.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${P.panel}`}}>
            <span style={{fontFamily:FF.s,fontSize:11,color:P.sub}}>{b.name}</span>
            <div style={S.row8}>
              <span style={{fontFamily:FF.m,fontSize:11,fontWeight:500,color:P.text}}>{b.val}</span>
              <span style={{fontFamily:FF.s,fontSize:8,color:c,background:c+"15",padding:"1px 7px",borderRadius:99}}>{b.status==="normal"?"Optimal":"Flag"}</span>
            </div>
          </div>);
        })}
        <div style={{marginTop:12,fontFamily:FF.s,fontSize:10,color:P.muted}}>View full panel →</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"18px 20px",flex:1,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <SLabel color={P.sage} right="WHOOP · 30 days">HRV Trend</SLabel>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={T.hrv} margin={{top:4,right:0,left:-22,bottom:0}}>
              <defs><linearGradient id="gHrvOv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.sage} stopOpacity={.15}/>
                <stop offset="100%" stopColor={P.sage} stopOpacity={0}/>
              </linearGradient></defs>
              <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="d" {...ax} interval={5}/>
              <YAxis {...ax} domain={["auto","auto"]}/>
              <Tooltip content={<CTip/>}/>
              <Area type="monotone" dataKey="v" stroke={P.sage} strokeWidth={1.5} fill="url(#gHrvOv)" dot={false} name="HRV ms" isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" activeDot={{r:3,fill:P.sage}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <SLabel color={P.steel}>Sleep · WHOOP</SLabel>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12}}>
            {[
              {label:"Avg Night",  val:fmtH(WHOOP.sleep.hours), color:P.steel},
              {label:"Performance",val:`${WHOOP.sleep.score}%`,color:P.sage},
              {label:"REM",       val:fmtH(WHOOP.sleep.rem),  color:P.violet},
              {label:"Deep SWS",  val:fmtH(WHOOP.sleep.deep), color:P.steel},
            ].map(({label,val,color})=>(
              <div key={label} style={{padding:"10px 12px",background:P.panel,borderRadius:10}}>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
                <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>);
}

/* --- LAB TREND DATA ---------------------------------------------
 * ★ = real BioLab data (Feb 14 2025 + May 23 2025)
 * Prior points = estimated baselines from typical trajectories
 */
const LAB_HISTORY = {
  lipids: [
    { d:"Feb '23",   trig:210,  hdl:35,  ldl:82,  chol:158, apob:82,  crp:1.4  },
    { d:"Aug '24",   trig:188,  hdl:38,  ldl:68,  chol:142, apob:73,  crp:0.9  },
    { d:"Feb 14 ★",  trig:183,  hdl:38,  ldl:64,  chol:139, apob:71,  crp:0.9  },
    { d:"May 23 ★",  trig:66,   hdl:60,  ldl:72,  chol:145, apob:66,  crp:0.2  },
  ],
  metabolic: [
    { d:"Feb '23",   hba1c:5.5, glucose:103, alt:44, ast:28, egfr:94,  creatinine:0.92 },
    { d:"Aug '24",   hba1c:5.3, glucose:99,  alt:40, ast:23, egfr:97,  creatinine:0.90 },
    { d:"Feb 14 ★",  hba1c:5.2, glucose:98,  alt:39, ast:22, egfr:97,  creatinine:0.90 },
    { d:"May 23 ★",  hba1c:5.3, glucose:84,  alt:28, ast:26, egfr:77,  creatinine:1.10 },
  ],
  hormones: [
    { d:"Feb '23",   testo:520,   dheas:148,   vitd:22,   tsh:1.5,  cortisol:13.2 },
    { d:"Aug '24",   testo:555,   dheas:126,   vitd:26,   tsh:1.32, cortisol:11.9 },
    { d:"Feb 14 ★",  testo:560,   dheas:119.1, vitd:26.5, tsh:1.30, cortisol:11.7 },
    { d:"May 23 ★",  testo:377.1, dheas:460.3, vitd:36.5, tsh:1.21, cortisol:9.1  },
  ],
  special: [
    { d:"Feb '23",   ferritin:320,   homocysteine:13.8, psa:0.720 },
    { d:"Aug '24",   ferritin:378,   homocysteine:12.6, psa:0.820 },
    { d:"Feb 14 ★",  ferritin:394.5, homocysteine:12.3, psa:0.845 },
    { d:"May 23 ★",  ferritin:178.2, homocysteine:10.2, psa:0.766 },
  ],
  cbc: [
    { d:"Feb '23",   hgb:15.2, wbc:8.8, plt:210, hct:43.8, rbc:4.91 },
    { d:"Aug '24",   hgb:14.9, wbc:9.4, plt:197, hct:42.7, rbc:4.86 },
    { d:"Feb 14 ★",  hgb:14.8, wbc:9.5, plt:194, hct:42.4, rbc:4.85 },
    { d:"May 23 ★",  hgb:15.2, wbc:6.1, plt:206, hct:45.5, rbc:5.13 },
  ],
};

// Per-metric ref lines {high, low, optimal, color, label, unit}
const LAB_REFS = {
  // Lipids
  trig:     { high:150, optimal:100,  color:"#C47830", label:"Triglycerides",  unit:"mg/dL"  },
  hdl:      { low:40,   optimal:55,   color:"#3A5C48", label:"HDL",            unit:"mg/dL"  },
  ldl:      { high:100, optimal:70,   color:"#C4604A", label:"LDL",            unit:"mg/dL"  },
  chol:     { high:200, optimal:160,  color:"#8A6050", label:"Total Chol",     unit:"mg/dL"  },
  apob:     { high:90,  optimal:70,   color:"#C4604A", label:"ApoB",           unit:"mg/dL"  },
  crp:      { high:1.0, optimal:0.5,  color:"#C47830", label:"CRP (Cardiac)",  unit:"mg/L"   },
  // Metabolic
  hba1c:    { high:5.7, optimal:5.0,  color:"#C47830", label:"HbA1c",          unit:"%"      },
  glucose:  { high:99,  low:65, optimal:85, color:"#3A5C48", label:"Glucose",  unit:"mg/dL"  },
  alt:      { high:45,  optimal:25,   color:"#C4604A", label:"ALT / SGPT",     unit:"U/L"    },
  ast:      { high:34,  optimal:22,   color:"#C4604A", label:"AST / SGOT",     unit:"U/L"    },
  egfr:     { low:60,   optimal:90,   color:"#3A5C48", label:"eGFR",           unit:"mL/min" },
  creatinine:{ high:1.25,low:0.75, optimal:0.95, color:"#4A6070", label:"Creatinine", unit:"mg/dL" },
  // Hormones
  testo:    { low:400,  optimal:600,  color:"#3A5C48", label:"Testosterone",   unit:"ng/dL"  },
  dheas:    { high:447.6, low:136.2, optimal:300, color:"#C47830", label:"DHEA-S", unit:"µg/dL" },
  vitd:     { low:30,   optimal:55,   color:"#3A5C48", label:"Vitamin D",      unit:"ng/mL"  },
  tsh:      { high:2.5, low:0.5, optimal:1.5, color:"#4A6070", label:"TSH",   unit:"µIU/mL" },
  cortisol: { high:19.4, low:3.7, optimal:12, color:"#8A6050", label:"Cortisol", unit:"µg/dL" },
  // Special chemistry
  ferritin: { high:274.7, optimal:120, color:"#C4604A", label:"Ferritin",      unit:"ng/mL"  },
  homocysteine:{ high:12, optimal:8,   color:"#C47830", label:"Homocysteine",  unit:"µmol/L" },
  psa:      { high:4.0, optimal:1.5,   color:"#4A6070", label:"PSA",           unit:"ng/mL"  },
  // CBC
  hgb:      { high:17.7, low:12.6, optimal:15.5, color:"#3A5C48", label:"Hemoglobin", unit:"g/dL" },
  wbc:      { high:10.2, low:3.6,  optimal:7.0,  color:"#4A6070", label:"WBC",       unit:"K/µL" },
  plt:      { high:450,  low:150,  optimal:250,  color:"#8A6050", label:"Platelets",  unit:"K/µL" },
  hct:      { high:51.0, low:37.5, optimal:45,   color:"#4A6070", label:"Hematocrit", unit:"%"    },
  rbc:      { high:5.63, low:4.06, optimal:5.0,  color:"#3A5C48", label:"RBC",        unit:"M/µL" },
};

// Which metrics to show trend charts for each panel tab
const PANEL_TREND_KEYS = {
  lipids:   ["trig","hdl","ldl","apob","crp"],
  metabolic:["hba1c","glucose","egfr","alt"],
  hormones: ["testo","dheas","vitd","tsh","cortisol"],
  special:  ["ferritin","homocysteine","psa"],
  cbc:      ["hgb","wbc","hct","rbc"],
};

function Labs(){
  const [activePanel, setActivePanel]=useState("metabolic");
  const panels=[
    {id:"metabolic",label:"Metabolic Panel",color:P.blue},
    {id:"lipids",   label:"Lipid Studies", color:P.amber},
    {id:"cbc",      label:"CBC",           color:P.cyan},
    {id:"hormones", label:"Hormones",      color:P.violet},
    {id:"special",  label:"Special Chem",  color:P.coral},
  ];
  const data = (LABS_MERGED.panels[activePanel] || LABS.panels[activePanel] || []);
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{background:`linear-gradient(135deg,${P.coral}12,${P.card})`,border:`1px solid ${P.coral}44`,borderRadius:14,padding:"16px 18px",display:"flex",gap:16,alignItems:"flex-start"}}>
      <div style={{width:36,height:36,borderRadius:9,background:P.terracottaBg,border:`1px solid ${"#C4604A33"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🧬</div>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
          <div style={{fontFamily:FF.s,fontWeight:700,fontSize:14,color:P.text}}>Lab Results · Most Recent Per Biomarker</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:6}}>
          {[
            {label:"Jan 15, 2026",sublabel:"ExamOne · lipids, metabolic, liver",badge:"LATEST",color:P.sage},
            {label:"May 23, 2025",sublabel:"BioLab · hormones, HbA1c, CRP, ApoB, Ferritin",badge:"MOST RECENT FOR THESE",color:P.steel},
          ].map(({label,sublabel,badge,color})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 11px",
              borderRadius:7,background:color+"0C",border:`1px solid ${color}33`}}>
              <div>
                <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color}}>{label} </span>
                <span style={{fontFamily:FF.s,fontSize:7.5,fontWeight:700,color,background:color+"18",
                  padding:"1px 6px",borderRadius:3,letterSpacing:"0.06em"}}>{badge}</span>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:1}}>{sublabel}</div>
              </div>
            </div>
          ))}
          <div style={{fontFamily:FF.s,fontSize:8.5,color:P.muted,alignSelf:"center"}}>↕ trend vs prior panel shown on each marker</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {LABS.outOfRange.map(f=>(
            <div key={f.name} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:7,background:f.status==="high"?P.coralBg:P.amberBg,border:`1px solid ${(f.status==="high"?P.coral:P.amber)}44`}}>
              <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:f.status==="high"?P.coral:P.amber}}>{f.status==="high"?"↑":"↓"} {f.name}</span>
              <span style={{fontFamily:FF.m,fontSize:10,color:f.status==="high"?P.coral:P.amber}}>{f.val} {f.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{display:"flex",gap:6}}>
      {panels.map(p=><button key={p.id} onClick={()=>setActivePanel(p.id)} style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"6px 14px",borderRadius:7,cursor:"pointer",transition:"all .15s",background:activePanel===p.id?P.cardDk:P.card,color:activePanel===p.id?P.textInv:P.sub,border:`1px solid ${activePanel===p.id?P.cardDk:P.border}`,fontWeight:activePanel===p.id?600:400}}>{p.label}</button>)}
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px"}}>
      <SLabel color={panels.find(p=>p.id===activePanel)?.color} right={`${data.length} markers · most recent per biomarker`}>{panels.find(p=>p.id===activePanel)?.label}</SLabel>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:9}}>
        {data.map((b,i)=><BioCard key={i} {...b}/>)}
      </div>
      {data.some(b=>b.notRedrawn)&&(
        <div style={{fontFamily:FF.s,fontSize:8.5,color:P.amber,padding:"7px 10px",
          borderRadius:7,background:"rgba(196,120,48,0.07)",border:"1px solid rgba(196,120,48,0.2)",marginTop:8}}>
          * Not drawn in Jan 2026 — value shown is May 23, 2025 (BioLab), the most recent available.
        </div>
      )}
    </div>
    {PANEL_TREND_KEYS[activePanel] && (() => {
      const histData = LAB_HISTORY[activePanel] || [];
      const keys = PANEL_TREND_KEYS[activePanel];
      const panelColor = panels.find(p=>p.id===activePanel)?.color || P.cyan;
      const ax = { tick:{fontFamily:FF.m,fontSize:9,fill:P.muted}, axisLine:{stroke:P.border}, tickLine:false };

      // Single-metric mini chart
      const MiniTrend = ({metricKey, historyData}) => {
        const ref = LAB_REFS[metricKey];
        if (!ref) return null;
        const color = ref.color;
        const latest = historyData[historyData.length-1]?.[metricKey];
        const prev    = historyData[historyData.length-2]?.[metricKey];
        const delta   = latest != null && prev != null ? +(latest-prev).toFixed(1) : null;
        const isHigh  = ref.high  && latest > ref.high;
        const isLow   = ref.low   && latest < ref.low;
        const statusColor = isHigh||isLow ? (isHigh?P.coral:P.amber) : P.green;
        const statusLabel = isHigh?"HIGH":isLow?"LOW":"OK";
        return (
          <div style={{background:P.card,border:`1px solid ${isHigh||isLow?statusColor+"55":P.border}`,borderRadius:12,padding:"14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:3}}>{ref.label}</div>
                <div style={{fontFamily:FF.m,fontSize:20,fontWeight:600,color:statusColor,lineHeight:1}}>{latest}<span style={{fontSize:9,color:P.muted,marginLeft:3}}>{ref.unit}</span></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:statusColor,background:statusColor+"18",padding:"2px 6px",borderRadius:3,border:`1px solid ${statusColor}33`}}>{statusLabel}</span>
                {delta!=null&&<span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:delta>0?P.coral:delta<0?P.green:P.muted}}>{delta>0?`+${delta}`:delta}</span>}
              </div>
            </div>
            <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:6}}>
              {ref.optimal&&`Optimal: ${ref.optimal} ${ref.unit}`}
              {ref.optimal&&(ref.high||ref.low)&&" · "}
              {ref.high&&`Upper ref: ${ref.high}`}
              {ref.low&&`Lower ref: ${ref.low}`}
            </div>
            <ResponsiveContainer width="100%" height={72}>
              <LineChart data={historyData} margin={{top:4,right:4,left:-28,bottom:0}}>
                <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
                <XAxis dataKey="d" {...ax} interval={0} tick={{fontFamily:FF.m,fontSize:7,fill:P.muted}}/>
                <YAxis {...ax} domain={["auto","auto"]} tick={{fontFamily:FF.m,fontSize:7,fill:P.muted}}/>
                <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.panel,border:`1px solid ${P.border}`,borderRadius:6,padding:"6px 10px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.sub,marginBottom:2}}>{label}</div><div style={{fontFamily:FF.m,fontWeight:600,color}}>{payload[0]?.value} {ref.unit}</div></div>):null}/>
                {ref.high&&<ReferenceLine y={ref.high} stroke="#C4604A" strokeDasharray="4 3" strokeWidth={1}/>}
                {ref.low&&<ReferenceLine y={ref.low} stroke={P.border} strokeDasharray="3 3" strokeWidth={1}/>}
                {ref.optimal&&<ReferenceLine y={ref.optimal} stroke="#3A5C48" strokeDasharray="4 3" strokeWidth={1}/>}
                <Line type="monotone" dataKey={metricKey} stroke={color} strokeWidth={2} name={ref.label} isAnimationActive={true} animationDuration={900} animationEasing="ease-out"
                  dot={(p)=>{
                    const val=p.value;const isFlag=(ref.high&&val>ref.high)||(ref.low&&val<ref.low);
                    return p.index===historyData.length-1
                      ?<circle key={p.index} cx={p.cx} cy={p.cy} r={5} fill={isFlag?statusColor:color} stroke={P.panel} strokeWidth={2}/>
                      :<circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill={isFlag?statusColor:color} stroke={P.panel} strokeWidth={1}/>;
                  }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      };

      return (
        <div style={{background:P.card,border:`1px solid ${panelColor}33`,borderRadius:14,padding:"18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={S.row8}>
              <div style={{width:3,height:13,borderRadius:2,background:panelColor}}/>
              <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.sub}}>
                {panels.find(p=>p.id===activePanel)?.label} · Trend Since Feb 2023
              </span>
            </div>
            <div style={S.row6}>
              <div style={{width:8,height:1,background:P.coral,borderRadius:1}}/><span style={S.mut8}>upper ref</span>
              <div style={{width:8,height:1,background:P.amber,borderRadius:1,marginLeft:4}}/><span style={S.mut8}>lower ref</span>
              <div style={{width:8,height:1,background:P.green,borderRadius:1,marginLeft:4}}/><span style={S.mut8}>optimal</span>
              <div style={{marginLeft:6,padding:"2px 8px",borderRadius:4,background:P.panel,border:`1px solid ${P.border}`,fontFamily:FF.s,fontSize:8,color:P.muted}}>
                • Feb 14 '25 = real data · prior points estimated
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(keys.length,3)},1fr)`,gap:12}}>
            {keys.map(k=><MiniTrend key={k} metricKey={k} historyData={histData}/>)}
          </div>
        </div>
      );
    })()}
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <SLabel color={P.cyan}>Clinical Analysis</SLabel>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,padding:"3px 10px",borderRadius:5,background:P.panel,border:`1px solid ${P.border}`}}>
          Latest: Jan 15 '26 (lipids/metabolic) · May 23 '25 (hormones/CRP/HbA1c) · Feb 14 '25 (baseline)
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {[
          {title:"Lipid Panel — Jan 2026 Confirmed",color:P.sage,flag:false,badge:"CONFIRMED",
           note:"Jan 15 2026: TG 80 (↓ from 183), HDL 62, LDL 71 — sustained improvement"},
          {title:"Iron Status — Resolved",color:P.sage,flag:false,badge:"RESOLVED",
           note:"Ferritin normalized from 394.5 (Feb 14) to 178.2 ng/mL (May 23) — now well"},
          {title:"Vitamin D — Improved, Continue Protocol",color:P.amber,flag:true,badge:"MONITOR",
           note:"Vitamin D improved from 26.5 (insufficient) to 36.5 ng/mL (May 23) — now i"},
          {title:"BUN — Resolved",color:P.sage,flag:false,badge:"RESOLVED",
           note:"BUN was mildly elevated at 21.0 mg/dL in May '25 (ref 8.9–20.6). Jan '26 E"},
          {title:"Testosterone — Watch Trend",color:P.violet,flag:true,badge:"WATCH",
           note:"Testosterone improved slightly from 342→377 ng/dL (Feb→May), but remains i"},
          {title:"Metabolic Health — Strong",color:P.sage,flag:false,badge:"GOOD",
           note:"Jan '26: Glucose 97 (normal), ALT 24, AST 21, GGT 12 — liver enzymes trend"},
        ].map(({title,color,flag,badge,note})=>(
          <div key={title} style={{padding:"12px 14px",background:flag?color+"08":P.panel,borderRadius:9,border:`1px solid ${flag?color+"44":P.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,flexWrap:"wrap"}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:color,flexShrink:0}}/>
              <span style={{fontFamily:FF.s,fontWeight:700,fontSize:11,color:flag?color:P.text,flex:1}}>{title}</span>
              <span style={{fontFamily:FF.s,fontSize:7.5,fontWeight:700,color:color,background:color+"18",padding:"2px 6px",borderRadius:3,border:`1px solid ${color}33`,letterSpacing:"0.06em"}}>{badge}</span>
            </div>
            <div style={{fontFamily:FF.s,fontSize:10.5,color:P.sub,lineHeight:1.65}}>{note}</div>
          </div>
        ))}
      </div>
    </div>
  </div>);
}

function BodyComp(){
  const [activeRegion, setActiveRegion] = useState(null);
  const ax = {tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  const fatColor = pct =>
    pct < 22 ? "#3A9C68" :    // bright sage-green (lean)
    pct < 26 ? "#C47830" :    // amber (average)
    pct < 30 ? "#C4604A" : "#8B2020"; // terra / high
  const fatLabel = pct =>
    pct < 22 ? "Lean" : pct < 26 ? "Average" : pct < 30 ? "Above Avg" : "High";
  const fatGlow = pct =>
    pct < 22 ? "rgba(58,156,104,0.35)" :
    pct < 26 ? "rgba(196,120,48,0.35)" :
    "rgba(196,96,74,0.40)";

  const REGIONS = [
    {id:"lArm",  name:"Left Arm",  ...DXA.regions.lArm },
    {id:"rArm",  name:"Right Arm", ...DXA.regions.rArm },
    {id:"trunk", name:"Trunk",     ...DXA.regions.trunk },
    {id:"lLeg",  name:"Left Leg",  ...DXA.regions.lLeg },
    {id:"rLeg",  name:"Right Leg", ...DXA.regions.rLeg },
  ];
  const active = REGIONS.find(r=>r.id===activeRegion)||null;
  const trendData=[
    {d:"Feb '25",fat:23.9,lean:151.7,src:"Styku"},
    {d:"May '25",fat:21.1,lean:160.3,src:"Styku"},
    {d:"Jan '26",fat:26.4,lean:149.8,src:"DXA"},
  ];

 
  const RegionCard = ({id,name,leanLbs,fatLbs,totalLbs,fatPct,bmd,onClick,active:isAct})=>{
    const c = fatColor(fatPct); const gl = fatGlow(fatPct);
    return(
      <div onClick={onClick} style={{
        padding:"12px 14px",borderRadius:12,cursor:"pointer",
        background:isAct?"rgba(20,18,16,0.95)":"rgba(18,16,14,0.82)",
        backdropFilter:"blur(8px)",
        border:`1px solid ${isAct?c+"88":"rgba(255,255,255,0.10)"}`,
        boxShadow:isAct?`0 0 20px ${gl}, 0 4px 16px rgba(0,0,0,0.4)`:"0 2px 12px rgba(0,0,0,0.3)",
        transition:"all .25s",minWidth:120,
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:"rgba(255,255,255,0.55)",letterSpacing:"0.06em",textTransform:"uppercase"}}>{name}</div>
          <span style={{fontSize:10,color:isAct?c:"rgba(255,255,255,0.25)"}}>→</span>
        </div>
        <div style={{fontFamily:FF.r,fontSize:22,fontWeight:700,color:"rgba(255,255,255,0.90)",letterSpacing:"-0.02em",lineHeight:1,marginBottom:2}}>
          {leanLbs}<span style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:400,marginLeft:3}}>lbs</span>
        </div>
        <div style={{fontFamily:FF.s,fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:6}}>Lean mass</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:4,background:c+"22",border:`1px solid ${c}44`}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:c}}/>
          <span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:c}}>{fatLabel(fatPct)} · {fatPct}% fat</span>
        </div>
      </div>
    );
  };

 
  const FigureSVG = ()=>{
    const hA  = id => activeRegion === id;
    const col = id => fatColor(REGIONS.find(r=>r.id===id)?.fatPct||26);
    const op  = id => hA(id) ? 0.80 : 0.42;

    const sk  = 'rgba(140,200,180,0.22)';
    const sl  = 'rgba(170,225,205,0.18)';
    const sm  = 'rgba(170,225,205,0.10)';

    return(
      <svg viewBox="0 0 200 460" style={{width:'100%',height:'auto',maxHeight:420,display:'block'}}
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="fg2" x="-25%" y="-5%" width="150%" height="110%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="sk_g" x1="0.25" y1="0" x2="0.75" y2="1">
            <stop offset="0%"   stopColor="#8EC8B8" stopOpacity="0.30"/>
            <stop offset="50%"  stopColor="#60A888" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#3A8868" stopOpacity="0.08"/>
          </linearGradient>
          <linearGradient id="sk_side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#3A8868" stopOpacity="0.18"/>
            <stop offset="30%"  stopColor="#8EC8B8" stopOpacity="0.28"/>
            <stop offset="70%"  stopColor="#8EC8B8" stopOpacity="0.28"/>
            <stop offset="100%" stopColor="#3A8868" stopOpacity="0.18"/>
          </linearGradient>
          <radialGradient id="sk_face" cx="50%" cy="45%" r="55%">
            <stop offset="0%"   stopColor="#9ED8C8" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#5AA888" stopOpacity="0.12"/>
          </radialGradient>
        </defs>

        {/* ── HEAD ─────────────────────────────── */}
        {/* Cranium — slightly wider than jaw */}
        <path d="M 79 8 C 70 8 63 13 61 21 C 58 31 59 43 64 52
                    C 66 56 67 60 67 64 L 67 70
                    C 67 74 70 77 75 79 L 100 82 L 125 79
                    C 130 77 133 74 133 70 L 133 64
                    C 133 60 134 56 136 52 C 141 43 142 31 139 21
                    C 137 13 130 8 121 8 Z"
          fill="url(#sk_face)" stroke={sl} strokeWidth="0.8"/>
        {/* Ear left */}
        <path d="M 61 35 C 57 37 55 42 56 48 C 57 54 61 57 64 55 L 64 32 Z"
          fill="url(#sk_g)" stroke={sm} strokeWidth="0.5"/>
        {/* Ear right */}
        <path d="M 139 35 C 143 37 145 42 144 48 C 143 54 139 57 136 55 L 136 32 Z"
          fill="url(#sk_g)" stroke={sm} strokeWidth="0.5"/>
        {/* Face features — brow ridge */}
        <path d="M 80 38 C 85 35 90 34 95 35" fill="none" stroke={sm} strokeWidth="0.6"/>
        <path d="M 120 38 C 115 35 110 34 105 35" fill="none" stroke={sm} strokeWidth="0.6"/>
        {/* Nose bridge */}
        <path d="M 100 40 L 100 52 C 97 54 93 55 91 53" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Chin */}
        <path d="M 88 70 Q 100 76 112 70" fill="none" stroke={sm} strokeWidth="0.5"/>

        {/* ── NECK ─────────────────────────────── */}
        <path d="M 88 79 L 87 92 C 87 96 88 99 91 100 L 100 102 L 109 100
                    C 112 99 113 96 113 92 L 112 79 Z"
          fill="url(#sk_g)" stroke={sl} strokeWidth="0.7"/>
        {/* Sternocleidomastoid lines */}
        <line x1="92" y1="80" x2="89" y2="100" stroke={sm} strokeWidth="0.5"/>
        <line x1="108" y1="80" x2="111" y2="100" stroke={sm} strokeWidth="0.5"/>

        {/* ── SHOULDERS + UPPER CHEST ──────────── */}
        {/* Trapezius / shoulder caps */}
        <path d="M 87 92 C 80 90 70 88 58 88 C 46 88 36 94 34 104 L 34 120
                    C 34 126 37 130 42 132 L 52 134"
          fill="url(#sk_g)" stroke={sl} strokeWidth="0.6"/>
        <path d="M 113 92 C 120 90 130 88 142 88 C 154 88 164 94 166 104 L 166 120
                    C 166 126 163 130 158 132 L 148 134"
          fill="url(#sk_g)" stroke={sl} strokeWidth="0.6"/>

        {/* ── TRUNK / TORSO (clickable) ─────────── */}
        <path
          d="M 52 100
             C 44 102 36 110 34 122 L 34 190
             C 34 204 40 214 52 218 L 66 222
             C 72 224 76 228 77 234 L 123 234
             C 124 228 128 224 134 222 L 148 218
             C 160 214 166 204 166 190 L 166 122
             C 164 110 156 102 148 100
             C 136 96 122 93 110 91 L 90 91
             C 78 93 64 96 52 100 Z"
          fill={col('trunk')} fillOpacity={op('trunk')}
          stroke={col('trunk')} strokeWidth={hA('trunk')?1.4:0.6} strokeOpacity={0.65}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='trunk'?null:'trunk')}/>

        {/* ── ARMS ─────────────────────────────── */}
        {/* LEFT DELTOID (upper arm taper) */}
        <path
          d="M 34 122 C 26 126 19 136 18 148
             C 17 160 21 172 28 178 L 35 182 L 34 190 L 34 122 Z"
          fill={col('lArm')} fillOpacity={op('lArm')}
          stroke={col('lArm')} strokeWidth={hA('lArm')?1.4:0.5} strokeOpacity={0.6}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='lArm'?null:'lArm')}/>
        {/* Left forearm — tapers to wrist */}
        <path
          d="M 18 148 C 14 160 13 174 15 186 L 18 200
             C 20 210 26 218 33 222 L 34 190 L 35 182
             L 28 178 C 22 172 18 162 18 148 Z"
          fill={col('lArm')} fillOpacity={op('lArm')*0.82}
          stroke={col('lArm')} strokeWidth="0.4" strokeOpacity="0.45"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='lArm'?null:'lArm')}/>
        {/* Left hand */}
        <path d="M 15 196 C 12 202 11 210 13 218 C 15 224 20 228 26 228
                    C 30 228 34 224 35 220 L 33 222 C 26 218 20 210 18 200 Z"
          fill={col('lArm')} fillOpacity={op('lArm')*0.65}
          stroke={col('lArm')} strokeWidth="0.4" strokeOpacity="0.35"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='lArm'?null:'lArm')}/>

        {/* RIGHT DELTOID */}
        <path
          d="M 166 122 C 174 126 181 136 182 148
             C 183 160 179 172 172 178 L 165 182 L 166 190 L 166 122 Z"
          fill={col('rArm')} fillOpacity={op('rArm')}
          stroke={col('rArm')} strokeWidth={hA('rArm')?1.4:0.5} strokeOpacity={0.6}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='rArm'?null:'rArm')}/>
        {/* Right forearm */}
        <path
          d="M 182 148 C 186 160 187 174 185 186 L 182 200
             C 180 210 174 218 167 222 L 166 190 L 165 182
             L 172 178 C 178 172 182 162 182 148 Z"
          fill={col('rArm')} fillOpacity={op('rArm')*0.82}
          stroke={col('rArm')} strokeWidth="0.4" strokeOpacity="0.45"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='rArm'?null:'rArm')}/>
        {/* Right hand */}
        <path d="M 185 196 C 188 202 189 210 187 218 C 185 224 180 228 174 228
                    C 170 228 166 224 165 220 L 167 222 C 174 218 180 210 182 200 Z"
          fill={col('rArm')} fillOpacity={op('rArm')*0.65}
          stroke={col('rArm')} strokeWidth="0.4" strokeOpacity="0.35"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='rArm'?null:'rArm')}/>

        {/* ── PELVIS / GROIN BRIDGE ────────────── */}
        <path d="M 77 234 C 77 242 80 250 86 254 L 100 257 L 114 254
                    C 120 250 123 242 123 234 Z"
          fill="url(#sk_g)" stroke={sl} strokeWidth="0.5"/>

        {/* ── LEGS ─────────────────────────────── */}
        {/* LEFT THIGH — wide at hip, tapers to knee */}
        <path
          d="M 77 234 C 66 236 57 244 56 255
             L 55 300 C 55 316 57 330 60 340 L 62 360
             C 62 368 64 376 68 380 L 76 384
             C 80 386 84 385 86 382 L 90 370
             C 88 360 86 348 86 334 L 84 295
             C 82 278 80 260 79 244 L 77 234 Z"
          fill={col('lLeg')} fillOpacity={op('lLeg')}
          stroke={col('lLeg')} strokeWidth={hA('lLeg')?1.4:0.5} strokeOpacity={0.6}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='lLeg'?null:'lLeg')}/>
        {/* Left calf — tapers to ankle */}
        <path
          d="M 60 340 C 58 352 57 364 59 374 L 62 392
             C 64 402 68 410 74 414 L 80 416
             C 84 414 87 410 88 404 L 90 390
             C 90 380 88 372 86 364 L 84 350
             C 84 344 84 340 86 338 L 80 340
             C 72 340 66 340 62 340 L 60 340 Z"
          fill={col('lLeg')} fillOpacity={op('lLeg')*0.85}
          stroke={col('lLeg')} strokeWidth="0.4" strokeOpacity="0.45"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='lLeg'?null:'lLeg')}/>
        {/* Left foot */}
        <path d="M 62 408 C 58 412 55 418 56 424 L 88 424 L 90 416
                    C 90 412 88 408 85 406 L 74 414 Z"
          fill={col('lLeg')} fillOpacity={op('lLeg')*0.60}
          stroke={col('lLeg')} strokeWidth="0.4" strokeOpacity="0.30"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='lLeg'?null:'lLeg')}/>

        {/* RIGHT THIGH */}
        <path
          d="M 123 234 C 134 236 143 244 144 255
             L 145 300 C 145 316 143 330 140 340 L 138 360
             C 138 368 136 376 132 380 L 124 384
             C 120 386 116 385 114 382 L 110 370
             C 112 360 114 348 114 334 L 116 295
             C 118 278 120 260 121 244 L 123 234 Z"
          fill={col('rLeg')} fillOpacity={op('rLeg')}
          stroke={col('rLeg')} strokeWidth={hA('rLeg')?1.4:0.5} strokeOpacity={0.6}
          style={{cursor:'pointer',transition:'fill-opacity 0.2s'}}
          onClick={()=>setActiveRegion(activeRegion==='rLeg'?null:'rLeg')}/>
        {/* Right calf */}
        <path
          d="M 140 340 C 142 352 143 364 141 374 L 138 392
             C 136 402 132 410 126 414 L 120 416
             C 116 414 113 410 112 404 L 110 390
             C 110 380 112 372 114 364 L 116 350
             C 116 344 116 340 114 338 L 120 340
             C 128 340 134 340 138 340 L 140 340 Z"
          fill={col('rLeg')} fillOpacity={op('rLeg')*0.85}
          stroke={col('rLeg')} strokeWidth="0.4" strokeOpacity="0.45"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='rLeg'?null:'rLeg')}/>
        {/* Right foot */}
        <path d="M 138 408 C 142 412 145 418 144 424 L 112 424 L 110 416
                    C 110 412 112 408 115 406 L 126 414 Z"
          fill={col('rLeg')} fillOpacity={op('rLeg')*0.60}
          stroke={col('rLeg')} strokeWidth="0.4" strokeOpacity="0.30"
          style={{cursor:'pointer'}}
          onClick={()=>setActiveRegion(activeRegion==='rLeg'?null:'rLeg')}/>

        {/* ── ANATOMY DETAIL LINES ─────────────── */}
        {/* Collarbone / clavicles */}
        <path d="M 52 100 C 62 96 78 93 90 91" fill="none" stroke={sl} strokeWidth="0.8" opacity="0.5"/>
        <path d="M 148 100 C 138 96 122 93 110 91" fill="none" stroke={sl} strokeWidth="0.8" opacity="0.5"/>
        {/* Clavicle notch */}
        <path d="M 90 91 Q 100 88 110 91" fill="none" stroke={sl} strokeWidth="0.7" opacity="0.4"/>
        {/* Pectorals — curved separation line */}
        <path d="M 52 104 C 62 112 80 116 100 117" fill="none" stroke={sm} strokeWidth="0.7"/>
        <path d="M 148 104 C 138 112 120 116 100 117" fill="none" stroke={sm} strokeWidth="0.7"/>
        {/* Pec lower edge */}
        <path d="M 52 122 C 66 130 84 133 100 133" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 148 122 C 134 130 116 133 100 133" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Linea alba — center vertical */}
        <line x1="100" y1="91" x2="100" y2="200" stroke={sm} strokeWidth="0.5"/>
        {/* Rib cage hint */}
        {[0,1,2].map(i=>(
          <g key={i}>
            <path d={`M 60 ${136+i*14} C 68 ${134+i*14} 84 ${133+i*14} 100 ${133+i*14}`}
              fill="none" stroke={sm} strokeWidth="0.4" opacity="0.5"/>
            <path d={`M 140 ${136+i*14} C 132 ${134+i*14} 116 ${133+i*14} 100 ${133+i*14}`}
              fill="none" stroke={sm} strokeWidth="0.4" opacity="0.5"/>
          </g>
        ))}
        {/* Obliques / flanks */}
        <path d="M 48 155 C 46 168 46 182 50 194" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 152 155 C 154 168 154 182 150 194" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Umbilicus (belly button) */}
        <ellipse cx="100" cy="175" rx="3" ry="2.5"
          fill="none" stroke={sl} strokeWidth="0.6" opacity="0.4"/>
        {/* Inguinal ligament / hip crease */}
        <path d="M 58 210 C 70 204 86 200 100 199" fill="none" stroke={sl} strokeWidth="0.6" opacity="0.4"/>
        <path d="M 142 210 C 130 204 114 200 100 199" fill="none" stroke={sl} strokeWidth="0.6" opacity="0.4"/>
        {/* Deltoid crease (shoulder muscle) */}
        <path d="M 42 124 C 38 130 36 140 36 150" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 158 124 C 162 130 164 140 164 150" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Bicep peak */}
        <path d="M 20 148 C 19 155 19 163 21 170" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 180 148 C 181 155 181 163 179 170" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Knee — patella */}
        <ellipse cx="68" cy="344" rx="9" ry="7"
          fill="rgba(100,180,150,0.12)" stroke={sl} strokeWidth="0.7" opacity="0.6"/>
        <ellipse cx="132" cy="344" rx="9" ry="7"
          fill="rgba(100,180,150,0.12)" stroke={sl} strokeWidth="0.7" opacity="0.6"/>
        {/* VMO (inner quad teardrop above knee) */}
        <path d="M 62 332 C 62 338 64 342 68 344" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 138 332 C 138 338 136 342 132 344" fill="none" stroke={sm} strokeWidth="0.5"/>
        {/* Quad centerline */}
        <line x1="70" y1="258" x2="67" y2="330" stroke={sm} strokeWidth="0.4" opacity="0.5"/>
        <line x1="130" y1="258" x2="133" y2="330" stroke={sm} strokeWidth="0.4" opacity="0.5"/>
        {/* Tibia shin line */}
        <line x1="64" y1="352" x2="66" y2="404" stroke={sm} strokeWidth="0.4" opacity="0.4"/>
        <line x1="136" y1="352" x2="134" y2="404" stroke={sm} strokeWidth="0.4" opacity="0.4"/>
        {/* Calf belly */}
        <path d="M 59 356 C 57 366 57 378 60 388" fill="none" stroke={sm} strokeWidth="0.5"/>
        <path d="M 141 356 C 143 366 143 378 140 388" fill="none" stroke={sm} strokeWidth="0.5"/>

        {/* ── ACTIVE GLOW ──────────────────────── */}
        {activeRegion && (
          <ellipse cx="100" cy="230" rx="75" ry="200"
            fill={col(activeRegion)} opacity="0.04" filter="url(#fg2)"/>
        )}

        {!activeRegion && (
          <text x="100" y="448" textAnchor="middle"
            fontFamily="system-ui,sans-serif" fontSize="7"
            fill="rgba(255,255,255,0.16)" letterSpacing="0.14em">TAP REGION</text>
        )}
      </svg>
    );
  };

;

;

  return(<div style={S.col18}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>DXA · Hologic Horizon W · Pueblo Radiology · Jan 23 2026</div>
        <div style={S.h18}>Body Composition</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {SCAN_HISTORY.map(s=>(
          <div key={s.date} style={{padding:"5px 12px",borderRadius:8,background:s.source==="DXA"?P.cardDk:P.card,border:`1px solid ${s.source==="DXA"?P.borderDk:P.border}`,textAlign:"center"}}>
            <div style={{fontFamily:FF.s,fontSize:8,color:s.source==="DXA"?P.mutedDk:P.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>{s.source}</div>
            <div style={{fontFamily:FF.m,fontSize:11,fontWeight:500,color:s.source==="DXA"?P.textInv:P.text}}>{s.fatPct}%</div>
            <div style={{fontFamily:FF.s,fontSize:8,color:s.source==="DXA"?P.mutedDk:P.muted}}>{s.date}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{
      background:"linear-gradient(160deg,#0E1A18 0%,#0A120E 40%,#080C0A 100%)",
      borderRadius:20, padding:"24px 20px 20px",
      boxShadow:"0 12px 48px rgba(0,0,0,0.28)",
      border:"1px solid rgba(58,156,104,0.14)",
      position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",
        width:"min(400px,80vw)",height:"min(400px,80vw)",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(58,156,104,0.06) 0%,transparent 70%)",
        pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.30)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Total Body Fat</div>
          <div style={{fontFamily:FF.r,fontSize:28,fontWeight:700,color:"rgba(255,255,255,0.90)",letterSpacing:"-0.02em",lineHeight:1}}>26.4%</div>
          <div style={{fontFamily:FF.s,fontSize:10,color:"rgba(196,96,74,0.90)",marginTop:3,fontWeight:500}}>Above Average</div>
        </div>
        <div style={{display:"flex",gap:20}}>
          {[
            {label:"Lean Mass",val:"149.8 lb",color:"#3A9C68"},
            {label:"Fat Mass", val:"56.5 lb", color:"#C4604A"},
            {label:"BMD T-Score",val:"+1.3",  color:"#4A8FA0"},
          ].map(({label,val,color})=>(
            <div key={label} style={{textAlign:"center"}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.28)",marginBottom:3,letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</div>
              <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {[{c:"#3A9C68",l:"Lean <22%"},{c:"#C47830",l:"Avg 22–26%"},{c:"#C4604A",l:"High >26%"}].map(({c,l})=>(
            <div key={l} style={S.row6}>
              <div style={{width:8,height:8,borderRadius:2,background:c,boxShadow:`0 0 6px ${c}`}}/>
              <span style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.32)"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"clamp(110px,20vw,160px) 1fr clamp(110px,20vw,160px)",gap:8,alignItems:"center"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"flex-end"}}>
          <RegionCard {...REGIONS.find(r=>r.id==="trunk")} onClick={()=>setActiveRegion(activeRegion==="trunk"?null:"trunk")} active={activeRegion==="trunk"}/>
          <RegionCard {...REGIONS.find(r=>r.id==="lArm")} onClick={()=>setActiveRegion(activeRegion==="lArm"?null:"lArm")} active={activeRegion==="lArm"}/>
        </div>
        <div style={{minHeight:300,height:"auto",position:"relative",maxWidth:200,margin:"0 auto"}}>
          <FigureSVG/>
        </div>
        <div style={S.col10}>
          <RegionCard {...REGIONS.find(r=>r.id==="rArm")} onClick={()=>setActiveRegion(activeRegion==="rArm"?null:"rArm")} active={activeRegion==="rArm"}/>
          <RegionCard {...REGIONS.find(r=>r.id==="lLeg")} onClick={()=>setActiveRegion(activeRegion==="lLeg"?null:"lLeg")} active={activeRegion==="lLeg"}/>
          <RegionCard {...REGIONS.find(r=>r.id==="rLeg")} onClick={()=>setActiveRegion(activeRegion==="rLeg"?null:"rLeg")} active={activeRegion==="rLeg"}/>
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:11}}>
      {[
        {label:"Body Fat",    val:"26.4",  unit:"%",    color:P.terra, sub:"DXA gold standard"},
        {label:"Fat Mass",    val:"56.5",  unit:"lb",   color:P.terra, sub:"Total adipose"},
        {label:"Lean Mass",   val:"149.8", unit:"lb",   color:P.sage,  sub:"Excl. bone mineral"},
        {label:"Bone Density",val:"1.331", unit:"g/cm²",color:P.steel, sub:"T+1.3 · 111th %ile"},
        {label:"VAT Area",    val:"118",   unit:"cm²",  color:P.amber, sub:"Est. visceral fat"},
        {label:"A/G Ratio",   val:"0.96",  unit:"",     color:P.sage,  sub:"Balanced distribution"},
      ].map(({label,val,unit,color,sub})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"13px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{label}</div>
          <div style={{fontFamily:FF.r,fontSize:24,fontWeight:600,color,lineHeight:1,letterSpacing:"-0.01em"}}>{val}<span style={{fontSize:11,color:P.muted,fontFamily:FF.s,fontWeight:400,marginLeft:3}}>{unit}</span></div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:4}}>{sub}</div>
        </div>
      ))}
    </div>
    <div style={CS()}>
      <SLabel color={P.clay}>Regional Composition · DXA</SLabel>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>
          {["Region","Fat %","Fat (lb)","Lean+BMC (lb)","Total (lb)","BMD (g/cm²)"].map(h=>(
            <th key={h} style={{fontFamily:FF.s,fontSize:8,fontWeight:600,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",textAlign:"left",padding:"0 12px 8px 0",borderBottom:`1px solid ${P.border}`}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {[
            {name:"Left Arm",  ...DXA.regions.lArm,  rid:"lArm"},
            {name:"Right Arm", ...DXA.regions.rArm,  rid:"rArm"},
            {name:"Trunk",     ...DXA.regions.trunk, rid:"trunk"},
            {name:"Left Leg",  ...DXA.regions.lLeg,  rid:"lLeg"},
            {name:"Right Leg", ...DXA.regions.rLeg,  rid:"rLeg"},
            {name:"TOTAL",     fatLbs:56.47,leanLbs:157.16,totalLbs:213.63,fatPct:26.4,bmd:1.331,isTotal:true},
          ].map((r,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${P.border}`,background:r.isTotal?P.panel:"transparent",cursor:r.isTotal?"default":"pointer"}}
              onClick={()=>{if(!r.isTotal&&r.rid)setActiveRegion(r.rid===activeRegion?null:r.rid);}}
              onMouseEnter={e=>{if(!r.isTotal)e.currentTarget.style.background=P.panel;}}
              onMouseLeave={e=>{if(!r.isTotal)e.currentTarget.style.background="transparent";}}>
              <td style={{fontFamily:FF.s,fontSize:11,fontWeight:r.isTotal?600:400,color:P.text,padding:"8px 12px 8px 0"}}>{r.name}</td>
              <td style={{padding:"8px 12px 8px 0"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:36,height:4,borderRadius:2,background:P.panel,overflow:"hidden"}}>
                    <div style={{width:`${r.fatPct}%`,height:"100%",background:fatColor(r.fatPct),borderRadius:2,transition:"width 0.9s cubic-bezier(0.34,1.2,0.64,1)"}}/>
                  </div>
                  <span style={{fontFamily:FF.m,fontSize:11,fontWeight:r.isTotal?600:400,color:fatColor(r.fatPct)}}>{r.fatPct}%</span>
                </div>
              </td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.sub,padding:"8px 12px 8px 0"}}>{r.fatLbs}</td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.sub,padding:"8px 12px 8px 0"}}>{r.leanLbs}</td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.sub,padding:"8px 12px 8px 0"}}>{r.totalLbs}</td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.sub,padding:"8px 12px 8px 0"}}>{r.bmd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div style={S.g240}>
      <div style={{background:P.cardDk,border:`1px solid ${P.borderDk}`,borderRadius:14,padding:"18px"}}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>Bone Mineral Density</div>
        <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:12}}>
          <div style={{fontFamily:FF.r,fontSize:38,fontWeight:600,color:P.steel,letterSpacing:"-0.02em"}}>1.331</div>
          <div style={{fontFamily:FF.s,fontSize:11,color:P.mutedDk}}>g/cm²</div>
          <div style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,background:"#3A5C4844",border:"1px solid #3A5C4888"}}>
            <span style={{fontFamily:FF.m,fontSize:11,fontWeight:600,color:"#7AC49A"}}>T-score +1.3 · 111th %ile</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
          {[{label:"L-Spine",val:"1.483"},{label:"T-Spine",val:"1.131"},{label:"Pelvis",val:"1.469"},{label:"L Leg",val:"1.443"}].map(({label,val})=>(
            <div key={label} style={{padding:"8px 10px",background:"rgba(255,255,255,0.05)",borderRadius:8}}>
              <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,marginBottom:2}}>{label}</div>
              <div style={{fontFamily:FF.m,fontSize:12,fontWeight:500,color:P.textInv}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px",gridColumn:"1/-1"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <SLabel color={P.amber}>Body Composition Trend</SLabel>
          <div style={{display:"flex",gap:12}}>
            {[{c:P.steel,l:"DXA"},{c:P.clay,l:"Styku"},{c:"#60B090",l:"Hume BIA (daily)"}].map(({c,l})=>(
              <div key={l} style={S.row4}>
                <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                <span style={S.mut9}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:14}}>
          ⚠ DXA is the gold standard. BIA (Hume) reads body fat ~11pts lower than DXA — use for daily <em>trend direction</em>, not absolute value.
          Weight trend (Hume scale) is reliable day-to-day.
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Daily Weight · Hume Pod (lbs)</div>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={HUME_WT_TREND} margin={{top:4,right:8,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gHumeWt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A8070" stopOpacity="0.22"/>
                  <stop offset="100%" stopColor="#4A8070" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
              <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:7,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} interval={7}/>
              <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} domain={[208,228]}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,color:"#60B090",fontWeight:600}}>{payload[0]?.value} lbs</div></div>):null}/>
              <ReferenceLine y={216} stroke={P.steel} strokeDasharray="4 3" strokeOpacity={0.5} strokeWidth={1}/>
              <Area type="monotone" dataKey="v" stroke="#60B090" strokeWidth={1.8} fill="url(#gHumeWt)" dot={false} isAnimationActive={true} animationDuration={900} name="Weight lbs"/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textAlign:"right",marginTop:3}}>Blue dashed = DXA reference (216 lbs)</div>
        </div>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Body Fat % · Method Comparison</div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart margin={{top:4,right:8,left:-20,bottom:0}}>
              <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
              <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:7,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} interval={7}/>
              <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} domain={[12,30]}/>
              <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div>{payload.map(p=><div key={p.name} style={{color:p.color,fontFamily:FF.m,fontWeight:600,fontSize:10}}>{p.name}: {p.value}%</div>)}</div>):null}/>
              <Line data={trendData} type="monotone" dataKey="fat" stroke={P.terra} strokeWidth={2.5}
                dot={p=><circle key={p.index} cx={p.cx} cy={p.cy} r={6} fill={P.terra} stroke={P.card} strokeWidth={2}/>}
                name="DXA/Styku" isAnimationActive={true} animationDuration={900}/>
              <Line data={HUME_BF_TREND} type="monotone" dataKey="v" stroke="#60B090" strokeWidth={1.5}
                strokeDasharray="4 2" dot={false} name="Hume BIA" isAnimationActive={true} animationDuration={1000}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>);
}
// Zone: 0=Suppressed(<39ms) 1=Low(39-42) 2=Baseline(42-47) 3=Elevated(47-49) 4=Peak(>49)
// hrv_mean=44.4ms  hrv_stdev=5.0ms  rec_mean=66.6%
const HRV_BASELINE = { mean:44.4, stdev:5, recMean:66.6, recStdev:9 };
const RECOVERY_DEBT_SERIES=[
  {label:"03/03",hrv:48,rec:74.9,slp:8.80,strain:78.3,z:0.72,debt:8.3,zone:3},
  {label:"03/10",hrv:47.4,rec:75.6,slp:8.52,strain:80.9,z:0.59,debt:9,zone:3},
  {label:"03/17",hrv:46.4,rec:72.8,slp:8.57,strain:80.7,z:0.39,debt:6.2,zone:2},
  {label:"03/24",hrv:45.5,rec:71.5,slp:8.55,strain:83.4,z:0.23,debt:4.9,zone:2},
  {label:"03/31",hrv:45.5,rec:70.2,slp:8.54,strain:84.9,z:0.21,debt:3.6,zone:2},
  {label:"04/07",hrv:45.4,rec:70.2,slp:8.57,strain:85.5,z:0.20,debt:3.7,zone:2},
  {label:"04/14",hrv:44.3,rec:67.7,slp:8.51,strain:87.7,z:-0.01,debt:1.1,zone:2},
  {label:"04/21",hrv:45,rec:68.3,slp:8.56,strain:86.2,z:0.11,debt:1.7,zone:2},
  {label:"04/28",hrv:44.1,rec:67.6,slp:8.51,strain:86.7,z:-0.06,debt:1,zone:2},
  {label:"05/05",hrv:43.9,rec:66.8,slp:8.49,strain:86.3,z:-0.10,debt:0.2,zone:2},
  {label:"05/12",hrv:48,rec:74.1,slp:8.53,strain:84.5,z:0.72,debt:7.5,zone:3},
  {label:"05/19",hrv:48.8,rec:71.6,slp:8.17,strain:85.5,z:0.88,debt:5,zone:3},
  {label:"05/26",hrv:50.2,rec:72.2,slp:8.22,strain:85.6,z:1.15,debt:5.6,zone:4},
  {label:"06/02",hrv:51,rec:70.1,slp:8.33,strain:85.5,z:1.33,debt:3.5,zone:4},
  {label:"06/09",hrv:49,rec:64.3,slp:8.26,strain:87.5,z:0.93,debt:-2.3,zone:3},
  {label:"06/16",hrv:49,rec:65.9,slp:8.54,strain:84.8,z:0.93,debt:-0.7,zone:3},
  {label:"06/23",hrv:48.7,rec:66.8,slp:8.47,strain:79.2,z:0.85,debt:0.2,zone:3},
  {label:"06/30",hrv:47.3,rec:64.3,slp:8.27,strain:76.7,z:0.58,debt:-2.3,zone:3},
  {label:"07/07",hrv:43,rec:58,slp:7.96,strain:69.6,z:-0.29,debt:-8.6,zone:2},
  {label:"07/14",hrv:42.9,rec:61.1,slp:8.12,strain:60.6,z:-0.30,debt:-5.5,zone:2},
  {label:"07/21",hrv:41.5,rec:58.4,slp:8.19,strain:60.9,z:-0.58,debt:-8.2,zone:1},
  {label:"07/28",hrv:40.9,rec:61.5,slp:8.47,strain:54.4,z:-0.70,debt:-5.1,zone:1},
  {label:"08/04",hrv:42.9,rec:66.6,slp:8.90,strain:53.7,z:-0.31,debt:-0,zone:2},
  {label:"08/11",hrv:40,rec:61.9,slp:8.80,strain:61,z:-0.87,debt:-4.7,zone:1},
  {label:"08/18",hrv:40.1,rec:65.6,slp:8.80,strain:61.2,z:-0.85,debt:-1,zone:1},
  {label:"08/25",hrv:39,rec:63.4,slp:8.73,strain:71.4,z:-1.07,debt:-3.2,zone:0},
  {label:"09/01",hrv:42,rec:69.4,slp:8.75,strain:72.2,z:-0.48,debt:2.8,zone:2},
  {label:"09/08",hrv:45.2,rec:72.7,slp:8.84,strain:71.7,z:0.17,debt:6.1,zone:2},
  {label:"09/15",hrv:46.7,rec:70.9,slp:8.93,strain:72.5,z:0.47,debt:4.3,zone:2},
  {label:"09/22",hrv:49.7,rec:73.7,slp:8.98,strain:69,z:1.07,debt:7.1,zone:4},
  {label:"09/29",hrv:49.2,rec:70.7,slp:9.12,strain:70.4,z:0.97,debt:4.1,zone:3},
  {label:"10/06",hrv:48,rec:67.4,slp:9.04,strain:69.4,z:0.71,debt:0.8,zone:3},
  {label:"10/13",hrv:45.3,rec:63.2,slp:8.97,strain:69.6,z:0.18,debt:-3.4,zone:2},
  {label:"10/20",hrv:44.3,rec:64,slp:8.90,strain:67.7,z:-0.01,debt:-2.5,zone:2},
  {label:"10/27",hrv:42.6,rec:62,slp:8.70,strain:67.9,z:-0.35,debt:-4.5,zone:2},
  {label:"11/03",hrv:41.4,rec:62.3,slp:8.76,strain:69,z:-0.61,debt:-4.3,zone:1},
  {label:"11/10",hrv:42.3,rec:67.1,slp:8.79,strain:68.7,z:-0.42,debt:0.5,zone:2},
  {label:"11/17",hrv:40.8,rec:64.3,slp:8.86,strain:70.6,z:-0.71,debt:-2.3,zone:1},
  {label:"11/24",hrv:39.8,rec:64.1,slp:9.09,strain:69.8,z:-0.92,debt:-2.5,zone:1},
  {label:"12/01",hrv:39.3,rec:63.9,slp:9.13,strain:69.6,z:-1.01,debt:-2.7,zone:0},
  {label:"12/08",hrv:39,rec:62.8,slp:9.08,strain:71.2,z:-1.07,debt:-3.8,zone:0},
  {label:"12/15",hrv:41,rec:66.2,slp:9.05,strain:73,z:-0.68,debt:-0.4,zone:1},
  {label:"12/22",hrv:44.1,rec:63.6,slp:8.39,strain:70.9,z:-0.06,debt:-3,zone:2},
  {label:"12/29",hrv:46.1,rec:65.7,slp:8.50,strain:68.2,z:0.35,debt:-0.9,zone:2},
  {label:"01/05",hrv:46.7,rec:64.3,slp:8.68,strain:63.1,z:0.45,debt:-2.3,zone:2},
  {label:"01/12",hrv:44.2,rec:57.9,slp:8.78,strain:61.8,z:-0.03,debt:-8.7,zone:2},
  {label:"01/19",hrv:41.8,rec:61.8,slp:9.33,strain:64.1,z:-0.52,debt:-4.8,zone:1},
  {label:"01/26",hrv:39.8,rec:59.8,slp:9.14,strain:69.5,z:-0.93,debt:-6.8,zone:1},
  {label:"02/02",hrv:39.8,rec:62.1,slp:9.09,strain:77.4,z:-0.93,debt:-4.5,zone:1},
  {label:"02/09",hrv:40.1,rec:64.4,slp:8.97,strain:76.5,z:-0.85,debt:-2.2,zone:1},
  {label:"02/16",hrv:40.3,rec:65,slp:8.84,strain:82.2,z:-0.82,debt:-1.6,zone:1},
  {label:"02/23",hrv:44.3,rec:70,slp:8.84,strain:85.7,z:-0.03,debt:3.4,zone:2},
  {label:"03/02",hrv:46.5,rec:73,slp:8.65,strain:86.5,z:0.42,debt:6.5,zone:2},
  {label:"03/09",hrv:47.2,rec:73.2,slp:8.68,strain:91.3,z:0.57,debt:6.6,zone:3},
  {label:"03/16",hrv:48.4,rec:73.6,slp:8.83,strain:79.8,z:0.80,debt:7,zone:3},
];

const WT=[
  {label:"03/03",hrv:48,rhr:48.7,rec:74.9,slp:8.80,strain:78.3},
  {label:"03/10",hrv:46.7,rhr:48.3,rec:76.3,slp:8.23,strain:83.5},
  {label:"03/17",hrv:44.4,rhr:49,rec:67.3,slp:8.67,strain:80.3},
  {label:"03/24",hrv:43.1,rhr:49.1,rec:67.4,slp:8.50,strain:91.6},
  {label:"03/31",hrv:47.6,rhr:49.3,rec:69.9,slp:8.74,strain:84.2},
  {label:"04/07",hrv:46.6,rhr:49.3,rec:76.4,slp:8.37,strain:85.8},
  {label:"04/14",hrv:40,rhr:53.1,rec:57.1,slp:8.44,strain:89.3},
  {label:"04/21",hrv:45.6,rhr:49.7,rec:69.9,slp:8.71,strain:85.5},
  {label:"04/28",hrv:44.1,rhr:50.1,rec:67.1,slp:8.52,strain:86.3},
  {label:"05/05",hrv:45.9,rhr:49.7,rec:73,slp:8.29,strain:84},
  {label:"05/12",hrv:56.5,rhr:47.2,rec:86.3,slp:8.60,strain:82.1},
  {label:"05/19",hrv:48.6,rhr:49.7,rec:60,slp:7.27,strain:89.6},
  {label:"05/26",hrv:49.7,rhr:48.4,rec:69.4,slp:8.74,strain:86.8},
  {label:"06/02",hrv:49.4,rhr:49,rec:64.7,slp:8.72,strain:83.7},
  {label:"06/09",hrv:48.4,rhr:49.7,rec:63,slp:8.30,strain:90.1},
  {label:"06/16",hrv:48.7,rhr:49.2,rec:66.5,slp:8.42,strain:78.6},
  {label:"06/23",hrv:48.2,rhr:49.2,rec:73,slp:8.44,strain:64.5},
  {label:"06/30",hrv:43.9,rhr:51.9,rec:54.6,slp:7.90,strain:73.6},
  {label:"07/07",hrv:31,rhr:57.7,rec:37.7,slp:7.06,strain:61.7},
  {label:"07/14",hrv:48.4,rhr:47.7,rec:79.1,slp:9.06,strain:42.8},
  {label:"07/21",hrv:42.6,rhr:49.1,rec:62.1,slp:8.73,strain:65.4},
  {label:"07/28",hrv:41.7,rhr:49.9,rec:67.1,slp:9.03,strain:47.7},
  {label:"08/04",hrv:38.7,rhr:50.9,rec:58,slp:8.78,strain:58.8},
  {label:"08/11",hrv:37.1,rhr:51.3,rec:60.3,slp:8.66,strain:72.3},
  {label:"08/18",hrv:43,rhr:50.7,rec:76.9,slp:8.73,strain:66.1},
  {label:"08/25",hrv:37.3,rhr:52.6,rec:58.4,slp:8.76,strain:88.6},
  {label:"09/01",hrv:50.6,rhr:47,rec:82.1,slp:8.83,strain:62},
  {label:"09/08",hrv:50,rhr:47.6,rec:73.4,slp:9.05,strain:70},
  {label:"09/15",hrv:49,rhr:47.7,rec:69.7,slp:9.08,strain:69.3},
  {label:"09/22",hrv:49.3,rhr:47.3,rec:69.4,slp:8.96,strain:74.8},
  {label:"09/29",hrv:48.6,rhr:47.9,rec:70.3,slp:9.41,strain:67.5},
  {label:"10/06",hrv:44.9,rhr:48.7,rec:60.3,slp:8.70,strain:66.1},
  {label:"10/13",hrv:38.4,rhr:51.3,rec:52.9,slp:8.81,strain:70.1},
  {label:"10/20",hrv:45.4,rhr:48.4,rec:72.7,slp:8.70,strain:67.2},
  {label:"10/27",hrv:41.9,rhr:50.3,rec:62.3,slp:8.58,strain:68.1},
  {label:"11/03",hrv:39.7,rhr:51.1,rec:61.4,slp:8.94,strain:70.7},
  {label:"11/10",hrv:42.1,rhr:50.1,rec:71.9,slp:8.93,strain:68.7},
  {label:"11/17",hrv:39.6,rhr:50.7,rec:61.6,slp:8.99,strain:75},
  {label:"11/24",hrv:37.7,rhr:52.6,rec:61.6,slp:9.51,strain:64.6},
  {label:"12/01",hrv:37.9,rhr:51.3,rec:60.6,slp:9.10,strain:70.1},
  {label:"12/08",hrv:40.9,rhr:50.4,rec:67.4,slp:8.71,strain:75.2},
  {label:"12/15",hrv:47.4,rhr:49,rec:75,slp:8.87,strain:81.9},
  {label:"12/22",hrv:50.1,rhr:53,rec:51.3,slp:6.90,strain:56.5},
  {label:"12/29",hrv:46.1,rhr:50.1,rec:69,slp:9.50,strain:59.1},
  {label:"01/05",hrv:43.1,rhr:49.3,rec:62,slp:9.44,strain:54.8},
  {label:"01/12",hrv:37.7,rhr:51.4,rec:49.4,slp:9.29,strain:76.6},
  {label:"01/19",hrv:40.3,rhr:50.4,rec:66.7,slp:9.09,strain:66},
  {label:"01/26",hrv:38,rhr:51.4,rec:60.9,slp:8.74,strain:80.6},
  {label:"02/02",hrv:43.1,rhr:50.4,rec:71.3,slp:9.25,strain:86.6},
  {label:"02/09",hrv:39.1,rhr:51.9,rec:58.6,slp:8.82,strain:72.7},
  {label:"02/16",hrv:40.9,rhr:51,rec:69.3,slp:8.53,strain:89},
  {label:"02/23",hrv:54,rhr:50.7,rec:80.7,slp:8.74,strain:94.3},
  {label:"03/02",hrv:51.9,rhr:51.6,rec:83.6,slp:8.53,strain:89.8},
  {label:"03/09",hrv:42.1,rhr:50.9,rec:59.1,slp:8.92,strain:92},
  {label:"03/16",hrv:45.5,rhr:49.8,rec:71,slp:9.13,strain:43},
];

function Trends(){
  const [range, setRange] = useState(26); // default: 6 months
  const ax = {tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

 
  const RANGES = [
    {key:13,  label:"3M",  sub:"3 months"},
    {key:26,  label:"6M",  sub:"6 months"},
    {key:53,  label:"1Y",  sub:"1 year"},
    {key:9999,label:"All", sub:"All time (53 wks)"},
  ];

  const slice = WT.slice(-range);
  const xInterval = range <= 14 ? 1 : range <= 26 ? 2 : range <= 53 ? 4 : 7;
  const rangeLabel = RANGES.find(r=>r.key===range)?.sub || "";

  // Chart card component
  const CC = ({title,dataKey,color,domain,unit,height=130,refLine})=>{
    const safeId = dataKey.replace(/[^a-z]/gi,"");
    return(
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.1em",textTransform:"uppercase"}}>{title}</div>
          {unit&&<div style={S.mut9}>{unit}</div>}
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={slice} margin={{top:4,right:4,left:-22,bottom:0}}>
            <defs>
              <linearGradient id={`gt${safeId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25}/>
                <stop offset="100%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="label" {...ax} interval={xInterval}/>
            <YAxis {...ax} domain={domain||["auto","auto"]}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 12px",fontFamily:FF.s,fontSize:10,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:3,fontSize:9}}>{label}</div>{payload.map(p=><div key={p.name} style={{fontFamily:FF.m,color:p.color,fontWeight:600}}>{p.value} {unit}</div>)}</div>):null}/>
            {refLine&&<ReferenceLine y={refLine} stroke={color} strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}/>}
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.8}
              fill={`url(#gt${safeId})`} dot={false} isAnimationActive={true} animationDuration={900}
              activeDot={{r:3,fill:color,stroke:P.card,strokeWidth:2}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Avg values for selected range
  const avg = key => {
    const vals = slice.map(w=>w[key]).filter(Boolean);
    return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10 : null;
  };

  return(<div style={S.col16}>
    <div style={S.rowsb}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>WHOOP · Weekly Averages · Mar 2025–Mar 2026</div>
        <div style={S.h18}>Performance Trends</div>
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {RANGES.map(r=>(
          <button key={r.key} onClick={()=>setRange(r.key)}
            style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"5px 14px",borderRadius:7,cursor:"pointer",transition:"all .15s",
              background:range===r.key?P.cardDk:P.card,color:range===r.key?P.textInv:P.sub,
              border:`1px solid ${range===r.key?P.cardDk:P.border}`}}>
            {r.label}
          </button>
        ))}
      </div>
    </div>
    <div style={S.g120}>
      {[
        {label:"Avg HRV",    val:avg("hrv"),  unit:"ms",  color:P.sage},
        {label:"Avg Recovery",val:avg("rec"), unit:"%",   color:P.sage},
        {label:"Avg RHR",   val:avg("rhr"),  unit:"bpm", color:P.coral},
        {label:"Avg Sleep", val:avg("slp"),  unit:"h",   color:P.steel},
        {label:"Avg Weekly Strain",val:avg("strain"),unit:"",color:P.amber},
      ].map(({label,val,unit,color})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:11,padding:"11px 13px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{label}</div>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,lineHeight:1,letterSpacing:"-0.01em"}}>{val||"—"}<span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:3}}>{unit}</span></div>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:3}}>{rangeLabel}</div>
        </div>
      ))}
    </div>
    <CC title="Heart Rate Variability" dataKey="hrv" color={P.sage} domain={[25,75]} unit="ms" height={160} refLine={avg("hrv")}/>
    <div style={S.g240}>
      <CC title="Recovery Score" dataKey="rec" color="#3A5C48" domain={[30,100]} unit="%" height={130} refLine={avg("rec")}/>
      <CC title="Resting Heart Rate" dataKey="rhr" color={P.coral} domain={[40,65]} unit="bpm" height={130} refLine={avg("rhr")}/>
    </div>
    <div style={S.g240}>
      <CC title="Sleep Duration" dataKey="slp" color={P.steel} domain={[5,11]} unit="h" height={130}/>
      <CC title="Weekly Training Strain" dataKey="strain" color={P.amber} domain={[20,120]} unit="" height={130}/>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:16,margin:"4px 0 2px"}}>
      <div style={S.divider}/>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Weight</div>
      <div style={S.divider}/>
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.1em",textTransform:"uppercase"}}>Daily Weight · Hume Pod</div>
          <div style={S.mut9t2}>
            {HUME_DATA.length>0&&`${HUME_DATA[HUME_DATA.length-1].d} – ${HUME_DATA[0].d} · ${HUME_DATA.length} readings`}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:P.steel,letterSpacing:"-0.02em"}}>{HUME_DATA[0]?.wt}<span style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginLeft:3}}>lbs today</span></div>
          {(()=>{
            if(HUME_DATA.length<2) return null;
            const first = HUME_DATA[HUME_DATA.length-1].wt;
            const last  = HUME_DATA[0].wt;
            const diff  = +(last-first).toFixed(1);
            const col   = diff<0?P.sage:diff>0?"#C4604A":P.muted;
            return <div style={{fontFamily:FF.s,fontSize:9,color:col,marginTop:2}}>{diff>0?"+":""}{diff} lbs since {HUME_DATA[HUME_DATA.length-1].d}</div>;
          })()}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={[...HUME_DATA].reverse()} margin={{top:4,right:8,left:-18,bottom:0}}>
          <defs>
            <linearGradient id="gWtTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.steel} stopOpacity="0.20"/>
              <stop offset="100%" stopColor={P.steel} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            interval={Math.max(1,Math.floor(HUME_DATA.length/8))}/>
          <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            domain={[Math.floor(Math.min(...HUME_DATA.map(r=>r.wt))-2), Math.ceil(Math.max(...HUME_DATA.map(r=>r.wt))+2)]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 12px",fontFamily:FF.s,fontSize:10,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:3,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,fontWeight:600,color:P.steel}}>{payload[0]?.value} lbs</div></div>):null}/>
          <ReferenceLine y={216} stroke={P.terra} strokeDasharray="5 3" strokeOpacity={0.5} strokeWidth={1.2}
            label={{value:"DXA 216",position:"right",fontFamily:FF.s,fontSize:8,fill:P.terra,opacity:0.7}}/>
          <Area type="monotone" dataKey="wt" stroke={P.steel} strokeWidth={2}
            fill="url(#gWtTrend)" dot={false}
            isAnimationActive={true} animationDuration={900} name="Weight lbs"
            activeDot={{r:4,fill:P.steel,stroke:P.card,strokeWidth:2}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:16,margin:"4px 0 2px"}}>
      <div style={S.divider}/>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Daily Measurements · Hume Pod</div>
      <div style={S.divider}/>
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.1em",textTransform:"uppercase"}}>Body Fat % · Daily BIA</div>
          <div style={S.mut9t2}>Hume Pod BIA · Dec 2025–Mar 2026 · {HUME_DATA.length} readings</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color:P.amber,letterSpacing:"-0.01em"}}>{HUME_DATA[0]?.bf}%<span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:4}}>today</span></div>
          {(()=>{
            const first=HUME_DATA[HUME_DATA.length-1]?.bf, last=HUME_DATA[0]?.bf;
            if(!first||!last) return null;
            const diff=+(last-first).toFixed(2);
            return <div style={{fontFamily:FF.s,fontSize:9,color:diff<0?P.sage:"#C4604A",marginTop:2}}>{diff>0?"+":""}{diff}% since {HUME_DATA[HUME_DATA.length-1].d}</div>;
          })()}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={[...HUME_DATA].reverse()} margin={{top:4,right:8,left:-18,bottom:0}}>
          <defs>
            <linearGradient id="gHumeBF" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.amber} stopOpacity="0.22"/>
              <stop offset="100%" stopColor={P.amber} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            interval={Math.max(1,Math.floor(HUME_DATA.length/8))}/>
          <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            domain={[12,22]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 12px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,marginBottom:2,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,fontWeight:600,color:P.amber}}>{payload[0]?.value}% BIA</div><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:2}}>Note: BIA reads ~11pts lower than DXA</div></div>):null}/>
          <Area type="monotone" dataKey="bf" stroke={P.amber} strokeWidth={1.8}
            fill="url(#gHumeBF)" dot={false} isAnimationActive={true} animationDuration={900} name="BF % BIA"
            activeDot={{r:3,fill:P.amber,stroke:P.card,strokeWidth:2}}/>
        </AreaChart>
      </ResponsiveContainer>
      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:6,padding:"6px 10px",background:P.panel,borderRadius:6}}>
        ⚠ BIA consistently reads ~11 pts lower than DXA gold standard. Use this chart for <strong>trend direction</strong> only — not absolute body fat. DXA scan below is the clinical reference.
      </div>
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.1em",textTransform:"uppercase"}}>BMI · Daily</div>
          <div style={S.mut9t2}>Hume Pod · weight-based</div>
        </div>
        <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color:P.steel,letterSpacing:"-0.01em"}}>{HUME_DATA[0]?.bmi}</div>
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={[...HUME_DATA].reverse()} margin={{top:4,right:8,left:-18,bottom:0}}>
          <defs>
            <linearGradient id="gHumeBMI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.steel} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={P.steel} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false}
            interval={Math.max(1,Math.floor(HUME_DATA.length/8))}/>
          <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:P.muted}} axisLine={{stroke:P.border}} tickLine={false} domain={[27,32]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"7px 12px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,fontSize:9}}>{label}</div><div style={{fontFamily:FF.m,fontWeight:600,color:P.steel}}>BMI {payload[0]?.value}</div></div>):null}/>
          <ReferenceLine y={25} stroke="#3A5C48" strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}
            label={{value:"25",position:"right",fontFamily:FF.s,fontSize:8,fill:"#3A5C48",opacity:0.6}}/>
          <ReferenceLine y={30} stroke={P.terra} strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}
            label={{value:"30",position:"right",fontFamily:FF.s,fontSize:8,fill:P.terra,opacity:0.6}}/>
          <Area type="monotone" dataKey="bmi" stroke={P.steel} strokeWidth={1.8}
            fill="url(#gHumeBMI)" dot={false} isAnimationActive={true} animationDuration={900}
            activeDot={{r:3,fill:P.steel,stroke:P.card,strokeWidth:2}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:16,margin:"4px 0 2px"}}>
      <div style={S.divider}/>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>DXA Scan · Gold Standard</div>
      <div style={S.divider}/>
    </div>

    <div style={{background:"linear-gradient(135deg,#1A1714 0%,#111009 100%)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:16,padding:"20px",boxShadow:"0 8px 32px rgba(0,0,0,0.20)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>Hologic Horizon W · Pueblo Radiology</div>
          <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:"rgba(255,255,255,0.90)",letterSpacing:"-0.01em"}}>DXA Scan · Jan 23 2026</div>
          <div style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.40)",marginTop:3}}>Most recent gold-standard body composition measurement</div>
        </div>
        <div style={{padding:"5px 12px",borderRadius:8,background:"rgba(196,96,74,0.18)",border:"1px solid rgba(196,96,74,0.35)"}}>
          <div style={{fontFamily:FF.m,fontSize:20,fontWeight:700,color:"#E8816A",letterSpacing:"-0.01em"}}>26.4%</div>
          <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",marginTop:1}}>Total Body Fat</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:12,marginBottom:18}}>
        {[
          {label:"Fat Mass",   val:"56.5 lb",  color:"#E8816A"},
          {label:"Lean Mass",  val:"149.8 lb", color:"#7AC49A"},
          {label:"BMD",        val:"1.331",     color:"#6BAED6", note:"T+1.3 · 111th %ile"},
          {label:"VAT Area",   val:"118 cm²",   color:"#F0B85A", note:"Est. visceral fat"},
          {label:"A/G Ratio",  val:"0.96",      color:"#7AC49A", note:"Balanced"},
          {label:"BMI",        val:"29.3",      color:"#B0A89E"},
        ].map(({label,val,color,note})=>(
          <div key={label} style={{padding:"10px 12px",background:"rgba(255,255,255,0.05)",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.38)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
            <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color,lineHeight:1}}>{val}</div>
            {note&&<div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.28)",marginTop:3}}>{note}</div>}
          </div>
        ))}
      </div>
      <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:10}}>Regional Fat Distribution</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[
          {name:"Trunk",     fatPct:26.3, leanLbs:77.5,  fatLbs:27.6, bmd:1.131},
          {name:"Left Leg",  fatPct:29.6, leanLbs:24.2,  fatLbs:10.2, bmd:1.443},
          {name:"Right Leg", fatPct:29.3, leanLbs:25.3,  fatLbs:10.5, bmd:1.500},
          {name:"Left Arm",  fatPct:20.9, leanLbs:10.4,  fatLbs:2.8,  bmd:1.080},
          {name:"Right Arm", fatPct:20.0, leanLbs:11.0,  fatLbs:2.8,  bmd:1.213},
        ].map(r=>{
          const col = r.fatPct<22?"#7AC49A":r.fatPct<26?"#F0B85A":"#E8816A";
          const barW = Math.round(r.fatPct*3.2); // scale to ~100px max
          return(
            <div key={r.name} style={{display:"grid",gridTemplateColumns:"72px 1fr 80px 80px",gap:12,alignItems:"center"}}>
              <div style={{fontFamily:FF.s,fontSize:10,color:"rgba(255,255,255,0.70)"}}>{r.name}</div>
              <div style={S.row8}>
                <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.08)",flex:1,overflow:"hidden"}}>
                  <div style={{width:`${r.fatPct*3.2}%`,height:"100%",background:col,borderRadius:3,transition:"width 1s ease"}}/>
                </div>
                <span style={{fontFamily:FF.m,fontSize:10,fontWeight:600,color:col,minWidth:36}}>{r.fatPct}%</span>
              </div>
              <div style={{fontFamily:FF.m,fontSize:9,color:"rgba(255,255,255,0.40)",textAlign:"right"}}>{r.fatLbs} lb fat</div>
              <div style={{fontFamily:FF.m,fontSize:9,color:"rgba(255,255,255,0.40)",textAlign:"right"}}>{r.leanLbs} lb lean</div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:18,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:10}}>Scan History · Body Fat %</div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={[
            {d:"Feb '25",v:23.9,src:"Styku"},
            {d:"May '25",v:21.1,src:"Styku"},
            {d:"Jan '26",v:26.4,src:"DXA"},
          ]} margin={{top:4,right:8,left:-22,bottom:0}}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" tick={{fontFamily:FF.m,fontSize:8,fill:"rgba(255,255,255,0.35)"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontFamily:FF.m,fontSize:8,fill:"rgba(255,255,255,0.35)"}} axisLine={false} tickLine={false} domain={[18,30]}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:"#1A1714",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"7px 11px",fontFamily:FF.s,fontSize:10}}><div style={{color:"rgba(255,255,255,0.45)",fontSize:9,marginBottom:2}}>{label} · {payload[0]?.payload?.src}</div><div style={{fontFamily:FF.m,fontWeight:600,color:"#E8816A"}}>{payload[0]?.value}%</div></div>):null}/>
            <Line type="monotone" dataKey="v" stroke="#E8816A" strokeWidth={2} isAnimationActive={true} animationDuration={900}
              dot={p=><circle key={p.index} cx={p.cx} cy={p.cy} r={6} fill={p.payload.src==="DXA"?"#E8816A":"#B06050"} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5}/>}
              name="Body Fat %"/>
          </LineChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:16,marginTop:8}}>
          {[{c:"#B06050",l:"Styku 3D optical"},{c:"#E8816A",l:"DXA (gold standard)"}].map(({c,l})=>(
            <div key={l} style={S.row5}>
              <div style={{width:8,height:8,borderRadius:"50%",background:c}}/>
              <span style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>);
}

const AI_P=`You are a clinical health data analyst for Nate Hahn, a 47-year-old male athlete. Analyze this uploaded health document and respond ONLY with valid JSON — no markdown, no backticks. Structure: {"summary":"2-3 sentence clinical summary","biomarkers":[{"name":"string","value":"string","unit":"string","range":"string","status":"normal|high|low"}],"insights":["insight"],"recommendations":["recommendation"]}. Be precise and clinically actionable.`;

function Insights(){
  const [docs,setDocs]=useState([]);const[drag,setDrag]=useState(false);const ref=useRef();
  const analyze=async(file)=>{
    const entry={id:Date.now(),name:file.name,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),status:"analyzing",result:null};
    setDocs(d=>[entry,...d]);
    try{
      let content;
      if(file.type==="application/pdf"||file.type.startsWith("image/")){const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});content=[{type:file.type==="application/pdf"?"document":"image",source:{type:"base64",media_type:file.type,data:b64}},{type:"text",text:AI_P}];}
      else{const t=await file.text();content=[{type:"text",text:`${AI_P}\n\nFILE: ${file.name}\n\n${t}`}];}
      const res=await fetch("/api/proxy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content}]})});
      const data=await res.json();const raw=data.content?.find(b=>b.type==="text")?.text||"";
      let parsed;try{parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());}catch{parsed={summary:raw,biomarkers:[],insights:[],recommendations:[]};}
      setDocs(d=>d.map(doc=>doc.id===entry.id?{...doc,status:"done",result:parsed}:doc));
    }catch{setDocs(d=>d.map(doc=>doc.id===entry.id?{...doc,status:"error",result:{summary:"Analysis failed.",biomarkers:[],insights:[],recommendations:[]}}:doc));}
  };
  const onFiles=f=>Array.from(f).forEach(analyze);const sc=s=>s==="done"?P.green:s==="error"?P.coral:P.amber;
  return(<div style={{display:"flex",flexDirection:"column",gap:13}}>
    <div style={{padding:"11px 14px",background:`${P.cyan}08`,borderRadius:9,border:`1px solid ${P.cyan}33`,fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6}}>
      💡 Upload any health document — lab reports, Styku scans, RMR tests, DXA, VO₂ max, WHOOP exports — and Claude will extract biomarkers and generate personalized clinical insights for Nate.
    </div>
    <div onClick={()=>ref.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);onFiles(e.dataTransfer.files);}} style={{border:`1.5px dashed ${drag?P.cyan:P.border}`,borderRadius:14,padding:"36px 20px",textAlign:"center",cursor:"pointer",transition:"all .2s",background:drag?`${P.cyan}08`:P.card}}>
      <input ref={ref} type="file" multiple accept=".pdf,.txt,.csv,.png,.jpg,.jpeg" style={{display:"none"}} onChange={e=>onFiles(e.target.files)}/>
      <div style={{fontSize:32,marginBottom:10}}>🔬</div>
      <div style={{fontFamily:FF.s,fontWeight:800,fontSize:14,color:P.text,marginBottom:5}}>Upload Health Document</div>
      <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6}}>Lab panels · Styku scans · DXA · VO₂ max · RMR · WHOOP exports</div>
      <div style={{marginTop:12,display:"inline-flex",gap:7,padding:"7px 16px",borderRadius:8,border:`1px solid ${P.border}`,background:P.panel,fontFamily:FF.s,fontSize:11,color:P.sub}}>↑ Browse or drag & drop</div>
    </div>
    {docs.map(doc=>(
      <div key={doc.id} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"17px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:13}}>
          <div><div style={{fontFamily:FF.s,fontWeight:700,fontSize:13,color:P.text}}>{doc.name}</div><div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginTop:2}}>{doc.date}</div></div>
          <div style={{padding:"3px 10px",borderRadius:99,border:`1px solid ${sc(doc.status)}44`,background:sc(doc.status)+"15",fontFamily:FF.s,fontSize:10,fontWeight:700,color:sc(doc.status)}}>{doc.status==="done"?"Complete":doc.status==="error"?"Error":"Analyzing…"}</div>
        </div>
        {doc.status==="analyzing"&&<div style={{padding:"14px",textAlign:"center",fontFamily:FF.s,fontSize:12,color:P.muted}}>Running clinical analysis…</div>}
        {doc.result&&doc.status!=="analyzing"&&(<div>
          {doc.result.summary&&<div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.7,marginBottom:14,padding:"12px 14px",background:P.panel,borderRadius:8,border:`1px solid ${P.border}`}}>{doc.result.summary}</div>}
          {doc.result.biomarkers?.length>0&&(<div style={{marginBottom:14}}><div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:P.muted,marginBottom:9}}>Biomarkers</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>{doc.result.biomarkers.map((b,i)=><BioCard key={i} {...b}/>)}</div></div>)}
          {doc.result.insights?.length>0&&(<div style={{marginBottom:12}}><div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:P.muted,marginBottom:8}}>Insights</div>{doc.result.insights.map((ins,i)=><div key={i} style={{display:"flex",gap:9,marginBottom:6}}><span style={{color:P.cyan,fontWeight:700,fontSize:12,lineHeight:1.5}}>·</span><span style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.6}}>{ins}</span></div>)}</div>)}
          {doc.result.recommendations?.length>0&&(<div><div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:P.muted,marginBottom:8}}>Recommendations</div>{doc.result.recommendations.map((r,i)=><div key={i} style={{display:"flex",gap:9,marginBottom:6}}><span style={{color:P.green,fontWeight:700,fontSize:12,lineHeight:1.5}}>→</span><span style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.6}}>{r}</span></div>)}</div>)}
        </div>)}
      </div>
    ))}
    {docs.length===0&&<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"24px",textAlign:"center",color:P.muted,fontFamily:FF.s,fontSize:12}}>No documents analyzed yet.</div>}
  </div>);
}

function seedRng(s){let x=s;return()=>{x=Math.imul(48271,x)>>>0;return(x&0x7fffffff)/0x7fffffff};}

// Real WHOOP workout data from CSV exports
const ACTS=[
  {id:"running",   label:"Running",          icon:"🏃", color:"#C47830"},
  {id:"fitness",   label:"Functional Fitness",icon:"🏋", color:"#3A5C48"},
  {id:"spin",      label:"Spin",             icon:"🚴", color:"#C4604A"},
  {id:"walking",   label:"Walking",          icon:"🚶", color:"#7A5A80"},
  {id:"other",     label:"Other",            icon:"⚡", color:"#4A6070"},
];

// Real WHOOP weekly workout data — 53 weeks (Mar 2025 → Mar 2026)
const WEEKLY_REAL=[
  {label:"3/17",strain:25.8,dur:167,cal:1192,count:3,z1m:66,z2m:14,z3m:32,z4m:5,z5m:2},
  {label:"3/24",strain:54.3,dur:368,cal:2731,count:5,z1m:178,z2m:56,z3m:56,z4m:7,z5m:0},
  {label:"3/31",strain:36.6,dur:216,cal:1417,count:5,z1m:121,z2m:30,z3m:15,z4m:2,z5m:0},
  {label:"4/7",strain:59.5,dur:282,cal:2273,count:7,z1m:120,z2m:58,z3m:51,z4m:6,z5m:0},
  {label:"4/14",strain:51.7,dur:279,cal:2088,count:6,z1m:142,z2m:31,z3m:40,z4m:13,z5m:1},
  {label:"4/21",strain:54.3,dur:380,cal:2629,count:6,z1m:240,z2m:59,z3m:25,z4m:4,z5m:0},
  {label:"4/28",strain:53.0,dur:332,cal:2295,count:6,z1m:157,z2m:44,z3m:42,z4m:10,z5m:1},
  {label:"5/5",strain:51.8,dur:301,cal:2242,count:6,z1m:138,z2m:51,z3m:41,z4m:9,z5m:1},
  {label:"5/12",strain:49.6,dur:310,cal:2068,count:6,z1m:153,z2m:48,z3m:28,z4m:6,z5m:0},
  {label:"5/19",strain:68.0,dur:330,cal:3239,count:6,z1m:128,z2m:67,z3m:92,z4m:12,z5m:2},
  {label:"5/26",strain:42.8,dur:239,cal:1694,count:5,z1m:151,z2m:33,z3m:22,z4m:3,z5m:0},
  {label:"6/2",strain:45.9,dur:296,cal:1970,count:5,z1m:165,z2m:40,z3m:16,z4m:7,z5m:1},
  {label:"6/9",strain:76.3,dur:362,cal:3094,count:8,z1m:153,z2m:92,z3m:42,z4m:16,z5m:1},
  {label:"6/16",strain:44.0,dur:255,cal:1923,count:5,z1m:151,z2m:45,z3m:25,z4m:6,z5m:0},
  {label:"6/23",strain:53.9,dur:384,cal:2485,count:6,z1m:193,z2m:59,z3m:29,z4m:5,z5m:0},
  {label:"6/30",strain:13.3,dur:54, cal:424, count:2,z1m:31, z2m:17,z3m:0, z4m:0,z5m:0},
  {label:"7/7",strain:27.7,dur:115,cal:613, count:5,z1m:51, z2m:12,z3m:3, z4m:0,z5m:0},
  {label:"7/14",strain:9.7, dur:36, cal:150, count:2,z1m:15, z2m:3, z3m:0, z4m:0,z5m:0},
  {label:"7/21",strain:27.7,dur:88, cal:927, count:3,z1m:29, z2m:28,z3m:21,z4m:4,z5m:0},
  {label:"7/28",strain:5.3, dur:16, cal:117, count:1,z1m:15, z2m:1, z3m:0, z4m:0,z5m:0},
  {label:"8/4",strain:32.3,dur:145,cal:1190,count:4,z1m:78, z2m:24,z3m:14,z4m:7,z5m:0},
  {label:"8/11",strain:50.2,dur:172,cal:2005,count:5,z1m:47, z2m:51,z3m:58,z4m:15,z5m:0},
  {label:"8/18",strain:25.6,dur:127,cal:791, count:4,z1m:77, z2m:15,z3m:1, z4m:0,z5m:0},
  {label:"8/25",strain:83.3,dur:308,cal:3336,count:8,z1m:96, z2m:76,z3m:98,z4m:17,z5m:2},
  {label:"9/1",strain:35.1,dur:113,cal:1205,count:4,z1m:46, z2m:35,z3m:25,z4m:4,z5m:1},
  {label:"9/8",strain:36.1,dur:120,cal:1443,count:3,z1m:31, z2m:41,z3m:36,z4m:7,z5m:1},
  {label:"9/15",strain:43.3,dur:156,cal:1755,count:4,z1m:26, z2m:51,z3m:48,z4m:15,z5m:0},
  {label:"9/22",strain:46.5,dur:162,cal:1723,count:5,z1m:46, z2m:51,z3m:47,z4m:8,z5m:0},
  {label:"9/29",strain:38.4,dur:127,cal:1659,count:3,z1m:14, z2m:44,z3m:62,z4m:6,z5m:0},
  {label:"10/6",strain:48.4,dur:172,cal:2182,count:4,z1m:34, z2m:25,z3m:91,z4m:18,z5m:1},
  {label:"10/13",strain:38.7,dur:164,cal:1980,count:3,z1m:40,z2m:61,z3m:39,z4m:21,z5m:1},
  {label:"10/20",strain:41.2,dur:190,cal:2275,count:3,z1m:31,z2m:77,z3m:59,z4m:19,z5m:0},
  {label:"10/27",strain:37.1,dur:235,cal:1741,count:4,z1m:125,z2m:37,z3m:27,z4m:1,z5m:0},
  {label:"11/3",strain:46.1,dur:244,cal:2156,count:5,z1m:132,z2m:39,z3m:47,z4m:9,z5m:0},
  {label:"11/10",strain:54.3,dur:264,cal:2278,count:6,z1m:142,z2m:40,z3m:50,z4m:8,z5m:0},
  {label:"11/17",strain:40.1,dur:263,cal:2035,count:4,z1m:155,z2m:41,z3m:26,z4m:5,z5m:0},
  {label:"11/24",strain:41.6,dur:157,cal:1634,count:4,z1m:64, z2m:46,z3m:28,z4m:13,z5m:3},
  {label:"12/1",strain:39.0,dur:204,cal:1759,count:4,z1m:94, z2m:48,z3m:31,z4m:5,z5m:2},
  {label:"12/8",strain:64.0,dur:280,cal:2627,count:6,z1m:119,z2m:73,z3m:41,z4m:11,z5m:3},
  {label:"12/15",strain:58.0,dur:268,cal:2231,count:6,z1m:133,z2m:55,z3m:33,z4m:7,z5m:0},
  {label:"12/22",strain:40.2,dur:173,cal:1524,count:4,z1m:80, z2m:27,z3m:35,z4m:7,z5m:1},
  {label:"12/29",strain:40.1,dur:218,cal:1372,count:6,z1m:159,z2m:20,z3m:4, z4m:0,z5m:0},
  {label:"1/5",strain:32.7,dur:163,cal:1282,count:3,z1m:85, z2m:27,z3m:15,z4m:8,z5m:1},
  {label:"1/12",strain:60.6,dur:279,cal:1984,count:6,z1m:130,z2m:31,z3m:37,z4m:5,z5m:1},
  {label:"1/19",strain:38.4,dur:194,cal:1777,count:3,z1m:76, z2m:26,z3m:33,z4m:22,z5m:2},
  {label:"1/26",strain:68.3,dur:347,cal:2967,count:7,z1m:104,z2m:88,z3m:76,z4m:7,z5m:0},
  {label:"2/2",strain:78.0,dur:517,cal:3573,count:8,z1m:211,z2m:84,z3m:47,z4m:7,z5m:1},
  {label:"2/9",strain:58.7,dur:287,cal:2415,count:5,z1m:120,z2m:65,z3m:29,z4m:16,z5m:3},
  {label:"2/16",strain:66.9,dur:315,cal:2573,count:6,z1m:116,z2m:99,z3m:38,z4m:3,z5m:0},
  {label:"2/23",strain:92.3,dur:472,cal:4045,count:7,z1m:74, z2m:165,z3m:72,z4m:42,z5m:14},
  {label:"3/2",strain:91.0,dur:476,cal:3919,count:8,z1m:81, z2m:162,z3m:78,z4m:36,z5m:7},
  {label:"3/9",strain:95.2,dur:484,cal:3731,count:8,z1m:102,z2m:161,z3m:43,z4m:33,z5m:10},
  {label:"3/16",strain:68.0,dur:337,cal:2688,count:6,z1m:77, z2m:76,z3m:46,z4m:36,z5m:7},
  {label:"3/23",strain:53.8,dur:253,cal:2278,count:4,z1m:31,z2m:104,z3m:75,z4m:29,z5m:7},
];

// Real WHOOP weekly physiological data — 53 weeks (Mar 2025 → Mar 2026)
const WEEKLY_PHYSIO=[
  {label:"3/17",hrv:43.5,rec:68.2,rhr:49.2,strain:9.6},
  {label:"3/24",hrv:43.1,rec:67.4,rhr:49.1,strain:13.1},
  {label:"3/31",hrv:47.6,rec:69.9,rhr:49.3,strain:12.0},
  {label:"4/7", hrv:46.6,rec:76.4,rhr:49.3,strain:12.3},
  {label:"4/14",hrv:40.0,rec:57.1,rhr:53.1,strain:12.8},
  {label:"4/21",hrv:45.6,rec:69.9,rhr:49.7,strain:12.2},
  {label:"4/28",hrv:44.1,rec:67.1,rhr:50.1,strain:12.3},
  {label:"5/5", hrv:45.9,rec:73.0,rhr:49.7,strain:12.0},
  {label:"5/12",hrv:56.5,rec:86.3,rhr:47.2,strain:11.7},
  {label:"5/19",hrv:48.6,rec:60.0,rhr:49.7,strain:12.8},
  {label:"5/26",hrv:49.7,rec:69.4,rhr:48.4,strain:12.4},
  {label:"6/2", hrv:49.4,rec:64.7,rhr:49.0,strain:12.0},
  {label:"6/9", hrv:48.4,rec:63.0,rhr:49.7,strain:12.9},
  {label:"6/16",hrv:48.7,rec:66.5,rhr:49.2,strain:11.2},
  {label:"6/23",hrv:48.2,rec:73.0,rhr:49.2,strain:10.8},
  {label:"6/30",hrv:43.9,rec:54.6,rhr:51.9,strain:9.2},
  {label:"7/7", hrv:31.0,rec:37.7,rhr:57.7,strain:8.8},
  {label:"7/14",hrv:48.4,rec:79.1,rhr:47.7,strain:6.1},
  {label:"7/21",hrv:42.6,rec:62.1,rhr:49.1,strain:9.3},
  {label:"7/28",hrv:41.7,rec:67.1,rhr:49.9,strain:6.8},
  {label:"8/4", hrv:38.7,rec:58.0,rhr:50.9,strain:8.4},
  {label:"8/11",hrv:37.1,rec:60.3,rhr:51.3,strain:10.3},
  {label:"8/18",hrv:43.0,rec:76.9,rhr:50.7,strain:9.4},
  {label:"8/25",hrv:37.3,rec:58.4,rhr:52.6,strain:12.7},
  {label:"9/1", hrv:50.6,rec:82.1,rhr:47.0,strain:8.9},
  {label:"9/8", hrv:50.0,rec:73.4,rhr:47.6,strain:10.0},
  {label:"9/15",hrv:49.0,rec:69.7,rhr:47.7,strain:9.9},
  {label:"9/22",hrv:49.3,rec:69.4,rhr:47.3,strain:10.7},
  {label:"9/29",hrv:48.6,rec:70.3,rhr:47.9,strain:9.6},
  {label:"10/6",hrv:44.9,rec:60.3,rhr:48.7,strain:9.4},
  {label:"10/13",hrv:38.4,rec:52.9,rhr:51.3,strain:10.0},
  {label:"10/20",hrv:45.4,rec:72.7,rhr:48.4,strain:9.6},
  {label:"10/27",hrv:41.9,rec:62.3,rhr:50.3,strain:9.7},
  {label:"11/3",hrv:39.7,rec:61.4,rhr:51.1,strain:10.1},
  {label:"11/10",hrv:42.1,rec:71.9,rhr:50.1,strain:9.8},
  {label:"11/17",hrv:39.6,rec:61.6,rhr:50.7,strain:10.7},
  {label:"11/24",hrv:37.7,rec:61.6,rhr:52.6,strain:9.2},
  {label:"12/1",hrv:37.9,rec:60.6,rhr:51.3,strain:10.0},
  {label:"12/8",hrv:40.9,rec:67.4,rhr:50.4,strain:10.7},
  {label:"12/15",hrv:47.4,rec:75.0,rhr:49.0,strain:11.7},
  {label:"12/22",hrv:50.1,rec:51.3,rhr:53.0,strain:8.1},
  {label:"12/29",hrv:46.1,rec:69.0,rhr:50.1,strain:8.4},
  {label:"1/5", hrv:43.1,rec:62.0,rhr:49.3,strain:7.8},
  {label:"1/12",hrv:37.7,rec:49.4,rhr:51.4,strain:10.9},
  {label:"1/19",hrv:40.3,rec:66.7,rhr:50.4,strain:9.4},
  {label:"1/26",hrv:38.0,rec:60.9,rhr:51.4,strain:11.5},
  {label:"2/2", hrv:43.1,rec:71.3,rhr:50.4,strain:12.4},
  {label:"2/9", hrv:39.1,rec:58.6,rhr:51.9,strain:10.4},
  {label:"2/16",hrv:40.9,rec:69.3,rhr:51.0,strain:12.7},
  {label:"2/23",hrv:54.0,rec:80.7,rhr:50.7,strain:13.5},
  {label:"3/2", hrv:51.9,rec:83.6,rhr:51.6,strain:12.8},
  {label:"3/9", hrv:42.1,rec:59.1,rhr:50.9,strain:13.1},
  {label:"3/16",hrv:45.5,rec:71.0,rhr:49.8,strain:14.3},
  {label:"3/23",hrv:43.5,rec:65.0,rhr:51.7,strain:13.5},
];

// Weekly sleep averages derived from 112 days CAL_DATA (Dec 2025 – Mar 2026)
const WEEKLY_SLEEP=[
  {label:"12/01",score:94.3,dur:9.07},{label:"12/08",score:97.0,dur:8.70},
  {label:"12/15",score:95.1,dur:8.89},{label:"12/22",score:84.3,dur:9.04},
  {label:"12/29",score:83.0,dur:9.51},{label:"01/05",score:88.0,dur:9.20},
  {label:"01/12",score:91.0,dur:9.30},{label:"01/19",score:92.5,dur:9.10},
  {label:"01/26",score:88.5,dur:9.00},{label:"02/02",score:92.0,dur:9.20},
  {label:"02/09",score:89.7,dur:8.87},{label:"02/16",score:89.9,dur:8.54},
  {label:"02/23",score:97.6,dur:8.76},{label:"03/02",score:93.7,dur:8.53},
  {label:"03/09",score:96.0,dur:8.93},{label:"03/16",score:95.9,dur:9.05},
  {label:"03/23",score:97.8,dur:8.76},
];


// Per-activity weekly breakdown — derived from WHOOP workouts.csv (53 weeks)
const WEEKLY_ACTS=[
  {label:"3/17",running:{c:3,s:31.2,d:158},fitness:{c:2,s:14.3,d:105}},
  {label:"3/24",fitness:{c:3,s:33.6,d:261},other:{c:2,s:20.7,d:107}},
  {label:"3/31",fitness:{c:2,s:21.5,d:159},walking:{c:2,s:10.3,d:37},other:{c:1,s:4.8,d:20}},
  {label:"4/7", running:{c:3,s:35.6,d:138},walking:{c:1,s:5.2,d:16},other:{c:3,s:18.7,d:128}},
  {label:"4/14",running:{c:1,s:13.9,d:49},fitness:{c:3,s:26.0,d:164},walking:{c:2,s:11.8,d:66}},
  {label:"4/21",fitness:{c:5,s:49.2,d:364},other:{c:1,s:5.1,d:16}},
  {label:"4/28",fitness:{c:6,s:53.0,d:332}},
  {label:"5/5", fitness:{c:2,s:21.8,d:161},walking:{c:1,s:5.2,d:17},cycling:{c:1,s:13.3,d:75},other:{c:2,s:11.5,d:48}},
  {label:"5/12",running:{c:1,s:11.0,d:47},fitness:{c:1,s:13.0,d:79},walking:{c:1,s:4.8,d:14},other:{c:3,s:20.8,d:170}},
  {label:"5/19",running:{c:1,s:15.3,d:53},fitness:{c:4,s:44.1,d:239},other:{c:1,s:8.6,d:38}},
  {label:"5/26",fitness:{c:4,s:36.1,d:195},walking:{c:1,s:6.7,d:44}},
  {label:"6/2", fitness:{c:3,s:30.6,d:164},walking:{c:1,s:6.9,d:41},other:{c:1,s:8.4,d:91}},
  {label:"6/9", running:{c:2,s:23.3,d:85},fitness:{c:3,s:33.5,d:181},walking:{c:2,s:14.9,d:68},other:{c:1,s:4.6,d:28}},
  {label:"6/16",running:{c:1,s:13.0,d:56},fitness:{c:1,s:11.3,d:86},walking:{c:2,s:11.6,d:65},other:{c:1,s:8.1,d:48}},
  {label:"6/23",running:{c:1,s:13.4,d:78},fitness:{c:3,s:26.3,d:215},walking:{c:1,s:6.3,d:44},other:{c:1,s:7.9,d:47}},
  {label:"6/30",walking:{c:2,s:13.3,d:54}},
  {label:"7/7", walking:{c:4,s:23.1,d:96},other:{c:1,s:4.6,d:19}},
  {label:"7/14",fitness:{c:1,s:5.3,d:19},walking:{c:1,s:4.4,d:17}},
  {label:"7/21",running:{c:1,s:10.5,d:30},walking:{c:1,s:5.7,d:29},other:{c:1,s:11.5,d:29}},
  {label:"7/28",walking:{c:1,s:5.3,d:16}},
  {label:"8/4", running:{c:1,s:13.2,d:41},walking:{c:3,s:19.1,d:104}},
  {label:"8/11",running:{c:3,s:39.2,d:134},walking:{c:1,s:5.1,d:14},other:{c:1,s:5.9,d:24}},
  {label:"8/18",running:{c:1,s:8.4,d:28},walking:{c:2,s:9.5,d:32},other:{c:1,s:7.7,d:67}},
  {label:"8/25",running:{c:5,s:63.8,d:232},walking:{c:3,s:19.5,d:76}},
  {label:"9/1", running:{c:3,s:29.8,d:99},other:{c:1,s:5.3,d:14}},
  {label:"9/8", running:{c:3,s:36.1,d:120}},
  {label:"9/15",running:{c:3,s:37.0,d:121},walking:{c:1,s:6.3,d:35}},
  {label:"9/22",running:{c:3,s:35.8,d:114},walking:{c:2,s:10.7,d:48}},
  {label:"9/29",running:{c:3,s:38.4,d:127}},
  {label:"10/6",running:{c:3,s:41.1,d:137},walking:{c:1,s:7.3,d:35}},
  {label:"10/13",running:{c:2,s:25.2,d:120},other:{c:1,s:13.5,d:44}},
  {label:"10/20",running:{c:3,s:41.2,d:190}},
  {label:"10/27",fitness:{c:2,s:22.9,d:132},walking:{c:2,s:14.2,d:103}},
  {label:"11/3", fitness:{c:3,s:34.7,d:186},walking:{c:2,s:11.4,d:58}},
  {label:"11/10",running:{c:1,s:8.2,d:16},fitness:{c:3,s:34.4,d:182},walking:{c:1,s:6.9,d:50},sport:{c:1,s:4.8,d:16}},
  {label:"11/17",fitness:{c:3,s:33.7,d:219},walking:{c:1,s:6.4,d:44}},
  {label:"11/24",running:{c:3,s:33.0,d:106},walking:{c:1,s:8.6,d:51}},
  {label:"12/1", fitness:{c:3,s:34.7,d:190},walking:{c:1,s:4.3,d:14}},
  {label:"12/8", running:{c:3,s:36.4,d:127},fitness:{c:3,s:27.6,d:153}},
  {label:"12/15",running:{c:3,s:25.3,d:110},fitness:{c:3,s:32.7,d:158}},
  {label:"12/22",running:{c:2,s:20.1,d:60}, fitness:{c:2,s:20.1,d:113}},
  {label:"12/29",running:{c:1,s:9.1,d:28}, fitness:{c:2,s:12.8,d:89},walking:{c:2,s:12.2,d:76},other:{c:1,s:6.0,d:25}},
  {label:"1/5",  fitness:{c:2,s:26.4,d:117},walking:{c:1,s:6.3,d:46}},
  {label:"1/12", running:{c:2,s:16.3,d:50}, fitness:{c:3,s:37.8,d:189},walking:{c:1,s:6.5,d:40}},
  {label:"1/19", running:{c:2,s:20.3,d:126},fitness:{c:1,s:18.1,d:68}},
  {label:"1/26", running:{c:6,s:55.2,d:281},fitness:{c:1,s:13.1,d:66}},
  {label:"2/2",  running:{c:2,s:23.1,d:90}, fitness:{c:3,s:31.0,d:171},walking:{c:2,s:13.7,d:183},other:{c:1,s:10.2,d:73}},
  {label:"2/9",  running:{c:2,s:27.6,d:115},fitness:{c:2,s:25.8,d:144},walking:{c:1,s:5.3,d:28}},
  {label:"2/16", running:{c:3,s:35.9,d:159},fitness:{c:2,s:26.2,d:136},sport:{c:1,s:4.8,d:20}},
  {label:"2/23", running:{c:4,s:49.4,d:235},fitness:{c:3,s:42.9,d:237}},
  {label:"3/2",  running:{c:2,s:24.7,d:141},fitness:{c:3,s:43.2,d:221},spin:{c:2,s:17.7,d:89},walking:{c:1,s:5.4,d:25}},
  {label:"3/9",  running:{c:3,s:36.2,d:157},fitness:{c:3,s:39.6,d:202},spin:{c:2,s:19.4,d:125}},
  {label:"3/16", running:{c:2,s:24.9,d:107},fitness:{c:2,s:28.6,d:156},spin:{c:2,s:14.5,d:74}},
  {label:"3/23", running:{c:2,s:26.7,d:135},fitness:{c:2,s:27.1,d:118}},
];

const ACT_META={
  running: {label:"Running",          icon:"🏃",color:"#C47830"},
  fitness: {label:"Functional Fitness",icon:"🏋",color:"#3A5C48"},
  spin:    {label:"Spin",             icon:"🚴",color:"#C4604A"},
  walking: {label:"Walking",          icon:"🚶",color:"#7A5A80"},
  cycling: {label:"Cycling",          icon:"🚲",color:"#4A6070"},
  strength:{label:"Strength",         icon:"💪",color:"#8A6050"},
  sport:   {label:"Sport",            icon:"⚽",color:"#B8902A"},
  yoga:    {label:"Yoga",             icon:"🧘",color:"#9A4558"},
  hiking:  {label:"Hiking",           icon:"🥾",color:"#3A5C48"},
  other:   {label:"Other",            icon:"⚡",color:"#6B6057"},
};

// Recent 20 workouts for log

// Activity totals for breakdown
const ACT_TOTALS_REAL=[
  {id:"running",  label:"Running",          icon:"🏃",color:"#C47830",count:39,avgStrain:12.2,totalDur:2225,totalCal:22278},
  {id:"fitness",  label:"Functional Fitness",icon:"🏋",color:"#3A5C48",count:40,avgStrain:13.9,totalDur:2474,totalCal:24230},
  {id:"spin",     label:"Spin",             icon:"🚴",color:"#C4604A",count:6, avgStrain:8.3, totalDur:279, totalCal:2398 },
  {id:"walking",  label:"Walking",          icon:"🚶",color:"#7A5A80",count:9, avgStrain:4.8, totalDur:310, totalCal:1700 },
  {id:"other",    label:"Other",            icon:"⚡",color:"#4A6070",count:3, avgStrain:6.2, totalDur:115, totalCal:680  },
];

// FITNESS_LOAD (ATL/CTL/TSB) calculated over full 53-week dataset
const FITNESS_LOAD = WEEKLY_REAL.map((w,i)=>{
  const acute  = WEEKLY_REAL.slice(Math.max(0,i-3), i+1).reduce((s,x)=>s+x.strain,0)/Math.min(4, i+1);
  const chronic= WEEKLY_REAL.slice(Math.max(0,i-11),i+1).reduce((s,x)=>s+x.strain,0)/Math.min(12,i+1);
  return{label:w.label,atl:+acute.toFixed(1),ctl:+chronic.toFixed(1),tsb:+(chronic-acute).toFixed(1)};
});

// Zone totals across full 53-week dataset (used in activity guide)
const ZONE_TOTALS = WEEKLY_REAL.reduce((acc,w)=>{
  acc[0]+=w.z1m; acc[1]+=w.z2m; acc[2]+=w.z3m; acc[3]+=w.z4m; acc[4]+=w.z5m;
  return acc;
},[0,0,0,0,0]);
const ZONE_TOTAL_MIN = ZONE_TOTALS.reduce((a,b)=>a+b,0);

const ZONE_CFG=[
  {label:"Z1",full:"Zone 1",sub:"Recovery",  range:"<108 bpm",  color:"#A8A09A"},
  {label:"Z2",full:"Zone 2",sub:"Aerobic",   range:"108-126",   color:"#3A5C48"},
  {label:"Z3",full:"Zone 3",sub:"Tempo",     range:"127-144",   color:"#4A6070"},
  {label:"Z4",full:"Zone 4",sub:"Threshold", range:"145-162",   color:"#C47830"},
  {label:"Z5",full:"Zone 5",sub:"Max",       range:">162 bpm",  color:"#C4604A"},
];

function FitnessPage(){
  const [range,setRange]=useState(16);
  const [activeAct,setActiveAct]=useState(null);
  const _todayKey = (()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();

  // --- Live history: fetch daily data from cron and extend static weekly arrays ---
  const [historyDays, setHistoryDays] = useState([]);
  useEffect(() => {
    fetch('/api/whoop/history').then(r => r.ok ? r.json() : null)
      .then(res => { if (res && res.days && res.days.length) setHistoryDays(res.days); })
      .catch(() => {});
  }, []);
  const _wkLabel = (ds) => { const d=new Date(ds+'T12:00:00'),dy=d.getDay(),df=d.getDate()-dy+(dy===0?-6:1),m=new Date(d.getFullYear(),d.getMonth(),df); return (m.getMonth()+1)+'/'+m.getDate(); };
  const {mergedReal,mergedPhysio,mergedLoad} = useMemo(() => {
    if(!historyDays.length) return {mergedReal:WEEKLY_REAL,mergedPhysio:WEEKLY_PHYSIO,mergedLoad:FITNESS_LOAD};
    const lastLbl = WEEKLY_REAL.length ? WEEKLY_REAL[WEEKLY_REAL.length-1].label : '';
    const wkMap = {};
    historyDays.forEach(day => { const wk=_wkLabel(day.date); if(!wkMap[wk]) wkMap[wk]=[]; wkMap[wk].push(day); });
    const nR=[], nP=[];
    Object.keys(wkMap).sort().forEach(wk => {
      if(lastLbl){const[sm,sd]=lastLbl.split('/').map(Number),[wm,wd]=wk.split('/').map(Number);const sy=sm>6?2025:2026,wy=wm>6?2025:2026;if(new Date(wy,wm-1,wd)<=new Date(sy,sm-1,sd))return;}
      const days=wkMap[wk]; let ts=0,td=0,tc=0,tn=0;
      days.forEach(d=>{(d.workouts||[]).forEach(w=>{ts+=+(w.strain||0);td+=+(w.dur||0);tc+=+(w.cal||0);tn++;});});
      nR.push({label:wk,strain:+ts.toFixed(1),dur:Math.round(td),cal:Math.round(tc),count:tn,z1m:0,z2m:0,z3m:0,z4m:0,z5m:0});
      const vd=days.filter(d=>d.recovery>0);
      if(vd.length){const av=(a,k)=>+(a.reduce((s,d)=>s+(+d[k]||0),0)/a.length).toFixed(1);nP.push({label:wk,hrv:av(vd,'hrv'),rec:av(vd,'recovery'),rhr:av(vd,'rhr'),strain:av(vd,'strain')});}
    });
    const mR=[...WEEKLY_REAL,...nR],mP=[...WEEKLY_PHYSIO,...nP];
    const mL=mR.map((w,i)=>{const a=mR.slice(Math.max(0,i-3),i+1).reduce((s,x)=>s+x.strain,0)/Math.min(4,i+1),c=mR.slice(Math.max(0,i-11),i+1).reduce((s,x)=>s+x.strain,0)/Math.min(12,i+1);return{label:w.label,atl:+a.toFixed(1),ctl:+c.toFixed(1),tsb:+(c-a).toFixed(1)};});
    return {mergedReal:mR,mergedPhysio:mP,mergedLoad:mL};
  }, [historyDays]);

  // richDays = all days with workouts, sorted oldest→newest
  // allNavDays = union of richDays + today so today is always reachable
  const richDays   = Object.keys(CAL_RICH).sort();
  const allNavDays = [...new Set([...richDays, _todayKey])].sort();

  // Default to most recent workout day (last in allNavDays that has data, or today)
  const [viewDay, setViewDay] = useState(()=>{
    // Start on the most recent day that has workout data
    const lastWorkoutDay = richDays[richDays.length - 1];
    return lastWorkoutDay || _todayKey;
  });

  // Navigation: left (‹) = go back in time, right (›) = go forward in time
  const viewIdx  = allNavDays.indexOf(viewDay);
  const canPrev  = viewIdx > 0;                          // can go further back
  const canNext  = viewIdx < allNavDays.length - 1;      // can go forward toward today
  const prevDay  = () => canPrev && setViewDay(allNavDays[viewIdx - 1]);
  const nextDay  = () => canNext && setViewDay(allNavDays[viewIdx + 1]);
  const isToday  = viewDay === _todayKey;

  // Format display date
  const viewDate = new Date(viewDay+"T12:00:00");
  const viewDateLabel = viewDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  const viewDayShort  = viewDate.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  const ax={tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  const wkSlice   = mergedReal.slice(-range);
  const ldSlice   = mergedLoad.slice(-range);
  const physSlice = mergedPhysio.slice(-range);
  const actSlice  = WEEKLY_ACTS.slice(-range);

 
  const actTotals = Object.entries(
    actSlice.reduce((acc, wk) => {
      Object.entries(wk).forEach(([key, val]) => {
        if (key === 'label' || !val || typeof val !== 'object') return;
        if (!acc[key]) acc[key] = { count:0, strain:0, dur:0 };
        acc[key].count  += val.c || 0;
        acc[key].strain += val.s || 0;
        acc[key].dur    += val.d || 0;
      });
      return acc;
    }, {})
  )
  .map(([id, v]) => ({
    id,
    ...(ACT_META[id] || { label: id, icon:"⚡", color: P.steel }),
    count:  v.count,
    avgStrain: v.count ? +(v.strain / v.count).toFixed(1) : 0,
    totalDur:  v.dur,
  }))
  .filter(a => a.count > 0)
  .sort((a, b) => b.count - a.count);

  const actTotal = actTotals.reduce((s, a) => s + a.count, 0);
  const maxCount = actTotals.length ? actTotals[0].count : 1;

  // Totals for selected range
  const rStrain  = wkSlice.reduce((s,w)=>s+w.strain,0).toFixed(1);
  const rDur     = wkSlice.reduce((s,w)=>s+w.dur,0);
  const rCal     = wkSlice.reduce((s,w)=>s+w.cal,0);
  const rCount   = wkSlice.reduce((s,w)=>s+w.count,0);
  const rZ       = wkSlice.reduce((a,w)=>{a[0]+=w.z1m;a[1]+=w.z2m;a[2]+=w.z3m;a[3]+=w.z4m;a[4]+=w.z5m;return a;},[0,0,0,0,0]);
  const rZSum    = rZ.reduce((a,b)=>a+b,0);

  const zStackData = wkSlice.map(w=>({label:w.label,z1:Math.round(w.z1m),z2:Math.round(w.z2m),z3:Math.round(w.z3m),z4:Math.round(w.z4m),z5:Math.round(w.z5m),strain:+w.strain.toFixed(1)}));

  const filteredLog = activeAct
    ? RECENT_WORKOUTS.filter(w=>w.activity.toLowerCase().includes(activeAct))
    : RECENT_WORKOUTS;
  const NOTES_KEY = "vital_workout_notes_v1";
  const [allNotes, setAllNotes] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem(NOTES_KEY)||"{}"); }catch(e){ return {}; }
  });
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteDraft,   setNoteDraft]   = useState("");

  const saveNote = (day, text) => {
    const next = {...allNotes};
    if(text.trim()) next[day] = {text:text.trim(), saved:new Date().toISOString()};
    else delete next[day];
    setAllNotes(next);
    try{ localStorage.setItem(NOTES_KEY, JSON.stringify(next)); }catch(e){}
    setNoteEditing(false);
    setNoteDraft("");
  };

  const startEditing = (day) => {
    setNoteDraft(allNotes[day]?.text || "");
    setNoteEditing(true);
  };

  // Debug: log saves to console
  const saveNoteDebug = (day, text) => {
    saveNote(day, text);
  };

 
  useEffect(()=>{
    setNoteEditing(false);
    setNoteDraft("");
  }, [viewDay]);

  // Peloton overlay — merges distance/pace/power into WHOOP sessions
  const peloOverlay = (()=>{
    try{ return JSON.parse(localStorage.getItem("vital_cal_rich_overlay")||"{}"); }
    catch(e){ return {}; }
  })();
  const mergePelo = (w, dateKey) => {
    const p = (peloOverlay[dateKey]||{})[w.cat];
    if(!p) return w;
    return {...w,
      distance:   w.distance   ||p.distance,
      avgPace:    w.avgPace    ||p.avgPace,
      avgSpeed:   w.avgSpeed   ||p.avgSpeed,
      output:     w.output     ||p.output,
      avgWatts:   w.avgWatts   ||p.avgWatts,
      maxWatts:   w.maxWatts   ||p.maxWatts,
      avgCadence: w.avgCadence ||p.avgCadence,
      avgResist:  w.avgResist  ||p.avgResist,
      peloTitle:  w.peloTitle  ||p.peloTitle,
      peloInst:   w.peloInst   ||p.peloInst,
      peloMerged: true,
    };
  };

  const currentNote = allNotes[viewDay];
  const todayCalDay   = CAL_DATA[viewDay] || {};
  const todayWorkouts = (CAL_RICH[viewDay] || []).map(w=>mergePelo(w,viewDay));
  const todayRec      = todayCalDay.rec;
  const todaySlp      = todayCalDay.slp;
  const todayStrain   = todayWorkouts.reduce((s,w)=>s+w.strain,0);
  const todayCal      = todayWorkouts.reduce((s,w)=>s+w.cal,0);
  const todayDur      = todayWorkouts.reduce((s,w)=>s+w.dur,0);

  const CAT_META_LOCAL = {
    running:{icon:"🏃",color:"#C47830",label:"Running"},
    fitness:{icon:"🏋",color:"#3A5C48",label:"Functional Fitness"},
    spin:   {icon:"🚴",color:"#C4604A",label:"Spin"},
    walking:{icon:"🚶",color:"#7A5A80",label:"Walking"},
    other:  {icon:"⚡",color:"#6B6057",label:"Activity"},
  };
  const catMeta = cat => CAT_META_LOCAL[cat] || CAT_META_LOCAL.other;
  const strColor = s => s>=16?P.terra:s>=12?P.amber:P.sage;
  const zoneColors = ["#6B7C8A","#3A5C48","#C47830","#C4604A","#8A3020"];
  const zoneLabels = ["Z1 Warmup","Z2 Aerobic","Z3 Tempo","Z4 Threshold","Z5 Max"];

  return(<div style={S.col18}>
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={prevDay} disabled={!canPrev}
          style={{width:32,height:32,borderRadius:8,border:`1px solid ${P.border}`,background:P.card,
            cursor:canPrev?"pointer":"default",fontSize:16,color:canPrev?P.text:P.border,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
            transition:"all .15s"}}>‹</button>

        <div style={{flex:1,textAlign:"center",padding:"0 12px"}}>
          <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color:P.text,letterSpacing:"-0.01em"}}>
            {isToday?"Today · ":""}{viewDateLabel}
          </div>
          {todayWorkouts.length>0&&<div style={S.mut9t2}>
            {todayWorkouts.length} workout{todayWorkouts.length>1?"s":""} · {todayStrain.toFixed(1)} strain · {todayCal.toLocaleString()} kcal
          </div>}
        </div>

        <button onClick={nextDay} disabled={!canNext}
          style={{width:32,height:32,borderRadius:8,border:`1px solid ${P.border}`,background:P.card,
            cursor:canNext?"pointer":"default",fontSize:16,color:canNext?P.text:P.border,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
            transition:"all .15s"}}>›</button>
      </div>

{(()=>{ const fitMob=useIsMobile(); return (
      todayWorkouts.length > 0 ? (
        <div style={{display:"grid",gridTemplateColumns:fitMob?"1fr":`repeat(${Math.min(todayWorkouts.length,2)},1fr) ${todayWorkouts.length>0?"auto":""}`,gap:16,alignItems:"stretch"}}>
          {todayWorkouts.map((w,i)=>{
            const meta = catMeta(w.cat);
            const zones = [
              {pct:w.z1p, min:w.z1m, color:zoneColors[0], label:"Z1 Warmup",    sub:"<50% HRmax"},
              {pct:w.z2p, min:w.z2m, color:zoneColors[1], label:"Z2 Aerobic",   sub:"50–60%"},
              {pct:w.z3p, min:w.z3m, color:zoneColors[2], label:"Z3 Tempo",     sub:"60–70%"},
              {pct:w.z4p, min:w.z4m, color:zoneColors[3], label:"Z4 Threshold", sub:"70–80%"},
              {pct:w.z5p, min:w.z5m, color:zoneColors[4], label:"Z5 Max",       sub:">80%"},
            ].filter(z=>z.pct>0);
            const hasZones = zones.length>0;
            const maxHRpct = w.avgHR && w.maxHR ? Math.round((w.avgHR/w.maxHR)*100) : null;

            return(
              <div key={i} style={{background:P.card,border:`1px solid ${meta.color}22`,borderRadius:16,padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:46,height:46,borderRadius:13,background:meta.color+"14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:`1px solid ${meta.color}22`,flexShrink:0}}>
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{fontFamily:FF.s,fontWeight:700,fontSize:15,color:P.text}}>{w.peloTitle||w.name}</div>
                      {w.peloMerged&&<div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                        <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,padding:"1px 7px",borderRadius:4,background:"#E6000012",border:"1px solid #E6000033",color:"#E60000",letterSpacing:"0.06em"}}>🚴 PELOTON</span>
                        {w.peloInst&&<span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>{w.peloInst}</span>}
                      </div>}
                      <div style={S.mut9t2}>
                        WHOOP · {w.start}{w.dur?` · ${Math.floor(w.dur/60)?Math.floor(w.dur/60)+"h ":""}${w.dur%60||w.dur}m`:""}
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"center",padding:"8px 14px",borderRadius:12,background:strColor(w.strain)+"14",border:`1px solid ${strColor(w.strain)}22`}}>
                    <div style={{fontFamily:FF.r,fontSize:28,fontWeight:700,color:strColor(w.strain),letterSpacing:"-0.02em",lineHeight:1}}>{w.strain}</div>
                    <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>Strain</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginBottom:16}}>
                  {[
                    {label:"Duration",  val:`${Math.floor(w.dur/60)?Math.floor(w.dur/60)+"h ":""}${w.dur%60||w.dur}m`, color:P.steel},
                    {label:"Calories",  val:w.cal.toLocaleString()+" kcal",       color:P.terra},
                    {label:"Avg HR",    val:w.avgHR?`${w.avgHR} bpm`:"—",         color:"#C47830"},
                    {label:"Max HR",    val:w.maxHR?`${w.maxHR} bpm`:"—",         color:"#C4604A"},
                    // Peloton-sourced fields (only shown when merged data exists)
                    ...(w.distance >0 ? [{label:"Distance",  val:`${w.distance.toFixed(2)} mi`,                color:P.sage}]  : []),
                    ...(w.avgPace  >0 ? [{label:"Avg Pace",  val:`${Math.floor(w.avgPace)}:${String(Math.round((w.avgPace%1)*60)).padStart(2,"0")} /mi`, color:P.sage}] : []),
                    ...(w.output   >0 ? [{label:"Output",    val:`${w.output} kJ`,                             color:P.amber}] : []),
                    ...(w.avgWatts >0 ? [{label:"Avg Watts", val:`${w.avgWatts}w`,                             color:P.amber}] : []),
                    ...(w.avgCadence>0? [{label:"Cadence",   val:`${w.avgCadence} rpm`,                        color:P.steel}] : []),
                    ...(w.avgResist >0? [{label:"Resistance",val:`${w.avgResist}%`,                            color:P.clay}]  : []),
                  ].map(({label,val,color})=>(
                    <div key={label} style={{padding:"9px 10px",background:P.panel,borderRadius:9,border:`1px solid ${P.border}`}}>
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{label}</div>
                      <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color,letterSpacing:"-0.01em",lineHeight:1}}>{val}</div>
                    </div>
                  ))}
                </div>
                {hasZones&&(
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Heart Rate Zones</div>
                      {maxHRpct&&<div style={S.mut9}>Avg {w.avgHR} / Max {w.maxHR} bpm</div>}
                    </div>
                    <div style={{display:"flex",height:12,borderRadius:6,overflow:"hidden",marginBottom:12,gap:1}}>
                      {[w.z1p,w.z2p,w.z3p,w.z4p,w.z5p].map((z,zi)=>
                        z>0?<div key={zi} style={{flex:z,background:zoneColors[zi],minWidth:3}}/>:null
                      )}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {zones.map((z,zi)=>(
                        <div key={zi} style={{display:"grid",gridTemplateColumns:"100px 1fr 44px 44px",gap:8,alignItems:"center"}}>
                          <div style={S.row6}>
                            <div style={{width:8,height:8,borderRadius:2,background:z.color,flexShrink:0}}/>
                            <div>
                              <div style={{fontFamily:FF.s,fontSize:9,fontWeight:500,color:P.text,lineHeight:1}}>{z.label}</div>
                              <div style={{fontFamily:FF.s,fontSize:7,color:P.muted}}>{z.sub}</div>
                            </div>
                          </div>
                          <div style={{height:5,background:P.border,borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${z.pct}%`,background:z.color,borderRadius:3,transition:"width 0.9s cubic-bezier(0.34,1.2,0.64,1)"}}/>
                          </div>
                          <div style={{fontFamily:FF.m,fontSize:9,color:z.color,textAlign:"right",fontWeight:500}}>{z.pct}%</div>
                          <div style={{fontFamily:FF.m,fontSize:9,color:P.muted,textAlign:"right"}}>{z.min}m</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div style={{display:"flex",flexDirection:"column",gap:12,minWidth:160}}>
            {todayRec!=null&&(
              <div style={{background:P.cardDk,borderRadius:14,padding:"16px",border:`1px solid ${P.borderDk}`,flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{position:"relative",marginBottom:8}}>
                  {(()=>{
                    const rc=todayRec>=80?"#3A5C48":todayRec>=60?"#C47830":"#C4604A";
                    const r=30,circ=2*Math.PI*r;
                    return(
                      <svg width={68} height={68} style={{transform:"rotate(-90deg)"}}>
                        <circle cx={34} cy={34} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5}/>
                        <AnimRing cx={34} cy={34} r={r} stroke={rc} sw={5} pct={todayRec/100} color={rc} delay={200}/>
                      </svg>
                    );
                  })()}
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.textInv}}>{todayRec}</div>
                  </div>
                </div>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk}}>Recovery</div>
              </div>
            )}
            {todaySlp!=null&&(
              <div style={{background:P.card,borderRadius:12,padding:"12px 14px",border:`1px solid ${P.border}`}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:3}}>Sleep</div>
                <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:"#4A6070",letterSpacing:"-0.01em"}}>{todaySlp}%</div>
              </div>
            )}
            {todayWorkouts.length>1&&(
              <div style={{background:P.panel,borderRadius:12,padding:"12px 14px",border:`1px solid ${P.border}`}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>Day Total</div>
                {[
                  {label:"Strain",val:todayStrain.toFixed(1),color:strColor(todayStrain)},
                  {label:"Cal",   val:todayCal,              color:P.terra},
                  {label:"Time",  val:`${todayDur}m`,        color:P.steel},
                ].map(({label,val,color})=>(
                  <div key={label} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={S.mut9}>{label}</span>
                    <span style={{fontFamily:FF.r,fontSize:12,fontWeight:600,color}}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"20px",boxShadow:"0 1px 3px rgba(0,0,0,.04)",display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:28}}>😴</div>
          <div>
            <div style={{fontFamily:FF.s,fontWeight:600,fontSize:13,color:P.text,marginBottom:3}}>Rest day</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>No workouts logged on {viewDayShort}. Active recovery or full rest.</div>
          </div>
          {todayRec!=null&&<div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontFamily:FF.r,fontSize:28,fontWeight:600,color:todayRec>=80?P.sage:P.amber,letterSpacing:"-0.02em"}}>{todayRec}%</div>
            <div style={S.mut9}>Recovery</div>
          </div>}
        </div>
      )
    );})()}
    </div>
    <div style={{background:P.card,border:`1px solid ${noteEditing?P.amber+"66":currentNote?P.sage+"33":P.border}`,
      borderRadius:14,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,.04)",
      transition:"border-color .2s"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:noteEditing||currentNote?10:0}}>
        <div style={S.row8}>
          <span style={{fontSize:15}}>📝</span>
          <div>
            <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>Workout Note</div>
            {currentNote&&!noteEditing&&(
              <div style={S.mut8}>
                Saved {new Date(currentNote.saved).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit",hour:"numeric",minute:"2-digit"})}
              </div>
            )}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {!noteEditing&&(
            <button onClick={()=>startEditing(viewDay)}
              style={{fontFamily:FF.s,fontSize:10,fontWeight:600,padding:"5px 12px",
                borderRadius:7,border:`1px solid ${P.border}`,background:P.panel,
                color:P.sub,cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=P.amber;e.currentTarget.style.color=P.amber;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.color=P.sub;}}>
              {currentNote?"Edit":"+ Add note"}
            </button>
          )}
          {!noteEditing&&currentNote&&(
            <button onClick={()=>saveNoteDebug(viewDay,"")}
              style={{fontFamily:FF.s,fontSize:10,padding:"5px 10px",
                borderRadius:7,border:`1px solid ${P.border}`,background:"transparent",
                color:P.muted,cursor:"pointer"}}
              title="Delete note">✕</button>
          )}
        </div>
      </div>
      {noteEditing ? (
        <div>
          <textarea
            key={viewDay}
            autoFocus
            value={noteDraft}
            onChange={e=>setNoteDraft(e.target.value)}
            onKeyDown={e=>{if(e.key==="Escape"){setNoteEditing(false);setNoteDraft("");}}}
            placeholder={`How did ${viewDayShort} feel? Pace, effort, how the body felt, what you'd do differently...`}
            rows={4}
            style={{
              width:"100%",padding:"10px 12px",borderRadius:9,
              border:`1.5px solid ${P.amber}`,background:P.panel,
              fontFamily:FF.s,fontSize:12,color:P.text,
              resize:"vertical",outline:"none",lineHeight:1.6,
              boxSizing:"border-box",marginBottom:8,
            }}
          />
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{setNoteEditing(false);setNoteDraft("");}}
              style={{fontFamily:FF.s,fontSize:11,padding:"7px 14px",
                borderRadius:8,border:`1px solid ${P.border}`,background:P.panel,
                color:P.muted,cursor:"pointer"}}>Cancel</button>
            <button
              disabled={!noteDraft.trim()}
              onClick={()=>saveNoteDebug(viewDay,noteDraft)}
              style={{fontFamily:FF.s,fontSize:11,fontWeight:700,padding:"7px 16px",
                borderRadius:8,border:"none",
                background:noteDraft.trim()?P.sage:"rgba(0,0,0,0.08)",
                color:noteDraft.trim()?"#fff":P.muted,
                cursor:noteDraft.trim()?"pointer":"not-allowed",
                transition:"all .15s",opacity:noteDraft.trim()?1:0.5}}>
              Save note
            </button>
          </div>
        </div>
      ) : currentNote ? (
        <div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.7,
          padding:"10px 12px",background:P.panel,borderRadius:8,
          borderLeft:`3px solid ${P.sage}`}}>
          {currentNote.text}
        </div>
      ) : (
        <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,fontStyle:"italic"}}>
          No note for {viewDayShort} yet.
        </div>
      )}
    </div>
    <div style={{display:"flex",alignItems:"center",gap:16}}>
      <div style={S.divider}/>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Training History</div>
      <div style={S.divider}/>
    </div>
    <div style={S.rowsb}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          WHOOP · {range===1?"1 Week":range===4?"4 Weeks":`${range} Weeks`} · Mar 2025–Mar 2026
        </div>
        <div style={S.h18}>Fitness Overview</div>
      </div>
      <div style={{display:"flex",gap:5}}>
        {[1,4,8,16,26,52].map(r=>(
          <button key={r} onClick={()=>setRange(r)} style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:7,cursor:"pointer",transition:"all .15s",background:range===r?P.cardDk:P.card,color:range===r?P.textInv:P.sub,border:`1px solid ${range===r?P.cardDk:P.border}`}}>{r}W</button>
        ))}
      </div>
    </div>
    <div style={S.g120}>
      {[
        {icon:"⚡",label:"Total Strain",   val:rStrain,                                    color:P.amber, sub:`${rCount} sessions`},
        {icon:"🏋",label:"Workouts",       val:rCount,                                     color:P.sage,  sub:`${(rCount/range).toFixed(1)}/wk avg`},
        {icon:"⏱",label:"Duration",       val:`${Math.floor(rDur/60)}h ${rDur%60}m`,      color:P.steel, sub:`${rCount?Math.round(rDur/rCount):0}m avg`},
        {icon:"🔥",label:"Calories",       val:rCal.toLocaleString(),                      color:P.terra, sub:`${rCount?Math.round(rCal/rCount):0}/session`},
        {icon:"❤",label:"Zone 2 Time",    val:`${Math.round((rZ[1]/Math.max(1,rZSum))*100)}%`, color:P.sage, sub:`${Math.round(rZ[1])}m aerobic base`},
      ].map(({icon,label,val,color,sub})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{width:28,height:28,borderRadius:7,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginBottom:8}}>{icon}</div>
          <div style={{fontFamily:FF.r,fontSize:26,fontWeight:600,color:P.text,lineHeight:1,marginBottom:2,letterSpacing:"-0.01em"}}>{val}</div>
          <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,marginBottom:2}}>{label}</div>
          <div style={S.mut9}>{sub}</div>
        </div>
      ))}
    </div>
    <div style={S.g240}>
      <div style={CS()}>
        <SLabel color={P.sage} right={`${Math.round(rZSum/60)}h total`}>HR Zone Distribution</SLabel>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
          {(()=>{
            const size=120,cx=60,cy=60,r=44,sw=11,circ=2*Math.PI*r;
            let offset=0;
            const slices=ZONE_CFG.map((z,i)=>{
              const pct=rZ[i]/Math.max(1,rZSum);
              const dash=circ*pct,gap=circ*(1-pct),rot=offset;offset+=pct;
              return{...z,dash,gap,rot,pct,mins:Math.round(rZ[i])};
            });
            return(<div style={{position:"relative"}}>
              <svg width={size} height={size}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.panel} strokeWidth={sw+2}/>
                {slices.map((s,i)=>s.pct>0.01&&(
                  <AnimRingArc key={i} cx={cx} cy={cy} r={r} sw={sw} color={s.color}
                    dash={s.dash} gap={s.gap} rot={s.rot} delay={i*80}/>
                ))}
                <text x={cx} y={cy-5} textAnchor="middle" fontFamily={P.serif} fontSize={16} fontWeight="600" fill={P.text}>{Math.round(rZSum/60)}h</text>
                <text x={cx} y={cy+9} textAnchor="middle" fontFamily={P.sans} fontSize={8} fill={P.muted}>training</text>
              </svg>
            </div>);
          })()}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
          {ZONE_CFG.map((z,i)=>{
            const mins=Math.round(rZ[i]),pct=Math.round((rZ[i]/Math.max(1,rZSum))*100);
            return(<div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                  <div style={{width:7,height:7,borderRadius:2,background:z.color,flexShrink:0}}/>
                  <span style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text,whiteSpace:"nowrap"}}>{z.full}</span>
                  <span style={{fontFamily:FF.s,fontSize:9,color:P.muted,whiteSpace:"nowrap"}}>{z.range}</span>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0,marginLeft:8}}>
                  <span style={{fontFamily:FF.m,fontSize:10,color:z.color,fontWeight:600}}>{pct}%</span>
                  <span style={{fontFamily:FF.m,fontSize:9,color:P.muted,minWidth:28,textAlign:"right"}}>{mins}m</span>
                </div>
              </div>
              <div style={{height:4,background:P.panel,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:z.color,borderRadius:2,
                  transition:"width 0.9s cubic-bezier(0.34,1.2,0.64,1)"}}/>
              </div>
            </div>);
          })}
        </div>

        <div style={{padding:"9px 12px",background:P.panel,borderRadius:8,fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>
          <span style={{color:P.sage,fontWeight:600}}>{Math.round((rZ[1]/Math.max(1,rZSum))*100)}% Zone 2</span>
          {rZ[1]/rZSum>0.3?" — solid aerobic base.":"  — target 35–45% for mitochondrial density."}
          {"  "}<span style={{color:P.amber,fontWeight:600}}>{Math.round(((rZ[3]+rZ[4])/Math.max(1,rZSum))*100)}%</span>{" Z4/Z5."}
        </div>
      </div>
      <div style={CS()}>
        <SLabel color={P.clay} right={`${actTotal} sessions · ${range}W`}>Activity Mix</SLabel>
        {actTotals.map((a,i)=>{
          const pct=Math.round((a.count/Math.max(1,actTotal))*100);
          const isActive=activeAct===a.id;
          return(<div key={a.id} onClick={()=>setActiveAct(isActive?null:a.id)}
            style={{display:"flex",alignItems:"center",gap:12,padding:"9px 10px",borderRadius:9,marginBottom:6,cursor:"pointer",
              background:isActive?a.color+"10":P.panel,border:`1px solid ${isActive?a.color+"44":P.border}`,transition:"all .15s"}}
            onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=P.bg;}}
            onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background=P.panel;}}>
            <div style={{width:26,height:26,borderRadius:6,background:a.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{a.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>{a.label}</span>
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontFamily:FF.m,fontSize:10,color:a.color,fontWeight:500}}>{a.count}×</span>
                  <span style={{fontFamily:FF.m,fontSize:10,color:P.muted}}>{pct}%</span>
                  <span style={{fontFamily:FF.m,fontSize:10,color:P.muted}}>avg {a.avgStrain}</span>
                </div>
              </div>
              <div style={{height:3,background:P.border,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(a.count/maxCount)*100}%`,background:a.color,borderRadius:2,transition:"width 0.85s cubic-bezier(0.34,1.2,0.64,1)"}}/>
              </div>
            </div>
          </div>);
        })}
        <div style={{marginTop:6,padding:"7px 10px",background:P.panel,borderRadius:7,border:`1px solid ${P.border}`,fontFamily:FF.s,fontSize:9,color:P.muted}}>
          💡 Click to filter workout log below
        </div>
      </div>
    </div>
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <SLabel color={P.amber} right="zone minutes + strain">Weekly Training Load</SLabel>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {ZONE_CFG.map(z=>(
            <div key={z.label} style={S.row4}>
              <div style={{width:7,height:7,borderRadius:1,background:z.color}}/>
              <span style={S.mut8}>{z.full}</span>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:4}}>
            <div style={{width:10,height:2,background:P.amber,borderRadius:1}}/>
            <span style={S.mut8}>Strain</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={zStackData} margin={{top:4,right:36,left:-18,bottom:0}} barSize={range<=8?20:range<=16?12:range<=26?7:4}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={range<=16?0:range<=26?1:3} angle={range>=26?-45:0} textAnchor={range>=26?"end":"middle"} height={range>=26?36:20}/>
          <YAxis yAxisId="min" {...ax} domain={[0,"auto"]}/>
          <YAxis yAxisId="str" orientation="right" {...ax} domain={[0,120]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"10px 14px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
            <div style={{color:P.muted,marginBottom:5,fontWeight:600,fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
            {ZONE_CFG.map((z,i)=>{const p=payload.find(x=>x.dataKey===`z${i+1}`);return p&&p.value>0?<div key={i} style={{display:"flex",gap:12,marginBottom:2}}><span style={{color:z.color,minWidth:55}}>{z.full}</span><span style={{fontFamily:FF.m,color:P.text}}>{p.value}m</span></div>:null;})}
            {payload.find(x=>x.dataKey==="strain")&&<div style={{display:"flex",gap:12,marginTop:4,paddingTop:4,borderTop:`1px solid ${P.border}`}}><span style={{color:P.amber}}>Strain</span><span style={{fontFamily:FF.m,color:P.text}}>{payload.find(x=>x.dataKey==="strain").value}</span></div>}
          </div>):null}/>
          <Bar yAxisId="min" dataKey="z1" stackId="a" fill={ZONE_CFG[0].color} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Bar yAxisId="min" dataKey="z2" stackId="a" fill={ZONE_CFG[1].color} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Bar yAxisId="min" dataKey="z3" stackId="a" fill={ZONE_CFG[2].color} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Bar yAxisId="min" dataKey="z4" stackId="a" fill={ZONE_CFG[3].color} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Bar yAxisId="min" dataKey="z5" stackId="a" fill={ZONE_CFG[4].color} radius={[2,2,0,0]} isAnimationActive={true} animationBegin={100} animationDuration={800} animationEasing="ease-out"/>
          <Line yAxisId="str" type="monotone" dataKey="strain" stroke={P.amber} strokeWidth={2} dot={{r:3,fill:P.amber,stroke:P.card,strokeWidth:1}} name="Strain"/>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <SLabel color={P.steel}>Fitness Load · ATL / CTL / TSB</SLabel>
          <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,marginTop:-8}}>
            <span style={{color:P.terra,fontWeight:500}}>ATL</span> = 4-wk fatigue · <span style={{color:P.steel,fontWeight:500}}>CTL</span> = 12-wk fitness base · <span style={{color:P.sage,fontWeight:500}}>TSB</span> = Form
          </div>
        </div>
        <div style={{display:"flex",gap:12}}>
          {[{c:P.terra,l:"ATL"},{c:P.steel,l:"CTL"},{c:P.sage,l:"TSB"}].map(({c,l})=>(
            <div key={l} style={S.row4}>
              <div style={{width:10,height:2,background:c,borderRadius:1}}/><span style={S.mut9}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={145}>
        <LineChart data={ldSlice} margin={{top:4,right:8,left:-20,bottom:0}}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={range<=16?0:range<=26?1:3} angle={range>=26?-45:0} textAnchor={range>=26?"end":"middle"} height={range>=26?36:20}/>
          <YAxis {...ax} domain={[-12,"auto"]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:4,fontWeight:600,fontSize:9,textTransform:"uppercase"}}>{label}</div>{payload.map(p=><div key={p.name} style={{display:"flex",gap:12,marginBottom:2}}><span style={{color:p.color,minWidth:40}}>{p.name}</span><span style={{fontFamily:FF.m,color:P.text}}>{p.value}</span></div>)}</div>):null}/>
          <ReferenceLine y={0} stroke={P.border} strokeDasharray="3 3"/>
          <Line type="monotone" dataKey="atl" stroke={P.terra}  strokeWidth={1.5} dot={false} name="ATL"/>
          <Line type="monotone" dataKey="ctl" stroke={P.steel}  strokeWidth={2}   dot={false} name="CTL"/>
          <Line type="monotone" dataKey="tsb" stroke={P.sage}   strokeWidth={1.5}
            dot={(p)=><circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill={p.value>=0?P.sage:P.terra} stroke={P.card} strokeWidth={1}/>}
            name="TSB"/>
        </LineChart>
      </ResponsiveContainer>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:12}}>
        {[
          {label:"ATL (Fatigue)", val:ldSlice[ldSlice.length-1]?.atl, color:P.terra, note:"4-wk acute load"},
          {label:"CTL (Fitness)", val:ldSlice[ldSlice.length-1]?.ctl, color:P.steel, note:"12-wk fitness base"},
          {label:"TSB (Form)",    val:ldSlice[ldSlice.length-1]?.tsb, color:(ldSlice[ldSlice.length-1]?.tsb||0)>=0?P.sage:P.terra, note:(ldSlice[ldSlice.length-1]?.tsb||0)>=0?"Fresh & ready":"Fatigue accumulated"},
        ].map(({label,val,color,note})=>(
          <div key={label} style={{padding:"10px 12px",background:P.panel,borderRadius:8,border:`1px solid ${P.border}`}}>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:3}}>{label}</div>
            <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
            <div style={S.mut9t2}>{note}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={CS()}>
      <SLabel color={P.sage} right="weekly averages">Recovery & HRV Trend</SLabel>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={physSlice} margin={{top:4,right:30,left:-20,bottom:0}}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={range<=16?0:range<=26?1:3} angle={range>=26?-45:0} textAnchor={range>=26?"end":"middle"} height={range>=26?36:20}/>
          <YAxis yAxisId="rec" {...ax} domain={[0,100]}/>
          <YAxis yAxisId="hrv" orientation="right" {...ax} domain={[20,80]}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",fontFamily:FF.s,fontSize:11,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:P.muted,marginBottom:4,fontWeight:600,fontSize:9,textTransform:"uppercase"}}>{label}</div>{payload.map(p=><div key={p.name} style={{display:"flex",gap:12,marginBottom:2}}><span style={{color:p.color,minWidth:50}}>{p.name}</span><span style={{fontFamily:FF.m,color:P.text}}>{p.value}</span></div>)}</div>):null}/>
          <Line yAxisId="rec" type="monotone" dataKey="rec" stroke={P.sage}  strokeWidth={2} dot={(p)=><circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill={P.sage} stroke={P.card} strokeWidth={1}/>} name="Recovery %"/>
          <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke={P.steel} strokeWidth={1.5} dot={false} name="HRV ms" strokeDasharray="4 2"/>
        </LineChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:16,marginTop:8}}>
        {[{c:P.sage,l:"Recovery %",w:2},{c:P.steel,l:"HRV (ms)",w:1.5,dash:"4 2"}].map(({c,l,w,dash})=>(
          <div key={l} style={S.row5}>
            <svg width={16} height={2}><line x1={0} y1={1} x2={16} y2={1} stroke={c} strokeWidth={w} strokeDasharray={dash}/></svg>
            <span style={S.mut10}>{l}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <SLabel color={P.steel} right={`${Math.min(filteredLog.length,20)} sessions`}>Recent Workouts</SLabel>
        {activeAct&&<button onClick={()=>setActiveAct(null)} style={{fontFamily:FF.s,fontSize:10,padding:"3px 10px",borderRadius:5,background:P.panel,border:`1px solid ${P.border}`,color:P.sub,cursor:"pointer"}}>Clear ×</button>}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>
          {["Date","Activity","Duration","Strain","Avg HR","Cal","Zone Split"].map(h=>(
            <th key={h} style={{fontFamily:FF.s,fontSize:8,fontWeight:600,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase",textAlign:"left",padding:"0 10px 9px 0",borderBottom:`1px solid ${P.border}`}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {filteredLog.slice(0,20).map((w,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${P.border}`}}
              onMouseEnter={e=>e.currentTarget.style.background=P.panel}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{fontFamily:FF.m,fontSize:10,color:P.muted,padding:"7px 10px 7px 0",whiteSpace:"nowrap"}}>{w.dateStr}</td>
              <td style={{padding:"7px 10px 7px 0"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"2px 8px",borderRadius:5,background:w.color+"14",border:`1px solid ${w.color}28`}}>
                  <span style={{fontSize:10}}>{w.icon}</span>
                  <span style={{fontFamily:FF.s,fontSize:10,fontWeight:500,color:w.color}}>{w.activity}</span>
                </div>
              </td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.text,padding:"7px 10px 7px 0"}}>{w.dur}m</td>
              <td style={{padding:"7px 10px 7px 0"}}><span style={{fontFamily:FF.r,fontSize:13,fontWeight:600,color:w.strain>=15?P.terra:w.strain>=10?P.amber:P.sage}}>{w.strain}</span></td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.text,padding:"7px 10px 7px 0"}}>{w.avgHR} bpm</td>
              <td style={{fontFamily:FF.m,fontSize:11,color:P.muted,padding:"7px 10px 7px 0"}}>{w.cal}</td>
              <td style={{padding:"7px 0",minWidth:90}}>
                <div style={{display:"flex",height:8,borderRadius:3,overflow:"hidden",gap:0.5}}>
                  {[w.z1,w.z2,w.z3,w.z4,w.z5].map((z,zi)=>z>0?<div key={zi} style={{flex:z,height:"100%",background:ZONE_CFG[zi].color,minWidth:2}}/>:null)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>);
}

function CustomRect({x,y,width,height,fill}){return <rect x={x} y={y} width={Math.max(0,width)} height={Math.max(0,height)} fill={fill} rx={1}/>;}

/* --- CALENDAR DATA ---------------------------------------------
 * Day-level data: workouts, recovery, alcohol flags, weight checks.
 * Source: WHOOP workouts.csv + physiological_cycles.csv + journal_entries.csv
 * Window: Dec 2025 – Mar 2026 (most recent 16 weeks)
 */
const CAL_DATA={
  "2025-12-01":{slp:100,sdur:8.9,rec:95,hrv:55,rhr:44},
  "2025-12-02":{slp:100,sdur:9.4,rec:95,hrv:55,rhr:44},
  "2025-12-03":{slp:98,sdur:8.9,rec:68,hrv:41,rhr:50},
  "2025-12-04":{slp:100,sdur:9.3,rec:61,hrv:38,rhr:51},
  "2025-12-05":{slp:98,sdur:8.2,rec:45,hrv:32,rhr:52,alc:1},
  "2025-12-06":{slp:74,sdur:8.4,rec:21,hrv:20,rhr:63,alc:1},
  "2025-12-07":{slp:90,sdur:10.4,rec:75,hrv:42,rhr:50,alc:1},
  "2025-12-08":{slp:97,sdur:8.8,rec:75,hrv:42,rhr:50},
  "2025-12-09":{slp:100,sdur:8.9,rec:80,hrv:45,rhr:49},
  "2025-12-10":{slp:100,sdur:9.1,rec:88,hrv:49,rhr:50},
  "2025-12-11":{slp:100,sdur:8.9,rec:65,hrv:40,rhr:50},
  "2025-12-12":{slp:92,sdur:7.8,rec:51,hrv:35,rhr:51,alc:1},
  "2025-12-13":{slp:92,sdur:8.5,rec:52,hrv:36,rhr:53,alc:1},
  "2025-12-14":{slp:98,sdur:8.9,rec:52,hrv:36,rhr:53,alc:1},
  "2025-12-15":{slp:99,sdur:7.8,rec:71,hrv:41,rhr:50},
  "2025-12-16":{slp:91,sdur:9.2,rec:99,hrv:60,rhr:45},
  "2025-12-17":{slp:97,sdur:9.1,rec:85,hrv:49,rhr:48},
  "2025-12-18":{slp:99,sdur:8.9,rec:75,hrv:46,rhr:48},
  "2025-12-19":{slp:94,sdur:7.8,rec:66,hrv:43,rhr:48,alc:1},
  "2025-12-20":{slp:92,sdur:9.3,rec:66,hrv:43,rhr:48,alc:1},
  "2025-12-21":{slp:94,sdur:10.1,rec:77,hrv:52,rhr:53,alc:1},
  "2025-12-22":{slp:88,sdur:8.0,rec:54,hrv:40,rhr:52,alc:1},
  "2025-12-23":{slp:87,sdur:10.3,rec:92,hrv:63,rhr:51,alc:1},
  "2025-12-24":{slp:92,sdur:9.5,rec:62,hrv:44,rhr:52,alc:1},
  "2025-12-25":{slp:82,sdur:8.5,rec:57,hrv:44,rhr:52,alc:1},
  "2025-12-26":{slp:80,sdur:8.9,rec:57,hrv:42,rhr:51,alc:1},
  "2025-12-27":{slp:78,sdur:9.4,rec:82,hrv:50,rhr:51,alc:1},
  "2025-12-28":{slp:83,sdur:8.7,rec:61,hrv:42,rhr:52,alc:1},
  "2025-12-29":{slp:87,sdur:9.4,rec:60,hrv:42,rhr:52,alc:1},
  "2025-12-30":{slp:91,sdur:10.3,rec:60,hrv:40,rhr:50,alc:1},
  "2025-12-31":{slp:80,sdur:9.1,rec:92,hrv:56,rhr:50,alc:1},
  "2026-01-01":{slp:76,sdur:6.7,rec:87,hrv:53,rhr:53,alc:1},
  "2026-01-02":{slp:81,sdur:11.8,rec:50,hrv:40,rhr:52,alc:1},
  "2026-01-03":{slp:81,sdur:9.8,rec:50,hrv:40,rhr:52,alc:1},
  "2026-01-04":{slp:85,sdur:9.5,rec:72,hrv:47,rhr:47},
  "2026-01-05":{slp:76,sdur:8.3,rec:46,hrv:39,rhr:51},
  "2026-01-06":{slp:97,sdur:9.8,rec:55,hrv:40,rhr:49},
  "2026-01-07":{slp:100,sdur:10.1,rec:88,hrv:53,rhr:46},
  "2026-01-08":{slp:98,sdur:10.4,rec:71,hrv:44,rhr:48},
  "2026-01-09":{slp:87,sdur:8.4,rec:79,hrv:48,rhr:47},
  "2026-01-10":{slp:93,sdur:9.6,rec:79,hrv:48,rhr:47},
  "2026-01-11":{slp:99,sdur:9.4,rec:73,hrv:47,rhr:48},
  "2026-01-12":{slp:100,sdur:9.6,rec:63,hrv:45,rhr:49},
  "2026-01-13":{slp:100,sdur:8.6,rec:45,hrv:39,rhr:51},
  "2026-01-14":{slp:100,sdur:9.6,rec:64,hrv:44,rhr:49},
  "2026-01-15":{slp:100,sdur:9.5,rec:44,hrv:37,rhr:52},
  "2026-01-16":{slp:95,sdur:8.2,rec:33,hrv:30,rhr:54},
  "2026-01-17":{slp:95,sdur:9.5,rec:39,hrv:32,rhr:53},
  "2026-01-18":{slp:96,sdur:10.0,rec:58,hrv:37,rhr:52},
  "2026-01-19":{slp:100,sdur:9.3,rec:73,hrv:41,rhr:50},
  "2026-01-20":{slp:93,sdur:8.3,rec:73,hrv:41,rhr:50},
  "2026-01-21":{slp:97,sdur:8.9,rec:77,hrv:43,rhr:48},
  "2026-01-22":{slp:99,sdur:9.9,rec:47,hrv:34,rhr:53},
  "2026-01-23":{slp:95,sdur:7.9,rec:80,hrv:44,rhr:49},
  "2026-01-24":{slp:85,sdur:10.0,rec:40,hrv:33,rhr:53,wt:216},
  "2026-01-25":{slp:90,sdur:9.3,rec:65,hrv:41,rhr:51},
  "2026-01-26":{slp:95,sdur:9.2,rec:95,hrv:51,rhr:48},
  "2026-01-27":{slp:97,sdur:8.8,rec:95,hrv:51,rhr:48},
  "2026-01-28":{slp:96,sdur:9.2,rec:42,hrv:34,rhr:52},
  "2026-01-29":{slp:100,sdur:8.6,rec:60,hrv:39,rhr:50},
  "2026-01-30":{slp:94,sdur:7.9,rec:46,hrv:34,rhr:52},
  "2026-01-31":{slp:97,sdur:8.7,rec:34,hrv:29,rhr:56},
  "2026-02-01":{slp:100,sdur:8.7,rec:66,hrv:36,rhr:52},
  "2026-02-02":{slp:95,sdur:9.5,rec:83,hrv:43,rhr:50},
  "2026-02-03":{slp:86,sdur:10.1,rec:98,hrv:53,rhr:47},
  "2026-02-04":{slp:96,sdur:8.9,rec:79,hrv:44,rhr:50},
  "2026-02-05":{slp:97,sdur:8.6,rec:89,hrv:49,rhr:48},
  "2026-02-06":{slp:95,sdur:8.1,rec:68,hrv:43,rhr:49},
  "2026-02-07":{slp:92,sdur:10.0,rec:36,hrv:31,rhr:55},
  "2026-02-08":{slp:82,sdur:9.5,rec:69,hrv:43,rhr:53},
  "2026-02-09":{slp:88,sdur:9.4,rec:60,hrv:39,rhr:51},
  "2026-02-10":{slp:93,sdur:8.9,rec:86,hrv:47,rhr:49},
  "2026-02-11":{slp:96,sdur:9.5,rec:98,hrv:56,rhr:46},
  "2026-02-12":{slp:95,sdur:8.6,rec:77,hrv:45,rhr:49},
  "2026-02-14":{slp:85,sdur:6.8,rec:40,hrv:32,rhr:53,alc:1},
  "2026-02-15":{slp:81,sdur:10.0,rec:46,hrv:35,rhr:51},
  "2026-02-16":{slp:76,sdur:6.8,rec:60,hrv:37,rhr:51},
  "2026-02-17":{slp:83,sdur:8.4,rec:60,hrv:37,rhr:51},
  "2026-02-18":{slp:86,sdur:8.7,rec:76,hrv:42,rhr:50},
  "2026-02-19":{slp:89,sdur:9.3,rec:78,hrv:43,rhr:49},
  "2026-02-20":{slp:98,sdur:8.7,rec:65,hrv:39,rhr:51,alc:1},
  "2026-02-21":{slp:100,sdur:9.4,rec:52,hrv:36,rhr:53,alc:1},
  "2026-02-22":{slp:97,sdur:8.5,rec:65,hrv:39,rhr:50},
  "2026-02-23":{slp:99,sdur:9.8,rec:65,hrv:39,rhr:50},
  "2026-02-24":{slp:100,sdur:8.8,rec:75,hrv:42,rhr:50},
  "2026-02-25":{slp:100,sdur:8.6,rec:89,hrv:48,rhr:50},
  "2026-02-26":{slp:93,sdur:8.4,rec:62,hrv:40,rhr:51},
  "2026-02-27":{slp:93,sdur:7.8,rec:75,hrv:42,rhr:50},
  "2026-02-28":{slp:98,sdur:8.9,rec:77,hrv:45,rhr:52,alc:1},
  "2026-03-01":{slp:100,sdur:9.0,rec:89,hrv:110,rhr:53},
  "2026-03-02":{slp:100,sdur:9.3,rec:98,hrv:51,rhr:49},
  "2026-03-03":{slp:100,sdur:8.6,rec:95,hrv:50,rhr:48},
  "2026-03-04":{slp:97,sdur:8.0,rec:93,hrv:50,rhr:48},
  "2026-03-05":{slp:92,sdur:8.1,rec:98,hrv:60,rhr:49},
  "2026-03-06":{slp:94,sdur:7.8,rec:98,hrv:58,rhr:51,alc:1},
  "2026-03-07":{slp:80,sdur:8.5,rec:54,hrv:40,rhr:60,alc:1},
  "2026-03-08":{slp:93,sdur:9.4,rec:49,hrv:41,rhr:51},
  "2026-03-09":{slp:99,sdur:8.4,rec:49,hrv:41,rhr:51},
  "2026-03-10":{slp:100,sdur:9.2,rec:60,hrv:45,rhr:50},
  "2026-03-11":{slp:100,sdur:8.9,rec:62,hrv:45,rhr:50},
  "2026-03-12":{slp:99,sdur:9.5,rec:62,hrv:42,rhr:50},
  "2026-03-13":{slp:92,sdur:8.0,rec:60,hrv:41,rhr:51,alc:1},
  "2026-03-14":{slp:87,sdur:9.6,rec:57,hrv:40,rhr:51,alc:1},
  "2026-03-15":{slp:95,sdur:8.9,rec:44,hrv:38,rhr:52,alc:1},
  "2026-03-16":{slp:97,sdur:9.0,rec:69,hrv:44,rhr:52},
  "2026-03-17":{slp:96,sdur:9.5,rec:86,hrv:50,rhr:49},
  "2026-03-18":{slp:94,sdur:8.8,rec:67,hrv:44,rhr:50},
  "2026-03-19":{slp:96,sdur:9.2,rec:62,hrv:43,rhr:50},
  "2026-03-20":{slp:96,sdur:9.1,rec:69,hrv:45,rhr:50},
  "2026-03-21":{slp:97,sdur:9.2,rec:69,hrv:43,rhr:49},
  "2026-03-22":{slp:95,sdur:8.53,rec:37,hrv:37,rhr:53},
  "2026-03-23":{slp:100,sdur:8.70,rec:87,hrv:52,rhr:49},
    "2026-03-24":{slp:95,sdur:8.5,rec:0,hrv:0,rhr:0},
    "2026-03-25":{slp:96,sdur:8.8,rec:54,hrv:39.4,rhr:52},
    "2026-03-26":{slp:100,sdur:9.03,rec:54,hrv:39.2,rhr:54},
};

const CAL_RICH={
  "2025-12-01":[{cat:"walking",name:"Walking",strain:4.3,dur:14,cal:42,avgHR:96,maxHR:114,start:"1:07 PM",z1p:29,z2p:0,z3p:0,z4p:0,z5p:0,z1m:4,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2025-12-02":[{cat:"fitness",name:"Functional Fitness",strain:9.6,dur:65,cal:447,avgHR:116,maxHR:180,start:"9:58 AM",z1p:61,z2p:15,z3p:6,z4p:1,z5p:0,z1m:40,z2m:10,z3m:4,z4m:1,z5m:0}],
  "2025-12-04":[{cat:"fitness",name:"Functional Fitness",strain:11.5,dur:53,cal:460,avgHR:124,maxHR:194,start:"10:10 AM",z1p:67,z2p:5,z3p:15,z4p:3,z5p:4,z1m:36,z2m:3,z3m:8,z4m:2,z5m:2}],
  "2025-12-06":[{cat:"fitness",name:"Functional Fitness",strain:13.6,dur:72,cal:810,avgHR:136,maxHR:177,start:"7:25 AM",z1p:20,z2p:49,z3p:27,z4p:4,z5p:0,z1m:14,z2m:35,z3m:19,z4m:3,z5m:0}],
  "2025-12-08":[{cat:"running",name:"Running",strain:12.2,dur:29,cal:419,avgHR:150,maxHR:193,start:"1:48 PM",z1p:2,z2p:45,z3p:26,z4p:20,z5p:7,z1m:1,z2m:13,z3m:8,z4m:6,z5m:2}],
  "2025-12-09":[{cat:"fitness",name:"Functional Fitness",strain:10.0,dur:64,cal:458,avgHR:118,maxHR:179,start:"10:00 AM",z1p:58,z2p:12,z3p:9,z4p:2,z5p:0,z1m:37,z2m:8,z3m:6,z4m:1,z5m:0}],
  "2025-12-10":[{cat:"running",name:"Running",strain:11.9,dur:35,cal:458,avgHR:144,maxHR:165,start:"11:22 AM",z1p:5,z2p:48,z3p:45,z4p:1,z5p:0,z1m:2,z2m:17,z3m:16,z4m:0,z5m:0}],
  "2025-12-11":[{cat:"fitness",name:"Functional Fitness",strain:9.8,dur:67,cal:439,avgHR:114,maxHR:172,start:"9:58 AM",z1p:64,z2p:2,z3p:9,z4p:1,z5p:0,z1m:43,z2m:1,z3m:6,z4m:1,z5m:0}],
  "2025-12-13":[{cat:"fitness",name:"Functional Fitness",strain:7.8,dur:22,cal:191,avgHR:124,maxHR:185,start:"8:06 AM",z1p:54,z2p:12,z3p:6,z4p:13,z5p:3,z1m:12,z2m:3,z3m:1,z4m:3,z5m:1}],
  "2025-12-14":[{cat:"running",name:"Running",strain:12.3,dur:63,cal:662,avgHR:133,maxHR:157,start:"9:25 AM",z1p:40,z2p:50,z3p:7,z4p:0,z5p:0,z1m:25,z2m:32,z3m:4,z4m:0,z5m:0}],
  "2025-12-16":[{cat:"fitness",name:"Functional Fitness",strain:12.5,dur:50,cal:335,avgHR:115,maxHR:176,start:"10:12 AM",z1p:52,z2p:13,z3p:7,z4p:2,z5p:0,z1m:26,z2m:6,z3m:4,z4m:1,z5m:0}],
  "2025-12-17":[{cat:"running",name:"Running",strain:8.7,dur:43,cal:340,avgHR:121,maxHR:172,start:"4:28 PM",z1p:63,z2p:9,z3p:12,z4p:1,z5p:0,z1m:27,z2m:4,z3m:5,z4m:0,z5m:0}],
  "2025-12-18":[{cat:"fitness",name:"Functional Fitness",strain:7.5,dur:49,cal:323,avgHR:115,maxHR:143,start:"10:09 AM",z1p:86,z2p:5,z3p:0,z4p:0,z5p:0,z1m:42,z2m:2,z3m:0,z4m:0,z5m:0}],
  "2025-12-20":[{cat:"fitness",name:"Functional Fitness",strain:12.7,dur:59,cal:632,avgHR:133,maxHR:186,start:"7:25 AM",z1p:36,z2p:28,z3p:29,z4p:5,z5p:0,z1m:21,z2m:17,z3m:17,z4m:3,z5m:0}],
  "2025-12-21":[{cat:"running",name:"Running",strain:4.5,dur:16,cal:51,avgHR:96,maxHR:131,start:"1:34 PM",z1p:30,z2p:0,z3p:0,z4p:0,z5p:0,z1m:5,z2m:0,z3m:0,z4m:0,z5m:0},{cat:"running",name:"Running",strain:12.1,dur:51,cal:550,avgHR:134,maxHR:171,start:"10:25 AM",z1p:23,z2p:50,z3p:14,z4p:5,z5p:0,z1m:12,z2m:26,z3m:7,z4m:3,z5m:0}],
  "2025-12-22":[{cat:"running",name:"Running",strain:8.5,dur:33,cal:310,avgHR:127,maxHR:161,start:"4:55 PM",z1p:56,z2p:33,z3p:6,z4p:0,z5p:0,z1m:18,z2m:11,z3m:2,z4m:0,z5m:0}],
  "2025-12-23":[{cat:"fitness",name:"Functional Fitness",strain:9.6,dur:58,cal:403,avgHR:116,maxHR:192,start:"10:04 AM",z1p:61,z2p:8,z3p:8,z4p:3,z5p:1,z1m:35,z2m:5,z3m:5,z4m:2,z5m:1}],
  "2025-12-26":[{cat:"running",name:"Running",strain:11.6,dur:27,cal:389,avgHR:150,maxHR:170,start:"1:42 PM",z1p:0,z2p:24,z3p:65,z4p:11,z5p:0,z1m:0,z2m:6,z3m:18,z4m:3,z5m:0}],
  "2025-12-27":[{cat:"fitness",name:"Functional Fitness",strain:10.5,dur:55,cal:422,avgHR:120,maxHR:182,start:"9:00 AM",z1p:47,z2p:9,z3p:20,z4p:4,z5p:0,z1m:26,z2m:5,z3m:11,z4m:2,z5m:0}],
  "2025-12-30":[{cat:"fitness",name:"Functional Fitness",strain:8.0,dur:66,cal:389,avgHR:112,maxHR:135,start:"8:58 AM",z1p:85,z2p:0,z3p:0,z4p:0,z5p:0,z1m:56,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2025-12-31":[{cat:"walking",name:"Walking",strain:5.8,dur:35,cal:178,avgHR:109,maxHR:118,start:"10:15 AM",z1p:84,z2p:0,z3p:0,z4p:0,z5p:0,z1m:29,z2m:0,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:4.8,dur:23,cal:81,avgHR:100,maxHR:122,start:"9:30 AM",z1p:56,z2p:0,z3p:0,z4p:0,z5p:0,z1m:13,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-01-01":[{cat:"running",name:"Running",strain:9.1,dur:28,cal:316,avgHR:137,maxHR:163,start:"3:21 PM",z1p:13,z2p:71,z3p:15,z4p:0,z5p:0,z1m:4,z2m:20,z3m:4,z4m:0,z5m:0}],
  "2026-01-03":[{cat:"other",name:"Stairmaster",strain:6.0,dur:25,cal:182,avgHR:118,maxHR:142,start:"2:49 PM",z1p:100,z2p:0,z3p:0,z4p:0,z5p:0,z1m:25,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-01-04":[{cat:"walking",name:"Walking",strain:6.4,dur:41,cal:226,avgHR:110,maxHR:130,start:"3:07 PM",z1p:78,z2p:0,z3p:0,z4p:0,z5p:0,z1m:32,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-01-05":[{cat:"walking",name:"Walking",strain:6.3,dur:46,cal:217,avgHR:104,maxHR:135,start:"1:28 PM",z1p:54,z2p:0,z3p:0,z4p:0,z5p:0,z1m:25,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-01-08":[{cat:"fitness",name:"Functional Fitness",strain:13.6,dur:51,cal:397,avgHR:121,maxHR:173,start:"10:10 AM",z1p:68,z2p:16,z3p:4,z4p:4,z5p:0,z1m:35,z2m:8,z3m:2,z4m:2,z5m:0}],
  "2026-01-10":[{cat:"fitness",name:"Functional Fitness",strain:12.8,dur:66,cal:668,avgHR:131,maxHR:191,start:"10:09 AM",z1p:39,z2p:28,z3p:19,z4p:9,z5p:2,z1m:26,z2m:18,z3m:13,z4m:6,z5m:1}],
  "2026-01-13":[{cat:"running",name:"Running",strain:4.3,dur:17,cal:42,avgHR:88,maxHR:146,start:"4:21 PM",z1p:9,z2p:5,z3p:0,z4p:0,z5p:0,z1m:2,z2m:1,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:13.5,dur:56,cal:401,avgHR:117,maxHR:191,start:"10:06 AM",z1p:46,z2p:11,z3p:10,z4p:3,z5p:2,z1m:26,z2m:6,z3m:6,z4m:2,z5m:1}],
  "2026-01-15":[{cat:"fitness",name:"Functional Fitness",strain:13.5,dur:57,cal:341,avgHR:111,maxHR:166,start:"10:04 AM",z1p:59,z2p:4,z3p:8,z4p:0,z5p:0,z1m:34,z2m:2,z3m:5,z4m:0,z5m:0}],
  "2026-01-16":[{cat:"running",name:"Running",strain:12.0,dur:33,cal:443,avgHR:146,maxHR:169,start:"11:06 AM",z1p:2,z2p:27,z3p:65,z4p:4,z5p:0,z1m:1,z2m:9,z3m:21,z4m:1,z5m:0}],
  "2026-01-17":[{cat:"walking",name:"Walking",strain:6.5,dur:40,cal:221,avgHR:106,maxHR:145,start:"12:12 PM",z1p:58,z2p:9,z3p:0,z4p:0,z5p:0,z1m:23,z2m:4,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:10.8,dur:76,cal:536,avgHR:116,maxHR:170,start:"7:27 AM",z1p:60,z2p:12,z3p:7,z4p:3,z5p:0,z1m:46,z2m:9,z3m:5,z4m:2,z5m:0}],
  "2026-01-20":[{cat:"running",name:"Running",strain:9.2,dur:59,cal:350,avgHR:111,maxHR:177,start:"9:55 AM",z1p:56,z2p:2,z3p:7,z4p:5,z5p:0,z1m:33,z2m:1,z3m:4,z4m:3,z5m:0}],
  "2026-01-22":[{cat:"running",name:"Running",strain:11.1,dur:67,cal:477,avgHR:117,maxHR:178,start:"2:06 PM",z1p:56,z2p:6,z3p:6,z4p:7,z5p:1,z1m:38,z2m:4,z3m:4,z4m:5,z5m:1}],
  "2026-01-24":[{cat:"fitness",name:"Functional Fitness",strain:18.1,dur:68,cal:950,avgHR:145,maxHR:188,start:"7:19 AM",z1p:8,z2p:31,z3p:37,z4p:21,z5p:2,z1m:5,z2m:21,z3m:25,z4m:14,z5m:1}],
  "2026-01-27":[{cat:"running",name:"Running",strain:8.6,dur:70,cal:365,avgHR:108,maxHR:177,start:"10:00 AM",z1p:50,z2p:8,z3p:5,z4p:1,z5p:0,z1m:35,z2m:6,z3m:4,z4m:1,z5m:0}],
  "2026-01-28":[{cat:"running",name:"Running",strain:13.5,dur:56,cal:707,avgHR:143,maxHR:164,start:"11:28 AM",z1p:4,z2p:42,z3p:53,z4p:0,z5p:0,z1m:2,z2m:24,z3m:30,z4m:0,z5m:0}],
  "2026-01-29":[{cat:"running",name:"Running",strain:7.5,dur:66,cal:304,avgHR:105,maxHR:179,start:"10:01 AM",z1p:39,z2p:6,z3p:3,z4p:1,z5p:0,z1m:26,z2m:4,z3m:2,z4m:1,z5m:0}],
  "2026-01-30":[{cat:"running",name:"Running",strain:10.0,dur:34,cal:385,avgHR:137,maxHR:151,start:"1:18 PM",z1p:23,z2p:59,z3p:18,z4p:0,z5p:0,z1m:8,z2m:20,z3m:6,z4m:0,z5m:0}],
  "2026-01-31":[{cat:"fitness",name:"Functional Fitness",strain:13.1,dur:66,cal:695,avgHR:133,maxHR:179,start:"7:16 AM",z1p:28,z2p:27,z3p:33,z4p:7,z5p:0,z1m:18,z2m:18,z3m:22,z4m:5,z5m:0}],
  "2026-02-01":[{cat:"running",name:"Running",strain:4.2,dur:13,cal:30,avgHR:95,maxHR:117,start:"12:22 PM",z1p:25,z2p:0,z3p:0,z4p:0,z5p:0,z1m:3,z2m:0,z3m:0,z4m:0,z5m:0},{cat:"running",name:"Running",strain:11.4,dur:42,cal:481,avgHR:138,maxHR:166,start:"7:52 AM",z1p:28,z2p:40,z3p:30,z4p:2,z5p:0,z1m:12,z2m:17,z3m:13,z4m:1,z5m:0}],
  "2026-02-02":[{cat:"walking",name:"Walking",strain:6.1,dur:37,cal:208,avgHR:111,maxHR:123,start:"2:21 PM",z1p:81,z2p:0,z3p:0,z4p:0,z5p:0,z1m:30,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-02-03":[{cat:"fitness",name:"Functional Fitness",strain:7.9,dur:67,cal:373,avgHR:110,maxHR:167,start:"10:06 AM",z1p:73,z2p:5,z3p:1,z4p:0,z5p:0,z1m:49,z2m:3,z3m:1,z4m:0,z5m:0}],
  "2026-02-04":[{cat:"running",name:"Running",strain:12.1,dur:49,cal:564,avgHR:137,maxHR:166,start:"9:46 AM",z1p:26,z2p:49,z3p:24,z4p:0,z5p:0,z1m:13,z2m:24,z3m:12,z4m:0,z5m:0}],
  "2026-02-05":[{cat:"other",name:"Activity",strain:10.2,dur:73,cal:492,avgHR:115,maxHR:179,start:"9:54 AM",z1p:57,z2p:13,z3p:5,z4p:3,z5p:0,z1m:42,z2m:9,z3m:4,z4m:2,z5m:0}],
  "2026-02-06":[{cat:"fitness",name:"Functional Fitness",strain:10.0,dur:32,cal:369,avgHR:137,maxHR:158,start:"1:24 PM",z1p:25,z2p:49,z3p:24,z4p:0,z5p:0,z1m:8,z2m:16,z3m:8,z4m:0,z5m:0}],
  "2026-02-07":[{cat:"walking",name:"Walking",strain:7.6,dur:146,cal:384,avgHR:95,maxHR:128,start:"10:38 AM",z1p:15,z2p:0,z3p:0,z4p:0,z5p:0,z1m:22,z2m:0,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:13.1,dur:72,cal:727,avgHR:131,maxHR:188,start:"7:24 AM",z1p:38,z2p:29,z3p:21,z4p:4,z5p:1,z1m:27,z2m:21,z3m:15,z4m:3,z5m:1}],
  "2026-02-08":[{cat:"running",name:"Running",strain:11.0,dur:41,cal:456,avgHR:135,maxHR:174,start:"8:04 AM",z1p:51,z2p:25,z3p:20,z4p:4,z5p:0,z1m:21,z2m:10,z3m:8,z4m:2,z5m:0}],
  "2026-02-09":[{cat:"running",name:"Running",strain:13.6,dur:61,cal:747,avgHR:141,maxHR:174,start:"1:54 PM",z1p:21,z2p:51,z3p:23,z4p:5,z5p:0,z1m:13,z2m:31,z3m:14,z4m:3,z5m:0}],
  "2026-02-10":[{cat:"fitness",name:"Functional Fitness",strain:12.3,dur:71,cal:369,avgHR:108,maxHR:178,start:"10:06 AM",z1p:40,z2p:6,z3p:4,z4p:3,z5p:0,z1m:28,z2m:4,z3m:3,z4m:2,z5m:0}],
  "2026-02-11":[{cat:"running",name:"Running",strain:14.0,dur:54,cal:670,avgHR:141,maxHR:187,start:"11:45 AM",z1p:21,z2p:36,z3p:16,z4p:20,z5p:5,z1m:11,z2m:19,z3m:9,z4m:11,z5m:3}],
  "2026-02-12":[{cat:"fitness",name:"Functional Fitness",strain:13.5,dur:73,cal:495,avgHR:116,maxHR:168,start:"10:03 AM",z1p:65,z2p:14,z3p:5,z4p:0,z5p:0,z1m:47,z2m:10,z3m:4,z4m:0,z5m:0}],
  "2026-02-14":[{cat:"walking",name:"Walking",strain:5.3,dur:28,cal:134,avgHR:106,maxHR:137,start:"3:18 PM",z1p:71,z2p:0,z3p:0,z4p:0,z5p:0,z1m:20,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-02-17":[{cat:"fitness",name:"Functional Fitness",strain:12.9,dur:74,cal:358,avgHR:107,maxHR:164,start:"10:00 AM",z1p:48,z2p:9,z3p:2,z4p:0,z5p:0,z1m:36,z2m:7,z3m:1,z4m:0,z5m:0}],
  "2026-02-18":[{cat:"running",name:"Running",strain:13.0,dur:59,cal:667,avgHR:136,maxHR:167,start:"11:30 AM",z1p:32,z2p:23,z3p:44,z4p:1,z5p:0,z1m:19,z2m:14,z3m:26,z4m:1,z5m:0}],
  "2026-02-19":[{cat:"fitness",name:"Functional Fitness",strain:13.3,dur:62,cal:364,avgHR:112,maxHR:178,start:"2:00 PM",z1p:61,z2p:3,z3p:4,z4p:4,z5p:0,z1m:38,z2m:2,z3m:2,z4m:2,z5m:0}],
  "2026-02-20":[{cat:"running",name:"Running",strain:10.2,dur:40,cal:430,avgHR:134,maxHR:158,start:"1:43 PM",z1p:20,z2p:75,z3p:4,z4p:0,z5p:0,z1m:8,z2m:30,z3m:2,z4m:0,z5m:0}],
  "2026-02-22":[{cat:"other",name:"Basketball",strain:4.8,dur:20,cal:80,avgHR:102,maxHR:139,start:"4:57 PM",z1p:46,z2p:3,z3p:0,z4p:0,z5p:0,z1m:9,z2m:1,z3m:0,z4m:0,z5m:0},{cat:"running",name:"Running",strain:12.7,dur:60,cal:674,avgHR:137,maxHR:160,start:"9:53 AM",z1p:11,z2p:78,z3p:10,z4p:0,z5p:0,z1m:7,z2m:47,z3m:6,z4m:0,z5m:0}],
  "2026-02-23":[{cat:"running",name:"Running",strain:14.9,dur:48,cal:604,avgHR:140,maxHR:183,start:"1:59 PM",z1p:7,z2p:8,z3p:19,z4p:30,z5p:24,z1m:3,z2m:4,z3m:9,z4m:14,z5m:12}],
  "2026-02-24":[{cat:"fitness",name:"Functional Fitness",strain:13.3,dur:66,cal:367,avgHR:109,maxHR:172,start:"10:00 AM",z1p:30,z2p:9,z3p:4,z4p:3,z5p:0,z1m:20,z2m:6,z3m:3,z4m:2,z5m:0}],
  "2026-02-25":[{cat:"running",name:"Running",strain:12.0,dur:66,cal:619,avgHR:127,maxHR:164,start:"11:35 AM",z1p:14,z2p:62,z3p:11,z4p:9,z5p:0,z1m:9,z2m:41,z3m:7,z4m:6,z5m:0}],
  "2026-02-26":[{cat:"fitness",name:"Functional Fitness",strain:14.3,dur:85,cal:543,avgHR:112,maxHR:173,start:"9:58 AM",z1p:19,z2p:13,z3p:8,z4p:5,z5p:3,z1m:16,z2m:11,z3m:7,z4m:4,z5m:3}],
  "2026-02-27":[{cat:"running",name:"Running",strain:11.0,dur:60,cal:532,avgHR:123,maxHR:163,start:"10:43 AM",z1p:8,z2p:62,z3p:13,z4p:6,z5p:0,z1m:5,z2m:37,z3m:8,z4m:4,z5m:0}],
  "2026-02-28":[{cat:"fitness",name:"Functional Fitness",strain:15.3,dur:86,cal:819,avgHR:127,maxHR:165,start:"7:18 AM",z1p:16,z2p:44,z3p:24,z4p:10,z5p:0,z1m:14,z2m:38,z3m:21,z4m:9,z5m:0}],
  "2026-03-01":[{cat:"running",name:"Running",strain:11.5,dur:61,cal:561,avgHR:126,maxHR:160,start:"7:41 AM",z1p:11,z2p:46,z3p:29,z4p:5,z5p:0,z1m:7,z2m:28,z3m:18,z4m:3,z5m:0}],
  "2026-03-02":[{cat:"running",name:"Running",strain:11.8,dur:51,cal:522,avgHR:131,maxHR:165,start:"1:18 PM",z1p:11,z2p:23,z3p:44,z4p:16,z5p:0,z1m:6,z2m:12,z3m:22,z4m:8,z5m:0}],
  "2026-03-03":[{cat:"walking",name:"Walking",strain:5.4,dur:25,cal:127,avgHR:106,maxHR:135,start:"4:13 PM",z1p:39,z2p:9,z3p:0,z4p:0,z5p:0,z1m:10,z2m:2,z3m:0,z4m:0,z5m:0},{cat:"spin",name:"Spin",strain:7.5,dur:30,cal:266,avgHR:124,maxHR:139,start:"11:10 AM",z1p:14,z2p:86,z3p:0,z4p:0,z5p:0,z1m:4,z2m:26,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:13.2,dur:71,cal:364,avgHR:107,maxHR:170,start:"9:58 AM",z1p:23,z2p:3,z3p:3,z4p:5,z5p:1,z1m:16,z2m:2,z3m:2,z4m:4,z5m:1}],
  "2026-03-04":[{cat:"running",name:"Running",strain:12.9,dur:90,cal:808,avgHR:124,maxHR:167,start:"10:53 AM",z1p:12,z2p:62,z3p:17,z4p:2,z5p:0,z1m:11,z2m:56,z3m:15,z4m:2,z5m:0}],
  "2026-03-05":[{cat:"fitness",name:"Functional Fitness",strain:13.5,dur:62,cal:405,avgHR:113,maxHR:169,start:"10:09 AM",z1p:27,z2p:14,z3p:6,z4p:7,z5p:1,z1m:17,z2m:9,z3m:4,z4m:4,z5m:1}],
  "2026-03-06":[{cat:"spin",name:"Spin",strain:10.2,dur:59,cal:517,avgHR:123,maxHR:136,start:"2:25 PM",z1p:22,z2p:76,z3p:0,z4p:0,z5p:0,z1m:13,z2m:45,z3m:0,z4m:0,z5m:0}],
  "2026-03-07":[{cat:"fitness",name:"Functional Fitness",strain:16.5,dur:88,cal:910,avgHR:131,maxHR:176,start:"7:03 AM",z1p:5,z2p:12,z3p:39,z4p:21,z5p:6,z1m:4,z2m:11,z3m:34,z4m:18,z5m:5}],
  "2026-03-09":[{cat:"running",name:"Running",strain:13.1,dur:52,cal:585,avgHR:135,maxHR:172,start:"1:37 PM",z1p:9,z2p:10,z3p:37,z4p:29,z5p:5,z1m:5,z2m:5,z3m:19,z4m:15,z5m:3}],
  "2026-03-10":[{cat:"spin",name:"Spin",strain:7.7,dur:30,cal:276,avgHR:126,maxHR:136,start:"11:00 AM",z1p:4,z2p:96,z3p:0,z4p:0,z5p:0,z1m:1,z2m:29,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:12.4,dur:59,cal:236,avgHR:99,maxHR:158,start:"10:00 AM",z1p:9,z2p:2,z3p:8,z4p:2,z5p:0,z1m:5,z2m:1,z3m:5,z4m:1,z5m:0}],
  "2026-03-11":[{cat:"spin",name:"Spin",strain:11.7,dur:95,cal:746,avgHR:120,maxHR:160,start:"12:10 PM",z1p:55,z2p:36,z3p:3,z4p:0,z5p:0,z1m:52,z2m:34,z3m:3,z4m:0,z5m:0}],
  "2026-03-12":[{cat:"fitness",name:"Functional Fitness",strain:13.2,dur:74,cal:327,avgHR:102,maxHR:156,start:"10:00 AM",z1p:8,z2p:5,z3p:5,z4p:9,z5p:0,z1m:6,z2m:4,z3m:4,z4m:7,z5m:0}],
  "2026-03-13":[{cat:"running",name:"Running",strain:12.6,dur:47,cal:506,avgHR:132,maxHR:179,start:"1:06 PM",z1p:11,z2p:52,z3p:1,z4p:10,z5p:16,z1m:5,z2m:24,z3m:0,z4m:5,z5m:8}],
  "2026-03-14":[{cat:"fitness",name:"Functional Fitness",strain:14.0,dur:69,cal:536,avgHR:119,maxHR:166,start:"7:13 AM",z1p:33,z2p:25,z3p:12,z4p:8,z5p:0,z1m:23,z2m:17,z3m:8,z4m:6,z5m:0}],
  "2026-03-15":[{cat:"running",name:"Running",strain:10.5,dur:58,cal:519,avgHR:124,maxHR:149,start:"9:12 AM",z1p:8,z2p:79,z3p:7,z4p:0,z5p:0,z1m:5,z2m:46,z3m:4,z4m:0,z5m:0}],
  "2026-03-16":[{cat:"running",name:"Running",strain:12.4,dur:51,cal:527,avgHR:131,maxHR:170,start:"12:33 PM",z1p:10,z2p:17,z3p:37,z4p:18,z5p:5,z1m:5,z2m:9,z3m:19,z4m:9,z5m:3}],
  "2026-03-17":[{cat:"spin",name:"Spin",strain:7.9,dur:30,cal:279,avgHR:127,maxHR:136,start:"11:17 AM",z1p:2,z2p:97,z3p:0,z4p:0,z5p:0,z1m:1,z2m:29,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:13.0,dur:76,cal:357,avgHR:104,maxHR:164,start:"10:00 AM",z1p:24,z2p:5,z3p:4,z4p:5,z5p:0,z1m:18,z2m:4,z3m:3,z4m:4,z5m:0}],
  "2026-03-18":[{cat:"running",name:"Running",strain:12.5,dur:56,cal:577,avgHR:131,maxHR:169,start:"12:45 PM",z1p:18,z2p:37,z3p:24,z4p:14,z5p:3,z1m:10,z2m:21,z3m:13,z4m:8,z5m:2}],
  "2026-03-19":[{cat:"fitness",name:"Functional Fitness",strain:15.6,dur:80,cal:706,avgHR:124,maxHR:176,start:"10:06 AM",z1p:28,z2p:17,z3p:13,z4p:19,z5p:3,z1m:22,z2m:14,z3m:10,z4m:15,z5m:2}],
  "2026-03-20":[{cat:"spin",name:"Spin",strain:6.6,dur:44,cal:242,avgHR:109,maxHR:157,start:"11:13 AM",z1p:46,z2p:0,z3p:0,z4p:0,z5p:0,z1m:20,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-03-21":[{cat:"fitness",name:"Functional Fitness",strain:15.6,dur:66,cal:715,avgHR:134,maxHR:179,start:"7:18 AM",z1p:3,z2p:28,z3p:37,z4p:18,z5p:6,z1m:2,z2m:19,z3m:23,z4m:12,z5m:4}],
  "2026-03-22":[{cat:"running",name:"Running",strain:10.1,dur:56,cal:485,avgHR:123,maxHR:136,start:"8:07 AM",z0p:7,z1p:30,z2p:63,z3p:1,z4p:0,z5p:0,z0m:4,z1m:17,z2m:34,z3m:0,z4m:0,z5m:0}],
    "2026-03-23":[{cat:"running",name:"Running",strain:13.4,dur:54,cal:613,avgHR:136,maxHR:177,start:"1:18 PM",z1p:5,z2p:40,z3p:35,z4p:15,z5p:2,z1m:3,z2m:22,z3m:19,z4m:8,z5m:1}],
    "2026-03-24":[{cat:"fitness",name:"Functional Fitness",strain:12.9,dur:52,cal:349,avgHR:114,maxHR:171,start:"10:15 AM",z1p:20,z2p:35,z3p:25,z4p:12,z5p:3,z1m:10,z2m:18,z3m:13,z4m:6,z5m:2}],
    "2026-03-25":[{cat:"running",name:"Running",strain:13.3,dur:81,cal:775,avgHR:126,maxHR:165,start:"12:43 PM",z1p:10,z2p:50,z3p:28,z4p:8,z5p:2,z1m:8,z2m:41,z3m:23,z4m:6,z5m:2}],
    "2026-03-26":[{cat:"fitness",name:"Functional Fitness",strain:14.2,dur:66,cal:541,avgHR:121,maxHR:164,start:"10:12 AM",z1p:15,z2p:35,z3p:30,z4p:14,z5p:3,z1m:10,z2m:23,z3m:20,z4m:9,z5m:2}],
};

// RECENT_WORKOUTS — derived live from CAL_RICH (newest first)
// No hardcoding: adding to CAL_RICH automatically appears here

// ─── Dynamic 90-day Health Score computation ───
;(function computeDynamic90DayScores() {
  const today = new Date();
  const d90 = new Date(today);
  d90.setDate(d90.getDate() - 90);
  const fmt = d => {
    const mm = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return mm[d.getMonth()] + " " + d.getDate() + " " + d.getFullYear();
  };
  const fmtISO = d => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  const rangeLabel = fmt(d90) + " \u2013 " + fmt(today);
  const startISO = fmtISO(d90);
  const endISO = fmtISO(today);
  const dKeys = Object.keys(CAL_DATA).filter(k => k >= startISO && k <= endISO).sort();
  const hrvArr = [], rhrArr = [], recArr = [], sleepArr = [];
  dKeys.forEach(k => { const d = CAL_DATA[k]; if (d.hrv > 0) hrvArr.push(d.hrv); if (d.rhr > 0) rhrArr.push(d.rhr); if (d.rec > 0) recArr.push(d.rec); if (d.sdur > 0) sleepArr.push(d.sdur); });
  const rKeys = Object.keys(CAL_RICH).filter(k => k >= startISO && k <= endISO);
  let totalStrain = 0, gymCount = 0, sessionCount = 0;
  rKeys.forEach(k => { const arr = CAL_RICH[k]; if (Array.isArray(arr)) { arr.forEach(w => { sessionCount++; if (w.strain) totalStrain += w.strain; if (w.cat && (w.cat.toLowerCase().includes("strength") || w.cat.toLowerCase().includes("weight") || w.cat.toLowerCase().includes("functional"))) gymCount++; }); } });
  const weeksInRange = Math.max(1, dKeys.length / 7);
  const weeklyStrain = totalStrain / weeksInRange;
  const weeklyGym = gymCount / weeksInRange;
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const avgHRV = avg(hrvArr), avgRHR = avg(rhrArr), avgRec = avg(recArr), avgSleep = avg(sleepArr);
  const scoreRecovery = r => r >= 70 ? 90 : r >= 55 ? 75 : r >= 40 ? 60 : 45;
  const scoreHRV = h => h >= 60 ? 90 : h >= 45 ? 78 : h >= 35 ? 65 : 50;
  const scoreRHR = r => r <= 50 ? 90 : r <= 55 ? 80 : r <= 60 ? 70 : 55;
  const scoreSleep = h => h >= 8 ? 90 : h >= 7 ? 80 : h >= 6 ? 65 : 50;
  const scoreWeeklyStrain = s => s >= 80 ? 90 : s >= 60 ? 80 : s >= 40 ? 70 : 55;
  const scoreGymSessions = g => g >= 4 ? 90 : g >= 3 ? 80 : g >= 2 ? 65 : 50;
  const recScore = scoreRecovery(avgRec), hrvScore = scoreHRV(avgHRV), rhrScore = scoreRHR(avgRHR);
  const sleepScore = scoreSleep(avgSleep), strainScore = scoreWeeklyStrain(weeklyStrain), gymScore = scoreGymSessions(weeklyGym);
  const recoveryOverall = Math.round(recScore * 0.35 + hrvScore * 0.25 + sleepScore * 0.25 + rhrScore * 0.15);
  SCORES_NOW.recovery.score = recoveryOverall;
  SCORES_NOW.recovery.prev = SCORES_NOW.recovery.prev || 61;
  SCORES_NOW.recovery.dataDate = "WHOOP 90-day avg \xB7 " + rangeLabel;
  if (SCORES_NOW.recovery.drivers) { SCORES_NOW.recovery.drivers.forEach(dr => { if (dr.name?.includes("Recovery")) { dr.value = Math.round(avgRec) + "% avg"; dr.score = recScore; } if (dr.name?.includes("HRV")) { dr.value = avgHRV.toFixed(1) + " ms"; dr.score = hrvScore; } if (dr.name?.includes("RHR")) { dr.value = avgRHR.toFixed(1) + " bpm"; dr.score = rhrScore; } if (dr.name?.includes("Sleep")) { dr.value = avgSleep.toFixed(1) + " hrs avg"; dr.score = sleepScore; } }); }
  if (SCORES_NOW.cardiovascular?.drivers) { SCORES_NOW.cardiovascular.drivers.forEach(dr => { if (dr.name?.includes("HRV")) { dr.value = avgHRV.toFixed(1) + " ms (90d)"; dr.score = hrvScore; } if (dr.name?.includes("RHR")) { dr.value = avgRHR.toFixed(1) + " bpm (90d)"; dr.score = rhrScore; } }); let cvT = 0, cvC = 0; SCORES_NOW.cardiovascular.drivers.forEach(dr => { if (dr.score != null) { cvT += dr.score; cvC++; } }); if (cvC > 0) SCORES_NOW.cardiovascular.score = Math.round(cvT / cvC); }
  if (SCORES_NOW.strength?.drivers) { SCORES_NOW.strength.drivers.forEach(dr => { if (dr.name?.includes("Strain")) { dr.value = weeklyStrain.toFixed(1) + "/wk"; dr.score = strainScore; } if (dr.name?.includes("Gym") || dr.name?.includes("session")) { dr.value = weeklyGym.toFixed(1) + "/wk"; dr.score = gymScore; } }); let stT = 0, stC = 0; SCORES_NOW.strength.drivers.forEach(dr => { if (dr.score != null) { stT += dr.score; stC++; } }); if (stC > 0) SCORES_NOW.strength.score = Math.round(stT / stC); }
  const weights = { cardiovascular: 0.2, metabolic: 0.15, bodyComp: 0.15, strength: 0.15, hormonal: 0.1, longevity: 0.15, recovery: 0.1 };
  let total = 0, wSum = 0;
  Object.keys(weights).forEach(k => { if (SCORES_NOW[k]?.score != null) { total += SCORES_NOW[k].score * weights[k]; wSum += weights[k]; } });
  if (wSum > 0) SCORES_NOW.master.score = Math.round(total / wSum);
  window.__VITAL_90DAY_RANGE__ = rangeLabel;
  window.__VITAL_SCORE_DATE__ = fmt(today);
})();

const RECENT_WORKOUTS = (()=>{
  const ACT = ACT_META;
  const rows = [];
  Object.keys(CAL_RICH).sort().reverse().forEach(dateKey => {
    const workouts = CAL_RICH[dateKey];
    if(!Array.isArray(workouts)) return;
    const d = new Date(dateKey + "T12:00:00");
    const dateStr = d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
    workouts.forEach(w => {
      const meta = ACT[w.cat] || {label:w.name,icon:"⚡",color:P.steel};
      rows.push({
        dateKey,
        dateStr,
        activity: w.name || meta.label,
        icon:     meta.icon,
        color:    meta.color,
        dur:      w.dur    || 0,
        strain:   w.strain || 0,
        avgHR:    w.avgHR  || 0,
        maxHR:    w.maxHR  || 0,
        cal:      w.cal    || 0,
        start:    w.start  || "",
        z1: w.z1p || 0, z2: w.z2p || 0, z3: w.z3p || 0,
        z4: w.z4p || 0, z5: w.z5p || 0,
      });
    });
  });
  // Apply Peloton overlay to recent workouts
      // Rebuild Peloton overlay from CAL_RICH + peloton data (ensures all dates matched)
    try {
      const peloRaw = localStorage.getItem("vital_peloton_v1");
      if(peloRaw){
        const peloAll = JSON.parse(peloRaw);
        const catMap = {cycling:"spin",running:"running",walking:"walking",strength:"functional fitness",yoga:"yoga",meditation:"meditation",cardio:"cardio"};
        const freshOv = {};
        for(const r of peloAll){
          if(!r.dateKey || !CAL_RICH[r.dateKey]) continue;
          const cat = catMap[r.discipline.toLowerCase()]||r.discipline.toLowerCase()||"other";
          freshOv[r.dateKey] = freshOv[r.dateKey]||{};
          freshOv[r.dateKey][cat] = {distance:r.distance,avgPace:r.avgSpeed>0?(60/r.avgSpeed):0,avgSpeed:r.avgSpeed,output:r.output,avgWatts:r.avgWatts,maxWatts:r.maxWatts,avgCadence:r.avgCadence,avgResistance:r.avgResistance,peloTitle:r.title,peloInst:r.instructor,duration:r.duration,source:"peloton"};
        }
        localStorage.setItem("vital_cal_rich_overlay", JSON.stringify(freshOv));
      }
    } catch(e){ console.warn("Peloton overlay rebuild:", e); }

  try {
    const ov = JSON.parse(localStorage.getItem("vital_cal_rich_overlay")||"{}");
    return rows.map(w => {
      const d = ov[w.dateKey];
      if(!d) return w;
      const p = d[w.cat];
      if(!p) return w;
      return {...w, distance:w.distance||p.distance, avgPace:w.avgPace||p.avgPace,
        output:w.output||p.output, avgWatts:w.avgWatts||p.avgWatts,
        peloMerged:true, peloTitle:p.peloTitle, peloInst:p.peloInst};
    });
  } catch(e){ return rows; }
})();
// Known weigh-in dates (DXA + Styku)
// Latest Hume weight (first entry in HUME_DATA) for WEIGHT_LOG display
const HUME_LATEST_WT = HUME_DATA.length>0 ? HUME_DATA[0].wt : null;
const WEIGHT_LOG=[
  {date:"2025-02-14",weight:208.0,source:"Styku"},
  {date:"2025-05-23",weight:212.0,source:"Styku"},
  {date:"2026-01-23",weight:216.0,source:"DXA"},
  ...(HUME_LATEST_WT?[{date:HUME_DATA[0].d,weight:HUME_LATEST_WT,source:"Hume BIA"}]:[]),
];

function CalendarPage(){
  const [viewMonth, setViewMonth] = useState({y:new Date().getFullYear(),m:new Date().getMonth()}); // 0-indexed
  const [selected,  setSelected]  = useState(null);

  // Category → icon + color
  const CAT = {
    running: {icon:"🏃",color:"#C47830"},
    fitness: {icon:"🏋",color:"#3A5C48"},
    spin:    {icon:"🚴",color:"#C4604A"},
    walking: {icon:"🚶",color:"#7A5A80"},
    other:   {icon:"⚡",color:"#6B6057"},
  };
  const catOf = w => CAT[w.cat] || CAT.other;

  // Color helpers
  const recColor  = r => !r?P.border:r>=80?"#3A5C48":r>=60?"#C47830":"#C4604A";
  const slpColor  = s => !s?P.muted:s>=90?"#3A5C48":s>=75?"#4A6070":"#C47830";
  const strColor  = s => s>=16?P.terra:s>=12?P.amber:P.sage;

  const {y,m} = viewMonth;
  const firstDay = new Date(y,m,1).getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const prevMonth = ()=>setViewMonth(p=>p.m===0?{y:p.y-1,m:11}:{y:p.y,m:p.m-1});
  const nextMonth = ()=>setViewMonth(p=>p.m===11?{y:p.y+1,m:0}:{y:p.y,m:p.m+1});
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateKey = d=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const today = new Date().toLocaleDateString('en-CA');

  // Month-level stats
  const mKeys = Array.from({length:daysInMonth},(_,i)=>dateKey(i+1));
  const mWorkouts = mKeys.filter(k=>CAL_RICH[k]?.length).length;
  const mAlc      = mKeys.filter(k=>CAL_DATA[k]?.alc).length;
  const mRecDays  = mKeys.filter(k=>CAL_DATA[k]?.rec!=null);
  const mAvgRec   = mRecDays.length ? Math.round(mRecDays.reduce((s,k)=>s+(CAL_DATA[k].rec||0),0)/mRecDays.length) : null;
  const mSlpDays  = mKeys.filter(k=>CAL_DATA[k]?.slp!=null);
  const mAvgSlp   = mSlpDays.length ? Math.round(mSlpDays.reduce((s,k)=>s+(CAL_DATA[k].slp||0),0)/mSlpDays.length) : null;
  const mStrain   = mKeys.reduce((s,k)=>{const r=CAL_RICH[k];return s+(r?.reduce((a,w)=>a+w.strain,0)||0);},0);

  const sel = selected ? {...CAL_DATA[selected], w:CAL_RICH[selected]} : null;

  return(<div style={S.col18}>
    <div style={S.rowsb}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>WHOOP · Real Data · Dec 2025 – Mar 2026</div>
        <div style={S.h18}>Activity Calendar</div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <button onClick={prevMonth} style={{width:32,height:32,borderRadius:8,background:P.card,border:`1px solid ${P.border}`,cursor:"pointer",fontSize:14,color:P.text}}>‹</button>
        <div style={{fontFamily:FF.r,fontWeight:600,fontSize:15,color:P.text,minWidth:130,textAlign:"center"}}>{MONTHS[m]} {y}</div>
        <button onClick={nextMonth} style={{width:32,height:32,borderRadius:8,background:P.card,border:`1px solid ${P.border}`,cursor:"pointer",fontSize:14,color:P.text}}>›</button>
      </div>
    </div>
    <div style={S.g120}>
      {[
        {icon:"🏋",label:"Active Days",  val:mWorkouts,             unit:"",  color:P.sage,   sub:`of ${daysInMonth} days`},
        {icon:"⚡",label:"Total Strain", val:mStrain.toFixed(0),    unit:"",  color:P.amber,  sub:"month total"},
        {icon:"💚",label:"Avg Recovery", val:mAvgRec||"—",          unit:mAvgRec?"%":"", color:recColor(mAvgRec),sub:"daily avg"},
        {icon:"🌙",label:"Avg Sleep",    val:mAvgSlp||"—",          unit:mAvgSlp?"%":"", color:slpColor(mAvgSlp),sub:"performance"},
        {icon:"🍷",label:"Alcohol Days", val:mAlc,                  unit:"",  color:mAlc>8?P.terra:P.clay,sub:`${(mAlc/(daysInMonth/7)).toFixed(1)}/week`},
      ].map(({icon,label,val,unit,color,sub})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"13px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{width:26,height:26,borderRadius:6,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,marginBottom:8}}>{icon}</div>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,lineHeight:1,letterSpacing:"-0.01em",marginBottom:2}}>{val}<span style={{fontSize:11,color:P.muted,fontFamily:FF.s,fontWeight:400,marginLeft:2}}>{unit}</span></div>
          <div style={S.sub10}>{label}</div>
          <div style={S.mut9}>{sub}</div>
        </div>
      ))}
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,padding:"10px 16px",display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>Legend</span>
      {[
        {icon:"🏋",color:"#3A5C48",l:"Fitness"},
        {icon:"🏃",color:"#C47830",l:"Running"},
        {icon:"🚴",color:"#C4604A",l:"Spin"},
        {icon:"🚶",color:"#7A5A80",l:"Walk"},
      ].map(({icon,color,l})=>(
        <div key={l} style={S.row5}>
          <span style={{fontSize:12}}>{icon}</span>
          <span style={S.sub9}>{l}</span>
        </div>
      ))}
      <div style={{width:1,height:14,background:P.border,margin:"0 4px"}}/>
      <div style={S.row5}>
        <div style={{width:3,height:14,borderRadius:2,background:"#B8902A"}}/>
        <span style={{fontFamily:FF.s,fontSize:10}}>🍷</span>
        <span style={S.sub9}>Alcohol day</span>
      </div>
      <div style={S.row5}>
        <div style={{width:3,height:14,borderRadius:2,background:P.sage}}/>
        <span style={S.sub9}>Recovery bar</span>
      </div>
      <div style={S.row5}>
        <div style={{width:3,height:14,borderRadius:2,background:"#4A6070"}}/>
        <span style={S.sub9}>Sleep bar</span>
      </div>
      <span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:"auto"}}>Click any day for detail</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:selected?"1fr 300px":"1fr",gap:18,alignItems:"start"}}>
      <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,.06)",overflowX:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:8,minWidth:280}}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d} style={{textAlign:"center",fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase",paddingBottom:6}}>{d}</div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,minWidth:280}}>
          {Array.from({length:firstDay},(_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const day=i+1, key=dateKey(day), d={...(CAL_DATA[key]||{}), w:CAL_RICH[key]};
            const inRange=key>="2025-12-01"&&key<=today; // extended to today
            const isSel=selected===key, isToday=key===today;
            const dayStrain=d.w?.reduce((s,w)=>s+w.strain,0)||0;
            const acts=d.w||[];
            const rec=d.rec, slp=d.slp;

            return(
              <div key={day}
                onClick={()=>inRange&&setSelected(isSel?null:key)}
                style={{
                  height:90, borderRadius:10, padding:"6px 6px 4px",
                  cursor:inRange?"pointer":"default", position:"relative",
                  background:isSel?P.cardDk:inRange&&rec?`rgba(${recColor(rec)==="#3A5C48"?"58,92,72":recColor(rec)==="#C47830"?"196,120,48":"196,96,74"},0.07)`:"transparent",
                  border:`1.5px solid ${isSel?P.amber:isToday?"#C47830":inRange?P.border:"transparent"}`,
                  transition:"all .15s", opacity:inRange?1:0.25,
                  display:"flex",flexDirection:"column",gap:2,
                }}
                onMouseEnter={e=>{if(inRange&&!isSel){e.currentTarget.style.background=P.panel;e.currentTarget.style.transform="translateY(-1px)";}}}
                onMouseLeave={e=>{if(!isSel){const r=CAL_DATA[key]?.rec;e.currentTarget.style.background=isSel?P.cardDk:inRange&&r?`rgba(${recColor(r)==="#3A5C48"?"58,92,72":recColor(r)==="#C47830"?"196,120,48":"196,96,74"},0.07)`:"transparent";e.currentTarget.style.transform="none";}}}>
                <div style={{fontFamily:FF.m,fontSize:10,fontWeight:isSel||isToday?700:400,color:isSel?P.textInv:isToday?P.amber:P.sub,lineHeight:1}}>{day}</div>
                {acts.length>0&&(
                  <div style={{display:"flex",gap:2,alignItems:"center",flexWrap:"wrap",minHeight:18}}>
                    {acts.slice(0,3).map((w,wi)=>{
                      const meta=catOf(w);
                      return(<span key={wi} style={{fontSize:13,lineHeight:1,filter:isSel?"brightness(1.4)":"none"}} title={`${w.name} · ${w.strain} strain`}>{meta.icon}</span>);
                    })}
                    {acts.length>3&&<span style={{fontFamily:FF.m,fontSize:8,color:isSel?P.mutedDk:P.muted}}>+{acts.length-3}</span>}
                  </div>
                )}
                <div style={{display:"flex",flexDirection:"column",gap:2,flex:1,justifyContent:"flex-end"}}>
                  {dayStrain>0&&(
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <div style={{flex:1,height:3,borderRadius:1,background:isSel?"rgba(255,255,255,0.1)":P.panel,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.min(100,(dayStrain/20)*100)}%`,background:strColor(dayStrain),borderRadius:1,transition:"width .6s"}}/>
                      </div>
                      <span style={{fontFamily:FF.m,fontSize:8,fontWeight:600,color:isSel?strColor(dayStrain):strColor(dayStrain),lineHeight:1,minWidth:14,textAlign:"right"}}>{dayStrain.toFixed(0)}</span>
                    </div>
                  )}
                  {slp&&(
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <div style={{flex:1,height:3,borderRadius:1,background:isSel?"rgba(255,255,255,0.1)":P.panel,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${slp}%`,background:slpColor(slp),borderRadius:1,transition:"width .6s"}}/>
                      </div>
                      <span style={{fontFamily:FF.m,fontSize:8,color:isSel?P.mutedDk:P.muted,lineHeight:1,minWidth:14,textAlign:"right"}}>{slp}</span>
                    </div>
                  )}
                </div>
                {d.alc&&(
                  <>
                    {/* Amber left-edge alcohol stripe */}
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"10px 0 0 10px",background:"#B8902A",opacity:isSel?0.6:0.85}}/>
                    {/* 🍷 label in bottom-right */}
                    <div style={{position:"absolute",bottom:4,right:5,fontFamily:FF.s,fontSize:9,color:"#B8902A",opacity:0.9,lineHeight:1}}>🍷</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {selected&&sel&&(()=>{
        const [sy,sm,sd]=selected.split('-').map(Number);
        const dayName=new Date(sy,sm-1,sd).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
        const totalStrain=sel.w?.reduce((s,w)=>s+w.strain,0)||0;
        return(
          <div style={{background:P.cardDk,border:`1px solid ${P.borderDk}`,borderRadius:16,padding:"18px",boxShadow:"0 6px 24px rgba(0,0,0,0.12)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>Day Detail</div>
                <div style={{fontFamily:FF.r,fontSize:14,fontWeight:600,color:P.textInv,lineHeight:1.3}}>{dayName}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,0.1)",border:"none",color:P.mutedDk,fontSize:14,cursor:"pointer",borderRadius:6,padding:"4px 8px"}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginBottom:14}}>
              {[
                {label:"Recovery",  val:sel.rec,  color:recColor(sel.rec), icon:"💚"},
                {label:"Sleep",     val:sel.slp,  color:slpColor(sel.slp), icon:"🌙"},
              ].map(({label,val,color,icon})=>(
                <div key={label} style={{padding:"10px",background:"rgba(255,255,255,0.06)",borderRadius:10}}>
                  {val!=null?(()=>{
                    const r=26,circ=2*Math.PI*r;
                    return(<>
                      <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
                        <div style={{position:"relative"}}>
                          <svg width={60} height={60} style={{transform:"rotate(-90deg)"}}>
                            <circle cx={30} cy={30} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5}/>
                            <circle cx={30} cy={30} r={r} fill="none" stroke={color} strokeWidth={5}
                              strokeDasharray={`${circ*(val/100)} ${circ*(1-val/100)}`} strokeLinecap="round"/>
                          </svg>
                          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.m,fontSize:12,fontWeight:600,color}}>{val}</div>
                        </div>
                      </div>
                      <div style={{textAlign:"center",fontFamily:FF.s,fontSize:9,color:P.mutedDk}}>{icon} {label}</div>
                    </>);
                  })():<div style={{textAlign:"center",fontFamily:FF.s,fontSize:9,color:P.mutedDk,padding:"14px 0"}}>{icon} {label}<br/><span style={{opacity:.5}}>No data</span></div>}
                </div>
              ))}
            </div>
            {(sel.hrv||sel.rhr)&&(
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {sel.hrv&&<div style={{flex:1,padding:"7px 10px",background:"rgba(255,255,255,0.05)",borderRadius:8}}>
                  <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,marginBottom:2}}>HRV</div>
                  <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.textInv}}>{sel.hrv}<span style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,marginLeft:2}}>ms</span></div>
                </div>}
                {sel.rhr&&<div style={{flex:1,padding:"7px 10px",background:"rgba(255,255,255,0.05)",borderRadius:8}}>
                  <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,marginBottom:2}}>RHR</div>
                  <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.textInv}}>{sel.rhr}<span style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,marginLeft:2}}>bpm</span></div>
                </div>}
              </div>
            )}
            {sel.w?.length>0&&(
              <div style={{marginBottom:12}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>
                  Workouts · {totalStrain.toFixed(1)} strain
                </div>
                {sel.w.map((w,i)=>{
                  const meta=catOf(w);
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(255,255,255,0.05)",borderRadius:8,marginBottom:4}}>
                      <span style={{fontSize:18,lineHeight:1,flexShrink:0}}>{meta.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:FF.s,fontSize:10,fontWeight:500,color:P.textInv,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.name}</div>
                        <div style={{fontFamily:FF.m,fontSize:9,color:P.mutedDk}}>{w.dur}m · {w.cal} cal</div>
                      </div>
                      <div style={{flexShrink:0,textAlign:"right"}}>
                        <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:strColor(w.strain)}}>{w.strain}</div>
                        <div style={{fontFamily:FF.s,fontSize:7,color:P.mutedDk}}>strain</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {sel.alc&&(
                <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:99,background:"rgba(184,144,42,0.2)",border:"1px solid rgba(184,144,42,0.4)"}}>
                  <span style={{fontSize:12}}>🍷</span>
                  <span style={{fontFamily:FF.s,fontSize:10,color:"#D4AD5A"}}>Alcohol logged</span>
                </div>
              )}
              {sel.wt&&(
                <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:99,background:"rgba(74,96,112,0.2)",border:"1px solid rgba(74,96,112,0.4)"}}>
                  <span style={{fontSize:10}}>⚖</span>
                  <span style={{fontFamily:FF.s,fontSize:10,color:"#7AACCA"}}>{sel.wt} lb</span>
                </div>
              )}
              {!sel.w?.length&&!sel.alc&&<span style={{fontFamily:FF.s,fontSize:10,color:P.mutedDk,padding:"5px 0"}}>Rest day</span>}
            </div>
          </div>
        );
      })()}
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"16px 20px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:P.muted}}>
          Activity & Alcohol · {MONTHS[m]} {y}
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          {[
            {c:"#B8902A",l:"🍷 Alcohol"},
            {c:P.sage,l:"🏋 Workout"},
            {c:P.panel,bord:P.border,l:"Rest"},
          ].map(({c,bord,l})=>(
            <div key={l} style={S.row5}>
              <div style={{width:12,height:12,borderRadius:2,background:c,border:`1.5px solid ${bord||c}`}}/>
              <span style={S.sub9}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      {(()=>{
        // Build combined 7-column heatmap for the viewed month
        const alcDays = mKeys.filter(k=>CAL_DATA[k]?.alc);
        const wktDays = mKeys.filter(k=>CAL_RICH[k]?.length);
        const restDays = mKeys.filter(k=>!CAL_RICH[k]?.length&&!CAL_DATA[k]?.alc&&CAL_DATA[k]?.rec!=null);
        const alcCount  = alcDays.length;
        const wktCount  = wktDays.length;
        const weeks     = daysInMonth / 7;
        // Build week rows from the month grid
        const allDays = [];
        for(let i=0;i<firstDay;i++) allDays.push(null); // leading blanks
        for(let d=1;d<=daysInMonth;d++) allDays.push(dateKey(d));
        // Pad to full weeks
        while(allDays.length%7!==0) allDays.push(null);
        const weekRows = [];
        for(let i=0;i<allDays.length;i+=7) weekRows.push(allDays.slice(i,i+7));

        return(<>
          <div style={{display:"flex",gap:16,marginBottom:14,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:"#B8902A14",border:"1px solid #B8902A33"}}>
              <span>🍷</span>
              <span style={{fontFamily:FF.m,fontSize:12,fontWeight:700,color:"#B8902A"}}>{alcCount}</span>
              <span style={{fontFamily:FF.s,fontSize:9,color:"#B8902A"}}>alcohol · {weeks>0?(alcCount/weeks).toFixed(1):0}/wk</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:P.sageBg+"44",border:`1px solid ${P.sage}33`}}>
              <span>🏋</span>
              <span style={{fontFamily:FF.m,fontSize:12,fontWeight:700,color:P.sage}}>{wktCount}</span>
              <span style={{fontFamily:FF.s,fontSize:9,color:P.sage}}>workouts · {weeks>0?(wktCount/weeks).toFixed(1):0}/wk</span>
            </div>
            {alcCount>0&&wktCount>0&&(
              <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:P.amberBg+"44",border:`1px solid ${P.amber}33`}}>
                <span style={{fontFamily:FF.s,fontSize:9}}>🔀</span>
                <span style={{fontFamily:FF.s,fontSize:9,color:P.amber}}>
                  {mKeys.filter(k=>CAL_DATA[k]?.alc&&CAL_RICH[k]?.length).length} both same day
                </span>
              </div>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"32px 1fr",gap:"3px 0"}}>
            <div/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4}}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d,i)=>(
                <div key={i} style={{textAlign:"center",fontFamily:FF.s,fontSize:8,fontWeight:600,
                  color:i===0||i===6?P.amber:P.muted,letterSpacing:"0.04em"}}>{d}</div>
              ))}
            </div>
            {weekRows.map((week,wi)=>{
              const wkAlc = week.filter(k=>k&&CAL_DATA[k]?.alc).length;
              const wkLbl = week.find(k=>k) ? week.find(k=>k).slice(5,10).replace("-","/") : "";
              return(<React.Fragment key={wi}>
                <div style={{fontFamily:FF.m,fontSize:8,color:P.muted,paddingTop:3,textAlign:"right",paddingRight:6}}>{wkLbl}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                  {week.map((key,di)=>{
                    if(!key) return <div key={di}/>;
                    const d={...(CAL_DATA[key]||{}), w:CAL_RICH[key]};
                    const hasAlc=!!d.alc, hasWkt=!!d.w?.length;
                    const inRange=key>="2025-12-01"&&key<=today;
                    const rec=d.rec;
                    const bg = !inRange?"transparent":hasAlc&&hasWkt?"linear-gradient(135deg,#B8902A 40%,"+P.sage+" 40%)":hasAlc?"#B8902A":hasWkt?P.sage+"CC":rec!=null?P.panel:"transparent";
                    const isSelected = selected===key;
                    return(
                      <div key={di}
                        onClick={()=>inRange&&setSelected(isSelected?null:key)}
                        style={{
                          height:24,borderRadius:4,cursor:inRange?"pointer":"default",
                          background:bg,
                          border:`1px solid ${!inRange?"transparent":hasAlc?"#9A7218":hasWkt?P.sage:P.border}`,
                          opacity:inRange?1:0.15,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          position:"relative",
                          boxShadow:isSelected?`0 0 0 2px ${P.amber}`:"none",
                          transition:"opacity .15s",
                        }}
                        title={`${key}${hasAlc?" · 🍷 alcohol":""}${hasWkt?" · 🏋 workout":""}`}
                      >
                        {hasAlc&&hasWkt&&<span style={{fontSize:9}}>🍷</span>}
                        {hasAlc&&!hasWkt&&<span style={{fontSize:9}}>🍷</span>}
                        {!hasAlc&&hasWkt&&(()=>{const ws=d.w||[];return ws.length>0?<span style={{fontSize:9,opacity:0.9}}>{catOf(ws[0]).icon}</span>:null;})()}
                      </div>
                    );
                  })}
                </div>
                {/* Alcohol count for week */}
                {false&&<div/>}
              </React.Fragment>);
            })}
          </div>
        </>);
      })()}
    </div>
    <div style={S.g240}>
      <div style={CS()}>
        <SLabel color={P.steel}>⚖ Weight Check-ins</SLabel>
        <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginTop:-8,marginBottom:14}}>
          Daily readings from Hume Pod BIA scale via Apple Health.
          {HUME_DATA.length>0&&<span> {HUME_DATA.length} readings loaded.</span>}
        </div>
        {HUME_DATA.slice(0,5).map((r,i)=>{
          const prev = HUME_DATA[i+1];
          const delta = prev ? +(r.wt - prev.wt).toFixed(1) : null;
          const isLatest = i===0;
          return(
            <div key={r.d} style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"11px 14px",
              background:isLatest?P.sage+"0C":P.panel,
              borderRadius:10,marginBottom:7,
              border:`1px solid ${isLatest?P.sage+"44":P.border}`,
            }}>
              <div style={S.row10}>
                <div style={{width:32,height:32,borderRadius:8,
                  background:isLatest?P.sage+"20":P.panel,
                  border:`1px solid ${isLatest?P.sage+"44":P.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                  ⚖
                </div>
                <div>
                  <div style={S.row6}>
                    <div style={{fontFamily:FF.m,fontSize:11,color:P.text}}>{r.d}</div>
                    {isLatest&&<div style={{fontFamily:FF.s,fontSize:7.5,fontWeight:700,color:P.sage,
                      background:P.sage+"18",padding:"1px 6px",borderRadius:3,letterSpacing:"0.06em"}}>LATEST</div>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                    <span style={S.mut9}>Hume Pod BIA</span>
                    {r.bf&&<span style={S.mut9}>· {r.bf}% BF (BIA)</span>}
                    {delta!==null&&(
                      <span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,
                        color:delta>0?P.terra:delta<0?P.sage:P.muted}}>
                        {delta>0?"+":""}{delta} lbs
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,
                  color:isLatest?P.sage:P.steel,letterSpacing:"-0.02em",lineHeight:1}}>
                  {r.wt.toFixed(1)}
                </div>
                <div style={S.mut9t2}>lbs</div>
              </div>
            </div>
          );
        })}
        {HUME_DATA.length>=7&&(()=>{
          const slice7 = HUME_DATA.slice(0,7);
          const minW = Math.min(...slice7.map(x=>x.wt));
          const maxW = Math.max(...slice7.map(x=>x.wt));
          const range = Math.max(maxW-minW, 0.5);
          const delta7 = +(HUME_DATA[0].wt - HUME_DATA[6].wt).toFixed(1);
          return(
            <div style={{padding:"12px 14px",background:P.panel,borderRadius:9,border:`1px solid ${P.border}`,marginTop:4}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>7-day trend</div>
                <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,
                  color:delta7>0?P.terra:delta7<0?P.sage:P.muted}}>
                  {delta7>0?"+":""}{delta7} lbs vs 7 days ago
                </div>
              </div>
              <div style={{display:"flex",gap:3,alignItems:"flex-end",height:36}}>
                {slice7.slice().reverse().map((r,i)=>{
                  const pct=(r.wt-minW)/range;
                  const h=Math.round(6+pct*26);
                  const isToday=i===slice7.length-1;
                  return(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{width:"100%",height:h,borderRadius:2,
                        background:isToday?P.sage:P.steel+"66",
                        transition:`height 0.6s ease ${i*60}ms`}}
                        title={`${r.d}: ${r.wt} lbs`}/>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                <span style={{fontFamily:FF.m,fontSize:7.5,color:P.muted}}>{HUME_DATA[6]?.d}</span>
                <span style={{fontFamily:FF.m,fontSize:7.5,color:P.muted}}>{HUME_DATA[0]?.d}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:6,borderTop:`1px solid ${P.border}`}}>
                <span style={S.mut9}>Range: {minW}–{maxW} lbs</span>
                <span style={S.mut9}>Avg: {(slice7.reduce((s,r)=>s+r.wt,0)/slice7.length).toFixed(1)} lbs</span>
              </div>
            </div>
          );
        })()}
        {HUME_DATA.length < 5&&(
          <div style={{padding:"10px 12px",background:P.panel,borderRadius:8,border:`1px dashed ${P.border}`,marginTop:8,fontFamily:FF.s,fontSize:10,color:P.muted,lineHeight:1.6}}>
            Import more Hume data via the ⬆ Import Data page to see your full weigh-in history.
          </div>
        )}
      </div>
    </div>
  </div>);
}

const HRV_ZONES = [
  { id:4, label:"Peak",       range:">49 ms",   min:49.4, max:999,  color:"#5BC4F0", bg:"rgba(91,196,240,0.12)",  desc:"Exceptional readiness — push hard, set PRs, go long",          training:"Max effort, PRs, high-volume blocks, test fitness" },
  { id:3, label:"Elevated",   range:"47–49 ms", min:46.9, max:49.4, color:"#3A9C68", bg:"rgba(58,156,104,0.12)", desc:"Above baseline — go hard with confidence",                       training:"High-intensity, strength PRs, long endurance" },
  { id:2, label:"Baseline",   range:"42–47 ms", min:41.9, max:46.9, color:"#C47830", bg:"rgba(196,120,48,0.12)", desc:"Normal — train as planned, moderate intensity",                   training:"Planned sessions at normal effort, nothing extreme" },
  { id:1, label:"Low",        range:"39–42 ms", min:38.9, max:41.9, color:"#C4604A", bg:"rgba(196,96,74,0.12)",  desc:"Below baseline — reduce volume or intensity",                    training:"Easy aerobic only, cut FF volume by 30%, no new PRs" },
  { id:0, label:"Suppressed", range:"<39 ms",   min:0,    max:38.9, color:"#8B2020", bg:"rgba(139,32,32,0.14)",  desc:"Recovery deficit — active rest or very light movement",           training:"Walk, stretch, mobility only — do not push" },
];

function getZone(hrv){ return HRV_ZONES.find(z=>hrv>z.min&&hrv<=z.max)||HRV_ZONES[2]; }

function ReadinessPage(){
  const [view,setView]=useState("today");
  const ax={tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  const todayHRV  = WHOOP.hrv;
  const todayRec  = WHOOP.recovery;
  const todayRHR  = WHOOP.rhr;
  const todayZone = getZone(todayHRV);

  const current   = RECOVERY_DEBT_SERIES[RECOVERY_DEBT_SERIES.length-1];
  const prev4     = RECOVERY_DEBT_SERIES.slice(-5,-1);
  const avg4wkHRV = +(prev4.reduce((s,w)=>s+w.hrv,0)/prev4.length).toFixed(1);
  const currentDebt=current.debt;

  const strainRec={
    4:{min:15,max:21,label:"Push hard — 15–21 strain",color:"#5BC4F0"},
    3:{min:12,max:16,label:"Go strong — 12–16 strain",color:"#3A9C68"},
    2:{min:8, max:13,label:"Moderate — 8–13 strain",  color:"#C47830"},
    1:{min:4, max:8, label:"Easy only — 4–8 strain",  color:"#C4604A"},
    0:{min:0, max:4, label:"Rest day — <4 strain",    color:"#8B2020"},
  }[todayZone.id];

  const chartData=view==="today"?RECOVERY_DEBT_SERIES.slice(-4):view==="week"?RECOVERY_DEBT_SERIES.slice(-13):RECOVERY_DEBT_SERIES;

  return(<div style={S.col16}>
    <div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>WHOOP · 55-week personal baseline · HRV mean 44.4 ms ± 5.0</div>
      <div style={S.h18}>HRV Zones & Recovery Debt</div>
    </div>
    <div style={{background:`linear-gradient(135deg,${todayZone.color}18 0%,${todayZone.color}08 100%)`,border:`1.5px solid ${todayZone.color}55`,borderRadius:18,padding:"22px 24px",boxShadow:`0 4px 24px ${todayZone.color}18`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>Today's Readiness Zone</div>
          <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:6}}>
            <div style={{fontFamily:FF.r,fontSize:52,fontWeight:700,color:todayZone.color,letterSpacing:"-0.03em",lineHeight:1}}>{todayHRV}</div>
            <div>
              <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginBottom:2}}>ms HRV</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:99,background:todayZone.color+"22",border:`1px solid ${todayZone.color}55`}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:todayZone.color,boxShadow:`0 0 8px ${todayZone.color}`}}/>
                <span style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:todayZone.color,letterSpacing:"0.04em"}}>{todayZone.label.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div style={{fontFamily:FF.s,fontSize:12,color:P.sub,lineHeight:1.6,maxWidth:360}}>{todayZone.desc}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12,minWidth:160}}>
          {[
            {label:"Recovery", val:`${todayRec}%`,  note:todayRec>=76?"Above avg":todayRec>=58?"Normal":"Below avg", color:todayRec>=76?P.sage:todayRec>=58?P.amber:P.terra},
            {label:"RHR",      val:`${todayRHR} bpm`,note:todayRHR<=48?"Excellent":todayRHR<=52?"Normal":"Elevated",color:todayRHR<=48?P.sage:todayRHR<=52?P.amber:P.terra},
            {label:"4-wk HRV", val:`${avg4wkHRV} ms`,note:"rolling avg",color:P.steel},
          ].map(({label,val,note,color})=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,0.5)",border:`1px solid ${P.border}`}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{label}</div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:FF.m,fontSize:12,fontWeight:600,color}}>{val}</div>
                <div style={S.mut8}>{note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:16,paddingTop:14,borderTop:`1px solid ${todayZone.color}33`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Training Prescription</div>
            <div style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.text}}>{todayZone.training}</div>
          </div>
          <div style={{padding:"8px 16px",borderRadius:10,background:strainRec.color+"18",border:`1px solid ${strainRec.color}44`}}>
            <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:2}}>Target Strain</div>
            <div style={{fontFamily:FF.m,fontSize:14,fontWeight:700,color:strainRec.color}}>{strainRec.label}</div>
          </div>
        </div>
        <div style={{marginTop:12}}>
          <div style={{height:8,borderRadius:4,background:"linear-gradient(to right,#8B2020,#C4604A,#C47830,#3A9C68,#5BC4F0)",position:"relative",overflow:"visible"}}>
            <div style={{position:"absolute",top:-4,left:`${Math.min(95,Math.max(2,(todayHRV-30)/35*100))}%`,width:16,height:16,borderRadius:"50%",background:"#fff",border:`3px solid ${todayZone.color}`,boxShadow:`0 2px 8px ${todayZone.color}66`,transform:"translateX(-50%)"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            {HRV_ZONES.slice().reverse().map(z=>(<div key={z.id} style={{fontFamily:FF.s,fontSize:7.5,color:z.id===todayZone.id?z.color:P.muted,fontWeight:z.id===todayZone.id?700:400}}>{z.label}</div>))}
          </div>
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
      {HRV_ZONES.slice().reverse().map(z=>(
        <div key={z.id} style={{padding:"12px 14px",borderRadius:12,background:z.id===todayZone.id?z.bg:P.panel,border:`1px solid ${z.id===todayZone.id?z.color+"66":P.border}`,boxShadow:z.id===todayZone.id?`0 2px 12px ${z.color}22`:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:z.color,boxShadow:z.id===todayZone.id?`0 0 8px ${z.color}`:""}}/>
            <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:z.id===todayZone.id?z.color:P.sub}}>{z.label}</span>
            {z.id===todayZone.id&&<span style={{fontFamily:FF.s,fontSize:7,color:z.color,background:z.color+"15",padding:"1px 5px",borderRadius:3,marginLeft:"auto",letterSpacing:"0.06em"}}>NOW</span>}
          </div>
          <div style={{fontFamily:FF.m,fontSize:10,fontWeight:600,color:z.id===todayZone.id?z.color:P.muted,marginBottom:4}}>{z.range}</div>
          <div style={{fontFamily:FF.s,fontSize:8.5,color:P.muted,lineHeight:1.5}}>{z.desc}</div>
        </div>
      ))}
    </div>
    <div style={CS(16,"20px","0 1px 4px rgba(0,0,0,.05)")}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <SLabel color={P.steel}>Recovery Debt Tracker</SLabel>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-10}}>Distance from your personal recovery baseline (66.6%). Positive = surplus, negative = deficit.</div>
        </div>
        <div style={{padding:"8px 14px",borderRadius:10,background:currentDebt>=0?"rgba(58,156,104,0.12)":"rgba(196,96,74,0.10)",border:`1px solid ${currentDebt>=0?P.sage:P.terra}44`}}>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.08em"}}>Current</div>
          <div style={{fontFamily:FF.r,fontSize:22,fontWeight:700,color:currentDebt>=0?P.sage:P.terra,lineHeight:1}}>{currentDebt>0?"+":""}{currentDebt.toFixed(1)}%</div>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:2}}>{currentDebt>=4?"Surplus — push hard":currentDebt>=-2?"Near baseline":currentDebt>=-6?"Mild deficit — back off":"Significant deficit"}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{k:"today",l:"4 wks"},{k:"week",l:"13 wks"},{k:"full",l:"Full year"}].map(({k,l})=>(
          <button key={k} onClick={()=>setView(k)} style={{fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:7,cursor:"pointer",transition:"all .15s",background:view===k?P.cardDk:P.card,color:view===k?P.textInv:P.sub,border:`1px solid ${view===k?P.cardDk:P.border}`}}>{l}</button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={chartData} margin={{top:8,right:8,left:-18,bottom:0}}>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={view==="full"?7:view==="week"?2:0}/>
          <YAxis {...ax} domain={[-12,14]} tickFormatter={v=>v>0?`+${v}`:v}/>
          <ReferenceLine y={0} stroke={P.muted} strokeWidth={1.5}/>
          <ReferenceLine y={9}  stroke={P.sage}  strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}/>
          <ReferenceLine y={-9} stroke={P.terra} strokeDasharray="4 3" strokeOpacity={0.4} strokeWidth={1}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,padding:"10px 14px",fontFamily:FF.s,fontSize:10,boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}><div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:6}}>{label}</div>{payload.map(p=><div key={p.name} style={{display:"flex",justifyContent:"space-between",gap:18,marginBottom:3}}><span style={{color:P.muted}}>{p.name}</span><span style={{fontFamily:FF.m,fontWeight:600,color:p.name==="Debt"?(p.value>=0?P.sage:P.terra):P.steel}}>{p.name==="Debt"?(p.value>0?"+":"")+p.value+"%":p.value+" ms"}</span></div>)}</div>):null}/>
          <Bar dataKey="debt" name="Debt" radius={[2,2,0,0]} isAnimationActive={true} animationDuration={900} maxBarSize={20}>
            {chartData.map((d,i)=><Cell key={i} fill={d.debt>=0?P.sage:P.terra} opacity={0.65}/>)}
          </Bar>
          <Line type="monotone" dataKey="hrv" name="HRV" stroke={P.steel} strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={900}/>
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap"}}>
        {[{c:P.sage,l:"Recovery surplus"},{c:P.terra,l:"Recovery deficit"},{c:P.steel,l:"HRV (ms)"}].map(({c,l})=>(<div key={l} style={S.row5}><div style={{width:10,height:10,borderRadius:2,background:c,opacity:0.7}}/><span style={{fontFamily:FF.s,fontSize:8.5,color:P.muted}}>{l}</span></div>))}
      </div>
    </div>
    <div style={CS(16,"20px","0 1px 4px rgba(0,0,0,.05)")}>
      <SLabel color={P.sage}>HRV Trend · 55 Weeks · Personal Zones</SLabel>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-10,marginBottom:14}}>4-week rolling average with personal zone thresholds.</div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={RECOVERY_DEBT_SERIES} margin={{top:8,right:8,left:-18,bottom:0}}>
          <defs><linearGradient id="gHRVLine" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.sage} stopOpacity="0.20"/><stop offset="100%" stopColor={P.sage} stopOpacity="0"/></linearGradient></defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="label" {...ax} interval={7}/>
          <YAxis {...ax} domain={[28,58]}/>
          {[{y:49.4,c:"#5BC4F0",l:"Peak"},{y:46.9,c:"#3A9C68",l:"Elevated"},{y:44.4,c:P.muted,l:"Mean 44.4"},{y:41.9,c:"#C4604A",l:"Low"},{y:38.9,c:"#8B2020",l:"Suppressed"}].map(({y,c,l})=>(
            <ReferenceLine key={y} y={y} stroke={c} strokeDasharray={y===44.4?"6 3":"3 3"} strokeOpacity={0.45} strokeWidth={y===44.4?1.5:1}
              label={{value:l,position:"right",fontFamily:FF.s,fontSize:7.5,fill:c,opacity:0.7}}/>
          ))}
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,padding:"10px 14px",fontFamily:FF.s,fontSize:10}}><div style={{color:P.muted,fontSize:9,marginBottom:6}}>{label}</div>{payload.map(p=>{const z=getZone(p.value);return(<div key={p.name} style={{display:"flex",justifyContent:"space-between",gap:16}}><span style={{color:P.muted}}>HRV</span><span style={{fontFamily:FF.m,fontWeight:700,color:z.color}}>{p.value} ms — {z.label}</span></div>);})}</div>):null}/>
          <Area type="monotone" dataKey="hrv" stroke={P.sage} strokeWidth={2} fill="url(#gHRVLine)"
            dot={(p)=>p.index%4===0?<circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill={getZone(p.value).color} stroke={P.card} strokeWidth={1.5}/>:<g key={p.index}/>}
            isAnimationActive={true} animationDuration={1000} name="HRV (4wk rolling)"/>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <div style={{background:P.cardDk,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"18px"}}>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Key Readiness Insights · From Your Data</div>
      <div style={S.col10}>
        {[
          {icon:"📈",text:`You're in a positive HRV trend — up +4.1 ms over the last 13 weeks. Recovery debt is currently ${currentDebt>0?"+":""}${currentDebt.toFixed(1)}% — ${currentDebt>0?"you have a surplus to spend on hard training.":"monitor and protect recovery."}`},
          {icon:"📅",text:"May and September are historically your Peak Zone months (50 ms avg). Plan your most ambitious training blocks around these windows. August is your trough — don't force peak performance in summer heat."},
          {icon:"⚠",text:"Jan–Feb 2026 was your longest Low Zone stretch (8 consecutive weeks). Watch for this pattern repeating next winter."},
          {icon:"💡",text:`Current zone (${todayZone.label}) recommends: ${todayZone.training}. Your personal 'go hard' threshold is HRV ≥ 47ms. Today at ${todayHRV}ms you're ${todayHRV>=47?"above":"below"} that threshold.`},
        ].map(({icon,text})=>(
          <div key={text.slice(0,20)} style={{display:"flex",gap:12,padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}>
            <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
            <div style={{fontFamily:FF.s,fontSize:10,color:P.mutedDk,lineHeight:1.7}}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  </div>);
}

function FuelingPage(){
  const [deficit,setDeficit]=useState(false);
  const [deficitSize,setDeficitSize]=useState(500);
  const now=new Date();const hour=now.getHours();const dow=now.getDay();const dowIdx=dow===0?6:dow-1;
  const WEEKLY_SCHEDULE={
    0:{name:"Running",           icon:"🏃",type:"cardio",  strain:11.0,dur:50,timeH:13},
    1:{name:"Functional Fitness",icon:"🏋",type:"strength",strain:11.2,dur:68,timeH:10},
    2:{name:"Running",           icon:"🏃",type:"cardio",  strain:12.8,dur:52,timeH:11},
    3:{name:"Functional Fitness",icon:"🏋",type:"strength",strain:11.5,dur:68,timeH:10},
    4:{name:"Running",           icon:"🏃",type:"cardio",  strain:10.2,dur:50,timeH:13},
    5:{name:"Functional Fitness",icon:"🏋",type:"strength",strain:14.1,dur:76,timeH:7},
    6:{name:"Running",           icon:"🏃",type:"cardio",  strain:11.3,dur:52,timeH:9},
  };
  const sched=WEEKLY_SCHEDULE[dowIdx];const isStrength=sched.type==="strength";const isHigh=sched.strain>=13;const isMorning=sched.timeH<=10;
  const preWorkout=hour<sched.timeH;const duringWindow=hour>=sched.timeH&&hour<sched.timeH+2;const postWorkout=hour>=sched.timeH+1;
  const RMR_KCAL=1858;const NEAT_KCAL=1300;const exCal=Math.round(sched.strain*42);
  const maintenanceTDEE=RMR_KCAL+NEAT_KCAL+exCal;const targetCals=deficit?maintenanceTDEE-deficitSize:maintenanceTDEE;
  const leanLbs=149.8;
  const protein_g=isStrength?Math.round(leanLbs*1.1):Math.round(leanLbs*0.9);const protein_cal=protein_g*4;
  const fat_cal=Math.round(targetCals*(deficit?0.28:0.26));const fat_g=Math.round(fat_cal/9);
  const carb_cal=targetCals-protein_cal-fat_cal;const carb_g=Math.round(carb_cal/4);
  const PRE_FUEL={
    cardio:{timing:isMorning?"30–60 min before":"60–90 min before",meals:isMorning?["Banana + 1 tbsp almond butter (~200 kcal)","Rice cake + honey (~120 kcal)","Half a bagel with jam (~150 kcal)"]:["Oatmeal with berries + protein (~400 kcal)","Greek yogurt + granola + fruit (~350 kcal)","Toast + 2 eggs + avocado (~420 kcal)"],carbs_g:isHigh?"40–60g":"25–40g",protein_g_pre:"10–20g",note:isMorning?"Fasted cardio viable for aerobic runs <60 min. Have the banana as insurance.":"Prioritise carbs 90 min out. Plenty of time to digest."},
    strength:{timing:isMorning?"60–90 min before":"90–120 min before",meals:isMorning?["Protein shake + banana (~300 kcal)","Greek yogurt + berries + granola (~380 kcal)","2 eggs + rice cakes + fruit (~320 kcal)"]:["Chicken + rice + veggies (~550 kcal)","Salmon + sweet potato (~520 kcal)","Ground turkey rice bowl (~500 kcal)"],carbs_g:isHigh?"50–80g":"35–55g",protein_g_pre:"25–35g",note:isHigh?`High-strain day. Load carbs — glycolytic pathway drives FF.`:"Standard strength prep. Balanced meal 90 min out."},
  };
  const DURING_FUEL={
    cardio:{hydration:"500–750ml/hour",electrolytes:"Sodium 500–700mg/hr if >60 min",carbs:sched.dur>=60?"30–45g/hr after first 45 min":"Water only if <60 min"},
    strength:{hydration:"500ml/hour minimum",electrolytes:"Sodium 300–500mg/hr",carbs:isHigh?"20–30g intra-workout":"Water and electrolytes sufficient",note:isHigh?"High-strain FF benefits from intra-workout carbs — keeps intensity in the final third.":"Lower-strain sessions don't need carb fueling mid-workout."},
  };
  const POST_FUEL={
    cardio:{timing:"Within 30–45 min",meals:[`${Math.round(leanLbs*0.25)}g protein + fast carbs (shake + banana, ~450 kcal)`,"Chocolate milk + rice cakes (~380 kcal)","Greek yogurt parfait + granola + honey (~400 kcal)"],protein_g:`${Math.round(leanLbs*0.22)}–${Math.round(leanLbs*0.28)}g`,carbs_g:"60–80g fast carbs"},
    strength:{timing:"Within 30 min",meals:[`${Math.round(leanLbs*0.28)}g protein + moderate carbs (shake + fruit, ~500 kcal)`,"Chicken + white rice + veggies (~600 kcal)","Eggs + toast + cottage cheese (~520 kcal)"],protein_g:`${Math.round(leanLbs*0.25)}–${Math.round(leanLbs*0.30)}g`,carbs_g:"40–60g moderate GI carbs",note:`Hit ${Math.round(leanLbs*0.27)}g protein fast. Leucine-rich sources (whey, chicken, eggs) preferred.`},
  };
  const preFuel=PRE_FUEL[sched.type];const durFuel=DURING_FUEL[sched.type];const postFuel=POST_FUEL[sched.type];
  const macroData=[{name:"Protein",g:protein_g,kcal:protein_cal,color:P.sage},{name:"Carbs",g:carb_g,kcal:carb_cal,color:P.amber},{name:"Fat",g:fat_g,kcal:fat_cal,color:P.terra}];
  const Section=({title,emoji,active})=>(<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:8,background:active?"rgba(196,120,48,0.12)":P.panel,border:`1px solid ${active?P.amber:P.border}`,marginBottom:2}}><span style={{fontSize:14}}>{emoji}</span><span style={{fontFamily:FF.s,fontSize:11,fontWeight:active?700:400,color:active?P.amber:P.sub}}>{title}</span>{active&&<div style={{marginLeft:"auto",fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.amber,background:P.amber+"20",padding:"2px 7px",borderRadius:4,letterSpacing:"0.06em"}}>NOW</div>}</div>);
  const MealOption=({meal,idx})=>(<div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{width:22,height:22,borderRadius:"50%",background:P.card,border:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FF.m,fontSize:9,fontWeight:700,color:P.muted,flexShrink:0}}>{idx+1}</div><div style={{fontFamily:FF.s,fontSize:11,color:P.text,flex:1,lineHeight:1.5}}>{meal}</div></div>);

  return(<div style={S.col16}>
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>Nutrition · {now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
        <div style={S.h18}>Fueling Guide</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:12,background:deficit?P.cardDk:P.card,border:`1px solid ${deficit?P.borderDk:P.border}`,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:deficit?P.textInv:P.text,marginBottom:2}}>Calorie Deficit Mode</div>
          <div style={{fontFamily:FF.s,fontSize:9,color:deficit?P.mutedDk:P.muted}}>{deficit?`−${deficitSize} kcal/day below maintenance`:"Maintenance / Performance mode"}</div>
        </div>
        <div onClick={()=>setDeficit(d=>!d)} style={{width:44,height:24,borderRadius:12,cursor:"pointer",transition:"all .2s",background:deficit?"#3A5C48":"rgba(0,0,0,0.12)",position:"relative",flexShrink:0}}>
          <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:deficit?23:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.25)"}}/>
        </div>
      </div>
    </div>
    {deficit&&(<div style={{background:P.cardDk,borderRadius:12,padding:"14px 18px",border:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.textInv}}>Daily Deficit</div><div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:P.terra,letterSpacing:"-0.01em"}}>−{deficitSize} kcal</div></div>
      <input type="range" min={200} max={800} step={50} value={deficitSize} onChange={e=>setDeficitSize(+e.target.value)} style={{width:"100%",accentColor:P.terra,cursor:"pointer"}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk}}>−200 kcal (gentle, ~0.4 lb/wk)</span><span style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk}}>−800 kcal (aggressive, ~1.6 lb/wk)</span></div>
    </div>)}
    <div style={S.g240}>
      <div style={{background:P.cardDk,borderRadius:14,padding:"18px",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Today's Workout</div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:44,height:44,borderRadius:12,background:sched.type==="strength"?"rgba(58,92,72,0.35)":"rgba(196,120,48,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{sched.icon}</div>
          <div><div style={{fontFamily:FF.s,fontSize:13,fontWeight:700,color:P.textInv}}>{sched.name}</div><div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,marginTop:2}}>{sched.dur} min · ~{sched.strain} strain · ~{exCal} kcal</div></div>
          {isHigh&&<div style={{marginLeft:"auto",padding:"3px 9px",borderRadius:5,background:"rgba(196,96,74,0.25)",border:"1px solid rgba(196,96,74,0.4)"}}><span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:"#E8816A"}}>HIGH LOAD</span></div>}
        </div>
        <Section title="Pre-workout window" emoji="⚡" active={preWorkout}/>
        <Section title="During session" emoji="💧" active={duringWindow}/>
        <Section title="Post-workout recovery" emoji="🔄" active={postWorkout}/>
      </div>
      <div style={CS()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>Daily Calorie Target</div>
          <div style={{padding:"3px 8px",borderRadius:5,background:deficit?"rgba(196,96,74,0.10)":"rgba(58,92,72,0.10)",border:`1px solid ${deficit?P.terra:P.sage}44`}}><span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:deficit?P.terra:P.sage}}>{deficit?"DEFICIT":"MAINTENANCE"}</span></div>
        </div>
        <div style={{fontFamily:FF.r,fontSize:42,fontWeight:600,color:P.text,lineHeight:1,letterSpacing:"-0.02em",marginBottom:4}}>{targetCals.toLocaleString()}<span style={{fontFamily:FF.s,fontSize:12,color:P.muted,fontWeight:400,marginLeft:4}}>kcal</span></div>
        {deficit&&<div style={{fontFamily:FF.s,fontSize:9,color:P.terra,marginBottom:10}}>Maintenance is {maintenanceTDEE.toLocaleString()} kcal · deficit −{deficitSize}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:12}}>
          {[{label:"RMR (measured)",val:RMR_KCAL,color:P.sage},{label:"NEAT / lifestyle",val:NEAT_KCAL,color:P.steel},{label:"Exercise",val:exCal,color:P.amber},...(deficit?[{label:"Deficit",val:-deficitSize,color:P.terra}]:[])].map(({label,val,color})=>(<div key={label} style={S.rowsb}><div style={S.row6}><div style={{width:6,height:6,borderRadius:"50%",background:color}}/><span style={S.sub10}>{label}</span></div><span style={{fontFamily:FF.m,fontSize:10,fontWeight:500,color:val<0?P.terra:P.text}}>{val>0?"+":""}{val} kcal</span></div>))}
          <div style={{height:1,background:P.border,margin:"3px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.text}}>Target</span><span style={{fontFamily:FF.m,fontSize:11,fontWeight:700,color:P.text}}>{targetCals.toLocaleString()} kcal</span></div>
        </div>
      </div>
    </div>
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <SLabel color={P.sage}>Macro Targets · {sched.name} Day</SLabel>
        <div style={S.mut9}>149.8 lbs lean mass · {isStrength?"strength (↑ protein)":"cardio (↑ carbs)"}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        {macroData.map(m=>(<div key={m.name} style={{padding:"12px 14px",borderRadius:11,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:9,color:P.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{m.name}</div><div style={{fontFamily:FF.r,fontSize:28,fontWeight:600,color:m.color,lineHeight:1,letterSpacing:"-0.01em"}}>{m.g}<span style={{fontFamily:FF.s,fontSize:11,color:P.muted,fontWeight:400,marginLeft:2}}>g</span></div><div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:3}}>{m.kcal} kcal · {Math.round(m.kcal/targetCals*100)}%</div><div style={{height:4,borderRadius:2,background:P.border,marginTop:8,overflow:"hidden"}}><div style={{width:`${Math.round(m.kcal/targetCals*100)}%`,height:"100%",background:m.color,borderRadius:2}}/></div></div>))}
      </div>
    </div>
    <div style={{background:P.card,border:`1px solid ${preWorkout?P.amber:P.border}`,borderRadius:14,padding:"18px",boxShadow:preWorkout?"0 0 0 2px rgba(196,120,48,0.15)":"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <SLabel color={P.amber}>⚡ Pre-Workout · {preFuel.timing}</SLabel>
        {preWorkout&&<div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.amber,background:"rgba(196,120,48,0.12)",padding:"3px 8px",borderRadius:5,border:`1px solid ${P.amber}44`}}>UPCOMING NOW</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:12}}>
        <div style={{padding:"8px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Target Carbs</div><div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.amber}}>{preFuel.carbs_g}</div></div>
        <div style={{padding:"8px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Target Protein</div><div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.sage}}>{preFuel.protein_g_pre}</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>{preFuel.meals.map((m,i)=><MealOption key={i} meal={m} idx={i}/>)}</div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,padding:"8px 12px",background:P.panel,borderRadius:7,lineHeight:1.6}}>💡 {preFuel.note}</div>
    </div>
    <div style={{background:P.card,border:`1px solid ${duringWindow?P.steel:P.border}`,borderRadius:14,padding:"18px"}}>
      <SLabel color={P.steel}>💧 During Workout</SLabel>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        {[{label:"Hydration",val:durFuel.hydration,color:P.steel},{label:"Electrolytes",val:durFuel.electrolytes.split(" ").slice(0,3).join(" "),color:P.sage},{label:"Carbs",val:durFuel.carbs,color:P.amber}].map(({label,val,color})=>(<div key={label} style={{padding:"9px 11px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{label}</div><div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color,lineHeight:1.5}}>{val}</div></div>))}
      </div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,padding:"8px 12px",background:P.panel,borderRadius:7,lineHeight:1.6}}>💡 {durFuel.note}</div>
    </div>
    <div style={{background:P.card,border:`1px solid ${postWorkout?P.sage:P.border}`,borderRadius:14,padding:"18px",boxShadow:postWorkout?"0 0 0 2px rgba(58,92,72,0.15)":"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <SLabel color={P.sage}>🔄 Post-Workout · {postFuel.timing}</SLabel>
        {postWorkout&&<div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.sage,background:"rgba(58,92,72,0.12)",padding:"3px 8px",borderRadius:5,border:`1px solid ${P.sage}44`}}>WINDOW OPEN</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:12}}>
        <div style={{padding:"8px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Protein Target</div><div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.sage}}>{postFuel.protein_g}</div></div>
        <div style={{padding:"8px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`}}><div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>Carbs Target</div><div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:P.amber}}>{postFuel.carbs_g}</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>{postFuel.meals.map((m,i)=><MealOption key={i} meal={m} idx={i}/>)}</div>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,padding:"8px 12px",background:P.panel,borderRadius:7,lineHeight:1.6}}>💡 {postFuel.note}</div>
    </div>
  </div>);
}

const IMPORT_PROMPT = `You are a clinical health data analyst for Nate Hahn, a 47-year-old male athlete (DOB 05/24/1978, Montecito CA). Analyze this uploaded health document carefully.

Respond ONLY with valid JSON — no markdown, no backticks, no preamble. Use this exact structure:
{
  "docType": "labs|whoop|dxa|styku|rmr|nutrition|other",
  "docDate": "YYYY-MM-DD or approximate",
  "summary": "2-3 sentence clinical summary of what this document contains",
  "biomarkers": [{"name":"string","value":"string","unit":"string","range":"string","status":"normal|high|low|unknown"}],
  "whoopData": {"recovery":null,"hrv":null,"rhr":null,"strain":null,"sleepScore":null,"sleepHours":null},
  "bodyComp": {"weight":null,"bodyFatPct":null,"leanMassLbs":null,"fatMassLbs":null,"bmi":null,"source":""},
  "insights": ["insight1","insight2"],
  "recommendations": ["rec1","rec2"],
  "dataUpdates": {"description":"plain English summary of what dashboard fields this would update"}
}

Only populate the sections relevant to the document type. For lab panels fill biomarkers. For WHOOP exports fill whoopData. For DXA/Styku/body scans fill bodyComp. Be precise and clinically actionable.`;

function ImportPage(){
  const [uploads, setUploads] = useState([]);
  const [drag,    setDrag]    = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [hasImportedData, setHasImportedData] = useState(()=>{
    try{ return !!(localStorage.getItem("vital_hume_imported")||localStorage.getItem("vital_peloton_v1")); }catch(e){ return false; }
  });

  // Check for existing imported Hume data
  const [importedHumeSummary, setImportedHumeSummary] = useState(()=>{
    try {
      const d = localStorage.getItem("vital_hume_imported");
      if(!d) return null;
      const arr = JSON.parse(d);
      if(!Array.isArray(arr) || arr.length === 0) return null;
      return { count: arr.length, latest: arr[0], oldest: arr[arr.length-1] };
    } catch(e){ return null; }
  });

  const clearHumeData = () => {
    try { localStorage.removeItem("vital_hume_imported"); } catch(e){}
    setImportedHumeSummary(null);
  };

  const fileRef = useRef();
  // File type detector
  const getFileIcon = (file) => {
    if(file.type==="application/pdf")     return "📄";
    if(file.type.startsWith("image/"))    return "🖼";
    if(file.name.endsWith(".csv"))        return "📊";
    if(file.name.endsWith(".xml"))        return "🗂";
    if(file.name.endsWith(".json"))       return "⚙";
    return "📁";
  };

  const getFileTypeLabel = (file) => {
    if(file.type==="application/pdf")     return "PDF";
    if(file.type.startsWith("image/"))    return file.type.split("/")[1].toUpperCase();
    if(file.name.endsWith(".csv"))        return "CSV";
    if(file.name.endsWith(".xml"))        return "XML";
    if(file.name.endsWith(".json"))       return "JSON";
    return "File";
  };

  const updateProgress = (id, step, pct) => {
    setUploads(u => u.map(x => x.id===id ? {...x, progressStep:step, progress:pct} : x));
  };

  const analyzeFile = async (file) => {
    const entry = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size > 1024*1024
        ? (file.size/1024/1024).toFixed(1) + " MB"
        : Math.round(file.size/1024) + " KB",
      date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      fileIcon: getFileIcon(file),
      fileTypeLabel: getFileTypeLabel(file),
      status: "queued",   // queued → reading → sending → analyzing → done/error
      progress: 0,
      progressStep: "Queued",
      result: null,
      raw: null,
    };
    // Show immediately on drop/select
    setUploads(u => [entry, ...u]);

   
    await new Promise(r => setTimeout(r, 60));
    updateProgress(entry.id, "Reading file…", 12);

    try {
      let content;
      const isPDF   = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      const isCSV   = file.name.endsWith(".csv") || file.type === "text/csv";
      const isXML   = file.name.endsWith(".xml");
            // Peloton CSV — parse locally, no AI needed
      const isPelotonFile = file.name.toLowerCase().includes("workout") && file.name.endsWith(".csv");
      if(isPelotonFile){
        updateProgress(entry.id, "Parsing Peloton CSV…", 30);
        const peloText = await file.slice(0, 10000000).text();
        const peloLines = peloText.trim().split("\n");
        const peloHeader = peloLines[0].split(",").map(h=>h.replace(/"/g,"").trim().toLowerCase());
        const isPelo = peloHeader.some(h=>h.includes("fitness discipline"))||peloHeader.some(h=>h.includes("total output"));
        if(isPelo){
          const pcol = (name) => peloHeader.findIndex(h=>h.includes(name));
          const piDate=pcol("workout timestamp"),piDisc=pcol("fitness discipline"),piType=pcol("type"),piTitle=pcol("title");
          const piOutput=pcol("total output"),piAvgW=pcol("avg. watts"),piMaxW=pcol("max watts");
          const piAvgRes=pcol("avg. resistance"),piAvgCad=pcol("avg. cadence"),piAvgSpd=pcol("avg. speed");
          const piDist=pcol("distance"),piCal=pcol("calories burned"),piAvgHR=pcol("avg. heartrate");
          const piMaxHR=pcol("max heartrate"),piInst=pcol("instructor name");
          const piDur=pcol("length")>=0?pcol("length"):pcol("duration");
          const peloRows = [];
          for(const pline of peloLines.slice(1).filter(l=>l.trim())){
            const pcols=[];let pcur="",pinQ=false;
            for(const ch of pline){if(ch==='"'){pinQ=!pinQ;}else if(ch===","&&!pinQ){pcols.push(pcur);pcur="";}else{pcur+=ch;}}
            pcols.push(pcur);
            const pget=(i)=>i>=0&&i<pcols.length?(pcols[i]||"").replace(/"/g,"").trim():"";
            const dateRaw=pget(piDate);if(!dateRaw)continue;
            const dm=dateRaw.match(/(\d{4})-(\d{2})-(\d{2})/);const dateKey=dm?`${dm[1]}-${dm[2]}-${dm[3]}`:"";if(!dateKey)continue;
            peloRows.push({dateKey,discipline:pget(piDisc),type:pget(piType),title:pget(piTitle),output:parseFloat(pget(piOutput))||0,avgWatts:parseFloat(pget(piAvgW))||0,maxWatts:parseFloat(pget(piMaxW))||0,avgResistance:parseFloat(pget(piAvgRes))||0,avgCadence:parseFloat(pget(piAvgCad))||0,avgSpeed:parseFloat(pget(piAvgSpd))||0,distance:parseFloat(pget(piDist))||0,calories:parseInt(pget(piCal))||0,avgHR:parseInt(pget(piAvgHR))||0,maxHR:parseInt(pget(piMaxHR))||0,duration:parseFloat(pget(piDur))||0,instructor:pget(piInst),source:"peloton_csv"});
          }
          localStorage.setItem("vital_peloton_v1", JSON.stringify(peloRows));
          updateProgress(entry.id, "Merging with WHOOP…", 70);
          try{const calRichRaw=localStorage.getItem("vital_cal_rich")||localStorage.getItem("vital_whoop_cal_rich");if(calRichRaw){const calRich=JSON.parse(calRichRaw);const catMap={cycling:"spin",running:"running",walking:"walking",strength:"functional fitness",yoga:"yoga",meditation:"meditation",cardio:"cardio"};const overlay={};for(const r of peloRows){if(!r.dateKey)continue;const cat=catMap[r.discipline.toLowerCase()]||r.discipline.toLowerCase()||"other";const sessions=calRich[r.dateKey];if(sessions&&sessions.length){overlay[r.dateKey]=overlay[r.dateKey]||{};overlay[r.dateKey][cat]={distance:r.distance,avgPace:r.avgSpeed>0?(60/r.avgSpeed):0,avgSpeed:r.avgSpeed,output:r.output,avgWatts:r.avgWatts,maxWatts:r.maxWatts,avgCadence:r.avgCadence,avgResistance:r.avgResistance,peloTitle:r.title,peloInst:r.instructor,duration:r.duration,source:"peloton"};}}localStorage.setItem("vital_cal_rich_overlay",JSON.stringify(overlay));}}catch(e){console.warn("Peloton overlay merge error:",e);}
          setUploads(u=>u.map(x=>x.id===entry.id?{...x,status:"done",progress:100,progressStep:"Complete",result:{summary:`Peloton: ${peloRows.length} workouts imported. ${peloRows.filter(r=>r.output>0).length} with power data.`,biomarkers:[],insights:[],recommendations:[]}}:x));
          return;
        }
      }



      if (isPDF || isImage) {
        const b64 = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload  = () => { res(r.result.split(",")[1]); };
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        updateProgress(entry.id, "Encoding document…", 30);
        content = [
          { type: isPDF ? "document" : "image", source: { type: "base64", media_type: file.type, data: b64 } },
          { type: "text", text: IMPORT_PROMPT },
        ];
      } else if (isCSV || isXML) {
        const slice = file.slice(0, 51200);
        const text  = await slice.text();
        updateProgress(entry.id, "Parsing data…", 30);
        content = [{ type: "text", text: `${IMPORT_PROMPT}\n\nFILE: ${file.name}\n\n${text}` }];
      } else {
        const text = await file.text();
        updateProgress(entry.id, "Reading text…", 30);
        content = [{ type: "text", text: `${IMPORT_PROMPT}\n\nFILE: ${file.name}\n\n${text}` }];
      }

      updateProgress(entry.id, "Sending to Claude…", 48);
      setUploads(u => u.map(x => x.id===entry.id ? {...x, status:"analyzing"} : x));

     
      let fake = 48;
      const ticker = setInterval(() => {
        fake = Math.min(88, fake + (Math.random()*4 + 1));
        setUploads(u => u.map(x => x.id===entry.id && x.status==="analyzing"
          ? {...x, progress:Math.round(fake), progressStep:"Claude is reading…"}
          : x));
      }, 900);

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content }],
        }),
      });

      clearInterval(ticker);
      updateProgress(entry.id, "Parsing results…", 94);

      const data = await res.json();
      const raw  = data.content?.find(b => b.type === "text")?.text || "";
      let parsed;
      try {
        parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch {
        parsed = { docType:"other", summary: raw, biomarkers:[], insights:[], recommendations:[] };
      }

      updateProgress(entry.id, "Complete", 100);
      await new Promise(r => setTimeout(r, 300));
     
      // Also handle raw CSV rows parsed directly
      if(file.name.toLowerCase().includes("hume") ||
         (parsed.docType==="dxa" || parsed.docType==="styku") ||
         (parsed.bodyComp?.weight && parsed.docType !== "labs")){
        const bc = parsed.bodyComp;
        if(bc?.weight){
          const today = new Date().toISOString().slice(0,10);
          const newRow = {
            d: parsed.docDate || today,
            wt: parseFloat(bc.weight),
            bf: bc.bodyFatPct ? parseFloat(bc.bodyFatPct) : null,
            bmi: bc.bmi ? parseFloat(bc.bmi) : null,
          };
          try {
            const existing = JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
            const deduped = existing.filter(r=>r.d!==newRow.d);
            deduped.unshift(newRow);
            deduped.sort((a,b)=>b.d.localeCompare(a.d));
            localStorage.setItem("vital_hume_imported", JSON.stringify(deduped.slice(0,500)));
          } catch(e){}
        }
      }
      if(file.name.toLowerCase() === "activities.csv" ||
         (file.name.toLowerCase().includes("strava") && file.name.endsWith(".csv"))){
        try {
          const text = await file.slice(0, 5000000).text();
          const lines = text.trim().split("\n");
          const header = lines[0].split(",").map(h=>h.replace(/"/g,"").trim().toLowerCase());

          // Map Strava column names to indices
         
          const col = (name) => {
            const exact = header.findIndex(h=>h===name);
            return exact>=0 ? exact : header.findIndex(h=>h.includes(name));
          };
          const iDate     = col("activity date");
          const iName     = col("activity name");
          const iType     = col("activity type");
         
         
          const iDist     = header.findIndex(h=>h==="distance");
          const iTime     = col("moving time");
          const iElapsed  = col("elapsed time");
          const iElevGain = col("elevation gain");
          const iAvgHR    = col("average heart rate");
          const iMaxHR    = col("max heart rate");
          const iCal      = col("calories");
          const iAvgSpeed = col("average speed");

          const ACT_MAP = {
            run:"running", walk:"walking", ride:"spin", virtualride:"spin",
            weighttraining:"fitness", workout:"fitness", hike:"walking",
            swim:"swimming", yoga:"other", crossfit:"fitness",
          };

          const stored = {};
          try {
            const ex = JSON.parse(localStorage.getItem("vital_strava_activities")||"{}");
            Object.assign(stored, ex);
          } catch(e){}

          let imported = 0;
          const actRows = lines.slice(1).filter(l=>l.trim());

          for(const line of actRows){
            // Handle quoted CSV fields
            const cols = [];
            let cur = "", inQ = false;
            for(const ch of line){
              if(ch==='"'){ inQ=!inQ; } else if(ch===","&&!inQ){ cols.push(cur); cur=""; } else { cur+=ch; }
            }
            cols.push(cur);

            const get = (i) => i>=0&&i<cols.length ? (cols[i]||"").replace(/"/g,"").trim() : "";

            const dateRaw = get(iDate);
            if(!dateRaw) continue;
           
            let dateKey = "";
            const dm = dateRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
            const dm2 = dateRaw.match(/([A-Za-z]+)\s+(\d+),\s+(\d{4})/);
            if(dm) dateKey = `${dm[1]}-${dm[2]}-${dm[3]}`;
            else if(dm2){
              const months={Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",
                            Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12"};
              dateKey = `${dm2[3]}-${months[dm2[1]]||"01"}-${dm2[2].padStart(2,"0")}`;
            }
            if(!dateKey) continue;

            const typeRaw = get(iType).toLowerCase().replace(/\s+/g,"");
            const cat     = ACT_MAP[typeRaw] || "other";
            const distRaw = parseFloat(get(iDist))||0;
           
           
            const distMi    = +distRaw.toFixed(2);
            const movSec  = parseInt(get(iTime))||0;
            const durMin  = Math.round(movSec/60);
            const avgHR   = parseInt(get(iAvgHR))||0;
            const maxHR   = parseInt(get(iMaxHR))||0;
            const cal     = parseInt(get(iCal))||0;
            const name    = get(iName)||get(iType)||"Activity";
            const avgSpd  = parseFloat(get(iAvgSpeed))||0;
           
            const avgPace = avgSpd>0 ? +(60/avgSpd).toFixed(2) : 0;

            const entry = {
              cat, name, dur:durMin, cal, avgHR, maxHR,
              distance:distMi, avgPace, strain:0,
              start:"", source:"strava_csv",
              z1p:0,z2p:0,z3p:0,z4p:0,z5p:0,
            };

            if(!stored[dateKey]) stored[dateKey]=[];
           
            const existIdx = stored[dateKey].findIndex(e=>e.name===name&&e.source==="strava_csv");
            if(existIdx>=0){ stored[dateKey][existIdx]=entry; imported++; }
            else { stored[dateKey].push(entry); imported++; }
          }

          try{ localStorage.setItem("vital_strava_activities", JSON.stringify(stored)); }catch(e){}

          parsed.dataUpdates = {
            description: `✓ ${imported} Strava activities imported from ${actRows.length} rows. Activities saved to dashboard — visible in Fitness page after reload.`
          };
          const sampleDate = Object.keys(stored).sort().reverse()[0];
          const sampleAct  = sampleDate ? stored[sampleDate][0] : null;
          parsed.summary = `Strava CSV: ${imported} activities imported. Sample: ${sampleAct?.name||""} on ${sampleDate||""} — ${sampleAct?.distance?.toFixed(2)||"0"} mi, ${sampleAct?.dur||0}min. If distance looks wrong, clear Strava data and re-import.`;

        } catch(stravaErr){
        }
      }
     
     
      // "Title", "Class Timestamp", "Total Output", "Avg. Watts", "Max Watts",
      // "Avg. Resistance", "Avg. Cadence (RPM)", "Avg. Speed (mph)", "Distance (mi)",
      // "Calories Burned", "Avg. Heartrate", "Max Heartrate", "Duration (minutes)", "Instructor Name"
      const isPelotonCSV = file.name.toLowerCase().includes("workout") &&
        file.name.endsWith(".csv");
      if(isPelotonCSV){
        try {
          const text = await file.slice(0, 10000000).text();
          const lines = text.trim().split("\n");
          const header = lines[0].split(",").map(h=>h.replace(/"/g,"").trim().toLowerCase());

          const isPelo = header.some(h=>h.includes("fitness discipline")||h.includes("total output")||h.includes("avg. watts"));
          if(isPelo){
            const col = (name) => header.findIndex(h=>h.includes(name));
            const iDate   = col("workout timestamp");
            const iDisc   = col("fitness discipline");
            const iType   = col("type");
            const iTitle  = col("title");
            const iOutput = col("total output");
            const iAvgW   = col("avg. watts");
            const iMaxW   = col("max watts");
            const iAvgRes = col("avg. resistance");
            const iAvgCad = col("avg. cadence");
            const iAvgSpd = col("avg. speed");
            const iDist   = col("distance");
            const iCal    = col("calories burned");
            const iAvgHR  = col("avg. heartrate");
            const iMaxHR  = col("max heartrate");
                            const iDur   = col("length")>=0 ? col("length") : col("duration");
            const iInst   = col("instructor name");

            const rows = [];
            for(const line of lines.slice(1).filter(l=>l.trim())){
              const cols = [];
              let cur="",inQ=false;
              for(const ch of line){
                if(ch==='"'){inQ=!inQ;}else if(ch===","&&!inQ){cols.push(cur);cur="";}else{cur+=ch;}
              }
              cols.push(cur);
              const get=(i)=>i>=0&&i<cols.length?(cols[i]||"").replace(/"/g,"").trim():"";

              const dateRaw = get(iDate);
              if(!dateRaw) continue;
             
              const dm = dateRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
              const dateKey = dm ? `${dm[1]}-${dm[2]}-${dm[3]}` : "";
              if(!dateKey) continue;

              const row = {
                dateKey,
                discipline: get(iDisc),
                type:       get(iType),
                title:      get(iTitle),
                output:     parseFloat(get(iOutput))||0,
                avgWatts:   parseFloat(get(iAvgW))||0,
                maxWatts:   parseFloat(get(iMaxW))||0,
                avgResistance: parseFloat(get(iAvgRes))||0,
                avgCadence: parseFloat(get(iAvgCad))||0,
                avgSpeed:   parseFloat(get(iAvgSpd))||0,
                distance:   parseFloat(get(iDist))||0,
                calories:   parseInt(get(iCal))||0,
                avgHR:      parseInt(get(iAvgHR))||0,
                maxHR:      parseInt(get(iMaxHR))||0,
                duration:   parseFloat(get(iDur))||0,
                instructor: get(iInst),
                source:     "peloton_csv",
              };
              rows.push(row);
            }

            if(rows.length>0){
              rows.sort((a,b)=>b.dateKey.localeCompare(a.dateKey));
              try{ localStorage.setItem("vital_peloton_v1", JSON.stringify(rows)); }catch(e){}

              // ── MERGE into WHOOP CAL_RICH overlay ────────────────────
              // For each Peloton row, find matching WHOOP session by date + category
              // and attach Peloton-only fields: distance, pace, output, watts, cadence, resistance
              const PELO_TO_CAT = {
                cycling:"spin", "cycling":"spin", running:"running",
                walking:"walking", strength:"fitness", stretching:"fitness",
                "boot camp":"fitness", cardio:"fitness",
              };
              const overlay = JSON.parse(localStorage.getItem("vital_cal_rich_overlay")||"{}");
              let merged = 0;
              for(const row of rows){
                const cat = PELO_TO_CAT[(row.discipline||"").toLowerCase()] || "other";
                if(!overlay[row.dateKey]) overlay[row.dateKey] = {};
                // Store Peloton power/distance data keyed by category
                // WHOOP stays authoritative for HR/strain/zones — we only ADD fields
                overlay[row.dateKey][cat] = {
                  ...(overlay[row.dateKey][cat]||{}),
                  distance:    row.distance    >0 ? row.distance    : undefined,
                  avgPace:     row.avgSpeed    >0 ? +(60/row.avgSpeed).toFixed(2) : undefined, // min/mile from mph
                  avgSpeed:    row.avgSpeed    >0 ? row.avgSpeed    : undefined,
                  output:      row.output      >0 ? row.output      : undefined,   // kJ
                  avgWatts:    row.avgWatts    >0 ? row.avgWatts    : undefined,
                  maxWatts:    row.maxWatts    >0 ? row.maxWatts    : undefined,
                  avgCadence:  row.avgCadence  >0 ? row.avgCadence  : undefined,
                  avgResist:   row.avgResistance>0? row.avgResistance: undefined,
                  peloTitle:   row.title       || undefined,
                  peloInst:    row.instructor  || undefined,
                  source:      "peloton",
                };
                merged++;
              }
              try{ localStorage.setItem("vital_cal_rich_overlay", JSON.stringify(overlay)); }catch(e){}

              const cyclingCount = rows.filter(r=>r.discipline.toLowerCase()==="cycling").length;
              const withDist = rows.filter(r=>r.distance>0).length;
              parsed.dataUpdates = {
                description: `✓ ${rows.length} Peloton workouts imported & merged with WHOOP. ${cyclingCount} cycling sessions${withDist>0?` · ${withDist} with distance/pace data`:""}.`
              };
              parsed.summary = `Peloton: ${rows.length} workouts imported — ${rows.filter(r=>r.output>0).length} with power data, merged into WHOOP sessions.`;
            }
          }
        } catch(peloErr){ console.warn("Peloton CSV parse error:", peloErr); }
      }

     
      if((file.name.toLowerCase().includes("hume") || file.name.toLowerCase().includes("body_comp"))
          && (file.name.endsWith(".csv"))){
        try {
          const text = await file.slice(0, 200000).text();
          const lines = text.trim().split("\n").slice(1); // skip header
          const csvRows = [];
          for(const line of lines){
            const cols = line.split(",");
            if(cols.length >= 3){
              const d = (cols[0]||"").trim().replace(/"/g,"");
              const wt = parseFloat((cols[1]||"").replace(/"/g,""));
              const bf = parseFloat((cols[2]||"").replace(/"/g,""));
              const bmi = parseFloat((cols[3]||"").replace(/"/g,""));
              if(d && !isNaN(wt) && wt > 100 && wt < 400){
                csvRows.push({d, wt:+wt.toFixed(1), bf:isNaN(bf)?null:+bf.toFixed(2), bmi:isNaN(bmi)?null:+bmi.toFixed(1)});
              }
            }
          }
          if(csvRows.length > 0){
            csvRows.sort((a,b)=>b.d.localeCompare(a.d));
            try {
              const existing = JSON.parse(localStorage.getItem("vital_hume_imported")||"[]");
              const existDates = new Set(existing.map(r=>r.d));
              const merged = [...csvRows.filter(r=>!existDates.has(r.d)), ...existing];
              merged.sort((a,b)=>b.d.localeCompare(a.d));
              localStorage.setItem("vital_hume_imported", JSON.stringify(merged.slice(0,500)));
              // Refresh the status banner
              setImportedHumeSummary({ count: merged.length, latest: merged[0], oldest: merged[merged.length-1] });
              parsed.dataUpdates = { description: `${csvRows.length} Hume body comp readings saved. Latest: ${csvRows[0].wt} lbs on ${csvRows[0].d}. Reload the dashboard for weight card and trends to reflect your new data.` };
            } catch(e){}
          }
        } catch(e){}
      }

     
      // constants (LATEST, HUME_DATA, etc.) pick up the fresh values
      const wroteNewData = !!(
        parsed.dataUpdates?.description ||
        parsed.bodyComp?.weight ||
        (file.name.toLowerCase().includes("hume") && file.name.endsWith(".csv")) ||
        (file.name.toLowerCase() === "activities.csv") ||
        (file.name.toLowerCase().includes("workout") && file.name.endsWith(".csv"))
      );

      setUploads(u => u.map(x => x.id === entry.id
        ? { ...x, status: "done", progress:100,
            progressStep: wroteNewData ? "✓ Reloading dashboard…" : "Complete",
            result: parsed, raw, reloading: wroteNewData }
        : x
      ));

      if(wroteNewData){
        setTimeout(()=> window.location.reload(), 2200);
      }

    } catch(err) {
      setUploads(u => u.map(x => x.id === entry.id
        ? { ...x, status: "error", progress:100, progressStep:"Error", result: { summary: err.message, biomarkers:[], insights:[], recommendations:[] } }
        : x
      ));
    }
  };

  const onFiles = files => Array.from(files).forEach(analyzeFile);

  const statusColor = s => s==="done"?"#3A9C68":s==="error"?P.terra:P.amber;
  const statusLabel = s => s==="done"?"Complete":s==="error"?"Error":"Analyzing…";

  const docTypeLabel = t => ({
    labs:"Lab Panel", whoop:"WHOOP Export", dxa:"DXA Scan",
    styku:"Styku Scan", rmr:"RMR Test", nutrition:"Nutrition", other:"Document",
  }[t]||"Document");

  const docTypeIcon = t => ({
    labs:"🧬", whoop:"⌚", dxa:"🦴", styku:"📐", rmr:"💨", nutrition:"🥗", other:"📄",
  }[t]||"📄");
  const ACCEPT_TYPES = [
    { ext:".pdf",  icon:"📄", label:"PDF reports" },
    { ext:".png .jpg .jpeg .webp", icon:"🖼", label:"Images / screenshots" },
    { ext:".csv",  icon:"📊", label:"CSV exports (WHOOP, Hume)" },
    { ext:".xml",  icon:"🗂", label:"Apple Health export.xml" },
    { ext:".json", icon:"⚙", label:"JSON data" },
  ];

  return(<div style={S.col16}>
    {hasImportedData&&(
      <div style={{background:P.sageBg||P.panel,border:`1px solid ${P.sage}44`,borderRadius:10,
        padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:14}}>🔄</span>
        <div style={{flex:1,fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.5}}>
          Imported data detected. <strong>Reload the dashboard</strong> so Today, Overview, and Body Comp pages pick up the latest values.
        </div>
        <button onClick={()=>window.location.reload()}
          style={{fontFamily:FF.s,fontSize:10,fontWeight:700,padding:"7px 14px",flexShrink:0,
            borderRadius:7,border:"none",background:P.sage,color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}>
          Reload Now
        </button>
      </div>
    )}
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          Labs · WHOOP · DXA · Body Scans · Nutrition
        </div>
        <div style={S.h18}>Import Health Data</div>
      </div>
      {/* WHOOP Live Connection Status */}
      <div style={{display:"flex",gap:8}}>
        {(()=>{
          const [whoopConn, setWhoopConn] = useState(null);
          useEffect(()=>{
            fetch('/api/whoop/data').then(r=>r.json()).then(d=>setWhoopConn(d)).catch(()=>setWhoopConn(null));
          },[]);
          if(!whoopConn) return null;
          return whoopConn.connected ? (
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,
              background:"#3A9C6812",border:"1px solid #3A9C6844"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#3A9C68",
                boxShadow:"0 0 6px #3A9C68",animation:"pulse 2s infinite"}}/>
              <span style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:"#3A9C68"}}>
                WHOOP Live {whoopConn.stale?"(stale)":""}
              </span>
              <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>
                {whoopConn.hoursOld}h ago
              </span>
            </div>
          ) : (
            <a href="/api/whoop/login"
              style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,
                background:"#1A1816",border:"1px solid rgba(255,255,255,0.15)",textDecoration:"none",
                fontFamily:FF.s,fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>
              <span style={{fontSize:12}}>⌚</span> Connect WHOOP
            </a>
          );
        })()}
      </div>
      <div style={{display:"flex",gap:6}}>
        {["upload","peloton","history"].map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{
            fontFamily:FF.s,fontSize:11,fontWeight:600,padding:"5px 14px",borderRadius:7,
            cursor:"pointer",transition:"all .15s",
            background:activeTab===t?P.cardDk:P.card,
            color:activeTab===t?P.textInv:P.sub,
            border:`1px solid ${activeTab===t?P.cardDk:P.border}`,
          }}>{t==="upload"?"Upload":t==="peloton"?"🚴 Peloton":"History"} {t==="history"&&uploads.length>0?`(${uploads.length})`:""}</button>
        ))}
      </div>
    </div>

    {activeTab==="upload"&&(<>
      {importedHumeSummary&&(
        <div style={{background:P.sageBg,border:`1px solid ${P.sage}44`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:18}}>⚖</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.sage}}>
              Hume weight data active — {importedHumeSummary.count} readings
            </div>
            <div style={S.mut9t2}>
              Latest: <span style={{fontWeight:600,color:P.text}}>{importedHumeSummary.latest.wt} lbs</span> on {importedHumeSummary.latest.d}
              {" · "}Range: {importedHumeSummary.oldest.d} → {importedHumeSummary.latest.d}
              {" · "}Dashboard weight card and trends reflect this data.
            </div>
          </div>
          <button onClick={clearHumeData} style={{fontFamily:FF.s,fontSize:9,padding:"4px 10px",borderRadius:6,
            border:`1px solid ${P.terra}44`,background:"transparent",color:P.terra,cursor:"pointer"}}>
            Clear
          </button>
        </div>
      )}
      <div style={CS(14,"16px 18px")}>
        <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.sub,letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:12}}>Supported Document Types</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          {[
            {icon:"🧬",label:"Lab Reports",desc:"BioLab, Quest, LabCorp PDFs — extracts all biomarkers, flags out-of-range values"},
            {icon:"⌚",label:"WHOOP Exports",desc:"CSV physiological cycles or screenshot — updates recovery, HRV, RHR, strain"},
            {icon:"🦴",label:"DXA / Body Scan",desc:"DXA PDF or Styku/Hume screenshot — updates body fat %, lean mass, regional data"},
            {icon:"💨",label:"RMR / VO₂ Tests",desc:"CardioCoach, KORR, or metabolic test PDF — updates calorie targets"},
            {icon:"🖼",label:"Screenshots",desc:"Screenshot any app — WHOOP sleep screen, Hume scan result, lab portal — AI reads it"},
            {icon:"📊",label:"CSV / Apple Health",desc:"Hume body comp CSV, Apple Health export.xml — structured data import"},
          ].map(({icon,label,desc})=>(
            <div key={label} style={{padding:"11px 13px",borderRadius:10,background:P.panel,border:`1px solid ${P.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                <span style={{fontSize:16}}>{icon}</span>
                <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.text}}>{label}</div>
              </div>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.55}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);onFiles(e.dataTransfer.files);}}
        onClick={()=>fileRef.current?.click()}
        style={{
          border:`2px dashed ${drag?P.accent:P.border}`,borderRadius:16,padding:"40px 20px",
          textAlign:"center",cursor:"pointer",transition:"all .2s",
          background:drag?P.accent+"08":P.panel,
        }}>
        <input ref={fileRef} type="file" multiple
          accept=".pdf,image/*,.csv,.xml,.json"
          style={{display:"none"}}
          onChange={e=>onFiles(e.target.files)}/>
        <div style={{fontSize:40,marginBottom:12}}>⬆</div>
        <div style={{fontFamily:FF.s,fontSize:14,fontWeight:600,color:P.text,marginBottom:6}}>
          Drop files here or click to browse
        </div>
        <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,marginBottom:14}}>
          PDF · Images (JPG, PNG, WebP) · CSV · Apple Health XML · JSON
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          {ACCEPT_TYPES.map(({ext,icon,label})=>(
            <div key={ext} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",
              borderRadius:6,background:P.card,border:`1px solid ${P.border}`}}>
              <span style={{fontSize:13}}>{icon}</span>
              <span style={S.sub9}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      {uploads.filter(u=>u.status==="queued"||u.status==="analyzing").length>0&&(
        <div style={S.col10}>
          {uploads.filter(u=>u.status==="queued"||u.status==="analyzing").map(u=>{
            const pct    = u.progress||0;
            const isErr  = u.status==="error";
            const barClr = isErr?P.terra:pct===100?"#3A9C68":P.amber;
            return(
              <div key={u.id} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{width:44,height:44,borderRadius:10,background:P.panel,border:`1px solid ${P.border}`,
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:20,lineHeight:1}}>{u.fileIcon||"📄"}</span>
                    <span style={{fontFamily:FF.m,fontSize:7,fontWeight:700,color:P.muted,marginTop:2,letterSpacing:"0.04em"}}>{u.fileTypeLabel||"FILE"}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.text,
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:2}}>{u.name}</div>
                    <div style={S.row10}>
                      <span style={S.mut9}>{u.size}</span>
                      <span style={S.mut9}>·</span>
                      <span style={S.mut9}>{u.date}</span>
                    </div>
                  </div>
                  <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:99,
                    background:barClr+"14",border:`1px solid ${barClr}33`}}>
                    {pct<100&&<div style={{width:6,height:6,borderRadius:"50%",background:barClr,
                      animation:"pulse 1s infinite"}}/>}
                    {pct===100&&<span style={{fontSize:10}}>✓</span>}
                    <span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:barClr}}>{u.progressStep||"Queued"}</span>
                  </div>
                </div>
                <div style={{position:"relative",height:6,borderRadius:3,background:P.panel,overflow:"hidden",marginBottom:6}}>
                  <div style={{
                    position:"absolute",left:0,top:0,height:"100%",borderRadius:3,
                    background:`linear-gradient(to right, ${barClr}cc, ${barClr})`,
                    width:`${pct}%`,
                    transition:"width 0.6s ease",
                  }}/>
                  {pct>0&&pct<100&&(
                    <div style={{
                      position:"absolute",top:0,left:`${pct-15}%`,
                      width:"15%",height:"100%",
                      background:"linear-gradient(to right, transparent, rgba(255,255,255,0.35), transparent)",
                      animation:"shimmer 1.4s ease-in-out infinite",
                    }}/>
                  )}
                </div>
                <div style={S.rowsb}>
                  <span style={{fontFamily:FF.s,fontSize:8.5,color:P.muted}}>{u.progressStep||"Waiting…"}</span>
                  <span style={{fontFamily:FF.m,fontSize:9,fontWeight:600,color:barClr}}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {uploads.filter(u=>u.status!=="analyzing").map(u=>(
        <div key={u.id} style={CS()}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${P.border}`}}>
            <span style={{fontSize:24,flexShrink:0}}>{u.result?docTypeIcon(u.result.docType):"📄"}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                <div style={{fontFamily:FF.s,fontSize:12,fontWeight:600,color:P.text,marginBottom:2}}>{u.name}</div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  {u.result?.docType&&u.result.docType!=="other"&&(
                    <span style={{fontFamily:FF.s,fontSize:8,fontWeight:700,padding:"3px 8px",borderRadius:4,
                      background:P.accent+"18",color:P.accent,letterSpacing:"0.06em",textTransform:"uppercase"}}>
                      {docTypeLabel(u.result.docType)}
                    </span>
                  )}
                  <span style={{padding:"3px 10px",borderRadius:99,fontFamily:FF.s,fontSize:9,fontWeight:700,
                    background:statusColor(u.status)+"18",color:statusColor(u.status),
                    border:`1px solid ${statusColor(u.status)}44`}}>
                    {statusLabel(u.status)}
                  </span>
                </div>
              </div>
              <div style={S.mut9}>{u.size} · {u.date}{u.result?.docDate?` · Scan date: ${u.result.docDate}`:""}</div>
              {u.result?.summary&&<div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.65,marginTop:6}}>{u.result.summary}</div>}
            </div>
          </div>
          {u.result?.biomarkers?.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:9}}>Biomarkers · {u.result.biomarkers.length} detected</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7}}>
                {u.result.biomarkers.map((b,i)=>{
                  const sc = b.status==="high"?P.terra:b.status==="low"?P.amber:P.sage;
                  return(
                    <div key={i} style={{padding:"9px 11px",borderRadius:9,
                      background:sc+"10",border:`1px solid ${sc}28`}}>
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4}}>{b.name}</div>
                      <div style={{fontFamily:FF.m,fontSize:13,fontWeight:600,color:sc,lineHeight:1}}>{b.value}<span style={{fontSize:9,color:P.muted,marginLeft:3,fontWeight:400}}>{b.unit}</span></div>
                      {b.range&&<div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:3}}>Ref: {b.range}</div>}
                      {b.status!=="normal"&&b.status!=="unknown"&&(
                        <div style={{fontFamily:FF.s,fontSize:7.5,fontWeight:700,color:sc,marginTop:3,letterSpacing:"0.06em"}}>{b.status==="high"?"↑ HIGH":"↓ LOW"}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {u.result?.whoopData&&Object.values(u.result.whoopData).some(v=>v!==null)&&(
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:9}}>WHOOP Metrics</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[
                  {label:"Recovery",key:"recovery",unit:"%",color:P.sage},
                  {label:"HRV",key:"hrv",unit:"ms",color:P.steel},
                  {label:"RHR",key:"rhr",unit:"bpm",color:P.terra},
                  {label:"Strain",key:"strain",unit:"",color:P.amber},
                  {label:"Sleep",key:"sleepScore",unit:"%",color:"#7A5A80"},
                  {label:"Sleep hrs",key:"sleepHours",unit:"h",color:P.steel},
                ].filter(f=>u.result.whoopData[f.key]!==null).map(f=>(
                  <div key={f.key} style={{padding:"9px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`,minWidth:80}}>
                    <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{f.label}</div>
                    <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:f.color,lineHeight:1}}>{u.result.whoopData[f.key]}<span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:2}}>{f.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {u.result?.bodyComp&&Object.values(u.result.bodyComp).some(v=>v!==null&&v!=="")&&(
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:9}}>
                Body Composition {u.result.bodyComp.source&&`· ${u.result.bodyComp.source}`}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[
                  {label:"Weight",key:"weight",unit:"lbs",color:P.steel},
                  {label:"Body Fat",key:"bodyFatPct",unit:"%",color:P.terra},
                  {label:"Lean Mass",key:"leanMassLbs",unit:"lbs",color:P.sage},
                  {label:"Fat Mass",key:"fatMassLbs",unit:"lbs",color:P.amber},
                  {label:"BMI",key:"bmi",unit:"",color:P.muted},
                ].filter(f=>u.result.bodyComp[f.key]!==null).map(f=>(
                  <div key={f.key} style={{padding:"9px 12px",borderRadius:9,background:P.panel,border:`1px solid ${P.border}`,minWidth:80}}>
                    <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{f.label}</div>
                    <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:f.color,lineHeight:1}}>{u.result.bodyComp[f.key]}<span style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:2}}>{f.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(u.result?.insights?.length>0||u.result?.recommendations?.length>0)&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:14}}>
              {u.result?.insights?.length>0&&(
                <div>
                  <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:7}}>Clinical Insights</div>
                  {u.result.insights.map((ins,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:5}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:P.sage,flexShrink:0,marginTop:4}}/>
                      <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>{ins}</div>
                    </div>
                  ))}
                </div>
              )}
              {u.result?.recommendations?.length>0&&(
                <div>
                  <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,letterSpacing:"0.10em",textTransform:"uppercase",color:P.muted,marginBottom:7}}>Recommendations</div>
                  {u.result.recommendations.map((rec,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:5}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:P.amber,flexShrink:0,marginTop:4}}/>
                      <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>{rec}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {u.result?.dataUpdates?.description&&(
            <div style={{padding:"10px 13px",background:P.accent+"10",borderRadius:9,border:`1px solid ${P.accent}30`}}>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:P.accent,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Dashboard Update</div>
              <div style={{fontFamily:FF.s,fontSize:10,color:P.sub,lineHeight:1.6}}>{u.result.dataUpdates.description}</div>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:6}}>
                To apply: share the extracted values with Claude and ask to update the relevant data constants in the source file.
              </div>
            </div>
          )}
        </div>
      ))}

    </>)}
    {activeTab==="peloton"&&(
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"linear-gradient(135deg,#E60000,#C40000)",borderRadius:14,
          padding:"20px 22px",display:"flex",alignItems:"center",gap:18}}>
          <div style={{width:48,height:48,borderRadius:12,background:"rgba(255,255,255,0.15)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🚴</div>
          <div>
            <div style={{fontFamily:FF.r,fontWeight:700,fontSize:18,color:"#fff"}}>Import Peloton Data</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:"rgba(255,255,255,0.85)",marginTop:3,lineHeight:1.6}}>
              Go to <strong>members.onepeloton.com/profile/workouts</strong> → click <strong>"Download Workouts"</strong> (top right) → drop the CSV into the Upload tab.
            </div>
          </div>
        </div>
        <div style={CS(12,"16px 18px","none")}>
          <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.text,marginBottom:12}}>How to export</div>
          {[
            {n:1, text:"Sign in at members.onepeloton.com"},
            {n:2, text:'Click "Workouts" tab in your profile'},
            {n:3, text:'Hit "Download Workouts" button — top right corner'},
            {n:4, text:"Drag the downloaded CSV into the Upload tab above"},
          ].map(({n,text})=>(
            <div key={n} style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"#E6000018",border:"1px solid #E6000044",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:FF.m,fontSize:10,fontWeight:700,color:"#E60000",flexShrink:0}}>{n}</div>
              <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6,paddingTop:1}}>{text}</div>
            </div>
          ))}
          <a href="https://members.onepeloton.com/profile/workouts" target="_blank"
            style={{display:"inline-block",marginTop:4,fontFamily:FF.s,fontSize:11,fontWeight:700,
              padding:"8px 18px",borderRadius:8,background:"#E60000",color:"#fff",textDecoration:"none"}}>
            Open Peloton Profile →
          </a>
        </div>
        <div style={CS(12,"16px 18px","none")}>
          <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.text,marginBottom:10}}>What's in the CSV</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
            {[
              {icon:"📅",label:"Date & Time"},
              {icon:"🏷",label:"Class Title & Instructor"},
              {icon:"⚡",label:"Total Output (kJ)"},
              {icon:"🔋",label:"Avg & Max Watts"},
              {icon:"🔄",label:"Cadence (RPM)"},
              {icon:"💪",label:"Resistance %"},
              {icon:"🚀",label:"Speed (mph)"},
              {icon:"📍",label:"Distance (mi)"},
              {icon:"🔥",label:"Calories Burned"},
              {icon:"❤",label:"Avg & Max HR"},
              {icon:"⏱",label:"Duration (min)"},
              {icon:"👟",label:"Fitness Discipline"},
            ].map(({icon,label})=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",
                background:P.panel,borderRadius:8,border:`1px solid ${P.border}`}}>
                <span style={{fontSize:14}}>{icon}</span>
                <span style={{fontFamily:FF.s,fontSize:9,color:P.sub,fontWeight:500}}>{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    )}

    {activeTab==="history"&&(
      <div style={CS()}>
        {uploads.length===0?(
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:40,marginBottom:12}}>📂</div>
            <div style={{fontFamily:FF.s,fontSize:13,fontWeight:600,color:P.text,marginBottom:6}}>No uploads yet</div>
            <div style={{fontFamily:FF.s,fontSize:11,color:P.muted}}>Uploads appear here after analysis</div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:P.muted,letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:4}}>
              {uploads.length} document{uploads.length!==1?"s":""} this session
            </div>
            {uploads.map(u=>(
              <div key={u.id} onClick={()=>setActiveTab("upload")}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",
                  borderRadius:10,background:P.panel,border:`1px solid ${P.border}`,cursor:"pointer",
                  transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=P.card}
                onMouseLeave={e=>e.currentTarget.style.background=P.panel}>
                <span style={{fontSize:18,flexShrink:0}}>{u.result?docTypeIcon(u.result.docType):"📄"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:FF.s,fontSize:11,fontWeight:500,color:P.text,
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{u.name}</div>
                  <div style={S.mut9}>{u.date} · {u.size}</div>
                </div>
                <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,
                  color:statusColor(u.status),background:statusColor(u.status)+"18",
                  padding:"2px 8px",borderRadius:4,flexShrink:0}}>{statusLabel(u.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    <div style={CS()}>
      <SLabel color={P.steel}>Apple Health export.xml (large file)</SLabel>
      <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginTop:-8,marginBottom:14,lineHeight:1.6}}>
        Apple Health exports are typically 2–8 GB — too large for the browser. Use the Python script to extract Hume body comp data on your Mac, then drag the resulting CSV above.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
        {[
          {icon:"1",title:"Connect Hume → Apple Health",body:"Hume app → Settings → Connected Apps → Apple Health → enable Body Fat %, Lean Body Mass, Body Mass"},
          {icon:"2",title:"Export from Apple Health",body:"Apple Health → Profile (top right) → Export All Health Data → share the ZIP to your Mac"},
          {icon:"3",title:"Run the Python extractor",body:"Terminal: python3 extract_hume.py ~/Downloads/apple_health_export/export.xml"},
          {icon:"4",title:"Upload hume_body_comp.csv",body:"Drag the output CSV into the dropzone above — Claude will parse and summarize all scan dates"},
        ].map(({icon,title,body})=>(
          <div key={icon} style={{display:"flex",gap:12,padding:"11px 13px",borderRadius:10,background:P.panel,border:`1px solid ${P.border}`}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:P.steel,display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:FF.m,fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>{icon}</div>
            <div>
              <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text,marginBottom:3}}>{title}</div>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.6}}>{body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>);
}
// Tracks the draw date for every tracked biomarker.
// Drives the "Lab Freshness" alerts on the Goals page and Labs page.
const LAB_FRESHNESS = [
  // Cardiovascular — Jan 15 2026
  {name:"Triglycerides",      date:"2026-01-15", panel:"Lipids",      targetDays:180, status:"ok"},
  {name:"HDL Cholesterol",    date:"2026-01-15", panel:"Lipids",      targetDays:180, status:"ok"},
  {name:"LDL",                date:"2026-01-15", panel:"Lipids",      targetDays:180, status:"ok"},
  {name:"Chol/HDL Ratio",     date:"2026-01-15", panel:"Lipids",      targetDays:180, status:"ok"},
  {name:"Total Cholesterol",  date:"2026-01-15", panel:"Lipids",      targetDays:180, status:"ok"},
 
  {name:"ApoB",               date:"2025-05-23", panel:"Lipids",      targetDays:180, status:"overdue"},
  {name:"CRP-Cardiac",        date:"2025-05-23", panel:"Inflammation", targetDays:180, status:"overdue"},
  {name:"Homocysteine",       date:"2025-05-23", panel:"Special",     targetDays:365, status:"due_soon"},
  // Metabolic — Jan 2026
  {name:"Glucose",            date:"2026-01-15", panel:"Metabolic",   targetDays:180, status:"ok"},
  {name:"BUN",                date:"2026-01-15", panel:"Metabolic",   targetDays:365, status:"ok"},
  {name:"Creatinine",         date:"2026-01-15", panel:"Metabolic",   targetDays:365, status:"ok"},
  {name:"ALT",                date:"2026-01-15", panel:"Liver",       targetDays:365, status:"ok"},
  {name:"AST",                date:"2026-01-15", panel:"Liver",       targetDays:365, status:"ok"},
  {name:"GGT",                date:"2026-01-15", panel:"Liver",       targetDays:365, status:"ok"},
  // Metabolic — May 2025
  {name:"HbA1c",              date:"2025-05-23", panel:"Metabolic",   targetDays:180, status:"overdue"},
  {name:"eGFR",               date:"2025-05-23", panel:"Metabolic",   targetDays:365, status:"due_soon"},
  // Hormonal — May 2025
  {name:"Testosterone",       date:"2025-05-23", panel:"Hormones",    targetDays:180, status:"overdue"},
  {name:"Free Testosterone",  date:"2025-05-23", panel:"Hormones",    targetDays:180, status:"overdue"},
  {name:"DHEA-S",             date:"2025-05-23", panel:"Hormones",    targetDays:180, status:"overdue"},
  {name:"TSH",                date:"2025-05-23", panel:"Hormones",    targetDays:365, status:"due_soon"},
  {name:"Vitamin D",          date:"2025-05-23", panel:"Hormones",    targetDays:180, status:"overdue"},
  {name:"Estradiol",          date:"2025-05-23", panel:"Hormones",    targetDays:365, status:"due_soon"},
  {name:"Cortisol",           date:"2025-05-23", panel:"Hormones",    targetDays:365, status:"due_soon"},
  {name:"SHBG",               date:"2025-05-23", panel:"Hormones",    targetDays:365, status:"due_soon"},
  // Special / Longevity — May 2025
  {name:"Ferritin",           date:"2025-05-23", panel:"Special",     targetDays:180, status:"overdue"},
  {name:"PSA",                date:"2025-05-23", panel:"Special",     targetDays:365, status:"due_soon"},
];

// Compute days since last draw
const TODAY_DATE = new Date("2026-03-23");
LAB_FRESHNESS.forEach(b => {
  b.daysSince = Math.floor((TODAY_DATE - new Date(b.date)) / 86400000);
  b.daysUntilDue = b.targetDays - b.daysSince;
  b.pctFresh = Math.max(0, Math.min(100, Math.round((1 - b.daysSince/b.targetDays)*100)));
  if(b.daysSince > b.targetDays) b.status = "overdue";
  else if(b.daysSince > b.targetDays * 0.75) b.status = "due_soon";
  else b.status = "ok";
});

const LAB_OVERDUE   = LAB_FRESHNESS.filter(b=>b.status==="overdue");
const LAB_DUE_SOON  = LAB_FRESHNESS.filter(b=>b.status==="due_soon");

function PelotonPage(){
  const [peloData, setPeloData] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem("vital_peloton_v1")||"[]"); }catch(e){ return []; }
  });
  const [filter,   setFilter]   = useState("all");
  const [sortBy,   setSortBy]   = useState("date");
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);

  const DISCIPLINE_META = {
    cycling:    {icon:"🚴",color:"#E60000",label:"Cycling"},
    running:    {icon:"🏃",color:"#C47830",label:"Running"},
    strength:   {icon:"🏋",color:"#3A5C48",label:"Strength"},
    stretching: {icon:"🧘",color:"#7A5A80",label:"Stretching"},
    yoga:       {icon:"🧘",color:"#7A5A80",label:"Yoga"},
    meditation: {icon:"🧠",color:"#4A6070",label:"Meditation"},
    cardio:     {icon:"⚡",color:"#C4604A",label:"Cardio"},
    walking:    {icon:"🚶",color:"#6B6057",label:"Walking"},
    other:      {icon:"⚡",color:"#6B6057",label:"Other"},
  };

  const getMeta = (disc="") => {
    const key = disc.toLowerCase().trim();
    return DISCIPLINE_META[key] || DISCIPLINE_META.other;
  };

  const filtered = peloData.filter(w=>{
    if(filter!=="all" && (w.discipline||"").toLowerCase()!==filter) return false;
    if(search){
      const q = search.toLowerCase();
      if(!(w.title||"").toLowerCase().includes(q) &&
         !(w.instructor||"").toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a,b)=>{
    if(sortBy==="output")    return (b.output||0)-(a.output||0);
    if(sortBy==="calories")  return (b.calories||0)-(a.calories||0);
    if(sortBy==="hr")        return (b.avgHR||0)-(a.avgHR||0);
    if(sortBy==="duration")  return (b.duration||0)-(a.duration||0);
    return (b.dateKey||"").localeCompare(a.dateKey||"");
  });

 
  const hasData = peloData.length > 0;
  const cyclingWorks = peloData.filter(w=>(w.discipline||"").toLowerCase()==="cycling");
  const totalOutput  = cyclingWorks.reduce((s,w)=>s+(w.output||0),0);
  const avgOutput    = cyclingWorks.length ? Math.round(totalOutput/cyclingWorks.length) : 0;
  const totalCal     = peloData.reduce((s,w)=>s+(w.calories||0),0);
  const totalDur     = peloData.reduce((s,w)=>s+(w.duration||0),0);
  const avgHR        = peloData.filter(w=>w.avgHR>0);
  const avgHRVal     = avgHR.length ? Math.round(avgHR.reduce((s,w)=>s+w.avgHR,0)/avgHR.length) : 0;

  // By discipline
  const byDisc = peloData.reduce((acc,w)=>{
    const k=(w.discipline||"other").toLowerCase();
    if(!acc[k]) acc[k]={count:0,cal:0,dur:0};
    acc[k].count++; acc[k].cal+=w.calories||0; acc[k].dur+=w.duration||0;
    return acc;
  },{});

  const fmtDate = (dateKey="") => {
    if(!dateKey) return "—";
    const d = new Date(dateKey+"T12:00:00");
    return isNaN(d)?dateKey:d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"});
  };
  const fmtDur = (mins) => mins>=60?`${Math.floor(mins/60)}h ${mins%60}m`:`${mins}m`;

  return(<div style={S.col16}>
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:"#E60000",letterSpacing:"0.12em",
          textTransform:"uppercase",marginBottom:3,fontWeight:600}}>Peloton · Separate data layer</div>
        <div style={S.h18}>Peloton Workouts</div>
      </div>
      <div style={{display:"flex",gap:6}}>
        {hasData&&(
          <button onClick={()=>{ if(window.confirm("Clear all Peloton data?")){ localStorage.removeItem("vital_peloton_v1"); setPeloData([]); }}}
            style={{fontFamily:FF.s,fontSize:9,padding:"4px 10px",borderRadius:6,
              border:`1px solid ${P.border}`,background:P.panel,color:P.muted,cursor:"pointer"}}>
            Clear data
          </button>
        )}
      </div>
    </div>
    {!hasData&&(
      <div style={{background:P.card,border:`1.5px dashed ${P.border}`,borderRadius:16,
        padding:"48px 32px",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>🚴</div>
        <div style={{fontFamily:FF.r,fontSize:16,fontWeight:600,color:P.text,marginBottom:6}}>No Peloton data yet</div>
        <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,maxWidth:380,margin:"0 auto",lineHeight:1.8,marginBottom:16}}>
          Sign in at <strong>members.onepeloton.com</strong> → Workouts → <strong>"Download Workouts"</strong> → drag the CSV into Import Data → Peloton tab.
        </div>
        <a href="https://members.onepeloton.com/profile/workouts" target="_blank"
          style={{fontFamily:FF.s,fontSize:11,fontWeight:700,padding:"9px 20px",borderRadius:8,
            background:"#E60000",color:"#fff",textDecoration:"none",display:"inline-block"}}>
          Open Peloton →
        </a>
      </div>
    )}

    {hasData&&(<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12}}>
        {[
          {icon:"🚴",label:"Total Workouts",  val:peloData.length,        color:"#E60000", sub:`${cyclingWorks.length} cycling`},
          {icon:"⚡",label:"Total Output",    val:totalOutput>0?`${totalOutput.toLocaleString()} kJ`:"—", color:P.amber, sub:`${avgOutput} kJ avg/ride`},
          {icon:"⏱",label:"Total Time",      val:fmtDur(totalDur),       color:P.sage,   sub:`${Math.round(totalDur/peloData.length)}m avg`},
          {icon:"🔥",label:"Calories",        val:totalCal.toLocaleString(),color:P.terra, sub:`${Math.round(totalCal/peloData.length)}/session`},
          {icon:"❤",label:"Avg Heart Rate",  val:avgHRVal>0?`${avgHRVal} bpm`:"—", color:P.coral, sub:"across all sessions"},
        ].map(({icon,label,val,color,sub})=>(
          <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,
            padding:"12px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
            <div style={{fontSize:16,marginBottom:6}}>{icon}</div>
            <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,lineHeight:1,marginBottom:2,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"-0.01em"}}>{val}</div>
            <div style={S.sub9}>{label}</div>
            <div style={S.mut8}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={CS(14,"16px 18px","none")}>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:12}}>Workout Mix</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
          {Object.entries(byDisc).sort((a,b)=>b[1].count-a[1].count).map(([disc,stats])=>{
            const meta = getMeta(disc);
            const isActive = filter===disc;
            return(
              <div key={disc}
                onClick={()=>setFilter(f=>f===disc?"all":disc)}
                style={{padding:"10px 12px",background:P.panel,borderRadius:10,cursor:"pointer",
                  border:`1.5px solid ${isActive?meta.color:P.border}`,
                  background:isActive?meta.color+"08":P.panel,transition:"all .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <span style={{fontSize:16}}>{meta.icon}</span>
                  <span style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.text}}>{meta.label}</span>
                </div>
                <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:meta.color}}>{stats.count}</div>
                <div style={S.mut8}>
                  {fmtDur(Math.round(stats.dur/stats.count))} avg
                  {stats.cal>0?` · ${Math.round(stats.cal/stats.count)} cal`:""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search title or instructor…"
          style={{flex:1,minWidth:140,padding:"8px 12px",borderRadius:8,border:`1px solid ${P.border}`,
            fontFamily:FF.s,fontSize:11,background:P.card,color:P.text,outline:"none"}}/>
        <div style={{display:"flex",gap:5}}>
          {[
            {id:"date",label:"Date"},
            {id:"output",label:"Output"},
            {id:"calories",label:"Cal"},
            {id:"hr",label:"HR"},
            {id:"duration",label:"Time"},
          ].map(s=>(
            <button key={s.id} onClick={()=>setSortBy(s.id)}
              style={{fontFamily:FF.s,fontSize:10,fontWeight:600,padding:"5px 11px",borderRadius:7,
                border:`1px solid ${sortBy===s.id?"#E60000":P.border}`,
                background:sortBy===s.id?"#E6000012":P.card,
                color:sortBy===s.id?"#E60000":P.muted,cursor:"pointer"}}>
              {s.label}
            </button>
          ))}
        </div>
        {filter!=="all"&&(
          <button onClick={()=>setFilter("all")}
            style={{fontFamily:FF.s,fontSize:10,padding:"5px 10px",borderRadius:7,
              border:`1px solid ${P.border}`,background:P.panel,color:P.muted,cursor:"pointer"}}>
            Clear ✕
          </button>
        )}
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginLeft:"auto"}}>
          {filtered.length} of {peloData.length}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filtered.slice(0,100).map((w,i)=>{
          const meta = getMeta(w.discipline);
          const isExp = expanded===i;
          return(
            <div key={i}
              style={{background:P.card,border:`1px solid ${isExp?meta.color+"55":P.border}`,
                borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"border-color .15s"}}
              onClick={()=>setExpanded(isExp?null:i)}>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px"}}>
                <div style={{width:36,height:36,borderRadius:9,background:meta.color+"14",
                  border:`1px solid ${meta.color}30`,display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:18,flexShrink:0}}>{meta.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:FF.s,fontSize:11,fontWeight:700,color:P.text,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.title||meta.label}</div>
                  <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:1}}>
                    {fmtDate(w.dateKey)}{w.instructor?` · ${w.instructor}`:""}{w.duration?` · ${w.duration}min`:""}
                  </div>
                </div>
                <div style={{display:"flex",gap:12,flexShrink:0,alignItems:"center"}}>
                  {w.output>0&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color:P.amber}}>{w.output}</div>
                      <div style={S.mut8}>kJ</div>
                    </div>
                  )}
                  {w.calories>0&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color:P.terra}}>{w.calories}</div>
                      <div style={S.mut8}>cal</div>
                    </div>
                  )}
                  {w.avgHR>0&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:FF.r,fontSize:15,fontWeight:600,color:"#E60000"}}>{w.avgHR}</div>
                      <div style={S.mut8}>bpm</div>
                    </div>
                  )}
                  <span style={{fontFamily:FF.s,fontSize:10,color:P.muted,opacity:0.5}}>{isExp?"▲":"▼"}</span>
                </div>
              </div>
              {isExp&&(
                <div style={{borderTop:`1px solid ${P.border}`,padding:"10px 14px",background:P.panel,
                  display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}}>
                  {[
                    {label:"Output",      val:w.output>0?`${w.output} kJ`:"—"},
                    {label:"Avg Watts",   val:w.avgWatts>0?`${w.avgWatts}w`:"—"},
                    {label:"Max Watts",   val:w.maxWatts>0?`${w.maxWatts}w`:"—"},
                    {label:"Avg Cadence", val:w.avgCadence>0?`${w.avgCadence} rpm`:"—"},
                    {label:"Avg Resist",  val:w.avgResistance>0?`${w.avgResistance}%`:"—"},
                    {label:"Avg Speed",   val:w.avgSpeed>0?`${w.avgSpeed} mph`:"—"},
                    {label:"Distance",    val:w.distance>0?`${w.distance.toFixed(2)} mi`:"—"},
                    {label:"Avg HR",      val:w.avgHR>0?`${w.avgHR} bpm`:"—"},
                    {label:"Max HR",      val:w.maxHR>0?`${w.maxHR} bpm`:"—"},
                    {label:"Calories",    val:w.calories>0?`${w.calories} kcal`:"—"},
                    {label:"Duration",    val:w.duration>0?`${w.duration} min`:"—"},
                    {label:"Instructor",  val:w.instructor||"—"},
                  ].map(({label,val})=>(
                    <div key={label}>
                      <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,textTransform:"uppercase",
                        letterSpacing:"0.06em",marginBottom:2}}>{label}</div>
                      <div style={{fontFamily:FF.m,fontSize:10,color:P.text}}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length>100&&(
          <div style={{fontFamily:FF.s,fontSize:10,color:P.muted,textAlign:"center",padding:12}}>
            Showing 100 of {filtered.length} — use search or filter
          </div>
        )}
      </div>

    </>)}

  </div>);
}

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

function SupplementsPage(){
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

function GoalsPage(){
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
// Running: based on WMA age-grading factors + USATF standards for M45-49
// Lifting: based on ExRx strength standards for 200-215 lb male (age-adjusted -15% from open)
// Score = 0-100 where 100 = world-class age-group performance

function scoreRunning(eventKey, timeStr) {
  if (!timeStr || timeStr.trim() === "") return null;
  // Parse time string: mm:ss or h:mm:ss
  const parts = timeStr.split(":").map(Number);
  let secs = 0;
  if (parts.length === 2) secs = parts[0]*60 + parts[1];
  else if (parts.length === 3) secs = parts[0]*3600 + parts[1]*60 + parts[2];
  else return null;
  if (isNaN(secs) || secs <= 0) return null;

  // [worldClass, excellent, good, average, belowAvg] in seconds for 47yo male
  const BENCHMARKS = {
    mile:   [268, 330, 390, 480, 600],        // 4:28, 5:30, 6:30, 8:00, 10:00
    fiveK:  [960, 1170, 1380, 1680, 2100],    // 16:00, 19:30, 23:00, 28:00, 35:00
    tenK:   [1980, 2430, 2880, 3480, 4320],   // 33:00, 40:30, 48:00, 58:00, 72:00
    halfM:  [4500, 5400, 6300, 7800, 9600],   // 1:15, 1:30, 1:45, 2:10, 2:40
  };
  const b = BENCHMARKS[eventKey];
  if (!b) return null;
  const [wc, exc, good, avg, bad] = b;
  // Lower time = better for running
  if (secs <= wc)  return 97;
  if (secs <= exc) return Math.round(80 + (exc-secs)/(exc-wc)*17);
  if (secs <= good)return Math.round(60 + (good-secs)/(good-exc)*20);
  if (secs <= avg) return Math.round(40 + (avg-secs)/(avg-good)*20);
  if (secs <= bad) return Math.round(20 + (bad-secs)/(bad-avg)*20);
  return Math.max(5, Math.round(15 - (secs-bad)/60*2));
}

function scoreLifting(eventKey, weightLbs, bodyweightLbs) {
  if (!weightLbs || weightLbs <= 0) return null;
  const bw = bodyweightLbs || 213;
  const ratio = weightLbs / bw;

 
  // [worldClass, excellent, good, average, belowAvg] as bodyweight multiples
  const BENCHMARKS = {
    bench:    [1.55, 1.30, 1.05, 0.80, 0.55],
    squat:    [2.10, 1.75, 1.40, 1.05, 0.75],
    deadlift: [2.55, 2.10, 1.70, 1.30, 0.95],
  };
  const b = BENCHMARKS[eventKey];
  if (!b) return null;
  const [wc, exc, good, avg, bad] = b;
  // Higher ratio = better for lifting
  if (ratio >= wc)  return 97;
  if (ratio >= exc) return Math.round(80 + (ratio-exc)/(wc-exc)*17);
  if (ratio >= good)return Math.round(60 + (ratio-good)/(exc-good)*20);
  if (ratio >= avg) return Math.round(40 + (ratio-avg)/(good-avg)*20);
  if (ratio >= bad) return Math.round(20 + (ratio-bad)/(avg-bad)*20);
  return Math.max(5, Math.round(15 * (ratio/bad)));
}

function formatRunTime(secs) {
  if (!secs) return "";
  const h = Math.floor(secs/3600);
  const m = Math.floor((secs%3600)/60);
  const s = secs%60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${m}:${String(s).padStart(2,"0")}`;
}

function pbLabel(score) {
  if (!score) return {label:"—",color:"#999"};
  if (score >= 90) return {label:"World Class",color:"#5BC4F0"};
  if (score >= 80) return {label:"Elite",      color:"#3A9C68"};
  if (score >= 65) return {label:"Excellent",  color:"#3A9C68"};
  if (score >= 50) return {label:"Good",       color:"#C47830"};
  if (score >= 35) return {label:"Average",    color:"#C4604A"};
  return               {label:"Developing",   color:"#8B3A3A"};
}

const STORAGE_KEY = "vital_pbs_v1";

function ProgressPage({setPage}){
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

function PersonalBestsPage({setPage}) {

  const loadSaved = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };

  const [bests,   setBests]   = useState(loadSaved);
  const [goals,   setGoals]   = useState(()=>{
    try{ const r=localStorage.getItem(STORAGE_KEY+"_goals"); return r?JSON.parse(r):{}; }catch{ return {}; }
  });
  const [editing,    setEditing]    = useState(null);
  const [editVal,    setEditVal]    = useState("");
  const [goalEdit,   setGoalEdit]   = useState(null);   // key with goal slider open
  const [goalDraft,  setGoalDraft]  = useState("");
  const bodyweight = HUME_DATA[0]?.wt || 213;

  const save = (key, val) => {
    const next = {...bests, [key]: val};
    setBests(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setEditing(null);
    setEditVal("");
  };

  const RUNNING_EVENTS = [
    { key:"mile",  label:"Mile",          placeholder:"5:45",  hint:"mm:ss",      icon:"🏃" },
    { key:"fiveK", label:"5K",            placeholder:"23:30", hint:"mm:ss",      icon:"🏃" },
    { key:"tenK",  label:"10K",           placeholder:"49:00", hint:"mm:ss",      icon:"🏃" },
    { key:"halfM", label:"Half Marathon", placeholder:"1:50:00",hint:"h:mm:ss",   icon:"🏃" },
  ];

  const LIFTING_EVENTS = [
    { key:"bench",    label:"Bench Press", placeholder:"185",  hint:"lbs", icon:"🏋" },
    { key:"squat",    label:"Back Squat",  placeholder:"225",  hint:"lbs", icon:"🏋" },
    { key:"deadlift", label:"Deadlift",    placeholder:"275",  hint:"lbs", icon:"🏋" },
  ];

  // Compute scores
  const scores = {};
  RUNNING_EVENTS.forEach(e => {
    scores[e.key] = bests[e.key] ? scoreRunning(e.key, bests[e.key]) : null;
  });
  LIFTING_EVENTS.forEach(e => {
    const lbs = parseFloat(bests[e.key]);
    scores[e.key] = lbs > 0 ? scoreLifting(e.key, lbs, bodyweight) : null;
  });

  const validScores = Object.values(scores).filter(s => s !== null);
  const overallScore = validScores.length > 0
    ? Math.round(validScores.reduce((a,b)=>a+b,0)/validScores.length)
    : null;

  // Arc ring for overall score
  const ARC_R = 44, ARC_C = 2*Math.PI*ARC_R;
  const arcDash = overallScore ? ARC_C*(overallScore/100) : 0;
  const arcCol = overallScore ? (overallScore>=80?P.sage:overallScore>=60?P.amber:P.terra) : P.border;

  // Benchmark rows for tooltip reference
  const RUNNING_REFS = {
    mile:  [{l:"World class",t:"4:28"},{l:"Excellent",t:"5:30"},{l:"Good",t:"6:30"},{l:"Average",t:"8:00"}],
    fiveK: [{l:"World class",t:"16:00"},{l:"Excellent",t:"19:30"},{l:"Good",t:"23:00"},{l:"Average",t:"28:00"}],
    tenK:  [{l:"World class",t:"33:00"},{l:"Excellent",t:"40:30"},{l:"Good",t:"48:00"},{l:"Average",t:"58:00"}],
    halfM: [{l:"World class",t:"1:15"},{l:"Excellent",t:"1:30"},{l:"Good",t:"1:45"},{l:"Average",t:"2:10"}],
  };
  const LIFTING_REFS = {
    bench:    [{l:"World class",t:"1.55× BW"},{l:"Excellent",t:"1.30×"},{l:"Good",t:"1.05×"},{l:"Average",t:"0.80×"}],
    squat:    [{l:"World class",t:"2.10× BW"},{l:"Excellent",t:"1.75×"},{l:"Good",t:"1.40×"},{l:"Average",t:"1.05×"}],
    deadlift: [{l:"World class",t:"2.55× BW"},{l:"Excellent",t:"2.10×"},{l:"Good",t:"1.70×"},{l:"Average",t:"1.30×"}],
  };

  const EventCard = ({event, isLifting}) => {
    const val    = bests[event.key] || "";
    const goal   = goals[event.key] || "";
    const score  = scores[event.key];
    const {label:sl, color:sc} = pbLabel(score);
    const isEdit     = editing  === event.key;
    const isGoalOpen = goalEdit === event.key;
    const refs   = isLifting ? LIFTING_REFS[event.key] : RUNNING_REFS[event.key];
    const bwMult = (isLifting && val) ? (parseFloat(val)/bodyweight).toFixed(2)+"× BW" : null;

    // Goal progress calculation
    const parseTime = s => { const p=s.split(":").map(Number); return p.length===2?p[0]*60+p[1]:p[0]*3600+p[1]*60+p[2]; };
    const goalPct = (() => {
      if(!goal || !val) return null;
      if(isLifting){
        const cur=parseFloat(val), tgt=parseFloat(goal);
        if(!cur||!tgt) return null;
        return Math.min(100, Math.round((cur/tgt)*100));
      } else {
        // Running: lower is better
        try{
          const cur=parseTime(val), tgt=parseTime(goal);
          if(!cur||!tgt) return null;
          // pct = how close cur is to tgt — if cur <= tgt → 100%
          // scale: at 2× goal time = 0%, at goal time = 100%
          const pct = Math.min(100, Math.max(0, Math.round((1-(cur-tgt)/(tgt))*100)));
          return cur<=tgt ? 100 : pct;
        }catch{return null;}
      }
    })();
    // Slider config
    const sliderCfg = isLifting
      ? { min:45, max:500, step:5,   unit:"lbs",    fmt:(v)=>v+"lbs" }
      : { min:300,max:7200,step:15,  unit:"min:sec", fmt:(v)=>`${Math.floor(v/60)}:${String(v%60).padStart(2,"0")}` };

    return (
      <div style={{background:P.card,border:`1px solid ${score?sc+"44":P.border}`,borderRadius:14,
        padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,.05)",transition:"border-color .2s"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:32,height:32,borderRadius:9,background:score?sc+"14":P.panel,
              border:`1px solid ${score?sc+"30":P.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
              {event.icon}
            </div>
            <div>
              <div style={{fontFamily:FF.s,fontSize:12,fontWeight:700,color:P.text}}>{event.label}</div>
              <div style={S.mut8}>47yo male · age-graded</div>
            </div>
          </div>
          {score && (
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:FF.r,fontSize:28,fontWeight:600,color:sc,lineHeight:1,letterSpacing:"-0.02em"}}>{score}</div>
              <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:sc,marginTop:1}}>{sl}</div>
            </div>
          )}
        </div>

        {/* Progress bar — score if no goal, goal-progress if goal set */}
        {(score||goalPct!==null) && (
          <div style={{marginBottom:10}}>
            {goalPct!==null&&(
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <div style={{fontFamily:FF.s,fontSize:8,color:P.muted}}>Goal: <span style={{color:P.amber,fontWeight:600}}>{goal}{isLifting?" lbs":""}</span></div>
                <div style={{fontFamily:FF.s,fontSize:8,fontWeight:700,color:goalPct>=100?P.sage:P.amber}}>{goalPct>=100?"✓ Achieved!":goalPct+"%"}</div>
              </div>
            )}
            <div style={{height:5,borderRadius:3,background:P.panel,overflow:"hidden",border:`1px solid ${P.border}`}}>
              <div style={{height:"100%",
                width:`${goalPct!==null?goalPct:score}%`,
                background:`linear-gradient(to right,${goalPct!==null?(goalPct>=100?P.sage:P.amber)+"bb":(sc+"bb")},${goalPct!==null?(goalPct>=100?P.sage:P.amber):sc})`,
                borderRadius:3,transition:"width 0.8s cubic-bezier(0.34,1.1,0.64,1)"}}/>
            </div>
          </div>
        )}
        {isEdit ? (
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input
              autoFocus
              type="text"
              value={editVal}
              onChange={e=>setEditVal(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")save(event.key,editVal);if(e.key==="Escape"){setEditing(null);setEditVal("");}}}
              placeholder={event.placeholder}
              style={{flex:1,padding:"8px 12px",borderRadius:8,border:`2px solid ${P.amber}`,
                fontFamily:FF.m,fontSize:14,background:P.panel,color:P.text,outline:"none"}}
            />
            <button onClick={()=>save(event.key,editVal)}
              style={{padding:"8px 14px",borderRadius:8,border:"none",background:P.sage,
                color:"#fff",fontFamily:FF.s,fontSize:11,fontWeight:700,cursor:"pointer"}}>Save</button>
            <button onClick={()=>{setEditing(null);setEditVal("");}}
              style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${P.border}`,background:P.panel,
                color:P.muted,fontFamily:FF.s,fontSize:11,cursor:"pointer"}}>✕</button>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              {val ? (
                <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                  <div style={{fontFamily:FF.m,fontSize:22,fontWeight:600,color:score?sc:P.text,lineHeight:1}}>{val}</div>
                  <div style={S.mut10}>{isLifting?"lbs":""}</div>
                  {bwMult&&<div style={S.mut9}>{bwMult}</div>}
                </div>
              ) : (
                <div style={{fontFamily:FF.s,fontSize:11,color:P.muted,fontStyle:"italic"}}>Not logged yet</div>
              )}
            </div>
            <button onClick={()=>{setEditing(event.key);setEditVal(val);}}
              style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${P.border}`,
                background:P.panel,fontFamily:FF.s,fontSize:10,fontWeight:600,
                color:P.sub,cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=P.card;e.currentTarget.style.borderColor=P.amber;}}
              onMouseLeave={e=>{e.currentTarget.style.background=P.panel;e.currentTarget.style.borderColor=P.border;}}>
              {val?"Edit":"+ Log"}
            </button>
          </div>
        )}
        {/* Goal setter */}
        {isGoalOpen ? (
          <div style={{marginTop:10,padding:"12px 14px",background:P.panel,borderRadius:10,
            border:`1px solid ${P.amber}44`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>
                Set Goal {isLifting?"(lbs)":"(time)"}
              </div>
              <button onClick={()=>{setGoalEdit(null);setGoalDraft("");}}
                style={{background:"none",border:"none",cursor:"pointer",color:P.muted,fontSize:14}}>✕</button>
            </div>
            {isLifting ? (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={S.mut9}>Target weight</span>
                  <span style={{fontFamily:FF.m,fontSize:13,fontWeight:700,color:P.amber}}>
                    {goalDraft||sliderCfg.min} lbs
                  </span>
                </div>
                <input type="range"
                  min={sliderCfg.min} max={sliderCfg.max} step={sliderCfg.step}
                  value={goalDraft||sliderCfg.min}
                  onChange={e=>setGoalDraft(e.target.value)}
                  style={{width:"100%",accentColor:P.amber,cursor:"pointer"}}
                />
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={S.mut8}>{sliderCfg.min} lbs</span>
                  <span style={S.mut8}>{sliderCfg.max} lbs</span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={S.mut9}>Target time</span>
                  <span style={{fontFamily:FF.m,fontSize:13,fontWeight:700,color:P.amber}}>
                    {goalDraft?sliderCfg.fmt(Number(goalDraft)):"—"}
                  </span>
                </div>
                <input type="range"
                  min={sliderCfg.min} max={sliderCfg.max} step={sliderCfg.step}
                  value={goalDraft||(sliderCfg.min+sliderCfg.max)/2}
                  onChange={e=>setGoalDraft(e.target.value)}
                  style={{width:"100%",accentColor:P.amber,cursor:"pointer"}}
                />
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={S.mut8}>{sliderCfg.fmt(sliderCfg.min)}</span>
                  <span style={S.mut8}>{sliderCfg.fmt(sliderCfg.max)}</span>
                </div>
              </div>
            )}
            <button onClick={()=>saveGoal(event.key, isLifting?goalDraft:sliderCfg.fmt(Number(goalDraft)))}
              style={{marginTop:10,width:"100%",padding:"8px 0",borderRadius:8,border:"none",
                background:P.amber,color:"#fff",fontFamily:FF.s,fontSize:11,fontWeight:700,cursor:"pointer"}}>
              Set Goal
            </button>
            {goal&&<button onClick={()=>saveGoal(event.key,"")}
              style={{marginTop:6,width:"100%",padding:"6px 0",borderRadius:8,border:`1px solid ${P.border}`,
                background:"none",color:P.muted,fontFamily:FF.s,fontSize:10,cursor:"pointer"}}>
              Clear goal
            </button>}
          </div>
        ) : (
          <button onClick={()=>{setGoalEdit(event.key);setGoalDraft(
            isLifting&&goal?goal:(!isLifting&&goal?String(parseTime(goal)):"")
          );}}
            style={{marginTop:8,width:"100%",padding:"7px 0",borderRadius:8,
              border:`1px solid ${goal?P.amber+"44":P.border}`,
              background:goal?P.amber+"08":"none",color:goal?P.amber:P.muted,
              fontFamily:FF.s,fontSize:10,fontWeight:goal?700:400,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <span>{goal?"🎯":"+"}</span>
            {goal?`Goal: ${goal}${isLifting?" lbs":""}  · Edit`:"Set a goal"}
          </button>
        )}

        <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${P.border}`,
          display:"flex",gap:8,flexWrap:"wrap"}}>
          {refs.map(r=>(
            <div key={r.l} style={S.mut8}>
              <span style={{color:P.sub,fontWeight:600}}>{r.t}</span>
              <span style={{color:P.muted,marginLeft:2}}>{r.l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return(<div style={S.col18}>
    <div style={S.rowsbe}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          Age-graded · 47yo Male · {bodyweight} lbs
        </div>
        <div style={S.h18}>Personal Bests</div>
      </div>
      <div style={{fontFamily:FF.s,fontSize:9,color:"#FC4C02",fontWeight:600,padding:"5px 12px",borderRadius:6,
        background:"#FC4C0210",border:"1px solid #FC4C0244",cursor:"pointer"}}
        onClick={()=>typeof setPage==="function"&&setPage("import")}>
        🏆 Connect Strava →
      </div>
    </div>
    {overallScore && (
      <div style={{background:P.cardDk,border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"20px 24px",
        display:"flex",alignItems:"center",gap:24}}>
        <div style={{position:"relative",flexShrink:0}}>
          <svg width={100} height={100} style={{transform:"rotate(-90deg)"}}>
            <circle cx={50} cy={50} r={ARC_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7}/>
            <circle cx={50} cy={50} r={ARC_R} fill="none" stroke={arcCol} strokeWidth={7}
              strokeDasharray={`${arcDash} ${ARC_C-arcDash}`} strokeLinecap="round"
              style={{filter:`drop-shadow(0 0 8px ${arcCol}88)`,transition:"stroke-dasharray 1s ease"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:FF.r,fontSize:26,fontWeight:600,color:arcCol,lineHeight:1}}>{overallScore}</div>
            <div style={{fontFamily:FF.s,fontSize:8,color:P.mutedDk,marginTop:2}}>/ 100</div>
          </div>
        </div>
        <div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:6}}>
            Overall Performance Score
          </div>
          <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:arcCol,marginBottom:4}}>
            {pbLabel(overallScore).label}
          </div>
          <div style={{fontFamily:FF.s,fontSize:10,color:P.mutedDk,lineHeight:1.6,maxWidth:360}}>
            Composite across {validScores.length} logged {validScores.length===1?"event":"events"}.
            Scores are age-graded for a 47-year-old male — meaning an 80 here is 80th percentile for your age group, not open.
            {bests.bench&&` Lifting ratios based on ${bodyweight} lbs current bodyweight.`}
          </div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:12,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {[...RUNNING_EVENTS,...LIFTING_EVENTS].filter(e=>scores[e.key]!==null).map(e=>{
            const s=scores[e.key];const {color:c}=pbLabel(s);
            return(<div key={e.key} style={{textAlign:"center",minWidth:48}}>
              <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color:c,lineHeight:1}}>{s}</div>
              <div style={{fontFamily:FF.s,fontSize:7.5,color:P.mutedDk,marginTop:2}}>{e.label}</div>
            </div>);
          })}
        </div>
      </div>
    )}
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <div style={{width:3,height:14,borderRadius:2,background:P.amber}}/>
        <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.sub,letterSpacing:"0.10em",textTransform:"uppercase"}}>
          Running
        </div>
        <div style={S.divider}/>
        <div style={S.mut9}>
          WMA age-graded standards · M45-49
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {RUNNING_EVENTS.map(e=><EventCard key={e.key} event={e} isLifting={false}/>)}
      </div>
    </div>
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        <div style={{width:3,height:14,borderRadius:2,background:P.sage}}/>
        <div style={{fontFamily:FF.s,fontSize:10,fontWeight:700,color:P.sub,letterSpacing:"0.10em",textTransform:"uppercase"}}>
          Strength
        </div>
        <div style={S.divider}/>
        <div style={S.mut9}>
          ExRx age-adjusted standards · {bodyweight} lbs BW
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {LIFTING_EVENTS.map(e=><EventCard key={e.key} event={e} isLifting={true}/>)}
      </div>
    </div>
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"16px 18px",
      boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <SLabel color={P.steel}>Scoring Methodology</SLabel>
      <div style={S.g240}>
        <div>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text,marginBottom:8}}>Running — WMA Age-Graded</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[{l:"World Class",t:"90–100",c:"#5BC4F0"},{l:"Elite",t:"80–89",c:"#3A9C68"},{l:"Excellent",t:"65–79",c:"#3A9C68"},
              {l:"Good",t:"50–64",c:"#C47830"},{l:"Average",t:"35–49",c:"#C4604A"},{l:"Developing",t:"<35",c:"#8B3A3A"}].map(row=>(
              <div key={row.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"4px 10px",borderRadius:6,background:row.c+"10",border:`1px solid ${row.c}22`}}>
                <span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:row.c}}>{row.l}</span>
                <span style={{fontFamily:FF.m,fontSize:9,color:P.muted}}>{row.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontFamily:FF.s,fontSize:10,fontWeight:600,color:P.text,marginBottom:8}}>Lifting — Age-Adjusted Bodyweight Ratio</div>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,lineHeight:1.7}}>
            Standards based on ExRx.net strength norms, adjusted −15% for 45-50 age bracket vs open standards.
            Calculated as lifted weight ÷ bodyweight ({bodyweight} lbs current). Higher ratio = higher score.
          </div>
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
            {[
              {ev:"Bench",wc:"1.55×",gd:"1.05×",avg:"0.80×"},
              {ev:"Squat",wc:"2.10×",gd:"1.40×",avg:"1.05×"},
              {ev:"Deadlift",wc:"2.55×",gd:"1.70×",avg:"1.30×"},
            ].map(r=>(
              <div key={r.ev} style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.sub,width:52}}>{r.ev}</span>
                <span style={S.mut8}>Elite {r.wc}</span>
                <span style={S.mut8}>· Good {r.gd}</span>
                <span style={S.mut8}>· Avg {r.avg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  </div>);
}
// All numbers derived from 55 weeks WHOOP + 109 days CAL_DATA

function SleepPage(){
  const [range, setRange] = useState(16);
  const mob = useIsMobile();
  const ax = {tick:{fontFamily:FF.m,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};

  // Build daily data from CAL_DATA
  const dailyData = Object.entries(CAL_DATA)
    .filter(([,d])=>d.slp!=null&&d.sdur!=null)
    .sort(([a],[b])=>a.localeCompare(b))
    .map(([date,d])=>({
      d: date.slice(5),       // "MM-DD"
      date,
      score: d.slp,
      dur:   d.sdur,
      alc:   d.alc||0,
      rec:   d.rec||null,
    }));

  const sliceDays  = dailyData.slice(-range*7);
  const sliceWeeks = WEEKLY_SLEEP.slice(-range);

  // Stats
  const avg = (arr, key) => arr.length ? +(arr.reduce((s,v)=>s+(v[key]||0),0)/arr.length).toFixed(1) : 0;
  const avgScore = avg(sliceDays,'score');
  const avgDur   = avg(sliceDays,'dur');
  const sub100   = sliceDays.filter(d=>d.score<80).length;
  const over9    = sliceDays.filter(d=>d.dur>=9).length;
  const alcNights= sliceDays.filter(d=>d.alc);
  const alcAvg   = alcNights.length ? +(alcNights.reduce((s,d)=>s+d.score,0)/alcNights.length).toFixed(1) : null;
  const noAlcAvg = sliceDays.filter(d=>!d.alc).length
    ? +(sliceDays.filter(d=>!d.alc).reduce((s,d)=>s+d.score,0)/sliceDays.filter(d=>!d.alc).length).toFixed(1) : null;

  // Tonight optimal window
  const optBed  = "9:30 PM";
  const optWake = "6:15 AM";
  const targetHr = 8.75;

  const STAGE_TARGET = [
    {name:"REM",    val:WHOOP.sleep.rem,   target:2.0, color:P.violet, tip:"Memory consolidation & emotional processing"},
    {name:"Deep SWS",val:WHOOP.sleep.deep, target:1.5, color:P.sage,   tip:"Physical repair, immune function, HGH release"},
    {name:"Light",  val:WHOOP.sleep.light, target:3.5, color:P.steel,  tip:"Brain maintenance & memory encoding"},
    {name:"Awake",  val:WHOOP.sleep.awake, target:0.2, color:P.muted,  tip:"<5% ideal. Fragmentation hurts deep sleep."},
  ];

  return(<div style={{display:"flex",flexDirection:"column",gap:18}}>

    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
      <div>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>
          WHOOP · {dailyData.length} nights · Dec 2025 – Mar 2026
        </div>
        <div style={S.h18}>Sleep Trends</div>
      </div>
      <div style={{display:"flex",gap:5}}>
        {[{v:4,l:"4W"},{v:8,l:"8W"},{v:16,l:"16W"}].map(r=>(
          <button key={r.v} onClick={()=>setRange(r.v)}
            style={{fontFamily:FF.s,fontSize:10,fontWeight:600,padding:"5px 11px",borderRadius:7,cursor:"pointer",
              border:`1px solid ${range===r.v?P.steel:P.border}`,
              background:range===r.v?P.steel+"18":P.card,
              color:range===r.v?P.steel:P.muted}}>
            {r.l}
          </button>
        ))}
      </div>
    </div>

    {/* Hero stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12}}>
      {[
        {icon:"🌙",label:"Avg Score",    val:`${avgScore}%`,  color:P.steel,  sub:`last ${sliceDays.length} nights`},
        {icon:"⏱",label:"Avg Duration", val:`${Math.floor(avgDur)}h ${Math.round((avgDur%1)*60)}m`, color:P.violet, sub:"per night"},
        {icon:"💤",label:"≥9h Nights",  val:`${over9}`,      color:P.sage,   sub:`${Math.round(over9/sliceDays.length*100)}% of nights`},
        {icon:"⚠",label:"<80% Score",  val:`${sub100}`,     color:sub100>4?P.terra:P.amber, sub:"nights needing attention"},
        {icon:"🍷",label:"Alc Impact",  val:alcAvg?`−${(noAlcAvg-alcAvg).toFixed(1)} pts`:"—", color:P.terra, sub:"vs sober nights"},
      ].map(({icon,label,val,color,sub})=>(
        <div key={label} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:16,marginBottom:5}}>{icon}</div>
          <div style={{fontFamily:FF.r,fontSize:20,fontWeight:600,color,letterSpacing:"-0.01em",marginBottom:1}}>{val}</div>
          <div style={S.mut9}>{label}</div>
          <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:1}}>{sub}</div>
        </div>
      ))}
    </div>

    {/* Sleep Score trend */}
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <SLabel color={P.steel}>Sleep Performance Score</SLabel>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8}}>Daily score · target ≥95%</div>
        </div>
        <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:P.steel}}>{avgScore}<span style={{fontFamily:FF.s,fontSize:10,color:P.muted,marginLeft:3}}>avg</span></div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <ComposedChart data={sliceDays} margin={{top:4,right:4,left:-22,bottom:0}}>
          <defs>
            <linearGradient id="gSlp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.steel} stopOpacity={0.25}/>
              <stop offset="100%" stopColor={P.steel} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
          <XAxis dataKey="d" {...ax} interval={Math.max(1,Math.floor(sliceDays.length/8))}/>
          <YAxis {...ax} domain={[60,102]}/>
          <ReferenceLine y={95} stroke={P.sage} strokeDasharray="4 3" strokeOpacity={0.5}
            label={{value:"95%",position:"right",fontFamily:FF.s,fontSize:8,fill:P.sage,opacity:0.7}}/>
          <Tooltip content={({active,payload,label})=>active&&payload?.length?(
            <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px"}}>
              <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginBottom:3}}>{label}</div>
              <div style={{fontFamily:FF.m,fontSize:12,color:P.steel}}>{payload[0]?.value}%</div>
              {payload[0]?.payload?.alc?<div style={{fontFamily:FF.s,fontSize:8,color:P.terra,marginTop:2}}>🍷 alcohol night</div>:null}
            </div>):null}/>
          <Area type="monotone" dataKey="score" stroke={P.steel} strokeWidth={1.8}
            fill="url(#gSlp)" dot={false}
            activeDot={{r:3,fill:P.steel,stroke:P.card,strokeWidth:2}}/>
          {/* Alcohol dot markers */}
          {sliceDays.filter(d=>d.alc).map((d,i)=>(
            <ReferenceLine key={i} x={d.d} stroke={P.terra} strokeOpacity={0.3} strokeWidth={1}/>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>

    {/* Tonight's sleep stage targets */}
    <div style={CS()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <SLabel color={P.violet}>Last Night · Stage Breakdown</SLabel>
          <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8}}>
            {WHOOP.sleep.score}% performance · {Math.floor(WHOOP.sleep.hours)}h {Math.round((WHOOP.sleep.hours%1)*60)}m total
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:FF.r,fontSize:22,fontWeight:600,color:P.violet,letterSpacing:"-0.01em"}}>{WHOOP.sleep.score}%</div>
          <div style={S.mut9}>Sleep Performance</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {STAGE_TARGET.map(({name,val,target,color,tip})=>{
          const pct = Math.min(100,(val/target)*100);
          const over = val >= target;
          return(
            <div key={name}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
                  <span style={{fontFamily:FF.s,fontSize:11,fontWeight:600,color:P.text}}>{name}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>target {target}h</span>
                  <span style={{fontFamily:FF.m,fontSize:13,fontWeight:600,color:over?P.sage:P.amber}}>
                    {Math.floor(val)}h {String(Math.round((val%1)*60)).padStart(2,"0")}m
                  </span>
                  {over
                    ? <span style={{fontFamily:FF.s,fontSize:8,color:P.sage,fontWeight:700}}>✓</span>
                    : <span style={{fontFamily:FF.s,fontSize:8,color:P.amber}}>−{((target-val)*60).toFixed(0)}m</span>
                  }
                </div>
              </div>
              <div style={{height:7,background:P.panel,borderRadius:4,overflow:"hidden",border:`1px solid ${P.border}`}}>
                <div style={{height:"100%",width:`${Math.min(100,pct)}%`,
                  background:`linear-gradient(to right,${color}88,${color})`,
                  borderRadius:4,transition:"width 0.7s cubic-bezier(0.34,1.1,0.64,1)"}}/>
              </div>
              <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:3}}>{tip}</div>
            </div>
          );
        })}
      </div>

      {/* Stage pie */}
      <div style={{display:"flex",alignItems:"center",gap:20,marginTop:16,paddingTop:12,borderTop:`1px solid ${P.border}`}}>
        <ResponsiveContainer width={100} height={100}>
          <PieChart>
            <Pie data={SLEEP_PIE} dataKey="v" cx="50%" cy="50%" innerRadius={28} outerRadius={46}
              paddingAngle={2} isAnimationActive={true} animationDuration={700}>
              {SLEEP_PIE.map((e,i)=><Cell key={i} fill={e.col}/>)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
          {SLEEP_PIE.map(({name,v,col})=>(
            <div key={name} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
              <span style={{fontFamily:FF.s,fontSize:10,color:P.sub,flex:1}}>{name}</span>
              <span style={{fontFamily:FF.m,fontSize:11,fontWeight:600,color:P.text}}>{Math.floor(v)}h {String(Math.round((v%1)*60)).padStart(2,"0")}m</span>
              <span style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>{Math.round(v/WHOOP.sleep.hours*100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Duration + Weekly avg */}
    <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:16}}>

      {/* Daily duration */}
      <div style={CS()}>
        <SLabel color={P.violet}>Sleep Duration · Daily</SLabel>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8,marginBottom:10}}>Hours slept · dashed = 8h floor / 9h optimal</div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={sliceDays} margin={{top:4,right:4,left:-22,bottom:0}}>
            <defs>
              <linearGradient id="gDur" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.violet} stopOpacity={0.20}/>
                <stop offset="100%" stopColor={P.violet} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="d" {...ax} interval={Math.max(1,Math.floor(sliceDays.length/6))}/>
            <YAxis {...ax} domain={[5.5,12]}/>
            <ReferenceLine y={8} stroke={P.amber} strokeDasharray="3 3" strokeOpacity={0.5}/>
            <ReferenceLine y={9} stroke={P.sage} strokeDasharray="4 3" strokeOpacity={0.4}/>
            <Tooltip content={({active,payload})=>active&&payload?.length?(
              <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontFamily:FF.m,fontSize:12,color:P.violet}}>{payload[0]?.value}h</div>
              </div>):null}/>
            <Area type="monotone" dataKey="dur" stroke={P.violet} strokeWidth={1.8}
              fill="url(#gDur)" dot={false}
              activeDot={{r:3,fill:P.violet,stroke:P.card,strokeWidth:2}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly avg */}
      <div style={CS()}>
        <SLabel color={P.sage}>Weekly Sleep Score Avg</SLabel>
        <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8,marginBottom:10}}>7-day rolling average</div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={sliceWeeks} margin={{top:4,right:4,left:-22,bottom:0}}>
            <CartesianGrid stroke={P.border} strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="label" {...ax} interval={0}/>
            <YAxis {...ax} domain={[75,102]}/>
            <ReferenceLine y={95} stroke={P.sage} strokeDasharray="3 3" strokeOpacity={0.4}/>
            <Tooltip content={({active,payload,label})=>active&&payload?.length?(
              <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontFamily:FF.s,fontSize:9,color:P.muted}}>{label}</div>
                <div style={{fontFamily:FF.m,fontSize:12,color:P.sage}}>{payload[0]?.value}%</div>
              </div>):null}/>
            <Bar dataKey="score" radius={[3,3,0,0]} isAnimationActive={true} animationDuration={800}>
              {sliceWeeks.map((w,i)=>(
                <Cell key={i} fill={w.score>=95?P.sage:w.score>=88?P.amber:P.terra}
                  opacity={0.8}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Alcohol impact */}
    <div style={CS()}>
      <SLabel color={P.terra}>🍷 Alcohol Impact on Sleep</SLabel>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.muted,marginTop:-8,marginBottom:14}}>
        Based on {Object.values(CAL_DATA).filter(d=>d.alc).length} alcohol nights vs {Object.values(CAL_DATA).filter(d=>!d.alc&&d.slp).length} sober nights
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        {[
          {label:"Sober Nights",     val:"95.1%", sub:"avg sleep score",       color:P.sage},
          {label:"After Alcohol",    val:"88.3%", sub:"avg sleep score",       color:P.terra},
          {label:"Score Drop",       val:"−6.8 pts", sub:"per drinking night", color:P.terra},
        ].map(({label,val,sub,color})=>(
          <div key={label} style={{padding:"10px 12px",background:P.panel,borderRadius:10,border:`1px solid ${P.border}`}}>
            <div style={{fontFamily:FF.r,fontSize:18,fontWeight:600,color,letterSpacing:"-0.01em",marginBottom:1}}>{val}</div>
            <div style={{fontFamily:FF.s,fontSize:9,fontWeight:600,color:P.text}}>{label}</div>
            <div style={{fontFamily:FF.s,fontSize:8,color:P.muted,marginTop:1}}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"10px 14px",background:P.terra+"08",borderRadius:8,border:`1px solid ${P.terra}22`}}>
        <span style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.6}}>
          Alcohol suppresses deep SWS and REM sleep even in small amounts. Your data shows a consistent
          <span style={{color:P.terra,fontWeight:600}}> 6.8-point drop</span> the night after drinking.
          The HRV impact averages <span style={{color:P.terra,fontWeight:600}}>−13ms</span> the following morning.
        </span>
      </div>
    </div>

    {/* Tonight's optimal window */}
    <div style={{background:P.cardDk,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"18px 20px"}}>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Tonight</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
        {[
          {icon:"🌙",label:"Target Bedtime",  val:optBed,   color:"#C4A850"},
          {icon:"☀",label:"Target Wake",    val:optWake,  color:"#7AC49A"},
          {icon:"🌡",label:"Room Temp",       val:"67–68°F", color:"#6BAED6"},
          {icon:"⏱",label:"Sleep Window",   val:`${targetHr}h`,color:"#A890D0"},
        ].map(({icon,label,val,color})=>(
          <div key={label} style={{padding:"10px 12px",background:"rgba(255,255,255,0.04)",borderRadius:9,border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontSize:16,marginBottom:5}}>{icon}</div>
            <div style={{fontFamily:FF.m,fontSize:14,fontWeight:600,color,letterSpacing:"-0.01em"}}>{val}</div>
            <div style={{fontFamily:FF.s,fontSize:8,color:"rgba(255,255,255,0.35)",marginTop:1}}>{label}</div>
          </div>
        ))}
      </div>
    </div>

  </div>);
}

const CORR_DATA = [
  {icon:"🍷", title:"Alcohol → Next-Day Recovery Drop",
   text:"On the 24 days you drank, next-day recovery averaged 41% vs 67% on non-drink days — a 26-point gap. HRV dropped from 44ms avg to 31ms avg. The effect is larger with 2+ drinks.",
   stat:"−26 pts recovery", statColor:P.terra},
  {icon:"💪", title:"Workout Days → Following-Day Sleep Quality",
   text:"High-strain days (>13) correlate with 94% sleep score the following night vs 87% on rest days. Your body prioritizes deep sleep after hard efforts — avg deep sleep 2.1h post-workout vs 1.6h rest days.",
   stat:"+7 pts sleep score", statColor:P.sage},
  {icon:"🏃", title:"You're a Summer Runner, Winter Lifter",
   text:"Q3 2025 (Jul–Sept) you logged 26 running sessions vs just 1 Functional Fitness — almost exclusively outdoor aerobic. Q4 shifted to 18 FF sessions vs 12 runs. This seasonal pattern is consistent with 2023–24 data.",
   stat:"Seasonal pattern", statColor:P.steel},
  {icon:"🏋", title:"Functional Fitness Generates More HRV Suppression",
   text:"FF sessions average 12.0 strain vs 11.3 for running, producing more next-day HRV suppression (−6ms vs −3ms). Despite this, your 3-month HRV trend is flat-to-rising on weeks with 2 FF sessions.",
   stat:"−6ms HRV after FF", statColor:P.amber},
  {icon:"📅", title:"HRV & Recovery Are Seasonal — Peak in May & Sept, Trough in Aug & Jan",
   text:"May and September show your highest HRV (50ms both months). August is your worst month (39ms avg). Jan recovery averages 58% vs May's 71%. Aligns with temperature and training load cycles.",
   stat:"May = peak HRV", statColor:P.sage},
  {icon:"😴", title:"Short Sleep Tanks Recovery — The 7.5h Floor",
   text:"The 3 weeks with short sleep (<7.5h) averaged only 50% recovery. Optimal (7.5–9h) averaged 67%. Your sleep duration is high (8.5h avg) but highly variable — the variance matters more than the mean.",
   stat:"7.5h floor critical", statColor:P.violet},
];

function CorrelationsPage(){
  const ax={tick:{fontFamily:FF.s,fontSize:9,fill:P.muted},axisLine:{stroke:P.border},tickLine:false};
  const Divider=()=><div style={S.divider}/>;
  const Finding=({icon,title,text,stat,statColor})=>(
    <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
        <div style={{width:36,height:36,borderRadius:9,background:P.panel,border:`1px solid ${P.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:FF.r,fontSize:13,fontWeight:600,color:P.text,marginBottom:4}}>{title}</div>
          <div style={{fontFamily:FF.s,fontSize:11,color:P.sub,lineHeight:1.7}}>{text}</div>
        </div>
      </div>
      {stat&&(
        <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",
          borderRadius:6,background:statColor+"12",border:`1px solid ${statColor}33`}}>
          <span style={{fontFamily:FF.m,fontSize:11,fontWeight:700,color:statColor}}>{stat}</span>
        </div>
      )}
    </div>
  );

  return(<div style={S.col16}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
      <div>
        <div style={S.mut9uc}>55 weeks · Dec 2024 – Mar 2026</div>
        <div style={S.h18}>Correlations & Insights</div>
      </div>
    </div>

    {CORR_DATA.map((d,i)=>(
      <Finding key={i} icon={d.icon} title={d.title} text={d.text} stat={d.stat} statColor={d.statColor}/>
    ))}

    <div style={{background:P.cardDk,border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"18px 20px"}}>
      <div style={{fontFamily:FF.s,fontSize:9,color:P.mutedDk,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>
        What to do
      </div>
      {[
        {icon:"🚫",priority:"High",text:"Eliminate weeknight alcohol — the recovery cost is 26 pts. Even 1 drink on a Thursday destroys Friday training quality."},
        {icon:"📅",priority:"High",text:"Plan key workouts or performance events in May or September — your body is measurably at its best."},
        {icon:"😴",priority:"Medium",text:"Protect the 7.5h sleep floor — your variance is high. On nights you can't get 8h, prioritize sleep quality over duration."},
        {icon:"🏋",priority:"Medium",text:"2 FF sessions/week is your HRV-positive sweet spot. Adding a 3rd before your aerobic base is rebuilt will suppress recovery."},
      ].map(({icon,priority,text},i)=>(
        <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<3?12:0}}>
          <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
          <div style={{flex:1}}>
            <span style={{fontFamily:FF.s,fontSize:9,fontWeight:700,color:priority==="High"?P.terra:P.amber,
              textTransform:"uppercase",letterSpacing:"0.08em",marginRight:6}}>{priority}</span>
            <span style={{fontFamily:FF.s,fontSize:11,color:P.textInv,lineHeight:1.6}}>{text}</span>
          </div>
        </div>
      ))}
    </div>

  </div>);
}

function MobileTopbar({page, onProfile}){
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

function MobileNav({active,set}){
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


// ── WEEKLY REPORT GENERATOR ──────────────────────────────────────────────
function generateWeeklyReport() {
  // Gather this week's data from CAL_DATA + CAL_RICH
  const today = new Date("2026-03-23");
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
  const fmt = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const weekLabel = `${fmt(weekAgo)} – ${fmt(today)}`;

  // Week's daily entries
  const weekEntries = Object.entries(CAL_DATA)
    .filter(([d])=>d>="2026-03-17"&&d<="2026-03-23")
    .sort(([a],[b])=>a.localeCompare(b));

  const weekWorkouts = weekEntries.flatMap(([d])=>(CAL_RICH[d]||[]).map(w=>({...w,date:d})));

  const avgRec  = weekEntries.length ? Math.round(weekEntries.reduce((s,[,d])=>s+(d.rec||0),0)/weekEntries.filter(([,d])=>d.rec).length) : 0;
  const avgHRV  = weekEntries.length ? Math.round(weekEntries.reduce((s,[,d])=>s+(d.hrv||0),0)/weekEntries.filter(([,d])=>d.hrv).length) : 0;
  const avgSlp  = weekEntries.length ? (weekEntries.reduce((s,[,d])=>s+(d.sdur||0),0)/weekEntries.filter(([,d])=>d.sdur).length).toFixed(1) : 0;
  const avgSlpScore = weekEntries.length ? Math.round(weekEntries.reduce((s,[,d])=>s+(d.slp||0),0)/weekEntries.filter(([,d])=>d.slp).length) : 0;
  const totalStrain = weekWorkouts.reduce((s,w)=>s+w.strain,0).toFixed(1);
  const totalCal  = weekWorkouts.reduce((s,w)=>s+w.cal,0).toLocaleString();
  const alcDays  = weekEntries.filter(([,d])=>d.alc).length;
  const latestWt = HUME_DATA[0]?.wt || 213;

  const overdue = LAB_OVERDUE.length;

  // Score deltas
  const masterScore = SCORES_NOW.master.score;
  const masterPrev  = SCORES_NOW.master.prev;

  const scoreColor = s => s>=80?"#3A9C68":s>=70?"#C47830":s>=60?"#C47830":"#C4604A";
  const recColor   = r => r>=76?"#3A9C68":r>=58?"#C47830":"#C4604A";

  const workoutRows = weekWorkouts.map(w=>{
    const meta = {
      running:{icon:"🏃",color:"#C47830"}, fitness:{icon:"🏋",color:"#3A5C48"},
      spin:{icon:"🚴",color:"#C4604A"}, walking:{icon:"🚶",color:"#7A5A80"},
    };
    const m = meta[w.cat]||{icon:"⚡",color:"#6B6057"};
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;">${new Date(w.date+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;">${m.icon} ${w.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;text-align:right;">${w.strain}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;text-align:right;">${w.dur}m</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;text-align:right;">${w.cal} kcal</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;text-align:right;">${w.avgHR||"—"} bpm</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VITAL · Weekly Report · ${weekLabel}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#F4EFE8; color:#2C2420; }
  .page { max-width:900px; margin:0 auto; padding:40px 24px 64px; }
  .header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #C47830; }
  .logo { font-family:Georgia,serif; font-size:28px; font-weight:600; color:#2C2420; letter-spacing:-0.02em; }
  .logo span { color:#C47830; }
  .week-label { font-size:12px; color:#8C7B70; letter-spacing:0.06em; text-transform:uppercase; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:14px; margin-bottom:28px; }
  .stat-card { background:#fff; border-radius:12px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
  .stat-val { font-family:Georgia,serif; font-size:26px; font-weight:600; letter-spacing:-0.02em; line-height:1; margin-bottom:3px; }
  .stat-label { font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:#8C7B70; }
  .stat-sub { font-size:10px; color:#8C7B70; margin-top:3px; }
  .section { background:#fff; border-radius:14px; padding:20px 22px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
  .section-title { font-size:9px; text-transform:uppercase; letter-spacing:0.1em; color:#8C7B70; margin-bottom:12px; font-weight:700; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; padding:8px 12px; border-bottom:2px solid #E8E4DE; font-size:9px; text-transform:uppercase; letter-spacing:0.06em; color:#8C7B70; font-weight:700; }
  th:last-child, td:last-child { text-align:right; }
  .badge { display:inline-block; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:700; }
  .alert { background:#FDF1EE; border:1px solid #C4604A33; border-radius:8px; padding:10px 14px; font-size:11px; color:#7A3020; margin-top:12px; }
  .score-bar-bg { height:6px; background:#EAE4DC; border-radius:3px; overflow:hidden; margin-top:6px; }
  .score-bar { height:100%; border-radius:3px; }
  .footer { text-align:center; font-size:10px; color:#8C7B70; margin-top:40px; padding-top:20px; border-top:1px solid #E8E4DE; }
  @media print { body{background:#fff;} .page{padding:20px;} }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">VITAL <span>Health</span></div>
      <div style="font-size:13px;color:#8C7B70;margin-top:4px;">Weekly Report · ${weekLabel}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#8C7B70;">Nate Hahn · Age 47 · Montecito, CA</div>
      <div style="font-size:11px;color:#8C7B70;margin-top:2px;">Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
    </div>
  </div>

  <!-- Key Metrics -->
  <div class="grid">
    <div class="stat-card">
      <div class="stat-label">Health Score</div>
      <div class="stat-val" style="color:${scoreColor(masterScore)}">${masterScore}</div>
      <div class="stat-sub">${masterScore>masterPrev?"+":""}${masterScore-masterPrev} pts vs prior</div>
      <div class="score-bar-bg"><div class="score-bar" style="width:${masterScore}%;background:${scoreColor(masterScore)}"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg Recovery</div>
      <div class="stat-val" style="color:${recColor(avgRec)}">${avgRec}%</div>
      <div class="stat-sub">${avgRec>=76?"Above avg":avgRec>=58?"Normal":"Below avg"}</div>
      <div class="score-bar-bg"><div class="score-bar" style="width:${avgRec}%;background:${recColor(avgRec)}"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg HRV</div>
      <div class="stat-val" style="color:#4A8070">${avgHRV} ms</div>
      <div class="stat-sub">${avgHRV>=44?"Above":"Below"} your 44ms baseline</div>
      <div class="score-bar-bg"><div class="score-bar" style="width:${Math.min(100,avgHRV/70*100)}%;background:#4A8070"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Sleep Score</div>
      <div class="stat-val" style="color:#4A6070">${avgSlpScore}%</div>
      <div class="stat-sub">${avgSlp}h avg duration</div>
      <div class="score-bar-bg"><div class="score-bar" style="width:${avgSlpScore}%;background:#4A6070"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Strain</div>
      <div class="stat-val" style="color:#C47830">${totalStrain}</div>
      <div class="stat-sub">${weekWorkouts.length} workouts · ${totalCal} kcal</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Weight</div>
      <div class="stat-val" style="color:#4A8FA0">${latestWt}</div>
      <div class="stat-sub">lbs · Hume Pod</div>
    </div>
  </div>

  <!-- Workouts -->
  <div class="section">
    <div class="section-title">Workouts This Week</div>
    ${weekWorkouts.length>0?`
    <table>
      <thead><tr>
        <th>Date</th><th>Activity</th><th style="text-align:right">Strain</th>
        <th style="text-align:right">Duration</th><th style="text-align:right">Calories</th>
        <th style="text-align:right">Avg HR</th>
      </tr></thead>
      <tbody>${workoutRows}</tbody>
    </table>
    `:'<div style="color:#8C7B70;font-size:12px;padding:8px 0;">No workouts logged this week.</div>'}
  </div>

  <!-- Recovery & Sleep -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
    <div class="section">
      <div class="section-title">Recovery</div>
      ${weekEntries.map(([d,v])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #F0EBE4;font-size:12px;">
          <span style="color:#8C7B70;">${new Date(d+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
          <div style="display:flex;gap:12px;align-items:center;">
            <span>${v.hrv||"—"}ms</span>
            <span style="font-weight:600;color:${recColor(v.rec||0)}">${v.rec||"—"}%</span>
            ${v.alc?'<span style="font-size:10px;">🍷</span>':''}
          </div>
        </div>`).join("")}
    </div>
    <div class="section">
      <div class="section-title">Sleep</div>
      ${weekEntries.map(([d,v])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #F0EBE4;font-size:12px;">
          <span style="color:#8C7B70;">${new Date(d+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
          <div style="display:flex;gap:12px;">
            <span>${v.sdur||"—"}h</span>
            <span style="font-weight:600;color:#4A6070">${v.slp||"—"}%</span>
          </div>
        </div>`).join("")}
    </div>
  </div>

  <!-- Lab Flags -->
  ${overdue>0?`
  <div class="section">
    <div class="section-title">Lab Flags (${overdue} overdue)</div>
    <div class="alert">
      <strong>${overdue} biomarkers overdue</strong> — last drawn May 23, 2025.
      Recommend scheduling next draw: Testosterone, ApoB, CRP, HbA1c, Vitamin D, Ferritin, DHEA-S, Free T, Homocysteine, eGFR.
    </div>
  </div>`:""}

  <!-- Insights -->
  <div class="section">
    <div class="section-title">Weekly Insights</div>
    <ul style="padding-left:18px;font-size:12px;line-height:1.9;color:#4A3C34;">
      <li><strong>Recovery avg ${avgRec}%</strong> — ${avgRec>=76?"Excellent week. Body well-adapted to current training load.":avgRec>=58?"Normal range. Adequate response to training stimulus.":"Below average. Consider reducing next week's training intensity."}</li>
      <li><strong>HRV avg ${avgHRV}ms</strong> — ${avgHRV>=44?"Above your baseline. Nervous system handling load well.":"Below your 44ms baseline. Prioritize sleep quality and stress reduction."}</li>
      <li><strong>Sleep avg ${avgSlp}h / ${avgSlpScore}%</strong> — ${avgSlpScore>=95?"Optimal sleep performance this week.":avgSlpScore>=85?"Good sleep week with some room to improve.":"Sleep performance needs attention — check schedule and recovery habits."}</li>
      ${alcDays>0?`<li><strong>${alcDays} alcohol day${alcDays>1?"s":""}</strong> — each drinking night suppresses sleep score by ~7pts and HRV by ~13ms.</li>`:"<li>Zero alcohol this week — maximizes recovery potential.</li>"}
      <li><strong>Training load</strong> — ${weekWorkouts.length} sessions, ${totalStrain} total strain. ${parseFloat(totalStrain)>60?"Consider a deload next week if fatigue accumulates.":"Within sustainable range for current fitness block."}</li>
    </ul>
  </div>

  <div class="footer">
    VITAL Health Intelligence · Nate Hahn · Generated by VITAL Dashboard<br>
    Data sources: WHOOP, Hume Pod, DXA (Jan 2026), BioLab (May 2025)
  </div>
</div>
</body>
</html>`;

  // Trigger download
  const blob = new Blob([html], {type:"text/html"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `VITAL_Weekly_${weekLabel.replace(/\s/g,"_").replace(/[,–]/g,"")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function App(){
  useGoogleFonts();
  const [page,setPage]=useState("today");
  const [showMobileProfile, setShowMobileProfile]=useState(false);
  const { whoopLive, whoopStatus } = useWhoopLive();

  // If live data available, override the hardcoded WHOOP constant
  // (this is a runtime reassignment — safe since WHOOP is module-level mutable)
  useEffect(()=>{
    if(!whoopLive) return;
    WHOOP.recovery  = whoopLive.recovery;
    WHOOP.hrv       = whoopLive.hrv;
    WHOOP.rhr       = whoopLive.rhr;
    WHOOP.strain    = whoopLive.strain;
    WHOOP.spo2      = whoopLive.spo2;
    if(whoopLive.sleep){
      Object.assign(WHOOP.sleep, whoopLive.sleep);
    }
        // Sync live workout data into CAL_RICH so Fitness page + Today page use it
        if(whoopLive.workouts && whoopLive.workouts.length > 0){
                const sportMap = {0:"Running",1:"Cycling",48:"Functional Fitness",52:"Walking",71:"Spin",82:"Other",84:"Sport","-1":"Activity"};
                const catMap   = {0:"running",1:"cycling",48:"fitness",52:"walking",71:"spin",82:"other",84:"sport"};
                whoopLive.workouts.forEach(w => {
                          const dt = w.start ? w.start.slice(0,10) : null;
                          if(!dt) return;
                          const startDate = new Date(w.start);
                          const hh = startDate.getHours();
                          const mm = startDate.getMinutes();
                          const ampm = hh >= 12 ? "PM" : "AM";
                          const h12 = hh % 12 || 12;
                          const timeStr = `${h12}:${String(mm).padStart(2,"0")} ${ampm}`;
                          const entry = {
                                      cat: catMap[w.sport] || "other",
                                      name: sportMap[w.sport] || "Activity",
                                      strain: w.strain || 0,
                                      dur: w.dur || 0,
                                      cal: w.cal || 0,
                                      avgHR: w.avgHR || 0,
                                      maxHR: w.maxHR || 0,
                                      start: timeStr,
                                      timeH: hh,
                                      z0p: w.zones?.z0p || 0, z1p: w.zones?.z1p || 0, z2p: w.zones?.z2p || 0,
                                      z3p: w.zones?.z3p || 0, z4p: w.zones?.z4p || 0, z5p: w.zones?.z5p || 0,
                                      z0m: w.zones?.z0m || 0, z1m: w.zones?.z1m || 0, z2m: w.zones?.z2m || 0,
                                      z3m: w.zones?.z3m || 0, z4m: w.zones?.z4m || 0, z5m: w.zones?.z5m || 0,
                                      _liveId: w.id
                          };
                          if(!CAL_RICH[dt]) CAL_RICH[dt] = [];
                          // Avoid duplicates — skip if already present with same _liveId
                          if(!CAL_RICH[dt].some(e => e._liveId === w.id || (!e._liveId && e.cat === entry.cat && e.strain === entry.strain))){
                                      CAL_RICH[dt].push(entry);
                          }
                });
        }
  }, [whoopLive]);
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
