Postal v2 - NestJS backend

Run locally:

```powershell
cd v2/backend
npm install
# dev mode (auto-restart)
npm run start:dev
# or build+start
npm run build
npm start
```

Environment variables:
- `RELAY_URL` - HTTP relay endpoint. If empty, the service runs in simulation mode and accepts sends with 202.
- `RELAY_API_KEY` - Authorization token for the relay (Bearer).

API endpoints (prefixed with `/api/v2`):
- `GET /api/v2/health` - health check
- `POST /api/v2/send` - send payload: `{ from, to, subject, body }`
