# StyleMirror: Production Deployment Guide

---

## 1. Production Architecture Overview

In a typical production deployment:
* **Frontend + Reverse Proxy:** Multi-stage Nginx container running on port 80/443.
* **Backend API:** FastAPI running under Uvicorn in Python 3.11-slim container.
* **Database & Auth:** Managed Hosted Supabase project with Row Level Security enabled.
* **TLS / SSL:** Automated HTTPS via Caddy reverse proxy profile or Cloudflare Tunnel.

---

## 2. Docker Deployment on a VPS (Ubuntu / Debian / AWS EC2)

### Step 1: Install Docker & Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Step 2: Clone Repository & Configure Environment
```bash
git clone https://github.com/piyush5614/Stylo.git stylemirror
cd stylemirror
cp .env.example .env
nano .env   # Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DOMAIN
```

### Step 3: Run with Docker Compose
```bash
# Standard HTTP (port 80)
docker compose up -d --build

# Automated HTTPS with Caddy (port 443 + auto SSL)
docker compose --profile https up -d --build
```

### Step 4: Verify Deployment Health
```bash
docker compose ps
curl -f http://localhost/api/v1/health
```

---

## 3. Alternative PaaS Deployments

### A. Frontend on Vercel
1. Set Root Directory to `apps/web`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`. Output Directory: `dist`.
4. Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `VITE_API_BASE_URL`: URL of your deployed FastAPI backend (e.g. `https://api.yourdomain.com`).

### B. Backend on Render / Railway
1. Set Root Directory to `apps/api`.
2. Build Command: `pip install -e .`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
4. Environment Variables:
   - `SUPABASE_URL`: Your Supabase URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your secret key.
   - `CORS_ORIGINS`: Your Vercel frontend URL.

---

## 4. Updates & Rollback Procedure

### Zero-Downtime Rolling Update:
```bash
git pull origin master
docker compose build
docker compose up -d --no-deps web api
```

### Rollback:
```bash
git checkout <previous-commit-hash>
docker compose up -d --build
```

---

## 5. Camera & HTTPS Notes for Mobile LAN Testing

Browsers strictly restrict camera access (`navigator.mediaDevices.getUserMedia`) to secure contexts:
* `http://localhost` (supported for local development)
* `https://*` (mandatory when accessing via local Wi-Fi or LAN IP)

### Option A: Local Caddy HTTPS
Set `DOMAIN=your-computer-name.local` in `.env` and run:
```bash
docker compose --profile https up -d
```

### Option B: Cloudflare Tunnel (Quickest for Mobile Demo)
```bash
cloudflared tunnel --url http://localhost:80
```
Use the generated `https://*.trycloudflare.com` link on any smartphone.
