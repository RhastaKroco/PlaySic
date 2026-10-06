import { useEffect, useRef, useState } from 'react'

declare global { interface Window { YT: any; onYouTubeIframeAPIReady: () => void } }

/** Pembungkus YouTube IFrame Player API (pemutar resmi, video tetap tampil sesuai ketentuan YouTube). */
export function usePlayer(onEnd: () => void) {
  const p = useRef<any>(null)
  const endRef = useRef(onEnd); endRef.current = onEnd
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)

  useEffect(() => {
    const init = () => {
      p.current = new window.YT.Player('yt', {
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e: any) => { setPlaying(e.data === 1); if (e.data === 0) endRef.current() },
        },
      })
    }
    if (window.YT?.Player) init()
    else {
      const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s)
      window.onYouTubeIframeAPIReady = init
    }
    const id = setInterval(() => {
      const pl = p.current
      if (pl?.getCurrentTime) { setTime(pl.getCurrentTime()); setDur(pl.getDuration() || 0) }
    }, 250)
    return () => clearInterval(id)
  }, [])

  return {
    ready, playing, time, dur,
    load: (id: string) => p.current?.loadVideoById(id),
    toggle: () => (playing ? p.current?.pauseVideo() : p.current?.playVideo()),
    seek: (s: number) => { p.current?.seekTo(s, true); setTime(s) },
    restart: () => { p.current?.seekTo(0, true); p.current?.playVideo() },
  }
}
