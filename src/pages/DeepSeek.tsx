import { Send, Loader2, Shield, Zap, Lock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DeepSeekPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(
    () => sessionStorage.getItem('deepseek-paid') === 'true'
  );
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setHasAccess(true);
      sessionStorage.setItem('deepseek-paid', 'true');
      window.history.replaceState({}, '', '/deepseek');
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

  const checkoutUrl = '/api/deepseek-checkout';

  const paywall = (
    <div className="deepseek-paywall">
      <div className="deepseek-paywall-content">
        <Zap size={32} />
        <h2>DeepSeek Locked</h2>
        <p>
          Fast, capable AI inference powered by DeepSeek.
          Ask questions, get code, debug, and explore ideas.
        </p>
        <ul className="deepseek-features">
          <li><span><Shield size={14} /></span>Code generation & debugging</li>
          <li><span><Shield size={14} /></span>Fast response times</li>
          <li><span><Shield size={14} /></span>General knowledge & analysis</li>
        </ul>
        {checkoutUrl ? (
          <button className="deepseek-unlock-btn"
            onClick={() => window.location.assign(checkoutUrl)}>
            <Lock size={16} /> Unlock with one-time payment
          </button>
        ) : (
          <button className="deepseek-unlock-btn" disabled>
            Checkout unavailable
          </button>
        )}
      </div>
    </div>
  );

  return (
    <main className="deepseek-page">
      <header className="deepseek-header">
        <Link className="deepseek-back" to="/">
          <span>D</span> appfolk
        </Link>
        <div className="deepseek-logo">
          <Zap size={18} /> DeepSeek
        </div>
        <span className="deepseek-badge">
          {hasAccess ? 'Active' : 'Locked'}
        </span>
      </header>

      <section className="deepseek-hero">
        <p className="eyebrow">AI assistant</p>
        <h1>
          Fast.<br />
          <em>Capable.</em>
        </h1>
        <p>
          DeepSeek delivers strong general-purpose AI — code, reasoning,
          and conversation — at a fraction of the cost of frontier models.
        </p>
        <p className="deepseek-usage">
          Powered by DeepSeek API
        </p>
      </section>

      {!hasAccess ? (
        paywall
      ) : (
        <section className="deepseek-chat">
          <div className="deepseek-messages">
            {messages.length === 0 ? (
              <div className="deepseek-welcome">
                <Zap size={28} />
                <h3>How can I help?</h3>
                <p>Try questions like:</p>
                <ul>
                  <li>"Explain how a port scanner works"</li>
                  <li>"Write a Python script to check if a port is open"</li>
                  <li>"What is the difference between TCP and UDP?"</li>
                  <li>"How do I secure a Node.js API?"</li>
                </ul>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`deepseek-message ${msg.role}`}
                >
                  <div className="deepseek-message-head">
                    {msg.role === 'assistant' ? (
                      <>
                        <Zap size={14} />
                        <span>DeepSeek</span>
                      </>
                    ) : (
                      <>
                        <Shield size={14} />
                        <span>You</span>
                      </>
                    )}
                  </div>
                  <div className="deepseek-message-body">
                    {msg.content.split('\n').map((para, j) => (
                      <p key={j}>{para}</p>
                    ))}
                  </div>
                </div>
              ))
            )}
            {streaming && (
              <div className="deepseek-message assistant">
                <div className="deepseek-message-head">
                  <Zap size={14} />
                  <span>DeepSeek</span>
                </div>
                <div className="deepseek-message-body">
                  <Loader2 size={14} className="spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="deepseek-error">
                <span className="deepseek-error-icon">!</span>
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="deepseek-input-row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask DeepSeek anything..."
              rows={2}
              disabled={streaming}
              className="deepseek-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="deepseek-send-btn"
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

      <footer className="deepseek-footer">
        <span>DeepSeek by appfolk</span>
        <Link to="/">Back to appfolk</Link>
      </footer>
    </main>
  );
};

export default DeepSeekPage;