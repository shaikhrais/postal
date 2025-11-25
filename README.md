Postal v2 - local run instructions

- Install dependencies: `npm install` (no external dependencies in this scaffold)
- Start the backend: `npm start`
- Open the frontend: open `v2/frontend/index.html` in your browser, or serve it from a static server on port 3000 so the form can call `POST /api/v2/send`.

Notes:
- Configure `RELAY_URL` and `RELAY_API_KEY` env vars if you want the backend to forward to a real HTTP relay.
- This is a minimal scaffold for iterative development.
