import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildStoredFile, clearStoredFiles, getStoredFiles, saveFiles } from './fileStorage';

describe('fileStorage', () => {
  beforeEach(async () => {
    await clearStoredFiles();
  });

  it('persists uploaded files across reloads', async () => {
    const first = new File(['hello world'], 'hello.txt', { type: 'text/plain' });
    const second = new File(['{"ok":true}'], 'data.json', { type: 'application/json' });

    await saveFiles([buildStoredFile(first), buildStoredFile(second)]);

    const reloaded = await getStoredFiles();

    expect(reloaded).toHaveLength(2);
    expect(reloaded.map((file) => file.name).sort()).toEqual(['data.json', 'hello.txt']);
    expect(reloaded.every((file) => file.id)).toBe(true);
  });
});
