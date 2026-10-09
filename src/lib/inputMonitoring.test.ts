import { beforeEach, describe, expect, it } from 'vitest';
import { captureInputActivity, clearInputActivity, getInputActivity } from './inputMonitoring';

describe('inputMonitoring', () => {
  beforeEach(() => {
    clearInputActivity();
  });

  it('stores typed entries with the page and field label', () => {
    captureInputActivity({
      page: '/vaultline',
      field: 'email',
      label: 'Email address',
      value: 'hello@example.com',
    });

    const entries = getInputActivity();
    expect(entries).toHaveLength(1);
    expect(entries[0].page).toBe('/vaultline');
    expect(entries[0].field).toBe('email');
    expect(entries[0].value).toBe('hello@example.com');
  });

  it('caps the stored log so it stays manageable', () => {
    for (let index = 0; index < 250; index += 1) {
      captureInputActivity({
        page: '/contact',
        field: `field-${index}`,
        label: `Field ${index}`,
        value: `hello ${index}`,
      });
    }

    expect(getInputActivity().length).toBeLessThanOrEqual(200);
  });
});
