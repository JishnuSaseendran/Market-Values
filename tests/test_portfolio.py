import pytest
from unittest.mock import patch, MagicMock
import pandas as pd


def mock_yfinance_ticker(symbol):
    mock = MagicMock()
    dates = pd.date_range("2024-01-01", periods=2, freq="D")
    mock.history.return_value = pd.DataFrame({
        "Open": [100.0, 102.0],
        "High": [105.0, 106.0],
        "Low": [99.0, 101.0],
        "Close": [103.0, 104.0],
        "Volume": [1000000, 1200000],
    }, index=dates)
    return mock


@pytest.mark.asyncio
async def test_create_portfolio_entry(auth_client):
    res = await auth_client.post("/api/portfolio", json={
        "symbol": "RELIANCE.NS",
        "buy_price": 2500.0,
        "quantity": 10,
        "buy_date": "2024-01-15",
        "notes": "First buy",
    })
    assert res.status_code == 200
    assert res.json()["symbol"] == "RELIANCE.NS"


@pytest.mark.asyncio
@patch("app.routers.portfolio.fetch_all_stocks")
async def test_list_portfolio(mock_fetch, auth_client):
    mock_fetch.return_value = [{"symbol": "RELIANCE.NS", "current_price": 2600.0}]

    await auth_client.post("/api/portfolio", json={
        "symbol": "RELIANCE.NS",
        "buy_price": 2500.0,
        "quantity": 10,
    })
    res = await auth_client.get("/api/portfolio")
    assert res.status_code == 200
    assert "total_invested" in res.json()
    assert "entries" in res.json()


@pytest.mark.asyncio
async def test_delete_portfolio_entry(auth_client):
    create = await auth_client.post("/api/portfolio", json={
        "symbol": "TCS.NS",
        "buy_price": 3500.0,
        "quantity": 5,
    })
    entry_id = create.json()["id"]
    res = await auth_client.delete(f"/api/portfolio/{entry_id}")
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_portfolio_unauthorized(client):
    res = await client.get("/api/portfolio")
    assert res.status_code == 401
