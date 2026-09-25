export type WorldwideTrack = {
  id: string
  title: string
  artist: string
  album: string
  cover: string
  previewUrl: string
  storeUrl: string
  genre?: string
}

type AppleSearchItem = {
  trackId?: number
  trackName?: string
  artistName?: string
  collectionName?: string
  artworkUrl100?: string
  previewUrl?: string
  trackViewUrl?: string
  primaryGenreName?: string
}

type AppleSearchResponse = {
  resultCount: number
  results: AppleSearchItem[]
}

export async function searchWorldwideMusic(
  query: string,
  country = "US",
): Promise<WorldwideTrack[]> {
  const trimmed = query.trim()

  if (!trimmed) {
    return []
  }

  const url =
    `https://itunes.apple.com/search?` +
    `term=${encodeURIComponent(trimmed)}` +
    `&country=${country}` +
    `&media=music` +
    `&entity=song` +
    `&limit=30`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Music search failed: ${response.status}`)
  }

  const data: AppleSearchResponse = await response.json()

  return data.results
    .filter(
      (item) =>
        item.trackId &&
        item.trackName &&
        item.artistName &&
        item.previewUrl,
    )
    .map((item) => ({
      id: `world-${item.trackId}`,
      title: item.trackName!,
      artist: item.artistName!,
      album: item.collectionName ?? "Unknown Album",
      cover:
        item.artworkUrl100?.replace("100x100", "600x600") ??
        item.artworkUrl100 ??
        "",
      previewUrl: item.previewUrl!,
      storeUrl: item.trackViewUrl ?? "",
      genre: item.primaryGenreName,
    }))
}