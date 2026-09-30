const EXPRESS_PORT = 3001;
const EC2_API_KEY = 'aa6664679b2935f1113e55869bf11c010355bd7521505294';
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { spawnSync } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

function auth(req, res, next) {
  if (req.headers['x-api-key'] !== EC2_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/generate', auth, (req, res) => {
  try {
    const { email, country } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    const configType = country === 'CN' ? 'shadow' : 'standard';
    const clientName = configType === 'shadow' ? 'shadow-' + Date.now() : 'vpn-' + Date.now();

    // Run openvpn-install script via sudo (needs root)
    const result = spawnSync('/usr/bin/sudo', ['/bin/bash', '/tmp/openvpn-install.sh', 'client', 'add', clientName], {
      timeout: 30000,
      encoding: 'utf-8',
    });

    if (result.error) return res.status(500).json({ error: 'Config generation failed' });
    if (result.status !== 0) return res.status(500).json({ error: result.stderr || 'Failed' });

    const ovpnPath = '/home/ubuntu/' + clientName + '.ovpn';
    let content = '';
    try { content = fs.readFileSync(ovpnPath, 'utf-8'); } catch (e) { return res.status(500).json({ error: 'File not found' }); }

    // For shadow (China) configs, switch to TCP/443
    if (configType === 'shadow') {
      content = content.replace(/^proto udp$/m, 'proto tcp')
        .replace(/^remote .*$/m, 'remote 13.63.238.142 443')
        .replace(/^explicit-exit-notify$/m, '');
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="' + clientName + '.ovpn"');
    return res.status(200).send(content);
  } catch (err) {
    return res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/config/:name', auth, (req, res) => {
  const clientName = req.params.name;
  const ovpnPath = '/home/ubuntu/' + clientName + '.ovpn';
  if (!fs.existsSync(ovpnPath)) return res.status(404).json({ error: 'Not found' });
  const content = fs.readFileSync(ovpnPath, 'utf-8');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="' + clientName + '.ovpn"');
  return res.status(200).send(content);
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', port: EXPRESS_PORT }));

app.listen(EXPRESS_PORT, '0.0.0.0', () => console.log('EC2 VPN Companion running on port ' + EXPRESS_PORT));
