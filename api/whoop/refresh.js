// api/whoop/refresh.js
// Called by Vercel cron every morning at 7:00 AM Pacific
// Also callable manually: GET /api/whoop/refresh?secret=YOUR_CRON_SECRET
// Refreshes the access token if needed, fetches today's WHOOP data, stores in KV

import { kv } from '@vercel/kv';
import { fetchAndStoreWhoopData } from './callback.js';

export default async function handler(req, res) {
  // Protect manual calls with a secret
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Allow cron (Vercel sets Authorization header) or manual with ?secret=
  const cronSecret  = process.env.CRON_SECRET;
  const authHeader  = req.headers.authorization;
  const querySecret = req.query.secret;

  const isVercelCron = authHeader === `Bearer ${cronSecret}`;
  const isManual     = cronSecret && querySecret === cronSecret;

  if (cronSecret && !isVercelCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get stored tokens
    const [storedAccessToken, storedRefreshToken, expiresAt] = await Promise.all([
      kv.get('whoop:access_token'),
      kv.get('whoop:refresh_token'),
      kv.get('whoop:expires_at'),
    ]);

    if (!storedRefreshToken) {
      return res.status(400).json({
        error: 'WHOOP not connected',
        action: 'Visit /api/whoop/login to connect your WHOOP account',
      });
    }

    let accessToken = storedAccessToken;

    // Refresh the access token if expired (or within 5 minutes of expiry)
    const isExpired = !expiresAt || Date.now() > (Number(expiresAt) - 5 * 60 * 1000);

    if (isExpired) {
      console.log('[VITAL] WHOOP access token expired, refreshing...');

      const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'refresh_token',
          refresh_token: storedRefreshToken,
          client_id:     process.env.WHOOP_CLIENT_ID,
          client_secret: process.env.WHOOP_CLIENT_SECRET,
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error('[VITAL] WHOOP token refresh failed:', err);
        return res.status(500).json({ error: 'Token refresh failed', details: err });
      }

      const newTokens = await tokenRes.json();
      accessToken = newTokens.access_token;

      // Store updated tokens
      await Promise.all([
        kv.set('whoop:access_token',  newTokens.access_token),
        kv.set('whoop:refresh_token', newTokens.refresh_token || storedRefreshToken),
        kv.set('whoop:expires_at',    Date.now() + (newTokens.expires_in * 1000)),
      ]);

      console.log('[VITAL] WHOOP token refreshed successfully');
    }

    // Fetch and store latest WHOOP data
    const data = await fetchAndStoreWhoopData(accessToken);

    return res.status(200).json({
      success: true,
      date:     data.date,
      recovery: data.recovery,
      hrv:      data.hrv,
      rhr:      data.rhr,
      sleep:    data.sleep.score,
      workouts: data.workouts.length,
      fetchedAt: data.fetchedAt,
    });

  } catch (err) {
    console.error('[VITAL] WHOOP refresh error:', err);
    return res.status(500).json({ error: err.message });
  }
}
