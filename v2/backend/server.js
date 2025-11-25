const http = require('http');
const url = require('url');
const { validatePayload, buildRelayPayload } = require('../lib/mailer');

const PORT = process.env.PORT || 3000;
const RELAY_URL = process.env.RELAY_URL || 'https://example-relay.local/send';
const RELAY_API_KEY = process.env.RELAY_API_KEY || '';

function sendToRelay(relayPayload) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(RELAY_URL);
    const data = JSON.stringify(relayPayload);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': RELAY_API_KEY ? `Bearer ${RELAY_API_KEY}` : ''
      }
    };

    const req = (parsed.protocol === 'https:' ? require('https') : require('http')).request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/v2/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/v2/send') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      let payload;
      try { payload = JSON.parse(body); } catch (e) { payload = null; }
      const v = validatePayload(payload);
      if (!v.ok) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: v.error }));
        return;
      }

      const relayPayload = buildRelayPayload(payload);
      try {
        const relayRes = await sendToRelay(relayPayload);
        if (relayRes.statusCode && relayRes.statusCode >= 200 && relayRes.statusCode < 300) {
          res.writeHead(202, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'accepted' }));
        } else {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'relay error', details: relayRes }));
        }
      } catch (err) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'relay unreachable', details: String(err) }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log('v2 backend listening on port', PORT);
});
