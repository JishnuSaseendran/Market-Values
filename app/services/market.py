import asyncio
import logging
from app.services.stocks import fetch_all_stocks
from app.config import STOCK_CODES, INDEX_SYMBOLS, SECTORS
from app.cache import cache_get_json, cache_set_json

logger = logging.getLogger(__name__)


async def get_market_overview():
    cache_key = "market:overview"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    stocks = await fetch_all_stocks(STOCK_CODES)
    indices = await fetch_all_stocks(INDEX_SYMBOLS)

    sorted_by_change = sorted(stocks, key=lambda s: s["percent_change"], reverse=True)
    gainers = sorted_by_change[:5]
    losers = sorted_by_change[-5:][::-1]

    sorted_by_volume = sorted(stocks, key=lambda s: abs(s.get("change", 0)), reverse=True)
    most_active = sorted_by_volume[:5]

    result = {
        "indices": indices,
        "gainers": gainers,
        "losers": losers,
        "most_active": most_active,
    }

    await cache_set_json(cache_key, result, 30)
    return result


async def get_sector_performance():
    cache_key = "market:sectors"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    all_stocks = await fetch_all_stocks(STOCK_CODES)
    price_map = {s["symbol"]: s for s in all_stocks}

    sector_data = {}
    for sector, symbols in SECTORS.items():
        sector_stocks = [price_map[s] for s in symbols if s in price_map]
        if sector_stocks:
            avg_change = sum(s["percent_change"] for s in sector_stocks) / len(sector_stocks)
            sector_data[sector] = {
                "avg_change": round(avg_change, 2),
                "stocks": sector_stocks,
            }

    await cache_set_json(cache_key, sector_data, 30)
    return sector_data


async def compare_stocks(symbols: list[str]):
    stocks = await fetch_all_stocks(symbols)
    candle_tasks = []
    for symbol in symbols:
        from app.services.stocks import get_candlestick_data_cached
        candle_tasks.append(get_candlestick_data_cached(symbol, "1d", "6mo"))

    candles = await asyncio.gather(*candle_tasks)

    comparison = []
    for stock, candle_data in zip(stocks, candles):
        normalized = []
        if candle_data:
            base = candle_data[0]["Close"]
            for point in candle_data:
                import math
                from datetime import datetime
                t = math.floor(datetime.fromisoformat(point["Datetime"].replace("+05:30", "+0530").split("+")[0]).timestamp())
                normalized.append({
                    "time": t,
                    "value": round((point["Close"] / base - 1) * 100, 2),
                })
        comparison.append({
            "stock": stock,
            "normalized": normalized,
        })

    return comparison
