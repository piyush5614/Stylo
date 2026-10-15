"""Domain schemas for fabrics, garments, sessions, and catalog responses."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Session Schemas
# ---------------------------------------------------------------------------
class CreateSessionRequest(BaseModel):
    consent_given: bool = Field(
        ...,
        description="Explicit user consent to process ephemeral camera images in memory.",
    )


class SessionResponse(BaseModel):
    id: str = Field(..., description="Unique UUID for the anonymous session")
    created_at: datetime = Field(..., description="UTC creation timestamp")
    expires_at: datetime = Field(..., description="UTC expiration timestamp (default 24h)")
    consent_given: bool = Field(..., description="Consent status")


# ---------------------------------------------------------------------------
# Fabric Schemas
# ---------------------------------------------------------------------------
class FabricResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    benefits: list[str] = Field(default_factory=list)
    care_instructions: list[str] = Field(default_factory=list)
    best_seasons: list[str] = Field(default_factory=list)
    breathability: int = Field(..., ge=1, le=5)
    stretch: int = Field(..., ge=1, le=5)
    durability: int = Field(..., ge=1, le=5)
    skin_sensitivity_note: str | None = None


# ---------------------------------------------------------------------------
# Garment Schemas
# ---------------------------------------------------------------------------
class GarmentColorResponse(BaseModel):
    id: str
    name: str
    hex: str
    is_default: bool


class GarmentSizeResponse(BaseModel):
    id: str
    size_label: str
    glb_url: str
    chest_cm: float | None = None
    waist_cm: float | None = None
    hip_cm: float | None = None
    shoulder_cm: float | None = None
    length_cm: float | None = None
    inseam_cm: float | None = None


class GarmentSummaryResponse(BaseModel):
    id: str
    name: str
    slug: str
    category: str
    fit_type: str
    neckline: str | None = None
    length: str | None = None
    pattern: str | None = None
    occasion: list[str] = Field(default_factory=list)
    fabric_id: str
    fabric_name: str | None = None
    base_price: float
    is_active: bool
    thumbnail_url: str | None = None


class GarmentDetailResponse(GarmentSummaryResponse):
    fabric: FabricResponse | None = None
    colors: list[GarmentColorResponse] = Field(default_factory=list)
    sizes: list[GarmentSizeResponse] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Pagination & List Schemas
# ---------------------------------------------------------------------------
class PaginatedGarmentsResponse(BaseModel):
    items: list[GarmentSummaryResponse]
    total: int
    limit: int
    offset: int


# ---------------------------------------------------------------------------
# Body Profile Schemas
# ---------------------------------------------------------------------------
class BodyProfileResponse(BaseModel):
    id: str
    session_id: str
    height_cm: float
    shoulder_cm: float
    chest_cm: float
    waist_cm: float
    hip_cm: float
    inseam_cm: float
    torso_cm: float
    body_type: str | None = None
    skin_tone_hex: str | None = None
    undertone: str | None = None
    confidence: float
    manual_overrides: dict[str, Any] = Field(default_factory=dict)
