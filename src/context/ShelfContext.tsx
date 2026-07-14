import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import type { VinylCondition, VinylRecord } from '@/api/types'
import { useLocalStorage, useSessionStorage } from '@/hooks/useStorage'
import { STORAGE_KEYS } from '@/utils/storage'

interface BrowsedAlbum {
  id: string
  title: string
  artistName: string
  artistId: string
  cover: string
}

interface ShelfContextValue {
  vinyls: VinylRecord[]
  isOnShelf: (albumId: string) => boolean
  addVinyl: (
    record: Omit<VinylRecord, 'addedAt' | 'condition' | 'note'> & {
      condition?: VinylCondition
      note?: string
    },
  ) => void
  updateVinyl: (
    id: string,
    patch: Partial<Pick<VinylRecord, 'note' | 'condition'>>,
  ) => void
  removeVinyl: (albumId: string) => void
  clearShelf: () => void
  recentSearches: string[]
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  lastBrowsed: BrowsedAlbum[]
  addLastBrowsed: (album: BrowsedAlbum) => void
}

const ShelfContext = createContext<ShelfContextValue | null>(null)

export function ShelfProvider({ children }: { children: ReactNode }) {
  const [vinyls, setVinyls] = useLocalStorage<VinylRecord[]>(STORAGE_KEYS.vinyls, [])
  const [recentSearches, setRecentSearches] = useSessionStorage<string[]>(
    STORAGE_KEYS.recentSearches,
    [],
  )
  const [lastBrowsed, setLastBrowsed] = useSessionStorage<BrowsedAlbum[]>(
    STORAGE_KEYS.lastBrowsed,
    [],
  )

  const isOnShelf = useCallback(
    (albumId: string) => vinyls.some((v) => String(v.id) === String(albumId)),
    [vinyls],
  )

  const addVinyl = useCallback(
    (
      record: Omit<VinylRecord, 'addedAt' | 'condition' | 'note'> & {
        condition?: VinylCondition
        note?: string
      },
    ) => {
      setVinyls((prev) => {
        if (prev.some((v) => String(v.id) === String(record.id))) return prev
        return [
          {
            ...record,
            id: String(record.id),
            artistId: String(record.artistId),
            condition: record.condition ?? 'near_mint',
            note: record.note ?? '',
            addedAt: new Date().toISOString(),
          },
          ...prev,
        ]
      })
    },
    [setVinyls],
  )

  const updateVinyl = useCallback(
    (id: string, patch: Partial<Pick<VinylRecord, 'note' | 'condition'>>) => {
      setVinyls((prev) =>
        prev.map((v) => (String(v.id) === String(id) ? { ...v, ...patch } : v)),
      )
    },
    [setVinyls],
  )

  const removeVinyl = useCallback(
    (albumId: string) => {
      setVinyls((prev) => prev.filter((v) => String(v.id) !== String(albumId)))
    },
    [setVinyls],
  )

  const clearShelf = useCallback(() => setVinyls([]), [setVinyls])

  const addRecentSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim()
      if (!trimmed) return
      setRecentSearches((prev) =>
        [
          trimmed,
          ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, 8),
      )
    },
    [setRecentSearches],
  )

  const clearRecentSearches = useCallback(
    () => setRecentSearches([]),
    [setRecentSearches],
  )

  const addLastBrowsed = useCallback(
    (album: BrowsedAlbum) => {
      setLastBrowsed((prev) =>
        [album, ...prev.filter((a) => String(a.id) !== String(album.id))].slice(
          0,
          8,
        ),
      )
    },
    [setLastBrowsed],
  )

  const value = useMemo(
    () => ({
      vinyls,
      isOnShelf,
      addVinyl,
      updateVinyl,
      removeVinyl,
      clearShelf,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      lastBrowsed,
      addLastBrowsed,
    }),
    [
      vinyls,
      isOnShelf,
      addVinyl,
      updateVinyl,
      removeVinyl,
      clearShelf,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      lastBrowsed,
      addLastBrowsed,
    ],
  )

  return <ShelfContext.Provider value={value}>{children}</ShelfContext.Provider>
}

export function useShelf() {
  const ctx = useContext(ShelfContext)
  if (!ctx) throw new Error('useShelf must be used within ShelfProvider')
  return ctx
}
