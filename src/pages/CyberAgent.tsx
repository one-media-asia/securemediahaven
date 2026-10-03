import { Send, Shield, Loader2, Lock, Bot, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CyberAgent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  // Optimistic UI only. The server re-checks access on every /api/chat call,
  // so a stale value here cannot grant inference.
  const [hasAccess, setHasAccess] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [usage, setUsage] = useState<{
    used: number;
    limit: number;
    remaining: number;
    resetAtISO: string;
  } | null>(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('payment') === 'success' && sessionId) {
      // Exchange the Stripe session for an HttpOnly signed cookie. Access is
      // enforced server-side; this only mirrors the result for the UI.
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) setHasAccess(true);
        })
        .catch(() => {
          // leave paywall up; inference will reject if access is not valid
        });
    }
    window.history.replaceState({}, '', '/cyberagent');
  }, []);

  const handleSend = async () => {
    if (!input.trim() || streaming) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setStreaming(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: 'user', content: userMsg },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.usage) setUsage(data.usage);
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);

      if (data.usage) setUsage(data.usage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setStreaming(false);
    }
  };

  const checkoutUrl = '/api/cyberagent-checkout';

  const samplePrompt = `Write a simple Python port scanner that:
1. Takes a host and port range as arguments
2. Uses socket connections to check if ports are open
3. Shows which ports are open with their common service names
4. Includes a short explanation of how it works and what each part does

Keep it clear and educational — someone learning security should be able to follow it.`;

  const sendSample = () => {
    if (streaming || !hasAccess) return;
    setInput(samplePrompt);
    setMessages(prev => [...prev, { role: 'user', content: samplePrompt }]);
    setStreaming(true);
    setError('');
    handleSend();
  };

  const startCheckout = async () => {
    if (checkoutPending) return;
    setCheckoutPending(true);
    setError('');
    try {
      const res = await fetch(checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout unavailable');
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout');
      setCheckoutPending(false);
    }
  };

  const handleBypass = async () => {
    const key = window.prompt('Enter your owner access key');
    if (!key) return;
    setError('');
    try {
      const res = await fetch('/api/cyberagent-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.error || 'Owner access denied');
        return;
      }
      setHasAccess(true);
    } catch {
      setError('Could not verify owner access');
    }
  };

  const paywallView = (
    <div className="cyberagent-paywall">
      <div className="cyberagent-paywall-content">
        <Bot size={32} />
        <h2>CyberAgent Locked</h2>
        <p>
          Your personal AI coding and cybersecurity assistant.
          Write code, debug errors, build security tools, and learn
          defensive techniques - all in one chat.
        </p>
        <ul className="cyberagent-features">
          <li><span><Shield size={14} /></span>Code review & secure coding advice</li>
          <li><span><Shield size={14} /></span>Debugging with root-cause explanations</li>
          <li><span><Shield size={14} /></span>Build cybersecurity tools from scratch</li>
          <li><span><Shield size={14} /></span>OWASP, CVE, and crypto explanations</li>
        </ul>
        <p className="cyberagent-usage">
          3M tokens/month included — ~3,000 messages
        </p>
        {checkoutUrl ? (
          <button className="cyberagent-unlock-btn"
            onClick={startCheckout} disabled={checkoutPending}>
            <Lock size={16} />
            {checkoutPending ? 'Opening checkout…' : 'Unlock with one-time payment'}
          </button>
        ) : (
          <button className="cyberagent-unlock-btn" disabled>
            Checkout unavailable
          </button>
        )}
        <button className="cyberagent-bypass-btn" onClick={handleBypass}>
          Owner access
        </button>
      </div>
    </div>
  );

  return (
    <main className="cyberagent-page">
      <header className="cyberagent-header">
        <Link className="cyberagent-back" to="/">
          <span>A</span> appfolk
        </Link>
        <div className="cyberagent-logo">
          <Shield size={18} /> CyberAgent
        </div>
        <span className="cyberagent-badge">
          {hasAccess ? 'Active' : 'Locked'}
        </span>
      </header>

      <section className="cyberagent-hero">
        <p className="eyebrow">AI coding & cybersecurity assistant</p>
        <h1>
          Code faster.<br />
          <em>Secure smarter.</em>
        </h1>
        <p>
          Ask anything about writing code, finding bugs, or building
          security tools. CyberAgent runs on a cybersecurity-tuned
          DeepSeek model trained for defensive security, secure coding,
          and vulnerability analysis.
        </p>
        <div className="cyberagent-hero-actions">
          <button className="cyberagent-sample-btn"
            onClick={() => sendSample()}
            disabled={streaming || !hasAccess}
          >
            <Globe size={15} /> Load sample: port scan
          </button>
        </div>
        <p className="cyberagent-usage">
          Included: 3M tokens/month — enough for ~3,000 messages
        </p>
        {usage && (
          <p className="cyberagent-usage" data-testid="cyberagent-usage-meter">
            {Math.round(usage.used).toLocaleString()} of{' '}
            {Math.round(usage.limit).toLocaleString()} tokens used —{' '}
            {Math.round(usage.remaining).toLocaleString()} remaining, resets{' '}
            {new Date(usage.resetAtISO).toLocaleDateString()}
          </p>
        )}
      </section>

      <section className="cyberagent-compare">
        <p className="eyebrow">How it compares</p>
        <table className="cyberagent-compare-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Price</th>
              <th>Tokens</th>
              <th>Model</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="cyberagent-compare-you">CyberAgent</span></td>
              <td><strong>$12</strong> (one-time)</td>
              <td>3M/mo</td>
              <td>DeepSeek V4 Flash<br /><span className="cyberagent-model-tag">cybersecurity-tuned</span></td>
            </tr>
            <tr>
              <td>Claude Pro</td>
              <td>$20/mo</td>
              <td>Uncapped*</td>
              <td>Claude Sonnet/Opus</td>
            </tr>
            <tr>
              <td>Bolt.new</td>
              <td>$25/mo</td>
              <td>10M/mo</td>
              <td>GPT-4 / Claude</td>
            </tr>
            <tr>
              <td>Windsurf Pro</td>
              <td>$20/mo</td>
              <td>Quota pool</td>
              <td>SWE-1.6 / frontier</td>
            </tr>
            <tr>
              <td>OpenAI Codex Plus</td>
              <td>$20/mo</td>
              <td>Msg limit</td>
              <td>GPT-5</td>
            </tr>
          </tbody>
        </table>
        <p className="cyberagent-compare-note">
          * Claude Pro has per-hour message caps, not a token ceiling.
          Heavy users still hit ceilings — CyberAgent uses one of the
          most cost-efficient frontier APIs available, so the $12
          one-time tier stays well within margin.
        </p>
      </section>

      {!hasAccess ? (
        paywallView
      ) : (
        <section className="cyberagent-chat">
          <div className="cyberagent-messages">
            {messages.length === 0 ? (
              <div className="cyberagent-welcome">
                <Bot size={28} />
                <h3>How can I help?</h3>
                <p>Try questions like:</p>
                <ul>
                  <li>"Write a Python port scanner"</li>
                  <li>"Why is this React hook causing re-renders?"</li>
                  <li>"How do I fix an SQL injection vulnerability?"</li>
                  <li>"Build a log analyzer in Go"</li>
                </ul>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`cyberagent-message ${msg.role}`}
                >
                  <div className="cyberagent-message-head">
                    {msg.role === 'assistant' ? (
                      <>
                        <Bot size={14} />
                        <span>CyberAgent</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>You</span>
                      </>
                    )}
                  </div>
                  <div className="cyberagent-message-body">
                    {msg.content.split('\n').map((para, j) => (
                      <p key={j}>{para}</p>
                    ))}
                  </div>
                </div>
              ))
            )}
            {streaming && (
              <div className="cyberagent-message assistant">
                <div className="cyberagent-message-head">
                  <Bot size={14} />
                  <span>CyberAgent</span>
                </div>
                <div className="cyberagent-message-body">
                  <Loader2 size={14} className="spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="cyberagent-error">
                <span className="cyberagent-error-icon">!</span>
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="cyberagent-input-row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about code, bugs, or security tools..."
              rows={2}
              disabled={streaming}
              className="cyberagent-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="cyberagent-send-btn"
            >
              {streaming ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
            <button
              onClick={sendSample}
              disabled={streaming || !hasAccess}
              className="cyberagent-sample-btn"
              title="Load a sample port scan request"
            >
              <Globe size={14} />
              <span>Sample</span>
            </button>
          </div>
        </section>
      )}

      <footer className="cyberagent-footer">
        <span>CyberAgent by appfolk</span>
        <Link to="/">Back to appfolk</Link>
      </footer>
    </main>
  );
};

export default CyberAgent;