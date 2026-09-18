import { scanTarget } from './_scanner.js';

// Rate limiting (simple in-memory for Vercel's ephemeral storage)
const scanHistory = new Map();

const MAX_SCANS_PER_HOUR = 10;
const HOUR_MS = 60 * 60 * 1000;

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = scanHistory.get(ip);
  if (!record) {
    scanHistory.set(ip, { count: 1, firstScan: now });
    return true;
  }
  if (now - record.firstScan > HOUR_MS) {
    scanHistory.set(ip, { count: 1, firstScan: now });
    return true;
  }
  if (record.count >= MAX_SCANS_PER_HOUR) {
    return false;
  }
  record.count++;
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL is not localhost/internal
  const targetUrl = url.trim().toLowerCase();
  if (targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1') || targetUrl.includes('192.168.') || targetUrl.includes('10.')) {
    return res.status(400).json({ error: 'Scanning internal/localhost URLs is not allowed' });
  }

  try {
    const results = await scanTarget(url);
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Scan failed' });
  }
}
