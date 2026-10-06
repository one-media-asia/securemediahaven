import { describe, expect, it } from 'vitest';
import { hostingCategories } from '../pages/Hosting';
import { hostingPlans } from './hostingPlans';

describe('hostingPlans', () => {
  it('only exposes the active storefront categories', () => {
    expect(hostingCategories).toEqual(['All', 'Launch']);
  });

  it('includes the active hosting products', () => {
    expect(hostingPlans.map((plan) => plan.name)).toEqual(
      expect.arrayContaining(['Launch Hosting'])
    );
    expect(hostingPlans.map((plan) => plan.name)).not.toEqual(
      expect.arrayContaining(['Studio Hosting', 'Business Hosting', 'AWS Ubuntu OpenVPN'])
    );
  });

  it('routes launch hosting to the paid Stripe offer', () => {
    const launchPlan = hostingPlans.find((plan) => plan.name === 'Launch Hosting');

    expect(launchPlan?.price).toBe('$12');
    expect(launchPlan?.period).toBe('/ month');
    expect(launchPlan?.stripeUrl).toBe('https://buy.stripe.com/00w3cvdBS2K6gRe1PN7EQ0b');
  });

  it('includes essentials customers expect from the onboarding offer', () => {
    const features = hostingPlans.flatMap((plan) => plan.features);

    expect(features).toContain('1 starter site');
    expect(features).toContain('Support onboarding');
    expect(hostingPlans.length).toBe(1);
  });
});
