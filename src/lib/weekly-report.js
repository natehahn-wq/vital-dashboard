// Generates a self-contained HTML weekly report (Mar 17–23 2026 window) by
// pulling daily Whoop entries from CAL_DATA, workouts from CAL_RICH, the latest
// Hume weight, lab overdue counts, and the master health score, then triggers
// a browser download of the rendered HTML.
import { CAL_DATA, CAL_RICH } from "./data/calendar.js";
import { HUME_DATA } from "./data/body.js";
import { LAB_OVERDUE } from "./data/labs.js";
import { SCORES_NOW } from "./data/scores.js";

export function generateWeeklyReport() {
  // Gather this week's data from CAL_DATA + CAL_RICH
  const today = new Date("2026-03-23");
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
  const fmt = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const weekLabel = `${fmt(weekAgo)} – ${fmt(today)}`;

  // Week's daily entries
  const weekEntries = Object.entries(CAL_DATA)
    .filter(([d])=>d>="2026-03-17"&&d<="2026-03-23")
    .sort(([a],[b])=>a.localeCompare(b));

  const weekWorkouts = weekEntries.flatMap(([d])=>(CAL_RICH[d]||[]).map(w=>({...w,date:d})));

  const avgRec  = weekEntries.length ? Math.round(weekEntries.reduce((s,[,d])=>s+(d.rec||0),0)/weekEntries.filter(([,d])=>d.rec).length) : 0;
  const avgHRV  = weekEntries.length ? Math.round(weekEntries.reduce((s,[,d])=>s+(d.hrv||0),0)/weekEntries.filter(([,d])=>d.hrv).length) : 0;
  const avgSlp  = weekEntries.length ? (weekEntries.reduce((s,[,d])=>s+(d.sdur||0),0)/weekEntries.filter(([,d])=>d.sdur).length).toFixed(1) : 0;
  const avgSlpScore = weekEntries.length ? Math.round(weekEntries.reduce((s,[,d])=>s+(d.slp||0),0)/weekEntries.filter(([,d])=>d.slp).length) : 0;
  const totalStrain = weekWorkouts.reduce((s,w)=>s+w.strain,0).toFixed(1);
  const totalCal  = weekWorkouts.reduce((s,w)=>s+w.cal,0).toLocaleString();
  const alcDays  = weekEntries.filter(([,d])=>d.alc).length;
  const latestWt = HUME_DATA[0]?.wt || 213;

  const overdue = LAB_OVERDUE.length;

  // Score deltas
  const masterScore = SCORES_NOW.master.score;
  const masterPrev  = SCORES_NOW.master.prev;

  const scoreColor = s => s>=80?"#3A9C68":s>=70?"#C47830":s>=60?"#C47830":"#C4604A";
  const recColor   = r => r>=76?"#3A9C68":r>=58?"#C47830":"#C4604A";

  const workoutRows = weekWorkouts.map(w=>{
    const meta = {
      running:{icon:"🏃",color:"#C47830"}, fitness:{icon:"🏋",color:"#3A5C48"},
      spin:{icon:"🚴",color:"#C4604A"}, walking:{icon:"🚶",color:"#7A5A80"},
    };
    const m = meta[w.cat]||{icon:"⚡",color:"#6B6057"};
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;">${new Date(w.date+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;">${m.icon} ${w.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;text-align:right;">${w.strain}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;text-align:right;">${w.dur}m</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;text-align:right;">${w.cal} kcal</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E8E4DE;text-align:right;">${w.avgHR||"—"} bpm</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VITAL · Weekly Report · ${weekLabel}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#F4EFE8; color:#2C2420; }
  .page { max-width:900px; margin:0 auto; padding:40px 24px 64px; }
  .header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #C47830; }
  .logo { font-family:Georgia,serif; font-size:28px; font-weight:600; color:#2C2420; letter-spacing:-0.02em; }
  .logo span { color:#C47830; }
  .week-label { font-size:12px; color:#8C7B70; letter-spacing:0.06em; text-transform:uppercase; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:14px; margin-bottom:28px; }
  .stat-card { background:#fff; border-radius:12px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
  .stat-val { font-family:Georgia,serif; font-size:26px; font-weight:600; letter-spacing:-0.02em; line-height:1; margin-bottom:3px; }
  .stat-label { font-size:9px; text-transform:uppercase; letter-spacing:0.08em; color:#8C7B70; }
  .stat-sub { font-size:10px; color:#8C7B70; margin-top:3px; }
  .section { background:#fff; border-radius:14px; padding:20px 22px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
  .section-title { font-size:9px; text-transform:uppercase; letter-spacing:0.1em; color:#8C7B70; margin-bottom:12px; font-weight:700; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; padding:8px 12px; border-bottom:2px solid #E8E4DE; font-size:9px; text-transform:uppercase; letter-spacing:0.06em; color:#8C7B70; font-weight:700; }
  th:last-child, td:last-child { text-align:right; }
  .badge { display:inline-block; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:700; }
  .alert { background:#FDF1EE; border:1px solid #C4604A33; border-radius:8px; padding:10px 14px; font-size:11px; color:#7A3020; margin-top:12px; }
  .score-bar-bg { height:6px; background:#EAE4DC; border-radius:3px; overflow:hidden; margin-top:6px; }
  .score-bar { height:100%; border-radius:3px; }
  .footer { text-align:center; font-size:10px; color:#8C7B70; margin-top:40px; padding-top:20px; border-top:1px solid #E8E4DE; }
  @media print { body{background:#fff;} .page{padding:20px;} }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="logo">VITAL <span>Health</span></div>
      <div style="font-size:13px;color:#8C7B70;margin-top:4px;">Weekly Report · ${weekLabel}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#8C7B70;">Nate Hahn · Age 47 · Montecito, CA</div>
      <div style="font-size:11px;color:#8C7B70;margin-top:2px;">Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
    </div>
  </div>

  <!-- Key Metrics -->
  <div class="grid">
    <div class="stat-card">
      <div class="stat-label">Health Score</div>
      <div class="stat-val" style="color:${scoreColor(masterScore)}">${masterScore}</div>
      <div class="stat-sub">${masterScore>masterPrev?"+":""}${masterScore-masterPrev} pts vs prior</div>
      <div class="score-bar-bg"><div class="score-bar" style="width:${masterScore}%;background:${scoreColor(masterScore)}"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg Recovery</div>
      <div class="stat-val" style="color:${recColor(avgRec)}">${avgRec}%</div>
      <div class="stat-sub">${avgRec>=76?"Above avg":avgRec>=58?"Normal":"Below avg"}</div>
      <div class="score-bar-bg"><div class="score-bar" style="width:${avgRec}%;background:${recColor(avgRec)}"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg HRV</div>
      <div class="stat-val" style="color:#4A8070">${avgHRV} ms</div>
      <div class="stat-sub">${avgHRV>=44?"Above":"Below"} your 44ms baseline</div>
      <div class="score-bar-bg"><div class="score-bar" style="width:${Math.min(100,avgHRV/70*100)}%;background:#4A8070"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Sleep Score</div>
      <div class="stat-val" style="color:#4A6070">${avgSlpScore}%</div>
      <div class="stat-sub">${avgSlp}h avg duration</div>
      <div class="score-bar-bg"><div class="score-bar" style="width:${avgSlpScore}%;background:#4A6070"></div></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Strain</div>
      <div class="stat-val" style="color:#C47830">${totalStrain}</div>
      <div class="stat-sub">${weekWorkouts.length} workouts · ${totalCal} kcal</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Weight</div>
      <div class="stat-val" style="color:#4A8FA0">${latestWt}</div>
      <div class="stat-sub">lbs · Hume Pod</div>
    </div>
  </div>

  <!-- Workouts -->
  <div class="section">
    <div class="section-title">Workouts This Week</div>
    ${weekWorkouts.length>0?`
    <table>
      <thead><tr>
        <th>Date</th><th>Activity</th><th style="text-align:right">Strain</th>
        <th style="text-align:right">Duration</th><th style="text-align:right">Calories</th>
        <th style="text-align:right">Avg HR</th>
      </tr></thead>
      <tbody>${workoutRows}</tbody>
    </table>
    `:'<div style="color:#8C7B70;font-size:12px;padding:8px 0;">No workouts logged this week.</div>'}
  </div>

  <!-- Recovery & Sleep -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
    <div class="section">
      <div class="section-title">Recovery</div>
      ${weekEntries.map(([d,v])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #F0EBE4;font-size:12px;">
          <span style="color:#8C7B70;">${new Date(d+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
          <div style="display:flex;gap:12px;align-items:center;">
            <span>${v.hrv||"—"}ms</span>
            <span style="font-weight:600;color:${recColor(v.rec||0)}">${v.rec||"—"}%</span>
            ${v.alc?'<span style="font-size:10px;">🍷</span>':''}
          </div>
        </div>`).join("")}
    </div>
    <div class="section">
      <div class="section-title">Sleep</div>
      ${weekEntries.map(([d,v])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #F0EBE4;font-size:12px;">
          <span style="color:#8C7B70;">${new Date(d+"T12:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
          <div style="display:flex;gap:12px;">
            <span>${v.sdur||"—"}h</span>
            <span style="font-weight:600;color:#4A6070">${v.slp||"—"}%</span>
          </div>
        </div>`).join("")}
    </div>
  </div>

  <!-- Lab Flags -->
  ${overdue>0?`
  <div class="section">
    <div class="section-title">Lab Flags (${overdue} overdue)</div>
    <div class="alert">
      <strong>${overdue} biomarkers overdue</strong> — last drawn May 23, 2025.
      Recommend scheduling next draw: Testosterone, ApoB, CRP, HbA1c, Vitamin D, Ferritin, DHEA-S, Free T, Homocysteine, eGFR.
    </div>
  </div>`:""}

  <!-- Insights -->
  <div class="section">
    <div class="section-title">Weekly Insights</div>
    <ul style="padding-left:18px;font-size:12px;line-height:1.9;color:#4A3C34;">
      <li><strong>Recovery avg ${avgRec}%</strong> — ${avgRec>=76?"Excellent week. Body well-adapted to current training load.":avgRec>=58?"Normal range. Adequate response to training stimulus.":"Below average. Consider reducing next week's training intensity."}</li>
      <li><strong>HRV avg ${avgHRV}ms</strong> — ${avgHRV>=44?"Above your baseline. Nervous system handling load well.":"Below your 44ms baseline. Prioritize sleep quality and stress reduction."}</li>
      <li><strong>Sleep avg ${avgSlp}h / ${avgSlpScore}%</strong> — ${avgSlpScore>=95?"Optimal sleep performance this week.":avgSlpScore>=85?"Good sleep week with some room to improve.":"Sleep performance needs attention — check schedule and recovery habits."}</li>
      ${alcDays>0?`<li><strong>${alcDays} alcohol day${alcDays>1?"s":""}</strong> — each drinking night suppresses sleep score by ~7pts and HRV by ~13ms.</li>`:"<li>Zero alcohol this week — maximizes recovery potential.</li>"}
      <li><strong>Training load</strong> — ${weekWorkouts.length} sessions, ${totalStrain} total strain. ${parseFloat(totalStrain)>60?"Consider a deload next week if fatigue accumulates.":"Within sustainable range for current fitness block."}</li>
    </ul>
  </div>

  <div class="footer">
    VITAL Health Intelligence · Nate Hahn · Generated by VITAL Dashboard<br>
    Data sources: WHOOP, Hume Pod, DXA (Jan 2026), BioLab (May 2025)
  </div>
</div>
</body>
</html>`;

  // Trigger download
  const blob = new Blob([html], {type:"text/html"});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `VITAL_Weekly_${weekLabel.replace(/\s/g,"_").replace(/[,–]/g,"")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
