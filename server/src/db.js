import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'zibi.sqlite3');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'personal',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wallets (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance_kobo INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('paystack', 'stripe')),
    provider_reference TEXT NOT NULL,
    amount_kobo INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    type TEXT NOT NULL DEFAULT 'wallet_topup',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (provider, provider_reference)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_id TEXT NOT NULL,
    item TEXT NOT NULL,
    category TEXT,
    mode TEXT NOT NULL DEFAULT 'personal',
    amount_kobo INTEGER NOT NULL,
    vendor TEXT,
    address TEXT,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'Confirmed & Procuring',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    tier TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_chars INTEGER NOT NULL DEFAULT 0,
    estimated_cost_usd REAL NOT NULL DEFAULT 0,
    succeeded INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export const getOrCreateWallet = (userId) => {
  db.prepare('INSERT OR IGNORE INTO wallets (user_id, balance_kobo) VALUES (?, 0)').run(userId);
  return db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
};

export const creditWallet = (userId, amountKobo) => {
  getOrCreateWallet(userId);
  db.prepare(
    "UPDATE wallets SET balance_kobo = balance_kobo + ?, updated_at = datetime('now') WHERE user_id = ?"
  ).run(amountKobo, userId);
  return db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
};

export const debitWallet = (userId, amountKobo) => {
  const wallet = getOrCreateWallet(userId);
  if (wallet.balance_kobo < amountKobo) {
    throw Object.assign(new Error('Insufficient wallet balance'), { status: 402 });
  }
  db.prepare(
    "UPDATE wallets SET balance_kobo = balance_kobo - ?, updated_at = datetime('now') WHERE user_id = ?"
  ).run(amountKobo, userId);
  return db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
};
