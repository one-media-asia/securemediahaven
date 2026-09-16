import { describe, expect, it } from 'vitest';
import { hostingCategories } from '../pages/Hosting';
import { hostingPlans } from './hostingPlans';

describe('hostingPlans', () => {
  it('only exposes the active storefront categories', () => {
    expect(hostingCategories).toEqual(['All', 'Launch', 'VPN']);
  });

  it('includes the active hosting products', () => {
    expect(hostingPlans.map((plan) => plan.name)).toEqual(
      expect.arrayContaining(['Launch Hosting', 'AWS Ubuntu OpenVPN'])
    );
    expect(hostingPlans.map((plan) => plan.name)).not.toEqual(
      expect.arrayContaining(['Studio Hosting', 'Business Hosting'])
    );
  });

  it('includes a separate VPN product', () => {
    expect(hostingPlans).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'AWS Ubuntu OpenVPN', badge: 'VPN' }),
    ]));
  });

  it('includes essentials customers expect from hosting packages', () => {
    const features = hostingPlans.flatMap((plan) => plan.features);

    expect(features).toContain('Free SSL + CDN');
    expect(features).toContain('Daily backups');
    expect(hostingPlans.length).toBeGreaterThan(1);
  });
});
