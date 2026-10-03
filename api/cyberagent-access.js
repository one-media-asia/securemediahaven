import Stripe from 'stripe';
import { createHmac, timingSafeEqual } from 'node:crypto';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-09-30' })
  : null;

const DAY = 86400;

// Plan allowance. Overridable so limits can be tuned without a redeploy.
export const TOKEN_LIMIT = Number(process.env.CYBERAGENT_TOKEN_LIMIT || 3_000_000);
export const PERIOD_DAYS = Number(process.env.CYBERAGENT_PERIOD_DAYS || 30);
export const MAX_TOKENS_PER_CALL = Number(process.env.CYBERAGENT_MAX_TOKENS || 8192);

export function keysMatch(received, expected) {
  const a = Buffer.from(received || '');
  const b = Buffer.from(expected || '');
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(payload) {
  return createHmac('sha256', process.env.ACCESS_COOKIE_SECRET || '')
    .update(payload)
    .digest('base64url');
}

function encode(obj) {
  const payload = Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decode(raw) {
  if (!raw) return null;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig || !keysMatch(sign(payload), sig)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
}

function parseCookies(header) {
  return Object.fromEntries(
    (header || '')
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k, v]) => k && v)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
  );
}

function appendCookie(res, name, value, maxAge) {
  const cookie = `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; ${
    process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  }Max-Age=${maxAge}`;

  // Vercel exposes res.append; plain Node mocks only have setHeader.
  if (typeof res.append === 'function') {
    const existing = res.getHeader?.('Set-Cookie');
    const list = Array.isArray(existing) ? existing : existing ? [existing] : [];
    res.append('Set-Cookie', [...list, cookie]);
  } else {
    const existing = res.getHeader?.('Set-Cookie');
    const list = Array.isArray(existing) ? existing : existing ? [existing] : [];
    res.setHeader('Set-Cookie', [...list, cookie]);
  }
}

/**
 * Issue the signed session cookie that unlocks CyberAgent and starts a fresh
 * usage period at zero tokens.
 */
export function issueSessionCookie(res, days = 365) {
  const claims = {
    exp: Math.floor(Date.now() / 1000) + days * DAY,
    s: Math.floor(Date.now() / 1000), // period start
    t: 0, // tokens used this period
  };
  appendCookie(res, 'cyberagent_session', encode(claims), days * DAY);
  return claims;
}

/**
 * Write updated usage back into the signed cookie.
 */
export function persistUsage(res, claims) {
  appendCookie(res, 'cyberagent_session', encode(claims), 365 * DAY);
  return claims;
}

function readSession(req) {
  if (!process.env.ACCESS_COOKIE_SECRET) {
    throw new Error('ACCESS_COOKIE_SECRET is not configured');
  }
  const claims = decode(parseCookies(req.headers?.cookie).cyberagent_session);
  if (!claims || !claims.exp || claims.exp * 1000 <= Date.now()) return null;
  return claims;
}

/**
 * Roll the usage period over if it has lapsed. Returns fresh claims when the
 * period reset, otherwise null.
 */
function rollPeriod(claims) {
  const now = Math.floor(Date.now() / 1000);
  const start = Number(claims.s) || now;
  if (now - start < PERIOD_DAYS * DAY) return null;
  return {
    ...claims,
    s: now,
    t: 0,
  };
}

/**
 * Resolve the customer: a valid signed cookie, or a paid Stripe session.
 * Returns { claims, isNew, usage } or null when access is denied.
 */
export async function getCustomer(req) {
  const existing = readSession(req);

  if (existing) {
    const rolled = rollPeriod(existing);
    const claims = rolled || existing;
    return { claims, isNew: Boolean(rolled), usage: usageFrom(claims) };
  }

  const sessionId = req.body?.sessionId || req.query?.sessionId;
  if (sessionId && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        const claims = {
          exp: Math.floor(Date.now() / 1000) + 365 * DAY,
          s: Math.floor(Date.now() / 1000),
          t: 0,
        };
        return { claims, isNew: true, usage: usageFrom(claims) };
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function usageFrom(claims) {
  const start = Number(claims?.s) || Math.floor(Date.now() / 1000);
  const used = Math.max(0, Number(claims?.t) || 0);
  const resetAt = start + PERIOD_DAYS * DAY;
  return {
    used,
    limit: TOKEN_LIMIT,
    remaining: Math.max(0, TOKEN_LIMIT - used),
    resetAt,
    resetAtISO: new Date(resetAt * 1000).toISOString(),
    periodDays: PERIOD_DAYS,
  };
}

export function clampTokens(n) {
  const v = Number(n) || 0;
  return Math.min(Math.max(v, 256), MAX_TOKENS_PER_CALL);
}