import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchFeaturedAlbums } from '@/api/music'
import type { ArtistSummary } from '@/api/types'
import { AlbumCard } from '@/components/media/AlbumCard'
import { ArtistCard } from '@/components/media/ArtistCard'
import { Loader } from '@/components/ui/Loader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { copy } from '@/copy'
import { useShelf } from '@/context/ShelfContext'

function artistsFromAlbums(
  albums: { artistId: string; artistName: string; cover: string }[],
  limit = 6,
): ArtistSummary[] {
  const unique = new Map<string, ArtistSummary>()
  for (const album of albums) {
    if (!album.artistId || album.artistId === '0') continue
    if (!unique.has(album.artistId)) {
      unique.set(album.artistId, {
        id: album.artistId,
        name: album.artistName,
        thumb: album.cover,
      })
    }
    if (unique.size >= limit) break
  }
  return [...unique.values()]
}

export function HomePage() {
  const { lastBrowsed } = useShelf()
  const albums = useAsyncData(() => fetchFeaturedAlbums(), [])
  const heroCovers = albums.data?.slice(0, 3) ?? []
  const artists = albums.data ? artistsFromAlbums(albums.data) : []

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__copy">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {copy.home.heroTitle}
          </motion.h1>
          <p className="hero__text">{copy.home.heroText}</p>
          <div className="hero__actions">
            <Link to="/explore" className="btn btn--primary">
              {copy.home.ctaExplore}
            </Link>
            <Link to="/shelf" className="btn btn--brass">
              {copy.home.ctaShelf}
            </Link>
          </div>
        </div>

        <div className="hero__stage" aria-hidden>
          <div className="hero__lamp" />
          <div className="hero__covers">
            {heroCovers.map((album) => (
              <img
                key={album.id}
                className="hero__cover"
                src={album.cover}
                alt=""
              />
            ))}
          </div>
          <div className="hero__ledge" />
        </div>
      </section>

      {lastBrowsed.length > 0 && (
        <section className="section">
          <div className="section__title">
            <h2>{copy.home.recent}</h2>
          </div>
          <div className="album-grid">
            {lastBrowsed.map((item) => (
              <AlbumCard
                key={item.id}
                album={{
                  id: item.id,
                  title: item.title,
                  cover: item.cover,
                  artistId: item.artistId,
                  artistName: item.artistName,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__title">
          <h2>{copy.home.charts}</h2>
          <Link to="/explore" className="btn btn--ghost">
            {copy.home.ctaExplore}
          </Link>
        </div>
        {albums.loading && <Loader />}
        {albums.error && (
          <div className="state-block state-block--error">
            <p>{copy.common.error}</p>
            <button type="button" className="btn btn--ghost" onClick={albums.reload}>
              {copy.common.retry}
            </button>
          </div>
        )}
        {albums.data && (
          <div className="album-grid">
            {albums.data.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>

      {artists.length > 0 && (
        <section className="section">
          <div className="section__title">
            <h2>{copy.home.artists}</h2>
          </div>
          <div className="artist-row">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
