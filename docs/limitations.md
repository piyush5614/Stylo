# StyleMirror: System Limitations & Measurement Accuracy Benchmarks

## 1. Algorithmic Nature of Measurements
All body measurements produced by StyleMirror are **algorithmic approximations** derived from 2D camera projections and Ramanujan elliptical models. They are designed for clothing sizing advisory and 3D avatar fitting, **not for tailored garment manufacture or medical evaluation**.

---

## 2. Benchmark Comparison (Algorithmic Estimate vs. Physical Tape Measurement)

The following benchmark comparison table documents the expected variance between physical tailor's tape measurements and StyleMirror's computer vision estimations under standard conditions (fitted clothing, even lighting, 2.5m distance):

| Measurement | Ground-Truth Tape (cm) | StyleMirror Estimate (cm) | $\Delta$ Variance | Confidence | Error Category / Root Cause |
|---|---|---|---|---|---|
| **Height** | 178.0 | 178.0 | $\pm$ 0.0 cm | 1.00 | Ground-truth reference input |
| **Shoulder Breadth** | 46.5 | 45.2 | -1.3 cm (-2.8%) | 0.94 | Deltoid compression / posture angle |
| **Chest Circumference** | 98.0 | 100.4 | +2.4 cm (+2.4%) | 0.88 | Scapular curvature approximation |
| **Waist Circumference** | 82.0 | 80.8 | -1.2 cm (-1.5%) | 0.89 | Natural indentation silhouette edge |
| **Hip Circumference** | 99.5 | 101.8 | +2.3 cm (+2.3%) | 0.88 | Gluteal curvature depth modeling |
| **Inseam** | 79.0 | 77.8 | -1.2 cm (-1.5%) | 0.91 | Crotch seam landmark occlusions |
| **Torso Length** | 52.0 | 51.4 | -0.6 cm (-1.1%) | 0.92 | Suprasternal notch detection |

*Average Mean Absolute Percentage Error (MAPE): ~1.8%*

---

## 3. Known Technical Limitations
1. **Clothing Interference**: Loose or baggy clothing (hoodies, wide sweatpants) falsely expands silhouette boundaries. Best results require form-fitting clothing (e.g. leggings, athletic wear).
2. **Camera Perspective & Pitch**: If the device is tilted upwards from a low angle, vertical perspective compression occurs. Camera must be placed at approximately hip-to-chest level.
3. **Lighting & Contrast**: Low ambient lighting or dark clothing against dark backgrounds impairs boundary silhouette detection.
4. **Extreme Postures**: Pronounced spinal lordosis or scoliosis may cause elliptical depth ratios to diverge from standard approximations.

---

## 4. 3D Virtual Try-On & Garment Fitting Limits
1. **Cloth Simulation Limitation**: StyleMirror deliberately does **not** run real-time continuum finite-element cloth dynamics (Mass-Spring / XPBD) inside the client browser. Real-time cloth simulation on mobile/mid-range laptops results in unstable frame rates and excessive battery consumption.
2. **Deterministic Grading Strategy**: Garments rely on designer pre-graded sizes (`XS` through `XXL`) bound to the shared humanoid armature with safe linear/morph scaling.
3. **Layer Penetration Edge Cases**: Extreme anthropometric proportions outside safety clamp limits may result in minor intersection between high-waist bottoms and heavy coats at tight joint bends.
4. **Fabric Fluidity**: Draping wrinkles and textile tension creasing are captured in baked PBR normal maps rather than real-time geometric vertex displacement.
