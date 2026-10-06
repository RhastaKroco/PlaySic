import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/app.scss'

// Perilaku seperti aplikasi: blokir menu tahan-lama (long-press), kecuali di kolom input
document.addEventListener('contextmenu', e => { if (!(e.target as HTMLElement).closest('input')) e.preventDefault() })
// PWA: service worker agar bisa diinstal
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))

createRoot(document.getElementById('root')!).render(<App />)
