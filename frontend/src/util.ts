/** Perbesar cover art dari googleusercontent (default kecil ~226px). */
export const big = (u: string) => u.replace(/=w\d+-h\d+[^/]*$/, '=w720-h720-l90-rj')

/** Lewatkan gambar remote lewat proxy backend (/api/img) yang punya cache. */
export const proxy = (u: string) => (u.startsWith('http') ? `/api/img?u=${encodeURIComponent(u)}` : u)
