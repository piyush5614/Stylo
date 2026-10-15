"""Router for personalized styling recommendations and fabric insights."""

from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status

from app.db.fabrics import FabricRepository
from app.db.garments import GarmentRepository
from app.db.profiles import BodyProfileRepository
from app.db.sessions import SessionRepository
from app.schemas.recommendations import (
    FabricInsightResponse,
    PersonalizedRecommendationsResponse,
)
from app.services.fabric import get_fabric_insights
from app.services.recommendation import score_and_recommend_garments

router = APIRouter(tags=["recommendations"])


def get_garment_repo() -> GarmentRepository:
    return GarmentRepository()


def get_fabric_repo() -> FabricRepository:
    return FabricRepository()


def get_session_repo() -> SessionRepository:
    return SessionRepository()


def get_profile_repo() -> BodyProfileRepository:
    return BodyProfileRepository()


@router.get("/recommendations", response_model=PersonalizedRecommendationsResponse)
async def get_personalized_recommendations(
    x_session_id: Annotated[str | None, Header(alias="X-Session-Id")] = None,
    session: Annotated[str | None, Query(description="Fallback query session id")] = None,
    occasion: Annotated[str | None, Query(description="Occasion filter")] = None,
    season: Annotated[str | None, Query(description="Season filter")] = None,
    garment_repo: Annotated[GarmentRepository, Depends(get_garment_repo)] = None,  # type: ignore
    session_repo: Annotated[SessionRepository, Depends(get_session_repo)] = None,  # type: ignore
    profile_repo: Annotated[BodyProfileRepository, Depends(get_profile_repo)] = None,  # type: ignore
) -> PersonalizedRecommendationsResponse:
    """Retrieve explainable recommendations for the active session with rule-based reasons."""
    active_session_id = x_session_id or session
    if not active_session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session ID required via X-Session-Id header or session query parameter.",
        )

    sess = await session_repo.get_session(active_session_id)
    if not sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or expired.",
        )

    profile = await profile_repo.get_by_session(active_session_id)
    body_measurements = {}
    body_type = "rectangle"
    undertone = "neutral"
    depth = "medium"

    if profile:
        p_dict = profile if isinstance(profile, dict) else profile.__dict__
        body_measurements = {
            "chest_cm": p_dict.get("chest_cm", 94.0),
            "waist_cm": p_dict.get("waist_cm", 78.0),
            "hip_cm": p_dict.get("hip_cm", 98.0),
            "shoulder_cm": p_dict.get("shoulder_cm", 42.0),
            "inseam_cm": p_dict.get("inseam_cm", 79.0),
            "height_cm": p_dict.get("height_cm", 172.0),
        }
        body_type = p_dict.get("body_type") or "rectangle"
        undertone = p_dict.get("undertone") or "neutral"
        depth = p_dict.get("skin_depth") or "medium"
    else:
        body_measurements = {
            "chest_cm": 94.0,
            "waist_cm": 78.0,
            "hip_cm": 98.0,
            "shoulder_cm": 42.0,
            "inseam_cm": 79.0,
            "height_cm": 172.0,
        }

    # Fetch garments from catalog
    garment_items, _total = await garment_repo.list_garments(limit=50)

    # Convert to dict format
    garments_dict = [
        g.model_dump() if hasattr(g, "model_dump") else g for g in garment_items
    ]

    # Compute deterministic recommendations first (rules decide everything)
    base_result = score_and_recommend_garments(
        session_id=active_session_id,
        garments=garments_dict,
        body_measurements=body_measurements,
        body_type=body_type,
        undertone=undertone,
        depth=depth,
        occasion=occasion,
        season=season,
    )

    # Optional Part 10 Upgrade C: LLM stylist commentary layer on top of rule picks
    from app.services.llm_stylist import generate_styling_commentary

    items_dict = [it.model_dump() for it in base_result.items]
    capsule_summary, item_notes = await generate_styling_commentary(
        body_type=body_type,
        undertone=undertone,
        depth=depth,
        height_cm=body_measurements.get("height_cm", 172.0),
        items=items_dict,
    )

    # Attach AI commentary to items
    for item in base_result.items:
        slug = item.garment.slug
        if slug in item_notes:
            item.ai_stylist_note = item_notes[slug]

    base_result.ai_capsule_summary = capsule_summary
    return base_result


@router.get("/fabrics/{slug}/insights", response_model=FabricInsightResponse)
async def get_fabric_insights_endpoint(
    slug: str,
    fabric_repo: Annotated[FabricRepository, Depends(get_fabric_repo)] = None,  # type: ignore
) -> FabricInsightResponse:
    """Retrieve detailed textile benefits, climate suitability, care guide, and radar scores."""
    fabric = await fabric_repo.get_by_slug(slug)
    if not fabric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fabric '{slug}' not found.",
        )

    f_dict = fabric.model_dump() if hasattr(fabric, "model_dump") else fabric
    insights = get_fabric_insights(slug)

    return FabricInsightResponse(
        fabric_slug=slug,
        fabric_name=f_dict.get("name", slug.title()),
        description=f_dict.get("description", ""),
        benefits=f_dict.get("benefits", []),
        care_instructions=f_dict.get("care_instructions", []),
        best_seasons=f_dict.get("best_seasons", []),
        why_it_suits_you=insights["why_it_suits_you"],
        best_for_climate=insights["best_for_climate"],
        stretch_rating=insights["stretch_rating"],
        breathability_rating=insights["breathability_rating"],
        durability_rating=insights["durability_rating"],
        skin_sensitivity_note=f_dict.get("skin_sensitivity_note"),
    )
