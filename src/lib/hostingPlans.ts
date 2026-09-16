export type HostingPlan = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  description: string;
  color: 'coral' | 'blue' | 'lime' | 'yellow' | 'purple';
  badge: 'Launch' | 'VPN';
  featured?: boolean;
  stripeUrl?: string;
  features: string[];
};

export const hostingPlans: HostingPlan[] = [
  {
    name: 'Launch Hosting',
    price: 'Free',
    period: '',
    tagline: 'Request access for free',
    description: 'Apply for a free launch hosting slot for lawful, privacy-first projects and early testing.',
    color: 'coral',
    badge: 'Launch',
    features: ['1 free starter site', 'Tor-ready setup guidance', 'Basic monitoring', 'Support onboarding', 'No upfront payment'],
  },
  {
    name: 'AWS Ubuntu OpenVPN',
    price: '$9',
    period: '/ month',
    tagline: 'Best for self-hosted VPNs',
    description: 'A guided OpenVPN deployment for an Ubuntu server on AWS EC2, with practical hardening and client setup.',
    color: 'purple',
    badge: 'VPN',
    stripeUrl: import.meta.env.VITE_STRIPE_VPN_URL,
    features: ['Ubuntu on AWS EC2', 'OpenVPN server setup', 'Security group checklist', 'Client profile tutorial', 'Private support'],
  },
];
