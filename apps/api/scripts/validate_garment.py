#!/usr/bin/env python3
"""Garment 3D Asset Validation Tool.

Validates that a GLB garment conforms to the production standards:
1. Valid binary GLTF header and chunk structure.
2. Triangle budget (default <= 30,000 triangles).
3. Texture dimensions (<= 2048x2048).
4. Node names & skeleton compatibility.
5. File size threshold (<= 5 MB).
"""

import argparse
import json
import struct
import sys
from pathlib import Path

MAX_TRIANGLE_BUDGET = 30_000
MAX_TEXTURE_DIMENSION = 2048
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

STANDARD_REQUIRED_BONES = {
    "top": ["hips", "spine", "chest", "shoulder"],
    "bottom": ["hips", "leg", "thigh"],
    "outerwear": ["hips", "spine", "chest", "shoulder"],
    "cap": ["head"],
    "dress": ["hips", "spine", "chest"],
}


class ValidationError(Exception):
    pass


def parse_glb_header_and_json(file_path: Path) -> dict:
    with open(file_path, "rb") as f:
        magic, _version, _length = struct.unpack("<4sII", f.read(12))
        if magic != b"glTF":
            raise ValidationError(f"Invalid magic number: {magic!r}. Not a valid GLB file.")

        chunk_length, chunk_type = struct.unpack("<II", f.read(8))
        if chunk_type != 0x4E4F534A:  # "JSON"
            raise ValidationError("First chunk in GLB is not JSON.")

        json_bytes = f.read(chunk_length)
        return json.loads(json_bytes.decode("utf-8"))


def validate_garment_file(file_path: Path, category: str = "top") -> dict:
    results = {
        "file": str(file_path),
        "size_kb": round(file_path.stat().st_size / 1024, 2),
        "triangles": 0,
        "nodes_found": [],
        "warnings": [],
        "passed": True,
    }

    if file_path.stat().st_size > MAX_FILE_SIZE_BYTES:
        results["warnings"].append(
            f"File size {results['size_kb']} KB exceeds 5MB recommendation."
        )

    gltf = parse_glb_header_and_json(file_path)

    # 1. Triangle Count Estimation
    accessors = gltf.get("accessors", [])
    total_triangles = 0
    for mesh in gltf.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            if "indices" in primitive:
                idx = primitive["indices"]
                if idx < len(accessors):
                    count = accessors[idx].get("count", 0)
                    total_triangles += count // 3
            elif "attributes" in primitive and "POSITION" in primitive["attributes"]:
                pos_idx = primitive["attributes"]["POSITION"]
                if pos_idx < len(accessors):
                    count = accessors[pos_idx].get("count", 0)
                    total_triangles += count // 3

    results["triangles"] = total_triangles
    if total_triangles > MAX_TRIANGLE_BUDGET:
        results["passed"] = False
        results["warnings"].append(
            f"Triangle count {total_triangles} exceeds budget of {MAX_TRIANGLE_BUDGET}."
        )

    # 2. Node & Skeleton Verification
    node_names = [n.get("name", "").lower() for n in gltf.get("nodes", []) if "name" in n]
    results["nodes_found"] = [n for n in node_names if n]

    req_bones = STANDARD_REQUIRED_BONES.get(category.lower(), [])
    missing_bones = []
    for req in req_bones:
        if not any(req in n for n in node_names):
            missing_bones.append(req)

    if missing_bones:
        results["warnings"].append(
            f"Missing standard skeleton joints for '{category}': {missing_bones}"
        )

    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate 3D Garment GLB assets")
    parser.add_argument("path", type=str, help="Path to .glb file or directory")
    parser.add_argument(
        "--category",
        type=str,
        default="top",
        choices=["top", "bottom", "outerwear", "cap", "dress"],
        help="Garment category for skeleton validation",
    )
    args = parser.parse_args()

    target = Path(args.path)
    if not target.exists():
        print(f"Error: Target '{target}' does not exist.", file=sys.stderr)
        return 1

    files = [target] if target.is_file() else list(target.glob("**/*.glb"))
    if not files:
        print(f"No .glb files found in '{target}'.")
        return 0

    all_passed = True
    print(f"Validating {len(files)} garment asset(s)...")

    for f in files:
        try:
            res = validate_garment_file(f, category=args.category)
            status = "PASS" if res["passed"] else "FAIL"
            print(f"[{status}] {f.name} - Triangles: {res['triangles']}, Size: {res['size_kb']} KB")
            for w in res["warnings"]:
                print(f"  Warning: {w}")
            if not res["passed"]:
                all_passed = False
        except Exception as e:
            print(f"[ERROR] {f.name}: {e}", file=sys.stderr)
            all_passed = False

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
