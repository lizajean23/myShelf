import { Link } from 'react-router-dom'
import type { ArtistSummary } from '@/api/types'
import { coverUrl } from '@/api/types'

interface ArtistCardProps {
  artist: ArtistSummary
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link to={`/artist/${artist.id}`} className="artist-card">
      <img src={coverUrl(artist.thumb)} alt={artist.name} loading="lazy" />
      <span>{artist.name}</span>
    </Link>
  )
}
