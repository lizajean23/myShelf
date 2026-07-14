import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { fetchAlbum } from '@/api/music'
import type { AlbumSummary } from '@/api/types'
import { AddToShelfModal } from '@/components/media/AddToShelfModal'
import { Loader } from '@/components/ui/Loader'
import { useAsyncData } from '@/hooks/useAsyncData'
import { copy } from '@/copy'
import { useShelf } from '@/context/ShelfContext'

interface AlbumLocationState {
  title?: string
  artistName?: string
  cover?: string
  artistId?: string
}

export function AlbumPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const state = (location.state as AlbumLocationState | null) ?? null
  const { isOnShelf, removeVinyl, addLastBrowsed, vinyls } = useShelf()
  const [showAdd, setShowAdd] = useState(false)

  const shelfMatch = vinyls.find((v) => String(v.id) === String(id))
  const hint = {
    title: state?.title || shelfMatch?.title,
    artistName: state?.artistName || shelfMatch?.artistName,
  }

  const { data, loading, error, reload } = useAsyncData(
    () => fetchAlbum(id, hint.title ? hint : undefined),
    [id, hint.title, hint.artistName],
  )

  useEffect(() => {
    if (!data) return
    addLastBrowsed({
      id: data.id,
      title: data.title,
      artistName: data.artistName,
      artistId: data.artistId,
      cover: data.cover,
    })
  }, [data, addLastBrowsed])

  if (loading) return <Loader />
  if (error || !data) {
    return (
      <div className="state-block state-block--error">
        <p>{copy.common.error}</p>
        <button type="button" className="btn btn--ghost" onClick={reload}>
          {copy.common.retry}
        </button>
      </div>
    )
  }

  const onShelf = isOnShelf(data.id) || isOnShelf(id)
  const asSummary: AlbumSummary = {
    id: data.id,
    title: data.title,
    cover: data.cover,
    artistId: data.artistId,
    artistName: data.artistName,
    year: data.year,
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

      <div className="details">
        <img className="details__cover" src={data.cover} alt={data.title} />

        <div className="details__meta">
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>{data.title}</h1>
          <p>
            <Link to={`/artist/${data.artistId}`}>{data.artistName}</Link>
          </p>

          {data.description && (
            <p style={{ color: 'var(--ink-soft)', maxWidth: '40rem' }}>
              {data.description.slice(0, 420)}
              {data.description.length > 420 ? '…' : ''}
            </p>
          )}

          <div className="details__stats">
            {data.year && (
              <span>
                {copy.album.released}: {data.year}
              </span>
            )}
            {data.label && (
              <span>
                {copy.album.label}: {data.label}
              </span>
            )}
            {data.genre && (
              <span>
                {copy.album.genres}: {data.genre}
              </span>
            )}
            {data.style && (
              <span>
                {copy.album.style}: {data.style}
              </span>
            )}
          </div>

          <div className="details__actions">
            {onShelf ? (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  removeVinyl(data.id)
                  removeVinyl(id)
                }}
              >
                {copy.album.remove}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setShowAdd(true)}
              >
                {copy.album.add}
              </button>
            )}
            {onShelf && (
              <span className="btn btn--brass" style={{ pointerEvents: 'none' }}>
                {copy.album.onShelf}
              </span>
            )}
          </div>

          {data.tracks.length > 0 && (
            <div className="tracklist">
              <div className="section__title">
                <h2>{copy.album.tracks}</h2>
              </div>
              <ul>
                {data.tracks.map((track, index) => (
                  <li key={track.id}>
                    <span className="muted">{track.trackNumber || index + 1}</span>
                    <span>{track.title}</span>
                    <span className="muted">{track.duration}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <AddToShelfModal
        album={asSummary}
        open={showAdd}
        onClose={() => setShowAdd(false)}
      />
    </div>
  )
}
