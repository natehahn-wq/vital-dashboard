// Lab panels — three blood draws (Feb '25 BioLab, May '25 BioLab, Jan '26 ExamOne/Quest),
// plus historical trend data, reference ranges, and freshness tracking.
//
// LABS_MERGED stitches the most recent value for each domain across the two
// most recent draws (Jan 2026 lipid/metabolic/liver from ExamOne, May 2025
// hormones/special from BioLab).

// Jul 31, 2024 · Cedars-Sinai — first post-statin lipid panel (rosuvastatin 40mg
// started ~May 2024) plus the once-in-a-lifetime Lp(a).
export const LABS_2024 = {
  date: "Jul 31, 2024", source:"Cedars-Sinai",
  panels: {
    lipids: [
      { name:"Total Cholesterol", val:160, unit:"mg/dL", range:"<200",  status:"normal" },
      { name:"Triglycerides",     val:91,  unit:"mg/dL", range:"0–150", status:"normal" },
      { name:"HDL",               val:57,  unit:"mg/dL", range:"≥40",   status:"normal" },
      { name:"LDL",               val:85,  unit:"mg/dL", range:"<100",  status:"normal" },
      { name:"VLDL",              val:18,  unit:"mg/dL", range:"5–40",  status:"normal" },
      { name:"Chol/HDL Ratio",    val:2.8, unit:"ratio", range:"0–5.0", status:"normal" },
      { name:"Lipoprotein(a)",    val:23,  unit:"nmol/L",range:"<75",   status:"normal",
        note:"Normal. Genetic marker — once-in-a-lifetime test, permanently closed." },
    ],
  },
};

// Feb 14, 2025 · BioLab — transcribed from the ORIGINAL report, which supersedes
// anything previously imported.
// ⚠ NON-FASTING: specimen status "RANDOM" (9 AM). The TG 183 (high) and HDL 38 (low)
// flags are fasting-status artifacts — fasted TG has been 66–102 across every other
// draw 2024–2026. Glucose 98 is likewise post-prandial.
export const LABS_PRIOR2 = {
  date: "Feb 14, 2025", source:"BioLab",
  fasting: false,
  fastingNote: "Specimen collected RANDOM (non-fasting, 9 AM). Lipids and glucose are not directly comparable to fasted draws.",
  panels: {
    metabolic: [
      { name:"Glucose",     val:98,    unit:"mg/dL",  range:"65–99",    status:"normal", nonFasting:true,
        note:"Non-fasting draw — not comparable to fasted glucose." },
      { name:"BUN",         val:17.0,  unit:"mg/dL",  range:"8.9–20.6", status:"normal" },
      { name:"Creatinine",  val:0.9,   unit:"mg/dL",  range:"0.75–1.25",status:"normal" },
      { name:"eGFR",        val:97,    unit:"mL/min", range:">60",      status:"normal",
        note:"Pre-creatine baseline — filtration was excellent here." },
      { name:"ALT/SGPT",    val:39,    unit:"U/L",     range:"0–45",     status:"normal" },
      { name:"AST/SGOT",    val:22,    unit:"U/L",     range:"5–34",     status:"normal" },
      { name:"HbA1c",       val:5.2,   unit:"%",       range:"<5.7",     status:"normal" },
      { name:"WBC",         val:9.5,   unit:"K/uL",    range:"3.8–10.8", status:"normal" },
    ],
    lipids: [
      { name:"Total Cholesterol",val:162, unit:"mg/dL", range:"<200",  status:"normal" },
      { name:"Triglycerides",    val:183, unit:"mg/dL", range:"0–150", status:"high", nonFasting:true,
        note:"NON-FASTING artifact. Fasted TG has been 66–102 in every other draw (2024–2026) — not a real spike." },
      { name:"HDL",              val:38,  unit:"mg/dL", range:"≥40",   status:"low",  nonFasting:true,
        note:"NON-FASTING artifact — reads low on random specimens. Fasted HDL has been 57–62." },
      { name:"LDL (calc)",       val:87,  unit:"mg/dL", range:"<100",  status:"normal" },
      { name:"Chol/HDL Ratio",   val:4.3, unit:"ratio", range:"0–5.0", status:"normal", nonFasting:true },
      { name:"ApoB",             val:71,  unit:"mg/dL", range:"49–173",status:"normal" },
      { name:"CRP-Cardiac",      val:0.9, unit:"mg/L",  range:"0–3.0", status:"normal" },
    ],
    hormones: [
      { name:"Testosterone (Total)", val:560.0, unit:"ng/dL",  range:"300–890",     status:"normal",
        note:"Native pre-supplement baseline. The later fall to 377 is a DECLINE from here, not an improvement." },
      { name:"Free Testosterone",    val:10.8,  unit:"ng/dL",  range:"4.26–16.4",   status:"normal",
        note:"Free T 1.93% of total." },
      { name:"SHBG",                 val:35,    unit:"nmol/L", range:"13.3–89.5",   status:"normal" },
      { name:"DHEA-S",               val:119.1, unit:"µg/dL",  range:"136.2–447.6", status:"low",
        note:"NATIVE baseline, pre-supplement — genuinely low before any DHEA was taken." },
      { name:"TSH",                  val:1.30,  unit:"µIU/mL", range:"0.35–4.94",   status:"normal" },
      { name:"Cortisol",             val:11.7,  unit:"µg/dL",  range:"4.0–22.0",    status:"normal" },
      { name:"LH",                   val:2.95,  unit:"mIU/mL", range:"1.5–9.3",     status:"normal" },
      { name:"Estradiol",            val:24,    unit:"pg/mL",  range:"<39",         status:"normal",
        note:"Reported as <24." },
      { name:"Vitamin D",            val:26.5,  unit:"ng/mL",  range:"30–100",      status:"low"    },
    ],
    special: [
      { name:"Ferritin",      val:394.5, unit:"ng/mL",  range:"21.8–274.7",status:"high"   },
      { name:"Vitamin D",     val:26.5,  unit:"ng/mL",  range:"30–100",    status:"low"    },
      { name:"Homocysteine",  val:12.3,  unit:"µmol/L", range:"5.5–16.2",  status:"normal" },
      { name:"PSA",           val:0.845, unit:"ng/mL",  range:"0–4.0",     status:"normal" },
    ],
  },
};

