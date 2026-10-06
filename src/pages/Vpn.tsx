import { ArrowRight, Shield, Globe, Lock, Download, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Free IP geolocation — returns { country_code } or null
async function detectCountry(): Promise<string | null> {
  try {
    const res = await fetch('https://ip-api.com/json/?fields=countryCode');
    const data = await res.json();
    return data.status === 'success' ? data.countryCode : null;
  } catch {
    return null;
  }
}

const features = [
  { icon: Shield, title: 'Bypass restrictions', desc: 'Access the open internet from anywhere, including networks that block VPN traffic.' },
  { icon: Globe, title: 'China-optimized', desc: 'Trojan over TLS on TCP port 443 for users in China — blends in with normal HTTPS traffic.' },
  { icon: Lock, title: 'Encrypted tunnel', desc: 'WireGuard ChaCha20-Poly1305 encryption. Your traffic stays private between your device and the server.' },
  { icon: Download, title: 'One-time purchase', desc: '12 USD, lifetime access. No subscription. Download your config and connect.' },
];

const countries = [
  'Indonesia', 'China', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines',
  'Singapore', 'India', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong',
];

const VpnPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionUrl, setSessionUrl] = useState('');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [wantShadow, setWantShadow] = useState(false);

  const handlePurchase = async () => {
    if (!email.trim()) {
      setError('Enter your email to continue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/vpn-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          country: wantShadow ? 'CN' : (detectedCountry === 'CN' ? 'CN' : undefined),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      setSessionUrl(data.url);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionUrl) {
      window.location.assign(sessionUrl);
    }
  }, [sessionUrl]);

  return (
    <main className="vpn-page">
      <header className="page-header">
        <Link className="brand" to="/"><span className="brand-mark">O</span>One Media Asia</Link>
        <nav className="page-nav">
          <Link to="/">Apps</Link>
          <Link to="/vpn">VPN</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      <section className="vpn-hero">
        <div className="vpn-badge">
          <Lock size={12} /> Secure tunnel
        </div>
        <h1>WireGuard + Trojan access.<br /><em>One purchase. Lifetime.</em></h1>
        <p className="vpn-sub">
          Connect to our Singapore (AWS ap-southeast-1) VPN server. Your traffic exits
          through a clean IP.
          China users and travelers get the Trojan config (TCP/443) — everyone else gets
          the standard WireGuard config (UDP/1194).
        </p>

        <div className="vpn-card">
          <div className="vpn-card-header">
            <div>
              <span className="vpn-price">$12</span>
              <span className="vpn-period">one time / lifetime</span>
            </div>
            <Shield size={28} className="vpn-icon" />
          </div>

          <div className="vpn-features">
            {features.map((f) => (
              <div className="vpn-feature" key={f.title}>
                <f.icon size={16} />
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="vpn-form"
            onSubmit={(e) => { e.preventDefault(); handlePurchase(); }}
          >
            <div className="form-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="vpn-input"
                disabled={loading || success}
                aria-label="Email address"
              />
              <button
                type="submit"
                className="vpn-buy-btn"
                disabled={loading || success || !email.trim()}
              >
                {loading ? 'Redirecting...' : success ? 'Check your browser' : 'Buy VPN Access'}
                <ArrowRight size={16} />
              </button>
            </div>
            <button
              type="button"
              className="vpn-detect-btn"
              onClick={() => { setDetecting(true); detectCountry().then((c) => { setDetectedCountry(c); setDetecting(false); }).catch(() => setDetecting(false)); }}
              disabled={detecting}
            >
              {detecting ? 'Detecting...' : detectedCountry === 'CN' ? 'China detected — shadow config' : 'Detect my location'}
            </button>
            {detectedCountry === 'CN' && (
              <p className="form-fine" style={{ color: '#f59e0b', marginTop: 4 }}>
                You appear to be in China. We'll give you the shadow config (TCP/443).
              </p>
            )}
            <label className="vpn-shadow-toggle">
              <input
                type="checkbox"
                checked={wantShadow}
                onChange={(e) => setWantShadow(e.target.checked)}
                disabled={loading || success}
              />
              <span>I'm traveling to/from China — use the TCP/443 (shadow) config</span>
            </label>
            {error && <p className="form-error">{error}</p>}
            <p className="form-fine">
              After payment you'll get a download link for your personal VPN config.
            </p>
          </form>
        </div>

        <div className="vpn-geo-note">
          <strong>Works in:</strong>
          <span>{countries.slice(0, 6).join(', ')}</span>
          <span className="vpn-plus">+ more</span>
        </div>
      </section>

      <section className="vpn-how">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <span className="step-num">1</span>
            <div>
              <strong>Buy access</strong>
              <p>12 USD one-time. Stripe handles the payment securely.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <div>
              <strong>Get your config</strong>
              <p>After payment, download your personal config. China? You get the Trojan (TCP/443) config. Others get the WireGuard (UDP/1194) config.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <div>
              <strong>Connect</strong>
              <p>Import the config into WireGuard (standard) or your Trojan/v2ray client (China) and tap connect. Your traffic exits through our server.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="vpn-specs">
        <h2>Server specs</h2>
        <div className="spec-grid">
          <div className="spec"><span>Location</span><strong>AWS ap-southeast-1</strong></div>
          <div className="spec"><span>Standard</span><strong>WireGuard / UDP 1194 / ChaCha20-Poly1305</strong></div>
          <div className="spec"><span>China</span><strong>Trojan / TLS / TCP 443</strong></div>
          <div className="spec"><span>Validity</span><strong>Lifetime</strong></div>
        </div>
      </section>

      <footer className="page-footer">
        <Link className="brand" to="/"><span className="brand-mark">O</span>One Media Asia</Link>
        <div>© One Media Asia</div>
      </footer>
    </main>
  );
};

export default VpnPage;
