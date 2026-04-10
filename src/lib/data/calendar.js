// Day-level calendar data (Dec 2025 – Mar 2026): WHOOP physiology, sleep,
// recovery, alcohol/weight flags (CAL_DATA), plus per-day workout details
// (CAL_RICH). RECENT_WORKOUTS is derived from CAL_RICH (newest first) with
// optional Peloton overlay merged in from localStorage.

import { P } from "../theme.js";
import { ACT_META } from "./workouts.js";

export const CAL_DATA={
  "2025-12-01":{slp:100,sdur:8.9,rec:95,hrv:55,rhr:44},
  "2025-12-02":{slp:100,sdur:9.4,rec:95,hrv:55,rhr:44},
  "2025-12-03":{slp:98,sdur:8.9,rec:68,hrv:41,rhr:50},
  "2025-12-04":{slp:100,sdur:9.3,rec:61,hrv:38,rhr:51},
  "2025-12-05":{slp:98,sdur:8.2,rec:45,hrv:32,rhr:52,alc:1},
  "2025-12-06":{slp:74,sdur:8.4,rec:21,hrv:20,rhr:63,alc:1},
  "2025-12-07":{slp:90,sdur:10.4,rec:75,hrv:42,rhr:50,alc:1},
  "2025-12-08":{slp:97,sdur:8.8,rec:75,hrv:42,rhr:50},
  "2025-12-09":{slp:100,sdur:8.9,rec:80,hrv:45,rhr:49},
  "2025-12-10":{slp:100,sdur:9.1,rec:88,hrv:49,rhr:50},
  "2025-12-11":{slp:100,sdur:8.9,rec:65,hrv:40,rhr:50},
  "2025-12-12":{slp:92,sdur:7.8,rec:51,hrv:35,rhr:51,alc:1},
  "2025-12-13":{slp:92,sdur:8.5,rec:52,hrv:36,rhr:53,alc:1},
  "2025-12-14":{slp:98,sdur:8.9,rec:52,hrv:36,rhr:53,alc:1},
  "2025-12-15":{slp:99,sdur:7.8,rec:71,hrv:41,rhr:50},
  "2025-12-16":{slp:91,sdur:9.2,rec:99,hrv:60,rhr:45},
  "2025-12-17":{slp:97,sdur:9.1,rec:85,hrv:49,rhr:48},
  "2025-12-18":{slp:99,sdur:8.9,rec:75,hrv:46,rhr:48},
  "2025-12-19":{slp:94,sdur:7.8,rec:66,hrv:43,rhr:48,alc:1},
  "2025-12-20":{slp:92,sdur:9.3,rec:66,hrv:43,rhr:48,alc:1},
  "2025-12-21":{slp:94,sdur:10.1,rec:77,hrv:52,rhr:53,alc:1},
  "2025-12-22":{slp:88,sdur:8.0,rec:54,hrv:40,rhr:52,alc:1},
  "2025-12-23":{slp:87,sdur:10.3,rec:92,hrv:63,rhr:51,alc:1},
  "2025-12-24":{slp:92,sdur:9.5,rec:62,hrv:44,rhr:52,alc:1},
  "2025-12-25":{slp:82,sdur:8.5,rec:57,hrv:44,rhr:52,alc:1},
  "2025-12-26":{slp:80,sdur:8.9,rec:57,hrv:42,rhr:51,alc:1},
  "2025-12-27":{slp:78,sdur:9.4,rec:82,hrv:50,rhr:51,alc:1},
  "2025-12-28":{slp:83,sdur:8.7,rec:61,hrv:42,rhr:52,alc:1},
  "2025-12-29":{slp:87,sdur:9.4,rec:60,hrv:42,rhr:52,alc:1},
  "2025-12-30":{slp:91,sdur:10.3,rec:60,hrv:40,rhr:50,alc:1},
  "2025-12-31":{slp:80,sdur:9.1,rec:92,hrv:56,rhr:50,alc:1},
  "2026-01-01":{slp:76,sdur:6.7,rec:87,hrv:53,rhr:53,alc:1},
  "2026-01-02":{slp:81,sdur:11.8,rec:50,hrv:40,rhr:52,alc:1},
  "2026-01-03":{slp:81,sdur:9.8,rec:50,hrv:40,rhr:52,alc:1},
  "2026-01-04":{slp:85,sdur:9.5,rec:72,hrv:47,rhr:47},
  "2026-01-05":{slp:76,sdur:8.3,rec:46,hrv:39,rhr:51},
  "2026-01-06":{slp:97,sdur:9.8,rec:55,hrv:40,rhr:49},
  "2026-01-07":{slp:100,sdur:10.1,rec:88,hrv:53,rhr:46},
  "2026-01-08":{slp:98,sdur:10.4,rec:71,hrv:44,rhr:48},
  "2026-01-09":{slp:87,sdur:8.4,rec:79,hrv:48,rhr:47},
  "2026-01-10":{slp:93,sdur:9.6,rec:79,hrv:48,rhr:47},
  "2026-01-11":{slp:99,sdur:9.4,rec:73,hrv:47,rhr:48},
  "2026-01-12":{slp:100,sdur:9.6,rec:63,hrv:45,rhr:49},
  "2026-01-13":{slp:100,sdur:8.6,rec:45,hrv:39,rhr:51},
  "2026-01-14":{slp:100,sdur:9.6,rec:64,hrv:44,rhr:49},
  "2026-01-15":{slp:100,sdur:9.5,rec:44,hrv:37,rhr:52},
  "2026-01-16":{slp:95,sdur:8.2,rec:33,hrv:30,rhr:54},
  "2026-01-17":{slp:95,sdur:9.5,rec:39,hrv:32,rhr:53},
  "2026-01-18":{slp:96,sdur:10.0,rec:58,hrv:37,rhr:52},
  "2026-01-19":{slp:100,sdur:9.3,rec:73,hrv:41,rhr:50},
  "2026-01-20":{slp:93,sdur:8.3,rec:73,hrv:41,rhr:50},
  "2026-01-21":{slp:97,sdur:8.9,rec:77,hrv:43,rhr:48},
  "2026-01-22":{slp:99,sdur:9.9,rec:47,hrv:34,rhr:53},
  "2026-01-23":{slp:95,sdur:7.9,rec:80,hrv:44,rhr:49},
  "2026-01-24":{slp:85,sdur:10.0,rec:40,hrv:33,rhr:53,wt:216},
  "2026-01-25":{slp:90,sdur:9.3,rec:65,hrv:41,rhr:51},
  "2026-01-26":{slp:95,sdur:9.2,rec:95,hrv:51,rhr:48},
  "2026-01-27":{slp:97,sdur:8.8,rec:95,hrv:51,rhr:48},
  "2026-01-28":{slp:96,sdur:9.2,rec:42,hrv:34,rhr:52},
  "2026-01-29":{slp:100,sdur:8.6,rec:60,hrv:39,rhr:50},
  "2026-01-30":{slp:94,sdur:7.9,rec:46,hrv:34,rhr:52},
  "2026-01-31":{slp:97,sdur:8.7,rec:34,hrv:29,rhr:56},
  "2026-02-01":{slp:100,sdur:8.7,rec:66,hrv:36,rhr:52},
  "2026-02-02":{slp:95,sdur:9.5,rec:83,hrv:43,rhr:50},
  "2026-02-03":{slp:86,sdur:10.1,rec:98,hrv:53,rhr:47},
  "2026-02-04":{slp:96,sdur:8.9,rec:79,hrv:44,rhr:50},
  "2026-02-05":{slp:97,sdur:8.6,rec:89,hrv:49,rhr:48},
  "2026-02-06":{slp:95,sdur:8.1,rec:68,hrv:43,rhr:49},
  "2026-02-07":{slp:92,sdur:10.0,rec:36,hrv:31,rhr:55},
  "2026-02-08":{slp:82,sdur:9.5,rec:69,hrv:43,rhr:53},
  "2026-02-09":{slp:88,sdur:9.4,rec:60,hrv:39,rhr:51},
  "2026-02-10":{slp:93,sdur:8.9,rec:86,hrv:47,rhr:49},
  "2026-02-11":{slp:96,sdur:9.5,rec:98,hrv:56,rhr:46},
  "2026-02-12":{slp:95,sdur:8.6,rec:77,hrv:45,rhr:49},
  "2026-02-14":{slp:85,sdur:6.8,rec:40,hrv:32,rhr:53,alc:1},
  "2026-02-15":{slp:81,sdur:10.0,rec:46,hrv:35,rhr:51},
  "2026-02-16":{slp:76,sdur:6.8,rec:60,hrv:37,rhr:51},
  "2026-02-17":{slp:83,sdur:8.4,rec:60,hrv:37,rhr:51},
  "2026-02-18":{slp:86,sdur:8.7,rec:76,hrv:42,rhr:50},
  "2026-02-19":{slp:89,sdur:9.3,rec:78,hrv:43,rhr:49},
  "2026-02-20":{slp:98,sdur:8.7,rec:65,hrv:39,rhr:51,alc:1},
  "2026-02-21":{slp:100,sdur:9.4,rec:52,hrv:36,rhr:53,alc:1},
  "2026-02-22":{slp:97,sdur:8.5,rec:65,hrv:39,rhr:50},
  "2026-02-23":{slp:99,sdur:9.8,rec:65,hrv:39,rhr:50},
  "2026-02-24":{slp:100,sdur:8.8,rec:75,hrv:42,rhr:50},
  "2026-02-25":{slp:100,sdur:8.6,rec:89,hrv:48,rhr:50},
  "2026-02-26":{slp:93,sdur:8.4,rec:62,hrv:40,rhr:51},
  "2026-02-27":{slp:93,sdur:7.8,rec:75,hrv:42,rhr:50},
  "2026-02-28":{slp:98,sdur:8.9,rec:77,hrv:45,rhr:52,alc:1},
  "2026-03-01":{slp:100,sdur:9.0,rec:89,hrv:110,rhr:53},
  "2026-03-02":{slp:100,sdur:9.3,rec:98,hrv:51,rhr:49},
  "2026-03-03":{slp:100,sdur:8.6,rec:95,hrv:50,rhr:48},
  "2026-03-04":{slp:97,sdur:8.0,rec:93,hrv:50,rhr:48},
  "2026-03-05":{slp:92,sdur:8.1,rec:98,hrv:60,rhr:49},
  "2026-03-06":{slp:94,sdur:7.8,rec:98,hrv:58,rhr:51,alc:1},
  "2026-03-07":{slp:80,sdur:8.5,rec:54,hrv:40,rhr:60,alc:1},
  "2026-03-08":{slp:93,sdur:9.4,rec:49,hrv:41,rhr:51},
  "2026-03-09":{slp:99,sdur:8.4,rec:49,hrv:41,rhr:51},
  "2026-03-10":{slp:100,sdur:9.2,rec:60,hrv:45,rhr:50},
  "2026-03-11":{slp:100,sdur:8.9,rec:62,hrv:45,rhr:50},
  "2026-03-12":{slp:99,sdur:9.5,rec:62,hrv:42,rhr:50},
  "2026-03-13":{slp:92,sdur:8.0,rec:60,hrv:41,rhr:51,alc:1},
  "2026-03-14":{slp:87,sdur:9.6,rec:57,hrv:40,rhr:51,alc:1},
  "2026-03-15":{slp:95,sdur:8.9,rec:44,hrv:38,rhr:52,alc:1},
  "2026-03-16":{slp:97,sdur:9.0,rec:69,hrv:44,rhr:52},
  "2026-03-17":{slp:96,sdur:9.5,rec:86,hrv:50,rhr:49},
  "2026-03-18":{slp:94,sdur:8.8,rec:67,hrv:44,rhr:50},
  "2026-03-19":{slp:96,sdur:9.2,rec:62,hrv:43,rhr:50},
  "2026-03-20":{slp:96,sdur:9.1,rec:69,hrv:45,rhr:50},
  "2026-03-21":{slp:97,sdur:9.2,rec:69,hrv:43,rhr:49},
  "2026-03-22":{slp:95,sdur:8.53,rec:37,hrv:37,rhr:53},
  "2026-03-23":{slp:100,sdur:8.70,rec:87,hrv:52,rhr:49},
    "2026-03-24":{slp:95,sdur:8.5,rec:0,hrv:0,rhr:0},
    "2026-03-25":{slp:96,sdur:8.8,rec:54,hrv:39.4,rhr:52},
    "2026-03-26":{slp:100,sdur:9.03,rec:54,hrv:39.2,rhr:54},
};

