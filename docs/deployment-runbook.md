# Deployment Runbook — Postal PoC (Cloudflare)

This runbook documents the minimal steps and required secrets to deploy the PoC to Cloudflare using GitHub Actions or `wrangler publish`.

## Required secrets (GitHub repository)

## Additional runtime bindings for Phase 1
- `API_KEYS_DB` (D1): bind a D1 database named `postal_api_keys` as the `API_KEYS_DB` binding in `wrangler.toml`.
- `RATE_LIMIT_DO` (Durable Object): register a Durable Object class `RateLimiter` and bind it as `RATE_LIMIT_DO` in `wrangler.toml`.

The PoC will validate API keys against the D1 `api_keys` table if the D1 binding exists; otherwise it will use `DEMO_API_KEYS` for quick testing. A Durable Object is used to enforce a per-key rate limit by default.
## GitHub Actions
A workflow exists at `.github/workflows/deploy.yml`. It runs `wrangler publish` and requires `CLOUDFLARE_API_TOKEN` to be set in repository secrets.

## Local publish with wrangler
1. Install `wrangler` (npm):

```powershell
npm install -g wrangler
```

2. Authenticate or set `CLOUDFLARE_API_TOKEN` environment variable:

```powershell
wrangler login
# or set env var for CI/local publish
$env:CLOUDFLARE_API_TOKEN = "<token>"
```

3. Ensure `wrangler.toml` contains `name` and a valid `account_id`, or set `CLOUDFLARE_ACCOUNT_ID` as an environment variable.

4. Publish:

```powershell
wrangler publish
```

## Notes and next steps
- The PoC supports `DEMO_API_KEYS` for quick testing. For production, create a D1 table (`d1/schema.sql`) and bind it to the Worker as `API_KEYS_DB`. Update `workers/send-proxy.js` to use the D1 binding.
- Add a Durable Object rate-limiter and D1-backed key management before making endpoints public.
- Decide on relay strategy: HTTP relay (SendGrid/Mailgun) or deploy a separate MTA service for SMTP.
