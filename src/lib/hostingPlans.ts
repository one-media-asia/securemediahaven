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
    price: '$12',
    period: '/ month',
    tagline: 'Start managed hosting',
    description: 'Launch a managed hosting slot for lawful, privacy-first projects and early testing.',
    color: 'coral',
    badge: 'Launch',
    stripeUrl: 'https://buy.stripe.com/00w3cvdBS2K6gRe1PN7EQ0b',
    features: ['1 starter site', 'Tor-ready setup guidance', 'Basic monitoring', 'Support onboarding', 'Monthly billing'],
  },
  {
    name: 'AWS Ubuntu OpenVPN',
    price: '$12',
    period: ' one time',
    tagline: 'Best for self-hosted VPNs',
    description: 'A guided OpenVPN deployment for an Ubuntu server on AWS EC2, with practical hardening and client setup.',
    color: 'purple',
    badge: 'VPN',
    stripeUrl: '/vpn',
    features: ['Ubuntu on AWS EC2', 'OpenVPN server setup', 'Security group checklist', 'Client profile tutorial', 'Private support'],
  },
];
