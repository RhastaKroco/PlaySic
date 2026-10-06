import { useEffect, useState } from 'react'
import { api } from './api'
import { usePlayer } from './usePlayer'
import type { Lyrics, Track, View } from './types'
import Sidebar from './components/Sidebar'
import TrackRow from './components/TrackRow'
import NowPlaying from './components/NowPlaying'
import PlayerBar from './components/PlayerBar'
import Icon from './components/Icon'
import Art from './components/Art'
import { big, proxy } from './util'

const IDEAS = ['Nightcord at 25:00', 'Project SEKAI', 'Hatsune Miku', 'lofi hip hop', 'J-Pop hits', 'YOASOBI']
type Repeat = 'off' | 'all' | 'one'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [q, setQ] = useState('')
  const [res, setRes] = useState<Track[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [favs, setFavs] = useState<Track[]>([])
  const [hist, setHist] = useState<Track[]>([])
  const [queue, setQueue] = useState<Track[]>([])
  const [idx, setIdx] = useState(-1)
  const [src, setSrc] = useState('Riwayat')
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<Repeat>('off')
  const [lyr, setLyr] = useState<Lyrics | null>(null)
  const [lyrBusy, setLyrBusy] = useState(false)
  const [panel, setPanel] = useState(false)

  const cur: Track | undefined = queue[idx]
  const rnd = () => setIdx(i => { if (queue.length < 2) return i; let r: number; do { r = Math.floor(Math.random() * queue.length) } while (r === i); return r })
  const step = (d: number) => { if (!queue.length) return; if (shuffle && d > 0) return rnd(); setIdx(i => (i + d + queue.length) % queue.length) }
  const prev = () => (pl.time > 3 ? pl.seek(0) : step(-1))
  function ended() {   // lagu selesai sendiri
    if (repeat === 'one' || (queue.length === 1 && repeat !== 'off')) return pl.restart()
    if (shuffle) return rnd()
    if (idx < queue.length - 1) return setIdx(idx + 1)
    if (repeat === 'all') setIdx(0)
  }
  const pl = usePlayer(() => ended())

  useEffect(() => { api.favorites().then(setFavs).catch(() => {}); api.history().then(setHist).catch(() => {}) }, [])

  useEffect(() => {
    if (!q.trim()) { setRes([]); return }
    setBusy(true); setErr('')
    const id = setTimeout(() => api.search(q.trim()).then(setRes).catch(e => setErr(String(e.message))).finally(() => setBusy(false)), 400)
    return () => clearTimeout(id)
  }, [q])

  useEffect(() => {
    if (!cur || !pl.ready) return
    pl.load(cur.videoId)
    setLyr(null); setLyrBusy(true)
    api.lyrics(cur).then(setLyr).catch(() => setLyr({ synced: [], plain: null, source: 'none' })).finally(() => setLyrBusy(false))
    api.addHist(cur).then(() => api.history().then(setHist)).catch(() => {})
    document.title = `${cur.title} · PlaySic`
  }, [cur?.videoId, pl.ready])

  const isFav = (t: Track) => favs.some(f => f.videoId === t.videoId)
  const toggleFav = async (t: Track) => {
    if (isFav(t)) { await api.delFav(t.videoId); setFavs(f => f.filter(x => x.videoId !== t.videoId)) }
    else { await api.addFav(t); setFavs(f => [t, ...f]) }
  }
  const play = (list: Track[], i: number, label = 'Riwayat') => {
    if (cur && list[i].videoId === cur.videoId) { pl.toggle(); return }
    setQueue(list); setIdx(i); setSrc(label)
  }
  const go = (v: View) => { setView(v); if (v !== 'search') setQ('') }

  const list = view === 'search' ? res : view === 'favorites' ? favs : hist
  const label = view === 'search' ? `Pencarian: ${q}` : view === 'favorites' ? 'Favorit' : 'Riwayat'
  const title = { home: 'Beranda', search: 'Hasil pencarian', favorites: 'Favorit', history: 'Riwayat' }[view]

  return (
    <div className="app">
      <div key={cur?.thumb ?? 'none'} className="bgart" style={cur ? { backgroundImage: `url(${proxy(big(cur.thumb))})` } : undefined} />
      <div className="ytbox"><div id="yt" /></div>
      <Sidebar view={view} set={go} />
      <main>
        <div className="top">
          <label className="search">
            <Icon n="search" s={18} />
            <input value={q} placeholder="Cari lagu, artis, atau album…" onChange={e => { setQ(e.target.value); setView('search') }} />
          </label>
        </div>

        {view === 'home' ? (
          <section>
            <div className="hero">
              <small>YOUTUBE MUSIC × LIRIK</small>
              <h1>Dengar lagunya,<br />ikuti liriknya.</h1>
              <div className="chips">{IDEAS.map(c => <button key={c} onClick={() => { setQ(c); setView('search') }}>{c}</button>)}</div>
            </div>
            {hist.length > 0 && <>
              <h2>Terakhir diputar</h2>
              <div className="cards">
                {hist.slice(0, 8).map((t, i) => (
                  <button key={t.videoId} className="card" onClick={() => play(hist, i, 'Riwayat')}>
                    <Art t={t} /><b>{t.title}</b><span>{t.artists}</span>
                    <i><Icon n="play" s={22} /></i>
                  </button>
                ))}
              </div>
            </>}
          </section>
        ) : (
          <section>
            <h2>{title}</h2>
            {busy && <div className="skel">{[0, 1, 2, 3, 4].map(i => <div key={i} />)}</div>}
            {err && <p className="hint err">Gagal memuat: {err}</p>}
            {!busy && !err && !list.length && <p className="hint">{view === 'search' ? 'Ketik sesuatu untuk mulai mencari.' : 'Belum ada apa-apa di sini.'}</p>}
            <div className="list">
              {!busy && list.map((t, i) => (
                <TrackRow key={t.videoId} t={t} i={i} active={cur?.videoId === t.videoId} playing={pl.playing} fav={isFav(t)} onPlay={() => play(list, i, label)} onFav={() => toggleFav(t)} />
              ))}
            </div>
          </section>
        )}
      </main>
      <NowPlaying
        track={cur} source={src} playing={pl.playing} lyrics={lyr} loading={lyrBusy} time={pl.time} dur={pl.dur || cur?.seconds || 0}
        open={panel} fav={!!cur && isFav(cur)} shuffle={shuffle} repeat={repeat}
        onClose={() => setPanel(false)} onSeek={pl.seek} onToggle={() => (cur ? pl.toggle() : null)} onNext={() => step(1)} onPrev={prev}
        onFav={() => cur && toggleFav(cur)} onShuffle={() => setShuffle(s => !s)}
        onRepeat={() => setRepeat(r => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'))}
      />
      <PlayerBar track={cur} playing={pl.playing} time={pl.time} dur={pl.dur || cur?.seconds || 0} onToggle={() => (cur ? pl.toggle() : null)} onNext={() => step(1)} onPrev={prev} onSeek={pl.seek} onLyrics={() => setPanel(p => !p)} />
    </div>
  )
}
