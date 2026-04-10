// Live WHOOP data hook — fetches from /api/whoop/data on mount, then syncs
// the result into the module-level WHOOP + CAL_RICH constants so the rest of
// the app reads "live" values without prop-drilling.
import { useState, useEffect } from "react";
import { WHOOP } from "../lib/data/whoop.js";
import { CAL_RICH } from "../lib/data/calendar.js";

const SPORT_MAP = {0:"Running",1:"Cycling",48:"Functional Fitness",52:"Walking",71:"Spin",82:"Other",84:"Sport","-1":"Activity"};
const CAT_MAP   = {0:"running",1:"cycling",48:"fitness",52:"walking",71:"spin",82:"other",84:"sport"};

function syncWhoopLive(live) {
  WHOOP.recovery = live.recovery;
  WHOOP.hrv      = live.hrv;
  WHOOP.rhr      = live.rhr;
  WHOOP.strain   = live.strain;
  WHOOP.spo2     = live.spo2;
  if (live.sleep) Object.assign(WHOOP.sleep, live.sleep);

  // Sync live workout data into CAL_RICH so Fitness page + Today page use it
  if (!live.workouts || live.workouts.length === 0) return;
  live.workouts.forEach(w => {
    const dt = w.start ? w.start.slice(0,10) : null;
    if (!dt) return;
    const startDate = new Date(w.start);
    const hh = startDate.getHours();
    const mm = startDate.getMinutes();
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 || 12;
    const timeStr = `${h12}:${String(mm).padStart(2,"0")} ${ampm}`;
    const entry = {
      cat: CAT_MAP[w.sport] || "other",
      name: SPORT_MAP[w.sport] || "Activity",
      strain: w.strain || 0,
      dur: w.dur || 0,
      cal: w.cal || 0,
      avgHR: w.avgHR || 0,
      maxHR: w.maxHR || 0,
      start: timeStr,
      timeH: hh,
      z0p: w.zones?.z0p || 0, z1p: w.zones?.z1p || 0, z2p: w.zones?.z2p || 0,
      z3p: w.zones?.z3p || 0, z4p: w.zones?.z4p || 0, z5p: w.zones?.z5p || 0,
      z0m: w.zones?.z0m || 0, z1m: w.zones?.z1m || 0, z2m: w.zones?.z2m || 0,
      z3m: w.zones?.z3m || 0, z4m: w.zones?.z4m || 0, z5m: w.zones?.z5m || 0,
      _liveId: w.id,
    };
    if (!CAL_RICH[dt]) CAL_RICH[dt] = [];
    // Avoid duplicates — skip if already present with same _liveId
    if (!CAL_RICH[dt].some(e => e._liveId === w.id || (!e._liveId && e.cat === entry.cat && e.strain === entry.strain))) {
      CAL_RICH[dt].push(entry);
    }
  });
}

export function useWhoopLive() {
  const [whoopStatus, setWhoopStatus] = useState('loading'); // loading|connected|disconnected|stale

  useEffect(()=>{
    // Skip on localhost without API (avoids console errors)
    const isLocalFile = window.location.protocol === 'file:';
    if (isLocalFile) { setWhoopStatus('disconnected'); return; }

    fetch('/api/whoop/data')
      .then(r => r.ok ? r.json() : null)
      .then(res => {
        if (!res || !res.connected || !res.data) {
          setWhoopStatus('disconnected');
          return;
        }
        syncWhoopLive(res.data);
        setWhoopStatus(res.stale ? 'stale' : 'connected');
      })
      .catch(()=> setWhoopStatus('disconnected'));
  }, []);

  return { whoopStatus };
}
