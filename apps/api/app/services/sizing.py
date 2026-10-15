"""Garment sizing and anthropometric fit evaluation engine.

Computes recommended size, runner-up size, and per-area fit ease (chest, waist, hip, etc.)
incorporating designer fit allowances (slim, regular, relaxed, oversized).
"""

from app.schemas.sizing import AreaFitDetail, FitRecommendationResponse

# Designer ease allowances (in cm above nude body circumference)
FIT_TYPE_EASE_ALLOWANCE: dict[str, dict[str, float]] = {
    "slim": {
        "chest": 4.0,
        "waist": 3.0,
        "hip": 4.0,
        "shoulder": 1.0,
    },
    "regular": {
        "chest": 8.0,
        "waist": 6.0,
        "hip": 8.0,
        "shoulder": 2.0,
    },
    "relaxed": {
        "chest": 14.0,
        "waist": 12.0,
        "hip": 14.0,
        "shoulder": 3.5,
    },
    "oversized": {
        "chest": 22.0,
        "waist": 20.0,
        "hip": 22.0,
        "shoulder": 5.0,
    },
}

DEFAULT_EASE = {
    "chest": 8.0,
    "waist": 6.0,
    "hip": 8.0,
    "shoulder": 2.0,
}


def classify_ease_status(diff_from_target: float) -> tuple[str, str]:
    """Classify the difference between actual garment ease and ideal target ease.

    diff = actual_ease - target_ease
    """
    if diff_from_target < -4.0:
        return "tight", "Noticeably constricting; consider sizing up"
    elif diff_from_target < -1.0:
        return "snug", "Form-fitting with minimal movement ease"
    elif diff_from_target <= 3.0:
        return "ideal", "Spot-on intended designer drape"
    elif diff_from_target <= 8.0:
        return "comfortable", "Roomy with generous freedom of movement"
    else:
        return "loose", "Generously oversized; consider sizing down if preferred"


def evaluate_garment_fit(
    garment_slug: str,
    category: str,
    fit_type: str,
    body_measurements: dict[str, float],
    garment_sizes: list[dict],
) -> FitRecommendationResponse:
    """Evaluate sizing options and return optimal size, runner-up, and per-area ease."""
    if not garment_sizes:
        return FitRecommendationResponse(
            garment_slug=garment_slug,
            category=category,
            fit_type=fit_type,
            recommended_size="M",
            confidence=0.5,
            fit_summary="Standard size M chosen (no size chart available)",
            area_details=[],
            available_sizes=[],
        )

    ease_targets = FIT_TYPE_EASE_ALLOWANCE.get(fit_type.lower(), DEFAULT_EASE)

    # Relevant primary key dimension depending on garment category
    primary_key = "chest_cm" if category in ("top", "outerwear", "dress") else "waist_cm"
    body_primary = body_measurements.get(primary_key, 94.0 if primary_key == "chest_cm" else 78.0)

    # Score each size
    size_scores = []
    for s in garment_sizes:
        garment_primary = s.get(primary_key)

        if garment_primary is None:
            score = 50.0
            diff = 0.0
        else:
            target_ease = ease_targets.get("chest" if primary_key == "chest_cm" else "waist", 8.0)
            actual_ease = garment_primary - body_primary
            # Ideal difference from target ease is 0. Penalty grows if negative
            diff = actual_ease - target_ease
            penalty = abs(diff) * 2.2 if diff < 0 else diff * 1.0
            score = penalty

        size_scores.append((score, diff, s))

    size_scores.sort(key=lambda x: x[0])

    _best_score, best_diff, best_size_entry = size_scores[0]
    recommended_size = best_size_entry.get("size_label", "M")
    glb_url = best_size_entry.get("glb_url")

    runner_up_size = None
    if len(size_scores) > 1:
        runner_up_size = size_scores[1][2].get("size_label")

    # Generate detailed area metrics for best size
    area_details: list[AreaFitDetail] = []
    dim_mappings = [
        ("chest", "chest_cm", 94.0),
        ("waist", "waist_cm", 78.0),
        ("hip", "hip_cm", 98.0),
        ("shoulder", "shoulder_cm", 42.0),
    ]

    for area_name, dim_key, default_val in dim_mappings:
        g_val = best_size_entry.get(dim_key)
        if g_val is not None:
            b_val = body_measurements.get(dim_key, default_val)
            actual_ease = round(g_val - b_val, 1)
            target_ease = ease_targets.get(area_name, 6.0)
            status, comment = classify_ease_status(actual_ease - target_ease)
            area_details.append(
                AreaFitDetail(
                    area=area_name,
                    body_cm=round(b_val, 1),
                    garment_cm=round(g_val, 1),
                    ease_cm=actual_ease,
                    fit_status=status,
                    comment=comment,
                )
            )

    # Inseam / Length
    if best_size_entry.get("inseam_cm") is not None:
        g_inseam = best_size_entry["inseam_cm"]
        b_inseam = body_measurements.get("inseam_cm", 79.0)
        area_details.append(
            AreaFitDetail(
                area="inseam",
                body_cm=round(b_inseam, 1),
                garment_cm=round(g_inseam, 1),
                ease_cm=round(g_inseam - b_inseam, 1),
                fit_status="ideal" if abs(g_inseam - b_inseam) < 3.0 else "comfortable",
                comment="Pant break touches top of footwear accurately",
            )
        )

    # Overall fit summary
    if abs(best_diff) <= 2.0:
        fit_summary = f"Optimal {fit_type} silhouette tailored to your scanned measurements."
    elif best_diff < 0:
        fit_summary = f"Closer, tailored {fit_type} drape. If you prefer more room, size up."
    else:
        fit_summary = "Relaxed, easy drape with ample ease across the body."

    available_sizes = [s.get("size_label", "") for s in garment_sizes if s.get("size_label")]

    return FitRecommendationResponse(
        garment_slug=garment_slug,
        category=category,
        fit_type=fit_type,
        recommended_size=recommended_size,
        runner_up_size=runner_up_size,
        confidence=0.92,
        fit_summary=fit_summary,
        area_details=area_details,
        available_sizes=available_sizes,
        glb_url=glb_url,
    )
