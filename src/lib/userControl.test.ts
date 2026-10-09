import { beforeEach, describe, expect, it } from 'vitest';
import { addManagedUser, getManagedUsers, isUserAllowed, toggleManagedUser } from './userControl';

describe('userControl', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
      configurable: true,
    });
  });

  it('creates a default user list and allows active users', () => {
    const users = getManagedUsers();

    expect(users.length).toBeGreaterThan(0);
    expect(isUserAllowed(users[0].email)).toBe(true);
  });

  it('adds and toggles users in storage', () => {
    const added = addManagedUser({
      name: 'New Member',
      email: 'newmember@example.com',
      plan: 'Pro',
      role: 'user',
    });

    expect(added.some((user) => user.email === 'newmember@example.com')).toBe(true);
    expect(isUserAllowed('newmember@example.com')).toBe(true);

    const updated = toggleManagedUser('newmember@example.com');
    expect(isUserAllowed('newmember@example.com')).toBe(false);
    expect(updated.find((user) => user.email === 'newmember@example.com')?.active).toBe(false);
  });
});
