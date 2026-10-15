# StyleMirror: Rule-Based Recommendation Engine Documentation

## 1. Philosophy: Fully Explainable Styling
StyleMirror's recommendation engine rejects opaque machine-learning scoring and black-box algorithms. Every piece of advice presented to the user is grounded in **transparent, positive, deterministic style and textile rules**.

Every recommendation includes:
1. **Match Score** (0–100 scale)
2. **Recommended Size** (derived mathematically from measurements + ease allowances)
3. **Suggested Color Variant** (harmonized with detected or chosen undertone)
4. **2 to 3 Plain-Language Reasons** (e.g., *"A gentle open collar frames the neckline without crowding your frame"*)
5. **Fabric Highlight** (e.g., *"Natural flax weave permits maximum airflow in warm climates"*)

---

## 2. Rule Architecture & File Location

All style rules are externalized and editable without altering Python code logic:
* **Location:** [`apps/api/app/rules/style_rules.json`](file:///c:/Users/asus4/Desktop/New%20Gen%20Project/stylemirror/apps/api/app/rules/style_rules.json)

The rule file contains three primary sections:
* `body_type_rules`
* `color_rules`
* `height_rules`

---

## 3. Editing Body Type Proportions & Fit Rules

Each body shape category (`hourglass`, `inverted_triangle`, `pear`, `rectangle`, `round`, `undetermined`) contains rules for fit preferences, neckline styling, and affirmative plain-language reasoning.

### Example Schema:
```json
{
  "body_type_rules": {
    "hourglass": {
      "favored_fits": ["regular", "slim"],
      "favored_necklines": ["V-Neck", "Camp Collar", "Crewneck"],
      "reasons": [
        "Follows and highlights your balanced proportions with natural waist definition",
        "Gentle open collar frames the neckline without crowding your frame"
      ]
    }
  }
}
```

### Tone Guidelines:
* **Always positive and affirmative:** Focus on balance, movement, comfort, and structure.
* **Never judgmental:** Avoid words like "hide", "flaw", "problem area", "slimming", or "camouflage".
* Examples of approved phrasing:
  * *"Clean vertical lines create an elongating, breathable drape"*
  * *"Straight or relaxed bottoms create visual symmetry down through the hips"*
  * *"Draws flattering focus across the shoulders to create upper-body harmony"*

---

## 4. Editing Skin Tone & Color Palette Rules

Color rules map undertones (`warm`, `cool`, `neutral`) to compatible hex codes and user-facing explanations.

### Example Schema:
```json
{
  "color_rules": {
    "warm": {
      "favored_hues": ["#E3DAC9", "#dfb08c", "#8F9779", "#2B1E16", "#3D4A3E"],
      "reason": "Earthy, warm tones harmonize naturally with golden and olive undertones"
    },
    "cool": {
      "favored_hues": ["#1A1A1A", "#243447", "#1B263B", "#4E6E82", "#4A5568", "#FFFFFF"],
      "reason": "Crisp navies, deep indigos, and cool neutrals complement your cool undertone"
    },
    "neutral": {
      "favored_hues": ["#FFFFFF", "#1A1A1A", "#333333", "#D8CBB5", "#8F9779"],
      "reason": "Balanced neutrals provide a timeless, effortless canvas for your complexion"
    }
  }
}
```

To add a new color to a palette, simply append its 6-digit hex code to `favored_hues`.

---

## 5. Editing Height & Stature Rules

Height rules map user height brackets to proportioned garment lengths and cuts.

### Example Schema:
```json
{
  "height_rules": {
    "petite": {
      "max_height_cm": 164,
      "favored_lengths": ["Waist Length", "Hip Length", "Ankle Length"],
      "reason": "Cropped or hip-length cuts elongate leg lines and preserve vertical balance"
    },
    "average": {
      "min_height_cm": 165,
      "max_height_cm": 182,
      "favored_lengths": ["Hip Length", "Full Length", "Waist Length"],
      "reason": "Standard proportions maintain natural drape without dragging"
    },
    "tall": {
      "min_height_cm": 183,
      "favored_lengths": ["Full Length", "Hip Length"],
      "reason": "Generous full-length hem balances tall stature gracefully"
    }
  }
}
```

---

## 6. How Scoring is Computed (`apps/api/app/services/recommendation.py`)

Each garment begins with a baseline score of 50.0 points. Points are awarded deterministically:
* **Fit Type Match:** +15 points if garment's fit type is in `favored_fits`.
* **Neckline Match:** +12 points if neckline matches the body proportion rules.
* **Length / Height Match:** +10 points if garment length matches stature bracket.
* **Color Harmony:** +15 points if any available garment color matches `favored_hues`.
* **Occasion Filter Match:** +10 points when matching user query.
* **Season Filter Match:** +8 points when matching textile seasonality.

Final scores are clamped to [0.0, 99.5]. High-confidence picks score 80+, and runner-ups score 65–79.
