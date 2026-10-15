"""Health check schema."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """API health status report."""

    status: str = Field(default="ok", description="Service status: ok, degraded, down")
    version: str = Field(..., description="API version string")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")
