# StyleMirror: Engineering Brief & Instructions for AI Agents

Welcome to StyleMirror. This document provides clear, binding operational instructions for any AI assistant or autonomous pair-programming agent working on this codebase.

---

## 1. What This Project Is (In 10 Lines)
1. **StyleMirror** is a browser-based, privacy-first virtual fitting room and style advisor.
2. It guides users through an in-memory 4-angle guided scan (front, right, back, left).
3. **Zero Photo Storage Policy:** Photos are never written to permanent disk or cloud buckets; estimations occur in volatile RAM and images are immediately discarded.
4. Anthropometric measurements are calculated using Ramanujan elliptical approximations.
5. A 3D parametric avatar is morphed to the user's specific measurements via bone scaling.
6. Garment GLBs (XS–XXL) bind to the avatar's bone hierarchy without non-deterministic cloth physics.
7. Garment colors are swapped via Three.js material shader uniforms, not new model downloads.
8. Style recommendations are 100% deterministic, governed by editable rules in `apps/api/app/rules/style_rules.json`.
9. Positive, affirmative language is mandatory; zero black-box scoring is permitted.
10. Anonymous sessions and measurements expire automatically in 24 hours with instant manual purge.

---

## 2. Mandatory Engineering Rules
* **Small, Verified Steps:** Make one focused modification at a time and verify immediately.
* **Inspect Before Editing:** Never assume a function or schema exists; inspect the active codebase first.
* **No Speculative or Hallucinated Data:** Ground all implementation in actual files.
* **Zero Photo Retention:** Never save, log, or persist user camera frames or images.
* **Secrets Isolation:** Never commit or expose `SUPABASE_SERVICE_ROLE_KEY` to frontend bundles.
* **Accuracy Transparency:** Never claim tailored tape-measure precision. Measurements are algorithmic estimates.
* **Strict Typing:** All TypeScript code must pass `tsc -b` and all Python code must pass Ruff/Pytest.
* **Explicit Inquiries:** If an architectural design choice is ambiguous, clarify before executing.

---

## 3. Where to Look First (Quick Routing)

| If you want to change or inspect... | Look in this file / directory... |
| :--- | :--- |
| **Guided camera pose & viewfinder** | `apps/web/src/features/capture/CameraPoseViewfinder.tsx` |
| **Silhouette alignment overlays** | `apps/web/src/features/capture/SilhouetteOverlay.tsx` |
| **Measurement algorithms (ellipses)** | `apps/api/app/services/measurement.py` |
| **Size selection & ease allowances** | `apps/api/app/services/sizing.py` |
| **3D Avatar & bone transformations** | `apps/web/src/features/avatar/RiggedAvatarMesh.tsx` |
| **Garment 3D procedural fitting** | `apps/web/src/features/tryon/ProceduralGarment.tsx` |
| **Recommendation rules (necklines, fits)** | `apps/api/app/rules/style_rules.json` |
| **Recommendation scoring service** | `apps/api/app/services/recommendation.py` |
| **Textile intelligence & care meters** | `apps/api/app/services/fabric.py` & `apps/web/src/features/fabrics/` |
| **API Routers (Sessions, Catalog, Fit)** | `apps/api/app/api/v1/` |
| **Docker & Nginx routing** | `docker-compose.yml`, `apps/web/nginx.conf` |

---

## 4. Coding Conventions & Standards

### Frontend (TypeScript / React 18):
* Use functional components with explicit interfaces.
* Use Tailwind CSS classes matching the dark theme design system (`bg-neutral-900`, `text-amber-400`, etc.).
* State stores are separated by domain in `apps/web/src/features/**` or `apps/web/src/stores/**`.
* No inline secrets or environment leaks.

### Backend (Python 3.11+ / FastAPI):
* Pydantic v2 schemas for all inputs and responses.
* Type annotations on all functions.
* Clean separation of API routes (`app/api/v1/`), business services (`app/services/`), and data layer (`app/db/`).
* Standard asynchronous routes (`async def`).

---

## 5. Standard Recipes for Frequent Tasks

### A. How to Add a New Garment:
1. Append garment metadata and size measurements to `supabase/seed/seed_data.sql`.
2. Ensure sizes (XS–XXL) specify standard dimensions (`chest_cm`, `waist_cm`, `hip_cm`, etc.).
3. Verify GLB model passes triangle budget (<30k) using `apps/api/scripts/validate_garment.py`.

### B. How to Add a New Fabric:
1. Add the fabric record in `supabase/seed/seed_data.sql` and update `app/db/fabrics.py`.
2. Provide textile ratings in `app/services/fabric.py` (`stretch_rating`, `breathability_rating`, `durability_rating`).
3. Add care instructions and climate suitability notes.

### C. How to Add a New Style / Recommendation Rule:
1. Open `apps/api/app/rules/style_rules.json`.
2. To add a neckline or fit preference for a body shape, edit `body_type_rules`.
3. To add compatible undertone hues, add 6-digit hex codes to `color_rules`.
4. Ensure all user-facing reasons use affirmative, non-judgmental phrasing.

### D. How to Add a New API Endpoint:
1. Define response schema in `apps/api/app/schemas/`.
2. Implement route handler under `apps/api/app/api/v1/`.
3. Add table-driven unit test in `apps/api/app/tests/`.
4. Run `pytest` to confirm 100% pass rate.

---

## 6. Definition of Done for Any Pull Request / Commit
- [ ] Code passes linter without warnings (`ruff check` or `tsc -b`).
- [ ] All automated tests pass (`python -m pytest`).
- [ ] Frontend builds cleanly with zero errors (`npm run build`).
- [ ] No secrets or personal photos exposed or written to disk.
- [ ] Documentation updated if schemas or rules were modified.
