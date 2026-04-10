// Real WHOOP workout exports — activity catalog, 53-week weekly aggregates
// (overall + per-physio + sleep + per-activity), activity totals, and the
// derived FITNESS_LOAD (ATL/CTL/TSB) + ZONE_TOTALS series.
//
// RECENT_WORKOUTS lives in calendar.js because it depends on CAL_RICH.

export const ACTS=[
  {id:"running",   label:"Running",          icon:"🏃", color:"#C47830"},
  {id:"fitness",   label:"Functional Fitness",icon:"🏋", color:"#3A5C48"},
  {id:"spin",      label:"Spin",             icon:"🚴", color:"#C4604A"},
  {id:"walking",   label:"Walking",          icon:"🚶", color:"#7A5A80"},
  {id:"other",     label:"Other",            icon:"⚡", color:"#4A6070"},
];

// Real WHOOP weekly workout data — 53 weeks (Mar 2025 → Mar 2026)
export const WEEKLY_REAL=[
  {label:"3/17",strain:25.8,dur:167,cal:1192,count:3,z1m:66,z2m:14,z3m:32,z4m:5,z5m:2},
  {label:"3/24",strain:54.3,dur:368,cal:2731,count:5,z1m:178,z2m:56,z3m:56,z4m:7,z5m:0},
  {label:"3/31",strain:36.6,dur:216,cal:1417,count:5,z1m:121,z2m:30,z3m:15,z4m:2,z5m:0},
  {label:"4/7",strain:59.5,dur:282,cal:2273,count:7,z1m:120,z2m:58,z3m:51,z4m:6,z5m:0},
  {label:"4/14",strain:51.7,dur:279,cal:2088,count:6,z1m:142,z2m:31,z3m:40,z4m:13,z5m:1},
  {label:"4/21",strain:54.3,dur:380,cal:2629,count:6,z1m:240,z2m:59,z3m:25,z4m:4,z5m:0},
  {label:"4/28",strain:53.0,dur:332,cal:2295,count:6,z1m:157,z2m:44,z3m:42,z4m:10,z5m:1},
  {label:"5/5",strain:51.8,dur:301,cal:2242,count:6,z1m:138,z2m:51,z3m:41,z4m:9,z5m:1},
  {label:"5/12",strain:49.6,dur:310,cal:2068,count:6,z1m:153,z2m:48,z3m:28,z4m:6,z5m:0},
  {label:"5/19",strain:68.0,dur:330,cal:3239,count:6,z1m:128,z2m:67,z3m:92,z4m:12,z5m:2},
  {label:"5/26",strain:42.8,dur:239,cal:1694,count:5,z1m:151,z2m:33,z3m:22,z4m:3,z5m:0},
  {label:"6/2",strain:45.9,dur:296,cal:1970,count:5,z1m:165,z2m:40,z3m:16,z4m:7,z5m:1},
  {label:"6/9",strain:76.3,dur:362,cal:3094,count:8,z1m:153,z2m:92,z3m:42,z4m:16,z5m:1},
  {label:"6/16",strain:44.0,dur:255,cal:1923,count:5,z1m:151,z2m:45,z3m:25,z4m:6,z5m:0},
  {label:"6/23",strain:53.9,dur:384,cal:2485,count:6,z1m:193,z2m:59,z3m:29,z4m:5,z5m:0},
  {label:"6/30",strain:13.3,dur:54, cal:424, count:2,z1m:31, z2m:17,z3m:0, z4m:0,z5m:0},
  {label:"7/7",strain:27.7,dur:115,cal:613, count:5,z1m:51, z2m:12,z3m:3, z4m:0,z5m:0},
  {label:"7/14",strain:9.7, dur:36, cal:150, count:2,z1m:15, z2m:3, z3m:0, z4m:0,z5m:0},
  {label:"7/21",strain:27.7,dur:88, cal:927, count:3,z1m:29, z2m:28,z3m:21,z4m:4,z5m:0},
  {label:"7/28",strain:5.3, dur:16, cal:117, count:1,z1m:15, z2m:1, z3m:0, z4m:0,z5m:0},
  {label:"8/4",strain:32.3,dur:145,cal:1190,count:4,z1m:78, z2m:24,z3m:14,z4m:7,z5m:0},
  {label:"8/11",strain:50.2,dur:172,cal:2005,count:5,z1m:47, z2m:51,z3m:58,z4m:15,z5m:0},
  {label:"8/18",strain:25.6,dur:127,cal:791, count:4,z1m:77, z2m:15,z3m:1, z4m:0,z5m:0},
  {label:"8/25",strain:83.3,dur:308,cal:3336,count:8,z1m:96, z2m:76,z3m:98,z4m:17,z5m:2},
  {label:"9/1",strain:35.1,dur:113,cal:1205,count:4,z1m:46, z2m:35,z3m:25,z4m:4,z5m:1},
  {label:"9/8",strain:36.1,dur:120,cal:1443,count:3,z1m:31, z2m:41,z3m:36,z4m:7,z5m:1},
  {label:"9/15",strain:43.3,dur:156,cal:1755,count:4,z1m:26, z2m:51,z3m:48,z4m:15,z5m:0},
  {label:"9/22",strain:46.5,dur:162,cal:1723,count:5,z1m:46, z2m:51,z3m:47,z4m:8,z5m:0},
  {label:"9/29",strain:38.4,dur:127,cal:1659,count:3,z1m:14, z2m:44,z3m:62,z4m:6,z5m:0},
  {label:"10/6",strain:48.4,dur:172,cal:2182,count:4,z1m:34, z2m:25,z3m:91,z4m:18,z5m:1},
  {label:"10/13",strain:38.7,dur:164,cal:1980,count:3,z1m:40,z2m:61,z3m:39,z4m:21,z5m:1},
  {label:"10/20",strain:41.2,dur:190,cal:2275,count:3,z1m:31,z2m:77,z3m:59,z4m:19,z5m:0},
  {label:"10/27",strain:37.1,dur:235,cal:1741,count:4,z1m:125,z2m:37,z3m:27,z4m:1,z5m:0},
  {label:"11/3",strain:46.1,dur:244,cal:2156,count:5,z1m:132,z2m:39,z3m:47,z4m:9,z5m:0},
  {label:"11/10",strain:54.3,dur:264,cal:2278,count:6,z1m:142,z2m:40,z3m:50,z4m:8,z5m:0},
  {label:"11/17",strain:40.1,dur:263,cal:2035,count:4,z1m:155,z2m:41,z3m:26,z4m:5,z5m:0},
  {label:"11/24",strain:41.6,dur:157,cal:1634,count:4,z1m:64, z2m:46,z3m:28,z4m:13,z5m:3},
  {label:"12/1",strain:39.0,dur:204,cal:1759,count:4,z1m:94, z2m:48,z3m:31,z4m:5,z5m:2},
  {label:"12/8",strain:64.0,dur:280,cal:2627,count:6,z1m:119,z2m:73,z3m:41,z4m:11,z5m:3},
  {label:"12/15",strain:58.0,dur:268,cal:2231,count:6,z1m:133,z2m:55,z3m:33,z4m:7,z5m:0},
  {label:"12/22",strain:40.2,dur:173,cal:1524,count:4,z1m:80, z2m:27,z3m:35,z4m:7,z5m:1},
  {label:"12/29",strain:40.1,dur:218,cal:1372,count:6,z1m:159,z2m:20,z3m:4, z4m:0,z5m:0},
  {label:"1/5",strain:32.7,dur:163,cal:1282,count:3,z1m:85, z2m:27,z3m:15,z4m:8,z5m:1},
  {label:"1/12",strain:60.6,dur:279,cal:1984,count:6,z1m:130,z2m:31,z3m:37,z4m:5,z5m:1},
  {label:"1/19",strain:38.4,dur:194,cal:1777,count:3,z1m:76, z2m:26,z3m:33,z4m:22,z5m:2},
  {label:"1/26",strain:68.3,dur:347,cal:2967,count:7,z1m:104,z2m:88,z3m:76,z4m:7,z5m:0},
  {label:"2/2",strain:78.0,dur:517,cal:3573,count:8,z1m:211,z2m:84,z3m:47,z4m:7,z5m:1},
  {label:"2/9",strain:58.7,dur:287,cal:2415,count:5,z1m:120,z2m:65,z3m:29,z4m:16,z5m:3},
  {label:"2/16",strain:66.9,dur:315,cal:2573,count:6,z1m:116,z2m:99,z3m:38,z4m:3,z5m:0},
  {label:"2/23",strain:92.3,dur:472,cal:4045,count:7,z1m:74, z2m:165,z3m:72,z4m:42,z5m:14},
  {label:"3/2",strain:91.0,dur:476,cal:3919,count:8,z1m:81, z2m:162,z3m:78,z4m:36,z5m:7},
  {label:"3/9",strain:95.2,dur:484,cal:3731,count:8,z1m:102,z2m:161,z3m:43,z4m:33,z5m:10},
  {label:"3/16",strain:68.0,dur:337,cal:2688,count:6,z1m:77, z2m:76,z3m:46,z4m:36,z5m:7},
  {label:"3/23",strain:53.8,dur:253,cal:2278,count:4,z1m:31,z2m:104,z3m:75,z4m:29,z5m:7},
];

