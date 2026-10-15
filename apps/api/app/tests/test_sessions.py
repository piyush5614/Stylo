"""Tests for sessions router and security dependency."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_create_session_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/sessions",
            json={"consent_given": True},
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["consent_given"] is True
        assert "expires_at" in data


@pytest.mark.asyncio
async def test_create_session_without_consent_fails():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/sessions",
            json={"consent_given": False},
        )
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
