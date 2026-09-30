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

// POST /generate — create a new VPN config, return { client_name }
app.post('/generate', auth, (req, res) => {
  try {
    const { email, country } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    const configType = country === 'CN' ? 'shadow' : 'standard';
    const clientName = configType === 'shadow' ? 'shadow-' + Date.now() : 'vpn-' + Date.now();

    // Run openvpn-install script as root (creates /home/ubuntu/<name>.ovpn)
    const result = spawnSync('/usr/bin/sudo', ['/bin/bash', '/tmp/openvpn-install.sh', 'client', 'add', clientName], {
      timeout: 60000,
      encoding: 'utf-8',
    });

    if (result.error) {
      console.error('Spawn error:', result.error.message);
      return res.status(500).json({ error: 'Config generation failed: ' + result.error.message });
    }
    if (result.status !== 0) {
      console.error('Script stderr:', result.stderr);
      return res.status(500).json({ error: 'Config generation failed: ' + (result.stderr || 'unknown') });
    }

    // Verify the file was created
    const ovpnPath = '/home/ubuntu/' + clientName + '.ovpn';
    if (!fs.existsSync(ovpnPath)) {
      return res.status(500).json({ error: 'Config file not created at ' + ovpnPath });
    }

    // For shadow (China) configs, fix protocol and port in the saved file
    if (configType === 'shadow') {
      let content = fs.readFileSync(ovpnPath, 'utf-8');
      content = content
        .replace(/^proto udp$/m, 'proto tcp')
        .replace(/^remote .*$/m, 'remote 13.63.238.142 443')
        .replace(/^explicit-exit-notify$/m, '');
      fs.writeFileSync(ovpnPath, content);
    }

    console.log('Generated config for', email, ':', clientName);
    return res.status(200).json({ client_name: clientName, config_type: configType });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// GET /config/:name — serve the ovpn file
app.get('/config/:name', auth, (req, res) => {
  try {
    const clientName = req.params.name;
    const ovpnPath = '/home/ubuntu/' + clientName + '.ovpn';

    if (!fs.existsSync(ovpnPath)) {
      console.log('Config not found:', ovpnPath);
      return res.status(404).json({ error: 'Config not found' });
    }

    const content = fs.readFileSync(ovpnPath, 'utf-8');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="' + clientName + '.ovpn"');
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
  console.log('EC2 VPN Companion running on port ' + EXPRESS_PORT);
});
