// Lab panels — three blood draws (Feb '25 BioLab, May '25 BioLab, Jan '26 ExamOne/Quest),
// plus historical trend data, reference ranges, and freshness tracking.
//
// LABS_MERGED stitches the most recent value for each domain across the two
// most recent draws (Jan 2026 lipid/metabolic/liver from ExamOne, May 2025
// hormones/special from BioLab).

export const LABS_PRIOR2 = {
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

export const LABS_PRIOR = {
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
export const LABS = {
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
export const LABS_MERGED = {
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

// Long-term lab history per domain (estimated baselines + ★ real draws).
export const LAB_HISTORY = {
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

// Compute days since last draw — mutates LAB_FRESHNESS in place
export const TODAY_DATE = new Date("2026-03-23");
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
