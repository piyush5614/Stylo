"""Size charts and body profiles database operations."""

from typing import Any

from app.db.client import get_supabase_client
from app.schemas.catalog import BodyProfileResponse


# In-memory store used when Supabase credentials are absent (dev / testing)
_LOCAL_PROFILES: dict[str, dict[str, Any]] = {}


class SizeChartRepository:
    """Repository handling standard size chart data."""

    def __init__(self, client: Any | None = None) -> None:
        self._client = client or get_supabase_client()

    async def get_by_category(self, category: str) -> list[dict[str, Any]]:
        if not self._client:
            return []
        res = self._client.table("size_charts").select("*").eq("category", category).execute()
        return res.data


class BodyProfileRepository:
    """Repository managing derived customer body measurements."""

    def __init__(self, client: Any | None = None) -> None:
        self._client = client or get_supabase_client()

    async def get_by_session(self, session_id: str) -> BodyProfileResponse | None:
        if not self._client:
            data = _LOCAL_PROFILES.get(session_id)
            if not data:
                return None
            return BodyProfileResponse(**data)

        res = (
            self._client.table("body_profiles")
            .select("*")
            .eq("session_id", session_id)
            .execute()
        )
        if not res.data:
            return None
        return BodyProfileResponse(**res.data[0])

    async def upsert_profile(self, profile_data: dict[str, Any]) -> BodyProfileResponse:
        if not self._client:
            profile_data.setdefault("id", f"mock-{profile_data.get('session_id', 'unknown')}")
            session_id = profile_data.get("session_id", "")
            _LOCAL_PROFILES[session_id] = profile_data
            return BodyProfileResponse(**profile_data)

        res = (
            self._client.table("body_profiles")
            .upsert(profile_data, on_conflict="session_id")
            .execute()
        )
        return BodyProfileResponse(**res.data[0])
