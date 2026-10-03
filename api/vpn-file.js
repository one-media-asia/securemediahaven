import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-08-26.dahlia' })
  : null;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

const EC2_API_URL = process.env.EC2_API_URL || 'http://13.63.238.142:3001';

/**
 * Reject anything that could escape the EC2 path segment or inject headers.
 * Real client names are assigned by the EC2 companion API and are not
 * guaranteed to follow a fixed pattern, so this blocks dangerous characters
 * rather than demanding a specific shape.
 */
const isSafeClientName = (name) =>
  typeof name === 'string' &&
  name.length > 0 &&
  name.length <= 64 &&
  /^[A-Za-z0-9._-]+$/.test(name) &&
  name !== '.' &&
  name !== '..';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // The .ovpn file is a working credential for the VPN server, so a download
  // requires proof of payment. This endpoint previously matched on name + email
  // alone, which let anyone who knew a customer's details download their config.
  const sessionId =
    req.query.session_id || req.query.sessionId || req.headers['x-stripe-session'];

  if (!sessionId || !stripe) {
    return res.status(401).json({ error: 'A paid checkout session is required' });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error('Stripe session lookup failed:', err.message);
    return res.status(401).json({ error: 'Invalid checkout session' });
  }

  if (session.payment_status !== 'paid') {
    return res.status(402).json({ error: 'Payment not completed' });
  }

  const { name, email } = req.query;
  const paidEmail = (session.customer_details?.email || session.metadata?.email || '')
    .toLowerCase();

  if (!name || !email) {
    return res.status(400).json({ error: 'Missing name or email' });
  }

  // Reject traversal and unexpected shapes before the value reaches EC2.
  if (!isSafeClientName(name)) {
    return res.status(400).json({ error: 'Invalid client name' });
  }

  // The paid session must belong to the requested customer.
  if (!paidEmail || email.toLowerCase() !== paidEmail) {
    return res.status(403).json({ error: 'Session does not match this customer' });
  }

  try {
    const { data: customer, error: dbError } = await supabase
      .from('vpn_customers')
      .select('client_name, config_type, email')
      .eq('email', email.toLowerCase())
      .eq('client_name', name)
      .maybeSingle();

    if (dbError || !customer) {
      return res.status(404).json({ error: 'Config not found for this customer' });
    }

    // encodeURIComponent keeps the name one path segment even if the regex
    // above is ever loosened.
    const ec2Url = `${EC2_API_URL}/config/${encodeURIComponent(name)}`;
    const ec2Response = await fetch(ec2Url, {
      headers: { 'X-API-Key': process.env.EC2_API_KEY || '' },
      signal: AbortSignal.timeout(10000),
    });

    if (!ec2Response.ok) {
      console.error('EC2 API error:', ec2Response.status, await ec2Response.text());
      return res.status(502).json({ error: 'Could not retrieve config from server' });
    }

    const ovpnContent = await ec2Response.text();

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${name}.ovpn"`);
    return res.status(200).send(ovpnContent);
  } catch (err) {
    console.error('VPN file error:', err);
    return res.status(500).json({ error: 'Error retrieving config' });
  }
}