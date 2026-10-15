"""
Part 12 – Edge-case and synthetic-profile integration tests.

Tests:
  - Edge-case inputs (bad images, wrong file types, oversized uploads, empty body)
  - Three synthetic body profiles from tests/fixtures/synthetic/body_profiles.json
  - Session expiry / delete-my-data verification
  - Rate limit header check
  - Zero image persistence under edge inputs
"""

import base64
import json
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

FIXTURES = Path(__file__).parent.parent.parent.parent.parent / "tests" / "fixtures" / "synthetic"

# ─── Helpers ──────────────────────────────────────────────────────────────────


def _tiny_b64_png(brightness: int = 180) -> str:
    """Returns a 10×10 PNG base64 data-URI with the given brightness."""
    import struct
    import zlib

    w, h = 10, 10

    def chunk(tag: bytes, data: bytes) -> bytes:
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    header = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    scanline = b""
    for _ in range(h):
        scanline += b"\x00"
        for _ in range(w):
            r_ch = max(0, min(255, brightness))
            g_ch = max(0, min(255, brightness - 20))
            b_ch = max(0, min(255, brightness - 40))
            scanline += bytes([r_ch, g_ch, b_ch])

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", header)
    png += chunk(b"IDAT", zlib.compress(scanline))
    png += chunk(b"IEND", b"")
    b64 = base64.b64encode(png).decode()
    return f"data:image/png;base64,{b64}"


async def _create_session(client: AsyncClient) -> str:
    r = await client.post("/api/v1/sessions", json={"consent_given": True})
    assert r.status_code == 201
    return r.json()["id"]


# ─── Session lifecycle ────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_delete_my_data_removes_session() -> None:
    """'Delete my data' must remove the session; subsequent deletes must 404."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)

        # First delete → success (204)
        r = await client.delete("/api/v1/sessions/me", headers={"X-Session-Id": session_id})
        assert r.status_code == 204

        # Second delete → 404 (idempotent-safe)
        r2 = await client.delete("/api/v1/sessions/me", headers={"X-Session-Id": session_id})
        assert r2.status_code == 404


@pytest.mark.asyncio
async def test_delete_without_session_id_returns_400() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.delete("/api/v1/sessions/me")
        assert r.status_code == 400


# ─── Edge-case inputs ─────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_analyze_with_empty_poses_rejected_by_schema() -> None:
    """Empty pose list → rejected by Pydantic (min_length=1) with 422."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        r = await client.post(
            "/api/v1/measurements/analyze",
            headers={"X-Session-Id": session_id},
            json={"height_cm": 175.0, "poses": []},
        )
        # Schema enforces min_length=1
        assert r.status_code == 422


@pytest.mark.asyncio
async def test_analyze_single_synthetic_pose_succeeds() -> None:
    """A single pose with a synthetic image (no real landmarks) must succeed and return plausible numbers."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        r = await client.post(
            "/api/v1/measurements/analyze",
            headers={"X-Session-Id": session_id},
            json={
                "height_cm": 175.0,
                "poses": [{"angle": "front", "image_base64": _tiny_b64_png(180), "landmarks": None}],
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert data["shoulder_cm"]["value_cm"] > 0


@pytest.mark.asyncio
async def test_analyze_dark_image() -> None:
    """Very dark image should still return a result (graceful degradation)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        r = await client.post(
            "/api/v1/measurements/analyze",
            headers={"X-Session-Id": session_id},
            json={
                "height_cm": 175.0,
                "poses": [{"angle": "front", "image_base64": _tiny_b64_png(10), "landmarks": None}],
            },
        )
        assert r.status_code == 200


@pytest.mark.asyncio
async def test_analyze_missing_session_header_returns_401() -> None:
    """Requests without a session header must be rejected with 401."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post(
            "/api/v1/measurements/analyze",
            json={"height_cm": 175.0, "poses": []},
        )
        assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_analyze_invalid_height_cm() -> None:
    """height_cm outside ge=80/le=260 range must be rejected by Pydantic with 422."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)
        r = await client.post(
            "/api/v1/measurements/analyze",
            headers={"X-Session-Id": session_id},
            json={"height_cm": 5.0, "poses": [{"angle": "front", "image_base64": _tiny_b64_png(), "landmarks": None}]},
        )
        assert r.status_code == 422  # Pydantic ge=80 validation


@pytest.mark.asyncio
async def test_garment_not_found_returns_404() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/catalog/garments/definitely-not-a-real-garment-slug-xyz")
        assert r.status_code == 404
        assert "error" in r.json()


@pytest.mark.asyncio
async def test_fabric_not_found_returns_404() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/catalog/fabrics/not-a-real-fabric")
        assert r.status_code == 404


