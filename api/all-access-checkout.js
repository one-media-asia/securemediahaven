import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-09-30',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'appfolk All Access',
            description: 'One-time access to the appfolk tool shelf.',
          },
          unit_amount: 1200,
        },
        quantity: 1,
      }],
      success_url: `${process.env.SITE_URL || 'http://localhost:8080'}/success?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:8080'}/?payment=cancelled`,
    });

    if (req.method === 'GET') return res.redirect(303, session.url);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('All Access Stripe error:', err);
    return res.status(500).json({ error: 'Failed to create All Access checkout session' });
  }
}