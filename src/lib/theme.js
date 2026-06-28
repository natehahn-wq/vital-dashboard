// Theme + design tokens for the VITAL dashboard.
// Single clinical palette — no theme switching. Every key in THEMES
// resolves to the same object so stale localStorage values are harmless.

const CLINICAL = {
  id:"clinical", name:"Medical Clinical", preview:"#F0F4F8",
  accent:"#5B9BD5", accentDk:"#3A7CA5", dark:false,
  bg:"#F0F4F8", panel:"#E4EBF2", card:"#FFFFFF", cardDk:"#1B3A5C",
  border:"rgba(180,200,220,0.45)", borderDk:"#3A5A78",
  text:"#1B3A5C", textInv:"#F0F4F8", sub:"#4A6A84", muted:"#8AA4BC", mutedDk:"#9AB4CC",
  terra:"#C4604A", terracottaBg:"#FDF1EE",
  sage:"#3A9C68", sageBg:"#E8F5ED",
  amber:"#5B9BD5", amberBg:"#E8F0FA",
  steel:"#3A7CA5", steelBg:"#E2EEF6",
  gold:"#64B4DC", clay:"#8B7155", rose:"#A85070", ink:"#1B3A5C", violet:"#7A5DA0",
};

// All legacy keys resolve to the same palette so localStorage can't break it
export const THEMES = {
  clinical: CLINICAL,
  warm: CLINICAL,
  calmLuxury: CLINICAL,
  blueNeutral: CLINICAL,
  greenPalette: CLINICAL,
  lifeforce: CLINICAL,
};

export const P_BASE = {...CLINICAL};

export function setActiveTheme(_t){
  // No-op — single palette, kept for API compat
}

export const P = {
  get bg()       { return P_BASE.bg; },
  get panel()    { return P_BASE.panel; },
  get card()     { return P_BASE.card; },
  get cardDk()   { return P_BASE.cardDk; },
  get border()   { return P_BASE.border; },
  get borderDk() { return P_BASE.borderDk; },

  get text()     { return P_BASE.text; },
  get textInv()  { return P_BASE.textInv; },
  get sub()      { return P_BASE.sub; },
  get muted()    { return P_BASE.muted; },
  get mutedDk()  { return P_BASE.mutedDk; },

  get terra()          { return P_BASE.terra; },
  get terracottaBg()   { return P_BASE.terracottaBg; },
  get sage()           { return P_BASE.sage; },
  get sageBg()         { return P_BASE.sageBg; },
  get amber()          { return P_BASE.amber; },
  get amberBg()        { return P_BASE.amberBg; },
  get steel()          { return P_BASE.steel; },
  get steelBg()        { return P_BASE.steelBg; },
  get gold()           { return P_BASE.gold; },
  get clay()           { return P_BASE.clay; },
  get rose()           { return P_BASE.rose; },
  get ink()            { return P_BASE.ink; },
  get violet()         { return P_BASE.violet; },
  get accent()         { return P_BASE.accent; },

  get cyan()    { return P_BASE.sage; },
  get cyanBg()  { return P_BASE.sageBg; },
  get coral()   { return P_BASE.terra; },
  get coralBg() { return P_BASE.terracottaBg; },
  get blue()    { return P_BASE.steel; },
  get blueBg()  { return P_BASE.steelBg; },
  get green()   { return P_BASE.sage; },
  get greenBg() { return P_BASE.sageBg; },
  get pink()    { return P_BASE.rose; },
  get pinkBg()  { return "#F0E4EA"; },
  get pelo()    { return P_BASE.terra; },
  get peloBg()  { return P_BASE.terracottaBg; },

  roseBg:    "#F0E4EA",
  goldBg:    "#E8F0FA",
  inkBg:     "#E8EDF2",
  violetBg:  "#F2EBF6",
  clayBg:    "#F0EBE6",
  greenBg:   "#E8F5ED",

  mono: '"DM Mono", monospace',
  sans: '"DM Sans", system-ui, sans-serif',
  serif: '"Cormorant Garant", Georgia, serif',
};

export const FF = { s: P.sans, r: P.serif, m: P.mono };

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

export const CS = (r=14, p="18px", sh="0 1px 3px rgba(0,0,0,.04)") => ({
  background: P.card,
  border: `1px solid ${P.border}`,
  borderRadius: r,
  padding: p,
  boxShadow: sh,
});
