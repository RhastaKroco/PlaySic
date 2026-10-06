const P: Record<string, string> = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  search: 'M11 4a7 7 0 1 0 4.2 12.6l4.6 4.6 1.4-1.4-4.6-4.6A7 7 0 0 0 11 4z',
  heart: 'M12 21s-8-5.4-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.6-8 11-8 11z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm1 4h-2v6l4.5 2.7 1-1.6-3.5-2.1z',
  play: 'M7 4v16l13-8z',
  pause: 'M6 4h4v16H6zm8 0h4v16h-4z',
  next: 'M5 5l10 7-10 7zM17 5h2v14h-2z',
  prev: 'M19 5L9 12l10 7zM5 5h2v14H5z',
  lyrics: 'M4 5h16v2H4zm0 6h16v2H4zm0 6h10v2H4z',
  down: 'M5 9l7 7 7-7',
  shuffle: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  repeat: 'M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3',
  close: 'M5 5l14 14M19 5L5 19',
}
export default function Icon({ n, s = 20, fill = true }: { n: string; s?: number; fill?: boolean }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="2" strokeLinecap="round">
      <path d={P[n]} />
    </svg>
  )
}
