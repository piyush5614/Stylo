# StyleMirror: Project Changelog

All notable changes across development milestones (Parts 1 through 11).

---

## [Part 11] - 2026-10-16: Containerisation & Handover Documentation
- **Docker Multi-Stage Builds:** Multi-stage non-root `Dockerfile` for FastAPI backend and multi-stage Nginx container for Vite frontend.
- **Single-Origin Architecture:** Nginx internal proxy on `/api/` routing to the API container.
- **Reverse Proxy Profile:** Added optional Caddy profile in `docker-compose.yml` for automated SSL on LAN/domain testing.
- **Handover Documentation:** Authored `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, and `docs/deployment.md`.

## [Part 10] - 2026-10-16: LLM-Written Styling Commentary (Upgrade C)
- **Stylist Commentary Engine:** Added `apps/api/app/services/llm_stylist.py` providing AI capsule summaries and item stylist quotes.
- **Rule Decoupling:** Grounded LLM commentary strictly on deterministic rule selections.
- **Frontend Presentation:** Capsule summary banners and stylist quote highlights on recommendation cards.

## [Part 9] - 2026-10-16: End-to-End Integration, Hardening & Git Link
- **Repository Setup:** Linked workspace to GitHub origin (`https://github.com/piyush5614/Stylo.git`).
- **Instant Data Purge:** Added "Delete My Data Now" action on `/privacy` invoking `DELETE /api/v1/sessions/me`.
- **Textile Science Hub:** Created dedicated `/fabrics` page with radar meters and garment try-on links.
- **System Architecture:** Authored `docs/architecture.md` with complete Mermaid data flowcharts.

## [Part 8] - 2026-10-15: Personalised Suggestions & Colour Analysis
- **Rule-Based Engine:** Implemented `apps/api/app/rules/style_rules.json` for proportion and colorway matching.
- **Suggestions Dashboard:** Created `/suggestions` with affirmative reasons, size recommendations, and undertone swatches.
- **Textile Drawer:** Created `FabricDrawer.tsx` detailing breathability, stretch, and durability performance.

## [Part 7] - 2026-10-15: Garment Assets & Try-On Pipeline
- **Validation Script:** Created `apps/api/scripts/validate_garment.py` for triangle budget and skeleton checks.
- **Procedural Try-On:** Built `ProceduralGarment.tsx` for bone-bound clothing overlay and material shader color switching.
- **Pipeline Guide:** Authored `docs/garment-pipeline.md`.

## [Part 6] - 2026-10-14: 3D Avatar Generation & Bone Mapping
- **Parametric Avatar:** Developed `RiggedAvatarMesh.tsx` and bone scaling system driven by Ramanujan measurements.
- **Viewer Controls:** 360-degree rotation, wireframe toggles, and measurement dimension callouts.

## [Part 5] - 2026-10-13: Ramanujan Elliptical Measurement Engine
- **In-Memory Pose Processing:** Computer vision algorithms estimating 7 primary body circumferences.
- **Zero Storage Guarantee:** Enforced ephemeral RAM processing without disk retention.
- **Documentation:** Authored `docs/measurement-method.md` and `docs/limitations.md`.

## [Part 4] - 2026-10-12: Guided 4-Angle Camera Scan
- **Capture Flow:** Guided frontend capture interface with real-time silhouette overlay and landmark validation.
- **Camera Viewfinder:** Front, right, back, and left pose capture sequencing.

## [Part 3] - 2026-10-11: Database Architecture & RLS Security
- **Supabase Schema:** Authored migrations for sessions, profiles, garments, and fabrics with strict RLS policies.
- **24-Hour Cleanup:** Automated database expiration routines.

## [Part 2] - 2026-10-11: Design System & Web Foundations
- **Design Tokens:** Dark-themed glassmorphism aesthetic, typography, and reusable UI components.
- **App Shell:** Navigation header, route configuration, and theme providers.

## [Part 1] - 2026-10-10: Project Setup & Architecture Planning
- **Repository Layout:** Vite + React frontend and FastAPI backend monorepo structure.
- **API Specification:** Initialized OpenAPI schemas and project guidelines.
