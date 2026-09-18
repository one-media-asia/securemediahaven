import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook Error' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { targetUrl, scanId } = session.metadata || {};

      // TODO: Mark scan as paid in DB, send email, etc.
      console.log('Payment successful:', {
        sessionId: session.id,
        targetUrl,
        scanId,
        customerEmail: session.customer_details?.email,
      });

      // In production: store session.id → {targetUrl, scanId, paid: true}
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}
