// VITAL master score, per-domain drivers, score history, and the perceived
// metabolic age model. SCORES_NOW + METABOLIC_AGE both reference palette
// colors via P — captured at module load (matching prior monolith behavior).

import { P } from "../theme.js";
import { CAL_DATA, CAL_RICH } from "./calendar.js";
import { HUME_DATA, DXA } from "./body.js";

export const SCORES_NOW = {
  // Master = weighted avg of 7 domains


  master:       { score:71, prev:68, label:"VITAL Score",        icon:"⚡", color:P.cyan,   weight:1.0 },

  cardiovascular:{ score:75, prev:70, label:"Cardiovascular",    icon:"❤️", color:P.coral,  weight:.20,
    dataDate:"Lipids/hs-CRP/omega: Aug 25, 2026 · ApoB: May 2025 · WHOOP 90-day",
    drivers:[
      {name:"Triglycerides",        val:"93 mg/dL",  note:"Aug '26 — well under 150",                        score:88, trend:"stable"},
      {name:"HDL Cholesterol",      val:"60 mg/dL",  note:"Aug '26 — optimal",                               score:91, trend:"stable"},
      {name:"LDL",                  val:"57 mg/dL",  note:"Aug '26 — best on record. Rosuvastatin 40 mg.",   score:96, trend:"up"},
      {name:"Chol/HDL Ratio",       val:"2.3",       note:"Aug '26 — excellent",                             score:94, trend:"up"},
      {name:"ApoB",                 val:"66 mg/dL",  note:"Excellent <80 — May 23, 2025 (not redrawn)",      score:92, trend:"stable"},
      {name:"hs-CRP",               val:"<0.2 mg/L", note:"Aug '26 — third consecutive optimal",              score:98, trend:"stable"},
      {name:"Omega-3 Index",        val:"6.8%",      note:"Aug '26 — optimal ≥5.5, cardioprotective",        score:92, trend:"up"},
      {name:"HRV (3-mo avg)",       val:"43.2 ms",   note:"10-wk avg Dec–Mar — below personal mean 44.4",   score:46, trend:"flag"},
      {name:"RHR (3-mo avg)",       val:"51.0 bpm",  note:"10-wk avg — above athletic threshold of ≤49",    score:54, trend:"flag"},
    ]},

  metabolic:    { score:73, prev:73, label:"Metabolic Health",   icon:"⚗️", color:P.amber,  weight:.15,
    dataDate:"Aug 25, 2026 (insulin/HOMA-IR) · Jan 2026 DXA",
    drivers:[
      {name:"HbA1c",             val:"5.3%",       note:"May '25 BioLab — not drawn Jan '26. No IR risk.",score:92, trend:"stable"},
      {name:"Glucose",           val:"97 mg/dL",   note:"Jan '26 — normal range, ↑ from 84 (May '25)",   score:84, trend:"stable"},
      {name:"HOMA-IR",           val:"1.25",       note:"Aug '26 — insulin-sensitive (concern ≥2.0). First-ever insulin measurement.", score:94, trend:"up"},
      {name:"Insulin (fasting)", val:"5.4 µIU/mL", note:"Aug '26 — optimal ≤18.4, on statin which raises glucose", score:93, trend:"up"},
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
    dataDate:"Aug 25, 2026 · Quest",
    drivers:[
      {name:"Testosterone Total", val:"413 ng/dL",  note:"Aug '26 LC/MS — up from 377, drawn in a −27 lb deficit. Retest at maintenance.", score:72, trend:"up"},
      {name:"SHBG",               val:"37 nmol/L",  note:"Aug '26 — rose modestly with weight loss", score:80, trend:"stable"},
      {name:"TSH",                val:"1.52 mIU/L", note:"Aug '26 — full panel clean (FT4 1.4, FT3 3.2)", score:92, trend:"stable"},
      {name:"DHEA-S",             val:"54 µg/dL",   note:"Aug '26 — below range off supplement. Recheck 3–4 mo.", score:58, trend:"flag"},
      {name:"Vitamin D",          val:"57 ng/mL",   note:"Aug '26 — optimal, and off supplement",  score:93, trend:"up"},
      {name:"Estradiol",          val:"<30 pg/mL",  note:"Aug '26 — fell with fat mass, as expected", score:84, trend:"stable"},
      {name:"Cortisol",           val:"18.1 µg/dL", note:"Aug '26 — 7:15am draw, AM ref 4.0–22.0. Upper-normal.", score:78, trend:"stable"},
    ]},

  longevity:    { score:82, prev:64, label:"Longevity",          icon:"♾️", color:P.green,  weight:.10,
    dataDate:"Aug 25, 2026 · Quest",
    drivers:[
      {name:"hs-CRP",             val:"<0.2 mg/L",  note:"Aug '26 — third consecutive optimal (0.9 → 0.1 → <0.2)", score:98, trend:"stable"},
      {name:"Omega-3 Index",      val:"6.8%",       note:"Aug '26 — optimal ≥5.5, sustained by diet 6mo off supplement", score:92, trend:"up"},
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
 * Chronological age: 48. Each domain shifts the perceived age ±.
 * Lower = biologically younger. Sources: BioLab May 23, Styku May 23, CardioCoach, WHOOP.
 */
export const METABOLIC_AGE = (() => {
  const chrono = 48;

  // Heuristic model with hand-tuned weights — directionally useful, not a
  // validated epigenetic clock. Read the delta as a trend, not a literal age.
  // Aug 2026 revision: HOMA-IR, hs-CRP and the omega-3 index all resulted
  // optimal, and those are the inputs this kind of model weights most heavily.
  const factors = [
    { label:"Cardiovascular",  delta:-7.8, note:"LDL 57, hs-CRP <0.2, omega-3 index 6.8%, HDL 60", color:P.terra,  icon:"❤" },
    { label:"Metabolic",       delta:-4.6, note:"HOMA-IR 1.25, insulin 5.4, HbA1c 5.4%, glucose 94", color:P.amber, icon:"⚗" },
    { label:"Body Comp",       delta:+0.6, note:"189 lb, −27 since Jan — DXA pending to confirm",  color:P.clay,   icon:"📐" },
    { label:"Musculoskeletal", delta:-2.6, note:"Lean mass 149.8 lb, BMD T-score +1.3",            color:P.sage,   icon:"💪" },
    { label:"Hormonal",        delta:+0.9, note:"Testosterone 413 (deficit-suppressed), DHEA-S low",color:P.violet, icon:"⚗" },
    { label:"Recovery/CNS",    delta:-3.2, note:"Recovery 65% 90-day, sleep 9.1h, RHR 55",         color:P.steel,  icon:"🌙" },
    { label:"Longevity Markers",delta:-2.2,note:"Omega-3 6.8%, hs-CRP <0.2, B12 405, folate 9.2",  color:P.sage,   icon:"♾" },
  ];
  const totalDelta = factors.reduce((s,f) => s + f.delta, 0);
  const perceived = Math.round((chrono + totalDelta) * 10) / 10;

  const history = [
    {d:"Feb '25", age:41.9},
    {d:"May '25", age:41.5},
    {d:"Jan '26", age:35.2},
    {d:"Aug '26", age:+(chrono + totalDelta).toFixed(1)},
  ];
  return { chrono, perceived, delta: +(chrono - perceived).toFixed(1), factors, history };
})();

// ─── Dynamic 90-day Health Score computation ───
// ─── Dynamic 90-day Health Score computation ───
// Exported so ScorePage can re-run with live WHOOP history data.
const GYM_CATS = ['strength', 'weight', 'functional'];
const isGym = cat => cat && GYM_CATS.some(g => cat.toLowerCase().includes(g));
const _scoreRecovery = r => r >= 70 ? 90 : r >= 55 ? 75 : r >= 40 ? 60 : 45;
const _scoreHRV = h => h >= 60 ? 90 : h >= 45 ? 78 : h >= 35 ? 65 : 50;
const _scoreRHR = r => r <= 50 ? 90 : r <= 55 ? 80 : r <= 60 ? 70 : 55;
const _scoreSleep = h => h >= 8 ? 90 : h >= 7 ? 80 : h >= 6 ? 65 : 50;
const _scoreWeeklyStrain = s => s >= 80 ? 90 : s >= 60 ? 80 : s >= 40 ? 70 : 55;
const _scoreGymSessions = g => g >= 4 ? 90 : g >= 3 ? 80 : g >= 2 ? 65 : 50;
const _avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const SPORT_GYM = new Set([48, 97]);

export function recomputeScoresFromHistory(liveDays) {
  const hrvArr = [], rhrArr = [], recArr = [], sleepArr = [];
  let totalStrain = 0, gymCount = 0, sessionCount = 0;
  const days = liveDays || [];
  days.forEach(d => {
    if (d.hrv > 0) hrvArr.push(d.hrv);
    if (d.rhr > 0) rhrArr.push(d.rhr);
    if (d.recovery > 0) recArr.push(d.recovery);
    if (d.sdur > 0) sleepArr.push(d.sdur);
    else if (d.sleep > 0 && !d.sdur) sleepArr.push(d.sleep > 10 ? d.sleep / 10 : 8);
    (d.workouts || []).forEach(w => {
      sessionCount++;
      if (w.strain) totalStrain += w.strain;
      if (w.sport != null && SPORT_GYM.has(w.sport)) gymCount++;
      else if (w.cat && isGym(w.cat)) gymCount++;
    });
  });
  const weeksInRange = Math.max(1, days.length / 7);
  const weeklyStrain = totalStrain / weeksInRange;
  const weeklyGym = gymCount / weeksInRange;
  const avgHRV = _avg(hrvArr), avgRHR = _avg(rhrArr), avgRec = _avg(recArr), avgSleep = _avg(sleepArr);
  const recScore = _scoreRecovery(avgRec), hrvScore = _scoreHRV(avgHRV), rhrScore = _scoreRHR(avgRHR);
  const sleepSc = _scoreSleep(avgSleep), strainScore = _scoreWeeklyStrain(weeklyStrain), gymScore = _scoreGymSessions(weeklyGym);
  return { avgHRV, avgRHR, avgRec, avgSleep, weeklyStrain, weeklyGym, gymCount, sessionCount,
           recScore, hrvScore, rhrScore, sleepScore: sleepSc, strainScore, gymScore, days: days.length, weeksInRange };
}

export function applyLiveScores(stats, rangeLabel) {
  const { avgHRV, avgRHR, avgRec, avgSleep, weeklyStrain, weeklyGym, gymCount, sessionCount,
          recScore, hrvScore, rhrScore, sleepScore, strainScore, gymScore } = stats;

  const recoveryOverall = Math.round(recScore * 0.35 + hrvScore * 0.25 + sleepScore * 0.25 + rhrScore * 0.15);
  SCORES_NOW.recovery.score = recoveryOverall;
  SCORES_NOW.recovery.prev = SCORES_NOW.recovery.prev || 61;
  SCORES_NOW.recovery.dataDate = 'WHOOP 90-day avg · ' + rangeLabel;
  if (SCORES_NOW.recovery.drivers) {
    SCORES_NOW.recovery.drivers.forEach(dr => {
      if (dr.name?.includes('Recovery (')) { dr.val = Math.round(avgRec) + '%'; dr.score = recScore; dr.note = '90-day avg — ' + avgRec.toFixed(0) + '%'; }
      if (dr.name?.includes('HRV (')) { dr.val = avgHRV.toFixed(1) + ' ms'; dr.score = hrvScore; dr.note = '90-day WHOOP avg'; }
      if (dr.name?.includes('RHR (')) { dr.val = avgRHR.toFixed(1) + ' bpm'; dr.score = rhrScore; dr.note = '90-day WHOOP avg'; }
      if (dr.name?.includes('Sleep Duration')) { dr.val = avgSleep.toFixed(1) + 'h'; dr.score = sleepScore; dr.note = '90-day avg'; }
    });
  }
  if (SCORES_NOW.cardiovascular?.drivers) {
    SCORES_NOW.cardiovascular.drivers.forEach(dr => {
      if (dr.name?.includes('HRV')) { dr.val = avgHRV.toFixed(1) + ' ms'; dr.note = '90-day WHOOP avg'; dr.score = hrvScore; }
      if (dr.name?.includes('RHR')) { dr.val = avgRHR.toFixed(1) + ' bpm'; dr.note = '90-day WHOOP avg'; dr.score = rhrScore; }
    });
    let cvT = 0, cvC = 0;
    SCORES_NOW.cardiovascular.drivers.forEach(dr => { if (dr.score != null) { cvT += dr.score; cvC++; } });
    if (cvC > 0) SCORES_NOW.cardiovascular.score = Math.round(cvT / cvC);
  }
  if (SCORES_NOW.strength?.drivers) {
    SCORES_NOW.strength.drivers.forEach(dr => {
      if (dr.name?.includes('Strain')) { dr.val = weeklyStrain.toFixed(1) + '/wk'; dr.score = strainScore; dr.note = '90-day WHOOP avg'; }
      if (dr.name?.includes('Gym') && dr.name?.includes('3-mo')) { dr.val = gymCount + ' sessions'; dr.score = gymScore; dr.note = weeklyGym.toFixed(1) + '/wk over 90 days'; }
      if (dr.name?.includes('Total sessions')) { dr.val = (sessionCount / Math.max(1, stats.weeksInRange)).toFixed(1) + '/wk'; dr.score = Math.min(90, Math.round(sessionCount / stats.weeksInRange * 18)); dr.note = sessionCount + ' total over 90 days'; }
    });
    let stT = 0, stC = 0;
    SCORES_NOW.strength.drivers.forEach(dr => { if (dr.score != null) { stT += dr.score; stC++; } });
    if (stC > 0) SCORES_NOW.strength.score = Math.round(stT / stC);
  }

  // Recompute master score
  const weights = { cardiovascular: 0.2, metabolic: 0.15, bodyComp: 0.15, strength: 0.15, hormonal: 0.1, longevity: 0.15, recovery: 0.1 };
  let total = 0, wSum = 0;
  Object.keys(weights).forEach(k => { if (SCORES_NOW[k]?.score != null) { total += SCORES_NOW[k].score * weights[k]; wSum += weights[k]; } });
  if (wSum > 0) SCORES_NOW.master.score = Math.round(total / wSum);
  window.__VITAL_90DAY_RANGE__ = rangeLabel;
}

// Initial computation from static data (runs at import time)
;(function computeDynamic90DayScores() {
  const today = new Date();
  const d90 = new Date(today); d90.setDate(d90.getDate() - 90);
  const fmtISO = d => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  const fmt = d => { const mm = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return mm[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear(); };
  const startISO = fmtISO(d90), endISO = fmtISO(today);
  const dKeys = Object.keys(CAL_DATA).filter(k => k >= startISO && k <= endISO).sort();
  // Build pseudo-history from static data for initial computation
  const staticDays = dKeys.map(k => {
    const cd = CAL_DATA[k];
    const cr = CAL_RICH[k] || [];
    return { date: k, recovery: cd.rec, hrv: cd.hrv, rhr: cd.rhr, sdur: cd.sdur, sleep: cd.slp,
             workouts: cr.map(w => ({ strain: w.strain, cat: w.cat, sport: null })) };
  });
  const stats = recomputeScoresFromHistory(staticDays);
  const rangeLabel = fmt(d90) + ' – ' + fmt(today);
  applyLiveScores(stats, rangeLabel);

  // ─── Dynamic Body Comp from Hume weight/BF data ───
  if (HUME_DATA.length >= 2) {
    const sorted = HUME_DATA.slice().sort((a, b) => b.d.localeCompare(a.d));
    const latest = sorted[0];
    const oldest = sorted[sorted.length - 1];
    const recent30 = sorted.filter(r => r.d >= fmtISO(d90));
    const avgWt = recent30.length ? recent30.reduce((s, r) => s + r.wt, 0) / recent30.length : latest.wt;
    const avgBf = recent30.length ? recent30.reduce((s, r) => s + r.bf, 0) / recent30.length : latest.bf;

    const BIA_DXA_OFFSET = DXA.totalFatPct - (HUME_DATA.find(r => r.d <= "2026-01-23")?.bf || 16);
    const estDxaBf = latest.bf + BIA_DXA_OFFSET;
    const estDxaBfAvg = avgBf + BIA_DXA_OFFSET;

    const wtDelta = latest.wt - DXA.weight;
    const bfDelta = latest.bf - oldest.bf;
    const leanEst = latest.wt * (1 - latest.bf / 100);

    const scoreBf = bf => bf <= 15 ? 95 : bf <= 18 ? 88 : bf <= 20 ? 78 : bf <= 23 ? 68 : bf <= 26 ? 55 : 45;
    const scoreWtTrend = delta => delta <= -15 ? 92 : delta <= -10 ? 85 : delta <= -5 ? 75 : delta <= 0 ? 68 : delta <= 5 ? 55 : 45;
    const scoreLean = lbs => lbs >= 170 ? 90 : lbs >= 160 ? 82 : lbs >= 150 ? 75 : lbs >= 140 ? 65 : 55;

    const bfScore = scoreBf(estDxaBfAvg);
    const wtTrendScore = scoreWtTrend(wtDelta);
    const leanScore = scoreLean(leanEst);
    const vatScore = SCORES_NOW.bodyComp.drivers.find(d => d.name.includes("VAT"))?.score || 60;
    const bmdScore = SCORES_NOW.bodyComp.drivers.find(d => d.name.includes("BMD"))?.score || 99;

    const bcOverall = Math.round(bfScore * 0.30 + wtTrendScore * 0.20 + leanScore * 0.20 + vatScore * 0.15 + bmdScore * 0.15);
    SCORES_NOW.bodyComp.score = bcOverall;
    SCORES_NOW.bodyComp.dataDate = `Hume BIA (latest ${latest.d}) · DXA Jan 23, 2026 (VAT/BMD)`;

    SCORES_NOW.bodyComp.drivers = [
      {name:"Body Fat % (est.)",   val:estDxaBf.toFixed(1)+"%",  note:`Hume BIA ${latest.bf.toFixed(1)}% + ${BIA_DXA_OFFSET.toFixed(0)}pt DXA offset — ${latest.d}`, score:bfScore, trend: bfDelta < -1 ? "up" : bfDelta > 1 ? "flag" : "stable"},
      {name:"Weight",              val:latest.wt.toFixed(1)+" lbs", note:`${wtDelta >= 0 ? "+" : ""}${wtDelta.toFixed(1)} lbs vs DXA baseline (${DXA.weight} lbs)`, score:wtTrendScore, trend: wtDelta < -5 ? "up" : "stable"},
      {name:"Lean Mass (est.)",    val:leanEst.toFixed(1)+" lbs", note:"Estimated from Hume weight × (1 − BF%)", score:leanScore, trend:"stable"},
      {name:"VAT (DXA)",           val:DXA.vatArea_cm2+" cm²",  note:"Jan 23, 2026 — target <100 cm²",     score:vatScore, trend:"flag"},
      {name:"BMD T-score (DXA)",   val:"+"+DXA.bmd.total.tScore, note:"Exceptional — 111th percentile",   score:bmdScore, trend:"up"},
    ];

    if (SCORES_NOW.metabolic?.drivers) {
      const metBf = SCORES_NOW.metabolic.drivers.find(d => d.name.includes("Body Fat"));
      if (metBf) { metBf.val = estDxaBf.toFixed(1) + "%"; metBf.note = `Est. from Hume BIA ${latest.bf.toFixed(1)}% + DXA offset — ${latest.d}`; metBf.score = bfScore; }
    }
  }

  window.__VITAL_SCORE_DATE__ = fmt(today);
})();
