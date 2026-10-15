"""Fabric repository – thin re-export for backwards-compatible imports.

The FabricRepository class lives alongside the garment seed data in
``app.db.garments``. This module re-exports it so callers can use the
semantically cleaner ``from app.db.fabrics import FabricRepository``.
"""

from app.db.garments import FabricRepository  # noqa: F401

__all__ = ["FabricRepository"]
