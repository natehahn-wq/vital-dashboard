// WHOOP data — current cycle snapshot, daily 30-day trends (T), 90-day sleep
// stage averages (SLEEP_PIE), HRV baseline + readiness zones, weekly time
// series (WT), and the long historical recovery-debt window.

import { P } from "../theme.js";

// WHOOP real data — latest cycle Mar 19 2026, avg last 90 days
export const WHOOP = {
  recovery: 87,    // Mar 23 2026 — screenshot
  hrv:      52,    // Mar 23 (vs 48 30d avg) — above baseline, +9%
  rhr:      49,    // Mar 23 (vs 51 30d avg) — excellent
  strain:   0,     // no workout logged yet today
  spo2:     95,
  skinTemp: 0.0,
  sleep:{ score:100, hours:8.70, eff:99, hoursVsNeeded:100, consistency:91, stressHigh:0, rem:2.75, deep:2.52, light:3.43, awake:0.13, resp:14.2 }, // Mar 23 — 9:36PM–6:26AM
};

// Real WHOOP 30-day daily data (Mar 19 → Feb 19, 2026)
export const T = {
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

// Real sleep stage data from WHOOP (avg last 90 days)
// Note: P is a getter object, so col values capture the *current* theme palette
// at module load — same behavior as the original inline definition.
export const SLEEP_PIE=[
  {name:"REM",v:2.75,col:P.violet},
  {name:"Deep SWS",v:2.52,col:P.sage},
  {name:"Light",v:3.43,col:P.steel},
  {name:"Awake",v:0.13,col:P.muted},
];

// Zone: 0=Suppressed(<39ms) 1=Low(39-42) 2=Baseline(42-47) 3=Elevated(47-49) 4=Peak(>49)
// hrv_mean=44.4ms  hrv_stdev=5.0ms  rec_mean=66.6%
export const HRV_BASELINE = { mean:44.4, stdev:5, recMean:66.6, recStdev:9 };

export const RECOVERY_DEBT_SERIES=[
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

// Weekly WHOOP averages used by the Trends chart (Mar 2025–Mar 2026)
export const WT=[
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

// HRV-based readiness zones used by the Readiness page
export const HRV_ZONES = [
  { id:4, label:"Peak",       range:">49 ms",   min:49.4, max:999,  color:"#5BC4F0", bg:"rgba(91,196,240,0.12)",  desc:"Exceptional readiness — push hard, set PRs, go long",          training:"Max effort, PRs, high-volume blocks, test fitness" },
  { id:3, label:"Elevated",   range:"47–49 ms", min:46.9, max:49.4, color:"#3A9C68", bg:"rgba(58,156,104,0.12)", desc:"Above baseline — go hard with confidence",                       training:"High-intensity, strength PRs, long endurance" },
  { id:2, label:"Baseline",   range:"42–47 ms", min:41.9, max:46.9, color:"#C47830", bg:"rgba(196,120,48,0.12)", desc:"Normal — train as planned, moderate intensity",                   training:"Planned sessions at normal effort, nothing extreme" },
  { id:1, label:"Low",        range:"39–42 ms", min:38.9, max:41.9, color:"#C4604A", bg:"rgba(196,96,74,0.12)",  desc:"Below baseline — reduce volume or intensity",                    training:"Easy aerobic only, cut FF volume by 30%, no new PRs" },
  { id:0, label:"Suppressed", range:"<39 ms",   min:0,    max:38.9, color:"#8B2020", bg:"rgba(139,32,32,0.14)",  desc:"Recovery deficit — active rest or very light movement",           training:"Walk, stretch, mobility only — do not push" },
];
