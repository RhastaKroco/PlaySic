import type { Lyrics, Track } from './types'

async function j<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init)
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail ?? r.statusText)
  return r.json()
}
const body = (t: Track) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })

export const api = {
  search: (q: string) => j<Track[]>(`/api/search?q=${encodeURIComponent(q)}`),
  lyrics: (t: Track) => j<Lyrics>(`/api/lyrics?title=${encodeURIComponent(t.title)}&artist=${encodeURIComponent(t.artists)}&seconds=${t.seconds}`),
  favorites: () => j<Track[]>('/api/favorites'),
  addFav: (t: Track) => j('/api/favorites', body(t)),
  delFav: (id: string) => j(`/api/favorites/${id}`, { method: 'DELETE' }),
  history: () => j<Track[]>('/api/history'),
  addHist: (t: Track) => j('/api/history', body(t)),
}
