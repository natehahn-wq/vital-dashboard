// Medical record — medications, supplements, allergies, condition history,
// family history, and the preventive-care screening tracker.
// This is the authoritative clinical layer; lab pages reference it for context.

export const MEDICATIONS = [
  {
    name: "Rosuvastatin", dose: "40 mg", freq: "daily", started: "~May 2024",
    indication: "Long-standing high LDL",
    note: "Max-intensity statin. Abnormal lipid panels 2014, 2017, 2020, 2023, May 2024 preceded it.",
    critical: false,
  },
  {
    name: "Xarelto (rivaroxaban)", dose: "10 mg", freq: "daily", started: "2017",
    indication: "Secondary prevention — indefinite",
    note: "Following the 2017 pulmonary embolism. No NSAIDs without doctor sign-off.",
    critical: true,
  },
  {
    name: "Oral Wegovy (semaglutide)", dose: "—", freq: "daily", started: "Feb 17, 2026",
    startDate: "2026-02-17",
    indication: "Weight management",
    note: "Primary driver of the 216 → 189 lb weight loss. Use Feb 17 2026 as the era boundary on weight and lab trends.",
    critical: false,
  },
];

export const SUPPLEMENTS_CURRENT = [
  { name:"Creatine",      dose:"~5 g",  timing:"daily",           note:"Inflates serum creatinine — see eGFR interpretation" },
  { name:"Melatonin",     dose:"12 mg", timing:"nightly" },
  { name:"Magnesium",     dose:"135 mg",timing:"nightly" },
  { name:"LMNT electrolyte", dose:"1 packet", timing:"pre-workout" },
];

export const SUPPLEMENTS_STOPPED = [
  { name:"Vitamin D", stopped:"~Feb 2026", impact:"May 2025 value of 36.5 was ON supplementation. Aug 2026 shows unsupplemented baseline." },
  { name:"DHEA",      stopped:"~Feb 2026", impact:"Explains the DHEA-S 460 (high) in May 2025. Expect normalization on recheck." },
  { name:"Omega-3",   stopped:"~Feb 2026", impact:"Expect the AA/EPA ratio to have worsened on the pending panel." },
];

export const ALLERGIES = [
  {
    allergen: "Iodinated contrast media",
    reaction: "Hives and rash",
    documented: "Cedars-Sinai",
    severity: "significant",
    action: "Any contrast CT requires a premedication plan.",
  },
];

export const CONDITIONS = [
  {
    date: "2017-03-10", dateLabel: "Mar 10, 2017",
    title: "Unprovoked pulmonary embolism",
    facility: "Providence Saint John's ER",
    status: "resolved-ongoing-tx",
    severity: "major",
    detail: "Small, right lower lobe subsegmental.",
    findings: [
      "Bilateral leg ultrasound: no DVT source",
      "Full thrombophilia workup NEGATIVE — Factor V Leiden neg, prothrombin G20210A neg, protein C/S, antithrombin, antiphospholipid panel all normal",
      "Nov 1, 2017 repeat CTA: emboli still present + small pulmonary infarct → indefinite anticoagulation",
    ],
    incidental: "Celiac artery angulation suggestive of MALS — never symptomatic.",
  },
  {
    date: "2023-12-01", dateLabel: "Dec 2023",
    title: "Shingles (VZV-confirmed)",
    status: "resolved",
    severity: "moderate",
    detail: "Left occipital/temporal scalp. Treated with Valtrex, resolved.",
    findings: ["Makes me a Shingrix vaccine candidate before age 50"],
  },
  {
    date: "2024-06-05", dateLabel: "Jun 5, 2024",
    title: "Colonoscopy",
    facility: "Cedars-Sinai",
    status: "resolved",
    severity: "moderate",
    detail: "Small tubular adenoma removed (ascending colon) + benign hyperplastic rectal polyp.",
    findings: ["Surveillance colonoscopy due ~2031"],
  },
  {
    date: "2024-06-19", dateLabel: "Jun 19, 2024",
    title: "Echocardiogram",
    status: "clear",
    severity: "minor",
    detail: "EF 69%, normal pulmonary pressure (PASP 21), no residual strain from the PE, mild mitral regurgitation (insignificant).",
    findings: ["Clean — no lasting cardiac impact from the 2017 PE"],
  },
  {
    date: "2024-07-01", dateLabel: "Mid-2024",
    title: "Full-body dermatology skin check",
    status: "clear",
    severity: "minor",
    detail: "All clear.",
    findings: [],
  },
];

