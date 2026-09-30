import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Detect if this is likely a China-based user
    // In production, you'd use IP geolocation. For now, we default to standard.
    // The client can also pass country hint.
    const isChina = req.body.country === 'CN';

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'One Media Asia VPN',
              description: isChina
                ? 'OpenVPN access — China-optimized (TCP/443)'
                : 'OpenVPN access — Standard (UDP/1194)',
            },
            unit_amount: 1200, // $12.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        product: 'vpn',
        email,
        config_type: isChina ? 'shadow' : 'standard',
      },
      success_url: `${process.env.SITE_URL || 'http://localhost:8080'}/vpn/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:8080'}/vpn?cancelled=true`,
    });

    return res.status(200).json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('VPN checkout error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
