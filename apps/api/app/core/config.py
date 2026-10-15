"""StyleMirror API - core configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_anon_key: str = ""

    # CORS
    cors_origins: str = "http://localhost:5173"

    # App
    app_name: str = "StyleMirror API"
    app_version: str = "0.1.0"
    log_level: str = "info"
    debug: bool = False

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
