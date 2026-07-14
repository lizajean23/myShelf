import { useParams } from 'react-router-dom'
import { fetchArtist, fetchArtistAlbums } from '@/api/music'
import { coverUrl } from '@/api/types'
import { AlbumCard } from '@/components/media/AlbumCard'
import { Loader } from '@/components/ui/Loader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { copy } from '@/copy'

export function ArtistPage() {
  const { id = '' } = useParams()
  const artist = useAsyncData(() => fetchArtist(id), [id])
  const albums = useAsyncData(() => fetchArtistAlbums(id), [id])

  if (artist.loading || albums.loading) return <Loader />

  if (artist.error || !artist.data) {
    return (
      <div className="state-block state-block--error">
        <p>{copy.common.error}</p>
        <button type="button" className="btn btn--ghost" onClick={artist.reload}>
          {copy.common.retry}
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <button
        type="button"
        className="btn btn--ghost"
        style={{ marginBottom: '1rem' }}
        onClick={() => window.history.back()}
      >
        ← {copy.common.back}
      </button>

      <header
        className="page-header"
        style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}
      >
        <img
          src={coverUrl(artist.data.thumb)}
          alt={artist.data.name}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
          }}
        />
        <div>
          <h1>{artist.data.name}</h1>
          {(artist.data.genre || artist.data.fans) && (
            <p>
              {[artist.data.genre, artist.data.fans && `${artist.data.fans} ${copy.artist.fans}`]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>
      </header>

      {artist.data.bio && (
        <p
          style={{
            color: 'var(--ink-soft)',
            maxWidth: '44rem',
            marginBottom: '2rem',
          }}
        >
          {artist.data.bio.slice(0, 480)}
          {artist.data.bio.length > 480 ? '…' : ''}
        </p>
      )}

      <section className="section">
        <div className="section__title">
          <h2>{copy.artist.albums}</h2>
        </div>
        {albums.error && (
          <div className="state-block state-block--error">{copy.common.error}</div>
        )}
        {albums.data && (
          <div className="album-grid">
            {albums.data.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
