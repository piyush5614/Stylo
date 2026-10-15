#!/usr/bin/env python3
"""
StyleMirror Real-Photo Accuracy Script
=======================================
Sends your 4 real photos to the local backend and compares measured vs tape values.

Usage:
    python scripts/accuracy_check.py

Prerequisites:
    1. Backend running: uvicorn app.main:app --host 0.0.0.0 --port 8000
    2. tests/fixtures/private/MY_MEASUREMENTS.json filled in with your real measurements
    3. tests/fixtures/private/front.jpg, right.jpg, back.jpg, left.jpg in place
"""

import base64
import json
import sys
from pathlib import Path

import urllib.request

# ── Config ────────────────────────────────────────────────────────────────────
API_BASE = "http://localhost:8000"
PRIVATE_DIR = Path(__file__).parent.parent / "tests" / "fixtures" / "private"
MEASUREMENTS_FILE = PRIVATE_DIR / "MY_MEASUREMENTS.json"


def _load_image_b64(path: Path) -> str:
    """Loads an image file and returns a data URI base64 string."""
    suffix = path.suffix.lower()
    mime = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}.get(suffix, "image/jpeg")
    raw = path.read_bytes()
    b64 = base64.b64encode(raw).decode("ascii")
    return f"data:{mime};base64,{b64}"


def _post_json(url: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


def _get_json(url: str, headers: dict | None = None) -> dict:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def _pct_err(measured: float, tape: float) -> float:
    if tape == 0:
        return 0.0
    return abs(measured - tape) / tape * 100.0


def main() -> None:
    # ── 1. Load user measurements ────────────────────────────────────────────
    if not MEASUREMENTS_FILE.exists():
        print("❌  Missing: tests/fixtures/private/MY_MEASUREMENTS.json")
        print("    Copy the template and fill in your real tape measurements and photos.")
        sys.exit(1)

    with open(MEASUREMENTS_FILE, encoding="utf-8") as f:
        user_data = json.load(f)

    height_cm: float = float(user_data["height_cm"])
    tape: dict[str, float] = user_data["tape_measurements"]

    if height_cm == 0:
        print("❌  Please fill in 'height_cm' in MY_MEASUREMENTS.json")
        sys.exit(1)

    # ── 2. Locate photos ────────────────────────────────────────────────────
    ANGLES = ["front", "right", "back", "left"]
    poses = []
    for angle in ANGLES:
        for ext in (".jpg", ".jpeg", ".png"):
            photo_path = PRIVATE_DIR / f"{angle}{ext}"
            if photo_path.exists():
                print(f"  📷 Loading {photo_path.name}…")
                poses.append({
                    "angle": angle,
                    "image_base64": _load_image_b64(photo_path),
                    "landmarks": None,
                })
                break
        else:
            print(f"  ⚠️  Photo not found for angle '{angle}' — proceeding without it")

    if not poses:
        print("❌  No photos found in tests/fixtures/private/")
        print("    Please place front.jpg, right.jpg, back.jpg, left.jpg there.")
        sys.exit(1)

    # ── 3. Create a test session ─────────────────────────────────────────────
    print("\n→ Creating anonymous session…")
    sess = _post_json(f"{API_BASE}/api/v1/sessions", {"consent_given": True})
    session_id = sess["id"]
    print(f"  Session ID: {session_id}")

    # ── 4. POST to /measurements/analyze ────────────────────────────────────
    print("→ Sending photos for analysis…")
    payload = {"height_cm": height_cm, "poses": poses}
    headers_for_post = {
        "Content-Type": "application/json",
        "X-Session-Id": session_id,
    }
    req = urllib.request.Request(
        f"{API_BASE}/api/v1/measurements/analyze",
        data=json.dumps(payload).encode(),
        headers=headers_for_post,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read())

    # ── 5. Build comparison table ────────────────────────────────────────────
    measured_map = {
        "shoulder_cm": result.get("shoulder_cm", {}).get("value_cm", 0),
        "chest_cm":    result.get("chest_cm",    {}).get("value_cm", 0),
        "waist_cm":    result.get("waist_cm",    {}).get("value_cm", 0),
        "hip_cm":      result.get("hip_cm",      {}).get("value_cm", 0),
        "inseam_cm":   result.get("inseam_cm",   {}).get("value_cm", 0),
        "torso_cm":    result.get("torso_cm",    {}).get("value_cm", 0),
    }

    LIMITS = {
        "shoulder_cm": 3.0,
        "chest_cm":    4.0,
        "waist_cm":    4.0,
        "hip_cm":      4.0,
        "inseam_cm":   3.0,
        "torso_cm":    3.0,
    }

    print("\n" + "=" * 70)
    print(f"{'Measurement':<20} {'Tape':>8} {'Measured':>10} {'Err cm':>8} {'Err %':>8} {'Status':>8}")
    print("-" * 70)

    any_fail = False
    for key, tape_val in tape.items():
        measured_val = measured_map.get(key, 0.0)
        err_cm = abs(measured_val - tape_val)
        err_pct = _pct_err(measured_val, tape_val)
        limit = LIMITS.get(key, 4.0)
        status = "✅ OK" if err_cm <= limit else "⚠️  HIGH"
        if err_cm > limit:
            any_fail = True
        print(f"{key:<20} {tape_val:>8.1f} {measured_val:>10.1f} {err_cm:>8.1f} {err_pct:>7.1f}% {status:>8}")

    print("=" * 70)
    print(f"\nOverall confidence: {result.get('overall_confidence', 0):.0%}")
    print(f"Detected body type: {result.get('body_type', 'unknown')}")

    if any_fail:
        print("\n⚠️  One or more measurements exceeded the acceptable error threshold.")
        print("   See docs/accuracy-report.md for root cause analysis.")
    else:
        print("\n✅  All measurements within acceptable error thresholds!")

    # ── 6. Delete the test session (privacy) ────────────────────────────────
    del_req = urllib.request.Request(
        f"{API_BASE}/api/v1/sessions/me",
        headers={"X-Session-Id": session_id},
        method="DELETE",
    )
    try:
        with urllib.request.urlopen(del_req, timeout=10):
            pass
        print("✅  Test session deleted from backend (privacy clean-up).")
    except Exception as e:
        print(f"⚠️  Could not delete test session: {e}")


if __name__ == "__main__":
    main()
