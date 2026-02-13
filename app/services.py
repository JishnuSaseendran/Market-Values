import yfinance as yf
import asyncio
from typing import List


# -----------------------------
# Async Stock Fetching
# -----------------------------
async def fetch_stock(symbol: str):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, get_stock_sync, symbol)


def get_stock_sync(symbol: str):
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
            "percent_change": round(float(percent_change), 2)
        }

    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None


async def fetch_all_stocks(symbols: List[str]):
    tasks = [fetch_stock(symbol) for symbol in symbols]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r]


# -----------------------------
# Candlestick Data
# -----------------------------
def get_candlestick_data(symbol: str, interval="5m", period="1d"):
    stock = yf.Ticker(symbol)
    data = stock.history(period=period, interval=interval)

    if data.empty:
        return None

    data = data.reset_index()

    # yfinance uses "Datetime" for intraday intervals and "Date" for daily+
    dt_col = "Datetime" if "Datetime" in data.columns else "Date"
    data["Datetime"] = data[dt_col].astype(str)

    return data[["Datetime", "Open", "High", "Low", "Close", "Volume"]].to_dict(orient="records")
