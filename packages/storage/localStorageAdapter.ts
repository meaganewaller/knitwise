import type { StorageProvider } from './types'

export const localStorageAdapter: StorageProvider = {
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  async set<T = unknown>(key: string, value: T): Promise<void> {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // quota exceeded, private mode, etc. — swallow so the UI keeps working
    }
  },

  async delete(key: string): Promise<void> {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },

  async list(prefix: string): Promise<string[]> {
    try {
      const keys: string[] = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i)
        if (k !== null && k.startsWith(prefix)) keys.push(k)
      }
      return keys
    } catch {
      return []
    }
  },
}
