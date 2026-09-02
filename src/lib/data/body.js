// Body composition data — Styku 3D scans, DXA gold-standard, Hume Pod daily BIA,
// derived trend arrays, and the LATEST snapshot used across the dashboard.
//
// HUME_DATA is `const` (array), but its contents are mutated in place by the
// localStorage merge IIFE below so anything else that imported the reference
// stays in sync. Do NOT reassign HUME_DATA.

// Styku scans — actual values
export const STYKU = {
  scan1: { date:"Feb 14, 2025", weight:208, bodyFat:23.9, fatMass:49.8, leanMass:151.7, bmi:28.0, bmr:1969, healthRisk:20, waistAbd:35.7, waistNarrow:33.7, hip:42.2, chest:40.4 },
  scan2: { date:"May 23, 2025", weight:212, bodyFat:21.1, fatMass:44.8, leanMass:160.3, bmi:28.7, bmr:1993, healthRisk:0,  waistAbd:34.7, waistNarrow:32.9, hip:41.0, chest:41.0 },
  progress: { days:99, weightDelta:+4.0, bfDelta:-2.8, leanDelta:+8.6, fatDelta:-5.0, circumDelta:-11.0 },
};

// ─── DXA scans ───────────────────────────────────────────────────────────
// DXA_BASELINE = Jan 23 2026, Pueblo Radiology (Hologic Horizon W).
//   The PRE-WEGOVY baseline. Semaglutide started Feb 17 2026.
// DXA_CURRENT  = Sep 2 2026, BodySpec (GE Lunar). The current scan.
// DXA          = current headline values + the Jan regional/BMD detail that
//   the BodySpec report does not include, each labelled with its provenance.
//
// ⚠ The two scans are on different manufacturers. Hologic and GE Lunar carry
// systematic offsets of roughly 2–3 percentage points of body fat and a few
// pounds of lean. Read the delta directionally, not to the decimal.

