"""Health check router."""

from datetime import UTC, datetime

from fastapi import APIRouter

from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def check_health() -> HealthResponse:
    """Returns service health status, version, and current UTC timestamp."""
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        timestamp=datetime.now(UTC).isoformat(),
    )
