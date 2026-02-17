import yfinance as yf
import asyncio
import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.cache import cache_get_json, cache_set_json
from app.config import CACHE_TTL_LIVE, CACHE_TTL_CANDLES_INTRADAY, CACHE_TTL_CANDLES_DAILY, CACHE_TTL_SEARCH, CACHE_TTL_STOCK_INFO

logger = logging.getLogger(__name__)


async def get_upstox_token_for_user(db: AsyncSession, user_id: int) -> Optional[str]:
    from app.models import UpstoxToken
    result = await db.execute(
        select(UpstoxToken).where(UpstoxToken.user_id == user_id)
    )
    token = result.scalar_one_or_none()
    return token.access_token if token else None


async def fetch_stock(symbol: str):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, get_stock_sync, symbol)


def get_stock_sync(symbol: str):
    for attempt in range(3):
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period="2d")

            if data.empty:
                return None

            latest = data.iloc[-1]
            previous = data.iloc[-2] if len(data) > 1 else latest

            current_price = latest["Close"]
            previous_close = previous["Close"]

            change = current_price - previous_close
            percent_change = (change / previous_close) * 100

            return {
                "symbol": symbol,
                "current_price": round(float(current_price), 2),
                "previous_close": round(float(previous_close), 2),
                "change": round(float(change), 2),
                "percent_change": round(float(percent_change), 2),
            }
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed for {symbol}: {e}")
            if attempt == 2:
                return None
            import time
            time.sleep(0.5 * (2 ** attempt))


async def fetch_all_stocks(symbols: List[str]):
    cache_key = f"stocks:live:{','.join(sorted(symbols))}"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    tasks = [fetch_stock(symbol) for symbol in symbols]
    results = await asyncio.gather(*tasks)
    data = [r for r in results if r]

    await cache_set_json(cache_key, data, CACHE_TTL_LIVE)
    return data


def get_candlestick_data(symbol: str, interval: str = "5m", period: str = "1d"):
    stock = yf.Ticker(symbol)
    data = stock.history(period=period, interval=interval)

    if data.empty:
        return None

    data = data.reset_index()

    dt_col = "Datetime" if "Datetime" in data.columns else "Date"
    data["Datetime"] = data[dt_col].astype(str)

    return data[["Datetime", "Open", "High", "Low", "Close", "Volume"]].to_dict(orient="records")


async def get_candlestick_data_cached(symbol: str, interval: str = "5m", period: str = "1d"):
    cache_key = f"candles:{symbol}:{interval}:{period}"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    loop = asyncio.get_running_loop()
    data = await loop.run_in_executor(None, get_candlestick_data, symbol, interval, period)

    if data:
        ttl = CACHE_TTL_CANDLES_INTRADAY if interval in ("1m", "5m", "15m", "1h") else CACHE_TTL_CANDLES_DAILY
        await cache_set_json(cache_key, data, ttl)

    return data


async def search_stock(query: str):
    cache_key = f"search:{query.lower()}"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    loop = asyncio.get_running_loop()
    results = await loop.run_in_executor(None, _search_sync, query)

    await cache_set_json(cache_key, results, CACHE_TTL_SEARCH)
    return results


def _search_sync(query: str):
    try:
        from app.config import STOCK_CODES
        query_lower = query.lower()
        results = []
        for symbol in STOCK_CODES:
            name = symbol.replace(".NS", "").lower()
            if query_lower in name or query_lower in symbol.lower():
                try:
                    stock = yf.Ticker(symbol)
                    info = stock.info
                    results.append({
                        "symbol": symbol,
                        "name": info.get("longName", symbol.replace(".NS", "")),
                        "sector": info.get("sector", ""),
                    })
                except Exception:
                    results.append({
                        "symbol": symbol,
                        "name": symbol.replace(".NS", ""),
                        "sector": "",
                    })
        return results
    except Exception as e:
        logger.error(f"Search error: {e}")
        return []


async def get_stock_info(symbol: str):
    cache_key = f"info:{symbol}"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    loop = asyncio.get_running_loop()
    info = await loop.run_in_executor(None, _get_info_sync, symbol)

    if info:
        await cache_set_json(cache_key, info, CACHE_TTL_STOCK_INFO)
    return info


def _get_info_sync(symbol: str):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        return {
            "symbol": symbol,
            "name": info.get("longName", ""),
            "sector": info.get("sector", ""),
            "industry": info.get("industry", ""),
            "market_cap": info.get("marketCap", 0),
            "pe_ratio": info.get("trailingPE", None),
            "week_52_high": info.get("fiftyTwoWeekHigh", None),
            "week_52_low": info.get("fiftyTwoWeekLow", None),
            "avg_volume": info.get("averageVolume", 0),
            "dividend_yield": info.get("dividendYield", None),
        }
    except Exception as e:
        logger.error(f"Error fetching info for {symbol}: {e}")
        return None
