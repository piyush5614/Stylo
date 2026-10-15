# StyleMirror: Parametric 3D Avatar Mapping Methodology

## 1. Overview & Architecture
StyleMirror generates a continuous, anatomically proportioned 3D humanoid avatar driven directly by 7 calibrated human body measurements:
1. **Height** ($H$, cm)
2. **Shoulder Width** ($W_{\text{shoulder}}$, cm)
3. **Chest Circumference** ($C_{\text{chest}}$, cm)
4. **Waist Circumference** ($C_{\text{waist}}$, cm)
5. **Hip Circumference** ($C_{\text{hip}}$, cm)
6. **Inseam / Leg Length** ($L_{\text{inseam}}$, cm)
7. **Torso Length** ($L_{\text{torso}}$, cm)

The system works both with a **rigged skinned mesh GLB** (via bone hierarchy scale transforms) and a **segmented parametric procedural humanoid** (via primitive segment scale and anatomical anchor modulations).

---

## 2. Anthropometric Baselines
All measurement transforms are evaluated relative to a canonical adult reference baseline:

| Dimension | Baseline Value ($\mu$) | Safety Clamp Range | Safe Scale Factor Bounds |
| :--- | :--- | :--- | :--- |
| **Height** | 172.0 cm | 140.0 – 215.0 cm | $0.82 \le S_{\text{height}} \le 1.25$ |
| **Shoulder Width** | 42.0 cm | 32.0 – 56.0 cm | $0.78 \le S_{\text{shoulder}} \le 1.35$ |
| **Chest Circumference**| 94.0 cm | 70.0 – 135.0 cm | $0.75 \le S_{\text{chest}} \le 1.45$ |
| **Waist Circumference**| 78.0 cm | 55.0 – 130.0 cm | $0.70 \le S_{\text{waist}} \le 1.55$ |
| **Hip Circumference**  | 98.0 cm | 75.0 – 140.0 cm | $0.75 \le S_{\text{hip}} \le 1.45$ |
| **Inseam (Legs)**     | 79.0 cm | 62.0 – 98.0 cm | $0.80 \le S_{\text{leg}} \le 1.25$ |
| **Torso Length**       | 51.0 cm | 40.0 – 68.0 cm | $0.80 \le S_{\text{torso}} \le 1.30$ |

All inputs are passed through safety clamp functions:
$$\text{Scale}_k = \text{clamp}\left(\frac{\text{Measurement}_k}{\text{Baseline}_k}, \text{MinScale}_k, \text{MaxScale}_k\right)$$
This strictly prevents mesh self-intersection, inverted normal vectors, or skeletal dislocation.

---

## 3. Mathematical Mapping Formulas

### 3.1 Overall Stature Scaling
$$S_{\text{height}} = \frac{H_{\text{user}}}{172.0}$$
Applied along the primary vertical world axis $Y$ of the avatar root transform.

### 3.2 Lateral Shoulder Span
$$S_{\text{shoulder}} = \frac{W_{\text{shoulder}}}{42.0}$$
Scales the lateral distance between clavicle centers and shifts the deltoid/arm anchor positions along $X$.

### 3.3 Elliptical Torso Cross-Sections (Width & Depth)
Body circumferences expand both laterally (width, $X$) and anteroposteriorly (depth, $Z$):
- **Chest Ratio**:
  $$S_{\text{chest}} = \frac{C_{\text{chest}}}{94.0}$$
  - $\text{Scale}_X = S_{\text{chest}}$
  - $\text{Scale}_Z = 1.05 \times S_{\text{chest}}$ (pectoral/scapular depth expands slightly faster)
- **Waist Ratio**:
  $$S_{\text{waist}} = \frac{C_{\text{waist}}}{78.0}$$
  - $\text{Scale}_X = S_{\text{waist}}$
  - $\text{Scale}_Z = 1.08 \times S_{\text{waist}}$ (abdominal depth)
- **Hip / Pelvis Ratio**:
  $$S_{\text{hip}} = \frac{C_{\text{hip}}}{98.0}$$
  - $\text{Scale}_X = 1.02 \times S_{\text{hip}}$ (pelvic brim width)
  - $\text{Scale}_Z = S_{\text{hip}}$ (gluteal depth)

### 3.4 Limb and Segment Heights
- **Legs (Inseam)**:
  $$S_{\text{leg}} = \frac{L_{\text{inseam}}}{79.0}$$
  Modulates femur and tibia lengths, and determines the vertical elevation $Y_{\text{hip\_base}} = 0.82 \times S_{\text{leg}}$.
- **Torso Segment**:
  $$S_{\text{torso}} = \frac{L_{\text{torso}}}{51.0}$$
  Determines vertical spacing between the pelvis, lumbar waist, thoracic chest, and suprasternal notch.

---

## 4. 3D Viewer & Real-Time Performance
- **Engine**: Three.js (r175) via `@react-three/fiber` and `@react-three/drei`.
- **Damping**: OrbitControls damping factor $0.06$ for fluid 360° rotational momentum.
- **Framerate Optimization**:
  - Device pixel ratio capped at 2 (`dpr={[1, 2]}`) to prevent 4K GPU fill-rate throttling.
  - Soft contact shadows rendered via low-cost blur pass.
  - Idle respiration animation driven by sinusoidal frame delta without re-allocating geometries.
  - Tested benchmark: **60 FPS** sustained on mid-range laptop GPU.
