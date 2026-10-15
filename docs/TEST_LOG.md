# StyleMirror: Testing & Bug Log

This log tracks all verification checks, test runs, and findings across live end-to-end integration and automated validation suites.

---

## Bug & Issue Log

| Bug ID | Date | Module | Symptom / Description | Root Cause | Status | Resolution / Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | 2026-10-16 | Web Tests | `Part12Components.test.tsx` failed build with TS errors (`'wrap' is declared but its value is never read`, `HTMLElement \| undefined` not assignable). | Vitest component tests had an unused wrapper function and unchecked array indexing on `screen.getAllByRole('button')[0]`. | **Resolved** | Exported `wrap()` and added guard checks (`const btn = buttons[0]; if (btn) fireEvent.click(btn);`). Verified with `npm run build` passing cleanly. |
| **BUG-002** | 2026-10-16 | Backend Pytest | Running `pytest apps/api/app/tests` from root failed with `ModuleNotFoundError: No module named 'app'`. | Root directory was not in `PYTHONPATH` during standalone pytest invocation. | **Resolved** | Configured `pyproject.toml` pythonpath or run `python -m pytest app/tests` from `apps/api`. All 33 tests passed cleanly. |
| **BUG-003** | 2026-10-16 | Physical Scan | User's real physical webcam cannot be directly automated by headless CI runner without mock or synthetic frames. | Physical hardware barrier in remote CLI environment. | **Documented / Handled** | Added synthetic test fixtures in `tests/fixtures/synthetic/` and `apps/api/scripts/accuracy_check.py` to allow automated verification and local user-driven tape comparison. |

---

## Automated Verification Status

| Module / Test Suite | Scope | Target | Result |
| :--- | :--- | :--- | :--- |
| **Web Unit & Component Tests** | Vitest (`npm test -- --run`) | 19 tests across `Part12Components.test.tsx` and `LandingPage.test.tsx` | **19 / 19 Passed** |
| **Web Production Build** | TypeScript compiler + Vite (`npm run build`) | `tsc -b && vite build` | **Build Succeeded (0 errors)** |
| **Backend API & Service Tests** | Pytest (`python -m pytest app/tests`) | 33 tests covering sessions, catalog, health, measurements, recommendations, sizing, edge cases | **33 / 33 Passed** |
| **Garment 3D Asset Validator** | CLI Script (`apps/api/scripts/validate_garment.py`) | Triangle budget, GLTF structure, texture bounds, skeleton | **Operational** |
| **Synthetic Profile Accuracy** | Integration Suite (`test_part12_edge_cases.py`) | Multi-angle synthetic profiles, dark/blurry image resilience, memory zero-storage validation | **All Passed** |