// May 23, 2025 · BioLab. ⚠ NON-FASTING: specimen status "RANDOM" per the report.
export const LABS_PRIOR = {
  date: "May 23, 2025", source:"BioLab",
  fasting: false,
  fastingNote: "Specimen collected RANDOM (non-fasting). Lipids and glucose not directly comparable to fasted draws.",
  panels: {
    metabolic: [
      { name:"Glucose",     val:84,    unit:"mg/dL",  range:"65–99",    status:"normal", prev:98, nonFasting:true },
      { name:"BUN",         val:21.0,  unit:"mg/dL",  range:"8.9–20.6", status:"high",   prev:17.0},
      { name:"Creatinine",  val:1.1,   unit:"mg/dL",  range:"0.75–1.25",status:"normal", prev:0.9 },
      { name:"eGFR",        val:77,    unit:"mL/min", range:">60",      status:"normal", prev:97,
        note:"Drop from 97 lands exactly where creatine supplementation began — artifact, not kidney decline." },
      { name:"Sodium",      val:135,   unit:"mmol/L",  range:"136–145",  status:"low",    prev:139 },
      { name:"ALT/SGPT",    val:28,    unit:"U/L",     range:"0–45",     status:"normal", prev:39  },
      { name:"AST/SGOT",    val:26,    unit:"U/L",     range:"5–34",     status:"normal", prev:22  },
      { name:"HbA1c",       val:5.3,   unit:"%",       range:"<5.7",     status:"normal", prev:5.2 },
    ],
    lipids: [
      { name:"Total Cholesterol",val:139, unit:"mg/dL", range:"<200",  status:"normal", prev:162 },
      { name:"Triglycerides",    val:66,  unit:"mg/dL", range:"0–150", status:"normal", prev:183, nonFasting:true },
      { name:"HDL",              val:60,  unit:"mg/dL", range:"≥40",   status:"normal", prev:38,  nonFasting:true },
      { name:"LDL (calc)",       val:64,  unit:"mg/dL", range:"<100",  status:"normal", prev:87  },
      { name:"Chol/HDL Ratio",   val:2.3, unit:"ratio", range:"0–5.0", status:"normal", prev:4.3 },
      { name:"CRP-Cardiac",      val:0.1, unit:"mg/L",  range:"0–3.0", status:"normal", prev:0.9 },
      { name:"ApoB",             val:66,  unit:"mg/dL", range:"49–173",status:"normal", prev:null},
    ],
    hormones: [
      { name:"Testosterone (Total)", val:377.1, unit:"ng/dL",  range:"300–890",     status:"normal", prev:560.0,
        note:"DECLINE from the 560 native baseline, coinciding with starting a DHEA supplement. The Aug 2026 redraw is the tiebreaker between outlier and real decline." },
      { name:"Free Testosterone",    val:6.99,  unit:"ng/dL",  range:"4.26–16.4",   status:"normal", prev:10.8 },
      { name:"SHBG",                 val:34,    unit:"nmol/L", range:"13.3–89.5",   status:"normal", prev:35   },
      { name:"DHEA-S",               val:460.3, unit:"µg/dL",  range:"136.2–447.6", status:"high",   prev:119.1,
        note:"ON DHEA supplement — a ~4x jump from the 119.1 native baseline." },
      { name:"TSH",                  val:1.21,  unit:"µIU/mL", range:"0.35–4.94",   status:"normal", prev:1.30 },
      { name:"Vitamin D",            val:36.5,  unit:"ng/mL",  range:"30–100",      status:"normal", prev:26.5 },
      { name:"Estradiol",            val:36,    unit:"pg/mL",  range:"<39",         status:"normal", prev:24   },
      { name:"Cortisol",             val:9.1,   unit:"µg/dL",  range:"4.0–22.0",    status:"normal", prev:11.7 },
      { name:"LH",                   val:4.3,   unit:"mIU/mL", range:"1.5–9.3",     status:"normal", prev:2.95,
        note:"Normal — pituitary signaling intact, so testosterone 377 is not central hypogonadism" },
    ],
    special: [
      { name:"Ferritin",      val:178.2, unit:"ng/mL",  range:"21.8–274.7",status:"normal", prev:394.5},
      { name:"Vitamin D",     val:36.5,  unit:"ng/mL",  range:"30–100",    status:"normal", prev:26.5 },
      { name:"DHEA-S",        val:460.3, unit:"µg/dL",  range:"136.2–447.6",status:"high",  prev:119.1},
      { name:"Homocysteine",  val:10.2,  unit:"µmol/L", range:"5.5–16.2",  status:"normal", prev:12.3 },
      { name:"PSA",           val:0.766, unit:"ng/mL",  range:"0–4.0",     status:"normal", prev:0.845},
    ],
  },
};

