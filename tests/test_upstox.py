import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import async_session, init_db


@pytest.fixture
async def setup_db():
    await init_db()


@pytest.fixture
async def client(setup_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_headers(client):
    """Register and login a test user, return auth headers."""
    await client.post("/api/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
    })
    resp = await client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "testpass123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_upstox_status_not_linked(client, auth_headers):
    resp = await client.get("/api/upstox/status", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["linked"] is False


@pytest.mark.asyncio
async def test_upstox_auth_url(client, auth_headers):
    with patch("app.routers.upstox.UPSTOX_API_KEY", "test-key"):
        resp = await client.get("/api/upstox/auth-url", headers=auth_headers)
        assert resp.status_code == 200
        assert "url" in resp.json()
        assert "test-key" in resp.json()["url"]


@pytest.mark.asyncio
async def test_upstox_auth_url_no_key(client, auth_headers):
    with patch("app.routers.upstox.UPSTOX_API_KEY", ""):
        resp = await client.get("/api/upstox/auth-url", headers=auth_headers)
        assert resp.status_code == 500


@pytest.mark.asyncio
async def test_upstox_holdings_not_linked(client, auth_headers):
    resp = await client.get("/api/upstox/holdings", headers=auth_headers)
    assert resp.status_code == 400
    assert "not linked" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_upstox_orders_not_linked(client, auth_headers):
    resp = await client.get("/api/upstox/orders", headers=auth_headers)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_upstox_unlink_when_not_linked(client, auth_headers):
    resp = await client.delete("/api/upstox/unlink", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"


@pytest.mark.asyncio
async def test_upstox_requires_auth(client):
    resp = await client.get("/api/upstox/status")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_place_order_not_linked(client, auth_headers):
    resp = await client.post("/api/upstox/orders", headers=auth_headers, json={
        "symbol": "NSE_EQ|RELIANCE",
        "qty": 1,
        "order_type": "MARKET",
        "transaction_type": "BUY",
        "product": "CNC",
        "validity": "DAY",
    })
    assert resp.status_code == 400
