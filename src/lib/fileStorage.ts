export type StoredFileIcon = 'image' | 'text' | 'archive' | 'file';

export type StoredFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  updated: string;
  updatedAt: number;
  icon: StoredFileIcon;
};

const DB_NAME = 'securemediahaven-vaultline';
const STORE_NAME = 'files';

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

const normalizeFile = (file: Partial<StoredFile>): StoredFile => ({
  id: file.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: file.name ?? 'untitled',
  type: file.type ?? 'File',
  size: file.size ?? '0 KB',
  updated: file.updated ?? 'Just now',
  updatedAt: file.updatedAt ?? Date.now(),
  icon: file.icon ?? 'file',
});

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
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Unable to clear stored files'));
  });
};
