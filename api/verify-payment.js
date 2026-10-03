import Stripe from 'stripe';
import { issueSessionCookie } from '../lib/cyberagent-access.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-08-26.dahlia' })
  : null;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!stripe) return res.status(503).json({ error: 'Payments are not configured' });
  if (!process.env.ACCESS_COOKIE_SECRET) {
    return res.status(503).json({ error: 'Access verification unavailable' });
  }

  const { sessionId } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      issueSessionCookie(res);
      return res.status(200).json({ valid: true });
    }

    return res.status(200).json({ valid: false });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Could not verify payment' });
  }
}