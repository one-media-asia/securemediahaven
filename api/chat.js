import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, maxTokens = 4096, temperature = 0.3 } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const conversationHistory = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'user',
      content: [{ type: 'text', text: m.content }],
    }));

    const command = new InvokeModelCommand({
      modelId: 'eu.mistral.pixtral-large-2502-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        maxTokens,
        temperature,
        system: SYSTEM_PROMPT,
        messages: conversationHistory,
      }),
    });

    const response = await client.send(command);
    const body = JSON.parse(new TextDecoder().decode(response.body));
    const text = body.content[0].text;

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('CyberAgent error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to get response from AI',
    });
  }
}
