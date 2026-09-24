import { Router } from 'express';
import { db, debitWallet, getOrCreateWallet } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const ordersRouter = Router();

ordersRouter.get('/', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json(rows);
});

ordersRouter.post('/', requireAuth, (req, res) => {
  const { item, category, mode, amountNgn, vendor, address, paymentMethod } = req.body || {};
  if (!item || !amountNgn) return res.status(400).json({ error: 'item and amountNgn are required' });

  const amountKobo = Math.round(amountNgn * 100);
  const isWallet = paymentMethod === 'wallet';

  if (isWallet) {
    try {
      debitWallet(req.user.id, amountKobo);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  const displayId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const result = db
    .prepare(
      `INSERT INTO orders (user_id, display_id, item, category, mode, amount_kobo, vendor, address, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed & Procuring')`
    )
    .run(req.user.id, displayId, item, category || null, mode || 'personal', amountKobo, vendor || null, address || null, paymentMethod || 'wallet');

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
  const wallet = getOrCreateWallet(req.user.id);
  res.status(201).json({ order, walletBalanceKobo: wallet.balance_kobo });
});
