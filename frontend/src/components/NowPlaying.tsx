import { useEffect, useMemo, useRef } from 'react'
import type { Lyrics, Track } from '../types'
import { big } from '../util'
import Icon from './Icon'
import Art from './Art'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

interface Props {
  track?: Track; source: string; playing: boolean; lyrics: Lyrics | null; loading: boolean
  time: number; dur: number; open: boolean; fav: boolean; shuffle: boolean; repeat: 'off' | 'all' | 'one'
  onClose: () => void; onSeek: (s: number) => void; onToggle: () => void; onNext: () => void; onPrev: () => void
  onFav: () => void; onShuffle: () => void; onRepeat: () => void
}

export default function NowPlaying(p: Props) {
  const { track, lyrics, time, dur } = p
  const box = useRef<HTMLDivElement>(null)
  const lines = lyrics?.synced ?? []
  const active = useMemo(() => {
    let a = -1
    for (let i = 0; i < lines.length; i++) { if (lines[i].t <= time + 0.25) a = i; else break }
    return a
  }, [lines, time])

  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>('.on')
    if (el && box.current) box.current.scrollTo({ top: el.offsetTop - box.current.clientHeight / 3, behavior: 'smooth' })
  }, [active])

  return (
    <aside className={`now ${p.open ? 'open' : ''}`}>
      <div className="pcol">
        <div className="mhead">
          <button onClick={p.onClose} aria-label="Tutup"><Icon n="down" fill={false} s={28} /></button>
          <div><small>Memainkan dari</small><b>{p.source}</b></div>
          <span />
        </div>

        <div className={`cover ${p.playing ? '' : 'paused'}`}>
          {track ? <Art key={track.videoId} t={track} src={big(track.thumb)} /> : <div className="empty">♪</div>}
        </div>

        <div className="head"><b>{track?.title ?? 'Belum ada lagu'}</b><span>{track?.artists ?? 'Cari lagu, klik untuk langsung memutar'}</span></div>

        <div className="mtitle">
          <div><b>{track?.title ?? 'Belum ada lagu'}</b><span>{track?.artists ?? 'Pilih lagu untuk mulai'}</span></div>
          {track && <button className={`heart ${p.fav ? 'on' : ''}`} onClick={p.onFav} aria-label="Favorit"><Icon n="heart" s={26} fill={p.fav} /></button>}
        </div>

        <div className="mseek">
          <input type="range" min={0} max={dur || 1} step={0.1} value={Math.min(time, dur || 1)} onChange={e => p.onSeek(+e.target.value)} style={{ ['--p' as string]: `${(time / (dur || 1)) * 100}%` }} />
          <div className="t"><span>{fmt(time)}</span><span>{fmt(dur)}</span></div>
        </div>

        <div className="mctl">
          <button className={p.shuffle ? 'on' : ''} onClick={p.onShuffle} aria-label="Acak"><Icon n="shuffle" s={24} fill={false} /></button>
          <button onClick={p.onPrev} aria-label="Sebelumnya"><Icon n="prev" s={30} /></button>
          <button className="pp" onClick={p.onToggle} aria-label="Play/Pause"><Icon n={p.playing ? 'pause' : 'play'} s={34} /></button>
          <button onClick={p.onNext} aria-label="Berikutnya"><Icon n="next" s={30} /></button>
          <button className={p.repeat !== 'off' ? 'on' : ''} onClick={p.onRepeat} aria-label="Ulangi"><Icon n="repeat" s={24} fill={false} />{p.repeat === 'one' && <em>1</em>}</button>
        </div>

        <button className="mhint" onClick={() => box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>Lirik</span><Icon n="down" s={18} fill={false} /></button>
      </div>

      <div className="lyrics" ref={box}>
        {p.loading && <p className="hint">Mencari lirik…</p>}
        {!p.loading && track && lines.length > 0 && lines.map((l, i) => (
          <p key={i} className={i === active ? 'on' : i < active ? 'past' : ''} onClick={() => p.onSeek(l.t)}>{l.text}</p>
        ))}
        {!p.loading && track && !lines.length && lyrics?.plain && <pre>{lyrics.plain}</pre>}
        {!p.loading && track && lyrics && !lines.length && !lyrics.plain && <p className="hint">Lirik tidak ditemukan untuk lagu ini.</p>}
      </div>
    </aside>
  )
}
