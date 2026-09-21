import { Send, Shield, Loader2, Lock, Bot } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CyberAgent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(
    () => sessionStorage.getItem('cyberagent-paid') === 'true'
  );
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setHasAccess(true);
      sessionStorage.setItem('cyberagent-paid', 'true');
      window.history.replaceState({}, '', '/cyberagent');
    }
  }, []);

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const found = cookies.find(c => c.startsWith('cyberagent_paid='));
    if (found) {
      setHasAccess(true);
      sessionStorage.setItem('cyberagent-paid', 'true');
    }
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
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setStreaming(false);
    }
  };

  const checkoutUrl = '/api/cyberagent-checkout';

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
      sessionStorage.setItem('cyberagent-paid', 'true');
    } catch {
      setError('Could not verify owner access');
    }
  };

  const paywall = (
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
        {checkoutUrl ? (
          <button className="cyberagent-unlock-btn"
            onClick={() => window.location.assign(checkoutUrl)}>
            <Lock size={16} /> Unlock with one-time payment
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
          security tools. CyberAgent runs on Claude and knows
          defensive security inside out.
        </p>
      </section>

      {!hasAccess ? (
        paywall
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
