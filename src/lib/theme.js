// Theme + design tokens for the VITAL dashboard.
//
// P_BASE is a singleton object whose properties are mutated in-place by
// setActiveTheme (never reassigned), so importers can hold a stable
// reference and getter-based reads on `P` always reflect the current
// theme. Reassigning a `let` binding from another module is not legal in
// ESM, which is why this pattern matters now that the dashboard is split
// into modules.

export const THEMES = {
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

export const P_BASE = {...(THEMES[_activeTheme] || THEMES.warm)};

export function setActiveTheme(t){
  const next = THEMES[t] || THEMES.warm;
  // Wipe stale keys then copy fresh ones so theme switches are clean.
  for (const k of Object.keys(P_BASE)) delete P_BASE[k];
  Object.assign(P_BASE, next);
}

export const P = {
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
  greenBg:   "#EBF0EC",

  mono: '"DM Mono", monospace',
  sans: '"DM Sans", system-ui, sans-serif',
  serif: '"Cormorant Garant", Georgia, serif',
};

// Font shorthand
export const FF = { s: P.sans, r: P.serif, m: P.mono };

// Reusable inline-style shorthands (saves ~12KB of repeated style objects)
export const S = {
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
export const CS = (r=14, p="18px", sh="0 1px 3px rgba(0,0,0,.04)") => ({
  background: P.card,
  border: `1px solid ${P.border}`,
  borderRadius: r,
  padding: p,
  boxShadow: sh,
});
