"""Repositories for fabrics and garments database interactions."""

from typing import Any

from app.db.client import get_supabase_client
from app.schemas.catalog import (
    FabricResponse,
    GarmentColorResponse,
    GarmentDetailResponse,
    GarmentSizeResponse,
    GarmentSummaryResponse,
)

# Seed fallback data used when running without live Supabase credentials (e.g. initial testing)
FALLBACK_FABRICS = [
    {
        "id": "a0000001-0000-0000-0000-000000000001",
        "name": "Organic Cotton",
        "slug": "cotton",
        "description": "Breathable, soft, natural plant fiber suitable for everyday comfort.",
        "benefits": ["Highly breathable", "Soft hand-feel", "Hypoallergenic", "Biodegradable"],
        "care_instructions": ["Machine wash warm (40°C)", "Tumble dry low", "Iron on medium heat"],
        "best_seasons": ["Spring", "Summer", "Autumn", "Winter"],
        "breathability": 5,
        "stretch": 2,
        "durability": 4,
        "skin_sensitivity_note": "Excellent for sensitive skin due to zero synthetic residues.",
    },
    {
        "id": "a0000001-0000-0000-0000-000000000002",
        "name": "Pure Linen",
        "slug": "linen",
        "description": "Flax-derived luxury textile renowned for exceptional cooling and texture.",
        "benefits": ["Maximum airflow", "Moisture-wicking", "Naturally antimicrobial"],
        "care_instructions": ["Gentle cold cycle", "Line dry recommended", "Iron while damp"],
        "best_seasons": ["Summer", "Late Spring"],
        "breathability": 5,
        "stretch": 1,
        "durability": 4,
        "skin_sensitivity_note": "Hypoallergenic and breathable.",
    },
    {
        "id": "a0000001-0000-0000-0000-000000000004",
        "name": "Merino Wool",
        "slug": "wool",
        "description": "Fine-gauge natural wool delivering thermoregulation without itchiness.",
        "benefits": ["Natural temperature regulator", "Odor resistant", "Insulates when damp"],
        "care_instructions": ["Hand wash cold or wool cycle", "Lay flat to dry"],
        "best_seasons": ["Autumn", "Winter", "Early Spring"],
        "breathability": 4,
        "stretch": 4,
        "durability": 4,
        "skin_sensitivity_note": "Ultra-fine merino fibers (<19.5 micron) minimize prickle.",
    },
    {
        "id": "a0000001-0000-0000-0000-000000000005",
        "name": "Heavyweight Denim",
        "slug": "denim",
        "description": "Rugged twill-woven cotton engineered for timeless silhouettes.",
        "benefits": ["Exceptional durability", "Structured drape", "Custom patina"],
        "care_instructions": ["Wash inside out in cold water", "Air dry only"],
        "best_seasons": ["All Season", "Autumn", "Spring", "Winter"],
        "breathability": 3,
        "stretch": 1,
        "durability": 5,
        "skin_sensitivity_note": "Stiff when raw; softens with wear.",
    },
    {
        "id": "a0000001-0000-0000-0000-000000000008",
        "name": "Stretch Cotton Blend",
        "slug": "cotton-blend",
        "description": "Balanced combination of 95% combed cotton and 5% elastane.",
        "benefits": ["4-way stretch", "Breathable and soft", "Retains shape"],
        "care_instructions": ["Machine wash warm", "Tumble dry medium"],
        "best_seasons": ["All Season"],
        "breathability": 4,
        "stretch": 4,
        "durability": 4,
        "skin_sensitivity_note": "High skin tolerance for all-day wear.",
    },
]

