import { readFileSync, writeFileSync } from 'fs';

const EXPORT_DIR = '/Users/natehahn/Downloads/my_whoop_data_2026_06_16';
const CAL_JS = '/Users/natehahn/projects/vital-dashboard/src/lib/data/calendar.js';

// --- Activity name → category mapping ---
const ACTIVITY_CAT = {
  'running': 'running',
  'cycling': 'cycling',
  'spin': 'spin',
  'walking': 'walking',
  'functional fitness': 'fitness',
  'weightlifting': 'fitness',
  'hiit': 'fitness',
  'crossfit': 'fitness',
  'yoga': 'yoga',
  'meditation': 'meditation',
  'swimming': 'swimming',
  'hiking': 'hiking',
  'tennis': 'tennis',
  'basketball': 'sport',
  'soccer': 'sport',
  'american football': 'sport',
  'golf': 'sport',
  'pickleball': 'sport',
  'surfing': 'sport',
};

function catFor(name) {
  const lower = (name || '').toLowerCase().trim();
  return ACTIVITY_CAT[lower] || 'other';
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (vals[i] || '').trim());
    return obj;
  });
}

function dateKey(timestamp) {
  // "2026-06-14 09:14:35" → "2026-06-14"
  return (timestamp || '').slice(0, 10);
}

function timeStr(timestamp) {
  if (!timestamp) return '';
  const parts = timestamp.split(' ');
  if (parts.length < 2) return '';
  const [h, m] = parts[1].split(':');
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h12}:${m} ${ampm}`;
}

// --- Parse workouts ---
const workoutsRaw = readFileSync(`${EXPORT_DIR}/workouts.csv`, 'utf8');
const workouts = parseCSV(workoutsRaw);

const calRich = {};
for (const w of workouts) {
  const dk = dateKey(w['Workout start time']);
  if (!dk || dk < '2025-12-01') continue;

  const cat = catFor(w['Activity name']);
  const name = w['Activity name'] || 'Workout';
  const strain = +(+w['Activity Strain']).toFixed(1);
  const dur = Math.round(+w['Duration (min)']);
  const cal = Math.round(+w['Energy burned (cal)']);
  const maxHR = Math.round(+w['Max HR (bpm)']);
  const avgHR = Math.round(+w['Average HR (bpm)']);
  const start = timeStr(w['Workout start time']);
  const z1p = Math.round(+w['HR Zone 1 %']);
  const z2p = Math.round(+w['HR Zone 2 %']);
  const z3p = Math.round(+w['HR Zone 3 %']);
  const z4p = Math.round(+w['HR Zone 4 %']);
  const z5p = Math.round(+w['HR Zone 5 %']);
  const z1m = Math.round(dur * z1p / 100);
  const z2m = Math.round(dur * z2p / 100);
  const z3m = Math.round(dur * z3p / 100);
  const z4m = Math.round(dur * z4p / 100);
  const z5m = Math.round(dur * z5p / 100);

  const entry = { cat, name, strain, dur, cal, avgHR, maxHR, start, z1p, z2p, z3p, z4p, z5p, z1m, z2m, z3m, z4m, z5m };

  if (!calRich[dk]) calRich[dk] = [];
  calRich[dk].push(entry);
}

// Sort workouts within each day by start time (earliest first)
for (const dk of Object.keys(calRich)) {
  calRich[dk].sort((a, b) => a.start.localeCompare(b.start));
}

// --- Parse physiological cycles ---
const physioRaw = readFileSync(`${EXPORT_DIR}/physiological_cycles.csv`, 'utf8');
const physio = parseCSV(physioRaw);

const calData = {};
for (const row of physio) {
  const dk = dateKey(row['Cycle start time']);
  if (!dk || dk < '2025-12-01') continue;

  const rec = Math.round(+row['Recovery score %'] || 0);
  const hrv = Math.round(+row['Heart rate variability (ms)'] || 0);
  const rhr = Math.round(+row['Resting heart rate (bpm)'] || 0);
  const slp = Math.round(+row['Sleep performance %'] || 0);
  const sdurMin = +row['Asleep duration (min)'] || 0;
  const sdur = +(sdurMin / 60).toFixed(1);

  calData[dk] = { slp, sdur, rec, hrv, rhr };
}

// --- Generate calendar.js content ---
const sortedDataKeys = Object.keys(calData).sort();
const sortedRichKeys = Object.keys(calRich).sort();

function fmtEntry(e) {
  return `{cat:"${e.cat}",name:"${e.name}",strain:${e.strain},dur:${e.dur},cal:${e.cal},avgHR:${e.avgHR},maxHR:${e.maxHR},start:"${e.start}",z1p:${e.z1p},z2p:${e.z2p},z3p:${e.z3p},z4p:${e.z4p},z5p:${e.z5p},z1m:${e.z1m},z2m:${e.z2m},z3m:${e.z3m},z4m:${e.z4m},z5m:${e.z5m}}`;
}

let calDataStr = '';
for (const k of sortedDataKeys) {
  const d = calData[k];
  calDataStr += `  "${k}":{slp:${d.slp},sdur:${d.sdur},rec:${d.rec},hrv:${d.hrv},rhr:${d.rhr}},\n`;
}

let calRichStr = '';
for (const k of sortedRichKeys) {
  const entries = calRich[k].map(fmtEntry).join(',');
  calRichStr += `  "${k}":[${entries}],\n`;
}

// Read original file to preserve the header and RECENT_WORKOUTS section
const original = readFileSync(CAL_JS, 'utf8');

// Extract RECENT_WORKOUTS and everything after it
const recentIdx = original.indexOf('// RECENT_WORKOUTS');
const recentSection = recentIdx >= 0 ? original.slice(recentIdx) : '';

const output = `// Day-level calendar data (Dec 2025 – Jun 2026): WHOOP physiology, sleep,
// recovery, alcohol/weight flags (CAL_DATA), plus per-day workout details
// (CAL_RICH). RECENT_WORKOUTS is derived from CAL_RICH (newest first) with
// optional Peloton overlay merged in from localStorage.

import { P } from "../theme.js";
import { ACT_META } from "./workouts.js";

export const CAL_DATA={
${calDataStr}};

export const CAL_RICH={
${calRichStr}};

${recentSection}`;

writeFileSync(CAL_JS, output);
console.log(`CAL_DATA: ${sortedDataKeys.length} days (${sortedDataKeys[0]} to ${sortedDataKeys[sortedDataKeys.length-1]})`);
console.log(`CAL_RICH: ${sortedRichKeys.length} days (${sortedRichKeys[0]} to ${sortedRichKeys[sortedRichKeys.length-1]})`);
console.log(`Total workout entries: ${Object.values(calRich).reduce((s, a) => s + a.length, 0)}`);
