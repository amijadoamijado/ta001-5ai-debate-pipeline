import { StorageAdapter } from '../research/types.js';

/**
 * インメモリ StorageAdapter
 *
 * Web環境（Claude Code Web等）でファイルシステムが
 * 利用できない場合のフォールバック実装。
 * セッション終了時にデータは消失する。
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  async save(key: string, data: unknown): Promise<void> {
    this.store.set(key, JSON.stringify(data));
  }

  async load<T>(key: string): Promise<T | null> {
    const raw = this.store.get(key);
    if (raw === undefined) return null;
    return JSON.parse(raw) as T;
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.store.keys());
  }
}
