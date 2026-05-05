'use client'

import { useMemo } from 'react'
import { localStorageAdapter } from './localStorageAdapter'
import { memoryAdapter } from './memoryAdapter'
import type { StorageProvider } from './types'

export type { StorageProvider } from './types'
export { localStorageAdapter } from './localStorageAdapter'
export { memoryAdapter, createMemoryAdapter } from './memoryAdapter'

export function getStorage(): StorageProvider {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return localStorageAdapter
  }
  return memoryAdapter
}

export function useStorage(): StorageProvider {
  return useMemo(() => getStorage(), [])
}
