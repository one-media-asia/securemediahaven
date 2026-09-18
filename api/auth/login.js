import Stripe from 'stripe';
import crypto from 'node:crypto';

let stripe;

function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }
  return stripe;
}

const AUTH_SECRET = process.env.AUTH_SECRET;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
const SESSION_DAYS = 7;

const COGNITO_REGION = process.env.VITE_COGNITO_REGION || 'eu-north-1';
const CLIENT_ID = process.env.COGNITO_CLIENT_ID || process.env.VITE_COGNITO_CLIENT_ID;

function computeSecretHash(username) {
  if (!CLIENT_SECRET) return undefined;
  const hmac = crypto.createHmac('sha256', CLIENT_SECRET);
  hmac.update(username + CLIENT_ID);
  return hmac.digest('base64');
}

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

async function cognitoFetch(operation, body) {
  const url = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`;

  const headers = {
    'X-Amz-Target': `AWSCognitoIdentityProviderService.${operation}`,
    'Content-Type': 'application/x-amz-json-1.1',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || data.Message);
    err.name = data.__type || 'UnknownError';
    throw err;
  }

  return data;
}

async function checkStripeMembership(email) {
  const stripe = getStripe();
  if (!stripe) {
    return { active: false };
  }
  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) return { active: false };

    const customerId = customers.data[0].id;
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subs.data.length > 0) {
      return { active: true, plan: 'subscription' };
    }

    return { active: false };
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
    const emailLower = email.trim().toLowerCase();
    const secretHash = computeSecretHash(emailLower);

    // 1. Authenticate with Cognito
    const authResult = await cognitoFetch('InitiateAuth', {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: emailLower,
        PASSWORD: password,
        ...(secretHash && { SECRET_HASH: secretHash }),
      },
    });

    const { AccessToken } = authResult.AuthenticationResult;

    // 2. Get user details
    const userResult = await cognitoFetch('GetUser', {
      AccessToken: AccessToken,
    });

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

    res.setHeader('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`);

    return res.status(200).json({
      success: true,
      user: {
        email: userEmail,
        name,
        membershipActive: membership.active,
        membershipPlan: membership.plan,
      },
      sessionToken,
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
