import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes, randomUUID, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';
import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const scrypt = promisify(scryptCallback);
const port = Number(process.env.PORT || 8787);
const usersPath = join(process.cwd(), 'server', 'data', 'users.json');
const leadsPath = join(process.cwd(), 'server', 'data', 'leads.json');
const filesPath = join(process.cwd(), 'server', 'data', 'files.json');
const s3Bucket = process.env.AWS_S3_BUCKET || '';
const s3Prefix = (process.env.AWS_S3_PREFIX || 'vaultline').replace(/^\/+|\/+$/g, '');
const s3 = s3Bucket ? new S3Client({ region: process.env.AWS_REGION || 'us-east-1' }) : null;

const sendJson = (response, status, payload) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:8080',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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

const readLeads = async () => {
  try {
    return JSON.parse(await readFile(leadsPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return [];
  }
};

const writeLeads = async (leads) => {
  await mkdir(dirname(leadsPath), { recursive: true });
  await writeFile(leadsPath, JSON.stringify(leads, null, 2) + '\n', 'utf8');
};

const readFiles = async () => {
  try {
    return JSON.parse(await readFile(filesPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return [];
  }
};

const writeFiles = async (files) => {
  await mkdir(dirname(filesPath), { recursive: true });
  await writeFile(filesPath, JSON.stringify(files, null, 2) + '\n', 'utf8');
};

const requireS3 = () => {
  if (!s3) throw new Error('S3 is not configured. Set AWS_S3_BUCKET and AWS_REGION.');
};

const fileKey = (id, name) => `${s3Prefix}/${id}-${name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;

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

  if (request.method === 'POST' && request.url === '/api/leads') {
    try {
      const body = await readBody(request);
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        sendJson(response, 400, { error: 'Enter a valid email address.' });
        return;
      }

      const leads = await readLeads();
      if (!leads.some((lead) => lead.email === email)) {
        leads.push({ email, createdAt: new Date().toISOString(), source: 'homepage' });
        await writeLeads(leads);
      }

      sendJson(response, 201, { message: 'You are on the list.' });
      return;
    } catch (error) {
      console.error(error);
      sendJson(response, 400, { error: 'Unable to join the list.' });
      return;
    }
  }

  if (request.method === 'GET' && request.url?.startsWith('/api/files/upload-url')) {
    try {
      requireS3();
      const url = new URL(request.url, 'http://localhost');
      const filename = url.searchParams.get('filename')?.trim();
      const contentType = url.searchParams.get('contentType') || 'application/octet-stream';
      if (!filename || filename.length > 180) {
        sendJson(response, 400, { error: 'A valid filename is required.' });
        return;
      }

      const id = randomUUID();
      const key = fileKey(id, filename);
      const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: s3Bucket, Key: key, ContentType: contentType }), { expiresIn: 900 });
      const now = Date.now();
      const file = { id, name: filename, type: contentType, size: 'Pending', updated: 'Just now', updatedAt: now, icon: 'file', key };
      const files = await readFiles();
      files.unshift(file);
      await writeFiles(files);
      sendJson(response, 200, { uploadUrl, fileUrl: `s3://${s3Bucket}/${key}`, file });
      return;
    } catch (error) {
      console.error(error);
      sendJson(response, 503, { error: 'S3 storage is not available.' });
      return;
    }
  }

  if (request.method === 'GET' && request.url === '/api/files') {
    try {
      requireS3();
      const result = await s3.send(new ListObjectsV2Command({ Bucket: s3Bucket, Prefix: `${s3Prefix}/` }));
      const files = await readFiles();
      const keys = new Set((result.Contents || []).map((object) => object.Key));
      sendJson(response, 200, { files: files.filter((file) => keys.has(file.key)) });
      return;
    } catch (error) {
      console.error(error);
      sendJson(response, 503, { error: 'Unable to read S3 files.' });
      return;
    }
  }

  if (request.method === 'GET' && request.url?.startsWith('/api/files/download-url')) {
    try {
      requireS3();
      const url = new URL(request.url, 'http://localhost');
      const key = url.searchParams.get('key') || '';
      if (!key || !key.startsWith(`${s3Prefix}/`)) {
        sendJson(response, 400, { error: 'Invalid file key.' });
        return;
      }

      const downloadUrl = await getSignedUrl(s3, new GetObjectCommand({ Bucket: s3Bucket, Key: key }), { expiresIn: 900 });
      sendJson(response, 200, { downloadUrl });
      return;
    } catch (error) {
      console.error(error);
      sendJson(response, 503, { error: 'Unable to create a download link.' });
      return;
    }
  }

  if (request.method === 'POST' && request.url === '/api/files') {
    try {
      requireS3();
      const body = await readBody(request);
      const files = Array.isArray(body.files) ? body.files : [];
      await writeFiles(files);
      sendJson(response, 200, { files });
      return;
    } catch (error) {
      console.error(error);
      sendJson(response, 400, { error: 'Unable to save file metadata.' });
      return;
    }
  }

  if (request.method === 'DELETE' && request.url === '/api/files/clear') {
    try {
      requireS3();
      const result = await s3.send(new ListObjectsV2Command({ Bucket: s3Bucket, Prefix: `${s3Prefix}/` }));
      const objects = (result.Contents || []).flatMap((object) => object.Key ? [{ Key: object.Key }] : []);
      if (objects.length > 0) {
        await s3.send(new DeleteObjectsCommand({ Bucket: s3Bucket, Delete: { Objects: objects } }));
      }
      await writeFiles([]);
      sendJson(response, 200, { files: [] });
      return;
    } catch (error) {
      console.error(error);
      sendJson(response, 503, { error: 'Unable to clear S3 files.' });
      return;
    }
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