FALLBACK_GARMENTS = [
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
        "base_price": 34.00,
        "is_active": True,
        "thumbnail_url": "https://storage.placeholder.stylemirror.internal/thumbnails/top-crewneck.webp",
        "fabric": FALLBACK_FABRICS[0],
        "colors": [
            {"id": "c1", "name": "Optic White", "hex": "#FFFFFF", "is_default": True},
            {"id": "c2", "name": "Obsidian Black", "hex": "#1A1A1A", "is_default": False},
        ],
        "sizes": [
            {
                "id": "s1",
                "size_label": "S",
                "glb_url": "https://mock-storage.stylemirror.internal/models/tee_s.glb#mock_placeholder",
                "chest_cm": 90.0,
                "waist_cm": 78.0,
                "hip_cm": 92.0,
                "shoulder_cm": 43.0,
                "length_cm": 68.0,
                "inseam_cm": None,
            },
            {
                "id": "s2",
                "size_label": "M",
                "glb_url": "https://mock-storage.stylemirror.internal/models/tee_m.glb#mock_placeholder",
                "chest_cm": 98.0,
                "waist_cm": 86.0,
                "hip_cm": 100.0,
                "shoulder_cm": 45.0,
                "length_cm": 70.0,
                "inseam_cm": None,
            },
        ],
    },
    {
        "id": "b0000001-0000-0000-0000-000000000002",
        "name": "Breeze Linen Camp Shirt",
        "slug": "breeze-linen-camp-shirt",
        "category": "top",
        "fit_type": "relaxed",
        "neckline": "Camp Collar",
        "length": "Hip Length",
        "pattern": "Subtle Slub",
        "occasion": ["Summer Casual", "Resort"],
        "fabric_id": "a0000001-0000-0000-0000-000000000002",
        "base_price": 68.00,
        "is_active": True,
        "thumbnail_url": "https://storage.placeholder.stylemirror.internal/thumbnails/top-linen-camp.webp",
        "fabric": FALLBACK_FABRICS[1],
        "colors": [
            {"id": "c3", "name": "Sand Beige", "hex": "#E3DAC9", "is_default": True},
            {"id": "c4", "name": "Aegean Blue", "hex": "#4E6E82", "is_default": False},
        ],
        "sizes": [
            {
                "id": "s3",
                "size_label": "M",
                "glb_url": "https://mock-storage.stylemirror.internal/models/linen_shirt_m.glb#mock_placeholder",
                "chest_cm": 102.0,
                "waist_cm": 92.0,
                "hip_cm": 104.0,
                "shoulder_cm": 46.0,
                "length_cm": 72.0,
                "inseam_cm": None,
            }
        ],
    },
    {
        "id": "b0000001-0000-0000-0000-000000000004",
        "name": "Heritage Straight Denim",
        "slug": "heritage-straight-denim",
        "category": "bottom",
        "fit_type": "regular",
        "neckline": None,
        "length": "Full Length",
        "pattern": "Solid Indigo",
        "occasion": ["Casual", "Weekend"],
        "fabric_id": "a0000001-0000-0000-0000-000000000005",
        "base_price": 89.00,
        "is_active": True,
        "thumbnail_url": "https://storage.placeholder.stylemirror.internal/thumbnails/bottom-selvedge-denim.webp",
        "fabric": FALLBACK_FABRICS[3],
        "colors": [
            {"id": "c5", "name": "Raw Indigo", "hex": "#243447", "is_default": True},
        ],
        "sizes": [
            {
                "id": "s4",
                "size_label": "M",
                "glb_url": "https://mock-storage.stylemirror.internal/models/denim_m.glb#mock_placeholder",
                "chest_cm": None,
                "waist_cm": 84.0,
                "hip_cm": 104.0,
                "shoulder_cm": None,
                "length_cm": 104.0,
                "inseam_cm": 78.0,
            }
        ],
    },
]


class FabricRepository:
    """Repository handling all Fabric data operations."""

    def __init__(self, client: Any | None = None) -> None:
        self._client = client or get_supabase_client()

    async def list_fabrics(self) -> list[FabricResponse]:
        if not self._client:
            return [FabricResponse(**f) for f in FALLBACK_FABRICS]

        response = self._client.table("fabrics").select("*").execute()
        return [FabricResponse(**row) for row in response.data]

    async def get_by_slug(self, slug: str) -> FabricResponse | None:
        if not self._client:
            match = next((f for f in FALLBACK_FABRICS if f["slug"] == slug), None)
            return FabricResponse(**match) if match else None

        response = self._client.table("fabrics").select("*").eq("slug", slug).execute()
        if not response.data:
            return None
        return FabricResponse(**response.data[0])


