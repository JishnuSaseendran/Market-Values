from fastapi import APIRouter, Query
from typing import Optional
from app.services.news import fetch_news

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("")
async def get_news(
    symbol: Optional[str] = None,
    limit: int = Query(20, ge=1, le=50),
):
    articles = await fetch_news(limit=limit, symbol=symbol)
    return {"articles": articles}
