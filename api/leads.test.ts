import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './leads';

describe('leads API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts valid JSON payloads sent as a raw string body', async () => {
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.RESEND_FROM_EMAIL = 'security@example.com';
    process.env.RESEND_FROM_NAME = 'appfolk Security';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const req: any = {
      method: 'POST',
      body: JSON.stringify({ email: 'hello@example.com', consent: true }),
    };

    const res: any = {
      headers: {},
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
        return this;
      },
    };

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
