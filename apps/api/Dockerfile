# ── Stage 1: Build stage with compiler toolchain & dependencies ──
FROM python:3.11-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --prefix=/install .

# ── Stage 2: Minimal runtime image ──
FROM python:3.11-slim AS runner

WORKDIR /app

# Install minimal libraries required by opencv-headless & numpy
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python wheels from builder
COPY --from=builder /install /usr/local

# Copy application source code
COPY app ./app
COPY scripts ./scripts

# Create non-root system user for security
RUN groupadd -r stylemirror && useradd -r -g stylemirror -d /app -s /sbin/nologin stylemirror \
    && chown -R stylemirror:stylemirror /app

USER stylemirror

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    WORKERS=2

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --workers ${WORKERS}"]
