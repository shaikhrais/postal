export class RateLimiter {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  // Expected POST body: { }
  // We use the Durable Object's storage to keep a simple per-minute window counter.
  async fetch(request) {
    try {
      // key is the Durable Object id (we use the stub keyed by api key name)
      const now = Date.now();
      const MINUTE = 60 * 1000;

      // default limit; can be made configurable per-key via D1 in future
      const LIMIT = 60;

      // read state
      const rec = (await this.state.storage.get('r')) || { count: 0, resetAt: 0 };
      if (now > rec.resetAt) {
        // reset window
        rec.count = 1;
        rec.resetAt = now + MINUTE;
      } else {
        rec.count = (rec.count || 0) + 1;
      }

      await this.state.storage.put('r', rec);

      if (rec.count > LIMIT) {
        return new Response(JSON.stringify({ error: 'rate_limited', limit: LIMIT }), { status: 429, headers: { 'content-type': 'application/json' } });
      }

      return new Response(JSON.stringify({ ok: true, count: rec.count, resetAt: rec.resetAt }), { status: 200, headers: { 'content-type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
  }
}

export default {
  RateLimiter
}
