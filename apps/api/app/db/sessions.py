"""Repositories for anonymous sessions and derived body measurements."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from app.db.client import get_supabase_client
from app.schemas.catalog import SessionResponse

# In-memory store used when running without active Supabase credentials
_LOCAL_SESSIONS: dict[str, dict[str, Any]] = {}


class SessionRepository:
    """Repository managing anonymous session lifecycle."""

    def __init__(self, client: Any | None = None) -> None:
        self._client = client or get_supabase_client()

    async def create_session(self, consent_given: bool) -> SessionResponse:
        now = datetime.now(UTC)
        expires = now + timedelta(hours=24)

        if not self._client:
            session_id = str(uuid.uuid4())
            data = {
                "id": session_id,
                "created_at": now,
                "expires_at": expires,
                "consent_given": consent_given,
            }
            _LOCAL_SESSIONS[session_id] = data
            return SessionResponse(**data)

        res = (
            self._client.table("sessions")
            .insert({"consent_given": consent_given})
            .execute()
        )
        row = res.data[0]
        return SessionResponse(
            id=row["id"],
            created_at=datetime.fromisoformat(row["created_at"]),
            expires_at=datetime.fromisoformat(row["expires_at"]),
            consent_given=row["consent_given"],
        )

    async def get_session(self, session_id: str) -> SessionResponse | None:
        if not self._client:
            data = _LOCAL_SESSIONS.get(session_id)
            if not data:
                return None
            return SessionResponse(**data)

        res = self._client.table("sessions").select("*").eq("id", session_id).execute()
        if not res.data:
            return None
        row = res.data[0]
        return SessionResponse(
            id=row["id"],
            created_at=datetime.fromisoformat(row["created_at"]),
            expires_at=datetime.fromisoformat(row["expires_at"]),
            consent_given=row["consent_given"],
        )

    async def is_valid_session(self, session_id: str) -> bool:
        session = await self.get_session(session_id)
        if not session:
            return False
        # Check expiration
        now = datetime.now(UTC)
        return session.expires_at > now

    async def delete_session(self, session_id: str) -> bool:
        """Permanently removes a session and its linked body profile.

        Returns True if a record was found and deleted; False if not found.
        This enables the user's 'Delete my data' action.
        """
        if not self._client:
            existed = session_id in _LOCAL_SESSIONS
            _LOCAL_SESSIONS.pop(session_id, None)
            # Also purge in-memory profile if the profile repo is using shared storage
            from app.db.profiles import _LOCAL_PROFILES  # noqa: PLC0415
            _LOCAL_PROFILES.pop(session_id, None)
            return existed

        # Delete body profile first (FK constraint), then session
        self._client.table("body_profiles").delete().eq("session_id", session_id).execute()
        res = self._client.table("sessions").delete().eq("id", session_id).execute()
        return len(res.data) > 0
