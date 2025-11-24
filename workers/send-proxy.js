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

    // If a D1 database is bound (binding name `API_KEYS_DB`), validate against it.
    let validated = false;
    if (env.API_KEYS_DB) {
      try {
        const row = await env.API_KEYS_DB.prepare('SELECT id FROM api_keys WHERE key = ? LIMIT 1').bind(apiKey).first();
        if (row) validated = true;
      } catch (e) {
        // If D1 fails, we will fall back to demo keys for now.
        console.warn('D1 lookup failed', e);
      }
    }

    if (!validated && demoKeys.length > 0) {
      if (!demoKeys.includes(apiKey)) {
        return new Response(JSON.stringify({ error: 'invalid api key' }), { status: 403 });
      }
      validated = true;
    }

    if (!validated && !env.API_KEYS_DB) {
      // No D1 bound and no demo keys configured — treat as unauthorized.
      return new Response(JSON.stringify({ error: 'invalid api key' }), { status: 403 });
    }

    // Rate limiting via Durable Object
    if (env.RATE_LIMIT_DO) {
      try {
        const stub = env.RATE_LIMIT_DO.get(apiKey);
        const rlRes = await stub.fetch(new Request('https://rate-limiter/', { method: 'POST' }));
        if (rlRes.status === 429) {
          return rlRes;
        }
      } catch (e) {
        console.warn('Rate limiter DO call failed', e);
        // If the rate limiter fails, continue (fail-open) or decide to fail-closed.
      }
    }

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
