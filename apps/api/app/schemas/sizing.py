"""Pydantic schemas for garment sizing recommendations and fit evaluation."""

from pydantic import BaseModel, Field


class AreaFitDetail(BaseModel):
    area: str = Field(..., description="chest, waist, hip, shoulder, inseam, or length")
    body_cm: float = Field(..., description="User body measurement in cm")
    garment_cm: float = Field(..., description="Garment finished dimension in cm")
    ease_cm: float = Field(..., description="Garment ease (garment_cm - body_cm)")
    fit_status: str = Field(..., description="tight, snug, ideal, comfortable, or loose")
    comment: str = Field(..., description="Human-readable description for UI display")


class FitRecommendationResponse(BaseModel):
    garment_slug: str
    category: str
    fit_type: str
    recommended_size: str = Field(..., description="Primary size recommendation (e.g. M)")
    runner_up_size: str | None = Field(None, description="Alternative size if between sizes")
    confidence: float = Field(..., ge=0.0, le=1.0)
    fit_summary: str = Field(..., description="Summary overview of overall fit")
    area_details: list[AreaFitDetail]
    available_sizes: list[str]
    glb_url: str | None = None
