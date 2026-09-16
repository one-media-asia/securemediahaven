export type HostingPlan = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  description: string;
  color: 'coral' | 'blue' | 'lime' | 'yellow' | 'purple';
  badge: 'Launch' | 'Growth' | 'Business' | 'VPN';
  featured?: boolean;
  stripeUrl?: string;
  features: string[];
};

export const hostingPlans: HostingPlan[] = [
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
  {
    name: 'Launch Hosting',
    price: '$29',
    period: '/ month',
    tagline: 'Best for new sites',
    description: 'Fast, secure hosting for small businesses, portfolios, and new launches.',
    color: 'coral',
    badge: 'Launch',
    stripeUrl: import.meta.env.VITE_STRIPE_LAUNCH_HOSTING_URL,
    features: ['1 website', 'Free SSL + CDN', 'Daily backups', '24/7 monitoring', 'Free migration'],
  },
  {
    name: 'Studio Hosting',
    price: '$79',
    period: '/ month',
    tagline: 'Best value for growing brands',
    description: 'Built for client sites, content teams, and fast-moving marketing funnels.',
    color: 'blue',
    badge: 'Growth',
    featured: true,
    stripeUrl: import.meta.env.VITE_STRIPE_STUDIO_HOSTING_URL,
    features: ['Unlimited websites', 'Managed WordPress', 'Free SSL + CDN', 'Daily backups', 'Priority support'],
  },
  {
    name: 'Business Hosting',
    price: '$159',
    period: '/ month',
    tagline: 'Best for high-traffic businesses',
    description: 'Premium performance, stronger security, and hands-on support for serious traffic.',
    color: 'lime',
    badge: 'Business',
    stripeUrl: import.meta.env.VITE_STRIPE_DOMAIN_HOSTING_URL || import.meta.env.VITE_STRIPE_STUDIO_HOSTING_URL,
    features: ['Dedicated resources', 'Advanced WAF', 'Daily backups', 'Staging + dev env', 'White-glove onboarding'],
  },
];
