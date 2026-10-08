import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-26.dahlia',
});

// €0.99 one-time intro charge, then €4.99/month once the trial ends.
const INTRO_PRICE_ID = process.env.CYBERAGENT_INTRO_PRICE_ID || 'price_1UOEHyHfLuEywLiX6x500nfk';
const MONTHLY_PRICE_ID = process.env.CYBERAGENT_MONTHLY_PRICE_ID || 'price_1UOE6PHfLuEywLiXaaRXMGAT';
const TRIAL_DAYS = Number(process.env.CYBERAGENT_TRIAL_DAYS || 7);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const customer = await stripe.customers.create({
      ...(email ? { email } : {}),
      metadata: { product: 'cyberagent' },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: MONTHLY_PRICE_ID }],
      trial_period_days: TRIAL_DAYS,
      // An abandoned checkout leaves a trial with no card; cancel it instead
      // of letting it move to past_due at the end of the trial.
      trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
      metadata: { product: 'cyberagent' },
    });

    const sessionParams = {
      mode: 'payment',
      // Managed Payments rejects payment_method_types on this account.
      managed_payments: { enabled: false },
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [{ price: INTRO_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.SITE_URL || 'http://localhost:8080'}/cyberagent?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:8080'}/cyberagent?payment=cancelled`,
      metadata: { product: 'cyberagent', subscription: subscription.id },
    };

    let session;
    try {
      // Save the intro card so the subscription can charge €4.99 on day 8.
      session = await stripe.checkout.sessions.create({
        ...sessionParams,
        payment_intent_data: {
          setup_future_usage: 'off_session',
          metadata: { product: 'cyberagent' },
        },
      });
    } catch (err) {
      console.warn('CyberAgent checkout: setup_future_usage rejected, retrying without it:', err.message);
      session = await stripe.checkout.sessions.create(sessionParams);
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('CyberAgent Stripe error:', err);
    return res.status(500).json({ error: 'Failed to create CyberAgent checkout session' });
  }
}