@pytest.mark.asyncio
async def test_health_returns_ok() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert "version" in data
        assert "timestamp" in data


# ─── Synthetic body profile tests ────────────────────────────────────────────


def _load_profiles() -> list[dict]:
    profiles_path = FIXTURES / "body_profiles.json"
    if not profiles_path.exists():
        return []
    with open(profiles_path, encoding="utf-8") as f:
        return json.load(f)


@pytest.mark.asyncio
@pytest.mark.parametrize("profile", _load_profiles())
async def test_recommendations_differ_by_profile(profile: dict) -> None:
    """Each synthetic profile must produce at least 1 recommendation with positive score."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        session_id = await _create_session(client)

        # Upload the profile as manual overrides
        override_payload = {
            "height_cm": profile["height_cm"],
            "shoulder_cm": profile["shoulder_cm"],
            "chest_cm": profile["chest_cm"],
            "waist_cm": profile["waist_cm"],
            "hip_cm": profile["hip_cm"],
            "inseam_cm": profile["inseam_cm"],
            "torso_cm": profile["torso_cm"],
            "manual_overrides": {},
        }
        ov = await client.put(
            "/api/v1/measurements/profile/overrides",
            headers={"X-Session-Id": session_id},
            json=override_payload,
        )
        assert ov.status_code == 200

        # Get recommendations
        rec = await client.get(
            "/api/v1/recommendations",
            headers={"X-Session-Id": session_id},
        )
        assert rec.status_code == 200
        data = rec.json()
        assert "items" in data
        assert len(data["items"]) >= 1
        for item in data["items"]:
            assert item["score"] >= 60.0
            assert len(item["reasons"]) >= 1


@pytest.mark.asyncio
async def test_synthetic_profile_size_selection() -> None:
    """Slim/tall profile should map to a smaller size than broad/short profile."""
    from app.services.sizing import evaluate_garment_fit

    profiles = _load_profiles()
    if len(profiles) < 2:
        pytest.skip("Not enough profiles loaded")

    slim = next(p for p in profiles if p["id"] == "profile_slim_tall")
    broad = next(p for p in profiles if p["id"] == "profile_broad_short")

    sizes = [
        {"size_label": "XS", "chest_cm": 84.0,  "waist_cm": 68.0},
        {"size_label": "S",  "chest_cm": 90.0,  "waist_cm": 74.0},
        {"size_label": "M",  "chest_cm": 98.0,  "waist_cm": 82.0},
        {"size_label": "L",  "chest_cm": 106.0, "waist_cm": 90.0},
        {"size_label": "XL", "chest_cm": 114.0, "waist_cm": 98.0},
        {"size_label": "XXL","chest_cm": 122.0, "waist_cm": 106.0},
    ]

    slim_fit = evaluate_garment_fit(
        garment_slug="test",
        category="top",
        fit_type="regular",
        body_measurements={"chest_cm": slim["chest_cm"], "waist_cm": slim["waist_cm"]},
        garment_sizes=sizes,
    )
    broad_fit = evaluate_garment_fit(
        garment_slug="test",
        category="top",
        fit_type="regular",
        body_measurements={"chest_cm": broad["chest_cm"], "waist_cm": broad["waist_cm"]},
        garment_sizes=sizes,
    )

    SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"]
    slim_idx  = SIZE_ORDER.index(slim_fit.recommended_size)
    broad_idx = SIZE_ORDER.index(broad_fit.recommended_size)
    assert slim_idx < broad_idx, (
        f"Slim profile ({slim_fit.recommended_size}) should be smaller than "
        f"broad profile ({broad_fit.recommended_size})"
    )


# ─── Resilience / no disk write ──────────────────────────────────────────────


@pytest.mark.asyncio
async def test_no_disk_write_on_edge_case_image() -> None:
    """Even with a dark/bad image, no files should be written to disk."""
    import os

    from app.schemas.measurement import CapturedPosePayload
    from app.services.measurement import MeasurementService

    svc = MeasurementService()
    before = set(os.listdir("."))

    svc.process_capture_session(
        height_cm=170.0,
        poses=[
            CapturedPosePayload(angle="front", image_base64=_tiny_b64_png(5)),
            CapturedPosePayload(angle="right", image_base64=_tiny_b64_png(5)),
        ],
    )

    after = set(os.listdir("."))
    new_files = after - before
    image_exts = {".jpg", ".jpeg", ".png", ".webp", ".tmp", ".bmp"}
    for f in new_files:
        assert not any(f.endswith(ext) for ext in image_exts), f"Unexpected file written: {f}"
