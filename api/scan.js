import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns/promises';
import { URL } from 'node:url';

const EXPOSED_PATHS = [
  '/.env',
  '/.git/config',
  '/.git/HEAD',
  '/.svn/entries',
  '/.DS_Store',
  '/robots.txt',
  '/sitemap.xml',
  '/server-status',
  '/server-info',
  '/phpinfo.php',
  '/info.php',
  '/.aws/credentials',
  '/wp-admin/',
  '/wp-login.php',
  '/administrator/',
  '/admin/',
  '/api/',
  '/api/v1/',
  '/graphql',
  '/.well-known/security.txt',
];

const SECURITY_HEADERS = [
  { header: 'strict-transport-security', name: 'HSTS', description: 'Forces browsers to always use HTTPS.' },
  { header: 'content-security-policy', name: 'CSP', description: 'Restricts where resources can be loaded from.' },
  { header: 'x-frame-options', name: 'X-Frame-Options', description: 'Prevents clickjacking via iframes.' },
  { header: 'x-content-type-options', name: 'X-Content-Type-Options', description: 'Prevents MIME-type sniffing.' },
  { header: 'referrer-policy', name: 'Referrer-Policy', description: 'Controls how much referrer info is sent.' },
  { header: 'permissions-policy', name: 'Permissions-Policy', description: 'Restricts browser features like camera/mic.' },
];

const DISCLOSURE_HEADERS = [
  'x-powered-by',
  'server',
  'x-aspnet-version',
  'x-aspnetmvc-version',
  'x-generator',
];

// Simple in-memory rate limiting per IP
const scanHistory = new Map();
const MAX_SCANS_PER_HOUR = 10;
const HOUR_MS = 60 * 60 * 1000;

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
  if (record.count >= MAX_SCANS_PER_HOUR) return false;
  record.count++;
  return true;
}

function fetchUrl(targetUrl, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    const parsed = new URL(targetUrl);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;

    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent': 'VulnScan-Passive-Scanner/1.0 (+https://onemedia.asia)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000,
        rejectUnauthorized: false,
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, targetUrl).toString();
          res.destroy();
          fetchUrl(redirectUrl, redirectCount + 1).then(resolve, reject);
          return;
        }

        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
          if (body.length > 100000) res.destroy();
        });
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body, url: targetUrl }));
        res.on('error', reject);
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    req.on('error', reject);
    req.end();
  });
}

async function checkDns(hostname) {
  try {
    const addresses = await dns.resolve4(hostname);
    return { resolvable: true, addresses };
  } catch {
    try {
      const addresses = await dns.resolve6(hostname);
      return { resolvable: true, addresses };
    } catch {
      return { resolvable: false, addresses: [] };
    }
  }
}

async function checkExposedPaths(baseUrl) {
  const found = [];
  const parsed = new URL(baseUrl);
  const checks = EXPOSED_PATHS.map(async (path) => {
    try {
      const testUrl = `${parsed.origin}${path}`;
      const res = await fetchUrl(testUrl);
      if (res.statusCode >= 200 && res.statusCode < 400) {
        found.push({
          path,
          status: res.statusCode,
          size: res.body?.length || 0,
        });
      }
    } catch {}
  });

  await Promise.allSettled(checks);
  return found.sort((a, b) => a.path.localeCompare(b.path));
}

function analyzeHeaders(headers) {
  const present = [];
  const missing = [];
  const disclosures = [];

  for (const sh of SECURITY_HEADERS) {
    const val = headers[sh.header];
    if (val) {
      present.push({ name: sh.name, header: sh.header, value: val, description: sh.description });
    } else {
      missing.push({ name: sh.name, header: sh.header, description: sh.description });
    }
  }

  for (const dh of DISCLOSURE_HEADERS) {
    const val = headers[dh];
    if (val) {
      disclosures.push({ header: dh, value: val });
    }
  }

  return { present, missing, disclosures };
}

