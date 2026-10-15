"""Session validation and security dependencies."""


from fastapi import Header

from app.core.errors import AppError
from app.db.sessions import SessionRepository

session_repo = SessionRepository()


async def get_required_session_id(
    x_session_id: str | None = Header(None, alias="X-Session-Id"),
) -> str:
    """
    Validates X-Session-Id header presence and ensures session exists and is not expired.
    """
    if not x_session_id:
        raise AppError(
            message="Missing required header 'X-Session-Id'. Please initialize a session first.",
            status_code=401,
        )

    is_valid = await session_repo.is_valid_session(x_session_id)
    if not is_valid:
        raise AppError(
            message="Invalid or expired session. Please start a new session.",
            status_code=401,
        )

    return x_session_id
