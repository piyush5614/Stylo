# StyleMirror: 3D Garment Asset & Fitting Pipeline

## 1. Overview
StyleMirror implements a deterministic **rigged pre-fitted multi-size garment architecture**.
Rather than calculating non-deterministic real-time cloth simulations on client mobile/laptop GPUs, garments are authored by 3D designers in Blender for canonical anthropometric sizes (**XS**, **S**, **M**, **L**, **XL**, **XXL**). Each garment is bound to the standard humanoid skeleton, allowing it to seamlessly track the avatar's pose, breathing animation, and parametric scale factors.

---

## 2. Authoring Guidelines (Blender)

### 2.1 The Standard Avatar Reference
1. Import the canonical reference humanoid `avatar-base.glb` at scale $1.0$ ($172\text{ cm}$ reference height).
2. Model or drape the garment in the canonical **A-Pose** ($25^\circ$ lateral arm abduction).
3. Ensure the garment mesh does not intersect the reference body at zero ease.

### 2.2 Skeleton Binding & Skinning
1. Parent the garment mesh to the humanoid armature using **With Automatic Weights** or transfer vertex weights from the reference body:
   - Modifiers $\rightarrow$ Add **Data Transfer** modifier $\rightarrow$ Source: `Avatar_Body` $\rightarrow$ Vertex Data: `Vertex Groups`.
2. Inspect joint articulation (shoulders, elbows, hips, knees) to prevent skin-poking artifacts.

### 2.3 Size Variants (Grading)
Create distinct size variants (`XS`, `S`, `M`, `L`, `XL`, `XXL`) matching the official size chart dimensions:
- Scale chest, waist, and hem circumferences according to the target garment measurement specifications.
- Store each size as a distinct GLB or as morph target blendshapes (`Size_S`, `Size_M`, etc.).

---

## 3. Optimization & Compression (`gltf-transform`)

Run the automated geometry optimization pipeline before publishing to production storage:

```bash
# 1. Deduplicate vertices and index buffers
gltf-transform dedup input.glb temp1.glb

# 2. Reorder mesh primitives for GPU cache efficiency
gltf-transform reorder temp1.glb temp2.glb

# 3. Compress geometry with Google Draco or EXT_meshopt_compression
gltf-transform optimize temp2.glb output.glb --draco.method edgebreaker

# 4. Resize and compress textures into KTX2/WebP (Max 2048x2048)
gltf-transform resize output.glb output.glb --width 2048 --height 2048
```

---

## 4. File Naming Conventions & Storage Hierarchy

All assets uploaded to the `garment-models` Supabase bucket or CDN must strictly adhere to the following naming pattern:

```text
garments/{category}/{garment_slug}/{size_label}.glb
```

### Examples:
- `garments/top/essential-minimalist-tee/s.glb`
- `garments/top/essential-minimalist-tee/m.glb`
- `garments/bottom/heritage-straight-denim/m.glb`
- `garments/cap/metro-structured-6panel-cap/m.glb`

---

## 5. Production Validation Checklist

Before any garment is published to the catalog, the automated validation script (`apps/api/scripts/validate_garment.py`) verifies:

- [ ] **Triangle Budget**: Garment polygon count $\le 30,000$ triangles (Total outfit under $80\text{k}$).
- [ ] **Bone Hierarchy Match**: Armature includes standard humanoid bone names (`Hips`, `Spine`, `Chest`, `Shoulder`, etc.).
- [ ] **Material Slots**: Standard PBR materials (`MeshStandardMaterial`), PBR metallic-roughness workflow.
- [ ] **Texture Resolution**: Base color and normal maps must not exceed $2048 \times 2048$ pixels.
- [ ] **File Size**: Under $3.5\text{ MB}$ per compressed GLB file.
- [ ] **Morph Targets Clamping**: Any shape keys must normalize between $0.0$ and $1.0$.
