"""Pydantic schemas for personalized styling recommendations and fabric insights."""

from typing import Any

from pydantic import BaseModel, Field

from app.schemas.catalog import GarmentColorResponse, GarmentSummaryResponse


class FabricInsightResponse(BaseModel):
    fabric_slug: str
    fabric_name: str
    description: str
    benefits: list[str]
    care_instructions: list[str]
    best_seasons: list[str]
    why_it_suits_you: str
    best_for_climate: str
    stretch_rating: int = Field(..., ge=1, le=5)
    breathability_rating: int = Field(..., ge=1, le=5)
    durability_rating: int = Field(..., ge=1, le=5)
    skin_sensitivity_note: str | None = None


class RecommendationItem(BaseModel):
    garment: GarmentSummaryResponse
    score: float = Field(..., ge=0.0, le=100.0, description="Match score (0-100)")
    recommended_size: str = Field(..., description="Best fitted size")
    suggested_color: GarmentColorResponse | None = None
    reasons: list[str] = Field(..., min_length=1, max_length=5, description="Plain-language styling reasons")
    fabric_highlight: str = Field(..., description="Short fabric suitability line")


class PersonalizedRecommendationsResponse(BaseModel):
    session_id: str
    detected_body_type: str
    body_type_title: str
    detected_undertone: str
    detected_depth: str
    occasion_filter: str | None = None
    season_filter: str | None = None
    items: list[RecommendationItem]
    how_we_chose_these: dict[str, Any]
