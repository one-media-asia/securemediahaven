// Create Stripe Checkout Session for scan report
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { targetUrl, scanId } = req.body || {};

  if (!targetUrl) {
    return res.status(400).json({ error: 'targetUrl is required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Vulnerability Scan Report',
              description: `Passive security analysis of ${targetUrl}`,
              images: ['https://onemedia.asia/og-image.png'],
            },
            unit_amount: 1999, // $19.99
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.SITE_URL || 'http://localhost:8080'}/vuln-scan?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:8080'}/vuln-scan?payment=cancelled`,
      metadata: {
        targetUrl,
        scanId: scanId || '',
      },
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
