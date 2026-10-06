"""PlaySic API: pencarian YouTube Music (ytmusicapi, tidak resmi), lirik (LRCLIB), favorit & riwayat (SQLite)."""
import hashlib
import os
import re
import sqlite3
from contextlib import closing
from pathlib import Path
from urllib.parse import urlparse

import httpx
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from ytmusicapi import YTMusic

HERE = Path(__file__).parent
DB_PATH = Path(os.getenv("DB_PATH", HERE / "playsic.db"))
IMG_CACHE = HERE / "imgcache"
DIST = HERE.parent / "frontend" / "dist"

app = FastAPI(title="PlaySic")
ytm = YTMusic()  # tanpa login sudah cukup untuk search


def db() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


@app.on_event("startup")
def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with closing(db()) as con:
        con.executescript((HERE / "schema.sql").read_text())
        con.commit()


class Track(BaseModel):
    videoId: str
    title: str
    artists: str = ""
    album: str | None = None
    duration: str = ""
    seconds: int = 0
    thumb: str = ""


def row_to_track(r: sqlite3.Row) -> dict:
    return {"videoId": r["video_id"], "title": r["title"], "artists": r["artists"] or "", "album": r["album"],
            "duration": r["duration"] or "", "seconds": r["seconds"] or 0, "thumb": r["thumb"] or ""}


def _thumb(video_id: str, thumbs: list) -> str:
    url = thumbs[-1]["url"] if thumbs else ""
    # URL ytimg bertoken (sqp/rs) sering gagal dimuat -> pakai thumbnail standar yang selalu ada
    if "googleusercontent" in url or "ggpht" in url:
        return url
    return f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg"


def normalize(r: dict) -> dict | None:
    if not r.get("videoId"):
        return None
    thumbs = r.get("thumbnails") or []
    return {
        "videoId": r["videoId"],
        "title": r.get("title", ""),
        "artists": ", ".join(a["name"] for a in r.get("artists") or []),
        "album": (r.get("album") or {}).get("name"),
        "duration": r.get("duration") or "",
        "seconds": r.get("duration_seconds") or 0,
        "thumb": _thumb(r["videoId"], thumbs),
    }


@app.get("/api/search")
def search(q: str = Query(min_length=1), limit: int = 20):
    try:
        raw = ytm.search(q, filter="songs", limit=limit)
    except Exception as e:  # ytmusicapi tidak resmi, bisa berubah sewaktu-waktu
        raise HTTPException(502, f"YouTube Music error: {e}")
    return [t for t in map(normalize, raw) if t]


LRC_LINE = re.compile(r"\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)")


def parse_lrc(text: str) -> list[dict]:
    out = []
    for line in text.splitlines():
        m = LRC_LINE.match(line)
        if m and m.group(3).strip():
            out.append({"t": int(m.group(1)) * 60 + float(m.group(2)), "text": m.group(3).strip()})
    return out


@app.get("/api/lyrics")
def lyrics(title: str, artist: str = "", seconds: int = 0):
    """Ambil lirik dari LRCLIB (gratis, tanpa API key). Lirik tidak disimpan di server ini."""
    params = {"track_name": title, "artist_name": artist.split(",")[0]}
    if seconds:
        params["duration"] = seconds
    data = None
    with httpx.Client(timeout=10, headers={"User-Agent": "PlaySic/1.0"}) as c:
        try:
            r = c.get("https://lrclib.net/api/get", params=params)
            data = r.json() if r.status_code == 200 else None
            if not data:
                clean = re.sub(r"\s*[\(\[].*?[\)\]]", "", title).strip()
                r = c.get("https://lrclib.net/api/search", params={"track_name": clean, "artist_name": params["artist_name"]})
                res = r.json() if r.status_code == 200 else []
                data = res[0] if res else None
        except httpx.HTTPError:
            data = None
    if not data:
        return {"synced": [], "plain": None, "source": "none"}
    return {"synced": parse_lrc(data.get("syncedLyrics") or ""), "plain": data.get("plainLyrics"), "source": "lrclib"}


def _insert(con: sqlite3.Connection, table: str, t: Track) -> None:
    cols = (t.videoId, t.title, t.artists, t.album, t.duration, t.seconds, t.thumb)
    con.execute(f"INSERT OR REPLACE INTO {table} (video_id,title,artists,album,duration,seconds,thumb) VALUES (?,?,?,?,?,?,?)", cols)


@app.get("/api/favorites")
def get_favorites():
    with closing(db()) as con:
        return [row_to_track(r) for r in con.execute("SELECT * FROM favorites ORDER BY added_at DESC")]


@app.post("/api/favorites")
def add_favorite(t: Track):
    with closing(db()) as con:
        _insert(con, "favorites", t)
        con.commit()
    return {"ok": True}


@app.delete("/api/favorites/{video_id}")
def del_favorite(video_id: str):
    with closing(db()) as con:
        con.execute("DELETE FROM favorites WHERE video_id=?", (video_id,))
        con.commit()
    return {"ok": True}


@app.get("/api/history")
def get_history(limit: int = 30):
    with closing(db()) as con:
        rows = con.execute("SELECT * FROM history WHERE id IN (SELECT MAX(id) FROM history GROUP BY video_id) ORDER BY id DESC LIMIT ?", (limit,))
        return [row_to_track(r) for r in rows]


@app.post("/api/history")
def add_history(t: Track):
    with closing(db()) as con:
        con.execute("INSERT INTO history (video_id,title,artists,album,duration,seconds,thumb) VALUES (?,?,?,?,?,?,?)",
                    (t.videoId, t.title, t.artists, t.album, t.duration, t.seconds, t.thumb))
        con.commit()
    return {"ok": True}


@app.get("/api/img")
def img_proxy(u: str):
    """Proxy + cache gambar cover supaya tidak kena blokir referrer / rate-limit saat banyak gambar dimuat sekaligus."""
    host = urlparse(u).hostname or ""
    if not (host.endswith("googleusercontent.com") or host.endswith("ggpht.com") or host == "i.ytimg.com"):
        raise HTTPException(400, "host tidak diizinkan")
    IMG_CACHE.mkdir(exist_ok=True)
    f = IMG_CACHE / hashlib.sha1(u.encode()).hexdigest()
    if not f.exists():
        try:
            r = httpx.get(u, timeout=10, headers={"User-Agent": "Mozilla/5.0"}, follow_redirects=True)
        except httpx.HTTPError:
            raise HTTPException(502, "gagal mengambil gambar")
        if r.status_code != 200 or not r.content:
            raise HTTPException(404, "gambar tidak ada")
        f.write_bytes(r.content)
    return Response(f.read_bytes(), media_type="image/jpeg", headers={"Cache-Control": "public, max-age=604800"})


if DIST.exists():  # mode produksi: sajikan hasil build frontend
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{path:path}")
    def spa(path: str):
        f = DIST / path
        return FileResponse(f if f.is_file() else DIST / "index.html")
