"""Measurement analysis router: accepts 4 views, estimates dimensions, and saves profile."""


from fastapi import APIRouter, Depends

from app.core.security import get_required_session_id
from app.db.profiles import BodyProfileRepository
from app.schemas.measurement import (
    AnalyzeMeasurementsRequest,
    MeasurementAnalysisResponse,
    UpdateBodyProfileRequest,
)
from app.services.measurement import MeasurementService

router = APIRouter(prefix="/measurements", tags=["measurements"])
measurement_service = MeasurementService()
profile_repo = BodyProfileRepository()


@router.post("/analyze", response_model=MeasurementAnalysisResponse)
async def analyze_measurements(
    payload: AnalyzeMeasurementsRequest,
    session_id: str = Depends(get_required_session_id),
) -> MeasurementAnalysisResponse:
    """
    Analyzes captured pose landmarks and views to compute body dimensions.
    Photos are decoded in memory, never written to disk, and immediately discarded.
    Derived numbers are stored to body_profiles linked to the session.
    """
    analysis = measurement_service.process_capture_session(
        height_cm=payload.height_cm,
        poses=payload.poses,
    )

    # Persist derived numbers only
    await profile_repo.upsert_profile({
        "session_id": session_id,
        "height_cm": analysis.height_cm,
        "shoulder_cm": analysis.shoulder_cm.value_cm,
        "chest_cm": analysis.chest_cm.value_cm,
        "waist_cm": analysis.waist_cm.value_cm,
        "hip_cm": analysis.hip_cm.value_cm,
        "inseam_cm": analysis.inseam_cm.value_cm,
        "torso_cm": analysis.torso_cm.value_cm,
        "body_type": analysis.body_type,
        "confidence": analysis.overall_confidence,
        "manual_overrides": analysis.manual_overrides,
    })

    return analysis


@router.get("/profile", response_model=MeasurementAnalysisResponse | None)
async def get_current_profile(
    session_id: str = Depends(get_required_session_id),
) -> MeasurementAnalysisResponse | None:
    """Retrieves current derived body measurements for the active session."""
    record = await profile_repo.get_by_session(session_id)
    if not record:
        return None

    return MeasurementAnalysisResponse(
        height_cm=record.height_cm,
        shoulder_cm={"value_cm": record.shoulder_cm, "confidence": record.confidence},
        chest_cm={"value_cm": record.chest_cm, "confidence": record.confidence},
        waist_cm={"value_cm": record.waist_cm, "confidence": record.confidence},
        hip_cm={"value_cm": record.hip_cm, "confidence": record.confidence},
        inseam_cm={"value_cm": record.inseam_cm, "confidence": record.confidence},
        torso_cm={"value_cm": record.torso_cm, "confidence": record.confidence},
        overall_confidence=record.confidence,
        body_type=record.body_type,
        manual_overrides=record.manual_overrides or {},
    )


@router.put("/profile/overrides", response_model=MeasurementAnalysisResponse)
async def update_profile_overrides(
    overrides: UpdateBodyProfileRequest,
    session_id: str = Depends(get_required_session_id),
) -> MeasurementAnalysisResponse:
    """Updates manual overrides for any dimension on the active session profile."""
    current = await profile_repo.get_by_session(session_id)
    height_cm = overrides.height_cm or (current.height_cm if current else 175.0)

    updated_data = {
        "session_id": session_id,
        "height_cm": height_cm,
        "shoulder_cm": overrides.shoulder_cm or (current.shoulder_cm if current else 44.0),
        "chest_cm": overrides.chest_cm or (current.chest_cm if current else 96.0),
        "waist_cm": overrides.waist_cm or (current.waist_cm if current else 80.0),
        "hip_cm": overrides.hip_cm or (current.hip_cm if current else 98.0),
        "inseam_cm": overrides.inseam_cm or (current.inseam_cm if current else 78.0),
        "torso_cm": overrides.torso_cm or (current.torso_cm if current else 50.0),
        "confidence": current.confidence if current else 0.95,
        "manual_overrides": overrides.manual_overrides,
    }

    saved = await profile_repo.upsert_profile(updated_data)

    return MeasurementAnalysisResponse(
        height_cm=saved.height_cm,
        shoulder_cm={"value_cm": saved.shoulder_cm, "confidence": saved.confidence},
        chest_cm={"value_cm": saved.chest_cm, "confidence": saved.confidence},
        waist_cm={"value_cm": saved.waist_cm, "confidence": saved.confidence},
        hip_cm={"value_cm": saved.hip_cm, "confidence": saved.confidence},
        inseam_cm={"value_cm": saved.inseam_cm, "confidence": saved.confidence},
        torso_cm={"value_cm": saved.torso_cm, "confidence": saved.confidence},
        overall_confidence=saved.confidence,
        body_type=saved.body_type,
        manual_overrides=saved.manual_overrides,
    )
