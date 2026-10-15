"""Tests for body type classification, skin tone analysis, and explainable recommendations."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.bodytype import classify_body_type
from app.services.fabric import get_fabric_insights
from app.services.recommendation import score_and_recommend_garments
from app.services.skintone import analyze_skin_tone_sample


def test_body_type_classification_table():
    # 1. Hourglass: shoulder ≈ hip, waist clearly narrower (all circumferences in cm)
    hg = classify_body_type(shoulder_cm=98.0, waist_cm=68.0, hip_cm=100.0)
    assert hg["body_type"] == "hourglass"
    assert hg["confidence"] >= 0.85

    # 2. Inverted Triangle (broad shoulders, narrow hips)
    inv = classify_body_type(shoulder_cm=110.0, waist_cm=85.0, hip_cm=98.0)
    assert inv["body_type"] == "inverted_triangle"

    # 3. Pear (narrower shoulders, wider hips)
    pear = classify_body_type(shoulder_cm=90.0, waist_cm=80.0, hip_cm=104.0)
    assert pear["body_type"] == "pear"

    # 4. Rectangle (even shoulders, waist, and hips — minimal waist definition)
    rect = classify_body_type(shoulder_cm=96.0, waist_cm=86.0, hip_cm=98.0)
    assert rect["body_type"] == "rectangle"

    # 5. Borderline
    borderline = classify_body_type(shoulder_cm=96.0, waist_cm=82.0, hip_cm=98.0)
    assert borderline["body_type"] in ("hourglass", "rectangle", "undetermined")


def test_skin_tone_cielab_analysis():
    # Warm tone (golden/yellow bias: higher red & green, b* > a*)
    warm = analyze_skin_tone_sample(r=210.0, g=170.0, b=130.0)
    assert warm["undertone"] == "warm"
    assert warm["depth"] in ("light", "medium")

    # Cool tone (pale/pinkish bias: high red, lower yellow)
    cool = analyze_skin_tone_sample(r=235.0, g=180.0, b=185.0)
    assert cool["undertone"] in ("cool", "neutral")


def test_recommendation_scoring_and_reasons():
    sample_garments = [
        {
            "id": "g-1",
            "name": "Breeze Linen Camp Shirt",
            "slug": "breeze-linen-camp-shirt",
            "category": "top",
            "fit_type": "relaxed",
            "neckline": "Camp Collar",
            "length": "Hip Length",
            "base_price": 68.0,
            "fabric_slug": "linen",
            "occasion": ["Casual", "Summer Casual"],
            "colors": [{"id": "c-1", "name": "Sand Beige", "hex": "#E3DAC9", "is_default": True}],
            "sizes": [{"id": "s-1", "size_label": "M", "chest_cm": 102.0}],
        }
    ]

    res = score_and_recommend_garments(
        session_id="test-session",
        garments=sample_garments,
        body_measurements={"height_cm": 175.0, "chest_cm": 94.0, "waist_cm": 78.0},
        body_type="rectangle",
        undertone="warm",
    )

    assert len(res.items) == 1
    top_pick = res.items[0]
    assert top_pick.score > 70.0
    assert len(top_pick.reasons) >= 2
    assert "reasons" in top_pick.model_dump()


def test_fabric_insights():
    linen_info = get_fabric_insights("linen")
    assert linen_info["breathability_rating"] == 5
    assert "flax" in linen_info["why_it_suits_you"].lower()


@pytest.mark.asyncio
async def test_recommendations_endpoint():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        sess_resp = await client.post("/api/v1/sessions", json={"consent_given": True})
        assert sess_resp.status_code == 201
        session_id = sess_resp.json()["id"]

        resp = await client.get(
            "/api/v1/recommendations",
            headers={"X-Session-Id": session_id},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "how_we_chose_these" in data
        assert len(data["items"]) > 0
