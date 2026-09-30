import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const EC2_API_KEY = process.env.EC2_API_KEY || 'dev-key-change-in-prod';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // Auth check
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== EC2_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // POST /generate — generate a new VPN config for a customer
    if (req.method === 'POST') {
      const { email, country } = req.body || {};

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Determine config type based on country
      const configType = country === 'CN' ? 'shadow' : 'standard';
      const clientName = configType === 'shadow' ? `shadow-${Date.now()}` : `client-${Date.now()}`;

      // NOTE: In production, this would call the openvpn-install script
      // or use easyrsa to generate a new client cert and build the ovpn file.
      // For now, we return a template that will be filled in by the actual
      // OpenVPN server's existing CA/cert infrastructure.

      // Mark as pending — the actual ovpn content will be fetched via /config/:name
      const { error: dbError } = await supabase
        .from('vpn_customers')
        .upsert({
          email: email.toLowerCase(),
          config_type: configType,
          client_name: clientName,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

      if (dbError) {
        console.error('DB error:', dbError);
        return res.status(500).json({ error: 'Database error' });
      }

      return res.status(200).json({
        client_name: clientName,
        config_type,
        message: 'Config generated. Download via /config/' + clientName,
      });
    }

    // GET /config/:name — serve the ovpn file content
    if (req.method === 'GET') {
      const urlParts = req.url.split('/');
      const clientName = urlParts[urlParts.length - 1];

      if (!clientName) {
        return res.status(400).json({ error: 'Client name required' });
      }

      // Look up the customer by client_name
      const { data, error: dbError } = await supabase
        .from('vpn_customers')
        .select('email, config_type')
        .eq('client_name', clientName)
        .single();

      if (dbError || !data) {
        return res.status(404).json({ error: 'Config not found' });
      }

      // Generate the ovpn content
      // In production, this reads from /home/ubuntu/<clientName>.ovpn
      // or generates it using the openvpn-install script.
      const ovpnContent = generateOvpnContent(clientName, data.config_type);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${clientName}.ovpn"`);
      return res.status(200).send(ovpnContent);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('EC2 API error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

function generateOvpnContent(clientName, configType) {
  const proto = configType === 'shadow' ? 'tcp' : 'udp';
  const port = configType === 'shadow' ? '443' : '1194';

  // In production, read the actual cert/key from the OpenVPN server's
  // easyrsa pki directory and embed them here.
  return `client
proto ${proto}
explicit-exit-notify
remote 13.63.238.142 ${port}
dev tun
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
auth SHA256
auth-nocache
cipher AES-128-GCM
data-ciphers AES-128-GCM
ncp-ciphers AES-128-GCM
tls-client
tls-version-min 1.2
verb 3
<ca>
# CA certificate — insert from /etc/openvpn/server/pki/ca.crt
</ca>
<cert>
# Client certificate — insert from easyrsa build-client-full ${clientName}
</cert>
<key>
# Client private key — insert from easyrsa
</key>
<tls-crypt-v2>
# tls-crypt-v2 client key
</tls-crypt-v2>
`;
}
