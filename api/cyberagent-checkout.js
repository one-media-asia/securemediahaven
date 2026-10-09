import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-26.dahlia',
});

// $6.99/month subscription.
//
// Subscription created up front; Checkout collects the card which is attached to the subscription.
const MONTHLY_PRICE_ID = process.env.CYBERAGENT_MONTHLY_PRICE_ID;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!MONTHLY_PRICE_ID) {
    return res.status(503).json({ error: 'CyberAgent pricing is not configured' });
  }

  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const customer = await stripe.customers.create({
      ...(email ? { email } : {}),
      metadata: { product: 'cyberagent' },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: MONTHLY_PRICE_ID }],
      metadata: { product: 'cyberagent' },
    });

    const sessionParams = {
      mode: 'setup',
      // Managed Payments rejects payment_method_types on this account.
      managed_payments: { enabled: false },
      payment_method_types: ['card'],
      customer: customer.id,
      success_url: `${process.env.SITE_URL || 'http://localhost:8080'}/cyberagent?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:8080'}/cyberagent?payment=cancelled`,
      metadata: { product: 'cyberagent', subscription: subscription.id },
    };

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (err) {
      console.warn('CyberAgent checkout: managed_payments override rejected, retrying:', err.message);
      const { managed_payments, payment_method_types, ...fallback } = sessionParams;
      session = await stripe.checkout.sessions.create(fallback);
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('CyberAgent Stripe error:', err);
    return res.status(500).json({ error: 'Failed to create CyberAgent checkout session' });
  }
}
