import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, '..', 'test.sqlite3');

process.env.DB_PATH = testDbPath;
process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:3010';

const { default: request } = await import('supertest');
const { app } = await import('./app.js');

beforeAll(() => {
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});

afterAll(() => {
  [testDbPath, `${testDbPath}-wal`, `${testDbPath}-shm`].forEach((f) => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  });
});

describe('health', () => {
  it('responds ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('auth', () => {
  let cookie;

  it('registers a new user and sets a session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@zibi.dev', password: 'password123', name: 'Test User' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@zibi.dev');
    cookie = res.headers['set-cookie'];
  });

  it('rejects a duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@zibi.dev', password: 'password123', name: 'Dupe' });
    expect(res.status).toBe(409);
  });

  it('returns the current user via /me with the session cookie', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@zibi.dev');
    expect(res.body.walletBalanceKobo).toBe(0);
  });

  it('rejects /me without a session', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('logs in with the correct password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@zibi.dev', password: 'password123' });
    expect(res.status).toBe(200);
  });

  it('rejects login with the wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@zibi.dev', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

describe('wallet + orders', () => {
  let cookie;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'wallet-user@zibi.dev', password: 'password123', name: 'Wallet User' });
    cookie = res.headers['set-cookie'];
  });

  it('starts with a zero balance', async () => {
    const res = await request(app).get('/api/wallet/balance').set('Cookie', cookie);
    expect(res.body.balanceKobo).toBe(0);
  });

  it('rejects an order that exceeds the wallet balance', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ item: 'Laptop', amountNgn: 500000, paymentMethod: 'wallet' });
    expect(res.status).toBe(402);
  });

  it('403s Paystack initialize when no key is configured', async () => {
    const res = await request(app)
      .post('/api/wallet/paystack/initialize')
      .set('Cookie', cookie)
      .send({ amountNgn: 5000 });
    expect(res.status).toBe(503);
  });
});

describe('ai router', () => {
  it('falls back to the local engine when no provider keys are configured', async () => {
    const res = await request(app)
      .post('/api/ai/query')
      .send({ prompt: 'find me a laptop for video editing under 1.5m', mode: 'personal' });
    expect(res.status).toBe(200);
    expect(res.body.isLiveAI).toBe(false);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.tier).toBe('complex');
  });

  it('classifies a cheap, plain query as the quick tier', async () => {
    const res = await request(app)
      .post('/api/ai/query')
      .send({ prompt: 'find me a phone case', mode: 'personal' });
    expect(res.body.tier).toBe('quick');
  });

  it('classifies a business bulk request as the complex tier', async () => {
    const res = await request(app)
      .post('/api/ai/query')
      .send({ prompt: 'Procure 50x branded polo shirts for the team', mode: 'business' });
    expect(res.body.tier).toBe('complex');
  });
});
