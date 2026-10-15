# StyleMirror API Contract

This document serves as the single source of truth for the API contract between the StyleMirror frontend and backend.

## Base URL
`/api/v1`

---

## 1. System & Health

### 1.1 Health Check
Checks service operational status.

- **URL:** `/health`
- **Method:** `GET`
- **Auth:** None (Public)
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "version": "0.1.0",
    "timestamp": "2026-10-11T14:40:00.000000+00:00"
  }
  ```

---

## 2. Sessions

### 2.1 Create Anonymous Session
Initializes an anonymous session requiring explicit camera usage consent. Expired automatically after 24 hours.

- **URL:** `/sessions`
- **Method:** `POST`
- **Auth:** None (Public)
- **Request Body:**
  ```json
  {
    "consent_given": true
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "id": "e8d91c1b-b46f-4b07-bf39-ec9cebb7349b",
    "created_at": "2026-10-11T15:00:00.000000+00:00",
    "expires_at": "2026-10-12T15:00:00.000000+00:00",
    "consent_given": true
  }
  ```
- **Response `400 Bad Request`:**
  ```json
  {
    "error": "Explicit consent is required to begin virtual try-on."
  }
  ```

---

## 3. Catalog (Public Read)

### 3.1 List Garments
Returns active catalog garments with optional filtering and pagination.

- **URL:** `/catalog/garments`
- **Method:** `GET`
- **Query Parameters:**
  - `category` (optional, string: `top`, `bottom`, `outerwear`, `cap`, `dress`)
  - `occasion` (optional, string: `Casual`, `Workplace`, etc.)
  - `fabric_id` (optional, UUID string)
  - `limit` (optional, integer: default `20`)
  - `offset` (optional, integer: default `0`)
- **Response `200 OK`:**
  ```json
  {
    "items": [
      {
        "id": "b0000001-0000-0000-0000-000000000001",
        "name": "Essential Minimalist Tee",
        "slug": "essential-minimalist-tee",
        "category": "top",
        "fit_type": "regular",
        "neckline": "Crewneck",
        "length": "Waist Length",
        "pattern": "Solid",
        "occasion": ["Casual", "Daily Wear"],
        "fabric_id": "a0000001-0000-0000-0000-000000000001",
        "fabric_name": "Organic Cotton",
        "base_price": 34.00,
        "is_active": true,
        "thumbnail_url": "https://storage.placeholder.stylemirror.internal/thumbnails/top-crewneck.webp"
      }
    ],
    "total": 6,
    "limit": 20,
    "offset": 0
  }
  ```

### 3.2 Get Garment Details
Retrieves single garment details including colors, sizes, and associated fabric profile.

- **URL:** `/catalog/garments/{slug}`
- **Method:** `GET`
- **Response `200 OK`:**
  ```json
  {
    "id": "b0000001-0000-0000-0000-000000000001",
    "name": "Essential Minimalist Tee",
    "slug": "essential-minimalist-tee",
    "category": "top",
    "fit_type": "regular",
    "fabric_id": "a0000001-0000-0000-0000-000000000001",
    "fabric_name": "Organic Cotton",
    "base_price": 34.00,
    "is_active": true,
    "thumbnail_url": "https://storage.placeholder.stylemirror.internal/thumbnails/top-crewneck.webp",
    "fabric": {
      "id": "a0000001-0000-0000-0000-000000000001",
      "name": "Organic Cotton",
      "slug": "cotton",
      "description": "Breathable, soft, natural plant fiber.",
      "benefits": ["Highly breathable", "Soft hand-feel"],
      "care_instructions": ["Machine wash warm (40°C)"],
      "best_seasons": ["Spring", "Summer", "Autumn", "Winter"],
      "breathability": 5,
      "stretch": 2,
      "durability": 4,
      "skin_sensitivity_note": "Excellent for sensitive skin."
    },
    "colors": [
      {
        "id": "c1",
        "name": "Optic White",
        "hex": "#FFFFFF",
        "is_default": true
      }
    ],
    "sizes": [
      {
        "id": "s1",
        "size_label": "M",
        "glb_url": "https://mock-storage.stylemirror.internal/models/tee_m.glb#mock_placeholder",
        "chest_cm": 98.0,
        "waist_cm": 86.0,
        "hip_cm": 100.0,
        "shoulder_cm": 45.0,
        "length_cm": 70.0,
        "inseam_cm": null
      }
    ]
  }
  ```
- **Response `404 Not Found`:**
  ```json
  {
    "error": "Garment 'non-existent' not found"
  }
  ```

### 3.3 List Fabrics
Returns all fabric specifications with care and breathability ratings.

- **URL:** `/catalog/fabrics`
- **Method:** `GET`
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "a0000001-0000-0000-0000-000000000001",
      "name": "Organic Cotton",
      "slug": "cotton",
      "description": "Breathable, soft, natural plant fiber.",
      "benefits": ["Highly breathable"],
      "care_instructions": ["Machine wash warm"],
      "best_seasons": ["All Season"],
      "breathability": 5,
      "stretch": 2,
      "durability": 4,
      "skin_sensitivity_note": "Hypoallergenic"
    }
  ]
  ```

### 3.4 Get Fabric Details
- **URL:** `/catalog/fabrics/{slug}`
- **Method:** `GET`
- **Response `200 OK`:** Single fabric JSON object.
- **Response `404 Not Found`:**
  ```json
  {
    "error": "Fabric 'unknown' not found"
  }
  ```
