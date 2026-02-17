import pytest


@pytest.mark.asyncio
async def test_register(client):
    res = await client.post("/api/auth/register", json={
        "email": "new@example.com",
        "username": "newuser",
        "password": "password123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_register_duplicate(client):
    await client.post("/api/auth/register", json={
        "email": "dup@example.com",
        "username": "dupuser",
        "password": "password123",
    })
    res = await client.post("/api/auth/register", json={
        "email": "dup@example.com",
        "username": "dupuser",
        "password": "password123",
    })
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_login(client):
    await client.post("/api/auth/register", json={
        "email": "login@example.com",
        "username": "loginuser",
        "password": "password123",
    })
    res = await client.post("/api/auth/login", json={
        "username": "loginuser",
        "password": "password123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/auth/register", json={
        "email": "wrong@example.com",
        "username": "wronguser",
        "password": "password123",
    })
    res = await client.post("/api/auth/login", json={
        "username": "wronguser",
        "password": "wrongpassword",
    })
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_me(auth_client):
    res = await auth_client.get("/api/auth/me")
    assert res.status_code == 200
    assert res.json()["username"] == "testuser"


@pytest.mark.asyncio
async def test_get_me_unauthorized(client):
    res = await client.get("/api/auth/me")
    assert res.status_code == 401
