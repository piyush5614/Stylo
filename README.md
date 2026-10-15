# StyleMirror – 3D Virtual Try-On & Style Advisor

A browser-based application that guides users through capturing photos, estimates body measurements, builds a 3D avatar, fits virtual garments, and delivers personalised style recommendations.

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Python 3.11+ and pip
- A Supabase project (see `.env.example`)

### Frontend (React + Vite)

```bash
cd apps/web
npm install
npm run dev          # http://localhost:5173
```

### Backend (FastAPI)

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

### Environment Variables

Copy `.env.example` to `.env` in both `apps/web/` and `apps/api/`, and fill in your Supabase credentials.

## Repository Layout

```
stylemirror/
  apps/
    web/          React 18 + Vite + TypeScript frontend
    api/          FastAPI + Python backend
  supabase/       Migrations and seed data
  docs/           Architecture, API docs, decisions
```

## License

Private – all rights reserved.
