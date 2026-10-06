-- Skema SQLite PlaySic
CREATE TABLE IF NOT EXISTS favorites (
  video_id TEXT PRIMARY KEY,
  title    TEXT NOT NULL,
  artists  TEXT,
  album    TEXT,
  duration TEXT,
  seconds  INTEGER DEFAULT 0,
  thumb    TEXT,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS history (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id  TEXT NOT NULL,
  title     TEXT NOT NULL,
  artists   TEXT,
  album     TEXT,
  duration  TEXT,
  seconds   INTEGER DEFAULT 0,
  thumb     TEXT,
  played_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_history_played ON history (played_at DESC);
