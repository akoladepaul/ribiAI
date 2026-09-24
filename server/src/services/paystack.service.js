import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://api.paystack.co';

const client = () =>
  axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
  });

export const isConfigured = () => Boolean(process.env.PAYSTACK_SECRET_KEY);

export const initializeTransaction = async ({ email, amountKobo, reference, callbackUrl }) => {
  const { data } = await client().post('/transaction/initialize', {
    email,
    amount: amountKobo, // Paystack's base unit for NGN is kobo, matching our wallet ledger
    reference,
    callback_url: callbackUrl
  });
  return data.data; // { authorization_url, access_code, reference }
};

export const verifyTransaction = async (reference) => {
  const { data } = await client().get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return data.data; // { status: 'success' | ..., amount, reference, ... }
};

export const verifyWebhookSignature = (rawBody, signatureHeader) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  return hash === signatureHeader;
};
