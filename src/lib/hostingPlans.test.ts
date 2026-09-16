import { describe, expect, it } from 'vitest';
import { hostingPlans } from './hostingPlans';

describe('hostingPlans', () => {
  it('includes the main hosting tiers', () => {
    expect(hostingPlans.map((plan) => plan.name)).toEqual(
      expect.arrayContaining(['Launch Hosting', 'Studio Hosting', 'Business Hosting'])
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
