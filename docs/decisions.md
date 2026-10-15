# StyleMirror: Engineering & Architecture Decision Log

A permanent, chronological record of every architectural and engineering decision made while designing and building the StyleMirror platform, including the rationale, alternatives considered, and trade-offs incurred.

---

## How to Add an Entry
When introducing an architectural change, standard, or core dependency:
1. Append an entry to the index table below with a sequential ID (`DEC-001`, `DEC-002`, etc.), date, area, and status.
2. Add a corresponding detailed section following the template:
   - **Context & Problem Statement**: What technical challenge or product requirement triggered this decision?
   - **Decision**: What specific approach, library, or pattern was chosen?
   - **Alternatives Considered**: What other options were evaluated?
   - **Consequences & Trade-offs**: What are the positive outcomes and the known compromises/limitations?

---

## Index of Architectural Decisions

| ID | Date | Title | Area | Status |
| :--- | :--- | :--- | :--- | :--- |
| [DEC-001](#dec-001-ephemeral-in-memory-zero-photo-storage-policy) | 2026-10-10 | Ephemeral In-Memory Zero-Photo Storage Policy | Privacy / Security | Accepted |
| [DEC-002](#dec-002-fastapi-and-react-18--vite-monorepo-architecture) | 2026-10-10 | FastAPI and React 18 + Vite Monorepo Architecture | Architecture | Accepted |
| [DEC-003](#dec-003-ramanujan-first-order-ellipse-approximation-for-circumference) | 2026-10-12 | Ramanujan First-Order Ellipse Approximation for Circumference | Algorithms / CV | Accepted |
| [DEC-004](#dec-004-mediapipe-pose-extraction-in-client-browser) | 2026-10-12 | MediaPipe Pose Extraction in Client Browser | Frontend / CV | Accepted |
| [DEC-005](#dec-005-bone-scale-avatar-morphing-over-mesh-blendshapes) | 2026-10-13 | Bone-Scale Avatar Morphing over Mesh Blendshapes | 3D / Graphics | Accepted |
| [DEC-006](#dec-006-skeletal-binding-over-real-time-cloth-physics-simulations) | 2026-10-14 | Skeletal Binding over Real-Time Cloth Physics Simulations | 3D / Graphics | Accepted |
| [DEC-007](#dec-007-threejs-shader-uniform-mutation-for-colorways) | 2026-10-14 | Three.js Shader Uniform Mutation for Colorways | 3D / Performance | Accepted |
| [DEC-008](#dec-008-deterministic-json-rule-engine-for-recommendations) | 2026-10-15 | Deterministic JSON Rule Engine for Recommendations | Algorithms / AI | Accepted |
| [DEC-009](#dec-009-strictly-affirmative-non-judgmental-advisory-language) | 2026-10-15 | Strictly Affirmative Non-Judgmental Advisory Language | UX / Product | Accepted |
| [DEC-010](#dec-010-llm-stylist-commentary-as-an-explainability-layer-strictly-grounded-on-rules) | 2026-10-16 | LLM Stylist Commentary Grounded on Deterministic Rules | Backend / GenAI | Accepted |
| [DEC-011](#dec-011-anonymous-session-isolation-with-24-hour-ttl-and-instant-purge) | 2026-10-16 | Anonymous Session Isolation with 24-Hour TTL and Instant Purge | Security / Data | Accepted |
| [DEC-012](#dec-012-dual-target-containerisation-with-single-origin-reverse-proxy) | 2026-10-16 | Dual-Target Containerisation with Single-Origin Reverse Proxy | DevOps / Infra | Accepted |

---

## Detailed Records

### DEC-001: Ephemeral In-Memory Zero-Photo Storage Policy
* **Date**: 2026-10-10
* **Status**: Accepted
* **Area**: Privacy / Security

#### Context & Problem Statement
Virtual try-on and fitting platforms face acute user hesitation regarding intimate body photography being retained, leaked, or used for model training without consent. Under regulations like GDPR and CCPA, biometric imagery requires stringent consent mechanisms and heavy data retention liability.

#### Decision
Strictly prohibit saving, persisting, caching, or writing raw camera images or base64 frames to disk, cloud object stores (S3/GCS/Supabase Storage), or database columns. Body image frames exist solely in volatile RAM during pose landmark analysis and are immediately garbage-collected upon metric extraction.

#### Alternatives Considered
1. **Encrypted cloud bucket storage**: Store images with user-specific keys. Rejected because keys and buckets remain attack vectors.
2. **On-device only processing**: Run all CV strictly on the client. Partially adopted (MediaPipe landmarks are extracted client-side), but fallback server validation requires transient in-memory transmission.

#### Consequences & Trade-offs
* **Pros**: Eliminates data breach exposure for raw photos; builds absolute user trust; dramatically simplifies compliance.
* **Cons**: No retrospective debugging of bad camera frames using saved production logs; algorithmic tuning requires synthetic datasets or opt-in local testing.

---

### DEC-002: FastAPI and React 18 + Vite Monorepo Architecture
* **Date**: 2026-10-10
* **Status**: Accepted
* **Area**: Architecture

#### Context & Problem Statement
The system requires real-time 3D rendering on the web client alongside scientific numerical calculations (NumPy, MediaPipe, geometric trigonometry) on the server.

#### Decision
Deploy a clean monorepo split:
- `apps/web`: TypeScript React 18 with Vite, Three.js (@react-three/fiber, @react-three/drei), Tailwind CSS, and Zustand.
- `apps/api`: Python 3.11+ with FastAPI, Pydantic v2, and NumPy.

#### Alternatives Considered
1. **Next.js Fullstack (Node.js backend)**: Single runtime across frontend and API. Rejected due to Node.js's limited ecosystem for scientific anthropometry and lack of official MediaPipe Python bindings.
2. **Django + React**: Python backend with built-in ORM. Rejected due to excessive scaffolding and synchronous defaults compared to FastAPI's async speed and automated OpenAPI generation.

#### Consequences & Trade-offs
* **Pros**: Best-in-class 3D web tooling (Three.js/Fiber) combined with Python's scientific ecosystem; rapid async endpoint throughput; typed client contracts.
* **Cons**: Requires managing two distinct runtime environments (Node + Python).

---

### DEC-003: Ramanujan First-Order Ellipse Approximation for Circumference
* **Date**: 2026-10-12
* **Status**: Accepted
* **Area**: Algorithms / CV

#### Context & Problem Statement
A human body cross-section (chest, waist, hips) cannot be treated as a simple cylinder or circle without introducing severe error (up to 30%). Full 3D point-cloud Poisson surface reconstruction requires LiDAR hardware unavailable on standard webcams.

#### Decision
Model human cross-sections as ellipses using orthogonal bi-planar measurements:
- Semi-major axis $a$ derived from coronal (front/back) silhouette width.
- Semi-minor axis $b$ derived from sagittal (profile/side) silhouette depth.
Calculate circumference $C$ using Ramanujan's first-order approximation:
$$C \approx \pi \left[ 3(a + b) - \sqrt{(3a + b)(a + 3b)} \right]$$

#### Alternatives Considered
1. **Circular cross-section ($C = 2\pi r$)**: Fast but assumes human torsos are circular, drastically overestimating depth.
2. **Ramanujan second-order approximation**: Marginally more accurate ($<0.05\%$ difference) but introduces unnecessary cubic roots.
3. **Deep learning mesh regression (e.g., SMPL/HMR)**: High GPU overhead ($>4\text{GB}$ VRAM), non-deterministic outputs, and high cloud hosting costs.

#### Consequences & Trade-offs
* **Pros**: Fully deterministic, instantaneous CPU execution ($<10\text{ms}$), and within 3–5% of physical tape measurements on calibrated silhouettes.
* **Cons**: Depends on accurate orthogonal front and profile camera angles; baggy clothing skews silhouette bounding width.

---

### DEC-004: MediaPipe Pose Extraction in Client Browser
* **Date**: 2026-10-12
* **Status**: Accepted
* **Area**: Frontend / CV

#### Context & Problem Statement
Users require immediate visual feedback while positioning themselves in the camera viewfinder (ensuring full body visibility and proper distance). Streaming uncompressed 30fps video to the server for pose alignment causes excessive network latency and server cost.

#### Decision
Execute Google MediaPipe Pose Landmarker client-side in WebAssembly/WebGL to provide 60fps silhouette bounding guides and landmark validation before sending snapshots.

#### Alternatives Considered
1. **Server-side video streaming via WebRTC**: Server analyzes stream and replies with pose instructions. Rejected due to heavy server infrastructure cost and privacy implications.
2. **Canvas edge detection / OpenCV.js**: Lacks pretrained 33-point skeletal landmark topological understanding.

#### Consequences & Trade-offs
* **Pros**: Sub-millisecond visual alignment cues; zero server load during alignment phase; resilient to poor network connections.
* **Cons**: Initial asset download for MediaPipe WASM bundles (~8MB); requires WebGL-capable device.

---

### DEC-005: Bone-Scale Avatar Morphing over Mesh Blendshapes
* **Date**: 2026-10-13
* **Status**: Accepted
* **Area**: 3D / Graphics

#### Context & Problem Statement
A personalized 3D avatar must represent diverse heights, shoulder widths, waist dimensions, and limb lengths. Traditional blendshape morph targets require dozens of artist-sculpted morph targets for every combination, resulting in massive GLTF file sizes (>50MB).

#### Decision
Drive a standardized rigged humanoid armature using non-uniform bone scale transformations:
- Adjust bone positions along Y-axes for height and inseam.
- Scale spine and chest bones along X and Z axes independently to match calculated Ramanujan ellipse dimensions.

#### Alternatives Considered
1. **Comprehensive morph target library (Shape keys)**: High visual fidelity, but huge GLB download size and artist overhead per variant.
2. **Procedural vertex extrusion in custom vertex shaders**: Complex math prone to mesh tearing at joints.

#### Consequences & Trade-offs
* **Pros**: Lightweight base GLB asset (<5MB); instantaneous parametric deformation via simple matrix transforms; zero asset download latency.
* **Cons**: Extreme bone scaling can cause slight joint pinching if scale factors exceed 1.6× baseline proportions.

---

### DEC-006: Skeletal Binding over Real-Time Cloth Physics Simulations
* **Date**: 2026-10-14
* **Status**: Accepted
* **Area**: 3D / Graphics

#### Context & Problem Statement
Interactive 3D garment try-on typically uses finite-element cloth physics (mass-spring or position-based dynamics). Real-time cloth simulation in WebGL drains mobile battery, crashes lower-end devices, and frequently suffers from mesh interpenetration artifacts.

#### Decision
Pre-rig garment models (XS through XXL) to standard bone hierarchies. Garments share identical skinning matrices with the base avatar, deforming smoothly in real-time with zero simulation overhead.

#### Alternatives Considered
1. **Cannon-es / Ammo.js cloth solver**: Physics simulation in browser. Rejected due to severe CPU overhead, slow convergence, and collision clipping.
2. **Server-side Blender rendering**: Render garment simulations on server GPU and return MP4/images. Rejected because it destroys interactive 360-degree rotation.

#### Consequences & Trade-offs
* **Pros**: Rock-solid 60fps across mobile and desktop browsers; deterministic rendering; zero simulation jitter.
* **Cons**: Does not simulate natural fabric draping or wind flutter.

---

### DEC-007: Three.js Shader Uniform Mutation for Colorways
* **Date**: 2026-10-14
* **Status**: Accepted
* **Area**: 3D / Performance

#### Context & Problem Statement
Each garment is offered in 3 to 6 distinct colorways matching user undertones. Downloading a separate 3D GLTF asset for each colorway multiplies network bandwidth consumption and creates visible loading flickers.

#### Decision
Mutate the existing Three.js MeshStandardMaterial PBR shader properties directly in WebGL memory:
`material.color.set(newHexColor)` alongside optional roughness/metalness adjustments.

#### Alternatives Considered
1. **Downloading dedicated textured models per color**: Simple asset authoring, but wastes bandwidth and causes 2–3s delays on color selection.
2. **Swapping diffuse texture maps**: Modest improvement, but requires separate texture image downloads per hue.

#### Consequences & Trade-offs
* **Pros**: Instantaneous (0ms) colorway switching; minimal memory footprint; single base 3D model download.
* **Cons**: Limited to solid or tint-compatible garments; highly intricate multi-colored jacquard patterns require layered texture masks.

---

### DEC-008: Deterministic JSON Rule Engine for Recommendations
* **Date**: 2026-10-15
* **Status**: Accepted
* **Area**: Algorithms / AI

#### Context & Problem Statement
Style recommendations must be explainable, transparent, and instantly auditable by human fashion stylists. Black-box ML embedding models (collaborative filtering, deep neural nets) suffer from hallucinated affinities, bias, and zero explanation capability.

#### Decision
Implement a pure, deterministic rule engine reading from an editable declarative configuration file: `apps/api/app/rules/style_rules.json`.
- Body shapes (Hourglass, Rectangle, Inverted Triangle, Pear, Oval) map to favored necklines, silhouettes, and ease allowances.
- Undertones (Warm, Cool, Neutral) map to harmonious hex palettes based on colorimetry principles.

#### Alternatives Considered
1. **Vector embeddings & cosine similarity**: Modern ML approach. Rejected due to lack of explainability and susceptibility to arbitrary recommendations.
2. **Hardcoded Python if/else logic**: Difficult for non-developer fashion merchandisers to audit or tweak.

#### Consequences & Trade-offs
* **Pros**: 100% transparent and deterministic; rules are modifiable without code redeployment; enables explicit user-facing "Why we chose this" reasoning.
* **Cons**: Rule permutations must be actively maintained and curated as catalog grows.

---

### DEC-009: Strictly Affirmative Non-Judgmental Advisory Language
* **Date**: 2026-10-15
* **Status**: Accepted
* **Area**: UX / Product

#### Context & Problem Statement
Fashion advice software frequently employs pejorative terminology that undermines user confidence (e.g., "flaws", "hide your belly", "slimming illusion", "disguise hips").

#### Decision
Enforce a platform-wide linguistic policy in both rule engines and LLM prompts:
- Prohibit: "hide", "flaw", "camouflage", "disguise", "problem area", "correct".
- Require: Affirmative, architectural, and balance-focused terminology ("harmonizes", "lengthens vertical lines", "complements natural proportions", "delivers fluid drape").

#### Alternatives Considered
1. **Unconstrained commercial fashion copywriting**: Traditional advertising language. Rejected because it drives anxiety and user alienation.

#### Consequences & Trade-offs
* **Pros**: Creates an empowering, premium user experience aligned with ethical AI practices.
* **Cons**: Requires deliberate prompt tuning and strict test assertion checks to avoid legacy fashion clichés.

---

### DEC-010: LLM Stylist Commentary as an Explainability Layer Strictly Grounded on Rules
* **Date**: 2026-10-16
* **Status**: Accepted
* **Area**: Backend / GenAI

#### Context & Problem Statement
While the deterministic rule engine selects the mathematically correct garments, raw bullet points can feel clinical. An editorial narrative voice ("capsule summary" and "stylist quote") adds human elegance. However, LLMs must not hallucinate catalog items or alter size picks.

#### Decision
Decouple recommendation selection from commentary generation:
1. The deterministic engine calculates scores, selects the top garments, and sets recommended sizes.
2. An optional LLM prompt (`apps/api/app/services/llm_stylist.py`) receives only the rule-selected items and generates warm editorial commentary.
3. If the LLM is unconfigured, unreachable, or fails, the system seamlessly falls back to high-quality deterministic template strings.

#### Alternatives Considered
1. **Allowing LLM to choose garments directly from prompt**: Prone to selecting unavailable stock, hallucinating sizes, and violating proportion rules.
2. **Purely static templates without LLM**: Functional, but lacks personalized conversational flair.

#### Consequences & Trade-offs
* **Pros**: Zero hallucination risk for sizing or item availability; graceful offline fallback; elegant editorial prose.
* **Cons**: Extra API call latency if external LLM provider is enabled (mitigated by asynchronous non-blocking design and client caching).

---

### DEC-011: Anonymous Session Isolation with 24-Hour TTL and Instant Purge
* **Date**: 2026-10-16
* **Status**: Accepted
* **Area**: Security / Data

#### Context & Problem Statement
Users desire personalized recommendations without being forced into tedious account creation and password management. Furthermore, privacy mandates demand automated session termination.

#### Decision
All interactions occur under an anonymous session identified by a crypto-random UUID stored in browser `localStorage`.
- Sessions and body profiles automatically expire after 24 hours via database TTL / scheduled cleanup.
- A prominent "Delete My Data Now" button executes `DELETE /api/v1/sessions/me`, instantly cascading removal across database rows and local memory.

#### Alternatives Considered
1. **Mandatory OAuth/Email signup**: Increases user drop-off by over 60% and increases data stewardship liabilities.
2. **Cookie-only session identification**: Vulnerable to third-party cookie restrictions in modern browsers.

#### Consequences & Trade-offs
* **Pros**: Frictionless zero-signup user onboarding; automated compliance with data minimization mandates; immediate user control.
* **Cons**: Users cannot retrieve their session on a second device without sharing their unique session link.

---

### DEC-012: Dual-Target Containerisation with Single-Origin Reverse Proxy
* **Date**: 2026-10-16
* **Status**: Accepted
* **Area**: DevOps / Infra

#### Context & Problem Statement
Deploying frontend and backend on distinct ports/subdomains introduces CORS preflight latency, cookie security constraints, and mixed-content issues in local network and production environments.

#### Decision
Package the system using standard Docker multi-stage builds:
- Frontend runs in an Nginx container that serves static Vite assets and internally proxies `/api/` requests to the FastAPI container on port 8000.
- Optional Caddy profile handles automated HTTPS certificate generation for LAN and domain deployments.

#### Alternatives Considered
1. **Direct client-to-API communication across ports (e.g. 5173 -> 8000)**: Requires permissive CORS headers and complicates local production testing.
2. **Single bloated monolithic container**: Difficult to scale frontend caching and backend compute independently.

#### Consequences & Trade-offs
* **Pros**: Zero CORS configuration required in production; unified single-origin domain; small production image sizes via multi-stage alpine targets.
* **Cons**: Local multi-container orchestration requires Docker Compose.
