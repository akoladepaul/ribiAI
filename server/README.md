# Zibi Backend

Express + SQLite backend for Zibi: authentication, a real wallet ledger,
Paystack/Stripe payment integration, and a cost-optimized multi-provider AI
router (Gemini / Claude / GPT).

## Setup

```bash
cd server
npm install
cp .env.example .env   # fill in whichever keys you have
npm run dev            # http://localhost:4000
```

The frontend (`../` — run separately with `npm run dev`) talks to this
server at `VITE_API_BASE_URL` (defaults to `http://localhost:4000`).

## What's real vs. what's a placeholder

- **Auth**: real — bcrypt password hashing, JWT in an httpOnly cookie.
- **Wallet ledger**: real — balances are tracked server-side in kobo
  (NGN minor units), debited on order creation, credited on confirmed
  payment. This is the source of truth; the old client-only wallet
  simulation in the frontend is now a "guest / no backend" fallback.
- **Paystack**: real integration (initialize → redirect → webhook or
  polling verify → credit). Needs `PAYSTACK_SECRET_KEY`. Test in Paystack's
  sandbox with their test cards before ever using live keys.
- **Stripe**: real integration via Checkout Sessions (redirect-based, so
  card data never touches this server). Needs `STRIPE_SECRET_KEY` and
  `STRIPE_WEBHOOK_SECRET`. Stripe charges in USD; the NGN credit uses a
  **fixed** `NGN_PER_USD` env var as a placeholder — replace with a live FX
  rate lookup before real launch.
- **AI router**: real multi-provider logic and fallback chain. Without any
  of `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` set, every
  request cleanly falls back to the deterministic local engine — the app
  never 500s just because no AI key is configured.

## AI cost routing

`src/services/modelRouter.service.js` classifies each request into a tier:

| Tier | When | Model preference (cheapest first) |
|---|---|---|
| `quick` | Short, ordinary personal-shopper queries | Gemini Flash → GPT-4o-mini → Claude Haiku |
| `vision` | Request includes an image | Gemini Flash → GPT-4o-mini → Claude Haiku |
| `complex` | Business-mode bulk/RFQ language, or a budget ≥ ₦1,000,000 | Claude Sonnet → GPT-4o → Gemini Pro |

It tries candidates cheapest-first, skips any provider without a configured
key, and falls back to the next candidate on any error — so a single
provider outage or rate limit never takes the feature down. Every attempt
(success or failure) is logged to `ai_usage_log` with an estimated USD cost,
so you can see spend by provider/model over time.

The per-1k-character cost figures in that file are approximate placeholders
— check each provider's current pricing page and adjust them; they only
affect which model gets picked, not billing.

## Webhooks in local development

Paystack and Stripe webhooks need a public URL. Locally, either:
- Use their CLI tunnels (`stripe listen --forward-to localhost:4000/api/wallet/stripe/webhook`), or
- Rely on the polling verify endpoints (`GET /api/wallet/paystack/verify/:reference`,
  `GET /api/wallet/stripe/verify/:sessionId`) that the frontend calls after
  redirect back from checkout — both paths share the same idempotent
  verify-and-credit logic.

## Endpoints

- `POST /api/auth/register` / `login` / `logout`, `GET /api/auth/me`
- `GET /api/wallet/balance`, `GET /api/wallet/transactions`
- `POST /api/wallet/paystack/initialize` → `{ authorizationUrl, reference }`
- `POST /api/wallet/stripe/create-checkout-session` → `{ checkoutUrl, sessionId }`
- `POST /api/ai/query` — guest-accessible; `{ prompt, imageBase64?, mode }`
- `GET /api/orders`, `POST /api/orders`

## Tests

```bash
npm test
```
