import { useState } from 'react'
import type { Track } from '../types'
import { proxy } from '../util'

/** Cover dengan rantai fallback: proxy backend -> thumbnail YouTube (proxy) -> URL langsung. */
export default function Art({ t, src }: { t: Track; src?: string }) {
  const [n, setN] = useState(0)
  const mq = `https://i.ytimg.com/vi/${t.videoId}/mqdefault.jpg`
  const list = [proxy(src ?? t.thumb), proxy(t.thumb), proxy(mq), t.thumb, mq].filter(Boolean)
  return <img src={list[n]} alt="" referrerPolicy="no-referrer" onError={() => n < list.length - 1 && setN(n + 1)} />
}
