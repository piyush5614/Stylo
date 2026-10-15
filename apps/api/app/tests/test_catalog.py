"""Tests for catalog router (garments and fabrics)."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_list_garments():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/catalog/garments")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1
        assert len(data["items"]) >= 1
        first = data["items"][0]
        assert "slug" in first
        assert "fabric_name" in first


@pytest.mark.asyncio
async def test_get_garment_detail():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/catalog/garments/essential-minimalist-tee")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "essential-minimalist-tee"
        assert len(data["colors"]) >= 1
        assert len(data["sizes"]) >= 1
        assert data["fabric"] is not None


@pytest.mark.asyncio
async def test_get_garment_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/catalog/garments/non-existent-slug-xyz")
        assert response.status_code == 404
        assert "error" in response.json()


@pytest.mark.asyncio
async def test_list_fabrics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/catalog/fabrics")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "slug" in data[0]


@pytest.mark.asyncio
async def test_get_fabric_detail():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/catalog/fabrics/cotton")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "cotton"
        assert "benefits" in data
