import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-09-30',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

const EC2_API_URL = process.env.EC2_API_URL || 'http://13.63.238.142:3001';
const EC2_API_KEY = process.env.EC2_API_KEY || '';

export const config = {
  api: {
    body: false,
  },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Vercel's runtime: with body:false, req is a raw stream.
  // Try req.text() first (what Vercel provides), fall back to manual stream read.
  let rawBody;
  try {
    if (typeof req.text === 'function') {
      rawBody = await req.text();
    } else {
      rawBody = await getRawBody(req);
    }
  } catch (e) {
    console.error('Failed to read body:', e.message);
    return res.status(400).json({ error: 'Could not read request body' });
  }

  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set');
  }

  let event;
  try {
    event = endpointSecret
      ? stripe.webhooks.constructEvent(rawBody, signature, endpointSecret)
      : JSON.parse(rawBody);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.metadata?.email || session.customer_details?.email;
    const configType = session.metadata?.config_type || 'standard';

    if (!email) {
      console.error('No email in webhook session:', session.id);
      return res.status(200).json({ received: true });
    }

    const clientName = configType === 'shadow' ? `shadow-${Date.now()}` : `vpn-${Date.now()}`;

    try {
      const { error: dbError } = await supabase
        .from('vpn_customers')
        .upsert(
          {
            email: email.toLowerCase(),
            stripe_session_id: session.id,
            stripe_payment_id: session.payment_intent,
            config_type: configType,
            client_name: clientName,
          },
          { onConflict: 'email' }
        );

      if (dbError) {
        console.error('Supabase upsert error:', dbError);
        return res.status(500).json({ error: 'Database error' });
      }

      if (EC2_API_URL && EC2_API_KEY) {
        try {
          const ec2Res = await fetch(`${EC2_API_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': EC2_API_KEY },
            body: JSON.stringify({ email, country: configType === 'shadow' ? 'CN' : 'US' }),
            signal: AbortSignal.timeout(30000),
          });

          if (ec2Res.ok) {
            const ec2Data = await ec2Res.json();
            if (ec2Data.client_name) {
              await supabase
                .from('vpn_customers')
                .update({ client_name: ec2Data.client_name })
                .eq('email', email.toLowerCase());
            }
            console.log(`EC2 config generated for ${email}: ${ec2Data.client_name}`);
          } else {
            console.error('EC2 generate failed:', ec2Res.status, await ec2Res.text());
          }
        } catch (ec2Err) {
          console.error('EC2 API call failed:', ec2Err);
        }
      }

      console.log(`VPN customer recorded: ${email} (${configType})`);
    } catch (err) {
      console.error('Webhook processing error:', err);
      return res.status(500).json({ error: 'Processing error' });
    }
  }

  return res.status(200).json({ received: true });
}