// Aug 25, 2026 · Quest (WHOOP Advanced Labs) — fasting, collected 07:15.
// The big panel. Most of what was pending has resulted; testosterone/SHBG,
// hs-CRP, cystatin C, insulin, B12/folate, IGF-1 and OmegaCheck still processing.
export const LABS_AUG2026 = {
  date: "Aug 25, 2026",
  source: "Quest · WHOOP Advanced Labs",
  collected: "07:15, fasting",
  note: "Partial report — see LABS_PENDING for markers still in progress.",
  panels: {
    metabolic: [
      { name:"Glucose",        val:94,   unit:"mg/dL",  range:"65–99",    status:"normal", prev:97 },
      { name:"BUN",            val:16,   unit:"mg/dL",  range:"7–25",     status:"normal", prev:16 },
      { name:"Creatinine",     val:1.15, unit:"mg/dL",  range:"0.60–1.29",status:"normal", prev:1.0,
        note:"Up from 1.0. Creatine supplementation + muscle mass both inflate this — Cystatin C pending is the clean read." },
      { name:"eGFR",           val:79,   unit:"mL/min", range:">60",      status:"normal", prev:77,
        note:"Improved from 77. Creatinine-based, so still confounded — Cystatin C eGFR pending." },
      { name:"Sodium",         val:139,  unit:"mmol/L", range:"135–146",  status:"normal", prev:135 },
      { name:"Potassium",      val:4.3,  unit:"mmol/L", range:"3.5–5.3",  status:"normal", prev:4.7 },
      { name:"Chloride",       val:102,  unit:"mmol/L", range:"98–110",   status:"normal", prev:100 },
      { name:"Carbon Dioxide", val:29,   unit:"mmol/L", range:"20–32",    status:"normal", prev:25 },
      { name:"Calcium",        val:9.9,  unit:"mg/dL",  range:"8.6–10.3", status:"normal", prev:9.1 },
      { name:"Total Protein",  val:7.1,  unit:"g/dL",   range:"6.1–8.1",  status:"normal", prev:8.1 },
      { name:"Albumin",        val:4.9,  unit:"g/dL",   range:"3.6–5.1",  status:"normal", prev:5.5,
        note:"RESOLVED — was 5.5 (high) in Jan '26, now solidly normal." },
      { name:"Globulin",       val:2.2,  unit:"g/dL",   range:"1.9–3.7",  status:"normal", prev:2.6 },
      { name:"Albumin/Globulin",val:2.2, unit:"ratio",  range:"1.0–2.5",  status:"normal", prev:1.9 },
      { name:"Magnesium",      val:2.2,  unit:"mg/dL",  range:"1.5–2.5",  status:"normal", prev:null,
        note:"First measurement — confirms the 135 mg nightly dose is sufficient." },
    ],
    lipids: [
      { name:"Total Cholesterol", val:135, unit:"mg/dL", range:"<200",  status:"normal", prev:149 },
      { name:"HDL",               val:60,  unit:"mg/dL", range:"≥40",   status:"normal", prev:62 },
      { name:"Triglycerides",     val:93,  unit:"mg/dL", range:"<150",  status:"normal", prev:80 },
      { name:"LDL",               val:57,  unit:"mg/dL", range:"<100",  status:"normal", prev:71,
        note:"Best LDL on record. Martin-Hopkins calc. Rosuvastatin 40 mg working." },
      { name:"Chol/HDL Ratio",    val:2.3, unit:"ratio", range:"<5.0",  status:"normal", prev:2.4 },
      { name:"Non-HDL Chol",      val:75,  unit:"mg/dL", range:"<130",  status:"normal", prev:null },
    ],
    liver: [
      { name:"Alkaline Phosphatase",val:49, unit:"U/L",   range:"36–130",  status:"normal", prev:48 },
      { name:"Total Bilirubin",     val:0.7,unit:"mg/dL", range:"0.2–1.2", status:"normal", prev:0.8 },
      { name:"AST",                 val:21, unit:"U/L",   range:"10–40",   status:"normal", prev:21 },
      { name:"ALT",                 val:40, unit:"U/L",   range:"9–46",    status:"normal", prev:24,
        note:"Up from 24 but in range. Watch on the next draw." },
    ],
    hormones: [
      { name:"DHEA-S",        val:54,  unit:"µg/dL",  range:"61–442", status:"low",    prev:460.3,
        note:"Overcorrected. Was 460 (high) on supplementation; stopped ~Feb 2026 and it fell to 54 — now below range." },
      { name:"Cortisol",      val:18.1,unit:"µg/dL",  range:"4.0–22.0",status:"normal", prev:9.1,
        note:"7:15am draw — AM reference is 4.0–22.0, so upper-normal, not high. Diurnal peak." },
      { name:"TSH",           val:1.52,unit:"mIU/L",  range:"0.40–4.50",status:"normal",prev:1.21 },
      { name:"Free T4",       val:1.4, unit:"ng/dL",  range:"0.8–1.8", status:"normal", prev:null,
        note:"First measurement — thyroid panel now complete and clean." },
      { name:"Free T3",       val:3.2, unit:"pg/mL",  range:"2.3–4.2", status:"normal", prev:null,
        note:"First measurement." },
      { name:"Estradiol",     val:30,  unit:"pg/mL",  range:"<39",     status:"normal", prev:36,
        note:"Reported as <30. Fell with fat mass after −27 lb, as expected." },
      { name:"LH",            val:5.4, unit:"mIU/mL", range:"1.5–9.3", status:"normal", prev:4.3 },
      { name:"FSH",           val:8.7, unit:"mIU/mL", range:"1.4–12.8",status:"normal", prev:null,
        note:"First measurement — with LH normal, pituitary signaling is intact." },
      { name:"Vitamin D",     val:57,  unit:"ng/mL",  range:"30–100",  status:"normal", prev:36.5,
        note:"HIGHER off supplementation than on it (36.5 → 57). No restart needed." },
    ],
    special: [
      { name:"Ferritin",        val:153, unit:"ng/mL",  range:"38–380",  status:"normal", prev:178.2,
        note:"Down from 178 but comfortably normal. Xarelto bleed-watch marker — no concern." },
      { name:"Iron, Total",     val:59,  unit:"µg/dL",  range:"50–180",  status:"normal", prev:null },
      { name:"TIBC",            val:313, unit:"µg/dL",  range:"250–425", status:"normal", prev:null },
      { name:"% Saturation",    val:19,  unit:"%",      range:"20–48",   status:"low",    prev:null,
        note:"Marginally low (19 vs 20 floor). Ferritin 153 and a clean CBC argue against real iron deficiency — recheck rather than treat." },
      { name:"Creatine Kinase", val:86,  unit:"U/L",    range:"26–366",  status:"normal", prev:null,
        note:"Normal — no statin myopathy signal despite heavy training." },
      { name:"Vitamin D",       val:57,  unit:"ng/mL",  range:"30–100",  status:"normal", prev:36.5 },
      { name:"Homocysteine",    val:10.2,unit:"µmol/L", range:"5.5–16.2",status:"normal", prev:12.3, notRedrawn:true, drawDate:"May 23, 2025" },
      { name:"PSA",             val:0.766,unit:"ng/mL", range:"0–4.0",   status:"normal", prev:0.845,notRedrawn:true, drawDate:"May 23, 2025" },
    ],
    cbc: [
      { name:"WBC",               val:5.8,   unit:"K/uL",   range:"3.8–10.8",   status:"normal", prev:6.1  },
      { name:"RBC",               val:4.71,  unit:"M/uL",   range:"4.20–5.80",  status:"normal", prev:5.13 },
      { name:"Hemoglobin",        val:14.3,  unit:"g/dL",   range:"13.2–17.1",  status:"normal", prev:15.2 },
      { name:"Hematocrit",        val:44.5,  unit:"%",      range:"39.4–51.1",  status:"normal", prev:45.5 },
      { name:"MCV",               val:94.5,  unit:"fL",     range:"81.4–101.7", status:"normal", prev:null },
      { name:"MCH",               val:30.4,  unit:"pg",     range:"27.0–33.0",  status:"normal", prev:null },
      { name:"MCHC",              val:32.1,  unit:"g/dL",   range:"31.6–35.4",  status:"normal", prev:null },
      { name:"RDW",               val:12.8,  unit:"%",      range:"11.0–15.0",  status:"normal", prev:null },
      { name:"Platelets",         val:184,   unit:"K/uL",   range:"140–400",    status:"normal", prev:206  },
      { name:"MPV",               val:11.6,  unit:"fL",     range:"7.5–12.5",   status:"normal", prev:null },
      { name:"Neutrophils",       val:3178,  unit:"cells/uL",range:"1500–7800", status:"normal", prev:null },
      { name:"Lymphocytes",       val:1972,  unit:"cells/uL",range:"850–3900",  status:"normal", prev:null },
      { name:"Monocytes",         val:481,   unit:"cells/uL",range:"200–950",   status:"normal", prev:null,
        note:"Absolute count normal. The 8.3% differential is not flagged by Quest — it was noise." },
      { name:"Eosinophils",       val:139,   unit:"cells/uL",range:"15–500",    status:"normal", prev:null },
      { name:"Basophils",         val:29,    unit:"cells/uL",range:"0–200",     status:"normal", prev:null },
      { name:"Reticulocytes",     val:56520, unit:"cells/uL",range:"25000–90000",status:"normal",prev:null },
    ],
  },
};

