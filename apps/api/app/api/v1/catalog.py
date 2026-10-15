"""Catalog browsing router for garments and fabrics."""


from fastapi import APIRouter, Query

from app.core.errors import AppError
from app.db.garments import FabricRepository, GarmentRepository
from app.schemas.catalog import (
    FabricResponse,
    GarmentDetailResponse,
    PaginatedGarmentsResponse,
)

router = APIRouter(prefix="/catalog", tags=["catalog"])
garment_repo = GarmentRepository()
fabric_repo = FabricRepository()


# ---------------------------------------------------------------------------
# Garments
# ---------------------------------------------------------------------------
@router.get("/garments", response_model=PaginatedGarmentsResponse)
async def list_garments(
    category: str | None = Query(None, description="Filter by category (top, bottom, etc.)"),
    occasion: str | None = Query(None, description="Filter by occasion tag"),
    fabric_id: str | None = Query(None, description="Filter by fabric ID"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
) -> PaginatedGarmentsResponse:
    """Lists active garments with filtering and pagination."""
    items, total = await garment_repo.list_garments(
        category=category,
        occasion=occasion,
        fabric_id=fabric_id,
        limit=limit,
        offset=offset,
    )
    return PaginatedGarmentsResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/garments/{slug}", response_model=GarmentDetailResponse)
async def get_garment_detail(slug: str) -> GarmentDetailResponse:
    """Retrieves single garment details including colors, sizes, and fabric profile."""
    garment = await garment_repo.get_by_slug(slug)
    if not garment:
        raise AppError(message=f"Garment '{slug}' not found", status_code=404)
    return garment


# ---------------------------------------------------------------------------
# Fabrics
# ---------------------------------------------------------------------------
@router.get("/fabrics", response_model=list[FabricResponse])
async def list_fabrics() -> list[FabricResponse]:
    """Lists all available fabrics with their care guidelines and textile ratings."""
    return await fabric_repo.list_fabrics()


@router.get("/fabrics/{slug}", response_model=FabricResponse)
async def get_fabric_detail(slug: str) -> FabricResponse:
    """Retrieves full fabric details by slug."""
    fabric = await fabric_repo.get_by_slug(slug)
    if not fabric:
        raise AppError(message=f"Fabric '{slug}' not found", status_code=404)
    return fabric
