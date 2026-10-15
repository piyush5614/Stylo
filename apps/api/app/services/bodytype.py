"""Anthropometric body shape classifier.

Classifies human body silhouettes based on shoulder, waist, and hip ratios
into 5 balanced categories:
- Hourglass
- Inverted Triangle
- Pear
- Rectangle
- Round (Apple)

Returns 'undetermined' when borderline, with a confidence score.
Uses neutral, respectful wording in all user-facing descriptions.
"""

from typing import Any

# Respectful user-facing labels and descriptions
BODY_TYPE_DESCRIPTIONS: dict[str, dict[str, str]] = {
    "hourglass": {
        "title": "Balanced Curves (Hourglass)",
        "summary": "Even balance between shoulders and hips, with gentle waist definition.",
    },
    "inverted_triangle": {
        "title": "Athletic V-Frame (Inverted Triangle)",
        "summary": "Broader shoulder breadth tapering down to narrower hips.",
    },
    "pear": {
        "title": "Base-Focused Silhouette (Pear)",
        "summary": "Gentle shoulders tapering outwards to wider hip proportions.",
    },
    "rectangle": {
        "title": "Streamlined Silhouette (Rectangle)",
        "summary": "Evenly aligned shoulder, waist, and hip proportions for a clean vertical line.",
    },
    "round": {
        "title": "Soft Center Silhouette (Round)",
        "summary": "Curved center torso with softer shoulder and hip transitions.",
    },
    "undetermined": {
        "title": "Versatile Hybrid Silhouette",
        "summary": "Transitional proportions offering versatile styling across multiple cuts.",
    },
}


def classify_body_type(
    shoulder_cm: float,
    waist_cm: float,
    hip_cm: float,
) -> dict[str, Any]:
    """Classifies body shape using shoulder-to-hip and waist-to-hip ratios.

    Borderline thresholds return 'undetermined'.
    """
    if shoulder_cm <= 0 or waist_cm <= 0 or hip_cm <= 0:
        return {
            "body_type": "undetermined",
            "confidence": 0.5,
            "title": BODY_TYPE_DESCRIPTIONS["undetermined"]["title"],
            "summary": BODY_TYPE_DESCRIPTIONS["undetermined"]["summary"],
        }

    shoulder_hip_ratio = shoulder_cm / hip_cm
    waist_hip_ratio = waist_cm / hip_cm
    waist_shoulder_ratio = waist_cm / shoulder_cm

    # 1. Round / Soft center: Waist is the widest dimension – notably larger than both shoulder and hip
    if waist_cm > shoulder_cm and waist_cm > hip_cm and waist_hip_ratio >= 0.96 and waist_shoulder_ratio >= 0.96:
        return {
            "body_type": "round",
            "confidence": 0.88,
            "title": BODY_TYPE_DESCRIPTIONS["round"]["title"],
            "summary": BODY_TYPE_DESCRIPTIONS["round"]["summary"],
        }

    # 2. Inverted Triangle: Shoulders noticeably broader than hips (>1.08x)
    if shoulder_hip_ratio >= 1.08:
        conf = 0.92 if shoulder_hip_ratio >= 1.12 else 0.82
        return {
            "body_type": "inverted_triangle",
            "confidence": conf,
            "title": BODY_TYPE_DESCRIPTIONS["inverted_triangle"]["title"],
            "summary": BODY_TYPE_DESCRIPTIONS["inverted_triangle"]["summary"],
        }

    # 3. Pear: Hips noticeably wider than shoulders (<0.92x)
    if shoulder_hip_ratio <= 0.92:
        conf = 0.92 if shoulder_hip_ratio <= 0.88 else 0.82
        return {
            "body_type": "pear",
            "confidence": conf,
            "title": BODY_TYPE_DESCRIPTIONS["pear"]["title"],
            "summary": BODY_TYPE_DESCRIPTIONS["pear"]["summary"],
        }

    # 4. Shoulders and hips approximately balanced (0.92 <= ratio < 1.08)
    # Check waist definition to distinguish Hourglass from Rectangle
    if 0.93 <= shoulder_hip_ratio <= 1.07:
        if waist_hip_ratio <= 0.78 and waist_shoulder_ratio <= 0.78:
            return {
                "body_type": "hourglass",
                "confidence": 0.90,
                "title": BODY_TYPE_DESCRIPTIONS["hourglass"]["title"],
                "summary": BODY_TYPE_DESCRIPTIONS["hourglass"]["summary"],
            }
        elif waist_hip_ratio >= 0.82 and waist_shoulder_ratio >= 0.82:
            return {
                "body_type": "rectangle",
                "confidence": 0.88,
                "title": BODY_TYPE_DESCRIPTIONS["rectangle"]["title"],
                "summary": BODY_TYPE_DESCRIPTIONS["rectangle"]["summary"],
            }

    # Borderline ratios that fall into transition regions
    return {
        "body_type": "undetermined",
        "confidence": 0.65,
        "title": BODY_TYPE_DESCRIPTIONS["undetermined"]["title"],
        "summary": BODY_TYPE_DESCRIPTIONS["undetermined"]["summary"],
    }
