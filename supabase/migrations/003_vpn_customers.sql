-- VPN customers table
CREATE TABLE IF NOT EXISTS public.vpn_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT,
  stripe_payment_id TEXT,
  config_type TEXT NOT NULL DEFAULT 'standard', -- 'standard' or 'shadow'
  client_name TEXT, -- OpenVPN client CN
  ovpn_content TEXT, -- base64 or path reference
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vpn_customers_email ON public.vpn_customers(email);
CREATE INDEX IF NOT EXISTS idx_vpn_customers_stripe_session ON public.vpn_customers(stripe_session_id);
