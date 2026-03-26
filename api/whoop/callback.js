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
    const appUrl     = process.env.APP_URL || 'https://vital-puce-iota.vercel.app';
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
    // tokens = { access_token, refresh_token, expires_in, token_type, scope }

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

// ── Shared data fetch (also called from refresh.js) ──────────────────────
export async function fetchAndStoreWhoopData(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const base    = 'https://api.prod.whoop.com/developer/v1';

  // Fetch all three endpoints in parallel
  const [recoveryRes, sleepRes, workoutRes, cycleRes] = await Promise.all([
    fetch(`${base}/recovery?limit=3`, { headers }),
    fetch(`${base}/activity/sleep?limit=3`, { headers }),
    fetch(`${base}/activity/workout?limit=5`, { headers }),
    fetch(`${base}/cycle?limit=3`, { headers }),
  ]);

  const [recoveryData, sleepData, workoutData, cycleData] = await Promise.all([
    recoveryRes.ok ? recoveryRes.json() : null,
    sleepRes.ok    ? sleepRes.json()    : null,
    workoutRes.ok  ? workoutRes.json()  : null,
    cycleRes.ok    ? cycleRes.json()    : null,
  ]);

  // Pick the first record that has a score (skip unscored current cycle)
    const rec     = (recoveryData?.records || []).find(r => r?.score) || recoveryData?.records?.[0];
    const sleep   = (sleepData?.records || []).find(r => r?.score) || sleepData?.records?.[0];
    const workouts= workoutData?.records || [];
    const cycle   = (cycleData?.records || []).find(r => r?.score) || cycleData?.records?.[0];

  // ── Normalize into VITAL dashboard WHOOP shape ───────────────────────
  const stageSummary = sleep?.score?.stage_summary || {};
  const msToH = ms => ms ? +((ms / 3600000).toFixed(2)) : 0;

  const normalized = {
    recovery: rec?.score?.recovery_score          || 0,
    hrv:      +(rec?.score?.hrv_rmssd_milli       || 0).toFixed(1),
    rhr:      Math.round(rec?.score?.resting_heart_rate || 0),
    strain:   +(cycle?.score?.strain              || 0).toFixed(1),
    spo2:     +(rec?.score?.spo2_percentage       || 0).toFixed(1),
    skinTemp: +(rec?.score?.skin_temp_celsius      || 0).toFixed(1),
    sleep: {
      score:           Math.round(sleep?.score?.sleep_performance_percentage || 0),
      hours:           msToH(sleep?.score?.total_in_bed_time_milli),
      eff:             Math.round(sleep?.score?.sleep_efficiency_percentage || 0),
      hoursVsNeeded:   Math.round(sleep?.score?.sleep_needed?.baseline_milli
                         ? (sleep.score.total_in_bed_time_milli / sleep.score.sleep_needed.baseline_milli * 100)
                         : 0),
      consistency:     Math.round(sleep?.score?.sleep_consistency_percentage || 0),
      stressHigh:      Math.round(sleep?.score?.sleep_disturbance_percentage || 0),
      rem:             msToH(stageSummary.total_rem_sleep_time_milli),
      deep:            msToH(stageSummary.total_slow_wave_sleep_time_milli),
      light:           msToH(stageSummary.total_light_sleep_time_milli),
      awake:           msToH(stageSummary.total_awake_time_milli),
      resp:            +(sleep?.score?.respiratory_rate || 0).toFixed(1),
      perf:            Math.round(sleep?.score?.sleep_performance_percentage || 0),
      startTime:       sleep?.start || null,
      endTime:         sleep?.end   || null,
    },
    workouts: workouts.slice(0, 5).map(w => ({
      id:       w.id,
      sport:    w.sport_id,
      strain:   +(w.score?.strain || 0).toFixed(1),
      avgHR:    Math.round(w.score?.average_heart_rate || 0),
      maxHR:    Math.round(w.score?.max_heart_rate || 0),
      cal:      Math.round(w.score?.kilojoule ? w.score.kilojoule * 0.239 : 0),
      dur:      Math.round((new Date(w.end) - new Date(w.start)) / 60000),
      start:    w.start,
      zones: {
        z1p: +(w.score?.zone_duration?.zone_one_milli   ? w.score.zone_duration.zone_one_milli   / (new Date(w.end)-new Date(w.start)) * 100 : 0).toFixed(0),
        z2p: +(w.score?.zone_duration?.zone_two_milli   ? w.score.zone_duration.zone_two_milli   / (new Date(w.end)-new Date(w.start)) * 100 : 0).toFixed(0),
        z3p: +(w.score?.zone_duration?.zone_three_milli ? w.score.zone_duration.zone_three_milli / (new Date(w.end)-new Date(w.start)) * 100 : 0).toFixed(0),
        z4p: +(w.score?.zone_duration?.zone_four_milli  ? w.score.zone_duration.zone_four_milli  / (new Date(w.end)-new Date(w.start)) * 100 : 0).toFixed(0),
        z5p: +(w.score?.zone_duration?.zone_five_milli  ? w.score.zone_duration.zone_five_milli  / (new Date(w.end)-new Date(w.start)) * 100 : 0).toFixed(0),
      },
    })),
    fetchedAt: new Date().toISOString(),
    date:      new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
  };

  await kv.set('whoop:latest', JSON.stringify(normalized));
  console.log('[VITAL] WHOOP data stored:', normalized.date,
    `rec=${normalized.recovery}% hrv=${normalized.hrv}ms`);

  return normalized;
}
