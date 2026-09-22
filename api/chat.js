export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, maxTokens = 4096, temperature = 0.3 } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `You are CyberAgent, an expert AI assistant specialized in coding, debugging, and building cybersecurity tools. You help developers write secure code, find and fix vulnerabilities, and build security tools.

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
- Keep responses focused and actionable.` },
          ...messages,
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('CyberAgent error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to get response from AI',
    });
  }
}
