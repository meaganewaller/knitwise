import type { StorageProvider } from './types'

export function createMemoryAdapter(): StorageProvider {
  const store = new Map<string, string>()

  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      const raw = store.get(key)
      if (raw === undefined) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },

    async set<T = unknown>(key: string, value: T): Promise<void> {
      store.set(key, JSON.stringify(value))
    },

    async delete(key: string): Promise<void> {
      store.delete(key)
    },

    async list(prefix: string): Promise<string[]> {
      const keys: string[] = []
      for (const k of store.keys()) {
        if (k.startsWith(prefix)) keys.push(k)
      }
      return keys
    },
  }
}

export const memoryAdapter: StorageProvider = createMemoryAdapter()
