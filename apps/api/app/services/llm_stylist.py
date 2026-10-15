"""LLM-written commentary layer on top of deterministic rule-based picks.

Rules DECIDE the picks, sizes, and colors; the LLM merely acts as an articulate,
supportive personal stylist synthesizing why those rule-selected items work harmoniously.
If no LLM API key is configured or the network call fails, it gracefully falls back
to a polished template synthesis so recommendations never fail.
"""

import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def generate_styling_commentary(
    body_type: str,
    undertone: str,
    depth: str,
    height_cm: float,
    items: list[dict[str, Any]],
) -> tuple[str, dict[str, str]]:
    """Generates an overall capsule summary and per-item stylist notes.

    Returns:
        (ai_capsule_summary, {garment_slug: ai_stylist_note})
    """
    if not items:
        return (
            "Your curated capsule reflects effortless silhouette balance and harmonic colorways.",
            {},
        )

    # If no LLM key provided, return rich template-based stylist commentary
    if not settings.llm_api_key:
        return _fallback_commentary(body_type, undertone, depth, height_cm, items)

    prompt = _build_stylist_prompt(body_type, undertone, depth, height_cm, items)

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            # Standard Gemini REST endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.llm_model}:generateContent?key={settings.llm_api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 600,
                    "responseMimeType": "application/json",
                },
            }
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                import json

                parsed = json.loads(text)
                capsule_summary = parsed.get("capsule_summary", "")
                notes = parsed.get("item_notes", {})
                return (capsule_summary, notes)
            else:
                logger.warning(
                    "LLM stylist API returned non-200 (%s). Using fallback commentary.",
                    resp.status_code,
                )
    except Exception as e:
        logger.warning("LLM commentary generation error (%s). Falling back gracefully.", e)

    return _fallback_commentary(body_type, undertone, depth, height_cm, items)


def _build_stylist_prompt(
    body_type: str,
    undertone: str,
    depth: str,
    height_cm: float,
    items: list[dict[str, Any]],
) -> str:
    garment_summaries = []
    for it in items[:4]:
        g = it.get("garment", {})
        reasons = it.get("reasons", [])
        garment_summaries.append(
            f"- Slug: '{g.get('slug')}', Name: '{g.get('name')}', Fit: '{g.get('fit_type')}', "
            f"Color: '{it.get('suggested_color', {}).get('name') if it.get('suggested_color') else 'Default'}', "
            f"Rule reasons: {'; '.join(reasons)}"
        )

    items_block = "\n".join(garment_summaries)

    return f"""You are an elite, empathetic personal wardrobe consultant for StyleMirror.
The deterministic rule system has ALREADY evaluated the user's measurements and selected these exact garments.
Your job is to provide warm, articulate, affirmative styling commentary explaining how these rule-selected pieces fit together.
Never use negative language like 'hide', 'problem areas', or 'camouflage'. Emphasize balance, drape, and confidence.

User Profile:
- Body Type Category: {body_type}
- Complexion Undertone: {undertone} ({depth} depth)
- Stature: {height_cm:.1f} cm

Selected Garments:
{items_block}

Return a JSON object with this exact schema:
{{
  "capsule_summary": "A 2-3 sentence inspiring synthesis of the overall capsule aesthetic and how it complements the user's proportions and undertone.",
  "item_notes": {{
    "<slug>": "1 concise sentence (under 25 words) from a professional stylist highlighting why this specific cut or shade elevates their look."
  }}
}}
"""


def _fallback_commentary(
    body_type: str,
    undertone: str,
    depth: str,
    height_cm: float,
    items: list[dict[str, Any]],
) -> tuple[str, dict[str, str]]:
    """Deterministic, high-quality editorial fallback when LLM is inactive."""
    capsule_summary = (
        f"This curated collection is tailored specifically for your {body_type.replace('_', ' ')} proportions "
        f"and {undertone} complexion, pairing balanced silhouettes with complementary textile ease."
    )

    item_notes: dict[str, str] = {}
    for it in items:
        g = it.get("garment", {})
        slug = g.get("slug")
        if not slug:
            continue
        reasons = it.get("reasons", [])
        primary_reason = reasons[0] if reasons else "Provides timeless silhouette balance."
        item_notes[slug] = (
            f"Stylist pick: {primary_reason.rstrip('.')} with an intentional, relaxed drape."
        )

    return (capsule_summary, item_notes)
