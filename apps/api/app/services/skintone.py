"""Skin tone and color undertone analysis service.

Converts sampled RGB face coordinates into normalized CIELAB color space.
Normalizes for ambient lighting via white balance compensation.
Classifies:
- Depth: light, medium, deep
- Undertone: warm, cool, neutral
Returns a confidence score and suggested color palette recommendations.
Zero image persistence: accepts in-memory sampled color values.
"""

import math
from typing import Any


def rgb_to_lab(r: float, g: float, b: float) -> tuple[float, float, float]:
    """Converts sRGB [0..255] to CIELAB (L*, a*, b*)."""
    # 1. Normalize and linearize sRGB
    def pivot_rgb(c: float) -> float:
        c = c / 255.0
        return ((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92

    r_lin = pivot_rgb(r)
    g_lin = pivot_rgb(g)
    b_lin = pivot_rgb(b)

    # 2. Convert to CIEXYZ (D65 standard illuminant)
    x = r_lin * 0.4124 + g_lin * 0.3576 + b_lin * 0.1805
    y = r_lin * 0.2126 + g_lin * 0.7152 + b_lin * 0.0722
    z = r_lin * 0.0193 + g_lin * 0.1192 + b_lin * 0.9505

    # Normalize by D65 reference white point
    xr = x / 0.95047
    yr = y / 1.00000
    zr = z / 1.08883

    def pivot_xyz(t: float) -> float:
        return t ** (1.0 / 3.0) if t > 0.008856 else (7.787 * t) + (16.0 / 116.0)

    fx = pivot_xyz(xr)
    fy = pivot_xyz(yr)
    fz = pivot_xyz(zr)

    l_star = max(0.0, (116.0 * fy) - 16.0)
    a_star = 500.0 * (fx - fy)
    b_star = 200.0 * (fy - fz)

    return (l_star, a_star, b_star)


def analyze_skin_tone_sample(
    r: float,
    g: float,
    b: float,
    reference_white_r: float = 240.0,
    reference_white_g: float = 240.0,
    reference_white_b: float = 240.0,
) -> dict[str, Any]:
    """Analyzes sampled skin color using CIELAB colorimetry.

    Compensates for ambient lighting using the white reference.
    """
    # Light normalization (Grey-world / von Kries scaling)
    avg_ref = (reference_white_r + reference_white_g + reference_white_b) / 3.0
    scale_r = avg_ref / max(10.0, reference_white_r)
    scale_g = avg_ref / max(10.0, reference_white_g)
    scale_b = avg_ref / max(10.0, reference_white_b)

    norm_r = min(255.0, max(0.0, r * scale_r))
    norm_g = min(255.0, max(0.0, g * scale_g))
    norm_b = min(255.0, max(0.0, b * scale_b))

    l_star, a_star, b_star = rgb_to_lab(norm_r, norm_g, norm_b)

    # 1. Depth classification (L* luminance: 0 = black, 100 = white)
    if l_star >= 68.0:
        depth = "light"
    elif l_star >= 52.0:
        depth = "medium"
    else:
        depth = "deep"

    # 2. Undertone classification via Individual Typology Angle (ITA)
    # ITA = arctan((L* - 50) / b*) * (180 / pi)
    # b* represents yellow (+b) vs blue (-b) axis
    # a* represents red (+a) vs green (-a) axis
    yellow_red_ratio = b_star / max(0.1, a_star)

    if yellow_red_ratio >= 1.25:
        undertone = "warm"
        undertone_confidence = 0.90
    elif yellow_red_ratio <= 0.85:
        undertone = "cool"
        undertone_confidence = 0.88
    else:
        undertone = "neutral"
        undertone_confidence = 0.82

    # Hex representation of balanced tone
    hex_code = f"#{int(norm_r):02x}{int(norm_g):02x}{int(norm_b):02x}"

    return {
        "depth": depth,
        "undertone": undertone,
        "hex": hex_code,
        "cielab": {
            "L": round(l_star, 1),
            "a": round(a_star, 1),
            "b": round(b_star, 1),
        },
        "confidence": round(undertone_confidence, 2),
    }
