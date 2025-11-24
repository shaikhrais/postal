import sendProxy from '../workers/send-proxy.js';
import checkDomain from '../workers/check-domain.js';
import trackingPixel from '../workers/tracking-pixel.js';
import { RateLimiter } from './workers/rate_limiter.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname || '/';

    try {
      // Admin seed endpoint for demo: POST /admin/seed-demo?secret=<secret>
      if (path.startsWith('/admin/seed-demo')) {
        const secret = url.searchParams.get('secret') || '';
        // simple guard: require secret=seed-now (temporary for demo)
        if (secret !== 'seed-now') return new Response('Forbidden', { status: 403 });
        if (!env.API_KEYS_DB) return new Response(JSON.stringify({ error: 'no d1 binding' }), { status: 500 });
        await env.API_KEYS_DB.prepare('INSERT INTO api_keys (owner, key) VALUES (?, ?)').bind('demo', 'test').run();
        return new Response(JSON.stringify({ ok: true, inserted: 'test' }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      if (path.startsWith('/admin/has-relay')) {
        const has = !!env.RELAY_API_KEY;
        return new Response(JSON.stringify({ hasRelayKey: has }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      if (path.startsWith('/api/send')) return sendProxy.fetch(request, env, ctx);
      if (path.startsWith('/api/check-domain')) return checkDomain.fetch(request, env, ctx);
      if (path.startsWith('/api/tracking-pixel')) return trackingPixel.fetch(request, env, ctx);
      if (path.startsWith('/api/minimal')) {
        const body = { ok: true, service: 'postal-poc', endpoint: '/api/minimal', time: new Date().toISOString() };
        return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
      }

      return new Response('Not Found', { status: 404 });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
  }
};

export { RateLimiter };