// Real WHOOP weekly physiological data — 53 weeks (Mar 2025 → Mar 2026)
export const WEEKLY_PHYSIO=[
  {label:"3/17",hrv:43.5,rec:68.2,rhr:49.2,strain:9.6},
  {label:"3/24",hrv:43.1,rec:67.4,rhr:49.1,strain:13.1},
  {label:"3/31",hrv:47.6,rec:69.9,rhr:49.3,strain:12.0},
  {label:"4/7", hrv:46.6,rec:76.4,rhr:49.3,strain:12.3},
  {label:"4/14",hrv:40.0,rec:57.1,rhr:53.1,strain:12.8},
  {label:"4/21",hrv:45.6,rec:69.9,rhr:49.7,strain:12.2},
  {label:"4/28",hrv:44.1,rec:67.1,rhr:50.1,strain:12.3},
  {label:"5/5", hrv:45.9,rec:73.0,rhr:49.7,strain:12.0},
  {label:"5/12",hrv:56.5,rec:86.3,rhr:47.2,strain:11.7},
  {label:"5/19",hrv:48.6,rec:60.0,rhr:49.7,strain:12.8},
  {label:"5/26",hrv:49.7,rec:69.4,rhr:48.4,strain:12.4},
  {label:"6/2", hrv:49.4,rec:64.7,rhr:49.0,strain:12.0},
  {label:"6/9", hrv:48.4,rec:63.0,rhr:49.7,strain:12.9},
  {label:"6/16",hrv:48.7,rec:66.5,rhr:49.2,strain:11.2},
  {label:"6/23",hrv:48.2,rec:73.0,rhr:49.2,strain:10.8},
  {label:"6/30",hrv:43.9,rec:54.6,rhr:51.9,strain:9.2},
  {label:"7/7", hrv:31.0,rec:37.7,rhr:57.7,strain:8.8},
  {label:"7/14",hrv:48.4,rec:79.1,rhr:47.7,strain:6.1},
  {label:"7/21",hrv:42.6,rec:62.1,rhr:49.1,strain:9.3},
  {label:"7/28",hrv:41.7,rec:67.1,rhr:49.9,strain:6.8},
  {label:"8/4", hrv:38.7,rec:58.0,rhr:50.9,strain:8.4},
  {label:"8/11",hrv:37.1,rec:60.3,rhr:51.3,strain:10.3},
  {label:"8/18",hrv:43.0,rec:76.9,rhr:50.7,strain:9.4},
  {label:"8/25",hrv:37.3,rec:58.4,rhr:52.6,strain:12.7},
  {label:"9/1", hrv:50.6,rec:82.1,rhr:47.0,strain:8.9},
  {label:"9/8", hrv:50.0,rec:73.4,rhr:47.6,strain:10.0},
  {label:"9/15",hrv:49.0,rec:69.7,rhr:47.7,strain:9.9},
  {label:"9/22",hrv:49.3,rec:69.4,rhr:47.3,strain:10.7},
  {label:"9/29",hrv:48.6,rec:70.3,rhr:47.9,strain:9.6},
  {label:"10/6",hrv:44.9,rec:60.3,rhr:48.7,strain:9.4},
  {label:"10/13",hrv:38.4,rec:52.9,rhr:51.3,strain:10.0},
  {label:"10/20",hrv:45.4,rec:72.7,rhr:48.4,strain:9.6},
  {label:"10/27",hrv:41.9,rec:62.3,rhr:50.3,strain:9.7},
  {label:"11/3",hrv:39.7,rec:61.4,rhr:51.1,strain:10.1},
  {label:"11/10",hrv:42.1,rec:71.9,rhr:50.1,strain:9.8},
  {label:"11/17",hrv:39.6,rec:61.6,rhr:50.7,strain:10.7},
  {label:"11/24",hrv:37.7,rec:61.6,rhr:52.6,strain:9.2},
  {label:"12/1",hrv:37.9,rec:60.6,rhr:51.3,strain:10.0},
  {label:"12/8",hrv:40.9,rec:67.4,rhr:50.4,strain:10.7},
  {label:"12/15",hrv:47.4,rec:75.0,rhr:49.0,strain:11.7},
  {label:"12/22",hrv:50.1,rec:51.3,rhr:53.0,strain:8.1},
  {label:"12/29",hrv:46.1,rec:69.0,rhr:50.1,strain:8.4},
  {label:"1/5", hrv:43.1,rec:62.0,rhr:49.3,strain:7.8},
  {label:"1/12",hrv:37.7,rec:49.4,rhr:51.4,strain:10.9},
  {label:"1/19",hrv:40.3,rec:66.7,rhr:50.4,strain:9.4},
  {label:"1/26",hrv:38.0,rec:60.9,rhr:51.4,strain:11.5},
  {label:"2/2", hrv:43.1,rec:71.3,rhr:50.4,strain:12.4},
  {label:"2/9", hrv:39.1,rec:58.6,rhr:51.9,strain:10.4},
  {label:"2/16",hrv:40.9,rec:69.3,rhr:51.0,strain:12.7},
  {label:"2/23",hrv:54.0,rec:80.7,rhr:50.7,strain:13.5},
  {label:"3/2", hrv:51.9,rec:83.6,rhr:51.6,strain:12.8},
  {label:"3/9", hrv:42.1,rec:59.1,rhr:50.9,strain:13.1},
  {label:"3/16",hrv:45.5,rec:71.0,rhr:49.8,strain:14.3},
  {label:"3/23",hrv:43.5,rec:65.0,rhr:51.7,strain:13.5},
];