// Lipid/metabolic/liver screen — superseded by LABS_AUG2026 for most domains.
// Retained as the Jan 2026 historical draw.
export const LABS = {
  date: "Jan 15, 2026",
  source: "ExamOne / Quest",
  note: "Lipid, metabolic & liver screen. Hormones, HbA1c, CRP, ApoB not drawn — see May 23 BioLab for those.",
  // Current out-of-range set as of the Aug 25, 2026 Quest panel.
  outOfRange: [
    { name:"DHEA-S",       val:54, unit:"µg/dL", range:"61–442", status:"low",
      note:"Overcorrected after stopping the DHEA supplement (~Feb 2026): 460 high → 54 low. Worth discussing a low-dose restart." },
    { name:"% Saturation", val:19, unit:"%",     range:"20–48",  status:"low",
      note:"Marginally low. Ferritin 153 and a clean CBC argue against true iron deficiency — recheck rather than treat." },
    { name:"BMI",          val:25.6,unit:"",     range:"18.5–24.9",status:"high",
      note:"At ~189 lb, down from 29.4 at 216 lb. BMI ignores lean mass — DXA is the better read." },
  ],
  // Resolved since the prior panel — kept so the improvement is visible.
  resolved: [
    { name:"Albumin",    was:"5.5 g/dL (high)", now:"4.9 g/dL", note:"Fully normal on the Aug 2026 panel." },
    { name:"Monocyte %", was:"8.3% (flagged)",  now:"481 cells/µL", note:"Absolute count normal; Quest does not flag the differential. Was noise." },
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
    cbc: [
      { name:"WBC",               val:5.8,   unit:"K/uL",   range:"3.8–10.8",  status:"normal", prev:6.1  },
      { name:"RBC",               val:4.7,   unit:"M/uL",   range:"4.2–5.8",   status:"normal", prev:5.13 },
      { name:"Hemoglobin",        val:14.3,  unit:"g/dL",   range:"13.2–17.1",  status:"normal", prev:15.2 },
      { name:"Hematocrit",        val:44.5,  unit:"%",      range:"38.5–50.0",  status:"normal", prev:45.5 },
      { name:"MCV",               val:94.5,  unit:"fL",     range:"80.0–100.0", status:"normal", prev:null },
      { name:"MCH",               val:30.4,  unit:"pg",     range:"27.0–33.0",  status:"normal", prev:null },
      { name:"MCHC",              val:32.1,  unit:"g/dL",   range:"32.0–36.0",  status:"normal", prev:null },
      { name:"RDW",               val:12.8,  unit:"%",      range:"11.0–15.0",  status:"normal", prev:null },
      { name:"Platelets",         val:184,   unit:"K/uL",   range:"140–400",    status:"normal", prev:206  },
      { name:"MPV",               val:11.6,  unit:"fL",     range:"7.5–12.5",   status:"normal", prev:null },
      { name:"Neutrophil %",      val:54.8,  unit:"%",      range:"40–70",      status:"normal", prev:null },
      { name:"Neutrophils",       val:3178,  unit:"cells/uL",range:"1500–7800", status:"normal", prev:null },
      { name:"Lymphocyte %",      val:34.0,  unit:"%",      range:"20–45",      status:"normal", prev:null },
      { name:"Lymphocytes",       val:1972,  unit:"cells/uL",range:"850–3900",  status:"normal", prev:null },
      { name:"Monocyte %",        val:8.3,   unit:"%",      range:"2–8",        status:"high",   prev:null },
      { name:"Monocytes",         val:481,   unit:"cells/uL",range:"200–950",   status:"normal", prev:null },
      { name:"Eosinophil %",      val:2.4,   unit:"%",      range:"0–5",        status:"normal", prev:null },
      { name:"Eosinophils",       val:139,   unit:"cells/uL",range:"15–500",    status:"normal", prev:null },
      { name:"Basophil %",        val:0.5,   unit:"%",      range:"0–2",        status:"normal", prev:null },
      { name:"Basophils",         val:29,    unit:"cells/uL",range:"0–200",     status:"normal", prev:null },
      { name:"Reticulocyte Count",val:1.0,   unit:"%",      range:"0.5–2.5",    status:"normal", prev:null },
      { name:"SII",               val:297,   unit:"index",  range:"0–530",      status:"normal", prev:null },
    ],
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

// LABS_MERGED: Aug 25, 2026 Quest panel is now the primary source for
// metabolic / lipids / liver / hormones / special / CBC. Only markers not
// drawn in Aug 2026 carry notRedrawn + their original draw date.
export const LABS_MERGED = {
  date: "Aug 25, 2026",
  panels: {
    metabolic: [
      ...LABS_AUG2026.panels.metabolic,
      { name:"HbA1c",         val:5.4,  unit:"%",     range:"<5.7",   status:"normal", prev:5.3,  notRedrawn:true, drawDate:"Sep 26, 2025" },
    ],
    lipids: [
      ...LABS_AUG2026.panels.lipids,
      { name:"ApoB",          val:66,   unit:"mg/dL", range:"49–173", status:"normal", prev:null, notRedrawn:true, drawDate:"May 23, 2025" },
      { name:"Lipoprotein(a)",val:23,   unit:"nmol/L",range:"<75",    status:"normal", prev:null, notRedrawn:true, drawDate:"Jul 31, 2024",
        note:"Normal. Genetic — once-in-a-lifetime test, permanently closed." },
    ],
    liver:    [...LABS_AUG2026.panels.liver],
    hormones: [...LABS_AUG2026.panels.hormones],
    special:  [...LABS_AUG2026.panels.special],
    cbc:      [...LABS_AUG2026.panels.cbc],
  },
};

// Aug 25, 2026 · Quest — still in progress on the partial report.
// Everything else from this draw has resulted; see LABS_AUG2026.
export const LABS_PENDING = {
  date: "Aug 25, 2026", source: "Quest · WHOOP Advanced Labs",
  note: "Most of the panel has resulted. These are still processing.",
  markers: [
    { name:"Testosterone (Total, MS)",group:"Hormonal", watch:"The headline pending value. First clean baseline — no DHEA on board — but drawn in a Wegovy calorie deficit, which suppresses T. LH 5.4 and FSH 8.7 are both normal, so pituitary signaling is intact whatever the number." },
    { name:"Free Testosterone",       group:"Hormonal", watch:"Read with SHBG. Prior free T 69.9 pg/mL was on DHEA." },
    { name:"SHBG",                    group:"Hormonal", watch:"Rises with weight loss — can lower free T even if total T holds." },
    { name:"hs-CRP",                  group:"Inflammation", watch:"Was 0.1 mg/L in May '25 — near-zero. Confirms whether that held." },
    { name:"Cystatin C + eGFR",       group:"Kidney",   watch:"The definitive kidney read. Creatinine rose to 1.15 and creatinine-based eGFR is 79 — both confounded by creatine and muscle mass. This settles it." },
    { name:"Insulin",                 group:"Metabolic",watch:"With glucose 94, gives HOMA-IR — the first true insulin-resistance read." },
    { name:"Vitamin B12 + Folate",    group:"Vitamins", watch:"Never measured. Relevant to homocysteine 10.2." },
    { name:"IGF-1 (LC/MS)",           group:"Longevity",watch:"Never measured. Growth-axis and longevity marker." },
    { name:"OmegaCheck (EPA/DHA/AA)", group:"Fats",     watch:"Omega-3 supplement stopped ~Feb 2026 — expect the AA/EPA ratio to have worsened." },
  ],
};

// Long-term lab history. Every point below is a documented draw — the previously
// estimated "Feb '23" / "Aug '24" baselines were removed once real records arrived.
// era: pre-statin | on-statin. nonFasting: RANDOM specimen, lipids not comparable.
export const LAB_HISTORY = {
  lipids: [
    { d:"Mar '14",   trig:null, hdl:null, ldl:158, chol:235, apob:null, crp:null, era:"pre-statin" },
    { d:"Feb '17",   trig:152,  hdl:null, ldl:157, chol:237, apob:null, crp:null, era:"pre-statin" },
    { d:"Sep '20",   trig:null, hdl:null, ldl:167, chol:null,apob:null, crp:null, era:"pre-statin" },
    { d:"Dec '23",   trig:null, hdl:null, ldl:181, chol:255, apob:null, crp:null, era:"pre-statin" },
    { d:"May '24",   trig:null, hdl:null, ldl:195, chol:273, apob:null, crp:null, era:"pre-statin" },
    { d:"Jul '24",   trig:91,   hdl:57,   ldl:85,  chol:160, apob:null, crp:null, era:"on-statin" },
    { d:"Feb '25",   trig:183,  hdl:38,   ldl:87,  chol:162, apob:71,  crp:0.9,  era:"on-statin", nonFasting:true },
    { d:"May '25",   trig:66,   hdl:60,   ldl:64,  chol:139, apob:66,  crp:0.1,  era:"on-statin", nonFasting:true },
    { d:"Jan '26",   trig:80,   hdl:62,   ldl:71,  chol:149, apob:null, crp:null, era:"on-statin" },
    { d:"Aug '26",   trig:93,   hdl:60,   ldl:57,  chol:135, apob:null, crp:null, era:"on-statin" },
  ],
  metabolic: [
    { d:"Dec '23",   hba1c:5.2, glucose:null,alt:null,ast:null,egfr:null,creatinine:null },
    { d:"May '24",   hba1c:5.4, glucose:null,alt:null,ast:null,egfr:93,  creatinine:1.01 },
    { d:"Feb '25",   hba1c:5.2, glucose:98,  alt:39, ast:22, egfr:97,  creatinine:0.90, nonFasting:true },
    { d:"May '25",   hba1c:5.3, glucose:84,  alt:28, ast:26, egfr:77,  creatinine:1.10, nonFasting:true },
    { d:"Sep '25",   hba1c:5.4, glucose:null,alt:null,ast:null,egfr:null,creatinine:null },
    { d:"Jan '26",   hba1c:5.4, glucose:97,  alt:24, ast:21, egfr:77,  creatinine:1.00 },
    { d:"Aug '26",   hba1c:5.4, glucose:94,  alt:40, ast:21, egfr:79,  creatinine:1.15 },
  ],
  hormones: [
    { d:"Feb '25",   testo:560,   dheas:119.1, vitd:26.5, tsh:1.30, cortisol:11.7 },
    { d:"May '25",   testo:377.1, dheas:460.3, vitd:36.5, tsh:1.21, cortisol:9.1  },
    { d:"Aug '26",   testo:null,  dheas:54,    vitd:57,   tsh:1.52, cortisol:18.1 },
  ],
  special: [
    { d:"Feb '25",   ferritin:394.5, homocysteine:12.3, psa:0.845 },
    { d:"May '25",   ferritin:178.2, homocysteine:10.2, psa:0.766 },
    { d:"Aug '26",   ferritin:153,   homocysteine:null, psa:null  },
  ],
  cbc: [
    { d:"Feb '25",   hgb:14.8, wbc:9.5, plt:194, hct:42.4, rbc:4.85 },
    { d:"May '25",   hgb:15.2, wbc:6.1, plt:206, hct:45.5, rbc:5.13 },
    { d:"Aug '26",   hgb:14.3, wbc:5.8, plt:184, hct:44.5, rbc:4.70 },
  ],
};

// Per-metric ref lines {high, low, optimal, color, label, unit}
export const LAB_REFS = {
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
export const PANEL_TREND_KEYS = {
  lipids:   ["trig","hdl","ldl","apob","crp"],
  metabolic:["hba1c","glucose","egfr","alt"],
  hormones: ["testo","dheas","vitd","tsh","cortisol"],
  special:  ["ferritin","homocysteine","psa"],
  cbc:      ["hgb","wbc","hct","rbc"],
};

// Tracks the draw date for every tracked biomarker.
// Drives the "Lab Freshness" alerts on the Goals page and Labs page.
export const LAB_FRESHNESS = [
  // Cardiovascular — Jan 15 2026
  {name:"Triglycerides",      date:"2026-08-25", panel:"Lipids",      targetDays:180, status:"ok"},
  {name:"HDL Cholesterol",    date:"2026-08-25", panel:"Lipids",      targetDays:180, status:"ok"},
  {name:"LDL",                date:"2026-08-25", panel:"Lipids",      targetDays:180, status:"ok"},
  {name:"Chol/HDL Ratio",     date:"2026-08-25", panel:"Lipids",      targetDays:180, status:"ok"},
  {name:"Total Cholesterol",  date:"2026-08-25", panel:"Lipids",      targetDays:180, status:"ok"},

  {name:"ApoB",               date:"2025-05-23", panel:"Lipids",      targetDays:180, status:"overdue"},
  {name:"CRP-Cardiac",        date:"2025-05-23", panel:"Inflammation", targetDays:180, status:"overdue"},
  {name:"Homocysteine",       date:"2025-05-23", panel:"Special",     targetDays:365, status:"due_soon"},
  // Metabolic — Jan 2026
  {name:"Glucose",            date:"2026-08-25", panel:"Metabolic",   targetDays:180, status:"ok"},
  {name:"BUN",                date:"2026-08-25", panel:"Metabolic",   targetDays:365, status:"ok"},
  {name:"Creatinine",         date:"2026-08-25", panel:"Metabolic",   targetDays:365, status:"ok"},
  {name:"ALT",                date:"2026-08-25", panel:"Liver",       targetDays:365, status:"ok"},
  {name:"AST",                date:"2026-08-25", panel:"Liver",       targetDays:365, status:"ok"},
  {name:"GGT",                date:"2026-01-15", panel:"Liver",       targetDays:365, status:"ok"},
  // Metabolic — May 2025
  {name:"HbA1c",              date:"2025-09-26", panel:"Metabolic",   targetDays:180, status:"overdue"},
  // CBC — Aug 25 2026
  {name:"WBC",                date:"2026-08-25", panel:"CBC",         targetDays:180, status:"ok"},
  {name:"RBC",                date:"2026-08-25", panel:"CBC",         targetDays:180, status:"ok"},
  {name:"Hemoglobin",         date:"2026-08-25", panel:"CBC",         targetDays:180, status:"ok"},
  {name:"Hematocrit",         date:"2026-08-25", panel:"CBC",         targetDays:180, status:"ok"},
  {name:"Platelets",          date:"2026-08-25", panel:"CBC",         targetDays:180, status:"ok"},
  {name:"eGFR",               date:"2026-08-25", panel:"Metabolic",   targetDays:365, status:"due_soon"},
  // Hormonal — May 2025
  {name:"Testosterone",       date:"2026-08-25", panel:"Hormones",    targetDays:180, status:"overdue"},
  {name:"Free Testosterone",  date:"2025-05-23", panel:"Hormones",    targetDays:180, status:"overdue"},
  {name:"DHEA-S",             date:"2026-08-25", panel:"Hormones",    targetDays:180, status:"overdue"},
  {name:"TSH",                date:"2026-08-25", panel:"Hormones",    targetDays:365, status:"due_soon"},
  {name:"Vitamin D",          date:"2026-08-25", panel:"Hormones",    targetDays:180, status:"overdue"},
  {name:"Estradiol",          date:"2026-08-25", panel:"Hormones",    targetDays:365, status:"due_soon"},
  {name:"Cortisol",           date:"2026-08-25", panel:"Hormones",    targetDays:365, status:"due_soon"},
  {name:"SHBG",               date:"2025-05-23", panel:"Hormones",    targetDays:365, status:"due_soon"},
  // Special / Longevity — May 2025
  {name:"Ferritin",           date:"2025-05-23", panel:"Special",     targetDays:180, status:"overdue"},
  {name:"PSA",                date:"2025-05-23", panel:"Special",     targetDays:365, status:"due_soon"},
];

// Compute days since last draw — mutates LAB_FRESHNESS in place.
// Uses the real current date; was previously pinned to 2026-03-23, which made
// every draw after that date compute a negative age and mislabel its freshness.
export const TODAY_DATE = new Date();
LAB_FRESHNESS.forEach(b => {
  b.daysSince = Math.floor((TODAY_DATE - new Date(b.date)) / 86400000);
  b.daysUntilDue = b.targetDays - b.daysSince;
  b.pctFresh = Math.max(0, Math.min(100, Math.round((1 - b.daysSince/b.targetDays)*100)));
  if(b.daysSince > b.targetDays) b.status = "overdue";
  else if(b.daysSince > b.targetDays * 0.75) b.status = "due_soon";
  else b.status = "ok";
});

export const LAB_OVERDUE  = LAB_FRESHNESS.filter(b=>b.status==="overdue");
export const LAB_DUE_SOON = LAB_FRESHNESS.filter(b=>b.status==="due_soon");
