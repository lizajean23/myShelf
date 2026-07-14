export interface ArtistSummary {
  id: string
  name: string
  thumb?: string
  genre?: string
  style?: string
}

export interface AlbumSummary {
  id: string
  title: string
  artistId: string
  artistName: string
  cover: string
  year?: string
  genre?: string
  label?: string
}

export interface TrackSummary {
  id: string
  title: string
  duration: string
  trackNumber: number
}

export interface AlbumDetails extends AlbumSummary {
  description?: string
  style?: string
  tracks: TrackSummary[]
}

export interface ArtistDetails extends ArtistSummary {
  bio?: string
  banner?: string
  fans?: string
}

export type VinylCondition = 'mint' | 'near_mint' | 'very_good' | 'good' | 'fair'

export interface VinylRecord {
  id: string
  title: string
  artistName: string
  artistId: string
  cover: string
  year?: string
  note?: string
  condition: VinylCondition
  addedAt: string
}

export function coverUrl(path?: string | null): string {
  return path && path.trim() ? path : '/poster-placeholder.svg'
}
