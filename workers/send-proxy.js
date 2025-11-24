export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const apiKey = request.headers.get('x-api-key') || '';
    if (!apiKey) return new Response(JSON.stringify({ error: 'missing x-api-key' }), { status: 401 });

    // Simple API-key validation for the PoC:
    // - In production, validate against a D1 table or another control-plane store.
    // - For the PoC we support an environment variable `DEMO_API_KEYS` containing a
    //   comma-separated list of valid keys (e.g. "test,dev,abcd1234").
    const demoKeys = (env.DEMO_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
    if (demoKeys.length > 0) {
      if (!demoKeys.includes(apiKey)) {
        return new Response(JSON.stringify({ error: 'invalid api key' }), { status: 403 });
      }
    }

    // Optional: If you bind a D1 database to the Worker (binding name `API_KEYS_DB`),
    // you can validate like this (uncomment and adapt when D1 is configured):
    // try {
    //   const row = await env.API_KEYS_DB.prepare('SELECT id FROM api_keys WHERE key = ?').bind(apiKey).first();
    //   if (!row) return new Response(JSON.stringify({ error: 'invalid api key' }), { status: 403 });
    // } catch (e) {
    //   // fall back or fail-open depending on your policy
    // }

    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 });
    }

    const relayUrl = env.RELAY_URL;
    const relayKey = env.RELAY_API_KEY;

    if (!relayUrl) {
      return new Response(JSON.stringify({ ok: true, message: 'accepted (simulated)', payload }), { status: 202 });
    }

    const relayReq = {
      personalizations: [{ to: payload.to ? [{ email: payload.to }] : [] }],
      from: { email: payload.from || 'no-reply@example.com' },
      subject: payload.subject || '(no subject)',
      content: [{ type: 'text/plain', value: payload.text || payload.body || '' }]
    };

    const res = await fetch(relayUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(relayKey ? { Authorization: `Bearer ${relayKey}` } : {})
      },
      body: JSON.stringify(relayReq)
    });

    const text = await res.text();
    return new Response(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'text/plain' } });
  }
};
