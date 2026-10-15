"""Fabric insights service delivering textile attributes, care notes, and suitability lines."""

from typing import Any

FABRIC_INSIGHTS_DATABASE: dict[str, dict[str, Any]] = {
    "cotton": {
        "why_it_suits_you": "100% natural organic cotton fiber maximizes all-day breathability and soft skin comfort.",
        "best_for_climate": "Mild to warm days; ideal base layer across all four seasons.",
        "stretch_rating": 2,
        "breathability_rating": 5,
        "durability_rating": 4,
    },
    "linen": {
        "why_it_suits_you": "Open flax weave promotes rapid heat dissipation, keeping you cool even in humid climates.",
        "best_for_climate": "High summer heat and resort environments.",
        "stretch_rating": 1,
        "breathability_rating": 5,
        "durability_rating": 4,
    },
    "wool": {
        "why_it_suits_you": "Natural crimped merino wool provides micro-climate thermoregulation and odor resistance.",
        "best_for_climate": "Cool autumn and winter temperatures or brisk mornings.",
        "stretch_rating": 4,
        "breathability_rating": 4,
        "durability_rating": 4,
    },
    "denim": {
        "why_it_suits_you": "Structured twill denim shapes clean vertical lines that mold naturally to your body over time.",
        "best_for_climate": "Year-round casual wear; wind-resistant in cooler weather.",
        "stretch_rating": 1,
        "breathability_rating": 3,
        "durability_rating": 5,
    },
    "viscose": {
        "why_it_suits_you": "Fluid cellulose drape flows effortlessly over curves with a lightweight, silky finish.",
        "best_for_climate": "Spring and warm summer evenings.",
        "stretch_rating": 2,
        "breathability_rating": 4,
        "durability_rating": 3,
    },
    "polyester": {
        "why_it_suits_you": "Wrinkle-resistant technical synthetic keeps its crisp silhouette through long work days.",
        "best_for_climate": "Transitional seasons and active commutes.",
        "stretch_rating": 3,
        "breathability_rating": 2,
        "durability_rating": 5,
    },
}

DEFAULT_FABRIC_INSIGHT = {
    "why_it_suits_you": "High-grade textile blend engineered for everyday drape, resilience, and comfort.",
    "best_for_climate": "All-season versatility.",
    "stretch_rating": 3,
    "breathability_rating": 4,
    "durability_rating": 4,
}


def get_fabric_insights(fabric_slug: str) -> dict[str, Any]:
    """Returns specialized textile insights for a given fabric slug."""
    slug_key = fabric_slug.lower()
    for key, data in FABRIC_INSIGHTS_DATABASE.items():
        if key in slug_key:
            return data
    return DEFAULT_FABRIC_INSIGHT
