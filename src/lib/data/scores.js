// VITAL master score, per-domain drivers, score history, and the perceived
// metabolic age model. SCORES_NOW + METABOLIC_AGE both reference palette
// colors via P — captured at module load (matching prior monolith behavior).

import { P } from "../theme.js";
import { CAL_DATA, CAL_RICH } from "./calendar.js";

export const SCORES_NOW = {
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
// Feb 14 '25 = BioLab #1 · May 23 '25 = BioLab #2 · Jan 15 '26 = ExamOne
// Jan 23 '26 = DXA · Mar '26 = WHOOP live
export const SCORE_HISTORY = [
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
export const METABOLIC_AGE = (() => {
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
