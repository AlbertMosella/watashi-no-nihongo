import type { KeyValueStorage } from '@/domain/ports';

/** Emmagatzematge clau-valor sobre localStorage, tolerant a errors (mode privat, quota...). */
export class LocalStorageAdapter implements KeyValueStorage {
  constructor(private readonly storage: Storage | undefined = safeLocalStorage()) {}

  read(key: string): unknown {
    try {
      const raw = this.storage?.getItem(key);
      return raw == null ? undefined : JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  write(key: string, value: unknown): void {
    try {
      this.storage?.setItem(key, JSON.stringify(value));
    } catch {
      // Sense espai o bloquejat: l'app continua funcionant sense persistència.
    }
  }
}

function safeLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export class MemoryStorage implements KeyValueStorage {
  private readonly data = new Map<string, unknown>();
  read(key: string): unknown {
    return this.data.get(key);
  }
  write(key: string, value: unknown): void {
    this.data.set(key, value);
  }
}