// Weekly sleep averages derived from 112 days CAL_DATA (Dec 2025 – Mar 2026)
export const WEEKLY_SLEEP=[
  {label:"12/01",score:94.3,dur:9.07},{label:"12/08",score:97.0,dur:8.70},
  {label:"12/15",score:95.1,dur:8.89},{label:"12/22",score:84.3,dur:9.04},
  {label:"12/29",score:83.0,dur:9.51},{label:"01/05",score:88.0,dur:9.20},
  {label:"01/12",score:91.0,dur:9.30},{label:"01/19",score:92.5,dur:9.10},
  {label:"01/26",score:88.5,dur:9.00},{label:"02/02",score:92.0,dur:9.20},
  {label:"02/09",score:89.7,dur:8.87},{label:"02/16",score:89.9,dur:8.54},
  {label:"02/23",score:97.6,dur:8.76},{label:"03/02",score:93.7,dur:8.53},
  {label:"03/09",score:96.0,dur:8.93},{label:"03/16",score:95.9,dur:9.05},
  {label:"03/23",score:97.8,dur:8.76},
];


// Per-activity weekly breakdown — derived from WHOOP workouts.csv (53 weeks)
export const WEEKLY_ACTS=[
  {label:"3/17",running:{c:3,s:31.2,d:158},fitness:{c:2,s:14.3,d:105}},
  {label:"3/24",fitness:{c:3,s:33.6,d:261},other:{c:2,s:20.7,d:107}},
  {label:"3/31",fitness:{c:2,s:21.5,d:159},walking:{c:2,s:10.3,d:37},other:{c:1,s:4.8,d:20}},
  {label:"4/7", running:{c:3,s:35.6,d:138},walking:{c:1,s:5.2,d:16},other:{c:3,s:18.7,d:128}},
  {label:"4/14",running:{c:1,s:13.9,d:49},fitness:{c:3,s:26.0,d:164},walking:{c:2,s:11.8,d:66}},
  {label:"4/21",fitness:{c:5,s:49.2,d:364},other:{c:1,s:5.1,d:16}},
  {label:"4/28",fitness:{c:6,s:53.0,d:332}},
  {label:"5/5", fitness:{c:2,s:21.8,d:161},walking:{c:1,s:5.2,d:17},cycling:{c:1,s:13.3,d:75},other:{c:2,s:11.5,d:48}},
  {label:"5/12",running:{c:1,s:11.0,d:47},fitness:{c:1,s:13.0,d:79},walking:{c:1,s:4.8,d:14},other:{c:3,s:20.8,d:170}},
  {label:"5/19",running:{c:1,s:15.3,d:53},fitness:{c:4,s:44.1,d:239},other:{c:1,s:8.6,d:38}},
  {label:"5/26",fitness:{c:4,s:36.1,d:195},walking:{c:1,s:6.7,d:44}},
  {label:"6/2", fitness:{c:3,s:30.6,d:164},walking:{c:1,s:6.9,d:41},other:{c:1,s:8.4,d:91}},
  {label:"6/9", running:{c:2,s:23.3,d:85},fitness:{c:3,s:33.5,d:181},walking:{c:2,s:14.9,d:68},other:{c:1,s:4.6,d:28}},
  {label:"6/16",running:{c:1,s:13.0,d:56},fitness:{c:1,s:11.3,d:86},walking:{c:2,s:11.6,d:65},other:{c:1,s:8.1,d:48}},
  {label:"6/23",running:{c:1,s:13.4,d:78},fitness:{c:3,s:26.3,d:215},walking:{c:1,s:6.3,d:44},other:{c:1,s:7.9,d:47}},
  {label:"6/30",walking:{c:2,s:13.3,d:54}},
  {label:"7/7", walking:{c:4,s:23.1,d:96},other:{c:1,s:4.6,d:19}},
  {label:"7/14",fitness:{c:1,s:5.3,d:19},walking:{c:1,s:4.4,d:17}},
  {label:"7/21",running:{c:1,s:10.5,d:30},walking:{c:1,s:5.7,d:29},other:{c:1,s:11.5,d:29}},
  {label:"7/28",walking:{c:1,s:5.3,d:16}},
  {label:"8/4", running:{c:1,s:13.2,d:41},walking:{c:3,s:19.1,d:104}},
  {label:"8/11",running:{c:3,s:39.2,d:134},walking:{c:1,s:5.1,d:14},other:{c:1,s:5.9,d:24}},
  {label:"8/18",running:{c:1,s:8.4,d:28},walking:{c:2,s:9.5,d:32},other:{c:1,s:7.7,d:67}},
  {label:"8/25",running:{c:5,s:63.8,d:232},walking:{c:3,s:19.5,d:76}},
  {label:"9/1", running:{c:3,s:29.8,d:99},other:{c:1,s:5.3,d:14}},
  {label:"9/8", running:{c:3,s:36.1,d:120}},
  {label:"9/15",running:{c:3,s:37.0,d:121},walking:{c:1,s:6.3,d:35}},
  {label:"9/22",running:{c:3,s:35.8,d:114},walking:{c:2,s:10.7,d:48}},
  {label:"9/29",running:{c:3,s:38.4,d:127}},
  {label:"10/6",running:{c:3,s:41.1,d:137},walking:{c:1,s:7.3,d:35}},
  {label:"10/13",running:{c:2,s:25.2,d:120},other:{c:1,s:13.5,d:44}},
  {label:"10/20",running:{c:3,s:41.2,d:190}},
  {label:"10/27",fitness:{c:2,s:22.9,d:132},walking:{c:2,s:14.2,d:103}},
  {label:"11/3", fitness:{c:3,s:34.7,d:186},walking:{c:2,s:11.4,d:58}},
  {label:"11/10",running:{c:1,s:8.2,d:16},fitness:{c:3,s:34.4,d:182},walking:{c:1,s:6.9,d:50},sport:{c:1,s:4.8,d:16}},
  {label:"11/17",fitness:{c:3,s:33.7,d:219},walking:{c:1,s:6.4,d:44}},
  {label:"11/24",running:{c:3,s:33.0,d:106},walking:{c:1,s:8.6,d:51}},
  {label:"12/1", fitness:{c:3,s:34.7,d:190},walking:{c:1,s:4.3,d:14}},
  {label:"12/8", running:{c:3,s:36.4,d:127},fitness:{c:3,s:27.6,d:153}},
  {label:"12/15",running:{c:3,s:25.3,d:110},fitness:{c:3,s:32.7,d:158}},
  {label:"12/22",running:{c:2,s:20.1,d:60}, fitness:{c:2,s:20.1,d:113}},
  {label:"12/29",running:{c:1,s:9.1,d:28}, fitness:{c:2,s:12.8,d:89},walking:{c:2,s:12.2,d:76},other:{c:1,s:6.0,d:25}},
  {label:"1/5",  fitness:{c:2,s:26.4,d:117},walking:{c:1,s:6.3,d:46}},
  {label:"1/12", running:{c:2,s:16.3,d:50}, fitness:{c:3,s:37.8,d:189},walking:{c:1,s:6.5,d:40}},
  {label:"1/19", running:{c:2,s:20.3,d:126},fitness:{c:1,s:18.1,d:68}},
  {label:"1/26", running:{c:6,s:55.2,d:281},fitness:{c:1,s:13.1,d:66}},
  {label:"2/2",  running:{c:2,s:23.1,d:90}, fitness:{c:3,s:31.0,d:171},walking:{c:2,s:13.7,d:183},other:{c:1,s:10.2,d:73}},
  {label:"2/9",  running:{c:2,s:27.6,d:115},fitness:{c:2,s:25.8,d:144},walking:{c:1,s:5.3,d:28}},
  {label:"2/16", running:{c:3,s:35.9,d:159},fitness:{c:2,s:26.2,d:136},sport:{c:1,s:4.8,d:20}},
  {label:"2/23", running:{c:4,s:49.4,d:235},fitness:{c:3,s:42.9,d:237}},
  {label:"3/2",  running:{c:2,s:24.7,d:141},fitness:{c:3,s:43.2,d:221},spin:{c:2,s:17.7,d:89},walking:{c:1,s:5.4,d:25}},
  {label:"3/9",  running:{c:3,s:36.2,d:157},fitness:{c:3,s:39.6,d:202},spin:{c:2,s:19.4,d:125}},
  {label:"3/16", running:{c:2,s:24.9,d:107},fitness:{c:2,s:28.6,d:156},spin:{c:2,s:14.5,d:74}},
  {label:"3/23", running:{c:2,s:26.7,d:135},fitness:{c:2,s:27.1,d:118}},
];

