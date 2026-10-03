import { keysMatch, issueSessionCookie } from '../lib/cyberagent-access.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.CYBERAGENT_ADMIN_KEY) return res.status(503).json({ error: 'Owner access is not configured' });

  const { key } = req.body || {};
  if (!keysMatch(key, process.env.CYBERAGENT_ADMIN_KEY)) {
    return res.status(401).json({ error: 'Invalid owner key' });
  }

  issueSessionCookie(res);
  return res.status(200).json({ valid: true });
}
