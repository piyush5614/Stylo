# StyleMirror: Body Measurement Estimation Methodology

## 1. Overview & Core Philosophy
StyleMirror estimates 7 key human body dimensions from 4 calibrated orthogonal camera views (**Front**, **Right Profile**, **Back**, **Left Profile**) using computer vision, MediaPipe skeletal landmarks, person segmentation masks, and an elliptical circumference approximation model.

> **CRITICAL ACCURACY NOTICE**:
> All dimensions computed by this system are **ESTIMATES**. They provide sizing recommendations and 3D avatar proportioning. They are not physical medical measurements. Confidence values (0.0 to 1.0) reflect lighting, landmark detection visibility, and pose alignment. Users can manually correct all values.

---

## 2. Image Capture & In-Memory Preprocessing
1. **Views**: 4 orthogonal angles (Front, Right 90°, Back 180°, Left 270°).
2. **Resolution**: Downscaled in client memory so the long edge is at most 1280px (maintaining aspect ratio).
3. **Privacy**: Transmitted as in-memory JPEG byte streams; decoded into memory buffers via OpenCV; **never written to disk, filesystem, or permanent storage**.

---

## 3. Scale Factor Calibration ($\text{Scale}_{\text{px\_to\_cm}}$)
MediaPipe normalized landmark coordinates $(\hat{x}, \hat{y})$ are mapped to image pixel coordinates $(x, y) = (\hat{x} \cdot W, \hat{y} \cdot H)$.

To convert pixel distances into real-world centimeters, we require the user's ground-truth stature $H_{\text{user}}$ in cm:
1. In the front view, detect the top of the head $y_{\text{head}}$ (estimated from eye/nose landmarks plus cranial offset) and the average ground contact point of the feet $y_{\text{ground}} = \frac{y_{\text{left\_heel}} + y_{\text{right\_heel}}}{2}$.
2. The total vertical pixel span is:
   $$\Delta y_{\text{body}} = |y_{\text{ground}} - y_{\text{head}}|$$
3. The scale factor is:
   $$S = \frac{H_{\text{user}}}{\Delta y_{\text{body}}} \quad (\text{cm per pixel})$$

---

## 4. Linear Skeletal Dimensions

### 4.1 Shoulder Width ($\text{Width}_{\text{shoulder}}$)
Measured between the left and right acromion process landmarks (MediaPipe landmark 11 and 12):
$$D_{\text{shoulder\_px}} = \sqrt{(x_{12} - x_{11})^2 + (y_{12} - y_{11})^2}$$
$$\text{Shoulder Width (cm)} = D_{\text{shoulder\_px}} \times S \times C_{\text{shoulder}}$$
*Correction factor $C_{\text{shoulder}} \approx 1.08$ compensates for superficial deltoid muscle padding beyond skeletal joints.*

### 4.2 Inseam ($\text{Length}_{\text{inseam}}$)
Measured from the perineum/crotch midpoint $(x_{\text{crotch}}, y_{\text{crotch}})$ down to the medial malleolus (ankle joint 27/28):
$$y_{\text{crotch}} = \frac{y_{\text{left\_hip}} + y_{\text{right\_hip}}}{2}$$
$$y_{\text{ankle}} = \frac{y_{\text{left\_ankle}} + y_{\text{right\_ankle}}}{2}$$
$$\text{Inseam (cm)} = |y_{\text{ankle}} - y_{\text{crotch}}| \times S \times C_{\text{inseam}}$$

### 4.3 Torso Length ($\text{Length}_{\text{torso}}$)
Measured vertically from the suprasternal notch (midpoint between shoulders) to the hip midpoint:
$$y_{\text{cervical}} = \frac{y_{\text{left\_shoulder}} + y_{\text{right\_shoulder}}}{2}$$
$$\text{Torso (cm)} = |y_{\text{crotch}} - y_{\text{cervical}}| \times S$$

---

## 5. Circumference Estimation via Ramanujan Elliptical Model

Body cross-sections (chest, waist, hips) approximate ellipses where:
- Semi-major axis $a = \frac{w}{2}$ (half width from Front view)
- Semi-minor axis $b = \frac{d}{2}$ (half depth from Profile view)

### 5.1 Determining Cross-Section Widths ($w$) and Depths ($d$)
At each anatomical height:
- **Chest**: Evaluated at $y_{\text{chest}} = y_{\text{shoulder}} + 0.35 \times (y_{\text{hip}} - y_{\text{shoulder}})$
- **Waist**: Evaluated at natural waist indent $y_{\text{waist}} = y_{\text{shoulder}} + 0.65 \times (y_{\text{hip}} - y_{\text{shoulder}})$
- **Hips**: Evaluated at greater trochanters $y_{\text{hip}} = \frac{y_{\text{left\_hip}} + y_{\text{right\_hip}}}{2} + 0.15 \times (y_{\text{knee}} - y_{\text{hip}})$

At each vertical line $y$, the horizontal silhouette span is extracted from the segmentation mask:
$$w = (x_{\text{right\_boundary}} - x_{\text{left\_boundary}}) \times S$$
Similarly, from the Right/Left profile view:
$$d = (x_{\text{posterior\_boundary}} - x_{\text{anterior\_boundary}}) \times S$$

### 5.2 Ramanujan's Second Approximation for Ellipse Perimeter
Given semi-axes $a = \frac{w}{2}$ and $b = \frac{d}{2}$, let $h = \frac{(a - b)^2}{(a + b)^2}$.
$$\text{Circumference} \approx \pi (a + b) \left( 1 + \frac{3h}{10 + \sqrt{4 - 3h}} \right) \times C_{\text{anatomical}}$$
Where $C_{\text{anatomical}}$ is an empirical soft-tissue curvature coefficient:
- $C_{\text{chest}} = 1.02$
- $C_{\text{waist}} = 0.98$
- $C_{\text{hip}} = 1.03$

---

## 6. Confidence Scoring Formula
Total confidence score $\Phi \in [0.0, 1.0]$ aggregates:
1. **Landmark Visibility** ($V_{\text{pose}} \in [0, 1]$): Average visibility score of key joints from MediaPipe.
2. **Pose Quality** ($Q_{\text{pose}} \in [0, 1]$): Penalties if shoulders are tilted ($>5^\circ$), arms are clamped to torso, or ankles are cut off.
3. **Cross-View Symmetry** ($S_{\text{views}} \in [0, 1]$): Concordance between right and left profile depths.

$$\Phi = 0.4 \times V_{\text{pose}} + 0.4 \times Q_{\text{pose}} + 0.2 \times S_{\text{views}}$$

Any estimation with $\Phi < 0.65$ triggers on-screen advice to re-take in better lighting.
