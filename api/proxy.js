// Vercel serverless function — proxies Anthropic API calls from the frontend
// Your API key lives here, server-side, never exposed to the browser

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
    // CORS — allow your own domain
  res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  // Inject Google OAuth token into MCP server configs that need it
  const body = { ...req.body };
    const gcalToken = process.env.GOOGLE_OAUTH_TOKEN;
    if (gcalToken && Array.isArray(body.mcp_servers)) {
          body.mcp_servers = body.mcp_servers.map(srv =>
                  srv.url && srv.url.includes('gcal.mcp.claude.com') && !srv.authorization_token
                                                          ? { ...srv, authorization_token: `Bearer ${gcalToken}` }
                    : srv
                                                      );
    }

  try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                          'Content-Type': 'application/json',
                          'x-api-key': apiKey,
                          'anthropic-version': '2023-06-01',
                          'anthropic-beta': 'mcp-client-2025-04-04',
                },
                body: JSON.stringify(body),
        });

      const data = await response.json();
        res.status(response.status).json(data);
  } catch (err) {
        res.status(500).json({ error: err.message });
  }
}
