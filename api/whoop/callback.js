// api/whoop/callback.js
// Step 1 of WHOOP OAuth — user visits /api/whoop/login, gets redirected here after authorizing
// Exchanges the auth code for access + refresh tokens, stores in Vercel KV

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { code, state, error } = req.query;

  // Handle user denying access
  if (error) {
        return res.redirect('/?whoop=denied');
  }

  if (!code) {
        return res.status(400).send('Missing authorization code');
  }

  const clientId     = process.env.WHOOP_CLIENT_ID;
    const clientSecret = process.env.WHOOP_CLIENT_SECRET;
    const appUrl       = process.env.APP_URL || 'https://vital-puce-iota.vercel.app'
    const redirectUri = `${appUrl}/api/whoop/callback`;

  try {
        // Exchange auth code for tokens
      const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                        grant_type:    'authorization_code',
                        code,
                        client_id:     clientId,
                        client_secret: clientSecret,
                        redirect_uri:  redirectUri,
              }),
      });

      if (!tokenRes.ok) {
              const err = await tokenRes.text();
              console.error('WHOOP token exchange failed:', err);
              return res.status(500).send('Token exchange failed: ' + err);
      }

      const tokens = await tokenRes.json();

      // Store tokens in KV
      await kv.set('whoop:access_token',  tokens.access_token);
        await kv.set('whoop:refresh_token', tokens.refresh_token);
        await kv.set('whoop:expires_at',    Date.now() + (tokens.expires_in * 1000));
        await kv.set('whoop:connected',     true);

      // Do an immediate data fetch so the dashboard has data right away
      await fetchAndStoreWhoopData(tokens.access_token);

      // Redirect back to the dashboard
      return res.redirect('/?whoop=connected');
  } catch (err) {
        console.error('WHOOP callback error:', err);
        return res.status(500).send('OAuth callback error: ' + err.message);
  }
}

// == Helper: fetch zone_duration from individual workout detail endpoint ==
async function fetchWorkoutZones(workoutId, headers) {
    try {
          const res = await fetch(
                  `https://api.prod.whoop.com/developer/v2/activity/workout/${workoutId}`,
            { headers }
                );
          if (!res.ok) return null;
          const detail = await res.json();
          console.log(`[VITAL] Workout ${workoutId} detail score keys:`, detail.score ? Object.keys(detail.score) : 'no score', 'zone_duration:', JSON.stringify(detail.score?.zone_duration)); return detail.score?.zone_duration || null;
    } catch (e) {
          console.error(`[VITAL] Failed to fetch zones for workout ${workoutId}:`, e.message);
          return null;
    }
}

// == Helper: compute 6-zone percentages + minutes from zone_duration ==
function computeZones(zoneDuration, totalDurMs) {
    if (!zoneDuration || !totalDurMs || totalDurMs <= 0) {
          return { z0p:0, z1p:0, z2p:0, z3p:0, z4p:0, z5p:0, z0m:0, z1m:0, z2m:0, z3m:0, z4m:0, z5m:0 };
    }
    const z0ms = zoneDuration.zone_zero_milli  || 0;
    const z1ms = zoneDuration.zone_one_milli   || 0;
    const z2ms = zoneDuration.zone_two_milli   || 0;
    const z3ms = zoneDuration.zone_three_milli || 0;
    const z4ms = zoneDuration.zone_four_milli  || 0;
    const z5ms = zoneDuration.zone_five_milli  || 0;
    return {
          z0p: Math.round(z0ms / totalDurMs * 100),
          z1p: Math.round(z1ms / totalDurMs * 100),
          z2p: Math.round(z2ms / totalDurMs * 100),
          z3p: Math.round(z3ms / totalDurMs * 100),
          z4p: Math.round(z4ms / totalDurMs * 100),
          z5p: Math.round(z5ms / totalDurMs * 100),
          z0m: Math.round(z0ms / 60000),
          z1m: Math.round(z1ms / 60000),
          z2m: Math.round(z2ms / 60000),
          z3m: Math.round(z3ms / 60000),
          z4m: Math.round(z4ms / 60000),
          z5m: Math.round(z5ms / 60000),
    };
}

