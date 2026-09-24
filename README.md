# Zibi — AI Personal Shopper & Procurement Assistant

A React + Vite PWA for an AI-native shopping/procurement agent (personal-shopper
and business-procurement modes), backed by a real Express/SQLite server —
see [`server/README.md`](server/README.md) for the backend.

## Getting started

Run both halves in separate terminals:

```bash
# Terminal 1 — backend
cd server
npm install
cp .env.example .env
npm run dev          # http://localhost:4000

# Terminal 2 — frontend
npm install
cp .env.example .env
npm run dev           # http://localhost:3010
```

The app works fully with **no backend running and no API keys set** — it
just falls back to guest/demo mode (simulated wallet, local mock AI engine).
Sign in and add real Paystack/Stripe/AI keys to unlock the real paths.

## Scripts

| Command           | Description                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Start the Vite dev server                 |
| `npm run build`    | Production build to `dist/`               |
| `npm run preview`  | Preview the production build locally      |
| `npm run lint`     | Run ESLint                                |
| `npm test`         | Run the Vitest test suite                 |

## Architecture

- **Guest mode** (no sign-in): everything lives in React state
  (`src/context/AppContext.jsx`) exactly like the original prototype —
  simulated wallet, simulated orders, no persistence.
- **Signed-in mode**: wallet balance and orders come from the backend
  (real SQLite ledger), and wallet top-ups go through real Paystack/Stripe
  checkout. See `src/context/AuthContext.jsx` and `src/services/backendClient.js`.
- **AI queries** always go through the backend (`POST /api/ai/query`),
  whether or not you're signed in — it picks the cost-optimal model across
  Gemini/Claude/GPT and falls back to a local deterministic engine if no
  provider key is configured or the backend itself is unreachable. No AI
  API key is ever present in the browser. See `server/README.md` for the
  routing logic.

## Project structure

- `src/context/AppContext.jsx` — app state; backend-aware for wallet/orders
  when signed in, local demo data otherwise.
- `src/context/AuthContext.jsx` — session state (httpOnly cookie via the backend).
- `src/services/aiService.js` — calls the backend AI router; local offline fallback only.
- `src/services/backendClient.js` — thin fetch wrapper for the backend API.
- `src/utils/permissions.js` — pure helpers for the auto-approve/budget matching rules (unit tested).
- `src/utils/toast.js` / `confirm.js` + their components — in-app notifications and confirm dialogs, replacing `window.alert`/`confirm`.
- `src/components/` — feature views (Chat, Budgets, Wishlist, Wallet, Addresses, Connectors, Business Procurement) plus shared UI.
- `server/` — Express + SQLite backend: auth, wallet ledger, Paystack/Stripe integration, AI model router. See its own README.

## Known limitations

- Budgets, addresses, and connectors are still local-only (not synced to the backend) — noted as a deliberate scope decision, not an oversight.
- No real hosting/CI/deployment config — this covers local development only.
- Paystack/Stripe/AI provider keys are placeholders in `server/.env.example` — nothing charges real money or calls a real AI provider until you supply your own keys.
