import { CognitoIdentityProviderClient, InitiateAuthCommand, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import Stripe from 'stripe';
import crypto from 'node:crypto';

const cognito = new CognitoIdentityProviderClient({
  region: process.env.VITE_COGNITO_REGION || 'us-east-1',
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const AUTH_SECRET = process.env.AUTH_SECRET;
const SESSION_DAYS = 7;

// Simple HMAC-signed session token (compact JWT-like)
function signSession(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

async function checkStripeMembership(email) {
  try {
    // Look up customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) return { active: false };

    const customerId = customers.data[0].id;
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subs.data.length === 0) {
      // Also check for completed one-time payments that include membership
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 10,
      });
      const hasMembership = sessions.data.some(
        s => s.payment_status === 'paid' && s.metadata?.membership === 'all-access'
      );
      return { active: hasMembership, plan: 'all-access' };
    }

    const sub = subs.data[0];
    return {
      active: true,
      plan: sub.items.data[0]?.price?.lookup_key || 'subscription',
      currentPeriodEnd: sub.current_period_end,
    };
  } catch (err) {
    console.error('Stripe check error:', err);
    return { active: false };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Authenticate with Cognito
    const authResult = await cognito.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.VITE_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email.trim().toLowerCase(),
        PASSWORD: password,
      },
    }));

    const { AccessToken, IdToken } = authResult.AuthenticationResult;

    // 2. Get user details
    const userResult = await cognito.send(new GetUserCommand({
      AccessToken: AccessToken,
    }));

    const userEmail = userResult.UserAttributes.find(a => a.Name === 'email')?.Value;
    const sub = userResult.UserAttributes.find(a => a.Name === 'sub')?.Value;
    const name = userResult.UserAttributes.find(a => a.Name === 'name')?.Value || userEmail;

    // 3. Check Stripe membership
    const membership = await checkStripeMembership(userEmail);

    // 4. Issue session token
    const sessionToken = signSession({
      sub,
      email: userEmail,
      name,
      membershipActive: membership.active,
      membershipPlan: membership.plan || null,
    });

    // Set httpOnly cookie + return token
    res.setHeader('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`);

    return res.status(200).json({
      success: true,
      user: {
        email: userEmail,
        name,
        membershipActive: membership.active,
        membershipPlan: membership.plan,
      },
      sessionToken, // For SPA localStorage fallback
    });
  } catch (err) {
    console.error('Login error:', err);
    if (err.name === 'NotAuthorizedException') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (err.name === 'UserNotConfirmedException') {
      return res.status(401).json({ error: 'Account not confirmed. Check your email.' });
    }
    return res.status(500).json({ error: 'Login failed' });
  }
}
