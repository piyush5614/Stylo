"""API v1 routers."""

from fastapi import APIRouter

from app.api.v1.catalog import router as catalog_router
from app.api.v1.health import router as health_router
from app.api.v1.measurements import router as measurements_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.sessions import router as sessions_router
from app.api.v1.tryon import router as tryon_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(sessions_router)
api_v1_router.include_router(catalog_router)
api_v1_router.include_router(measurements_router)
api_v1_router.include_router(tryon_router)
api_v1_router.include_router(recommendations_router)
