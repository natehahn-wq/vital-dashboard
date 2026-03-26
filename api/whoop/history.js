// api/whoop/history.js
// Returns accumulated daily WHOOP data for weekly fitness aggregation
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');

      try {
          const raw = await kv.get('whoop:history');
              if (!raw) {
                    return res.status(200).json({ days: [] });
                        }
                            const days = typeof raw === 'string' ? JSON.parse(raw) : raw;
                                return res.status(200).json({ days });
                                  } catch (err) {
                                      console.error('[VITAL] /api/whoop/history error:', err);
                                          return res.status(500).json({ error: err.message });
                                            }
                                            }