class GarmentRepository:
    """Repository handling all Garment queries and associations."""

    def __init__(self, client: Any | None = None) -> None:
        self._client = client or get_supabase_client()

    async def list_garments(
        self,
        category: str | None = None,
        occasion: str | None = None,
        fabric_id: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[GarmentSummaryResponse], int]:
        if not self._client:
            items = [dict(g) for g in FALLBACK_GARMENTS if g.get("is_active")]
            if category:
                items = [g for g in items if g.get("category") == category]
            if fabric_id:
                items = [g for g in items if g.get("fabric_id") == fabric_id]
            if occasion:
                items = [g for g in items if occasion in g.get("occasion", [])]

            total = len(items)
            paged = items[offset : offset + limit]

            summaries = []
            for g in paged:
                fab_name = g.get("fabric", {}).get("name") if g.get("fabric") else None
                summaries.append(
                    GarmentSummaryResponse(
                        id=g["id"],
                        name=g["name"],
                        slug=g["slug"],
                        category=g["category"],
                        fit_type=g["fit_type"],
                        neckline=g.get("neckline"),
                        length=g.get("length"),
                        pattern=g.get("pattern"),
                        occasion=g.get("occasion", []),
                        fabric_id=g["fabric_id"],
                        fabric_name=fab_name,
                        base_price=float(g["base_price"]),
                        is_active=g["is_active"],
                        thumbnail_url=g.get("thumbnail_url"),
                    )
                )
            return summaries, total

        query = (
            self._client.table("garments")
            .select("*, fabrics(name)", count="exact")
            .eq("is_active", True)
        )
        if category:
            query = query.eq("category", category)
        if fabric_id:
            query = query.eq("fabric_id", fabric_id)
        if occasion:
            query = query.contains("occasion", [occasion])

        query = query.range(offset, offset + limit - 1)
        res = query.execute()

        summaries = []
        for row in res.data:
            fab_data = row.pop("fabrics", None)
            fab_name = fab_data.get("name") if isinstance(fab_data, dict) else None
            summaries.append(
                GarmentSummaryResponse(
                    id=row["id"],
                    name=row["name"],
                    slug=row["slug"],
                    category=row["category"],
                    fit_type=row["fit_type"],
                    neckline=row.get("neckline"),
                    length=row.get("length"),
                    pattern=row.get("pattern"),
                    occasion=row.get("occasion", []),
                    fabric_id=row["fabric_id"],
                    fabric_name=fab_name,
                    base_price=float(row["base_price"]),
                    is_active=row["is_active"],
                    thumbnail_url=row.get("thumbnail_url"),
                )
            )
        total = res.count if res.count is not None else len(summaries)
        return summaries, total

    async def get_by_slug(self, slug: str) -> GarmentDetailResponse | None:
        if not self._client:
            match = next((g for g in FALLBACK_GARMENTS if g["slug"] == slug), None)
            if not match:
                return None
            return GarmentDetailResponse(
                id=match["id"],
                name=match["name"],
                slug=match["slug"],
                category=match["category"],
                fit_type=match["fit_type"],
                neckline=match.get("neckline"),
                length=match.get("length"),
                pattern=match.get("pattern"),
                occasion=match.get("occasion", []),
                fabric_id=match["fabric_id"],
                fabric_name=match.get("fabric", {}).get("name"),
                base_price=float(match["base_price"]),
                is_active=match["is_active"],
                thumbnail_url=match.get("thumbnail_url"),
                fabric=FabricResponse(**match["fabric"]) if match.get("fabric") else None,
                colors=[GarmentColorResponse(**c) for c in match.get("colors", [])],
                sizes=[GarmentSizeResponse(**s) for s in match.get("sizes", [])],
            )

        res = (
            self._client.table("garments")
            .select("*, fabrics(*), garment_colors(*), garment_sizes(*)")
            .eq("slug", slug)
            .eq("is_active", True)
            .execute()
        )
        if not res.data:
            return None

        row = res.data[0]
        fab_data = row.pop("fabrics", None)
        colors_data = row.pop("garment_colors", []) or []
        sizes_data = row.pop("garment_sizes", []) or []

        return GarmentDetailResponse(
            id=row["id"],
            name=row["name"],
            slug=row["slug"],
            category=row["category"],
            fit_type=row["fit_type"],
            neckline=row.get("neckline"),
            length=row.get("length"),
            pattern=row.get("pattern"),
            occasion=row.get("occasion", []),
            fabric_id=row["fabric_id"],
            fabric_name=fab_data.get("name") if fab_data else None,
            base_price=float(row["base_price"]),
            is_active=row["is_active"],
            thumbnail_url=row.get("thumbnail_url"),
            fabric=FabricResponse(**fab_data) if fab_data else None,
            colors=[GarmentColorResponse(**c) for c in colors_data],
            sizes=[GarmentSizeResponse(**s) for s in sizes_data],
        )
