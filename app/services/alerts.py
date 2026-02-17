from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Alert
import logging

logger = logging.getLogger(__name__)


async def check_alerts(db: AsyncSession, current_prices: dict[str, float]) -> list[dict]:
    result = await db.execute(select(Alert).where(Alert.is_active == True))
    alerts = result.scalars().all()

    triggered = []
    for alert in alerts:
        price = current_prices.get(alert.symbol)
        if price is None:
            continue

        should_trigger = False
        if alert.condition == "above" and price >= alert.target_price:
            should_trigger = True
        elif alert.condition == "below" and price <= alert.target_price:
            should_trigger = True

        if should_trigger:
            alert.is_active = False
            alert.triggered_at = datetime.now(timezone.utc)
            triggered.append({
                "id": alert.id,
                "user_id": alert.user_id,
                "symbol": alert.symbol,
                "condition": alert.condition,
                "target_price": alert.target_price,
                "current_price": price,
            })

    if triggered:
        await db.commit()

    return triggered
