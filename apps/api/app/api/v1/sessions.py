"""Session management router."""

from typing import Annotated

from fastapi import APIRouter, Depends, Header, status

from app.core.errors import AppError
from app.db.sessions import SessionRepository
from app.schemas.catalog import CreateSessionRequest, SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])
session_repo = SessionRepository()


@router.post("", response_model=SessionResponse, status_code=201)
async def create_anonymous_session(req: CreateSessionRequest) -> SessionResponse:
    """
    Creates an anonymous session with 24-hour expiration.
    Requires explicit user consent for in-memory image processing.
    """
    if not req.consent_given:
        raise AppError(
            message="Explicit consent is required to begin virtual try-on.",
            status_code=400,
        )

    return await session_repo.create_session(consent_given=req.consent_given)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_session(
    x_session_id: Annotated[str | None, Header(alias="X-Session-Id")] = None,
) -> None:
    """
    Immediately and permanently deletes the caller's anonymous session and
    all derived body measurements associated with it.

    This is the user-facing 'Delete my data now' action.
    No content is returned on success (HTTP 204).
    """
    if not x_session_id:
        raise AppError(
            message="Missing X-Session-Id header. Cannot identify session to delete.",
            status_code=400,
        )

    deleted = await session_repo.delete_session(x_session_id)
    if not deleted:
        # Idempotent: already gone is fine, but report it clearly
        raise AppError(
            message="Session not found or already deleted.",
            status_code=404,
        )
