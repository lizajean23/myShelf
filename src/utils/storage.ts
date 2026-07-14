export function readStorage<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(storage: Storage, key: string, value: T): void {
  storage.setItem(key, JSON.stringify(value))
}

export const STORAGE_KEYS = {
  theme: 'shelf_theme',
  vinyls: 'shelf_vinyls',
  recentSearches: 'shelf_recent_searches',
  lastBrowsed: 'shelf_last_browsed',
  profile: 'shelf_profile',
} as const
