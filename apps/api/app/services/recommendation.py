"""Explainable recommendation engine driving garment picks and color variants.

Uses external rules from app/rules/style_rules.json.
Generates 2 to 3 plain-language reasons with respectful, positive wording.
"""

import json
from pathlib import Path
from typing import Any

from app.schemas.catalog import GarmentColorResponse, GarmentSummaryResponse
from app.schemas.recommendations import (
    PersonalizedRecommendationsResponse,
    RecommendationItem,
)
from app.services.fabric import get_fabric_insights
from app.services.sizing import evaluate_garment_fit

RULES_PATH = Path(__file__).resolve().parent.parent / "rules" / "style_rules.json"


def load_rules() -> dict[str, Any]:
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def score_and_recommend_garments(
    session_id: str,
    garments: list[dict[str, Any]],
    body_measurements: dict[str, float],
    body_type: str = "rectangle",
    undertone: str = "neutral",
    depth: str = "medium",
    occasion: str | None = None,
    season: str | None = None,
) -> PersonalizedRecommendationsResponse:
    rules = load_rules()
    body_rules = rules.get("body_type_rules", {}).get(body_type.lower(), {})
    color_rules = rules.get("color_rules", {}).get(undertone.lower(), {})
    favored_hues = [h.lower() for h in color_rules.get("favored_hues", [])]

    # Height category
    user_height = body_measurements.get("height_cm", 172.0)
    height_cat = "average"
    if user_height < 165:
        height_cat = "petite"
    elif user_height > 182:
        height_cat = "tall"

    height_rules = rules.get("height_rules", {}).get(height_cat, {})

    recommendations: list[RecommendationItem] = []

    for g in garments:
        # Filter check: occasion
        if occasion and occasion.lower() != "all":
            garment_occasions = [occ.lower() for occ in g.get("occasion", [])]
            if not any(occasion.lower() in occ for occ in garment_occasions):
                continue

        base_score = 65.0
        reasons: list[str] = []

        # 1. Fit & Neckline scoring
        fit_type = g.get("fit_type", "regular").lower()
        if fit_type in [f.lower() for f in body_rules.get("favored_fits", [])]:
            base_score += 15.0
            reasons.append(body_rules["reasons"][0])

        neckline = g.get("neckline")
        if neckline and any(neckline.lower() in fn.lower() for fn in body_rules.get("favored_necklines", [])):
            base_score += 10.0
            if len(body_rules.get("reasons", [])) > 1:
                reasons.append(body_rules["reasons"][1])

        # 2. Length scoring based on height
        length = g.get("length")
        if length and any(length.lower() in fl.lower() for fl in height_rules.get("favored_lengths", [])):
            base_score += 5.0
            reasons.append(height_rules.get("reason", "Maintains proportional vertical lines."))

        # 3. Size fitting evaluation
        sizing_eval = evaluate_garment_fit(
            garment_slug=g.get("slug", ""),
            category=g.get("category", "top"),
            fit_type=fit_type,
            body_measurements=body_measurements,
            garment_sizes=g.get("sizes", []),
        )
        rec_size = sizing_eval.recommended_size

        # 4. Color picking based on undertone
        colors = g.get("colors", [])
        suggested_color: GarmentColorResponse | None = None
        color_matched = False

        for c in colors:
            c_hex = c.get("hex", "").lower()
            if any(h in c_hex or c_hex in h for h in favored_hues):
                suggested_color = GarmentColorResponse(**c)
                base_score += 5.0
                color_matched = True
                break

        if not suggested_color and colors:
            suggested_color = GarmentColorResponse(**colors[0])

        if color_matched and color_rules.get("reason"):
            reasons.append(color_rules["reason"])

        # Fabric highlight
        fabric_slug = g.get("fabric_slug") or g.get("category", "cotton")
        fab_info = get_fabric_insights(fabric_slug)
        fabric_highlight = fab_info.get("why_it_suits_you", "Premium comfortable fabric.")

        # Ensure at least 2 positive reasons
        if len(reasons) < 2:
            reasons.append("Versatile cut engineered for comfortable daily movement.")

        # Deduplicate reasons while preserving order
        unique_reasons: list[str] = []
        for r in reasons:
            if r not in unique_reasons:
                unique_reasons.append(r)

        clamped_score = min(98.0, max(60.0, base_score))

        garment_summary = GarmentSummaryResponse(
            id=g["id"],
            name=g["name"],
            slug=g["slug"],
            category=g["category"],
            fit_type=g["fit_type"],
            base_price=g.get("base_price", 0.0),
            thumbnail_url=g.get("thumbnail_url"),
            fabric_name=g.get("fabric_name"),
            fabric_slug=g.get("fabric_slug"),
            fabric_id=g.get("fabric_id", ""),
            is_active=g.get("is_active", True),
            neckline=g.get("neckline"),
            length=g.get("length"),
            pattern=g.get("pattern"),
            occasion=g.get("occasion", []),
        )

        recommendations.append(
            RecommendationItem(
                garment=garment_summary,
                score=round(clamped_score, 1),
                recommended_size=rec_size,
                suggested_color=suggested_color,
                reasons=unique_reasons[:3],
                fabric_highlight=fabric_highlight,
            )
        )

    # Sort descending by match score
    recommendations.sort(key=lambda x: x.score, reverse=True)

    body_titles = {
        "hourglass": "Balanced Curves (Hourglass)",
        "inverted_triangle": "Athletic V-Frame (Inverted Triangle)",
        "pear": "Base-Focused Silhouette (Pear)",
        "rectangle": "Streamlined Silhouette (Rectangle)",
        "round": "Soft Center Silhouette (Round)",
    }

    return PersonalizedRecommendationsResponse(
        session_id=session_id,
        detected_body_type=body_type,
        body_type_title=body_titles.get(body_type.lower(), "Versatile Silhouette"),
        detected_undertone=undertone,
        detected_depth=depth,
        occasion_filter=occasion,
        season_filter=season,
        items=recommendations,
        how_we_chose_these={
            "rules_applied": [
                f"Body proportion rules for {body_type}",
                f"Color harmony rules for {undertone} undertone",
                f"Proportional length scaling for {height_cat} stature ({int(user_height)}cm)",
            ],
            "transparency_notice": (
                "Every recommendation is computed using open, data-driven styling rules "
                "without opaque algorithmic scoring. You can customize your detected body "
                "shape and undertone at any time."
            ),
        },
    )
