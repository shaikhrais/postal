const GIF_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const mid = url.searchParams.get('mid') || null;
    // For PoC we only log to console; in production we'd enqueue to Queue or write to D1/R2
    console.log('tracking pixel hit', { mid, ip: request.headers.get('cf-connecting-ip') });

    const headers = new Headers();
    headers.set('Content-Type', 'image/gif');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return new Response(Uint8Array.from(atob(GIF_BASE64), c => c.charCodeAt(0)), { headers });
  }
};
