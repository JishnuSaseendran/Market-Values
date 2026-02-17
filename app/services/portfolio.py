from app.models import PortfolioEntry


def calculate_pnl(entries: list[PortfolioEntry], current_prices: dict[str, float]) -> dict:
    items = []
    total_invested = 0.0
    total_current = 0.0

    for entry in entries:
        invested = entry.buy_price * entry.quantity
        current_price = current_prices.get(entry.symbol, entry.buy_price)
        current_value = current_price * entry.quantity
        pnl = current_value - invested
        pnl_percent = (pnl / invested * 100) if invested > 0 else 0

        total_invested += invested
        total_current += current_value

        items.append({
            "id": entry.id,
            "symbol": entry.symbol,
            "buy_price": entry.buy_price,
            "quantity": entry.quantity,
            "buy_date": entry.buy_date,
            "notes": entry.notes,
            "current_price": round(current_price, 2),
            "invested": round(invested, 2),
            "current_value": round(current_value, 2),
            "pnl": round(pnl, 2),
            "pnl_percent": round(pnl_percent, 2),
        })

    total_pnl = total_current - total_invested
    total_pnl_percent = (total_pnl / total_invested * 100) if total_invested > 0 else 0

    return {
        "entries": items,
        "total_invested": round(total_invested, 2),
        "total_current": round(total_current, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_percent": round(total_pnl_percent, 2),
    }