// == Shared data fetch (also called from refresh.js) ==
export async function fetchAndStoreWhoopData(accessToken) {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const base    = 'https://api.prod.whoop.com/developer/v2';

  const [recoveryRes, sleepRes, workoutRes, cycleRes] = await Promise.all([
        fetch(`${base}/recovery?limit=3`,         { headers }),
        fetch(`${base}/activity/sleep?limit=3`,   { headers }),
        fetch(`${base}/activity/workout?limit=5`, { headers }),
        fetch(`${base}/cycle?limit=3`,            { headers }),
      ]);

  const [recoveryData, sleepData, workoutData, cycleData] = await Promise.all([
        recoveryRes.ok ? recoveryRes.json() : null,
        sleepRes.ok    ? sleepRes.json()    : null,
        workoutRes.ok  ? workoutRes.json()  : null,
        cycleRes.ok    ? cycleRes.json()    : null,
      ]);

  console.log('[VITAL] WHOOP API raw:', JSON.stringify({
        recoveryRecords: recoveryData?.records?.length,
        sleepRecords:    sleepData?.records?.length,
        workoutRecords:  workoutData?.records?.length,
        cycleRecords:    cycleData?.records?.length,
        recoveryStatus:  recoveryRes.status,
        sleepStatus:     sleepRes.status,
        workoutStatus:   workoutRes.status,
        cycleStatus:     cycleRes.status
  }));

  const rec     = (recoveryData?.records || []).find(r => r?.score) || recoveryData?.records?.[0];
    const sleep   = (sleepData?.records || []).find(r => r?.score) || sleepData?.records?.[0];
    const workouts= workoutData?.records || [];
    const cycle   = (cycleData?.records || []).find(r => r?.score) || cycleData?.records?.[0];

  // Fetch individual workout details in parallel to get zone_duration
  const workoutDetails = await Promise.all(
        workouts.slice(0, 5).map(w => fetchWorkoutZones(w.id, headers))
      );

  const stageSummary = sleep?.score?.stage_summary || {};
    const msToH = ms => ms ? +((ms / 3600000).toFixed(2)) : 0;

  const normalized = {
        recovery: rec?.score?.recovery_score || 0,
        hrv:      +(rec?.score?.hrv_rmssd_milli || 0).toFixed(1),
        rhr:      Math.round(rec?.score?.resting_heart_rate || 0),
        strain:   +(cycle?.score?.strain || 0).toFixed(1),
        spo2:     +(rec?.score?.spo2_percentage || 0).toFixed(1),
        skinTemp: +(rec?.score?.skin_temp_celsius || 0).toFixed(1),

        sleep: {
                score:         Math.round(sleep?.score?.sleep_performance_percentage || 0),
                hours:         msToH(sleep?.score?.total_in_bed_time_milli),
                eff:           Math.round(sleep?.score?.sleep_efficiency_percentage || 0),
                hoursVsNeeded: Math.round(sleep?.score?.sleep_needed?.baseline_milli
                                                  ? (sleep.score.total_in_bed_time_milli / sleep.score.sleep_needed.baseline_milli * 100) : 0),
                consistency:   Math.round(sleep?.score?.sleep_consistency_percentage || 0),
                stressHigh:    Math.round(sleep?.score?.sleep_disturbance_percentage || 0),
                rem:           msToH(stageSummary.total_rem_sleep_time_milli),
                deep:          msToH(stageSummary.total_slow_wave_sleep_time_milli),
                light:         msToH(stageSummary.total_light_sleep_time_milli),
                awake:         msToH(stageSummary.total_awake_time_milli),
                resp:          +(sleep?.score?.respiratory_rate || 0).toFixed(1),
                perf:          Math.round(sleep?.score?.sleep_performance_percentage || 0),
                startTime:     sleep?.start || null,
                endTime:       sleep?.end || null,
        },

        workouts: workouts.slice(0, 5).map((w, i) => {
                const totalDurMs = new Date(w.end) - new Date(w.start);
                const zoneDuration = workoutDetails[i] || w.score?.zone_duration || null;
                const zones = computeZones(zoneDuration, totalDurMs);
                return {
                          id:     w.id,
                          sport:  w.sport_id,
                          strain: +(w.score?.strain || 0).toFixed(1),
                          avgHR:  Math.round(w.score?.average_heart_rate || 0),
                          maxHR:  Math.round(w.score?.max_heart_rate || 0),
                          cal:    Math.round(w.score?.kilojoule ? w.score.kilojoule * 0.239 : 0),
                          dur:    Math.round(totalDurMs / 60000),
                          start:  w.start,
                          zones,
                };
        }),

        fetchedAt: new Date().toISOString(),
        date:      new Date().toLocaleDateString('en-CA'),
  };

  await kv.set('whoop:latest', JSON.stringify(normalized));

  // --- Store daily entry + backfill for weekly fitness aggregation ---
  try {
        const dateKey = normalized.date;
        const dailyEntry = {
                date:     dateKey,
                recovery: normalized.recovery,
                hrv:      +normalized.hrv,
                rhr:      normalized.rhr,
                strain:   +normalized.strain,
                sleep:    normalized.sleep?.score || 0,
                workouts: (normalized.workouts || []).map(w => ({
                          sport:  w.sport,
                          strain: +w.strain,
                          dur:    w.dur,
                          cal:    w.cal,
                          start:  w.start,
                          zones:  w.zones,
                })),
        };

      let history = [];
        try {
                const raw = await kv.get('whoop:history');
                if (raw) history = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch(e) { history = []; }

      history = history.filter(h => h.date !== dateKey);
        history.push(dailyEntry);

      // Backfill missing days between static data end and today
      await backfillHistory(accessToken, history);

      history.sort((a,b) => a.date.localeCompare(b.date));
        history = history.slice(-90);
        await kv.set('whoop:history', JSON.stringify(history));
        console.log('[VITAL] Daily history stored:', dateKey, 'total days:', history.length);
  } catch(histErr) {
        console.error('[VITAL] Failed to store daily history:', histErr);
  }

  console.log('[VITAL] WHOOP data stored:', normalized.date,
                  `rec=${normalized.recovery}% hrv=${normalized.hrv}ms`);
    return normalized;
}


// == Backfill missing days from WHOOP API ==
async function backfillHistory(accessToken, history) {
    const STATIC_END = '2026-03-16';
    const today      = new Date().toLocaleDateString('en-CA');
    const existingDates = new Set(history.map(h => h.date));

  const missing = [];
    const d = new Date(STATIC_END + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    const yesterday = new Date(today + 'T00:00:00Z');
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    while (d <= yesterday) {
          const ds = d.toISOString().slice(0, 10);
          if (!existingDates.has(ds)) missing.push(ds);
          d.setUTCDate(d.getUTCDate() + 1);
    }

  if (missing.length === 0) {
        console.log('[VITAL] Backfill: no missing dates');
        return;
  }

  console.log('[VITAL] Backfill: filling', missing.length, 'missing days:',
                  missing[0], '..', missing[missing.length - 1]);

  const headers = { Authorization: `Bearer ${accessToken}` };
    const base    = 'https://api.prod.whoop.com/developer/v2';
    const rangeStart = missing[0] + 'T00:00:00.000Z';
    const rangeEnd   = today + 'T23:59:59.999Z';

  try {
        const [recRes, wktRes, cycRes] = await Promise.all([
                fetch(`${base}/recovery?start=${rangeStart}&end=${rangeEnd}&limit=25`,         { headers }),
                fetch(`${base}/activity/workout?start=${rangeStart}&end=${rangeEnd}&limit=25`, { headers }),
                fetch(`${base}/cycle?start=${rangeStart}&end=${rangeEnd}&limit=25`,            { headers }),
              ]);

      const [recData, wktData, cycData] = await Promise.all([
              recRes.ok ? recRes.json() : { records: [] },
              wktRes.ok ? wktRes.json() : { records: [] },
              cycRes.ok ? cycRes.json() : { records: [] },
            ]);

      console.log('[VITAL] Backfill API:', JSON.stringify({
              recoveries: recData.records?.length || 0,
              workouts:   wktData.records?.length || 0,
              cycles:     cycData.records?.length || 0,
      }));

      // Fetch zone details for all backfill workouts
      const allWorkouts = wktData.records || [];
        const zoneDetails = await Promise.all(
                allWorkouts.map(w => fetchWorkoutZones(w.id, headers))
              );
        const zoneById = {};
        allWorkouts.forEach((w, i) => { zoneById[w.id] = zoneDetails[i]; });

      // Index recoveries by date
      const recByDate = {};
        for (const r of (recData.records || [])) {
                const dt = r.created_at ? r.created_at.slice(0, 10) : null;
                if (dt) recByDate[dt] = r;
        }

      // Index cycles by date
      const cycByDate = {};
        for (const c of (cycData.records || [])) {
                const dt = c.start ? c.start.slice(0, 10) : null;
                if (dt) cycByDate[dt] = c;
        }

      // Index workouts by date
      const wktByDate = {};
        for (const w of (wktData.records || [])) {
                const dt = w.start ? w.start.slice(0, 10) : null;
                if (dt) {
                          if (!wktByDate[dt]) wktByDate[dt] = [];
                          wktByDate[dt].push(w);
                }
        }

      let filled = 0;
        for (const dateStr of missing) {
                const rec  = recByDate[dateStr];
                const cyc  = cycByDate[dateStr];
                const wkts = wktByDate[dateStr] || [];

          if (!rec && !cyc && wkts.length === 0) continue;

          const entry = {
                    date:     dateStr,
                    recovery: rec?.score?.recovery_score || 0,
                    hrv:      +(rec?.score?.hrv_rmssd_milli || 0).toFixed(1),
                    rhr:      Math.round(rec?.score?.resting_heart_rate || 0),
                    strain:   +(cyc?.score?.strain || 0).toFixed(1),
                    sleep:    0,
                    workouts: wkts.map(w => {
                                const totalDurMs = new Date(w.end) - new Date(w.start);
                                const zoneDuration = zoneById[w.id] || w.score?.zone_duration || null;
                                const zones = computeZones(zoneDuration, totalDurMs);
                                return {
                                              sport:  w.sport_id,
                                              strain: +(w.score?.strain || 0).toFixed(1),
                                              dur:    Math.round(totalDurMs / 60000),
                                              cal:    Math.round(w.score?.kilojoule ? w.score.kilojoule * 0.239 : 0),
                                              start:  w.start,
                                              zones,
                                };
                    }),
          };

          history.push(entry);
                filled++;
        }
        console.log('[VITAL] Backfill complete:', filled, 'days added');
  } catch(err) {
        console.error('[VITAL] Backfill error:', err);
  }
}
