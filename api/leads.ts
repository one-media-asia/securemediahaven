type Request = {
  method?: string;
  body?: { email?: unknown; consent?: unknown };
};

type Response = {
  status: (code: number) => Response;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const consent = request.body?.consent === true;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const fromName = process.env.RESEND_FROM_NAME || 'appfolk Security';

  if (!emailPattern.test(email) || email.length > 254 || !consent) {
    response.status(400).json({ error: 'Enter a valid email address' });
    return;
  }

  if (!apiKey || !fromEmail) {
    response.status(503).json({ error: 'Email service is not configured' });
    return;
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
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
