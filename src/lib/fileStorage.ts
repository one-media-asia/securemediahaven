export type StoredFileIcon = 'image' | 'text' | 'archive' | 'file';

export type StoredFile = {
  id: string;
  key?: string;
  name: string;
  type: string;
  size: string;
  updated: string;
  updatedAt: number;
  icon: StoredFileIcon;
};

export type UploadUrlResponse = {
  uploadUrl: string;
  fileUrl: string;
  file: StoredFile;
};

const DB_NAME = 'securemediahaven-vaultline';
const STORE_NAME = 'files';
const AWS_MODE = 'aws';
const INDEXEDDB_MODE = 'indexeddb';

const storageMode = (() => {
  const configured = (import.meta.env.VITE_STORAGE_MODE ?? '').toLowerCase();
  if (configured === AWS_MODE) return AWS_MODE;
  if (configured === INDEXEDDB_MODE) return INDEXEDDB_MODE;
  return import.meta.env.VITE_API_BASE_URL ? AWS_MODE : INDEXEDDB_MODE;
})();

const getApiBaseUrl = () => {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  return base;
};

export type DownloadUrlResponse = {
  downloadUrl: string;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const detectIcon = (file: File): StoredFileIcon => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.includes('zip') || file.type.includes('archive')) return 'archive';
  if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv')) return 'text';
  return 'file';
};

export const buildStoredFile = (file: File): StoredFile => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: file.name,
  type: file.type || 'File',
  size: formatFileSize(file.size),
  updated: 'Just now',
  updatedAt: Date.now(),
  icon: detectIcon(file),
});

export const isAwsStorageEnabled = () => storageMode === AWS_MODE;

const normalizeFile = (file: Partial<StoredFile>): StoredFile => ({
  id: file.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  key: file.key,
  name: file.name ?? 'untitled',
  type: file.type ?? 'File',
  size: file.size ?? '0 KB',
  updated: file.updated ?? 'Just now',
  updatedAt: file.updatedAt ?? Date.now(),
  icon: file.icon ?? 'file',
});

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T | null> => {
  const base = getApiBaseUrl();

  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) return null;
  return response.json() as Promise<T>;
};

export const requestUploadUrl = async (file: File): Promise<UploadUrlResponse | null> => {
  if (!isAwsStorageEnabled()) return null;

  const payload = await requestJson<{ uploadUrl: string; fileUrl: string; file: StoredFile }>(`/api/files/upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type || 'application/octet-stream')}`);
  if (!payload) return null;

  const response = await fetch(payload.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });

  if (!response.ok) return null;

  return payload;
};

export const requestDownloadUrl = async (file: StoredFile): Promise<string | null> => {
  if (!isAwsStorageEnabled() || !file.key) return null;

  const payload = await requestJson<DownloadUrlResponse>(`/api/files/download-url?key=${encodeURIComponent(file.key)}`);
  return payload?.downloadUrl ?? null;
};

const openDb = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const idb = globalThis.indexedDB;

  if (!idb) {
    reject(new Error('IndexedDB is not supported in this browser'));
    return;
  }

  const request = idb.open(DB_NAME, 1);

  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB'));
});

export const getStoredFiles = async (): Promise<StoredFile[]> => {
  if (isAwsStorageEnabled()) {
    const payload = await requestJson<{ files?: StoredFile[] } | StoredFile[]>('/api/files');

    if (Array.isArray(payload)) {
      return payload.map(normalizeFile).sort((a, b) => b.updatedAt - a.updatedAt);
    }

    if (payload && Array.isArray(payload.files)) {
      return payload.files.map(normalizeFile).sort((a, b) => b.updatedAt - a.updatedAt);
    }
  }

  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).getAll();

      request.onsuccess = () => resolve((request.result ?? []).map(normalizeFile).sort((a, b) => b.updatedAt - a.updatedAt));
      request.onerror = () => reject(request.error ?? new Error('Unable to read files from IndexedDB'));
    });
  } catch {
    return [];
  }
};

export const saveFiles = async (files: StoredFile[]) => {
  if (isAwsStorageEnabled()) {
    await requestJson('/api/files', {
      method: 'POST',
      body: JSON.stringify({ files: files.map(normalizeFile) }),
    });
    return;
  }

  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.clear();
    files.map(normalizeFile).forEach((file) => store.put(file));

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Unable to save files to IndexedDB'));
  });
};

export const clearStoredFiles = async () => {
  if (isAwsStorageEnabled()) {
    await requestJson('/api/files/clear', { method: 'DELETE' });
    return;
  }

  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Unable to clear stored files'));
  });
};
