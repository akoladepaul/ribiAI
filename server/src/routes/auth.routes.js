import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, getOrCreateWallet } from '../db.js';
import { signToken } from '../utils/jwt.js';

export const authRouter = Router();

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000
});

authRouter.post('/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
    .run(email.toLowerCase(), passwordHash, name);

  getOrCreateWallet(result.lastInsertRowid);

  const token = signToken({ id: result.lastInsertRowid, email: email.toLowerCase() });
  res.cookie('zibi_token', token, cookieOptions());
  res.status(201).json({ id: result.lastInsertRowid, email: email.toLowerCase(), name });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ id: user.id, email: user.email });
  res.cookie('zibi_token', token, cookieOptions());
  res.json({ id: user.id, email: user.email, name: user.name, mode: user.mode });
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('zibi_token');
  res.status(204).end();
});

authRouter.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const user = db.prepare('SELECT id, email, name, mode FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const wallet = getOrCreateWallet(user.id);
  res.json({ ...user, walletBalanceKobo: wallet.balance_kobo });
});
