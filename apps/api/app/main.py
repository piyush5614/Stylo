"""StyleMirror API - FastAPI entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_v1_router
from app.core.config import settings
from app.core.errors import AppError, app_error_handler
from app.core.logging import setup_logging

# ─── Simple in-process rate limiter for the /measurements/analyze endpoint ──
# Uses a sliding-window counter per IP. Not suitable for multi-process
# deployments (use Redis-backed SlowAPI there), but robust for single-process.
import time
from collections import defaultdict

_RATE_LIMIT_WINDOW_SECONDS = 60
_RATE_LIMIT_MAX_REQUESTS = 10  # per minute per IP
_rate_counters: dict[str, list[float]] = defaultdict(list)


def _is_rate_limited(client_ip: str) -> bool:
    now = time.monotonic()
    window_start = now - _RATE_LIMIT_WINDOW_SECONDS
    hits = _rate_counters[client_ip]
    # Prune old timestamps
    hits[:] = [t for t in hits if t > window_start]
    if len(hits) >= _RATE_LIMIT_MAX_REQUESTS:
        return True
    hits.append(now)
    return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown hooks."""
    setup_logging()
    yield


def create_app() -> FastAPI:
    """FastAPI application factory."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    # In production set CORS_ORIGINS in the environment; defaults to the
    # local Vite dev server.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-Session-Id", "Authorization"],
        expose_headers=["X-Request-Id"],
        max_age=600,
    )

    # ── Security response headers ─────────────────────────────────────────
    @app.middleware("http")
    async def security_headers(request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(self), microphone=(), geolocation=()"
        )
        # CSP: allow same-origin + CDN assets; tighten as needed in production
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' blob:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: blob: https://storage.placeholder.stylemirror.internal; "
            "connect-src 'self'; "
            "worker-src blob:; "
            "frame-ancestors 'none';"
        )
        return response

    # ── Rate limiting for the CPU-heavy analyze endpoint ─────────────────
    @app.middleware("http")
    async def rate_limit_analyze(request: Request, call_next) -> Response:
        if request.url.path == "/api/v1/measurements/analyze" and request.method == "POST":
            client_ip = (
                request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
                or request.client.host  # type: ignore[union-attr]
                or "unknown"
            )
            if _is_rate_limited(client_ip):
                return Response(
                    content='{"detail":"Rate limit exceeded. Max 10 analyze requests per minute."}',
                    status_code=429,
                    headers={"Content-Type": "application/json", "Retry-After": "60"},
                )
        return await call_next(request)

    # ── Error handlers ────────────────────────────────────────────────────
    app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]

    # ── Include API routes ────────────────────────────────────────────────
    app.include_router(api_v1_router, prefix="/api/v1")

    return app


app = create_app()
