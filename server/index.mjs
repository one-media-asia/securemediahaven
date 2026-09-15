import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes, randomUUID, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';

const scrypt = promisify(scryptCallback);
const port = Number(process.env.PORT || 8787);
const usersPath = join(process.cwd(), 'server', 'data', 'users.json');

const sendJson = (response, status, payload) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:8080',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  });
  response.end(JSON.stringify(payload));
};

const readUsers = async () => {
  try {
    return JSON.parse(await readFile(usersPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return [];
  }
};

const writeUsers = async (users) => {
  await mkdir(dirname(usersPath), { recursive: true });
  await writeFile(usersPath, JSON.stringify(users, null, 2) + '\n', 'utf8');
};

const readBody = async (request) => {
  let body = '';
  for await (const chunk of request) body += chunk;
  if (body.length > 16_384) throw new Error('Request is too large');
  return JSON.parse(body || '{}');
};

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
};

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== 'POST' || request.url !== '/api/signup') {
    sendJson(response, 404, { error: 'Route not found' });
    return;
  }

  try {
    const body = await readBody(request);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const plan = typeof body.plan === 'string' ? body.plan : 'Starter';

    if (name.length < 2 || name.length > 100) {
      sendJson(response, 400, { error: 'Enter a valid name.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(response, 400, { error: 'Enter a valid email address.' });
      return;
    }
    if (password.length < 8) {
      sendJson(response, 400, { error: 'Password must be at least 8 characters.' });
      return;
    }
    if (!['Starter', 'Business', 'Scale'].includes(plan)) {
      sendJson(response, 400, { error: 'Choose a valid plan.' });
      return;
    }

    const users = await readUsers();
    if (users.some((user) => user.email === email)) {
      sendJson(response, 409, { error: 'An account with that email already exists.' });
      return;
    }

    const user = {
      id: randomUUID(),
      name,
      email,
      plan,
      passwordHash: await hashPassword(password),
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    await writeUsers(users);

    sendJson(response, 201, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        emailVerified: user.emailVerified,
      },
      message: 'Account created. Email verification is the next step.',
    });
  } catch (error) {
    console.error(error);
    sendJson(response, 400, { error: 'Unable to create the account.' });
  }
});

server.listen(port, () => {
  console.log(`Vaultline API listening on http://localhost:${port}`);
});