export const FAMILY_HISTORY = [
  {
    relation: "Grandmother", condition: "Colon cancer", ageAtDx: "80s",
    degree: "second-degree",
    risk: "mild",
    note: "Second-degree relative with late onset — mild risk factor only.",
  },
];

export const SCREENINGS = [
  {
    name: "Colonoscopy", lastDone: "Jun 2024", nextDue: "~2031",
    status: "current",
    note: "Tubular adenoma removed — 7-year surveillance interval.",
  },
  {
    name: "Skin check", lastDone: "Mid-2024", nextDue: "Annual — overdue",
    status: "overdue",
    note: "Book now. Annual cadence, last done mid-2024.",
  },
  {
    name: "Shingrix vaccine", lastDone: "Never", nextDue: "Discuss with PCP",
    status: "action",
    note: "Shingles history at 45 makes this a candidate before age 50.",
  },
  {
    name: "CAC (coronary calcium) scan", lastDone: "Never", nextDue: "Recommended",
    status: "action",
    note: "A decade of pre-statin high LDL — worth a baseline calcium score.",
  },
  {
    name: "Lp(a)", lastDone: "Jul 2024", nextDue: "Never again",
    status: "closed",
    note: "23 — normal. Genetic marker, once-in-a-lifetime test. Permanently closed.",
  },
  {
    name: "Comprehensive labs", lastDone: "Aug 2026", nextDue: "Annual",
    status: "current",
    note: "Quest / WHOOP Advanced Labs — resulted. Testosterone, hs-CRP, cystatin C, insulin, B12 still processing.",
  },
  {
    name: "DHEA-S recheck", lastDone: "Aug 2026", nextDue: "Discuss with PCP",
    status: "action",
    note: "Fell to 54 (below the 61 floor) after stopping the supplement. Decide whether to restart at a lower dose.",
  },
  {
    name: "Iron saturation recheck", lastDone: "Aug 2026", nextDue: "Next draw",
    status: "action",
    note: "19% against a 20 floor. Ferritin and CBC are clean, so recheck rather than treat.",
  },
  {
    name: "DXA body composition", lastDone: "Jan 2026", nextDue: "~Annual",
    status: "pending",
    note: "New BodySpec scan pending — Jan 2026 is the pre-Wegovy baseline.",
  },
  {
    name: "VO2max test", lastDone: "Never", nextDue: "Purchased — pending",
    status: "pending",
    note: "Test purchased, not yet scheduled.",
  },
];

export const BP_LOG = [
  { date:"2026-08-01", dateLabel:"Aug 2026", systolic:117, diastolic:71 },
  { date:"2024-06-19", dateLabel:"Jun 2024", systolic:114, diastolic:74 },
  { date:"2023-12-01", dateLabel:"Dec 2023", systolic:120, diastolic:77 },
];

