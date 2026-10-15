"""Unit tests for measurement service math, Ramanujan formula, and zero disk image persistence."""

import os

from app.schemas.measurement import CapturedPosePayload
from app.services.measurement import MeasurementService, ramanujan_ellipse_perimeter


def test_ramanujan_ellipse_perimeter():
    # Circle test: a=10, b=10 -> perimeter = 2*pi*10 ≈ 62.83185
    circ = ramanujan_ellipse_perimeter(10.0, 10.0)
    assert abs(circ - 62.83185) < 0.05

    # Ellipse test: a=20, b=10
    circ_ellipse = ramanujan_ellipse_perimeter(20.0, 10.0)
    assert circ_ellipse > 62.83
    assert circ_ellipse < 125.66


def test_measurement_calculation_with_synthetic_fixtures():
    service = MeasurementService()
    lms = service._generate_synthetic_landmarks()

    scale, quality = service.calculate_scale_factor(height_cm=178.0, landmarks=lms)
    assert scale > 150.0  # cm per vertical unit
    assert quality >= 0.75

    linears = service.compute_linear_dimensions(lms, scale)
    assert 38.0 <= linears["shoulder"][0] <= 56.0
    assert 40.0 <= linears["torso"][0] <= 65.0
    assert 68.0 <= linears["inseam"][0] <= 90.0

    circs = service.estimate_circumferences(lms, scale)
    assert 80.0 <= circs["chest"][0] <= 125.0
    assert 65.0 <= circs["waist"][0] <= 110.0
    assert 82.0 <= circs["hip"][0] <= 125.0


def test_zero_image_bytes_persisted():
    """Verifies that processing images does not write any files to the local file system."""
    service = MeasurementService()
    initial_files = set(os.listdir("."))

    dummy_b64 = (
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP/////////////////////////"
        "/////////////////////////////////////////////wgALCAAKAAoBAREA/8QAFBABAAAAAAAAAAAA"
        "AAAAAAAAAP/aAAgBAQABPxA="
    )
    poses = [
        CapturedPosePayload(angle="front", image_base64=dummy_b64),
        CapturedPosePayload(angle="right", image_base64=dummy_b64),
    ]

    analysis = service.process_capture_session(height_cm=175.0, poses=poses)
    assert analysis.height_cm == 175.0
    assert analysis.shoulder_cm.value_cm > 0.0

    # Ensure no new image or temp files created in root working directory
    current_files = set(os.listdir("."))
    new_files = current_files - initial_files
    image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".tmp"}
    for f in new_files:
        assert not any(f.endswith(ext) for ext in image_extensions)
