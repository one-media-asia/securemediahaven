import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-26.dahlia',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  // Session creation is a side effect, so it must not run on GET.
  // Link scanners and prefetchers would otherwise mint live sessions.
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const unitAmount = Number(process.env.CYBERAGENT_PRICE_CENTS || 1200);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Managed Payments rejects payment_method_types on this account.
      managed_payments: { enabled: false },
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'CyberAgent - AI Coding & Cybersecurity Assistant',
            description: 'One-time access to your personal AI coding, debugging, and cybersecurity tool-building assistant.',
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      success_url: `${process.env.SITE_URL || 'http://localhost:8080'}/cyberagent?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:8080'}/cyberagent?payment=cancelled`,
      metadata: { product: 'cyberagent' },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('CyberAgent Stripe error:', err);
    return res.status(500).json({ error: 'Failed to create CyberAgent checkout session' });
  }
}
