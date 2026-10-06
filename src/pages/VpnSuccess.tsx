import { Check, Download, Shield, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const VpnSuccess = () => {
  const [configReady, setConfigReady] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configType, setConfigType] = useState('standard');
  const [email, setEmail] = useState('');
  // Retained from the URL so the config download can prove payment server-side.
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fileExt = configType === 'shadow' ? 'json' : 'conf';
  const downloadName = `${configName}.${fileExt}`;

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
          Download your personal config below. Import it into the matching client and you're connected.
        </p>
      </section>

      <section className="config-section">
        <div className="config-card">
          <div className="config-header">
            <Shield size={24} />
            <div>
              <strong>{downloadName}</strong>
              <span className="config-type">
                {configType === 'shadow' ? 'China-optimized (TCP/443)' : 'Standard WireGuard (UDP/1194)'}
              </span>
            </div>
          </div>

          <a
            className="download-btn"
            href={`/api/vpn-file?name=${encodeURIComponent(configName)}&email=${encodeURIComponent(email)}&session_id=${encodeURIComponent(sessionId)}`}
            download={downloadName}
          >
            <Download size={20} />
            Download {downloadName}
          </a>

          <div className="config-instructions">
            <h3>How to install — pick your device</h3>

            {configType === 'shadow' ? (
              <>
                <p className="config-tip" style={{ marginBottom: 16 }}>
                  This is a <strong>Trojan</strong> config. Use a v2ray/Trojan client
                  (v2rayNG on Android, Shadowrocket/FairVPN on iOS, v2rayN on Windows,
                  or the official <code className="code-inline">v2ray</code> core on Linux).
                </p>
                <div className="install-platform">
                  <h4>Android</h4>
                  <ol>
                    <li>Install <strong>v2rayNG</strong> from the Play Store</li>
                    <li>Copy your <code className="code-inline">{downloadName}</code> file to the device</li>
                    <li>Open v2rayNG → menu → <strong>Import Config From Clipboard / File</strong></li>
                    <li>Tap the config → <strong>connect</strong> button (bottom-right)</li>
                  </ol>
                </div>
                <div className="install-platform">
                  <h4>iOS / iPhone / iPad</h4>
                  <ol>
                    <li>Install <strong>Shadowrocket</strong> or another v2ray-compatible client from the App Store</li>
                    <li>Import your <code className="code-inline">{downloadName}</code> config</li>
                    <li>Select the config and enable the tunnel</li>
                    <li>Accept when iOS asks for VPN permission</li>
                  </ol>
                </div>
                <div className="install-platform">
                  <h4>Windows</h4>
                  <ol>
                    <li>Install <strong>v2rayN</strong> from GitHub releases</li>
                    <li>File → <strong>Import Config</strong> → choose your <code className="code-inline">{downloadName}</code></li>
                    <li>Right-click the server list → <strong>Select Server</strong> → enable system proxy</li>
                  </ol>
                </div>
                <div className="install-platform">
                  <h4>macOS</h4>
                  <ol>
                    <li>Install <strong>v2rayX</strong> or <strong>V2rayU</strong> from GitHub</li>
                    <li>Import your <code className="code-inline">{downloadName}</code> config</li>
                    <li>Start the client and set a system-level HTTP/SOCKS proxy to the local port it prints</li>
                  </ol>
                </div>
                <div className="install-platform">
                  <h4>Linux / Terminal</h4>
                  <ol>
                    <li>Install v2ray: <code>sudo apt install v2ray</code> (Ubuntu/Debian) or <code>brew install v2ray-core</code> (macOS)</li>
                    <li>Place the config at <code>~/.config/v2ray/config.json</code></li>
                    <li>Run <code>v2ray run -config ~/.config/v2ray/config.json</code></li>
                    <li>Point your browser at SOCKS <code>127.0.0.1:10808</code> (or the HTTP port 10809)</li>
                    <li>Verify: <code>curl --socks5 127.0.0.1:10808 ifconfig.me</code> — should show <code>13.250.50.221</code></li>
                    <li>To stop: press <code>Ctrl+C</code></li>
                  </ol>
                </div>
              </>
            ) : (
              <>
                <div className="install-platform">
                  <h4>Android</h4>
                  <ol>
                    <li>Install <strong>WireGuard</strong> from the Play Store</li>
                    <li>Download your <code className="code-inline">{downloadName}</code> file above</li>
                    <li>Open the app → tap <strong>+</strong> → <strong>Import from file</strong> → choose the .conf</li>
                    <li>Tap the tunnel → <strong>Connect</strong></li>
                  </ol>
                </div>
                <div className="install-platform">
                  <h4>iOS / iPhone / iPad</h4>
                  <ol>
                    <li>Install <strong>WireGuard</strong> from the App Store</li>
                    <li>Download your <code className="code-inline">{downloadName}</code> file above</li>
                    <li>Open the app → <strong>+</strong> → <strong>Import from file or archive</strong></li>
                    <li>Select the .conf from Files</li>
                    <li>Tap the tunnel → <strong>Connect</strong></li>
                    <li>Accept when iOS asks for VPN permission</li>
                  </ol>
                </div>
                <div className="install-platform">
                  <h4>Windows</h4>
                  <ol>
                    <li>Install the <strong>WireGuard</strong> app from wireguard.com</li>
                    <li>Download your <code className="code-inline">{downloadName}</code> file above</li>
                    <li>Open the app → <strong>Import tunnel(s) from file</strong> → select the file</li>
                    <li>Click <strong>Activate</strong> on the tunnel</li>
                    <li>Traffic now exits through our AWS ap-southeast-1 server</li>
                  </ol>
                </div>
                <div className="install-platform">
                  <h4>macOS</h4>
                  <ol>
                    <li>Install <strong>WireGuard</strong> from the App Store or wireguard.com</li>
                    <li>Download your <code className="code-inline">{downloadName}</code> file above</li>
                    <li>Open the app → <strong>Import tunnel(s) from file</strong></li>
                    <li>Click <strong>Activate</strong></li>
                    <li>Allow the system extension when macOS prompts</li>
                  </ol>
                </div>
                <div className="install-platform">
                  <h4>Linux / Terminal</h4>
                  <ol>
                    <li>Install WireGuard: <code>sudo apt install wireguard</code> (Ubuntu/Debian) or <code>brew install wireguard-tools</code> (macOS)</li>
                    <li>Download your <code className="code-inline">{downloadName}</code> file above</li>
                    <li>Connect: <code>sudo wg-quick up ~/Downloads/{configName}.conf</code></li>
                    <li>Verify: in another terminal run <code>curl ifconfig.me</code> — should show <code>13.250.50.221</code></li>
                    <li>To stop: press <code>sudo wg-quick down ~/Downloads/{configName}.conf</code></li>
                  </ol>
                </div>
              </>
            )}

            <p className="config-tip">
              Keep this page bookmarked. You can always come back to re-download your config.
            </p>
          </div>
        </div>
      </section>

      <footer className="success-footer">
        One Media Asia VPN <span>$12 one time</span>
      </footer>
    </main>
  );
};

export default VpnSuccess;
