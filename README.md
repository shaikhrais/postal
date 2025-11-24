# Postal (fork) — Cloudflare PoC

This fork contains a Cloudflare Pages + Workers PoC for a Postal-like mail delivery platform.

Quickstart:

1. Ensure `wrangler` is installed: `npm i -g wrangler`
2. Set `account_id` in `wrangler.toml` or use `wrangler login`.
3. (Optional) Set secrets: `wrangler secret put RELAY_API_KEY`.
4. Start local dev: `wrangler dev --local` and test `http://127.0.0.1:8787/api/minimal`.

Files added:
- `pages/` — demo Pages site
- `workers/` — `send-proxy.js`, `check-domain.js`, `tracking-pixel.js`
- `index.js` — Worker entrypoint
- `wrangler.toml` — Cloudflare config (set `account_id`)
![GitHub Header](https://github.com/postalserver/.github/assets/4765/7a63c35d-2f47-412f-a6b3-aebc92a55310)

**Postal** is a complete and fully featured mail server for use by websites & web servers. Think Sendgrid, Mailgun or Postmark but open source and ready for you to run on your own servers. 

* [Documentation](https://docs.postalserver.io)
* [Installation Instructions](https://docs.postalserver.io/getting-started)
* [FAQs](https://docs.postalserver.io/welcome/faqs) & [Features](https://docs.postalserver.io/welcome/feature-list)
* [Discussions](https://github.com/postalserver/postal/discussions) - ask for help or request a feature
* [Join us on Discord](https://discord.postalserver.io)