// Interpretation lenses applied to lab values across the dashboard. Each one
// names the confounder so a value isn't read as a lifestyle signal when a drug
// or supplement explains it.
export const LAB_CONTEXT = {
  lipids: {
    title: "On max-intensity statin — best panel on record",
    body: "LDL 57, total cholesterol 135, non-HDL 75 (Aug 2026). These are treated values, not lifestyle-only — rosuvastatin 40 mg since ~May 2024. LDL has gone 85 → 71 → 57 on therapy.",
    tone: "info",
  },
  egfr: {
    title: "Solved — creatine artifact, not kidney decline",
    body: "The full sequence is 93 (May '24, creat 1.01) → 97 (Feb '25, creat 0.90) → 77 (May '25, creat 1.10) → 79 (Aug '26, creat 1.15). The drop lands exactly between Feb and May 2025, which is when creatine supplementation (~5 g/day) began. Creatine plus high muscle mass both raise creatinine and mechanically lower a creatinine-based eGFR. Kidneys documented normal, urinalysis normal 2024. Cystatin C (pending) confirms.",
    tone: "info",
  },
  dheas: {
    title: "Full arc — native low, supplemented high, now near baseline",
    body: "119.1 native baseline (LOW, Feb '25, pre-supplement) → 460.3 (HIGH, May '25, on DHEA) → 54 (LOW, Aug '26, off it since Feb 2026). The 54 is only modestly below his own native baseline, so this is a return toward where he actually sits rather than a new problem. Recheck in 3–4 months; no supplement restart.",
    tone: "info",
  },
  vitaminD: {
    title: "Higher off the supplement than on it",
    body: "Vitamin D was 36.5 while supplementing, and is 57 now with the supplement stopped since ~Feb 2026. Sun exposure and the late-August draw likely explain it. No restart needed.",
    tone: "info",
  },
  testosterone: {
    title: "Acceptable — retest at weight-stable maintenance",
    body: "Corrected full history: 560 (Feb '25, BioLab) → 377 (May '25) → 413 (Aug '26, LC/MS, 7 AM fasted, off DHEA six months). The 413 is the first clean draw, taken during an active ~27 lb semaglutide deficit that suppresses T by 10–25%. Not hypogonadal — that needs <300 twice plus symptoms, and LH 5.4 / FSH 8.7 are both normal. Plan: retest once at maintenance in 3–6 months. Only if it is still <400 there does the unrepaired bilateral varicocele conversation resurface with urology. TRT is not on the table given the 2017 PE and Xarelto.",
    tone: "info",
  },
  insulin: {
    title: "Optimal — a long-standing gap now closed",
    body: "First-ever insulin measurement: 5.4 µIU/mL fasting, giving HOMA-IR 1.25 (concern starts at 2.0). Insulin-sensitive, and achieved while on rosuvastatin 40 mg, which nudges glucose upward. This downgrades the Jan '26 metabolic concern that rested on VAT 118 and glucose 97; pair it with the pending DXA for the full picture.",
    tone: "info",
  },
  omega3: {
    title: "Optimal without supplementation",
    body: "Omega-3 index 6.8% (optimal ≥5.5) measured six months AFTER stopping fish oil — diet alone is sustaining it, so no restart is needed. Arachidonic acid sits at the top of range and the AA/EPA ratio is 14.2, but with the index at 6.8 and hs-CRP <0.2 there is no inflammatory signal to act on. Linoleic acid 16.7 is lab-flagged low; that reflects a low-seed-oil diet and is benign, not a deficiency.",
    tone: "info",
  },
  hscrp: {
    title: "Third consecutive optimal value",
    body: "hs-CRP <0.2 mg/L. Across 18 months: 0.9 → 0.1 → <0.2. Systemic inflammation is consistently absent.",
    tone: "info",
  },
  fastingStatus: {
    title: "Both 2025 BioLab draws were non-fasting",
    body: "Feb 14 and May 23 2025 were both collected RANDOM per the reports. The Feb TG 183 (high) and HDL 38 (low) flags are fasting-status artifacts, not real events — fasted TG has been 66–102 in every other draw from 2024 to 2026. Treat those two points as not comparable to fasted draws.",
    tone: "caution",
  },
  statinEra: {
    title: "A decade of high LDL before treatment",
    body: "Documented pre-statin: LDL 158 (2014), 157 (2017), 167 (2020), 181 (Dec 2023), 195 (May 2024) with total cholesterol peaking at 273. Rosuvastatin 40 mg started ~May 2024 and LDL fell to 85 within three months, reaching 57 by Aug 2026. That untreated decade is the argument for the CAC scan.",
    tone: "info",
  },
  ck: {
    title: "No myopathy signal",
    body: "CK came back 86 U/L (ref 26–366) on Aug 2026 — comfortably normal despite statin therapy plus heavy training. The concern is closed.",
    tone: "info",
  },
  ferritin: {
    title: "Xarelto bleed watch — clean",
    body: "Ferritin 153 (down from 178 but well within range), hemoglobin 14.3, platelets 184, and a normal reticulocyte count. No signal of silent GI blood loss on anticoagulation.",
    tone: "info",
  },
  ironSat: {
    title: "Marginally low iron saturation",
    body: "% saturation 19 against a 20 floor, with iron 59 and TIBC 313. Ferritin 153 and a fully normal CBC argue against true iron deficiency — this reads as a soft flag to recheck, not to start iron.",
    tone: "caution",
  },
  cortisol: {
    title: "Read against the AM reference",
    body: "Cortisol 18.1 was a 07:15 draw, so the 7–9am range (4.0–22.0) applies — upper-normal, not high. Against the 4pm range it would look elevated, which is the wrong comparison.",
    tone: "info",
  },
};
