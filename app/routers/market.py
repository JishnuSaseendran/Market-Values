from fastapi import APIRouter, Query
from app.services.market import get_market_overview, get_sector_performance, compare_stocks

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/overview")
async def market_overview():
    return await get_market_overview()


@router.get("/sectors")
async def sectors():
    return await get_sector_performance()


@router.get("/compare")
async def compare(symbols: str = Query(..., description="Comma-separated symbols")):
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
    if len(symbol_list) < 2:
        return {"error": "Provide at least 2 symbols"}
    return {"data": await compare_stocks(symbol_list)}
