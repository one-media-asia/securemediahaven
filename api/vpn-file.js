import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');

  const { name, email } = req.query;

  if (!name || !email) {
    return res.status(400).send('Missing name or email');
  }

  try {
    // Look up the customer in Supabase
    const { data: customer, error: dbError } = await supabase
      .from('vpn_customers')
      .select('client_name, config_type, email')
      .eq('email', email.toLowerCase())
      .eq('client_name', name)
      .single();

    if (dbError || !customer) {
      return res.status(404).send('Config not found for this customer');
    }

    // Fetch the actual ovpn content from the EC2 companion API
    const ec2Url = `${process.env.EC2_API_URL || 'http://13.63.238.142:3001'}/config/${name}`;
    const ec2Response = await fetch(ec2Url, {
      headers: { 'X-API-Key': process.env.EC2_API_KEY || '' },
      signal: AbortSignal.timeout(10000),
    });

    if (!ec2Response.ok) {
      console.error('EC2 API error:', ec2Response.status, await ec2Response.text());
      return res.status(502).send('Could not retrieve config from server');
    }

    const ovpnContent = await ec2Response.text();

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${name}.ovpn"`);
    return res.status(200).send(ovpnContent);

  } catch (err) {
    console.error('VPN file error:', err);
    return res.status(500).send('Error retrieving config');
  }
}
