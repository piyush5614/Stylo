# StyleMirror: 3D Virtual Try-On & Personal Style Advisor

StyleMirror is a privacy-first, browser-based virtual fitting room and style advisor. By combining in-memory computer vision, 3D parametric avatar generation, pre-graded virtual try-on, and explainable rule-based fashion theory, StyleMirror gives shoppers confidence in apparel fit and sizing while drastically reducing retailer return rates.

---

## The 7 Core Modules
1. **Anonymous Session & Ephemeral Consent:** 24-hour expiring sessions with instant user-initiated data purge.
2. **Guided 4-Angle Camera Scan:** Real-time posture silhouette alignment for front, right, back, and left poses.
3. **Zero-Storage Ramanujan Measurement Engine:** In-memory image processing extracting 7 primary anthropometric dimensions (MAPE ~1.8%).
4. **3D Parametric Avatar:** Client-side WebGL avatar morphed via bone scaling to match user dimensions.
5. **Virtual Try-On & Sizing:** Pre-graded 3D garments (XS–XXL) bound to avatar bones with instant shader color switching.
6. **Explainable Recommendations:** 100% deterministic styling picks with positive, affirmative plain-language reasons.
7. **Textile Science & Care Hub:** Interactive fabric breathability, stretch, durability ratings, and sustainability care guides.

---

## Quick Start (Docker)

Run the entire system (Frontend, Backend, Nginx Proxy) in 3 commands:

```bash
# 1. Clone the repository
git clone https://github.com/piyush5614/Stylo.git stylemirror && cd stylemirror

# 2. Configure environment variables
cp .env.example .env

# 3. Build and launch all containers
docker compose up -d --build
```
Open **[http://localhost](http://localhost)** in your browser.

---

## Local Development (Without Docker)

### 1. Backend (FastAPI + Python 3.11+)
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (React 18 + Vite)
```bash
cd apps/web
npm install
npm run dev                     # http://localhost:5173
```

---

## Environment Variables

| Variable | Service | Secret? | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Compose | No | Host port mapping | `80` |
| `DOMAIN` | Compose (Caddy) | No | Domain for automated HTTPS | `localhost` |
| `VITE_SUPABASE_URL` | Frontend | No | Public Supabase endpoint | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Frontend | No | Public Supabase Anon token | `eyJhbGciOi...` |
| `SUPABASE_URL` | Backend | No | Backend Supabase endpoint | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | **YES** | Secret key for session management | `eyJhbGciOi...` |
| `CORS_ORIGINS` | Backend | No | Allowed CORS origins | `http://localhost,http://localhost:5173` |
| `LOG_LEVEL` | Backend | No | Logging verbosity | `info` |
| `LLM_API_KEY` | Backend | **YES** | Optional Gemini API key for commentary | `AIzaSy...` |

---

## Repository Structure

```
stylemirror/
├── apps/
│   ├── api/             # FastAPI backend, Ramanujan math & recommendation rules
│   │   ├── app/         # Routers, schemas, services, and tests
│   │   ├── Dockerfile   # Multi-stage non-root Python runtime
│   │   └── pyproject.toml
│   └── web/             # React 18, Vite, Three.js & Tailwind CSS
│       ├── src/         # Features (avatar, capture, recommendations, tryon)
│       ├── Dockerfile   # Multi-stage Nginx build with /api/ reverse proxy
│       └── nginx.conf   # Production Nginx routing & security headers
├── docs/                # Architectural diagrams, API specs, and limitations
│   ├── architecture.md  # System architecture & Mermaid flowcharts
│   ├── deployment.md    # VPS, Docker, and PaaS deployment guide
│   ├── limitations.md   # Accuracy benchmarks vs. physical tape measurement
│   ├── PROJECT_CONTEXT.md # Comprehensive developer handover document
│   └── recommendation-rules.md # Editable style rules configuration
├── supabase/            # PostgreSQL migrations, RLS policies, and seed catalog
├── AGENTS.md            # Mandatory engineering instructions for AI agents
├── docker-compose.yml   # Production compose setup with healthchecks
└── Makefile             # Automation targets (docker-up, docker-test, etc.)
```

---

## Common Commands
* **Run Tests:** `make docker-test` or `cd apps/api && python -m pytest`
* **Build Frontend:** `cd apps/web && npm run build`
* **Lint Backend:** `cd apps/api && ruff check .`
* **Validate Garments:** `python apps/api/scripts/validate_garment.py <path-to-model.glb>`

---

## Camera, Mobile & HTTPS Troubleshooting
Browsers strictly require a **Secure Context** (`https://*` or `http://localhost`) to grant webcam access.
* **Local Laptop Testing:** Access via `http://localhost`. Camera opens automatically.
* **Mobile / LAN Testing:** Launch with the HTTPS profile:
  ```bash
  docker compose --profile https up -d
  ```
  Or create an instant temporary tunnel via Cloudflare:
  ```bash
  cloudflared tunnel --url http://localhost:80
  ```

---

## Limitations & Honest Accuracy
* **Algorithmic Nature:** Body measurements are approximations derived from 2D projections. Designed for apparel advisory, not bespoke tailoring or medical use.
* **Average Variance:** Evaluated at **~1.8% MAPE** across chest, waist, and hip circumferences under controlled conditions.
* See [docs/limitations.md](file:///c:/Users/asus4/Desktop/New%20Gen%20Project/stylemirror/docs/limitations.md) for full benchmark comparison tables.

---

## License & Third-Party Credits
* **License:** Private – All rights reserved.
* Built with Three.js, React, FastAPI, MediaPipe, and Tailwind CSS.
