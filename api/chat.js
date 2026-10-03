import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import {
  getCustomer,
  persistUsage,
  usageFrom,
  clampTokens,
  TOKEN_LIMIT,
} from '../lib/cyberagent-access.js';

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'eu-north-1' });

// DeepSeek V3 only. Not throttled on this account (the Anthropic models are)
// and roughly 20x cheaper, so the 3M-token plan has real margin and customers
// never see a 429. Bedrock serves it with the OpenAI wire format; set a
// CYBERAGENT_FALLBACK_MODEL_ID to add a higher-quality fallback if needed.
const PRIMARY_MODEL = process.env.CYBERAGENT_MODEL_ID || 'deepseek.v3-v1:0';
const FALLBACK_MODEL = process.env.CYBERAGENT_FALLBACK_MODEL_ID || '';

const SYSTEM_PROMPT = `You are CyberAgent, an expert AI assistant specialized in coding, debugging, and building cybersecurity tools. You help developers write secure code, find and fix vulnerabilities, and build security tools.

Your expertise includes:
- Writing code in Python, JavaScript, TypeScript, Go, Rust, Bash, and more
- Debugging errors and explaining root causes
- Building cybersecurity tools (scanners, pentesting utilities, analysis scripts)
- Explaining security concepts (OWASP Top 10, CVEs, cryptography, network security)
- Reviewing code for security issues
- Suggesting secure coding practices

Guidelines:
- Be direct and practical. Show code examples.
- For security topics, explain both the attack and defense perspectives.
- When writing code, include comments explaining key parts.
- If a request could be used maliciously, explain the defensive/educational context.
- Keep responses focused and actionable.`;

const CORS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const buildBody = (wire, messages, maxTokens, temperature) => {
  const history = messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content ?? ''),
  }));

  if (wire === 'openai') {
    return JSON.stringify({
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
      max_tokens: maxTokens,
      temperature,
    });
  }

  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    temperature,
    system: SYSTEM_PROMPT,
    messages: history,
  });
};

/** Normalise either wire format into text + tokens. */
function parseResponse(data) {
  if (Array.isArray(data.choices)) {
    const text = data.choices.map((c) => c?.message?.content ?? '').join('');
    return {
      text,
      spent:
        (Number(data.usage?.prompt_tokens) || 0) +
        (Number(data.usage?.completion_tokens) || 0),
      stopReason: data.choices[0]?.finish_reason || null,
      wire: 'openai',
    };
  }

  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  return {
    text,
    spent:
      (Number(data.usage?.input_tokens) || 0) +
      (Number(data.usage?.output_tokens) || 0) +
      (Number(data.usage?.cache_read_input_tokens) || 0) +
      (Number(data.usage?.cache_creation_input_tokens) || 0),
    stopReason: data.stop_reason || null,
    wire: 'anthropic',
  };
}

const wireFor = (modelId) => (modelId.startsWith('deepseek') ? 'openai' : 'anthropic');

async function invoke(modelId, messages, maxTokens, temperature) {
  const response = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: buildBody(wireFor(modelId), messages, maxTokens, temperature),
    })
  );
  return parseResponse(JSON.parse(Buffer.from(response.body).toString('utf8')));
}

/** Throttling and access denials are worth retrying on the other model. */
const isRetryable = (e) =>
  e?.name === 'ThrottlingException' ||
  e?.name === 'AccessDeniedException' ||
  e?.name === 'ValidationException' ||
  e?.name === 'ModelNotReadyException' ||
  e?.name === 'ServiceUnavailableException';

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!process.env.AWS_REGION) {
      return res.status(500).json({ error: 'AWS_REGION is not configured' });
    }

    const { messages, maxTokens = 4096, temperature = 0.3 } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // Inference costs real money, so access and quota are both enforced
    // server-side. The client-side paywall is advisory and bypassable.
    let customer;
    try {
      customer = await getCustomer(req);
    } catch (e) {
      console.error('Access check failed:', e.message);
      return res.status(503).json({ error: 'Access verification unavailable' });
    }

    if (!customer) {
      return res.status(402).json({ error: 'Payment required' });
    }

    const { claims, usage } = customer;

    if (usage.remaining <= 0) {
      return res.status(429).json({
        error: `Monthly token allowance reached. Resets ${usage.resetAtISO}.`,
        usage,
      });
    }

    const tokens = clampTokens(maxTokens);
    const temp = Number(temperature) || 0.3;

    let result;
    let modelUsed = PRIMARY_MODEL;

    try {
      result = await invoke(PRIMARY_MODEL, messages, tokens, temp);
    } catch (primaryError) {
      if (!isRetryable(primaryError) || FALLBACK_MODEL === PRIMARY_MODEL) throw primaryError;
      console.warn(
        `Primary model failed (${primaryError.name}), falling back to ${FALLBACK_MODEL}`
      );
      result = await invoke(FALLBACK_MODEL, messages, tokens, temp);
      modelUsed = FALLBACK_MODEL;
    }

    // Bill actual consumption whichever wire format answered.
    claims.t = (Number(claims.t) || 0) + result.spent;
    persistUsage(res, claims);

    return res.status(200).json({
      response: result.text,
      spent: result.spent,
      model: modelUsed,
      usage: usageFrom(claims),
      stopReason: result.stopReason,
    });
  } catch (error) {
    console.error('CyberAgent error:', error);

    const name = error?.name || '';
    if (name === 'ThrottlingException') {
      return res.status(429).json({ error: 'Service is busy, please retry shortly' });
    }
    if (name === 'AccessDeniedException') {
      return res.status(503).json({ error: 'Model access unavailable' });
    }

    return res.status(500).json({
      error: error.message || 'Failed to get response from AI',
      limit: TOKEN_LIMIT,
    });
  }
}