export const ACT_META={
  running: {label:"Running",          icon:"🏃",color:"#C47830"},
  fitness: {label:"Functional Fitness",icon:"🏋",color:"#3A5C48"},
  spin:    {label:"Spin",             icon:"🚴",color:"#C4604A"},
  walking: {label:"Walking",          icon:"🚶",color:"#7A5A80"},
  cycling: {label:"Cycling",          icon:"🚲",color:"#4A6070"},
  strength:{label:"Strength",         icon:"💪",color:"#8A6050"},
  sport:   {label:"Sport",            icon:"⚽",color:"#B8902A"},
  yoga:    {label:"Yoga",             icon:"🧘",color:"#9A4558"},
  hiking:  {label:"Hiking",           icon:"🥾",color:"#3A5C48"},
  other:   {label:"Other",            icon:"⚡",color:"#6B6057"},
};

// Activity totals for breakdown
export const ACT_TOTALS_REAL=[
  {id:"running",  label:"Running",          icon:"🏃",color:"#C47830",count:39,avgStrain:12.2,totalDur:2225,totalCal:22278},
  {id:"fitness",  label:"Functional Fitness",icon:"🏋",color:"#3A5C48",count:40,avgStrain:13.9,totalDur:2474,totalCal:24230},
  {id:"spin",     label:"Spin",             icon:"🚴",color:"#C4604A",count:6, avgStrain:8.3, totalDur:279, totalCal:2398 },
  {id:"walking",  label:"Walking",          icon:"🚶",color:"#7A5A80",count:9, avgStrain:4.8, totalDur:310, totalCal:1700 },
  {id:"other",    label:"Other",            icon:"⚡",color:"#4A6070",count:3, avgStrain:6.2, totalDur:115, totalCal:680  },
];

