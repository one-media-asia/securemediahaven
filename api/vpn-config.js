import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-26.dahlia',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { session_id, email } = req.body || {};

    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    // Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed' });
    }

    const customerEmail = session.customer_details?.email || email;

    if (!customerEmail) {
      return res.status(400).json({ error: 'No email associated with this session' });
    }

    // maybeSingle() returns null for zero rows rather than raising PGRST116, so
    // a customer whose config has not provisioned yet is a 404 with guidance
    // instead of a bare "Database error" 500.
    const { data, error: dbError } = await supabase
      .from('vpn_customers')
      .select('client_name, config_type')
      .eq('email', customerEmail.toLowerCase())
      .maybeSingle();

    if (dbError) {
      console.error('DB lookup error:', dbError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!data) {
      return res.status(404).json({
        error: 'No VPN config found for this customer',
        hint: 'If you just paid, your config may still be provisioning. Try again in a minute.',
      });
    }

    return res.status(200).json({
      client_name: data.client_name,
      config_type: data.config_type,
      email: customerEmail,
    });
  } catch (err) {
    console.error('VPN config lookup error:', err);
    return res.status(500).json({ error: 'Failed to look up config' });
  }
}