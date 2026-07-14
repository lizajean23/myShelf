import { FEATURED_ALBUM_QUERIES } from '@/data/featured'
import axios from 'axios'
import type {
  AlbumDetails,
  AlbumSummary,
  ArtistDetails,
  ArtistSummary,
  TrackSummary,
} from './types'
import { coverUrl } from './types'

const itunes = axios.create({
  baseURL: import.meta.env.DEV
    ? '/itunes-proxy'
    : '/.netlify/functions/itunes',
  timeout: 20000,
})

async function itunesGet<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const { data } = await itunes.get<T>('', {
    params: { endpoint, ...params },
  })
  return data
}

interface ItunesAlbum {
  wrapperType?: string
  collectionType?: string
  collectionId: number
  artistId: number
  collectionName: string
  artistName: string
  artworkUrl100?: string
  releaseDate?: string
  primaryGenreName?: string
  copyright?: string
  trackCount?: number
}

interface ItunesArtist {
  wrapperType?: string
  artistId: number
  artistName: string
  primaryGenreName?: string
  artistLinkUrl?: string
}

interface ItunesTrack {
  wrapperType?: string
  trackId?: number
  trackName?: string
  trackTimeMillis?: number
  trackNumber?: number
  artworkUrl100?: string
  collectionId?: number
  artistId?: number
  collectionName?: string
  artistName?: string
  releaseDate?: string
  primaryGenreName?: string
  copyright?: string
}

interface ItunesSearchResponse<T> {
  resultCount: number
  results: T[]
}

interface RssEntry {
  'im:name': { label: string }
  'im:image': { label: string }[]
  'im:artist': { label: string; attributes?: { href?: string } }
  id: { attributes: { 'im:id': string } }
}

function biggerArt(url?: string): string {
  if (!url) return coverUrl(null)
  return coverUrl(url.replace('100x100bb', '600x600bb').replace('170x170bb', '600x600bb'))
}

function yearFrom(date?: string): string | undefined {
  return date ? date.slice(0, 4) : undefined
}

