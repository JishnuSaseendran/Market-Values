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
    mock.info = {
        "longName": "Test Stock",
        "sector": "Technology",
        "industry": "Software",
        "marketCap": 1000000000,
    }
    return mock


@pytest.mark.asyncio
@patch("app.services.stocks.yf.Ticker", side_effect=mock_yfinance_ticker)
async def test_get_stocks(mock_ticker, client):
    res = await client.get("/api/stocks")
    assert res.status_code == 200
    assert "data" in res.json()


@pytest.mark.asyncio
@patch("app.services.stocks.yf.Ticker", side_effect=mock_yfinance_ticker)
async def test_get_candles(mock_ticker, client):
    res = await client.get("/api/stocks/candles/RELIANCE.NS?interval=5m")
    assert res.status_code == 200
    assert "data" in res.json()
    assert "indicators" in res.json()


@pytest.mark.asyncio
async def test_invalid_interval(client):
    res = await client.get("/api/stocks/candles/RELIANCE.NS?interval=invalid")
    assert res.status_code == 400


@pytest.mark.asyncio
@patch("app.services.stocks.yf.Ticker", side_effect=mock_yfinance_ticker)
async def test_search(mock_ticker, client):
    res = await client.get("/api/stocks/search?q=reliance")
    assert res.status_code == 200
    assert "results" in res.json()


@pytest.mark.asyncio
@patch("app.services.stocks.yf.Ticker", side_effect=mock_yfinance_ticker)
async def test_stock_info(mock_ticker, client):
    res = await client.get("/api/stocks/RELIANCE.NS/info")
    assert res.status_code == 200
