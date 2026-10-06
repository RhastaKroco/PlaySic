import type { Track } from '../types'
import Icon from './Icon'
import Art from './Art'

interface Props { t: Track; i: number; active: boolean; playing: boolean; fav: boolean; onPlay: () => void; onFav: () => void }

export default function TrackRow({ t, i, active, playing, fav, onPlay, onFav }: Props) {
  return (
    <div className={`row ${active ? 'active' : ''}`} onClick={onPlay}>
      <span className="idx">
        {active && playing ? <span className="bars"><u /><u /><u /></span> : <><em>{i + 1}</em><Icon n="play" s={16} /></>}
      </span>
      <Art t={t} />
      <div className="meta"><b>{t.title}</b><span>{t.artists}</span></div>
      <span className="album">{t.album}</span>
      <button className={`heart ${fav ? 'on' : ''}`} onClick={e => { e.stopPropagation(); onFav() }} aria-label="Favorit"><Icon n="heart" s={18} fill={fav} /></button>
      <span className="dur">{t.duration}</span>
    </div>
  )
}