export const CAL_RICH={
  "2025-12-01":[{cat:"walking",name:"Walking",strain:4.3,dur:14,cal:42,avgHR:96,maxHR:114,start:"1:07 PM",z1p:29,z2p:0,z3p:0,z4p:0,z5p:0,z1m:4,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2025-12-02":[{cat:"fitness",name:"Functional Fitness",strain:9.6,dur:65,cal:447,avgHR:116,maxHR:180,start:"9:58 AM",z1p:61,z2p:15,z3p:6,z4p:1,z5p:0,z1m:40,z2m:10,z3m:4,z4m:1,z5m:0}],
  "2025-12-04":[{cat:"fitness",name:"Functional Fitness",strain:11.5,dur:53,cal:460,avgHR:124,maxHR:194,start:"10:10 AM",z1p:67,z2p:5,z3p:15,z4p:3,z5p:4,z1m:36,z2m:3,z3m:8,z4m:2,z5m:2}],
  "2025-12-06":[{cat:"fitness",name:"Functional Fitness",strain:13.6,dur:72,cal:810,avgHR:136,maxHR:177,start:"7:25 AM",z1p:20,z2p:49,z3p:27,z4p:4,z5p:0,z1m:14,z2m:35,z3m:19,z4m:3,z5m:0}],
  "2025-12-08":[{cat:"running",name:"Running",strain:12.2,dur:29,cal:419,avgHR:150,maxHR:193,start:"1:48 PM",z1p:2,z2p:45,z3p:26,z4p:20,z5p:7,z1m:1,z2m:13,z3m:8,z4m:6,z5m:2}],
  "2025-12-09":[{cat:"fitness",name:"Functional Fitness",strain:10.0,dur:64,cal:458,avgHR:118,maxHR:179,start:"10:00 AM",z1p:58,z2p:12,z3p:9,z4p:2,z5p:0,z1m:37,z2m:8,z3m:6,z4m:1,z5m:0}],
  "2025-12-10":[{cat:"running",name:"Running",strain:11.9,dur:35,cal:458,avgHR:144,maxHR:165,start:"11:22 AM",z1p:5,z2p:48,z3p:45,z4p:1,z5p:0,z1m:2,z2m:17,z3m:16,z4m:0,z5m:0}],
  "2025-12-11":[{cat:"fitness",name:"Functional Fitness",strain:9.8,dur:67,cal:439,avgHR:114,maxHR:172,start:"9:58 AM",z1p:64,z2p:2,z3p:9,z4p:1,z5p:0,z1m:43,z2m:1,z3m:6,z4m:1,z5m:0}],
  "2025-12-13":[{cat:"fitness",name:"Functional Fitness",strain:7.8,dur:22,cal:191,avgHR:124,maxHR:185,start:"8:06 AM",z1p:54,z2p:12,z3p:6,z4p:13,z5p:3,z1m:12,z2m:3,z3m:1,z4m:3,z5m:1}],
  "2025-12-14":[{cat:"running",name:"Running",strain:12.3,dur:63,cal:662,avgHR:133,maxHR:157,start:"9:25 AM",z1p:40,z2p:50,z3p:7,z4p:0,z5p:0,z1m:25,z2m:32,z3m:4,z4m:0,z5m:0}],
  "2025-12-16":[{cat:"fitness",name:"Functional Fitness",strain:12.5,dur:50,cal:335,avgHR:115,maxHR:176,start:"10:12 AM",z1p:52,z2p:13,z3p:7,z4p:2,z5p:0,z1m:26,z2m:6,z3m:4,z4m:1,z5m:0}],
  "2025-12-17":[{cat:"running",name:"Running",strain:8.7,dur:43,cal:340,avgHR:121,maxHR:172,start:"4:28 PM",z1p:63,z2p:9,z3p:12,z4p:1,z5p:0,z1m:27,z2m:4,z3m:5,z4m:0,z5m:0}],
  "2025-12-18":[{cat:"fitness",name:"Functional Fitness",strain:7.5,dur:49,cal:323,avgHR:115,maxHR:143,start:"10:09 AM",z1p:86,z2p:5,z3p:0,z4p:0,z5p:0,z1m:42,z2m:2,z3m:0,z4m:0,z5m:0}],
  "2025-12-20":[{cat:"fitness",name:"Functional Fitness",strain:12.7,dur:59,cal:632,avgHR:133,maxHR:186,start:"7:25 AM",z1p:36,z2p:28,z3p:29,z4p:5,z5p:0,z1m:21,z2m:17,z3m:17,z4m:3,z5m:0}],
  "2025-12-21":[{cat:"running",name:"Running",strain:4.5,dur:16,cal:51,avgHR:96,maxHR:131,start:"1:34 PM",z1p:30,z2p:0,z3p:0,z4p:0,z5p:0,z1m:5,z2m:0,z3m:0,z4m:0,z5m:0},{cat:"running",name:"Running",strain:12.1,dur:51,cal:550,avgHR:134,maxHR:171,start:"10:25 AM",z1p:23,z2p:50,z3p:14,z4p:5,z5p:0,z1m:12,z2m:26,z3m:7,z4m:3,z5m:0}],
  "2025-12-22":[{cat:"running",name:"Running",strain:8.5,dur:33,cal:310,avgHR:127,maxHR:161,start:"4:55 PM",z1p:56,z2p:33,z3p:6,z4p:0,z5p:0,z1m:18,z2m:11,z3m:2,z4m:0,z5m:0}],
  "2025-12-23":[{cat:"fitness",name:"Functional Fitness",strain:9.6,dur:58,cal:403,avgHR:116,maxHR:192,start:"10:04 AM",z1p:61,z2p:8,z3p:8,z4p:3,z5p:1,z1m:35,z2m:5,z3m:5,z4m:2,z5m:1}],
  "2025-12-26":[{cat:"running",name:"Running",strain:11.6,dur:27,cal:389,avgHR:150,maxHR:170,start:"1:42 PM",z1p:0,z2p:24,z3p:65,z4p:11,z5p:0,z1m:0,z2m:6,z3m:18,z4m:3,z5m:0}],
  "2025-12-27":[{cat:"fitness",name:"Functional Fitness",strain:10.5,dur:55,cal:422,avgHR:120,maxHR:182,start:"9:00 AM",z1p:47,z2p:9,z3p:20,z4p:4,z5p:0,z1m:26,z2m:5,z3m:11,z4m:2,z5m:0}],
  "2025-12-30":[{cat:"fitness",name:"Functional Fitness",strain:8.0,dur:66,cal:389,avgHR:112,maxHR:135,start:"8:58 AM",z1p:85,z2p:0,z3p:0,z4p:0,z5p:0,z1m:56,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2025-12-31":[{cat:"walking",name:"Walking",strain:5.8,dur:35,cal:178,avgHR:109,maxHR:118,start:"10:15 AM",z1p:84,z2p:0,z3p:0,z4p:0,z5p:0,z1m:29,z2m:0,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:4.8,dur:23,cal:81,avgHR:100,maxHR:122,start:"9:30 AM",z1p:56,z2p:0,z3p:0,z4p:0,z5p:0,z1m:13,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-01-01":[{cat:"running",name:"Running",strain:9.1,dur:28,cal:316,avgHR:137,maxHR:163,start:"3:21 PM",z1p:13,z2p:71,z3p:15,z4p:0,z5p:0,z1m:4,z2m:20,z3m:4,z4m:0,z5m:0}],
  "2026-01-03":[{cat:"other",name:"Stairmaster",strain:6.0,dur:25,cal:182,avgHR:118,maxHR:142,start:"2:49 PM",z1p:100,z2p:0,z3p:0,z4p:0,z5p:0,z1m:25,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-01-04":[{cat:"walking",name:"Walking",strain:6.4,dur:41,cal:226,avgHR:110,maxHR:130,start:"3:07 PM",z1p:78,z2p:0,z3p:0,z4p:0,z5p:0,z1m:32,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-01-05":[{cat:"walking",name:"Walking",strain:6.3,dur:46,cal:217,avgHR:104,maxHR:135,start:"1:28 PM",z1p:54,z2p:0,z3p:0,z4p:0,z5p:0,z1m:25,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-01-08":[{cat:"fitness",name:"Functional Fitness",strain:13.6,dur:51,cal:397,avgHR:121,maxHR:173,start:"10:10 AM",z1p:68,z2p:16,z3p:4,z4p:4,z5p:0,z1m:35,z2m:8,z3m:2,z4m:2,z5m:0}],
  "2026-01-10":[{cat:"fitness",name:"Functional Fitness",strain:12.8,dur:66,cal:668,avgHR:131,maxHR:191,start:"10:09 AM",z1p:39,z2p:28,z3p:19,z4p:9,z5p:2,z1m:26,z2m:18,z3m:13,z4m:6,z5m:1}],
  "2026-01-13":[{cat:"running",name:"Running",strain:4.3,dur:17,cal:42,avgHR:88,maxHR:146,start:"4:21 PM",z1p:9,z2p:5,z3p:0,z4p:0,z5p:0,z1m:2,z2m:1,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:13.5,dur:56,cal:401,avgHR:117,maxHR:191,start:"10:06 AM",z1p:46,z2p:11,z3p:10,z4p:3,z5p:2,z1m:26,z2m:6,z3m:6,z4m:2,z5m:1}],
  "2026-01-15":[{cat:"fitness",name:"Functional Fitness",strain:13.5,dur:57,cal:341,avgHR:111,maxHR:166,start:"10:04 AM",z1p:59,z2p:4,z3p:8,z4p:0,z5p:0,z1m:34,z2m:2,z3m:5,z4m:0,z5m:0}],
  "2026-01-16":[{cat:"running",name:"Running",strain:12.0,dur:33,cal:443,avgHR:146,maxHR:169,start:"11:06 AM",z1p:2,z2p:27,z3p:65,z4p:4,z5p:0,z1m:1,z2m:9,z3m:21,z4m:1,z5m:0}],
  "2026-01-17":[{cat:"walking",name:"Walking",strain:6.5,dur:40,cal:221,avgHR:106,maxHR:145,start:"12:12 PM",z1p:58,z2p:9,z3p:0,z4p:0,z5p:0,z1m:23,z2m:4,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:10.8,dur:76,cal:536,avgHR:116,maxHR:170,start:"7:27 AM",z1p:60,z2p:12,z3p:7,z4p:3,z5p:0,z1m:46,z2m:9,z3m:5,z4m:2,z5m:0}],
  "2026-01-20":[{cat:"running",name:"Running",strain:9.2,dur:59,cal:350,avgHR:111,maxHR:177,start:"9:55 AM",z1p:56,z2p:2,z3p:7,z4p:5,z5p:0,z1m:33,z2m:1,z3m:4,z4m:3,z5m:0}],
  "2026-01-22":[{cat:"running",name:"Running",strain:11.1,dur:67,cal:477,avgHR:117,maxHR:178,start:"2:06 PM",z1p:56,z2p:6,z3p:6,z4p:7,z5p:1,z1m:38,z2m:4,z3m:4,z4m:5,z5m:1}],
  "2026-01-24":[{cat:"fitness",name:"Functional Fitness",strain:18.1,dur:68,cal:950,avgHR:145,maxHR:188,start:"7:19 AM",z1p:8,z2p:31,z3p:37,z4p:21,z5p:2,z1m:5,z2m:21,z3m:25,z4m:14,z5m:1}],
  "2026-01-27":[{cat:"running",name:"Running",strain:8.6,dur:70,cal:365,avgHR:108,maxHR:177,start:"10:00 AM",z1p:50,z2p:8,z3p:5,z4p:1,z5p:0,z1m:35,z2m:6,z3m:4,z4m:1,z5m:0}],
  "2026-01-28":[{cat:"running",name:"Running",strain:13.5,dur:56,cal:707,avgHR:143,maxHR:164,start:"11:28 AM",z1p:4,z2p:42,z3p:53,z4p:0,z5p:0,z1m:2,z2m:24,z3m:30,z4m:0,z5m:0}],
  "2026-01-29":[{cat:"running",name:"Running",strain:7.5,dur:66,cal:304,avgHR:105,maxHR:179,start:"10:01 AM",z1p:39,z2p:6,z3p:3,z4p:1,z5p:0,z1m:26,z2m:4,z3m:2,z4m:1,z5m:0}],
  "2026-01-30":[{cat:"running",name:"Running",strain:10.0,dur:34,cal:385,avgHR:137,maxHR:151,start:"1:18 PM",z1p:23,z2p:59,z3p:18,z4p:0,z5p:0,z1m:8,z2m:20,z3m:6,z4m:0,z5m:0}],
  "2026-01-31":[{cat:"fitness",name:"Functional Fitness",strain:13.1,dur:66,cal:695,avgHR:133,maxHR:179,start:"7:16 AM",z1p:28,z2p:27,z3p:33,z4p:7,z5p:0,z1m:18,z2m:18,z3m:22,z4m:5,z5m:0}],
  "2026-02-01":[{cat:"running",name:"Running",strain:4.2,dur:13,cal:30,avgHR:95,maxHR:117,start:"12:22 PM",z1p:25,z2p:0,z3p:0,z4p:0,z5p:0,z1m:3,z2m:0,z3m:0,z4m:0,z5m:0},{cat:"running",name:"Running",strain:11.4,dur:42,cal:481,avgHR:138,maxHR:166,start:"7:52 AM",z1p:28,z2p:40,z3p:30,z4p:2,z5p:0,z1m:12,z2m:17,z3m:13,z4m:1,z5m:0}],
  "2026-02-02":[{cat:"walking",name:"Walking",strain:6.1,dur:37,cal:208,avgHR:111,maxHR:123,start:"2:21 PM",z1p:81,z2p:0,z3p:0,z4p:0,z5p:0,z1m:30,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-02-03":[{cat:"fitness",name:"Functional Fitness",strain:7.9,dur:67,cal:373,avgHR:110,maxHR:167,start:"10:06 AM",z1p:73,z2p:5,z3p:1,z4p:0,z5p:0,z1m:49,z2m:3,z3m:1,z4m:0,z5m:0}],
  "2026-02-04":[{cat:"running",name:"Running",strain:12.1,dur:49,cal:564,avgHR:137,maxHR:166,start:"9:46 AM",z1p:26,z2p:49,z3p:24,z4p:0,z5p:0,z1m:13,z2m:24,z3m:12,z4m:0,z5m:0}],
  "2026-02-05":[{cat:"other",name:"Activity",strain:10.2,dur:73,cal:492,avgHR:115,maxHR:179,start:"9:54 AM",z1p:57,z2p:13,z3p:5,z4p:3,z5p:0,z1m:42,z2m:9,z3m:4,z4m:2,z5m:0}],
  "2026-02-06":[{cat:"fitness",name:"Functional Fitness",strain:10.0,dur:32,cal:369,avgHR:137,maxHR:158,start:"1:24 PM",z1p:25,z2p:49,z3p:24,z4p:0,z5p:0,z1m:8,z2m:16,z3m:8,z4m:0,z5m:0}],
  "2026-02-07":[{cat:"walking",name:"Walking",strain:7.6,dur:146,cal:384,avgHR:95,maxHR:128,start:"10:38 AM",z1p:15,z2p:0,z3p:0,z4p:0,z5p:0,z1m:22,z2m:0,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:13.1,dur:72,cal:727,avgHR:131,maxHR:188,start:"7:24 AM",z1p:38,z2p:29,z3p:21,z4p:4,z5p:1,z1m:27,z2m:21,z3m:15,z4m:3,z5m:1}],
  "2026-02-08":[{cat:"running",name:"Running",strain:11.0,dur:41,cal:456,avgHR:135,maxHR:174,start:"8:04 AM",z1p:51,z2p:25,z3p:20,z4p:4,z5p:0,z1m:21,z2m:10,z3m:8,z4m:2,z5m:0}],
  "2026-02-09":[{cat:"running",name:"Running",strain:13.6,dur:61,cal:747,avgHR:141,maxHR:174,start:"1:54 PM",z1p:21,z2p:51,z3p:23,z4p:5,z5p:0,z1m:13,z2m:31,z3m:14,z4m:3,z5m:0}],
  "2026-02-10":[{cat:"fitness",name:"Functional Fitness",strain:12.3,dur:71,cal:369,avgHR:108,maxHR:178,start:"10:06 AM",z1p:40,z2p:6,z3p:4,z4p:3,z5p:0,z1m:28,z2m:4,z3m:3,z4m:2,z5m:0}],
  "2026-02-11":[{cat:"running",name:"Running",strain:14.0,dur:54,cal:670,avgHR:141,maxHR:187,start:"11:45 AM",z1p:21,z2p:36,z3p:16,z4p:20,z5p:5,z1m:11,z2m:19,z3m:9,z4m:11,z5m:3}],
  "2026-02-12":[{cat:"fitness",name:"Functional Fitness",strain:13.5,dur:73,cal:495,avgHR:116,maxHR:168,start:"10:03 AM",z1p:65,z2p:14,z3p:5,z4p:0,z5p:0,z1m:47,z2m:10,z3m:4,z4m:0,z5m:0}],
  "2026-02-14":[{cat:"walking",name:"Walking",strain:5.3,dur:28,cal:134,avgHR:106,maxHR:137,start:"3:18 PM",z1p:71,z2p:0,z3p:0,z4p:0,z5p:0,z1m:20,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-02-17":[{cat:"fitness",name:"Functional Fitness",strain:12.9,dur:74,cal:358,avgHR:107,maxHR:164,start:"10:00 AM",z1p:48,z2p:9,z3p:2,z4p:0,z5p:0,z1m:36,z2m:7,z3m:1,z4m:0,z5m:0}],
  "2026-02-18":[{cat:"running",name:"Running",strain:13.0,dur:59,cal:667,avgHR:136,maxHR:167,start:"11:30 AM",z1p:32,z2p:23,z3p:44,z4p:1,z5p:0,z1m:19,z2m:14,z3m:26,z4m:1,z5m:0}],
  "2026-02-19":[{cat:"fitness",name:"Functional Fitness",strain:13.3,dur:62,cal:364,avgHR:112,maxHR:178,start:"2:00 PM",z1p:61,z2p:3,z3p:4,z4p:4,z5p:0,z1m:38,z2m:2,z3m:2,z4m:2,z5m:0}],
  "2026-02-20":[{cat:"running",name:"Running",strain:10.2,dur:40,cal:430,avgHR:134,maxHR:158,start:"1:43 PM",z1p:20,z2p:75,z3p:4,z4p:0,z5p:0,z1m:8,z2m:30,z3m:2,z4m:0,z5m:0}],
  "2026-02-22":[{cat:"other",name:"Basketball",strain:4.8,dur:20,cal:80,avgHR:102,maxHR:139,start:"4:57 PM",z1p:46,z2p:3,z3p:0,z4p:0,z5p:0,z1m:9,z2m:1,z3m:0,z4m:0,z5m:0},{cat:"running",name:"Running",strain:12.7,dur:60,cal:674,avgHR:137,maxHR:160,start:"9:53 AM",z1p:11,z2p:78,z3p:10,z4p:0,z5p:0,z1m:7,z2m:47,z3m:6,z4m:0,z5m:0}],
  "2026-02-23":[{cat:"running",name:"Running",strain:14.9,dur:48,cal:604,avgHR:140,maxHR:183,start:"1:59 PM",z1p:7,z2p:8,z3p:19,z4p:30,z5p:24,z1m:3,z2m:4,z3m:9,z4m:14,z5m:12}],
  "2026-02-24":[{cat:"fitness",name:"Functional Fitness",strain:13.3,dur:66,cal:367,avgHR:109,maxHR:172,start:"10:00 AM",z1p:30,z2p:9,z3p:4,z4p:3,z5p:0,z1m:20,z2m:6,z3m:3,z4m:2,z5m:0}],
  "2026-02-25":[{cat:"running",name:"Running",strain:12.0,dur:66,cal:619,avgHR:127,maxHR:164,start:"11:35 AM",z1p:14,z2p:62,z3p:11,z4p:9,z5p:0,z1m:9,z2m:41,z3m:7,z4m:6,z5m:0}],
  "2026-02-26":[{cat:"fitness",name:"Functional Fitness",strain:14.3,dur:85,cal:543,avgHR:112,maxHR:173,start:"9:58 AM",z1p:19,z2p:13,z3p:8,z4p:5,z5p:3,z1m:16,z2m:11,z3m:7,z4m:4,z5m:3}],
  "2026-02-27":[{cat:"running",name:"Running",strain:11.0,dur:60,cal:532,avgHR:123,maxHR:163,start:"10:43 AM",z1p:8,z2p:62,z3p:13,z4p:6,z5p:0,z1m:5,z2m:37,z3m:8,z4m:4,z5m:0}],
  "2026-02-28":[{cat:"fitness",name:"Functional Fitness",strain:15.3,dur:86,cal:819,avgHR:127,maxHR:165,start:"7:18 AM",z1p:16,z2p:44,z3p:24,z4p:10,z5p:0,z1m:14,z2m:38,z3m:21,z4m:9,z5m:0}],
  "2026-03-01":[{cat:"running",name:"Running",strain:11.5,dur:61,cal:561,avgHR:126,maxHR:160,start:"7:41 AM",z1p:11,z2p:46,z3p:29,z4p:5,z5p:0,z1m:7,z2m:28,z3m:18,z4m:3,z5m:0}],
  "2026-03-02":[{cat:"running",name:"Running",strain:11.8,dur:51,cal:522,avgHR:131,maxHR:165,start:"1:18 PM",z1p:11,z2p:23,z3p:44,z4p:16,z5p:0,z1m:6,z2m:12,z3m:22,z4m:8,z5m:0}],
  "2026-03-03":[{cat:"walking",name:"Walking",strain:5.4,dur:25,cal:127,avgHR:106,maxHR:135,start:"4:13 PM",z1p:39,z2p:9,z3p:0,z4p:0,z5p:0,z1m:10,z2m:2,z3m:0,z4m:0,z5m:0},{cat:"spin",name:"Spin",strain:7.5,dur:30,cal:266,avgHR:124,maxHR:139,start:"11:10 AM",z1p:14,z2p:86,z3p:0,z4p:0,z5p:0,z1m:4,z2m:26,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:13.2,dur:71,cal:364,avgHR:107,maxHR:170,start:"9:58 AM",z1p:23,z2p:3,z3p:3,z4p:5,z5p:1,z1m:16,z2m:2,z3m:2,z4m:4,z5m:1}],
  "2026-03-04":[{cat:"running",name:"Running",strain:12.9,dur:90,cal:808,avgHR:124,maxHR:167,start:"10:53 AM",z1p:12,z2p:62,z3p:17,z4p:2,z5p:0,z1m:11,z2m:56,z3m:15,z4m:2,z5m:0}],
  "2026-03-05":[{cat:"fitness",name:"Functional Fitness",strain:13.5,dur:62,cal:405,avgHR:113,maxHR:169,start:"10:09 AM",z1p:27,z2p:14,z3p:6,z4p:7,z5p:1,z1m:17,z2m:9,z3m:4,z4m:4,z5m:1}],
  "2026-03-06":[{cat:"spin",name:"Spin",strain:10.2,dur:59,cal:517,avgHR:123,maxHR:136,start:"2:25 PM",z1p:22,z2p:76,z3p:0,z4p:0,z5p:0,z1m:13,z2m:45,z3m:0,z4m:0,z5m:0}],
  "2026-03-07":[{cat:"fitness",name:"Functional Fitness",strain:16.5,dur:88,cal:910,avgHR:131,maxHR:176,start:"7:03 AM",z1p:5,z2p:12,z3p:39,z4p:21,z5p:6,z1m:4,z2m:11,z3m:34,z4m:18,z5m:5}],
  "2026-03-09":[{cat:"running",name:"Running",strain:13.1,dur:52,cal:585,avgHR:135,maxHR:172,start:"1:37 PM",z1p:9,z2p:10,z3p:37,z4p:29,z5p:5,z1m:5,z2m:5,z3m:19,z4m:15,z5m:3}],
  "2026-03-10":[{cat:"spin",name:"Spin",strain:7.7,dur:30,cal:276,avgHR:126,maxHR:136,start:"11:00 AM",z1p:4,z2p:96,z3p:0,z4p:0,z5p:0,z1m:1,z2m:29,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:12.4,dur:59,cal:236,avgHR:99,maxHR:158,start:"10:00 AM",z1p:9,z2p:2,z3p:8,z4p:2,z5p:0,z1m:5,z2m:1,z3m:5,z4m:1,z5m:0}],
  "2026-03-11":[{cat:"spin",name:"Spin",strain:11.7,dur:95,cal:746,avgHR:120,maxHR:160,start:"12:10 PM",z1p:55,z2p:36,z3p:3,z4p:0,z5p:0,z1m:52,z2m:34,z3m:3,z4m:0,z5m:0}],
  "2026-03-12":[{cat:"fitness",name:"Functional Fitness",strain:13.2,dur:74,cal:327,avgHR:102,maxHR:156,start:"10:00 AM",z1p:8,z2p:5,z3p:5,z4p:9,z5p:0,z1m:6,z2m:4,z3m:4,z4m:7,z5m:0}],
  "2026-03-13":[{cat:"running",name:"Running",strain:12.6,dur:47,cal:506,avgHR:132,maxHR:179,start:"1:06 PM",z1p:11,z2p:52,z3p:1,z4p:10,z5p:16,z1m:5,z2m:24,z3m:0,z4m:5,z5m:8}],
  "2026-03-14":[{cat:"fitness",name:"Functional Fitness",strain:14.0,dur:69,cal:536,avgHR:119,maxHR:166,start:"7:13 AM",z1p:33,z2p:25,z3p:12,z4p:8,z5p:0,z1m:23,z2m:17,z3m:8,z4m:6,z5m:0}],
  "2026-03-15":[{cat:"running",name:"Running",strain:10.5,dur:58,cal:519,avgHR:124,maxHR:149,start:"9:12 AM",z1p:8,z2p:79,z3p:7,z4p:0,z5p:0,z1m:5,z2m:46,z3m:4,z4m:0,z5m:0}],
  "2026-03-16":[{cat:"running",name:"Running",strain:12.4,dur:51,cal:527,avgHR:131,maxHR:170,start:"12:33 PM",z1p:10,z2p:17,z3p:37,z4p:18,z5p:5,z1m:5,z2m:9,z3m:19,z4m:9,z5m:3}],
  "2026-03-17":[{cat:"spin",name:"Spin",strain:7.9,dur:30,cal:279,avgHR:127,maxHR:136,start:"11:17 AM",z1p:2,z2p:97,z3p:0,z4p:0,z5p:0,z1m:1,z2m:29,z3m:0,z4m:0,z5m:0},{cat:"fitness",name:"Functional Fitness",strain:13.0,dur:76,cal:357,avgHR:104,maxHR:164,start:"10:00 AM",z1p:24,z2p:5,z3p:4,z4p:5,z5p:0,z1m:18,z2m:4,z3m:3,z4m:4,z5m:0}],
  "2026-03-18":[{cat:"running",name:"Running",strain:12.5,dur:56,cal:577,avgHR:131,maxHR:169,start:"12:45 PM",z1p:18,z2p:37,z3p:24,z4p:14,z5p:3,z1m:10,z2m:21,z3m:13,z4m:8,z5m:2}],
  "2026-03-19":[{cat:"fitness",name:"Functional Fitness",strain:15.6,dur:80,cal:706,avgHR:124,maxHR:176,start:"10:06 AM",z1p:28,z2p:17,z3p:13,z4p:19,z5p:3,z1m:22,z2m:14,z3m:10,z4m:15,z5m:2}],
  "2026-03-20":[{cat:"spin",name:"Spin",strain:6.6,dur:44,cal:242,avgHR:109,maxHR:157,start:"11:13 AM",z1p:46,z2p:0,z3p:0,z4p:0,z5p:0,z1m:20,z2m:0,z3m:0,z4m:0,z5m:0}],
  "2026-03-21":[{cat:"fitness",name:"Functional Fitness",strain:15.6,dur:66,cal:715,avgHR:134,maxHR:179,start:"7:18 AM",z1p:3,z2p:28,z3p:37,z4p:18,z5p:6,z1m:2,z2m:19,z3m:23,z4m:12,z5m:4}],
  "2026-03-22":[{cat:"running",name:"Running",strain:10.1,dur:56,cal:485,avgHR:123,maxHR:136,start:"8:07 AM",z0p:7,z1p:30,z2p:63,z3p:1,z4p:0,z5p:0,z0m:4,z1m:17,z2m:34,z3m:0,z4m:0,z5m:0}],
    "2026-03-23":[{cat:"running",name:"Running",strain:13.4,dur:54,cal:613,avgHR:136,maxHR:177,start:"1:18 PM",z1p:5,z2p:40,z3p:35,z4p:15,z5p:2,z1m:3,z2m:22,z3m:19,z4m:8,z5m:1}],
    "2026-03-24":[{cat:"fitness",name:"Functional Fitness",strain:12.9,dur:52,cal:349,avgHR:114,maxHR:171,start:"10:15 AM",z1p:20,z2p:35,z3p:25,z4p:12,z5p:3,z1m:10,z2m:18,z3m:13,z4m:6,z5m:2}],
    "2026-03-25":[{cat:"running",name:"Running",strain:13.3,dur:81,cal:775,avgHR:126,maxHR:165,start:"12:43 PM",z1p:10,z2p:50,z3p:28,z4p:8,z5p:2,z1m:8,z2m:41,z3m:23,z4m:6,z5m:2}],
    "2026-03-26":[{cat:"fitness",name:"Functional Fitness",strain:14.2,dur:66,cal:541,avgHR:121,maxHR:164,start:"10:12 AM",z1p:15,z2p:35,z3p:30,z4p:14,z5p:3,z1m:10,z2m:23,z3m:20,z4m:9,z5m:2}],
};

// RECENT_WORKOUTS — derived live from CAL_RICH (newest first)
// No hardcoding: adding to CAL_RICH automatically appears here
export const RECENT_WORKOUTS = (()=>{
  const ACT = ACT_META;
  const rows = [];
  Object.keys(CAL_RICH).sort().reverse().forEach(dateKey => {
    const workouts = CAL_RICH[dateKey];
    if(!Array.isArray(workouts)) return;
    const d = new Date(dateKey + "T12:00:00");
    const dateStr = d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
    workouts.forEach(w => {
      const meta = ACT[w.cat] || {label:w.name,icon:"⚡",color:P.steel};
      rows.push({
        dateKey,
        dateStr,
        activity: w.name || meta.label,
        icon:     meta.icon,
        color:    meta.color,
        dur:      w.dur    || 0,
        strain:   w.strain || 0,
        avgHR:    w.avgHR  || 0,
        maxHR:    w.maxHR  || 0,
        cal:      w.cal    || 0,
        start:    w.start  || "",
        z1: w.z1p || 0, z2: w.z2p || 0, z3: w.z3p || 0,
        z4: w.z4p || 0, z5: w.z5p || 0,
      });
    });
  });
  // Apply Peloton overlay to recent workouts
      // Rebuild Peloton overlay from CAL_RICH + peloton data (ensures all dates matched)
    try {
      const peloRaw = localStorage.getItem("vital_peloton_v1");
      if(peloRaw){
        const peloAll = JSON.parse(peloRaw);
        const catMap = {cycling:"spin",running:"running",walking:"walking",strength:"functional fitness",yoga:"yoga",meditation:"meditation",cardio:"cardio"};
        const freshOv = {};
        for(const r of peloAll){
          if(!r.dateKey || !CAL_RICH[r.dateKey]) continue;
          const cat = catMap[r.discipline.toLowerCase()]||r.discipline.toLowerCase()||"other";
          freshOv[r.dateKey] = freshOv[r.dateKey]||{};
          freshOv[r.dateKey][cat] = {distance:r.distance,avgPace:r.avgSpeed>0?(60/r.avgSpeed):0,avgSpeed:r.avgSpeed,output:r.output,avgWatts:r.avgWatts,maxWatts:r.maxWatts,avgCadence:r.avgCadence,avgResistance:r.avgResistance,peloTitle:r.title,peloInst:r.instructor,duration:r.duration,source:"peloton"};
        }
        localStorage.setItem("vital_cal_rich_overlay", JSON.stringify(freshOv));
      }
    } catch(e){ console.warn("Peloton overlay rebuild:", e); }

  try {
    const ov = JSON.parse(localStorage.getItem("vital_cal_rich_overlay")||"{}");
    return rows.map(w => {
      const d = ov[w.dateKey];
      if(!d) return w;
      const p = d[w.cat];
      if(!p) return w;
      return {...w, distance:w.distance||p.distance, avgPace:w.avgPace||p.avgPace,
        output:w.output||p.output, avgWatts:w.avgWatts||p.avgWatts,
        peloMerged:true, peloTitle:p.peloTitle, peloInst:p.peloInst};
    });
  } catch(e){ return rows; }
})();
