import Stripe from 'stripe';

let stripeClient = null;
const getClient = () => {
  if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
};

export const isConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async ({ userId, amountUsd, successUrl, cancelUrl }) => {
  const session = await getClient().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Zibi Wallet Top-Up' },
          unit_amount: Math.round(amountUsd * 100)
        },
        quantity: 1
      }
    ],
    metadata: { userId: String(userId) },
    success_url: successUrl,
    cancel_url: cancelUrl
  });
  return session;
};

export const constructWebhookEvent = (rawBody, signatureHeader) => {
  return getClient().webhooks.constructEvent(rawBody, signatureHeader, process.env.STRIPE_WEBHOOK_SECRET);
};

export const retrieveSession = (sessionId) => getClient().checkout.sessions.retrieve(sessionId);
