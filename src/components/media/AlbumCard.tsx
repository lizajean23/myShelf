import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { AlbumSummary } from '@/api/types'
import { useShelf } from '@/context/ShelfContext'

interface AlbumCardProps {
  album: AlbumSummary
  onQuickAdd?: (album: AlbumSummary) => void
}

export function AlbumCard({ album, onQuickAdd }: AlbumCardProps) {
  const { isOnShelf } = useShelf()
  const onShelf = isOnShelf(album.id)
  const label = `${album.title}, ${album.artistName}`

  const handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onQuickAdd?.(album)
  }

  return (
    <motion.div
      className="album-card-wrap"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="album-card">
        <Link
          to={`/album/${album.id}`}
          className="album-card__hit"
          aria-label={label}
          title={label}
        >
          <div className="album-card__cover-wrap">
            <div className="album-card__vinyl" aria-hidden />
            <img
              className="album-card__cover"
              src={album.cover}
              alt=""
              loading="lazy"
            />
            <div className="album-card__shine" />
            {onShelf && <span className="album-card__badge">♪</span>}
          </div>
        </Link>

        {onQuickAdd && !onShelf && (
          <button
            type="button"
            className="album-card__add"
            aria-label={`Add ${album.title}`}
            onClick={handleAdd}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            +
          </button>
        )}
      </div>
    </motion.div>
  )
}
