import { Check, Download, Shield, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const VpnSuccess = () => {
  const [configReady, setConfigReady] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configType, setConfigType] = useState('standard');
  const [email, setEmail] = useState('');
  // Retained from the URL so the .ovpn download can prove payment server-side.
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Strip session_id from the address bar once it has been captured; it is a
  // bearer-ish credential that should not linger in history or leak via Referer.
  useEffect(() => {
    if (!sessionId) return;
    window.history.replaceState({}, '', window.location.pathname);
  }, [sessionId]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        const emailParam = params.get('email');

        if (emailParam) setEmail(emailParam);
        setSessionId(sessionId);

        if (!sessionId) {
          setError('No session found. Please purchase from the VPN page.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/vpn-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, email: emailParam || '' }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Could not get config');
        }

        setConfigName(data.client_name || data.config_type || 'shadow');
        setConfigType(data.config_type || 'standard');
        setConfigReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load config.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <main className="success-page">
        <div className="success-hero">
          <div className="success-check"><Shield size={30} /></div>
          <h1>Preparing your config...</h1>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="success-page">
        <div className="success-hero">
          <div className="success-check" style={{ color: 'red' }}><LockKeyhole size={30} /></div>
          <h1>Something went wrong</h1>
          <p className="vpn-error">{error}</p>
          <Link className="button" to="/vpn">Back to VPN</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="success-page">
      <header className="success-header">
        <Link className="success-brand" to="/"><span className="brand-mark">O</span>One Media Asia</Link>
        <span className="success-secure"><LockKeyhole size={14} /> Secure VPN</span>
      </header>

      <section className="success-hero">
        <div className="success-check"><Check size={30} /></div>
        <p className="eyebrow">Payment confirmed</p>
        <h1>Your VPN config is ready.</h1>
        <p className="success-sub">
          Download your personal .ovpn file below. Import it into OpenVPN Connect and you're connected.
        </p>
      </section>

      <section className="config-section">
        <div className="config-card">
          <div className="config-header">
            <Shield size={24} />
            <div>
              <strong>{configName}.ovpn</strong>
              <span className="config-type">
                {configType === 'shadow' ? 'China-optimized (TCP/443)' : 'Standard (UDP/1194)'}
              </span>
            </div>
          </div>

          <a
            className="download-btn"
            href={`/api/vpn-file?name=${encodeURIComponent(configName)}&email=${encodeURIComponent(email)}&session_id=${encodeURIComponent(sessionId)}`}
            download={`${configName}.ovpn`}
          >
            <Download size={20} />
            Download {configName}.ovpn
          </a>

          <div className="config-instructions">
            <h3>How to install — pick your device</h3>

            <div className="install-platform">
              <h4>Android</h4>
              <ol>
                <li>Install <strong>OpenVPN Connect</strong> from the Play Store</li>
                <li>Download your <code className="code-inline">{configName}.ovpn</code> file above</li>
                <li>Open the app → tap <strong>Import</strong> → choose the .ovpn file</li>
                <li>Tap the profile → <strong>Connect</strong></li>
                <li>Accept the connection request when prompted</li>
              </ol>
            </div>

            <div className="install-platform">
              <h4>iOS / iPhone / iPad</h4>
              <ol>
                <li>Install <strong>OpenVPN Connect</strong> from the App Store</li>
                <li>Download your <code className="code-inline">{configName}.ovpn</code> file above</li>
                <li>Open the app → <strong>Internet</strong> tab → <strong>Import</strong></li>
                <li>Select the .ovpn file from Files</li>
                <li>Tap the profile → <strong>Connect</strong></li>
                <li>Accept when iOS asks for VPN permission</li>
              </ol>
            </div>

            <div className="install-platform">
              <h4>Windows</h4>
              <ol>
                <li>Install <strong>OpenVPN Connect</strong> for Windows from openvpn.net</li>
                <li>Download your <code className="code-inline">{configName}.ovpn</code> file above</li>
                <li>Open the app → <strong>Profile</strong> → <strong>Import</strong> → select the file</li>
                <li>Click <strong>Connect</strong> on the profile</li>
                <li>Traffic now exits through our AWS eu-north-1 server</li>
              </ol>
            </div>

            <div className="install-platform">
              <h4>macOS</h4>
              <ol>
                <li>Install <strong>OpenVPN Connect</strong> for macOS from openvpn.net</li>
                <li>Download your <code className="code-inline">{configName}.ovpn</code> file above</li>
                <li>Open the app → <strong>Profile</strong> → <strong>Import</strong> → select the file</li>
                <li>Click <strong>Connect</strong> on the profile</li>
                <li>Allow the network extension when macOS prompts</li>
              </ol>
            </div>

            <div className="install-platform">
              <h4>Linux / Terminal</h4>
              <ol>
                <li>Install OpenVPN: <code>sudo apt install openvpn</code> (Ubuntu/Debian) or <code>brew install openvpn</code> (macOS)</li>
                <li>Download your <code className="code-inline">{configName}.ovpn</code> file above</li>
                <li>Connect: <code>sudo openvpn --config ~/Downloads/{configName}.ovpn</code></li>
                <li>Verify: in another terminal run <code>curl ifconfig.me</code> — should show <code>13.63.238.142</code></li>
                <li>To stop: press <code>Ctrl+C</code> in the OpenVPN terminal</li>
              </ol>
            </div>

            <p className="config-tip">
              All platforms use the same <code className="code-inline">.ovpn</code> file. The app handles the rest.
            </p>
          </div>
        </div>
      </section>

      <section className="success-note">
        <p>Keep this page bookmarked. You can always come back to re-download your config.</p>
      </section>

      <footer className="success-footer">
        One Media Asia VPN <span>$12 one time</span>
      </footer>
    </main>
  );
};

export default VpnSuccess;
