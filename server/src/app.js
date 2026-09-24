import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import './db.js';
import { attachUser } from './middleware/auth.js';
import { authRouter } from './routes/auth.routes.js';
import { walletRouter, verifyAndCreditPaystack, verifyAndCreditStripe } from './routes/wallet.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import * as paystack from './services/paystack.service.js';
import * as stripe from './services/stripe.service.js';

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3010',
    credentials: true
  })
);
app.use(cookieParser());

// Stripe and Paystack webhooks must verify a signature over the RAW request
// body, so they're registered here — before express.json() ever touches the
// stream — and never touched again by the global JSON parser below.
app.post('/api/wallet/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.constructWebhookEvent(req.body, req.headers['stripe-signature']);
  } catch (err) {
    console.error('Stripe webhook signature invalid:', err.message);
    return res.status(400).end();
  }
  if (event.type === 'checkout.session.completed') {
    await verifyAndCreditStripe(event.data.object.id);
  }
  res.status(200).end();
});

app.post('/api/wallet/paystack/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  if (!paystack.verifyWebhookSignature(req.body, signature)) {
    return res.status(401).end();
  }
  const event = JSON.parse(req.body.toString('utf8'));
  if (event.event === 'charge.success') {
    await verifyAndCreditPaystack(event.data.reference);
  }
  res.status(200).end();
});

app.use(express.json({ limit: '10mb' }));
app.use(attachUser);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/ai', aiRouter);
app.use('/api/orders', ordersRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});
