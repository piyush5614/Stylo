"""Router for virtual try-on and garment fit evaluations."""

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status

from app.db.garments import GarmentRepository
from app.db.profiles import BodyProfileRepository
from app.db.sessions import SessionRepository
from app.schemas.sizing import FitRecommendationResponse
from app.services.sizing import evaluate_garment_fit

router = APIRouter(prefix="/tryon", tags=["tryon"])


def get_garment_repo() -> GarmentRepository:
    return GarmentRepository()


def get_session_repo() -> SessionRepository:
    return SessionRepository()


def get_profile_repo() -> BodyProfileRepository:
    return BodyProfileRepository()


@router.get("/fit", response_model=FitRecommendationResponse)
async def get_garment_fit(
    garment: Annotated[str, Query(..., description="Garment slug to fit")],
    x_session_id: Annotated[str | None, Header(alias="X-Session-Id")] = None,
    session: Annotated[str | None, Query(description="Fallback query session id")] = None,
    garment_repo: Annotated[GarmentRepository, Depends(get_garment_repo)] = None,  # type: ignore
    session_repo: Annotated[SessionRepository, Depends(get_session_repo)] = None,  # type: ignore
    profile_repo: Annotated[BodyProfileRepository, Depends(get_profile_repo)] = None,  # type: ignore
) -> FitRecommendationResponse:
    """Evaluate garment fit, recommended size, and runner-up size for the active session."""
    active_session_id = x_session_id or session
    if not active_session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session ID required via X-Session-Id header or session query parameter.",
        )

    # 1. Fetch garment detail
    garment_data = await garment_repo.get_by_slug(garment)
    if not garment_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Garment with slug '{garment}' not found.",
        )

    # 2. Fetch body profile for session
    sess = await session_repo.get_session(active_session_id)
    if not sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or expired.",
        )

    profile = await profile_repo.get_by_session(active_session_id)
    body_measurements = {}
    if profile:
        profile_dict = profile if isinstance(profile, dict) else profile.__dict__
        body_measurements = {
            "chest_cm": profile_dict.get("chest_cm", 94.0),
            "waist_cm": profile_dict.get("waist_cm", 78.0),
            "hip_cm": profile_dict.get("hip_cm", 98.0),
            "shoulder_cm": profile_dict.get("shoulder_cm", 42.0),
            "inseam_cm": profile_dict.get("inseam_cm", 79.0),
            "height_cm": profile_dict.get("height_cm", 172.0),
        }
    else:
        body_measurements = {
            "chest_cm": 94.0,
            "waist_cm": 78.0,
            "hip_cm": 98.0,
            "shoulder_cm": 42.0,
            "inseam_cm": 79.0,
            "height_cm": 172.0,
        }

    # Convert garment_data to dict if Pydantic model
    g_dict = garment_data.model_dump() if hasattr(garment_data, "model_dump") else garment_data

    return evaluate_garment_fit(
        garment_slug=garment,
        category=g_dict.get("category", "top"),
        fit_type=g_dict.get("fit_type", "regular"),
        body_measurements=body_measurements,
        garment_sizes=g_dict.get("sizes", []),
    )
