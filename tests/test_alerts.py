import pytest


@pytest.mark.asyncio
async def test_create_alert(auth_client):
    res = await auth_client.post("/api/alerts", json={
        "symbol": "RELIANCE.NS",
        "condition": "above",
        "target_price": 3000.0,
    })
    assert res.status_code == 200
    assert res.json()["symbol"] == "RELIANCE.NS"
    assert res.json()["is_active"] is True


@pytest.mark.asyncio
async def test_list_alerts(auth_client):
    await auth_client.post("/api/alerts", json={
        "symbol": "TCS.NS",
        "condition": "below",
        "target_price": 3000.0,
    })
    res = await auth_client.get("/api/alerts")
    assert res.status_code == 200
    assert len(res.json()) >= 1


@pytest.mark.asyncio
async def test_delete_alert(auth_client):
    create = await auth_client.post("/api/alerts", json={
        "symbol": "INFY.NS",
        "condition": "above",
        "target_price": 2000.0,
    })
    alert_id = create.json()["id"]
    res = await auth_client.delete(f"/api/alerts/{alert_id}")
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_invalid_condition(auth_client):
    res = await auth_client.post("/api/alerts", json={
        "symbol": "RELIANCE.NS",
        "condition": "invalid",
        "target_price": 3000.0,
    })
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_alert_trigger_logic():
    from app.services.alerts import check_alerts
    from app.models import Alert
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
    from app.database import Base

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as db:
        alert = Alert(user_id=1, symbol="RELIANCE.NS", condition="above", target_price=2500.0, is_active=True)
        db.add(alert)
        await db.commit()

        triggered = await check_alerts(db, {"RELIANCE.NS": 2600.0})
        assert len(triggered) == 1
        assert triggered[0]["symbol"] == "RELIANCE.NS"

    await engine.dispose()