function formatMs(ms?: number): string {
  const totalSec = Math.floor((ms || 0) / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function mapAlbum(raw: ItunesAlbum): AlbumSummary {
  return {
    id: String(raw.collectionId),
    title: raw.collectionName,
    artistId: String(raw.artistId),
    artistName: raw.artistName,
    cover: biggerArt(raw.artworkUrl100),
    year: yearFrom(raw.releaseDate),
    genre: raw.primaryGenreName,
    label: raw.copyright,
  }
}

function mapArtist(raw: ItunesArtist): ArtistSummary {
  return {
    id: String(raw.artistId),
    name: raw.artistName,
    genre: raw.primaryGenreName,
  }
}

function mapTrack(raw: ItunesTrack): TrackSummary {
  return {
    id: String(raw.trackId ?? `${raw.trackNumber}-${raw.trackName}`),
    title: raw.trackName || 'Untitled',
    duration: formatMs(raw.trackTimeMillis),
    trackNumber: raw.trackNumber || 0,
  }
}

export async function fetchTrendingAlbums(limit = 12): Promise<AlbumSummary[]> {
  const data = await itunesGet<{ feed: { entry: RssEntry[] } }>(
    `us/rss/topalbums/limit=${limit}/json`,
  )

  return (data.feed.entry ?? []).map((entry) => {
    const artistHref = entry['im:artist'].attributes?.href || ''
    const artistMatch = artistHref.match(/id(\d+)/)
    return {
      id: entry.id.attributes['im:id'],
      title: entry['im:name'].label,
      artistId: artistMatch?.[1] || '0',
      artistName: entry['im:artist'].label,
      cover: biggerArt(entry['im:image']?.at(-1)?.label),
    }
  })
}

export async function fetchFeaturedAlbums(): Promise<AlbumSummary[]> {
  const unique = new Map<string, AlbumSummary>()

  for (const term of FEATURED_ALBUM_QUERIES) {
    try {
      const albums = await searchAlbums(term)
      const album = albums[0]
      if (album) unique.set(album.id, album)
    } catch {
      // continue
    }
  }

  if (unique.size === 0) {
    return fetchTrendingAlbums(8)
  }

  return [...unique.values()]
}

export async function fetchFeaturedArtists(limit = 6): Promise<ArtistSummary[]> {
  const albums = await fetchFeaturedAlbums()
  const unique = new Map<string, ArtistSummary>()

  for (const album of albums) {
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

export async function fetchTrendingArtists(limit = 8): Promise<ArtistSummary[]> {
  const albums = await fetchTrendingAlbums(Math.max(limit * 2, 12))
  const unique = new Map<string, ArtistSummary>()

  for (const album of albums) {
    if (album.artistId === '0') continue
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

export async function searchAlbums(query: string): Promise<AlbumSummary[]> {
  const q = query.trim()
  if (!q) return []

  const data = await itunesGet<ItunesSearchResponse<ItunesAlbum>>('search', {
    term: q,
    entity: 'album',
    media: 'music',
    limit: 24,
  })

  return data.results
    .filter((item) => item.collectionId && item.collectionName)
    .map(mapAlbum)
}

export async function searchArtists(query: string): Promise<ArtistSummary[]> {
  const q = query.trim()
  if (!q) return []

  const data = await itunesGet<ItunesSearchResponse<ItunesArtist>>('search', {
    term: q,
    entity: 'musicArtist',
    media: 'music',
    limit: 12,
  })

  return data.results
    .filter((item) => item.artistId && item.artistName)
    .map(mapArtist)
}

export async function fetchAlbum(
  id: string,
  hint?: { title?: string; artistName?: string },
): Promise<AlbumDetails> {
  const data = await itunesGet<ItunesSearchResponse<ItunesTrack | ItunesAlbum>>(
    'lookup',
    {
      id,
      entity: 'song',
      limit: 200,
    },
  )

  const results = data.results ?? []
  const collection = results.find(
    (item): item is ItunesAlbum => item.wrapperType === 'collection',
  )
  const firstTrack = results.find(
    (item): item is ItunesTrack => item.wrapperType === 'track',
  )

  if (collection || firstTrack?.collectionName) {
    const albumSource: ItunesAlbum = collection ?? {
      collectionId: firstTrack!.collectionId || Number(id),
      artistId: firstTrack!.artistId || 0,
      collectionName: firstTrack!.collectionName || 'Unknown',
      artistName: firstTrack!.artistName || 'Unknown',
      artworkUrl100: firstTrack!.artworkUrl100,
      releaseDate: firstTrack!.releaseDate,
      primaryGenreName: firstTrack!.primaryGenreName,
      copyright: firstTrack!.copyright,
    }

    const tracks = results
      .filter((item): item is ItunesTrack => item.wrapperType === 'track')
      .map(mapTrack)

    return {
      ...mapAlbum(albumSource),
      tracks,
    }
  }

  if (hint?.title) {
    const query = [hint.title, hint.artistName].filter(Boolean).join(' ')
    const matches = await searchAlbums(query)
    const best =
      matches.find(
        (album) =>
          album.title.toLowerCase() === hint.title!.toLowerCase() ||
          album.title.toLowerCase().includes(hint.title!.toLowerCase()),
      ) ?? matches[0]

    if (best) {
      return fetchAlbum(best.id)
    }
  }

  throw new Error('Album not found')
}

export async function fetchArtist(id: string): Promise<ArtistDetails> {
  const data = await itunesGet<ItunesSearchResponse<ItunesArtist | ItunesAlbum>>(
    'lookup',
    {
      id,
      entity: 'album',
      limit: 1,
    },
  )

  const artist = data.results.find(
    (item): item is ItunesArtist => item.wrapperType === 'artist',
  )
  const album = data.results.find(
    (item): item is ItunesAlbum => Boolean((item as ItunesAlbum).collectionId),
  )

  if (!artist && !album) throw new Error('Artist not found')

  return {
    id: String(artist?.artistId || album?.artistId || id),
    name: artist?.artistName || album?.artistName || 'Unknown',
    genre: artist?.primaryGenreName || album?.primaryGenreName,
    thumb: album ? biggerArt(album.artworkUrl100) : undefined,
  }
}

export async function fetchArtistAlbums(id: string): Promise<AlbumSummary[]> {
  const data = await itunesGet<ItunesSearchResponse<ItunesArtist | ItunesAlbum>>(
    'lookup',
    {
      id,
      entity: 'album',
      limit: 40,
    },
  )

  return data.results
    .filter(
      (item): item is ItunesAlbum =>
        Boolean((item as ItunesAlbum).collectionId) &&
        item.wrapperType !== 'artist',
    )
    .map(mapAlbum)
}
