# PlaySic

Web app musik bergaya aplikasi: cari lagu di **YouTube Music**, putar, dan ikuti **lirik tersinkron**.

| Lapisan | Bahasa / teknologi |
|---|---|
| Backend API | Python 3 + FastAPI, `ytmusicapi` (pencarian YT Music), `httpx` |
| Frontend | TypeScript + React (Vite) |
| Styling | SCSS |
| Database | SQL (SQLite): favorit & riwayat |
| Deploy | Dockerfile, docker-compose (YAML), shell script |

## Jalankan (dev)
Butuh Python 3.10+ dan Node 18+.

    ./run.sh            # backend :8000 + frontend :5173 -> buka http://localhost:5173

Manual:

    cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload
    cd frontend && npm install && npm run dev

## Jalankan (Docker)
    docker compose up --build      # http://localhost:8000

## Cara kerja
- `GET /api/search?q=` mencari lagu via ytmusicapi (library tidak resmi, bisa berubah sewaktu-waktu).
- Pemutaran memakai **YouTube IFrame Player** resmi (video tetap tampil di panel kanan).
- `GET /api/lyrics` mengambil lirik tersinkron dari LRCLIB.org (gratis). Server ini tidak menyimpan lirik.
- Pencarian dilakukan berdasarkan judul/artis/album, bukan potongan isi lirik.
