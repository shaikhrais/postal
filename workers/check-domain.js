export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');
    if (!domain) return new Response(JSON.stringify({ error: 'missing domain' }), { status: 400 });

    async function dohLookup(name, type = 'TXT') {
      const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
      const r = await fetch(dohUrl, { headers: { Accept: 'application/dns-json' } });
      if (!r.ok) return null;
      return r.json();
    }

    const [spf, dmarc, dkimRoot] = await Promise.all([
      dohLookup(domain, 'TXT'),
      dohLookup(`_dmarc.${domain}`, 'TXT'),
      dohLookup(`default._domainkey.${domain}`, 'TXT')
    ]);

    const out = {
      domain,
      spf: spf?.Answer || null,
      dmarc: dmarc?.Answer || null,
      dkim_default: dkimRoot?.Answer || null
    };

    return new Response(JSON.stringify(out), { status: 200, headers: { 'content-type': 'application/json' } });
  }
};
