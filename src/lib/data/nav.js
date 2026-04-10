// Top-level navigation menu — primary tabs always visible in the bottom bar,
// secondary tabs grouped under the "More" overflow menu.

export const NAV_PRIMARY=[
  {id:"today",    icon:"☀",   label:"Today"},
  {id:"score",    icon:"⚡",   label:"Health Score"},
  {id:"fitness",  icon:"🏃", label:"Fitness"},
  {id:"calendar", icon:"📅",label:"Calendar"},
  {id:"labs",     icon:"🧬",    label:"Labs"},
];
export const NAV_MORE=[
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
export const NAV=[...NAV_PRIMARY,...NAV_MORE];
