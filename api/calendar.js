// Vercel serverless function — fetches Google Calendar events directly
// Uses refresh token rotation to get a fresh access token on every request

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        return res.status(500).json({ error: 'Google Calendar credentials not configured' });
    }

    // Step 1: Exchange refresh token for a fresh access token
    let accessToken;
    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                      body: new URLSearchParams({
                          client_id: clientId,
                          client_secret: clientSecret,
                          refresh_token: refreshToken,
                          grant_type: 'refresh_token',
          }),
          });
        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            return res.status(502).json({ error: 'Token refresh failed', details: err });
        }
        const tokenData = await tokenRes.json();
        accessToken = tokenData.access_token;
    } catch (err) {
        return res.status(502).json({ error: 'Token refresh error', details: err.message });
    }

    // Step 2: Fetch calendar events
    // Default: today and tomorrow
    const now = new Date();
    const timeMin = req.query.timeMin || now.toISOString();
    const endOfTomorrow = new Date(now);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);
    endOfTomorrow.setHours(0, 0, 0, 0);
    const timeMax = req.query.timeMax || endOfTomorrow.toISOString();
    const calendarId = req.query.calendarId || 'primary';

    try {
        const calUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
        calUrl.searchParams.set('timeMin', timeMin);
        calUrl.searchParams.set('timeMax', timeMax);
        calUrl.searchParams.set('singleEvents', 'true');
        calUrl.searchParams.set('orderBy', 'startTime');
        calUrl.searchParams.set('maxResults', '20');

        const calRes = await fetch(calUrl.toString(), {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!calRes.ok) {
            const err = await calRes.text();
            return res.status(calRes.status).json({ error: 'Calendar API error', details: err });
        }

        const calData = await calRes.json();
        res.status(200).json(calData);
    } catch (err) {
        res.status(500).json({ error: 'Calendar fetch error', details: err.message });
}
}
