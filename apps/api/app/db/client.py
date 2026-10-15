"""StyleMirror - Database client and connection factory."""

import logging

from supabase import Client, create_client

from app.core.config import settings

logger = logging.getLogger(__name__)

_supabase_client: Client | None = None


def get_supabase_client() -> Client | None:
    """
    Returns the Supabase service-role client singleton.
    Returns None if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not configured,
    allowing the application to run in offline / mock repository mode.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    if not settings.supabase_url or not settings.supabase_service_role_key:
        logger.warning(
            "Supabase credentials not configured. Repositories will operate in offline/mock mode."
        )
        return None

    try:
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None
