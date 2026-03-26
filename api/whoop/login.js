// api/whoop/login.js
// Visit /api/whoop/login once to kick off OAuth and connect your WHOOP account

export default function handler(req, res) {
  const clientId   = process.env.WHOOP_CLIENT_ID;
  const appUrl     = process.env.VERCEL_URL ? 'https://'+process.env.VERCEL_URL : process.env.APP_URL;
  const redirectUri = `${appUrl}/api/whoop/callback`;

  const scopes = [
    'offline',
    'read:recovery',
    'read:sleep',
    'read:workout',
    'read:cycles',
    'read:profile',
    'read:body_measurement',
  ].join(' ');

  // Random 8-char state for CSRF protection
  const state = Math.random().toString(36).substring(2, 10);

  const authUrl = new URL('https://api.prod.whoop.com/oauth/oauth2/auth');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id',     clientId);
  authUrl.searchParams.set('redirect_uri',  redirectUri);
  authUrl.searchParams.set('scope',         scopes);
  authUrl.searchParams.set('state',         state);

  res.redirect(authUrl.toString());
}
