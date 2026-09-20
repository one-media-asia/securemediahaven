type Request = {
  method?: string;
  body?: unknown;
};

type Response = {
  status: (code: number) => Response;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseBody = (body: unknown) => {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body && typeof body === 'object' ? body : {};
};

export default async function handler(request: Request, response: Response) {
  response.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://phish.onemedia.asia');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.status(204).json({});
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = parseBody(request.body);
  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const consent = payload && typeof payload === 'object' && 'consent' in payload ? payload.consent === true : false;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const fromName = process.env.RESEND_FROM_NAME || 'appfolk Security';
  const adminEmail = process.env.RESEND_ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL;

  if (!emailPattern.test(email) || email.length > 254 || !consent) {
    response.status(400).json({ error: 'Enter a valid email address' });
    return;
  }

  if (!apiKey || !fromEmail) {
    response.status(503).json({ error: 'Email service is not configured' });
    return;
  }

  try {
    const recipients = [email];
    if (adminEmail && adminEmail !== email) {
      recipients.push(adminEmail);
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: recipients,
        subject: 'Your appfolk practical security updates',
        text: 'Thanks for joining appfolk updates. You will receive occasional security checks, useful tools, and new member drops. Reply to this email to unsubscribe.',
      }),
    });

    if (!resendResponse.ok) {
      response.status(502).json({ error: 'Email provider rejected the request' });
      return;
    }

    response.status(200).json({ ok: true });
  } catch {
    response.status(502).json({ error: 'Unable to reach email provider' });
  }
}
