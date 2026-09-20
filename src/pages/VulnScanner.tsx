import { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle, Bug, CheckCircle, XCircle, Loader2, Lock, Eye, Globe, FileCode, CreditCard, Crosshair, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackToolUsage } from '@/lib/clickTracking';

type VulnCategory = 'critical' | 'high' | 'medium' | 'low' | 'info';

type Finding = {
  id: string;
  title: string;
  category: VulnCategory;
  description: string;
  fix?: string;
  icon?: string;
  cwe?: string;
  owasp?: string;
  details?: unknown;
  attackerView?: string;
  tools?: string[];
  validation?: string;
};

type ScanResult = {
  target: string;
  hostname: string;
  scanTime: number;
  findings: Finding[];
  score: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
};

const categoryColors: Record<VulnCategory, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  info: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const categoryLabels: Record<VulnCategory, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
  info: 'INFO',
};

const iconMap: Record<string, typeof Lock> = {
  Lock,
  Shield,
  FileCode,
  Eye,
  Globe,
  AlertTriangle,
};

const VulnScanner = () => {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [scanCount, setScanCount] = useState(() => {
    const stored = localStorage.getItem('vulnscan_count');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [requiresPayment, setRequiresPayment] = useState(false);

  const hasFreeScan = scanCount === 0;

  // Check for successful payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('payment') === 'success' && sessionId) {
      setPaymentStatus('verifying');
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId }),
      }).then((response) => response.json()).then((data) => {
        if (data.valid) {
          setPaymentStatus('success');
          setRequiresPayment(false);
          setScanCount(0);
          localStorage.removeItem('vulnscan_count');
        } else {
          setError('Payment could not be verified. Please contact support.');
        }
      }).catch(() => setError('Could not verify payment. Please try again.')).finally(() => {
        window.history.replaceState({}, '', '/vuln-scan');
      });
    }
  }, []);

  const runScan = async (targetUrl: string) => {
    setError('');
    setScanResult(null);

    let formattedUrl = targetUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError('Invalid URL format');
      return;
    }

    setScanning(true);
    setExpanded([]);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setRequiresPayment(true);
          setScanCount(1);
          localStorage.setItem('vulnscan_count', '1');
        }
        setError(data.error || 'Scan failed');
        setScanning(false);
        return;
      }

      setScanResult(data);
      setScanning(false);
      setRequiresPayment(false);
      trackToolUsage('VulnScan', new URL(formattedUrl).hostname);

      // Increment scan count
      const newCount = scanCount + 1;
      setScanCount(newCount);
      localStorage.setItem('vulnscan_count', newCount.toString());
    } catch {
      setError('Could not connect to scanning service');
      setScanning(false);
    }
  };

  const paymentPrompt = (requiresPayment || !hasFreeScan) && (
    <div className="vulnscan-paywall">
      <CreditCard size={20} />
      <div className="vulnscan-paywall-text">
        <strong>Want to scan another site?</strong>
        <span>One-time payment unlocks unlimited scans.</span>
      </div>
      <button className="vulnscan-unlock-btn" onClick={handleCheckout} disabled={paymentStatus === 'verifying'}>
        <CreditCard size={16} /> {paymentStatus === 'verifying' ? 'Verifying...' : 'Pay $19.99'}
      </button>
      <button className="vulnscan-owner-btn" onClick={handleOwnerUnlock}>Owner access</button>
    </div>
  );

  const startScan = () => {
    if (!url.trim()) {
      setError('Please enter a URL to scan');
      return;
    }
    if (!hasFreeScan && paymentStatus !== 'success') {
      setRequiresPayment(true);
      setError('Your free scan has been used. Pay to scan another site.');
      return;
    }
    runScan(url);
  };

  const toggleExpanded = (id: string) => {
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  async function handleCheckout() {
    setError('');
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        setError(data.error || 'Failed to start checkout');
      }
    } catch {
      setError('Could not connect to payment service');
    }
  }

  async function handleOwnerUnlock() {
    const key = window.prompt('Enter your owner access key');
    if (!key) return;

    setError('');
    try {
      const response = await fetch('/api/admin-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key }),
      });
      const data = await response.json();
      if (!response.ok || !data.valid) {
        setError(data.error || 'Owner access denied');
        return;
      }

      setPaymentStatus('success');
      setRequiresPayment(false);
      setScanCount(0);
      localStorage.removeItem('vulnscan_count');
    } catch {
      setError('Could not verify owner access');
    }
  }

  return (
    <main className="vulnscan-page">
      <header className="vulnscan-header">
        <Link className="vulnscan-back" to="/">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          appfolk
        </Link>
        <div className="vulnscan-logo">
          <Shield size={18} /> VulnScan
        </div>
      </header>

      <section className="vulnscan-hero">
        <p className="eyebrow">Security scanning tool</p>
        <h1>Know your<br/><em>attack surface.</em></h1>
        <p className="vulnscan-intro">Real passive analysis. First scan free. See headers, SSL, exposed paths, and misconfigurations the way an attacker would look.</p>
        {hasFreeScan && (
          <p className="vulnscan-free-badge"><span>1 free scan</span> — no signup required</p>
        )}
      </section>

      <section className="vulnscan-input-section">
        <div className="vulnscan-input-row">
          <div className="vulnscan-input-wrap">
            <Search size={18} className="vulnscan-search-icon" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startScan()}
              placeholder="Enter a domain to scan (e.g., example.com)"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <button
            className="vulnscan-scan-btn"
            onClick={startScan}
            disabled={scanning || !url.trim() || (!hasFreeScan && paymentStatus !== 'success')}
          >
            {scanning ? <><Loader2 size={16} className="spin" /> Scanning...</> : <><Shield size={16} /> Scan</>}
          </button>
        </div>
        <p className="vulnscan-input-help">Enter a domain like example.com. You do not need to type https://</p>
        {error && <div className="vulnscan-error">{error}</div>}
        {requiresPayment && paymentPrompt}
      </section>

      {scanning && (
        <div className="vulnscan-loading">
          <div className="vulnscan-loading-spinner" />
          <p>Analyzing attack surface...</p>
          <div className="vulnscan-loading-steps">
            <span className="active">DNS resolution</span>
            <span>HTTP headers</span>
            <span>Security headers</span>
            <span>Exposed paths</span>
            <span>Technology detection</span>
          </div>
        </div>
      )}

      {scanResult && (
        <section className="vulnscan-results">
          <div className="vulnscan-summary">
            <div className="vulnscan-score-card">
              <div className={`vulnscan-score ${scanResult.score >= 50 ? 'critical' : scanResult.score >= 25 ? 'high' : scanResult.score >= 10 ? 'medium' : 'low'}`}>
                {scanResult.score}
              </div>
              <div className="vulnscan-score-label">
                <span>Threat Score</span>
                <span className="vulnscan-score-sub">
                  {scanResult.score >= 50 ? 'Critical risk' : scanResult.score >= 25 ? 'High risk' : scanResult.score >= 10 ? 'Medium risk' : 'Low risk'}
                </span>
              </div>
            </div>
            <div className="vulnscan-stats">
              <div className="vulnscan-stat critical">
                <span className="vulnscan-stat-num">{scanResult.summary.critical}</span>
                <span className="vulnscan-stat-label">Critical</span>
              </div>
              <div className="vulnscan-stat high">
                <span className="vulnscan-stat-num">{scanResult.summary.high}</span>
                <span className="vulnscan-stat-label">High</span>
              </div>
              <div className="vulnscan-stat medium">
                <span className="vulnscan-stat-num">{scanResult.summary.medium}</span>
                <span className="vulnscan-stat-label">Medium</span>
              </div>
              <div className="vulnscan-stat low">
                <span className="vulnscan-stat-num">{scanResult.summary.low}</span>
                <span className="vulnscan-stat-label">Low</span>
              </div>
            </div>
          </div>

          <div className="vulnscan-findings">
            <p className="vulnscan-findings-help">Click a scan result to see how to fix it and how a bad actor would see it.</p>
            {scanResult.findings
              .sort((a, b) => {
                const order: Record<VulnCategory, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                return order[a.category] - order[b.category];
              })
              .map((finding) => {
                const IconComp = finding.icon ? iconMap[finding.icon] || Shield : Shield;
                const isExpanded = expanded.includes(finding.id);
                return (
                  <div key={finding.id} className={`vulnscan-finding ${isExpanded ? 'expanded' : ''}`}>
                    <button className="vulnscan-finding-head" onClick={() => toggleExpanded(finding.id)}>
                      <div className="vulnscan-finding-left">
                        <span className={`vulnscan-finding-icon ${finding.category}`}>
                          <IconComp size={16} />
                        </span>
                        <span className="vulnscan-finding-title">{finding.title}</span>
                        {finding.cwe && <span className="vulnscan-finding-cve">{finding.cwe}</span>}
                      </div>
                      <span className={`vulnscan-finding-badge ${categoryColors[finding.category]}`}>
                        {categoryLabels[finding.category]}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="vulnscan-finding-body">
                        <div className="vulnscan-finding-section">
                          <h4><AlertTriangle size={14} /> Description</h4>
                          <p>{finding.description}</p>
                        </div>
                        {finding.attackerView && (
                          <div className="vulnscan-finding-section exploit">
                            <h4><Crosshair size={14} /> Attacker view</h4>
                            <p>{finding.attackerView}</p>
                            {finding.tools && (
                              <div className="vulnscan-tools">
                                <strong><Wrench size={13} /> Common tools</strong>
                                <span>{finding.tools.join(' / ')}</span>
                              </div>
                            )}
                            {finding.validation && (
                              <p className="vulnscan-validation"><strong>Safe validation:</strong> {finding.validation}</p>
                            )}
                          </div>
                        )}
                        {finding.fix && (
                          <div className="vulnscan-finding-section fix">
                            <h4><CheckCircle size={14} /> How to fix</h4>
                            <p>{finding.fix}</p>
                            {finding.owasp && <span className="vulnscan-owasp">{finding.owasp}</span>}
                          </div>
                        )}
                        {finding.details && (
                          <div className="vulnscan-finding-section">
                            <h4><FileCode size={14} /> Details</h4>
                            <pre className="vulnscan-details">
                              {typeof finding.details === 'string'
                                ? finding.details
                                : JSON.stringify(finding.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="vulnscan-meta">
            Scanned {scanResult.target} in {scanResult.scanTime}ms
          </div>

          {/* Paywall for subsequent scans */}
          {!hasFreeScan && paymentPrompt}

          <div className="vulnscan-disclaimer">
            <XCircle size={16} />
            <p>This is a passive scanner. It only examines publicly visible data (headers, DNS, common paths) without sending any exploits.</p>
          </div>
        </section>
      )}
    </main>
  );
};

export default VulnScanner;
