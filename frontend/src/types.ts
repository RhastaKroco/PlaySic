export interface Track { videoId: string; title: string; artists: string; album?: string | null; duration: string; seconds: number; thumb: string }
export interface Line { t: number; text: string }
export interface Lyrics { synced: Line[]; plain: string | null; source: string }
export type View = 'home' | 'search' | 'favorites' | 'history'
