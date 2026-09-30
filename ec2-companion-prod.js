const EXPRESS_PORT = 3001;
const EC2_API_KEY = 'aa6664679b2935f1113e55869bf11c010355bd7521505294';
const SUPABASE_URL = 'https://smjgszoyptldwhacsyst.supabase.co';
const SUPABASE_SERVICE_KEY = '';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

function auth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== EC2_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// POST /generate — generate a new VPN client config
app.post('/generate', auth, async (req, res) => {
  try {
    const { email, country } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const configType = country === 'CN' ? 'shadow' : 'standard';
    const clientName = configType === 'shadow'
      ? `shadow-${Date.now()}`
      : `vpn-${Date.now()}`;

    // Shadow (China) — return V2Ray/VMess config for Trojan+V2Ray chain
    if (configType === 'shadow') {
      const v2rayConfig = JSON.stringify({
        outbounds: [{
          protocol: 'vmess',
          settings: {
            vnext: [{
              address: '13.53.46.104',
              port: 443,
              users: [{
                id: 'f3750834-f4b8-9bea-b174-a3bee7c62615',
                alterId: 0,
                security: 'none'
              }]
            }]
          },
          streamSettings: {
            network: 'tcp',
            security: 'tls',
            tlsSettings: {
              serverName: 'trojan.aws',
              allowInsecure: true
            }
          }
        }]
      }, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="shadow-config.json"');
      return res.status(200).send(v2rayConfig);
    }

    // Standard — generate OpenVPN client config
    const genResult = spawnSync('/bin/bash', [
      '-c',
      `sudo /tmp/openvpn-install.sh client add ${clientName}`,
    ], {
      timeout: 30000,
      encoding: 'utf-8',
    });

    if (genResult.error) {
      console.error('openvpn-install error:', genResult.error);
      return res.status(500).json({ error: 'Config generation failed' });
    }

    if (genResult.status !== 0) {
      console.error('openvpn-install exited with status:', genResult.status);
      console.error(genResult.stderr);
      return res.status(500).json({ error: 'Config generation failed: ' + (genResult.stderr || 'unknown') });
    }

    const ovpnPath = `/home/ubuntu/${clientName}.ovpn`;
    let ovpnContent = '';

    try {
      ovpnContent = fs.readFileSync(ovpnPath, 'utf-8');
    } catch (readErr) {
      console.error('Could not read ovpn file:', readErr);
      return res.status(500).json({ error: 'Generated config not found at ' + ovpnPath });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${clientName}.ovpn"`);
    return res.status(200).send(ovpnContent);

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// GET /config/:name — serve an existing ovpn file
app.get('/config/:name', auth, (req, res) => {
  try {
    const clientName = req.params.name;
    const ovpnPath = `/home/ubuntu/${clientName}.ovpn`;

    if (!fs.existsSync(ovpnPath)) {
      return res.status(404).json({ error: 'Config not found' });
    }

    const content = fs.readFileSync(ovpnPath, 'utf-8');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${clientName}.ovpn"`);
    return res.status(200).send(content);
  } catch (err) {
    console.error('Config serve error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// GET /health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', port: EXPRESS_PORT });
});

app.listen(EXPRESS_PORT, '0.0.0.0', () => {
  console.log(`EC2 VPN Companion API running on port ${EXPRESS_PORT}`);
});
