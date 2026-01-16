/**
 * Generic localStorage persistence helpers with versioning support
 */

const STORAGE_KEY = 'tskpay_state_v1'
const CURRENT_SCHEMA_VERSION = 1

export interface StoredState {
  version: number
  data: unknown
}

/**
 * Load state from localStorage with version check
 */
export function loadState<T>(defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed: StoredState = JSON.parse(stored)
      if (parsed.version === CURRENT_SCHEMA_VERSION && parsed.data) {
        return parsed.data as T
      }
    }
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error)
  }
  return defaultValue
}

/**
 * Save state to localStorage with version
 */
export function saveState<T>(data: T): void {
  try {
    const state: StoredState = {
      version: CURRENT_SCHEMA_VERSION,
      data,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error)
  }
}
