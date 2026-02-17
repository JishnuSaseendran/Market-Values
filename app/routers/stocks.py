from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import STOCK_CODES, VALID_INTERVALS, TIMEFRAME_PRESETS
from app.services.stocks import fetch_all_stocks, get_candlestick_data_cached, search_stock, get_stock_info, get_upstox_token_for_user
from app.services.indicators import calculate_indicators
from app.exceptions import InvalidInterval
from app.dependencies import get_optional_user
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("")
async def get_stocks(
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    upstox_token = None
    if user:
        upstox_token = await get_upstox_token_for_user(db, user.id)

    if upstox_token:
        try:
            from app.services.upstox import get_market_quote
            symbols = ",".join([f"NSE_EQ|{s.replace('.NS', '')}" for s in STOCK_CODES])
            quotes = get_market_quote(upstox_token, symbols)
            if quotes:
                data = []
                for key, quote in quotes.items():
                    ohlc = quote.get("ohlc", {})
                    ltp = quote.get("last_price", ohlc.get("close", 0))
                    prev_close = ohlc.get("close", ltp)
                    change = ltp - prev_close
                    pct = (change / prev_close * 100) if prev_close else 0
                    symbol_name = key.split("|")[-1] + ".NS" if "|" in key else key
                    data.append({
                        "symbol": symbol_name,
                        "current_price": round(float(ltp), 2),
                        "previous_close": round(float(prev_close), 2),
                        "change": round(float(change), 2),
                        "percent_change": round(float(pct), 2),
                    })
                if data:
                    return {"data": data}
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Upstox quote fallback: {e}")

    data = await fetch_all_stocks(STOCK_CODES)
    return {"data": data}


@router.get("/search")
async def search(q: str = Query(..., min_length=1)):
    results = await search_stock(q)
    return {"results": results}


@router.get("/candles/{symbol}")
async def get_candles(
    symbol: str,
    interval: str = Query("5m"),
    period: Optional[str] = None,
    indicators: Optional[str] = Query(None, description="Comma-separated: sma_20,rsi_14,macd,bollinger"),
):
    if interval not in VALID_INTERVALS:
        raise InvalidInterval(interval)

    if period is None:
        preset = TIMEFRAME_PRESETS.get(interval, {"period": "1d"})
        period = preset["period"]

    data = await get_candlestick_data_cached(symbol, interval, period)
    if data is None:
        return {"data": [], "indicators": {}}

    indicator_data = {}
    if indicators:
        indicator_list = [i.strip() for i in indicators.split(",") if i.strip()]
        indicator_data = calculate_indicators(data, indicator_list)

    return {"data": data, "indicators": indicator_data}


@router.get("/{symbol}/info")
async def stock_info(symbol: str):
    info = await get_stock_info(symbol)
    if info is None:
        return {"error": "Stock not found"}
    return info
