import { useEffect, useState } from 'react'
import { searchAlbums, searchArtists } from '@/api/music'
import type { AlbumSummary, ArtistSummary } from '@/api/types'
import { AlbumCard } from '@/components/media/AlbumCard'
import { AddToShelfModal } from '@/components/media/AddToShelfModal'
import { ArtistCard } from '@/components/media/ArtistCard'
import { Loader } from '@/components/ui/Loader'
import { useDebounce } from '@/hooks/useDebounce'
import { copy } from '@/copy'
import { useShelf } from '@/context/ShelfContext'

export function ExplorePage() {
  const { recentSearches, addRecentSearch, clearRecentSearches } = useShelf()
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 450)
  const [albums, setAlbums] = useState<AlbumSummary[]>([])
  const [artists, setArtists] = useState<ArtistSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingAlbum, setPendingAlbum] = useState<AlbumSummary | null>(null)

  useEffect(() => {
    if (!debounced.trim()) {
      setAlbums([])
      setArtists([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([searchAlbums(debounced), searchArtists(debounced)])
      .then(([albumRes, artistRes]) => {
        if (cancelled) return
        setAlbums(albumRes)
        setArtists(artistRes)
        addRecentSearch(debounced)
      })
      .catch(() => {
        if (!cancelled) setError(copy.common.error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debounced, addRecentSearch])

  return (
    <div className="page">
      <header className="page-header">
        <h1>{copy.explore.title}</h1>
        <p>{copy.explore.subtitle}</p>
      </header>

      <div className="search-bar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.explore.placeholder}
          aria-label={copy.explore.placeholder}
        />
      </div>

      {recentSearches.length > 0 && !query && (
        <div className="chips">
          <span className="chips__label">{copy.explore.recent}</span>
          {recentSearches.map((item) => (
            <button key={item} type="button" onClick={() => setQuery(item)}>
              {item}
            </button>
          ))}
          <button type="button" onClick={clearRecentSearches}>
            {copy.explore.clearRecent}
          </button>
        </div>
      )}

      {loading && <Loader />}
      {error && <div className="state-block state-block--error">{error}</div>}

      {!loading && !error && !debounced.trim() && (
        <div className="state-block">{copy.explore.emptyHint}</div>
      )}

      {!loading &&
        !error &&
        debounced.trim() &&
        albums.length === 0 &&
        artists.length === 0 && (
          <div className="state-block">{copy.explore.noResults}</div>
        )}

      {artists.length > 0 && (
        <section className="section">
          <div className="section__title">
            <h2>{copy.explore.artists}</h2>
          </div>
          <div className="artist-row">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section className="section">
          <div className="section__title">
            <h2>{copy.explore.albums}</h2>
          </div>
          <div className="album-grid">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onQuickAdd={setPendingAlbum}
              />
            ))}
          </div>
        </section>
      )}

      <AddToShelfModal
        album={pendingAlbum}
        open={Boolean(pendingAlbum)}
        onClose={() => setPendingAlbum(null)}
      />
    </div>
  )
}
