import { Router } from 'express';
import crypto from 'crypto';
import { db, getOrCreateWallet, creditWallet } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import * as paystack from '../services/paystack.service.js';
import * as stripe from '../services/stripe.service.js';

export const walletRouter = Router();

const NGN_PER_USD = () => Number(process.env.NGN_PER_USD || 1600);

walletRouter.get('/balance', requireAuth, (req, res) => {
  const wallet = getOrCreateWallet(req.user.id);
  res.json({ balanceKobo: wallet.balance_kobo, balanceNgn: wallet.balance_kobo / 100 });
});

walletRouter.get('/transactions', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50')
    .all(req.user.id);
  res.json(rows);
});

// ---- Paystack (NGN) ----

walletRouter.post('/paystack/initialize', requireAuth, async (req, res) => {
  if (!paystack.isConfigured()) return res.status(503).json({ error: 'Paystack is not configured on this server' });

  const { amountNgn } = req.body || {};
  if (!amountNgn || amountNgn < 100) return res.status(400).json({ error: 'amountNgn must be at least ₦100' });

  const reference = `zibi_ps_${crypto.randomUUID()}`;
  const amountKobo = Math.round(amountNgn * 100);
  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.id);

  db.prepare(
    `INSERT INTO transactions (user_id, provider, provider_reference, amount_kobo, currency, status, type)
     VALUES (?, 'paystack', ?, ?, 'NGN', 'pending', 'wallet_topup')`
  ).run(req.user.id, reference, amountKobo);

  try {
    const { authorization_url } = await paystack.initializeTransaction({
      email: user.email,
      amountKobo,
      reference,
      callbackUrl: `${process.env.CLIENT_ORIGIN}/?wallet_funded=paystack&reference=${reference}`
    });
    res.json({ authorizationUrl: authorization_url, reference });
  } catch (err) {
    console.error('Paystack initialize failed:', err.response?.data || err.message);
    res.status(502).json({ error: 'Could not initialize Paystack transaction' });
  }
});

// Called either by Paystack's webhook or by the frontend polling after
// redirect back from checkout — both paths converge on the same idempotent
// verify-and-credit logic, since local dev has no public webhook URL.
walletRouter.get('/paystack/verify/:reference', requireAuth, async (req, res) => {
  await verifyAndCreditPaystack(req.params.reference);
  const wallet = getOrCreateWallet(req.user.id);
  res.json({ balanceKobo: wallet.balance_kobo });
});

export const verifyAndCreditPaystack = async (reference) => {
  const txn = db.prepare('SELECT * FROM transactions WHERE provider = ? AND provider_reference = ?').get('paystack', reference);
  if (!txn || txn.status === 'success') return;

  try {
    const verified = await paystack.verifyTransaction(reference);
    if (verified.status === 'success') {
      db.prepare("UPDATE transactions SET status = 'success' WHERE id = ?").run(txn.id);
      creditWallet(txn.user_id, txn.amount_kobo);
    } else if (verified.status === 'failed') {
      db.prepare("UPDATE transactions SET status = 'failed' WHERE id = ?").run(txn.id);
    }
  } catch (err) {
    console.error('Paystack verify failed:', err.response?.data || err.message);
  }
};

// ---- Stripe (USD, international cards) ----

walletRouter.post('/stripe/create-checkout-session', requireAuth, async (req, res) => {
  if (!stripe.isConfigured()) return res.status(503).json({ error: 'Stripe is not configured on this server' });

  const { amountUsd } = req.body || {};
  if (!amountUsd || amountUsd < 1) return res.status(400).json({ error: 'amountUsd must be at least $1' });

  try {
    const session = await stripe.createCheckoutSession({
      userId: req.user.id,
      amountUsd,
      successUrl: `${process.env.CLIENT_ORIGIN}/?wallet_funded=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.CLIENT_ORIGIN}/?wallet_funded=cancelled`
    });

    const amountKobo = Math.round(amountUsd * NGN_PER_USD() * 100);
    db.prepare(
      `INSERT INTO transactions (user_id, provider, provider_reference, amount_kobo, currency, status, type)
       VALUES (?, 'stripe', ?, ?, 'USD', 'pending', 'wallet_topup')`
    ).run(req.user.id, session.id, amountKobo);

    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe session creation failed:', err.message);
    res.status(502).json({ error: 'Could not create Stripe checkout session' });
  }
});

walletRouter.get('/stripe/verify/:sessionId', requireAuth, async (req, res) => {
  await verifyAndCreditStripe(req.params.sessionId);
  const wallet = getOrCreateWallet(req.user.id);
  res.json({ balanceKobo: wallet.balance_kobo });
});

export const verifyAndCreditStripe = async (sessionId) => {
  const txn = db.prepare('SELECT * FROM transactions WHERE provider = ? AND provider_reference = ?').get('stripe', sessionId);
  if (!txn || txn.status === 'success') return;

  try {
    const session = await stripe.retrieveSession(sessionId);
    if (session.payment_status === 'paid') {
      db.prepare("UPDATE transactions SET status = 'success' WHERE id = ?").run(txn.id);
      creditWallet(txn.user_id, txn.amount_kobo);
    }
  } catch (err) {
    console.error('Stripe verify failed:', err.message);
  }
};