export const DXA_BASELINE = {
  date: "Jan 23, 2026",
  source: "Pueblo Radiology",
  platform: "Hologic Horizon W",
  baselineLabel: "Pre-Wegovy baseline (Jan 2026)",
  isCurrent: false,
  age: 48,
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

// Sep 2, 2026 · BodySpec (GE Lunar), 11:36 AM — the current scan.
export const DXA_CURRENT = {
  date: "Sep 2, 2026",
  source: "BodySpec",
  platform: "GE Lunar",
  isCurrent: true,
  age: 48,
  weight: 191.1,
  height: 72.0,
  bmi: 25.9,

  totalFatPct:  14.3,
  totalFatLbs:  27.3,
  totalLeanLbs: 155.7,
  totalBMC_lbs: 8.1,
  bmiLean:      21.1,      // BMI-L, lean-only BMI
  bmdTotal:     1.44,      // g/cm²

  vatLbs: 1.02,            // CoreScan — lbs, NOT comparable to Hologic cm²
  rmrDxa: 2177,            // DXA-estimated resting metabolic rate

  // vs BodySpec reference population: 49,000 men, ages 45–51
  percentiles: {
    population: "49,000 men, ages 45–51",
    fatPct:  { label:"leanest 9%",      value:9,  betterIsLower:true  },
    lean:    { label:"higher than 79%", value:79, betterIsLower:false },
    bone:    { label:"higher than 75%", value:75, betterIsLower:false },
    vat:     { label:"lowest 28%",      value:28, betterIsLower:true  },
  },

  reportUrl: "https://www.bodyspec.com/shared-dexa/1c06ee27f84f4ad0b17ea3dd5b5095af",
};

// Jan → Sep change. Cross-manufacturer, so directional.
export const DXA_DELTA = {
  from: "Jan 23, 2026", to: "Sep 2, 2026",
  window: "Oral Wegovy started Feb 17, 2026 — this is the recomposition window",
  weight:  -24.9,
  fatLbs:  -29.2,
  leanLbs:  +5.9,
  fatPct:  -12.1,
  boneHeld: true,
  caveats: [
    "Cross-manufacturer: Jan was Hologic, Sep is GE Lunar. Systematic offsets of ~2–3 percentage points of body fat and a few pounds of lean exist between platforms — read the delta directionally.",
    "VAT units differ (Hologic cm² vs Lunar CoreScan lbs) and are not numerically comparable. Directionally a large reduction.",
    "Creatine (~5 g/day) holds 2–4 lbs of water that DXA counts as lean.",
  ],
  verdict: "Even fully discounted for all three, the conclusion holds: roughly 25–29 lbs of fat lost with lean mass fully preserved. The typical GLP-1 outcome puts 25–40% of weight lost as lean.",
  credit: "Training through the cut — 2×/week lifting, protein, creatine — is what preserved the lean mass.",
};

// DXA — current headline values, with the Jan regional/BMD detail carried
// forward because the BodySpec report does not break those out. Every
// carried-forward field is dated via `detailFrom` so nothing reads as current
// that isn't.
export const DXA = {
  ...DXA_CURRENT,
  detailFrom: "Jan 23, 2026 · Hologic",
  vatArea_cm2: DXA_BASELINE.vatArea_cm2,
  vatMass_g:   DXA_BASELINE.vatMass_g,
  vatVol_cm3:  DXA_BASELINE.vatVol_cm3,
  android:     DXA_BASELINE.android,
  gynoid:      DXA_BASELINE.gynoid,
  androidGynoidRatio: DXA_BASELINE.androidGynoidRatio,
  regions:     DXA_BASELINE.regions,
  bmd:         DXA_BASELINE.bmd,
  totalLeanBMC: +(DXA_CURRENT.totalLeanLbs + DXA_CURRENT.totalBMC_lbs).toFixed(2),
};

// Scan history across all methods (newest first)
export const SCAN_HISTORY = [
  { date:"Sep 2, 2026",  source:"DXA",   platform:"BodySpec · GE Lunar", weight:191.1, fatPct:14.3, fatLbs:27.3,  leanLbs:155.7,  note:"Current scan", current:true },
  { date:"Jan 23, 2026", source:"DXA",   platform:"Pueblo · Hologic",    weight:216.0, fatPct:26.4, fatLbs:56.47, leanLbs:149.81, note:"Pre-Wegovy baseline", baseline:true },
  { date:"May 23, 2025", source:"Styku", platform:"3D optical",          weight:212.0, fatPct:21.1, fatLbs:44.8,  leanLbs:160.3,  note:"3D optical — not comparable to DXA", notComparable:true },
  { date:"Feb 14, 2025", source:"Styku", platform:"3D optical",          weight:208.0, fatPct:23.9, fatLbs:49.8,  leanLbs:151.7,  note:"3D optical — not comparable to DXA", notComparable:true },
];

// Hume Health Pod — daily BIA readings (Dec 2025–Mar 2026)
// Weight corrected from lbs stored in Apple Health. BF% from BIA — trends valid, absolute values ~11pts lower than DXA.
export const HUME_DATA=[
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
// RMR from two sources — label which is which; they are not interchangeable.
export const RMR_SOURCES = [
  { source:"CardioCoach (measured)", value:1858, date:"2025", method:"Indirect calorimetry — measured", note:"−8% vs predicted" },
  { source:"BodySpec DXA (estimated)", value:2177, date:"Sep 2, 2026", method:"Estimated from lean mass", note:"Higher because lean mass rose to 155.7 lbs" },
];
export const RMR = { measured:1858, dxaEstimated:2177, lifestyle:1300, exercise:232, total:3390, maintenanceLow:1858, maintenanceHigh:3158, weightLossLow:1488, weightLossHigh:1858, comparison:"NORMAL (-8%)", rer:0.85 };

// LATEST — all body comp derived from most recent Hume Pod reading
const _humeLatest    = HUME_DATA.length > 0 ? HUME_DATA[0] : null;
const _humeOldest7   = HUME_DATA.length >= 7 ? HUME_DATA[6] : HUME_DATA[HUME_DATA.length-1];
const _importedStored= (()=>{ try{ return !!localStorage.getItem("vital_hume_imported"); }catch(e){ return false; }})();

// LATEST — the Sep 2 2026 DXA is the authoritative current snapshot. The Hume
// BIA series ends in March 2026 at ~213 lbs and is now 6 months stale, so it
// only supplies the short-term weight trend, not the headline numbers.
const _dxaIsNewer = !_humeLatest || _humeLatest.d < "2026-09-02";

export const LATEST = {
  weight:       _dxaIsNewer ? DXA_CURRENT.weight : _humeLatest.wt,
  weightDate:   _dxaIsNewer ? "2026-09-02" : _humeLatest.d,
  weightSource: _dxaIsNewer ? "DXA · BodySpec" : (_importedStored ? "Hume (imported)" : "Hume Pod"),
  weight7dAgo:  _humeOldest7 ? _humeOldest7.wt : null,
  weight7dDelta:(_humeLatest && _humeOldest7) ? +(_humeLatest.wt - _humeOldest7.wt).toFixed(1) : null,
  bodyFat:      _dxaIsNewer ? DXA_CURRENT.totalFatPct  : _humeLatest.bf,
  leanMass:     _dxaIsNewer ? DXA_CURRENT.totalLeanLbs : +(_humeLatest.wt * (1 - _humeLatest.bf/100)).toFixed(1),
  fatMass:      _dxaIsNewer ? DXA_CURRENT.totalFatLbs  : +(_humeLatest.wt * _humeLatest.bf/100).toFixed(1),
  bmi:          _dxaIsNewer ? DXA_CURRENT.bmi          : +(_humeLatest.bmi || (_humeLatest.wt / (72*72) * 703)).toFixed(1),
  bmr:1858, bmrDxa:2177, healthRisk:0,
  humeStale:    _dxaIsNewer && !!_humeLatest,
  humeLastDate: _humeLatest ? _humeLatest.d : null,
};

// Multi-method body fat anchors (DXA + Styku = gold standard, Hume = BIA trend)
export const BF_TREND = [
  {d:"Feb '25",v:23.9,src:"Styku"},{d:"May '25",v:21.1,src:"Styku"},
  {d:"Jan '26",v:26.4,src:"DXA"},{d:"Sep '26",v:14.3,src:"DXA"},
];
export const LM_TREND = [
  {d:"Feb '25",v:151.7,src:"Styku"},{d:"May '25",v:160.3,src:"Styku"},
  {d:"Jan '26",v:149.8,src:"DXA"},{d:"Sep '26",v:155.7,src:"DXA"},
];
// Hume daily weight trend (BIA scale, corrected lbs)
export const HUME_WT_TREND = HUME_DATA.slice().reverse().map(r=>({d:r.d.slice(5),v:r.wt}));
// Hume BF trend (BIA — offset from DXA but useful for daily direction)
export const HUME_BF_TREND = HUME_DATA.slice().reverse().map(r=>({d:r.d.slice(5),v:r.bf}));

// Latest Hume weight (first entry in HUME_DATA) for WEIGHT_LOG display
export const HUME_LATEST_WT = HUME_DATA.length>0 ? HUME_DATA[0].wt : null;
export const WEIGHT_LOG=[
  {date:"2023-12-01",weight:203.0,source:"Clinic"},
  {date:"2024-06-19",weight:200.0,source:"Clinic"},
  {date:"2025-02-14",weight:208.0,source:"Styku"},
  {date:"2025-05-23",weight:212.0,source:"Styku"},
  {date:"2026-01-23",weight:216.0,source:"DXA"},
  {date:"2026-08-25",weight:189.0,source:"Current"},
  {date:"2026-09-02",weight:191.1,source:"DXA (BodySpec)"},
  ...(HUME_LATEST_WT?[{date:HUME_DATA[0].d,weight:HUME_LATEST_WT,source:"Hume BIA"}]:[]),
];

// Current weight — post-Wegovy (started ~Feb 2026). The Jan 2026 DXA is the
// pre-Wegovy baseline, not a current reading.
export const CURRENT_WEIGHT = {
  weight: 191.1, bodyFat: 14.3, leanMass: 155.7, bmi: 25.9,
  date: "Sep 2, 2026", source: "DXA · BodySpec",
  deltaSinceBaseline: -24.9,
};
