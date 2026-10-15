# StyleMirror: Deep Technical Project Handover & Context

---

## 1. Product Vision & Target Users
**StyleMirror** bridges the gap between digital e-commerce and physical fitting rooms. By estimating body proportions from standard browser camera feeds and fitting pre-graded 3D garments to a parametric avatar, StyleMirror solves the primary pain points in apparel retail: size uncertainty, high return rates, and fit dissatisfaction.

### Key Target Users:
* **Online Shoppers:** Seek confidence in size selection and silhouette balance without ordering multiple sizes to return.
* **Fashion Retailers:** Require explainable recommendations, transparent textile science, and drastic return reduction without requiring expensive 3D hardware.

---

## 2. Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Cam as Web MediaPipe
    participant Web as React/Vite SPA (Nginx)
    participant API as FastAPI Backend
    participant DB as Hosted Supabase

    User->>Web: Start Scan & Grant Ephemeral Consent
    Web->>API: POST /api/v1/sessions (24h UUID)
    API-->>Web: Session ID + Expiry
    User->>Cam: 4-Angle Poses (Front, Right, Back, Left)
    Cam->>API: POST /api/v1/measurements/analyze (Volatile RAM)
    Note over API: Ramanujan Elliptical Math & Silhouette Edge Detection
    Note over API: Discard images immediately from memory
    API->>DB: Save derived body_profiles linked to session
    API-->>Web: Return 7 Anthropometric Dimensions
    Web->>Web: Morph Parametric Avatar Bone Hierarchy
    Web->>API: GET /api/v1/recommendations
    API-->>Web: Deterministic Style Picks + Affirmative Reasons
    Web->>Web: Render Procedural Garment on Rigged Avatar
```

---

## 3. Module Status Table

| Module | Core Purpose | Key Source Files | Status | Known Limitations |
| :--- | :--- | :--- | :--- | :--- |
| **1. Session & Consent** | Anonymous session tokens, 24h expiration, instant purge | `apps/api/app/api/v1/sessions.py`<br>`apps/web/src/components/feedback/ConsentModal.tsx` | **Done** | Requires local storage access in browser |
| **2. Guided Camera Scan** | Live viewfinder, landmark alignment, silhouette overlay | `apps/web/src/features/capture/CameraPoseViewfinder.tsx`<br>`SilhouetteOverlay.tsx` | **Done** | Dependent on consistent device lighting |
| **3. Measurement Estimation** | Ramanujan ellipse projection, circumferences, height calibration | `apps/api/app/services/measurement.py` | **Done** | Algorithmic estimation variance ±1.8% MAPE vs tape |
| **4. 3D Parametric Avatar** | Bone scaling corresponding to 7 primary landmarks | `apps/web/src/features/avatar/RiggedAvatarMesh.tsx` | **Done** | Parametric mesh approximation |
| **5. Virtual Try-On** | Bind pre-graded garments (XS–XXL) to avatar skeleton | `apps/web/src/features/tryon/ProceduralGarment.tsx` | **Done** | No non-deterministic real-time cloth physics |
| **6. Explainable Suggestions** | Rule-based proportion and colorway scoring with reasons | `apps/api/app/services/recommendation.py`<br>`apps/api/app/rules/style_rules.json` | **Done** | Rules require catalog taxonomy tagging |
| **7. Fabric Science Hub** | Textile breathability, stretch, durability ratings & care | `apps/api/app/services/fabric.py`<br>`apps/web/src/app/pages/FabricsPage.tsx` | **Done** | Predefined in catalog database |

---

## 4. Key Technical Decisions with Rationale

1. **Parametric Bone Avatar vs. Neural NeRF / SMPL:**
   - *Decision:* Rigged parametric bone mesh that updates dynamically in Three.js.
   - *Rationale:* Zero latency, runs on any mobile/desktop GPU in client WebGL without expensive cloud GPU clusters.
2. **Pre-Fitted Garment Sizes vs. Real-Time Cloth Simulation:**
   - *Decision:* Pre-graded GLBs bound to avatar bones; fine ease adjustment via morph scaling.
   - *Rationale:* Client-side cloth simulation is fragile, prone to mesh clipping, and drains device batteries.
3. **Deterministic Rules vs. Black-Box Machine Learning:**
   - *Decision:* External JSON rules mapping proportions to neckline and fit geometry.
   - *Rationale:* Explainability is critical. Users and retailers must see *why* an item was picked.
4. **Nginx Reverse Proxy (`/api/`):**
   - *Decision:* Web container proxies all API requests internally to the API container.
   - *Rationale:* Eliminates CORS complexities in production, enables single-origin deployment, and prevents port exposure.

---

## 5. Mock & Seed Data Inventory

All catalog data is grounded in verified SQL migrations and reproducible seeds:
* `supabase/migrations/20261011000001_initial_schema.sql` (Tables: `sessions`, `body_profiles`, `fabrics`, `garments`, `garment_colors`, `garment_sizes`)
* `supabase/seed/seed_data.sql` (Seed catalog with real dimensions, color hexes, and textile ratings)
* `apps/api/app/rules/style_rules.json` (Proportion rules, color palettes, stature rules)

---

## 6. Glossary of Terms
* **Ramanujan Ellipse:** Mathematical formula estimating circumference $C \approx \pi [3(a+b) - \sqrt{(3a+b)(a+3b)}]$ using orthogonal coronal and sagittal body projections.
* **Morph Target:** Blend shape permitting fine mesh adjustments along specified vertex axes.
* **Ease Allowance:** Difference in centimeters between garment dimension and body dimension (e.g. +6 cm chest ease for relaxed fit).
* **GLB:** Binary container format for 3D glTF scenes, embedded textures, and skeletal hierarchies.
* **RLS (Row Level Security):** Postgres policy layer enforcing anonymous read access on catalogs and session-restricted access on body profiles.
