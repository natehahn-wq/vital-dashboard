// api/whoop/data.js
// Called by the dashboard on every page load
// Returns the latest WHOOP data from KV cache (set by refresh.js cron)

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const [rawData, connected] = await Promise.all([
      kv.get('whoop:latest'),
      kv.get('whoop:connected'),
    ]);

    if (!connected || !rawData) {
      return res.status(200).json({
        connected: false,
        message: 'WHOOP not connected. Visit /api/whoop/login to connect.',
      });
    }

    const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    // Check if data is stale (older than 26 hours — cron may have missed)
    const fetchedAt = new Date(data.fetchedAt);
    const hoursOld  = (Date.now() - fetchedAt.getTime()) / 3600000;
    const stale     = hoursOld > 26;

    return res.status(200).json({
      connected: true,
      stale,
      hoursOld: +hoursOld.toFixed(1),
      data,
    });

  } catch (err) {
    console.error('[VITAL] /api/whoop/data error:', err);
    return res.status(500).json({ error: err.message });
  }
}
