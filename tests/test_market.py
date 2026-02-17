import pytest
from unittest.mock import patch


MOCK_STOCKS = [
    {"symbol": "RELIANCE.NS", "current_price": 2500.0, "change": 50.0, "percent_change": 2.04, "previous_close": 2450.0},
    {"symbol": "TCS.NS", "current_price": 3500.0, "change": -30.0, "percent_change": -0.85, "previous_close": 3530.0},
    {"symbol": "INFY.NS", "current_price": 1500.0, "change": 20.0, "percent_change": 1.35, "previous_close": 1480.0},
]


@pytest.mark.asyncio
@patch("app.services.market.fetch_all_stocks", return_value=MOCK_STOCKS)
async def test_market_overview(mock_fetch, client):
    res = await client.get("/api/market/overview")
    assert res.status_code == 200
    data = res.json()
    assert "gainers" in data
    assert "losers" in data


@pytest.mark.asyncio
@patch("app.services.market.fetch_all_stocks", return_value=MOCK_STOCKS)
async def test_sector_performance(mock_fetch, client):
    res = await client.get("/api/market/sectors")
    assert res.status_code == 200
