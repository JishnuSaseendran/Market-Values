from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, PortfolioEntry
from app.schemas import PortfolioEntryCreate, PortfolioEntryUpdate, PortfolioEntryResponse
from app.services.portfolio import calculate_pnl
from app.services.stocks import fetch_all_stocks

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("")
async def list_portfolio(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PortfolioEntry).where(PortfolioEntry.user_id == user.id)
    )
    entries = result.scalars().all()

    symbols = list(set(e.symbol for e in entries))
    stocks = await fetch_all_stocks(symbols) if symbols else []
    price_map = {s["symbol"]: s["current_price"] for s in stocks}

    return calculate_pnl(entries, price_map)


@router.post("", response_model=PortfolioEntryResponse)
async def create_entry(
    data: PortfolioEntryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = PortfolioEntry(
        user_id=user.id,
        symbol=data.symbol,
        buy_price=data.buy_price,
        quantity=data.quantity,
        buy_date=data.buy_date,
        notes=data.notes,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=PortfolioEntryResponse)
async def update_entry(
    entry_id: int,
    data: PortfolioEntryUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PortfolioEntry).where(PortfolioEntry.id == entry_id, PortfolioEntry.user_id == user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)

    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}")
async def delete_entry(
    entry_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PortfolioEntry).where(PortfolioEntry.id == entry_id, PortfolioEntry.user_id == user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(entry)
    await db.commit()
    return {"ok": True}
