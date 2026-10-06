import type { Track } from '../types'
import Icon from './Icon'
import Art from './Art'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

interface Props { track?: Track; playing: boolean; time: number; dur: number; onToggle: () => void; onNext: () => void; onPrev: () => void; onSeek: (s: number) => void; onLyrics: () => void }

export default function PlayerBar({ track, playing, time, dur, onToggle, onNext, onPrev, onSeek, onLyrics }: Props) {
  return (
    <footer className="bar">
      <div className="who" onClick={onLyrics}>
        {track && <Art key={track.videoId} t={track} />}
        <div className="meta"><b>{track?.title ?? 'PlaySic'}</b><span>{track?.artists ?? 'Pilih lagu untuk mulai'}</span></div>
      </div>
      <div className="mid">
        <div className="ctl">
          <button onClick={onPrev} aria-label="Sebelumnya"><Icon n="prev" /></button>
          <button className="pp" onClick={onToggle} aria-label="Play/Pause"><Icon n={playing ? 'pause' : 'play'} s={22} /></button>
          <button onClick={onNext} aria-label="Berikutnya"><Icon n="next" /></button>
        </div>
        <div className="seek">
          <span>{fmt(time)}</span>
          <input type="range" min={0} max={dur || 1} step={0.1} value={Math.min(time, dur || 1)} onChange={e => onSeek(+e.target.value)} style={{ ['--p' as string]: `${(time / (dur || 1)) * 100}%` }} />
          <span>{fmt(dur)}</span>
        </div>
      </div>
      <button className="ly" onClick={onLyrics} aria-label="Lirik"><Icon n="lyrics" /></button>
    </footer>
  )
}
