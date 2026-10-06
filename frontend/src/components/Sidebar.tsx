import type { View } from '../types'
import Icon from './Icon'

const items: [View, string, string][] = [['home', 'home', 'Beranda'], ['search', 'search', 'Cari'], ['favorites', 'heart', 'Favorit'], ['history', 'clock', 'Riwayat']]

export default function Sidebar({ view, set }: { view: View; set: (v: View) => void }) {
  return (
    <nav className="side">
      <div className="logo">Play<b>Sic</b></div>
      {items.map(([v, ic, label]) => (
        <button key={v} className={view === v ? 'on' : ''} onClick={() => set(v)}>
          <Icon n={ic} /> <span>{label}</span>
        </button>
      ))}
      <p className="note">Pemutaran lewat YouTube. Lirik dari LRCLIB.</p>
    </nav>
  )
}
