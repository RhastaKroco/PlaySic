// Service worker PlaySic: network-first untuk aplikasi, cache-first untuk cover (/api/img). API lain tidak di-cache.
const V = 'playsic-v1'
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())
))
self.addEventListener('fetch', e => {
  const r = e.request
  if (r.method !== 'GET') return
  const u = new URL(r.url)
  if (u.origin !== location.origin) return
  if (u.pathname.startsWith('/api/img')) {
    e.respondWith(caches.open(V).then(async c => {
      const hit = await c.match(r); if (hit) return hit
      const n = await fetch(r); if (n.ok && n.status === 200) c.put(r, n.clone()); return n
    }))
    return
  }
  if (u.pathname.startsWith('/api/')) return
  e.respondWith(fetch(r).then(n => {
    if (n.ok && n.status === 200) { const cp = n.clone(); caches.open(V).then(c => c.put(r, cp)) }
    return n
  }).catch(() => caches.match(r).then(m => m || caches.match('/'))))
})
