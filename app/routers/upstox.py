from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
import logging

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, UpstoxToken
from app.schemas import UpstoxLinkStatus, OrderRequest, OrderModifyRequest, OrderResponse
from app.config import UPSTOX_API_KEY, UPSTOX_API_SECRET, UPSTOX_REDIRECT_URI
from app.services import upstox as upstox_service

from datetime import datetime, timezone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upstox", tags=["upstox"])

UPSTOX_AUTH_URL = "https://api.upstox.com/v2/login/authorization/dialog"
UPSTOX_TOKEN_URL = "https://api.upstox.com/v2/login/authorization/token"


@router.get("/auth-url")
async def get_auth_url(user: User = Depends(get_current_user)):
    if not UPSTOX_API_KEY:
        raise HTTPException(status_code=500, detail="Upstox API key not configured")
    url = (
        f"{UPSTOX_AUTH_URL}"
        f"?client_id={UPSTOX_API_KEY}"
        f"&redirect_uri={UPSTOX_REDIRECT_URI}"
        f"&response_type=code"
    )
    return {"url": url}


@router.get("/callback")
async def upstox_callback(
    code: str = Query(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not UPSTOX_API_KEY or not UPSTOX_API_SECRET:
        raise HTTPException(status_code=500, detail="Upstox credentials not configured")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            UPSTOX_TOKEN_URL,
            data={
                "code": code,
                "client_id": UPSTOX_API_KEY,
                "client_secret": UPSTOX_API_SECRET,
                "redirect_uri": UPSTOX_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if response.status_code != 200:
        logger.error(f"Upstox token exchange failed: {response.text}")
        raise HTTPException(status_code=400, detail="Failed to exchange code for token")

    token_data = response.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token in response")

    result = await db.execute(
        select(UpstoxToken).where(UpstoxToken.user_id == user.id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.access_token = access_token
        existing.token_date = datetime.now(timezone.utc)
    else:
        db.add(UpstoxToken(
            user_id=user.id,
            access_token=access_token,
            token_date=datetime.now(timezone.utc),
        ))

    await db.commit()
    return {"status": "success", "message": "Upstox account linked successfully"}


@router.get("/status")
async def get_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UpstoxToken).where(UpstoxToken.user_id == user.id)
    )
    token = result.scalar_one_or_none()

    if token:
        return UpstoxLinkStatus(
            linked=True,
            token_date=token.token_date.isoformat() if token.token_date else None,
        )
    return UpstoxLinkStatus(linked=False)


@router.delete("/unlink")
async def unlink(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UpstoxToken).where(UpstoxToken.user_id == user.id)
    )
    token = result.scalar_one_or_none()
    if token:
        await db.delete(token)
        await db.commit()
    return {"status": "success", "message": "Upstox account unlinked"}


async def _get_upstox_token(user: User, db: AsyncSession) -> str:
    result = await db.execute(
        select(UpstoxToken).where(UpstoxToken.user_id == user.id)
    )
    token = result.scalar_one_or_none()
    if not token:
        raise HTTPException(status_code=400, detail="Upstox account not linked")
    return token.access_token


@router.get("/profile")
async def get_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    profile = upstox_service.get_profile(access_token)
    if profile is None:
        raise HTTPException(status_code=502, detail="Failed to fetch profile from Upstox")
    return profile


@router.get("/funds")
async def get_funds(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    funds = upstox_service.get_funds(access_token)
    if funds is None:
        raise HTTPException(status_code=502, detail="Failed to fetch funds from Upstox")
    return funds


@router.get("/holdings")
async def get_holdings(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    holdings = upstox_service.get_holdings(access_token)
    if holdings is None:
        raise HTTPException(status_code=502, detail="Failed to fetch holdings from Upstox")
    return holdings


@router.get("/positions")
async def get_positions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    positions = upstox_service.get_positions(access_token)
    if positions is None:
        raise HTTPException(status_code=502, detail="Failed to fetch positions from Upstox")
    return positions


@router.get("/orders")
async def get_orders(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    orders = upstox_service.get_order_book(access_token)
    if orders is None:
        raise HTTPException(status_code=502, detail="Failed to fetch orders from Upstox")
    return orders


@router.get("/trades")
async def get_trades(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    trades = upstox_service.get_trade_book(access_token)
    if trades is None:
        raise HTTPException(status_code=502, detail="Failed to fetch trades from Upstox")
    return trades


@router.post("/orders", response_model=OrderResponse)
async def place_order(
    order: OrderRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    result = upstox_service.place_order(access_token, order.model_dump())
    return OrderResponse(**result)


@router.put("/orders/{order_id}", response_model=OrderResponse)
async def modify_order(
    order_id: str,
    order: OrderModifyRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    result = upstox_service.modify_order(access_token, order_id, order.model_dump(exclude_none=True))
    return OrderResponse(**result)


@router.delete("/orders/{order_id}", response_model=OrderResponse)
async def cancel_order(
    order_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    result = upstox_service.cancel_order(access_token, order_id)
    return OrderResponse(**result)


@router.get("/quote")
async def get_quote(
    symbols: str = Query(..., description="Comma-separated instrument keys"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    access_token = await _get_upstox_token(user, db)
    quotes = upstox_service.get_market_quote(access_token, symbols)
    if quotes is None:
        raise HTTPException(status_code=502, detail="Failed to fetch quotes from Upstox")
    return quotes
