# StyleMirror Database Architecture & Security Model

## 1. Entity Relationship Overview

```
   ┌───────────────────┐
   │      fabrics      │
   │───────────────────│
   │ id (PK)           │
   │ name, slug        │
   │ benefits []       │
   │ care []           │
   │ best_seasons []   │
   │ breathability 1-5 │
   │ stretch 1-5       │
   │ durability 1-5    │
   └─────────▲─────────┘
             │ 1:N
   ┌─────────┴─────────┐       1:N       ┌───────────────────┐
   │     garments      ├─────────────────►   garment_colors  │
   │───────────────────│                 │───────────────────│
   │ id (PK)           │                 │ id (PK)           │
   │ name, slug        │                 │ garment_id (FK)   │
   │ category (enum)   │                 │ name, hex         │
   │ fit_type (enum)   │                 │ is_default        │
   │ fabric_id (FK)    │                 └───────────────────┘
   │ is_active         │       1:N       ┌───────────────────┐
   │ base_price        ├─────────────────►   garment_sizes   │
   │ thumbnail_url     │                 │───────────────────│
   └───────────────────┘                 │ id (PK)           │
                                         │ garment_id (FK)   │
   ┌───────────────────┐                 │ size_label        │
   │    size_charts    │                 │ glb_url [MOCK]    │
   │───────────────────│                 │ chest/waist/hip_cm│
   │ id (PK)           │                 │ shoulder/length/in│
   │ category, size    │                 └───────────────────┘
   │ chest_min / max   │
   │ waist_min / max   │
   │ hip_min / max     │
   │ height_min / max  │
   └───────────────────┘

   ┌───────────────────┐
   │     sessions      │ (Anonymous, ephemeral, 24h lifetime)
   │───────────────────│
   │ id (PK, UUID)     │
   │ created_at        │
   │ expires_at        │
   │ consent_given     │
   └─────────▲─────────┘
             │ 1:1
   ┌─────────┴─────────┐
   │   body_profiles   │ (Derived body measurements & estimates)
   │───────────────────│
   │ id (PK, UUID)     │
   │ session_id (FK)   │
   │ height_cm         │
   │ shoulder_cm       │
   │ chest_cm          │
   │ waist_cm, hip_cm  │
   │ inseam_cm         │
   │ torso_cm          │
   │ body_type         │
   │ skin_tone_hex     │
   │ undertone         │
   │ confidence (0-1)  │
   │ manual_overrides  │
   └───────────────────┘
```

---

## 2. Table Purposes & Design Choices

| Table | Purpose | Privacy & Access Level |
|---|---|---|
| `fabrics` | Master catalog of fabric materials, containing care guidelines, season suggestions, breathability/stretch scores, and skin sensitivity notes. | Public Read (anon & authenticated) |
| `garments` | Catalog of virtual garments across tops, bottoms, outerwear, caps, and dresses. Filtered by `is_active = true`. | Public Read (active only) |
| `garment_colors` | Colorways available per garment with hexadecimal color codes and default selection flag. | Public Read (active garments only) |
| `garment_sizes` | 3D garment variants for each size (`XS`–`XXL`) linking to 3D GLB assets and exact physical garment dimensions in centimeters. | Public Read (active garments only) |
| `size_charts` | Standard reference sizing boundaries used by the recommendation engine to map customer body dimensions to optimal sizes. | Public Read (anon & authenticated) |
| `sessions` | Anonymous visitor session tokens. Stores user consent and expiration timestamp (default: 24 hours). | **Locked down**: Zero anon access. Accessible strictly by backend service-role. |
| `body_profiles` | Estimated body dimensions, confidence score, and optional manual corrections. **Photos are never persisted**. | **Locked down**: Zero anon access. Accessible strictly by backend service-role. |

---

## 3. Row Level Security (RLS) Policy Model

1. **Defense in Depth**: Every single table has `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;` enabled.
2. **Catalog Isolation**:
   - `fabrics` and `size_charts` have public `SELECT` policies for all users.
   - `garments` has a public `SELECT` policy restricted to `WHERE is_active = true`.
   - `garment_colors` and `garment_sizes` have public `SELECT` policies using an `EXISTS` subquery verifying the parent garment is active.
   - No public `INSERT`, `UPDATE`, or `DELETE` policies exist on catalog tables.
3. **Session & Profile Lockdown**:
   - `sessions` and `body_profiles` intentionally have **zero** policies for `anon` or `authenticated` roles.
   - Under PostgreSQL RLS semantics, a table with RLS enabled and no matching policy denies all operations to unprivileged roles.
   - Only requests presenting the Supabase `service_role` key (used exclusively in the FastAPI backend) can read or modify sessions and body profiles.
4. **Storage Security**:
   - The `garment-models` bucket is marked public for fast CDN-cached asset delivery of GLBs and thumbnails.
   - Direct file upload/mutation permissions on `storage.objects` are restricted to `service_role`.
   - **No storage bucket exists or will ever be created for user images**, complying with Rule 5.

---

## 4. Lifecycle & Auto-Cleanup

- Sessions default to `expires_at = now() + interval '24 hours'`.
- Foreign key `body_profiles.session_id` is declared with `ON DELETE CASCADE`.
- A database function `delete_expired_sessions()` automatically deletes all sessions where `expires_at < timezone('utc', now())`.
- When `pg_cron` is enabled, an hourly job (`delete-expired-sessions-hourly`) executes this function.
- If running in an environment without `pg_cron`, the backend service triggers this function via an hourly scheduled background task.
