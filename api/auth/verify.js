import crypto from 'node:crypto';

const AUTH_SECRET = process.env.AUTH_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) throw new Error('Malformed token');

    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${body}`).digest('base64url');
    if (sig !== expectedSig) throw new Error('Invalid signature');

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }

    return res.status(200).json({
      user: {
        email: payload.email,
        name: payload.name,
        membershipActive: payload.membershipActive,
        membershipPlan: payload.membershipPlan,
      },
    });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