// FITNESS_LOAD (ATL/CTL/TSB) calculated over full 53-week dataset
export const FITNESS_LOAD = WEEKLY_REAL.map((w,i)=>{
  const acute  = WEEKLY_REAL.slice(Math.max(0,i-3), i+1).reduce((s,x)=>s+x.strain,0)/Math.min(4, i+1);
  const chronic= WEEKLY_REAL.slice(Math.max(0,i-11),i+1).reduce((s,x)=>s+x.strain,0)/Math.min(12,i+1);
  return{label:w.label,atl:+acute.toFixed(1),ctl:+chronic.toFixed(1),tsb:+(chronic-acute).toFixed(1)};
});

// Zone totals across full 53-week dataset (used in activity guide)
export const ZONE_TOTALS = WEEKLY_REAL.reduce((acc,w)=>{
  acc[0]+=w.z1m; acc[1]+=w.z2m; acc[2]+=w.z3m; acc[3]+=w.z4m; acc[4]+=w.z5m;
  return acc;
},[0,0,0,0,0]);
export const ZONE_TOTAL_MIN = ZONE_TOTALS.reduce((a,b)=>a+b,0);

export const ZONE_CFG=[
  {label:"Z1",full:"Zone 1",sub:"Recovery",  range:"<108 bpm",  color:"#A8A09A"},
  {label:"Z2",full:"Zone 2",sub:"Aerobic",   range:"108-126",   color:"#3A5C48"},
  {label:"Z3",full:"Zone 3",sub:"Tempo",     range:"127-144",   color:"#4A6070"},
  {label:"Z4",full:"Zone 4",sub:"Threshold", range:"145-162",   color:"#C47830"},
  {label:"Z5",full:"Zone 5",sub:"Max",       range:">162 bpm",  color:"#C4604A"},
];