function detectTechnologies(headers, body) {
  const techs = [];
  const server = headers['server'];
  if (server) techs.push({ name: `Server: ${server}`, category: 'Server' });

  const powered = headers['x-powered-by'];
  if (powered) techs.push({ name: powered, category: 'Framework' });

  const bodyLower = body.toLowerCase();

  if (bodyLower.includes('wp-content') || bodyLower.includes('wp-includes')) {
    techs.push({ name: 'WordPress', category: 'CMS' });
  }
  if (bodyLower.includes('drupal')) {
    techs.push({ name: 'Drupal', category: 'CMS' });
  }
  if (bodyLower.includes('joomla')) {
    techs.push({ name: 'Joomla', category: 'CMS' });
  }
  if (bodyLower.includes('react') || bodyLower.includes('__next')) {
    techs.push({ name: 'React / Next.js', category: 'Framework' });
  }
  if (bodyLower.includes('vue') || bodyLower.includes('__nuxt')) {
    techs.push({ name: 'Vue / Nuxt', category: 'Framework' });
  }
  if (bodyLower.includes('angular')) {
    techs.push({ name: 'Angular', category: 'Framework' });
  }
  if (bodyLower.includes('jquery')) {
    techs.push({ name: 'jQuery', category: 'Library' });
  }
  if (bodyLower.includes('bootstrap')) {
    techs.push({ name: 'Bootstrap', category: 'CSS Framework' });
  }
  if (bodyLower.includes('tailwind')) {
    techs.push({ name: 'Tailwind CSS', category: 'CSS Framework' });
  }
  if (bodyLower.includes('google analytics') || bodyLower.includes('googletagmanager') || bodyLower.includes('gtag')) {
    techs.push({ name: 'Google Analytics', category: 'Analytics' });
  }
  if (bodyLower.includes('cloudflare') || headers['cf-ray']) {
    techs.push({ name: 'Cloudflare', category: 'CDN/WAF' });
  }

  const seen = new Set();
  return techs.filter(t => {
    const key = t.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function addAttackerContext(findings) {
  const context = {
    'no-https': {
      attackerView: 'An attacker on the same network could observe or alter traffic, including data submitted to this site.',
      tools: ['Browser developer tools', 'Network traffic inspection tools'],
      validation: 'Open the site over an untrusted network and confirm whether the address remains HTTP or upgrades to HTTPS.'
    },
    'missing-security-headers': {
      attackerView: 'These missing browser controls remove layers of defense that help limit clickjacking, script injection, and downgrade attacks.',
      tools: ['curl or browser developer tools', 'Security header checkers'],
      validation: 'Inspect the response headers in browser developer tools and confirm the listed headers are absent.'
    },
    'info-disclosure': {
      attackerView: 'The disclosed server or framework version helps an attacker narrow their research to software-specific weaknesses and known advisories.',
      tools: ['curl or browser developer tools', 'Technology fingerprinting tools'],
      validation: 'Review the response headers and confirm that version-bearing `Server` or framework headers are visible.'
    },
    'exposed-sensitive': {
      attackerView: 'An attacker could request these public paths to look for credentials, source code, deployment metadata, or internal configuration.',
      tools: ['Browser or curl', 'Content discovery tools'],
      validation: 'Review each reported path with an authorized request and confirm it returns a non-error response without exposing sensitive content.'
    },
    'exposed-info-paths': {
      attackerView: 'These paths reveal useful entry points, site structure, or administrative surfaces that an attacker may investigate further.',
      tools: ['Browser or curl', 'Content discovery tools'],
      validation: 'Open each reported path while authorized and confirm whether it should be public and whether authentication is enforced.'
    },
    'cookie-security': {
      attackerView: 'Weak cookie flags can make session tokens easier to read through client-side bugs, send over plaintext, or reuse across unwanted request contexts.',
      tools: ['Browser developer tools', 'Cookie inspection tools'],
      validation: 'Inspect `Set-Cookie` response headers and confirm every session cookie has the appropriate HttpOnly, Secure, and SameSite attributes.'
    },
    'directory-listing': {
      attackerView: 'A directory index gives away filenames and folder structure, which can expose backups, old builds, and forgotten endpoints.',
      tools: ['Browser or curl', 'Content discovery tools'],
      validation: 'Visit the reported directory while authorized and confirm it returns an index page instead of a 403 or a controlled application response.'
    }
  };

  return findings.map((finding) => ({
    ...finding,
    ...(context[finding.id] || {})
  }));
}

async function scanTarget(inputUrl) {
  const startTime = Date.now();
  const findings = [];

  let targetUrl = inputUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  const hostname = parsed.hostname;

  const dnsResult = await checkDns(hostname);
  if (!dnsResult.resolvable) {
    throw new Error(`Could not resolve hostname: ${hostname}`);
  }

  findings.push({
    id: 'dns-resolved',
    title: 'DNS Resolution',
    category: 'info',
    description: `Domain resolves to: ${dnsResult.addresses.slice(0, 3).join(', ')}${dnsResult.addresses.length > 3 ? ` (+${dnsResult.addresses.length - 3} more)` : ''}`,
    value: dnsResult.addresses,
  });

  let response;
  try {
    response = await fetchUrl(targetUrl);
  } catch (err) {
    throw new Error(`Could not connect to target: ${err.message}`);
  }

  findings.push({
    id: 'http-status',
    title: 'HTTP Response',
    category: 'info',
    description: `Server responded with status ${response.statusCode}`,
    value: response.statusCode,
  });

  if (response.url !== targetUrl) {
    const isUpgrade = response.url.startsWith('https://') && targetUrl.startsWith('http://');
    findings.push({
      id: 'redirect',
      title: isUpgrade ? 'HTTP to HTTPS Redirect' : 'URL Redirect',
      category: isUpgrade ? 'info' : 'medium',
      description: isUpgrade
        ? `Server redirects HTTP to HTTPS: ${targetUrl} → ${response.url}`
        : `Server redirects to: ${response.url}`,
    });
  }

  const isHttps = response.url.startsWith('https://');
  if (!isHttps) {
    findings.push({
      id: 'no-https',
      title: 'No HTTPS',
      category: 'high',
      description: 'The site is served over unencrypted HTTP. All data transmitted between the browser and server can be intercepted and modified by attackers on the network.',
      fix: "Enable HTTPS with a free certificate from Let's Encrypt. Redirect all HTTP traffic to HTTPS. Enable HSTS to enforce HTTPS for future visits.",
      icon: 'Lock',
      cwe: 'CWE-319',
    });
  }

  const headerAnalysis = analyzeHeaders(response.headers);

  if (headerAnalysis.missing.length > 0) {
    const critical = headerAnalysis.missing.filter(h => ['HSTS', 'CSP', 'X-Frame-Options'].includes(h.name));
    const others = headerAnalysis.missing.filter(h => !['HSTS', 'CSP', 'X-Frame-Options'].includes(h.name));

    if (critical.length > 0) {
      findings.push({
        id: 'missing-security-headers',
        title: 'Missing Critical Security Headers',
        category: 'high',
        description: `The response is missing these security headers: ${critical.map(h => h.name).join(', ')}. These headers provide defense-in-depth against common web attacks.`,
        fix: `Add the following headers to your server configuration:\n${critical.map(h => `- ${h.name}: ${h.description}`).join('\n')}`,
        icon: 'Shield',
        cwe: 'CWE-693',
        owasp: 'A05:2021',
        details: critical,
      });
    }

    if (others.length > 0) {
      findings.push({
        id: 'missing-headers-deferred',
        title: 'Additional Headers Recommended',
        category: 'low',
        description: `Consider adding: ${others.map(h => h.name).join(', ')}.`,
        details: others,
      });
    }
  }

  if (headerAnalysis.present.length > 0) {
    findings.push({
      id: 'security-headers-present',
      title: 'Security Headers Present',
      category: 'info',
      description: `Good: the site includes these security headers: ${headerAnalysis.present.map(h => h.name).join(', ')}.`,
      details: headerAnalysis.present,
    });
  }

  if (headerAnalysis.disclosures.length > 0) {
    const details = headerAnalysis.disclosures.map(d => `${d.header}: ${d.value}`).join('\n');
    findings.push({
      id: 'info-disclosure',
      title: 'Server Version Disclosure',
      category: 'medium',
      description: `The server reveals version information in HTTP headers:\n${details}\n\nThis helps attackers identify specific software versions with known vulnerabilities.`,
      fix: 'Remove version headers from your server responses. In Nginx: `server_tokens off;`. In Apache: `ServerTokens Prod` and `ServerSignature Off`. Remove X-Powered-By from your application framework.',
      icon: 'FileCode',
      cwe: 'CWE-200',
      owasp: 'A05:2021',
      details: headerAnalysis.disclosures,
    });
  }

  const technologies = detectTechnologies(response.headers, response.body);
  if (technologies.length > 0) {
    findings.push({
      id: 'technologies',
      title: 'Detected Technologies',
      category: 'info',
      description: `Identified ${technologies.length} technology/technologies on this site.`,
      details: technologies,
      value: technologies,
    });
  }

  const exposedPaths = await checkExposedPaths(response.url);
  if (exposedPaths.length > 0) {
    const sensitive = exposedPaths.filter(p =>
      p.path.includes('.env') || p.path.includes('.git') || p.path.includes('.svn') ||
      p.path.includes('.aws') || p.path.includes('phpinfo') || p.path.includes('server-status') ||
      p.path.includes('server-info')
    );

    if (sensitive.length > 0) {
      findings.push({
        id: 'exposed-sensitive',
        title: 'Sensitive Files Exposed',
        category: 'critical',
        description: `Found ${sensitive.length} potentially sensitive paths that respond successfully:\n${sensitive.map(p => `- ${p.path} (HTTP ${p.status}, ${p.size} bytes)`).join('\n')}\n\nThese may leak credentials, source code, or server configuration.`,
        fix: 'Block access to sensitive files at the web server level. Use deny rules for .git, .env, .svn, and backup files. Return 404 instead of 200 for non-public resources.',
        icon: 'Eye',
        cwe: 'CWE-538',
        owasp: 'A01:2021',
        details: sensitive,
      });
    }

    const infoPaths = exposedPaths.filter(p =>
      p.path.includes('robots.txt') || p.path.includes('sitemap') || p.path.includes('security.txt') ||
      p.path.includes('wp-admin') || p.path.includes('administrator') || p.path.includes('admin')
    );

    if (infoPaths.length > 0) {
      findings.push({
        id: 'exposed-info-paths',
        title: 'Accessible Administrative/Info Paths',
        category: 'medium',
        description: `The following paths are accessible:\n${infoPaths.map(p => `- ${p.path} (HTTP ${p.status})`).join('\n')}\n\nEnsure admin panels are protected by strong authentication and IP restrictions.`,
        fix: 'Restrict admin access by IP. Enable 2FA/MFA. Use strong passwords and rate limiting. Consider moving admin panels to non-standard paths.',
        icon: 'Globe',
        cwe: 'CWE-548',
        owasp: 'A01:2021',
        details: infoPaths,
      });
    }
  }

  const cookies = response.headers['set-cookie'];
  if (cookies && cookies.length > 0) {
    const cookieIssues = [];
    for (const cookie of cookies) {
      const issues = [];
      const lower = cookie.toLowerCase();
      if (!lower.includes('httponly')) issues.push('Missing HttpOnly');
      if (!lower.includes('secure') && isHttps) issues.push('Missing Secure');
      if (!lower.includes('samesite')) issues.push('Missing SameSite');
      if (issues.length > 0) {
        cookieIssues.push({ cookie: cookie.split(';')[0].split('=').shift(), issues });
      }
    }
    if (cookieIssues.length > 0) {
      findings.push({
        id: 'cookie-security',
        title: 'Cookie Security Flags Missing',
        category: 'medium',
        description: `${cookieIssues.length} cookie(s) lack security flags:\n${cookieIssues.map(c => `- ${c.cookie}: ${c.issues.join(', ')}`).join('\n')}\n\nMissing flags make cookies vulnerable to theft via XSS or transmission over HTTP.`,
        fix: 'Add `HttpOnly` (blocks JS access), `Secure` (HTTPS only), and `SameSite=Lax` or `Strict` (CSRF protection) to all cookies.',
        icon: 'AlertTriangle',
        cwe: 'CWE-614',
        owasp: 'A05:2021',
        details: cookieIssues,
      });
    }
  }

  const bodyLower = response.body.toLowerCase();
  if ((bodyLower.includes('<title>index of') || bodyLower.includes('directory listing for') || bodyLower.includes('<h1>index of')) && response.statusCode === 200) {
    findings.push({
      id: 'directory-listing',
      title: 'Directory Listing Enabled',
      category: 'medium',
      description: 'The web server shows a directory listing when no index file is found. This exposes all files and folder structure to anyone who asks.',
      fix: 'Disable directory listing. In Apache: `Options -Indexes`. In Nginx: disable `autoindex`. Ensure all directories either have an index file or return 403.',
      icon: 'FileCode',
      cwe: 'CWE-548',
      owasp: 'A01:2021',
    });
  }

  const scanTime = Date.now() - startTime;

  const weights = { critical: 25, high: 15, medium: 8, low: 3, info: 0 };
  const total = findings.reduce((sum, f) => sum + weights[f.category], 0);
  const score = Math.max(0, Math.min(100, total));

  return {
    target: response.url,
    hostname,
    scanTime,
    findings: addAttackerContext(findings),
    score,
    summary: {
      critical: findings.filter(f => f.category === 'critical').length,
      high: findings.filter(f => f.category === 'high').length,
      medium: findings.filter(f => f.category === 'medium').length,
      low: findings.filter(f => f.category === 'low').length,
      info: findings.filter(f => f.category === 'info').length,
    },
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  // Block internal/localhost
  const targetUrl = url.trim().toLowerCase();
  if (targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1') || targetUrl.includes('192.168.') || targetUrl.includes('10.')) {
    return res.status(400).json({ error: 'Scanning internal/localhost URLs is not allowed' });
  }

  try {
    const results = await scanTarget(url);
    console.log(JSON.stringify({
      event: 'tool_used',
      tool: 'VulnScan',
      hostname: new URL(url).hostname,
      timestamp: new Date().toISOString(),
    }));
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Scan failed' });
  }
}
