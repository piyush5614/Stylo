"""Tests for garment sizing engine and GET /api/v1/tryon/fit endpoint."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.sizing import evaluate_garment_fit


def test_evaluate_garment_fit_calculation():
    body = {
        "chest_cm": 96.0,
        "waist_cm": 80.0,
        "hip_cm": 98.0,
        "shoulder_cm": 44.0,
    }
    sizes = [
        {"size_label": "S", "chest_cm": 90.0, "waist_cm": 78.0, "glb_url": "models/tee_s.glb"},
        {"size_label": "M", "chest_cm": 98.0, "waist_cm": 86.0, "glb_url": "models/tee_m.glb"},
        {"size_label": "L", "chest_cm": 106.0, "waist_cm": 94.0, "glb_url": "models/tee_l.glb"},
    ]

    # For regular fit, target chest ease is 8cm -> Ideal chest = 96 + 8 = 104
    # M has 98cm (ease 2cm), L has 106cm (ease 10cm)
    res = evaluate_garment_fit(
        garment_slug="test-tee",
        category="top",
        fit_type="regular",
        body_measurements=body,
        garment_sizes=sizes,
    )

    assert res.recommended_size in ("M", "L")
    assert len(res.area_details) > 0
    assert res.confidence > 0.8
    assert res.garment_slug == "test-tee"


@pytest.mark.asyncio
async def test_get_garment_fit_endpoint():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        # Create anonymous session
        sess_resp = await client.post("/api/v1/sessions", json={"consent_given": True})
        assert sess_resp.status_code == 201
        session_id = sess_resp.json()["id"]

        # Request fit recommendation
        fit_resp = await client.get(
            "/api/v1/tryon/fit?garment=essential-minimalist-tee",
            headers={"X-Session-Id": session_id},
        )
        assert fit_resp.status_code == 200
        data = fit_resp.json()
        assert data["garment_slug"] == "essential-minimalist-tee"
        assert "recommended_size" in data
        assert "area_details" in data
        assert len(data["available_sizes"]) > 0
