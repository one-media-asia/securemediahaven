export type UserRole = 'admin' | 'owner' | 'user';
export type UserPlan = 'Starter' | 'Pro' | 'Business';

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

export const USER_STORAGE_KEY = 'securemediahaven-managed-users';

const defaultUsers: ManagedUser[] = [
  {
    id: 'owner-1',
    name: 'Owner',
    email: 'owner@onemedia.asia',
    plan: 'Business',
    role: 'owner',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    name: 'Support Admin',
    email: 'support@onemedia.asia',
    plan: 'Pro',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'member-1',
    name: 'Demo Member',
    email: 'member@onemedia.asia',
    plan: 'Starter',
    role: 'user',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const memoryStore = new Map<string, string>();

const getStorage = () => {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  return {
    getItem: (key: string) => memoryStore.get(key) ?? null,
    setItem: (key: string, value: string) => { memoryStore.set(key, value); },
    removeItem: (key: string) => { memoryStore.delete(key); },
    clear: () => { memoryStore.clear(); },
  };
};

const normalizeUsers = (users: ManagedUser[] = []): ManagedUser[] =>
  users.map((user) => ({
    ...user,
    email: user.email.trim().toLowerCase(),
    name: user.name.trim() || 'Unnamed user',
    active: Boolean(user.active),
    role: user.role || 'user',
    plan: user.plan || 'Starter',
  }));

export const getManagedUsers = (): ManagedUser[] => {
  const storage = getStorage();
  const raw = storage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  try {
    const parsed = JSON.parse(raw) as ManagedUser[];
    const normalized = normalizeUsers(Array.isArray(parsed) ? parsed : defaultUsers);

    if (!normalized.length) {
      storage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }

    return normalized;
  } catch {
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
};

export const saveManagedUsers = (users: ManagedUser[]) => {
  const normalized = normalizeUsers(users);
  const storage = getStorage();
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const getManagedUserByEmail = (email: string) => {
  const list = getManagedUsers();
  const normalized = email.trim().toLowerCase();
  return list.find((user) => user.email === normalized) ?? null;
};

export const isUserAllowed = (email: string) => {
  const user = getManagedUserByEmail(email);
  return Boolean(user && user.active);
};

export const addManagedUser = (input: {
  name: string;
  email: string;
  plan?: UserPlan;
  role?: UserRole;
  active?: boolean;
}) => {
  const trimmedEmail = input.email.trim().toLowerCase();
  if (!trimmedEmail) return getManagedUsers();

  const users = getManagedUsers();
  const existingIndex = users.findIndex((user) => user.email === trimmedEmail);
  const fallbackName = existingIndex >= 0 ? users[existingIndex].name : 'New user';
  const nextUser: ManagedUser = {
    id: existingIndex >= 0 ? users[existingIndex].id : crypto.randomUUID(),
    name: (input.name || fallbackName).trim() || 'New user',
    email: trimmedEmail,
    plan: input.plan || users[existingIndex]?.plan || 'Starter',
    role: input.role || users[existingIndex]?.role || 'user',
    active: typeof input.active === 'boolean' ? input.active : existingIndex >= 0 ? users[existingIndex].active : true,
    createdAt: existingIndex >= 0 ? users[existingIndex].createdAt : new Date().toISOString(),
  };

  const updated = existingIndex >= 0
    ? users.map((user) => user.email === trimmedEmail ? nextUser : user)
    : [...users, nextUser];

  return saveManagedUsers(updated);
};

export const toggleManagedUser = (email: string) => {
  const users = getManagedUsers();
  const target = users.find((user) => user.email === email.trim().toLowerCase());
  if (!target) return users;

  const updated = users.map((user) =>
    user.email === target.email ? { ...user, active: !user.active } : user,
  );

  return saveManagedUsers(updated);
};

export const deleteManagedUser = (email: string) => {
  const users = getManagedUsers();
  const filtered = users.filter((user) => user.email !== email.trim().toLowerCase());
  return saveManagedUsers(filtered);
};
