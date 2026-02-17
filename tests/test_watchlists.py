import pytest


@pytest.mark.asyncio
async def test_create_watchlist(auth_client):
    res = await auth_client.post("/api/watchlists", json={"name": "My Watchlist"})
    assert res.status_code == 200
    assert res.json()["name"] == "My Watchlist"


@pytest.mark.asyncio
async def test_list_watchlists(auth_client):
    await auth_client.post("/api/watchlists", json={"name": "WL 1"})
    await auth_client.post("/api/watchlists", json={"name": "WL 2"})
    res = await auth_client.get("/api/watchlists")
    assert res.status_code == 200
    assert len(res.json()) >= 2


@pytest.mark.asyncio
async def test_add_item_to_watchlist(auth_client):
    wl = await auth_client.post("/api/watchlists", json={"name": "Test WL"})
    wl_id = wl.json()["id"]
    res = await auth_client.post(f"/api/watchlists/{wl_id}/items", json={"symbol": "TCS.NS"})
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_delete_watchlist(auth_client):
    wl = await auth_client.post("/api/watchlists", json={"name": "Delete Me"})
    wl_id = wl.json()["id"]
    res = await auth_client.delete(f"/api/watchlists/{wl_id}")
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_watchlist_unauthorized(client):
    res = await client.get("/api/watchlists")
    assert res.status_code == 401
