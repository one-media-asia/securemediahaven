import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-26.dahlia',
});

// $6.99/month subscription.
//
// Checkout runs in subscription mode so Stripe collects the card and creates
// the subscription itself. Creating the subscription up front only works while
// a trial is set; without one Stripe rejects it ("no default payment method").
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

    // Checkout creates the subscription and attaches the card; the old flow
    // pre-created it, which only works when a trial is set.
    const sessionParams = {
      mode: 'subscription',
      // Managed Payments rejects payment_method_types on this account.
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [{ price: MONTHLY_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.SITE_URL || 'http://localhost:8080'}/cyberagent?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:8080'}/cyberagent?payment=cancelled`,
      metadata: { product: 'cyberagent' },
      subscription_data: { metadata: { product: 'cyberagent' } },
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
