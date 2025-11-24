import sendProxy from '../workers/send-proxy.js';
import checkDomain from '../workers/check-domain.js';
import trackingPixel from '../workers/tracking-pixel.js';
import { RateLimiter } from './workers/rate_limiter.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname || '/';

    try {
        // NOTE: Admin/demo seeding has been moved to migrations and the
        // `scripts/seed_d1.ps1` helper. Temporary admin endpoints were removed
        // to avoid accidental exposure in deployed environments.
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
