"""Pydantic schemas for measurement requests, results, and manual overrides."""

from typing import Any

from pydantic import BaseModel, Field


class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float | None = 0.0
    visibility: float | None = 1.0


class CapturedPosePayload(BaseModel):
    angle: str = Field(..., description="front, right, back, or left")
    landmarks: list[LandmarkPoint] | None = None
    # Base64-encoded JPEG image string (decoded strictly in memory, never persisted)
    image_base64: str | None = None


class AnalyzeMeasurementsRequest(BaseModel):
    height_cm: float = Field(..., ge=80.0, le=260.0, description="User ground-truth height in cm")
    poses: list[CapturedPosePayload] = Field(..., min_length=1, max_length=12)


class DimensionEstimate(BaseModel):
    value_cm: float = Field(..., description="Estimated measurement in cm")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Per-dimension confidence score")


class MeasurementAnalysisResponse(BaseModel):
    height_cm: float
    shoulder_cm: DimensionEstimate
    chest_cm: DimensionEstimate
    waist_cm: DimensionEstimate
    hip_cm: DimensionEstimate
    inseam_cm: DimensionEstimate
    torso_cm: DimensionEstimate
    overall_confidence: float = Field(..., ge=0.0, le=1.0)
    body_type: str | None = None
    manual_overrides: dict[str, Any] = Field(default_factory=dict)
    disclaimer: str = (
        "Measurements are algorithmic estimates calculated from camera landmarks and silhouettes. "
        "They are not medical or exact tape-measure readings. You may adjust any number manually."
    )


class UpdateBodyProfileRequest(BaseModel):
    height_cm: float | None = None
    shoulder_cm: float | None = None
    chest_cm: float | None = None
    waist_cm: float | None = None
    hip_cm: float | None = None
    inseam_cm: float | None = None
    torso_cm: float | None = None
    manual_overrides: dict[str, Any] = Field(default_factory=dict)
