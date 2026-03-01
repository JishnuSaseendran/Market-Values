# Backend — FastAPI Application

This is the backend for Market Values, built with FastAPI (Python 3.11). It provides a REST API and WebSocket endpoints for real-time stock data, portfolio management, price predictions, and Upstox broker integration.

---

## Directory Structure

```
app/
├── main.py             # FastAPI app, middleware, routers, WebSocket endpoints
├── config.py           # Environment config, stock symbols, sectors, cache TTLs
├── database.py         # Async SQLAlchemy engine and session factory
├── models.py           # ORM models (8 tables)
├── schemas.py          # Pydantic request/response schemas
├── auth.py             # JWT creation/validation, password hashing
├── cache.py            # Redis async helpers with graceful fallback
├── dependencies.py     # FastAPI dependency: get_current_user / get_optional_user
├── middleware.py       # Request logging middleware
├── exceptions.py       # Custom exception handlers
├── logging_config.py   # Logging configuration
├── services/           # Pure business logic, no HTTP concerns
│   ├── stocks.py
│   ├── prediction.py
│   ├── portfolio.py
│   ├── market.py
│   ├── upstox.py
│   ├── upstox_ws.py
│   ├── indicators.py
│   ├── alerts.py
│   └── news.py
└── routers/            # Route handlers, thin wrappers over services
    ├── auth.py
    ├── stocks.py
    ├── watchlists.py
    ├── portfolio.py
    ├── alerts.py
    ├── market.py
    ├── prediction.py
    ├── upstox.py
    ├── news.py
    └── preferences.py
```

---

## Setup

### Requirements

- Python 3.11+
- Redis (optional)

### Install

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
DATABASE_URL=sqlite+aiosqlite:///./data/market_values.db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=true
LOG_LEVEL=info
UPSTOX_API_KEY=
UPSTOX_API_SECRET=
UPSTOX_REDIRECT_URI=http://localhost:3000/upstox/callback
```

### Database Migrations

```bash
# Apply all migrations
alembic upgrade head

# Generate migration after changing models.py
alembic revision --autogenerate -m "add column foo"

# Rollback
alembic downgrade -1
```

### Run

```bash
uvicorn app.main:app --reload --port 8000
```

The backend always runs on port **`8000`**, both locally and in Docker.

| URL | Description |
|-----|-------------|
| http://localhost:8000 | API root |
| http://localhost:8000/docs | Swagger UI (interactive API docs) |
| http://localhost:8000/redoc | ReDoc API docs |
| ws://localhost:8000/ws/stocks | Stock price WebSocket |
| ws://localhost:8000/ws/upstox | Upstox live feed WebSocket |

---

## Architecture

### Request Lifecycle

```
HTTP Request
    │
    ▼
Middleware (logging, rate limiting)
    │
    ▼
Router (thin handler — parse params, call service)
    │
    ▼
Dependency (auth, DB session)
    │
    ▼
Service (business logic, cache check, data fetch)
    │
    ├── Redis cache hit → return cached data
    │
    └── Cache miss → yfinance / DB / Upstox SDK
                          │
                          ▼
                      Write to Redis
                          │
                          ▼
                      Return response
```

### Async Pattern for Sync I/O

`yfinance` is a synchronous library. To avoid blocking the event loop, all yfinance calls are wrapped:

```python
import asyncio

loop = asyncio.get_running_loop()
result = await loop.run_in_executor(None, sync_function, arg1, arg2)
```

This pattern is used throughout `app/services/stocks.py` and `app/services/prediction.py`.

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create a new user account |
| POST | `/api/auth/login` | No | Login, returns access token |
| GET | `/api/auth/me` | Yes | Current user info |

**Register:**
```json
POST /api/auth/register
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Login:**
```json
POST /api/auth/login
{
  "username": "alice",
  "password": "secret123"
}
→ { "access_token": "eyJ...", "token_type": "bearer" }
```

Include the token in subsequent requests:
```
Authorization: Bearer eyJ...
```

---

### Stocks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stocks` | No | All tracked stock prices |
| GET | `/api/stocks/search?q=` | No | Search by symbol or company name |
| GET | `/api/stocks/candles/{symbol}` | No | OHLC candle data |
| GET | `/api/stocks/{symbol}/info` | No | Detailed stock info |

**Candles query parameters:**

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `interval` | `1m, 5m, 15m, 1h, 1d, 1wk, 1mo` | `5m` | Candle interval |
| `period` | `1d, 5d, 1mo, 3mo, 6mo, 1y` | `5d` | Historical range |
| `indicators` | `sma,rsi,macd,bollinger` | none | Comma-separated indicators |

**Example:**
```
GET /api/stocks/candles/RELIANCE.NS?interval=15m&period=1d&indicators=sma,rsi
```

---

### Portfolio

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/portfolio` | Yes | All entries with real-time P&L |
| POST | `/api/portfolio` | Yes | Add a new holding |
| PUT | `/api/portfolio/{id}` | Yes | Update a holding |
| DELETE | `/api/portfolio/{id}` | Yes | Delete a holding |

**Add entry:**
```json
POST /api/portfolio
{
  "symbol": "TCS.NS",
  "buy_price": 3500.0,
  "quantity": 10,
  "buy_date": "2024-01-15",
  "notes": "Long-term hold"
}
```

---

### Watchlists

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/watchlists` | Yes | All user watchlists |
| POST | `/api/watchlists` | Yes | Create watchlist |
| DELETE | `/api/watchlists/{id}` | Yes | Delete watchlist |
| POST | `/api/watchlists/{id}/items` | Yes | Add stock to watchlist |
| DELETE | `/api/watchlists/{id}/items/{item_id}` | Yes | Remove stock |

---

### Alerts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/alerts` | Yes | All user alerts |
| POST | `/api/alerts` | Yes | Create alert |
| DELETE | `/api/alerts/{id}` | Yes | Delete alert |

**Create alert:**
```json
POST /api/alerts
{
  "symbol": "INFY.NS",
  "condition": "above",
  "target_price": 1800.0
}
```

`condition` is either `"above"` or `"below"`.

---

### Market

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/market/overview` | No | Top gainers, losers, most active |
| GET | `/api/market/sectors` | No | Sector-level performance |
| GET | `/api/market/compare?symbols=` | No | Normalised % change comparison |

---

### Predictions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/predictions/{symbol}` | No | LSTM price forecast |

**Query parameters:**

| Parameter | Values | Default |
|-----------|--------|---------|
| `days` | `7`, `14`, `30` | `7` |

**Response:**
```json
{
  "symbol": "RELIANCE.NS",
  "days": 7,
  "predictions": [
    {
      "date": "2026-03-02",
      "price": 1285.40,
      "lower": 1260.10,
      "upper": 1310.70
    }
  ],
  "model_info": {
    "lookback_window": 45,
    "training_samples": 480,
    "epochs": 15
  }
}
```

---

### Upstox

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/upstox/auth-url` | Yes | Get OAuth authorization URL |
| GET | `/api/upstox/callback?code=` | Yes | Handle OAuth callback |
| GET | `/api/upstox/status` | Yes | Check if account is linked |
| DELETE | `/api/upstox/unlink` | Yes | Unlink Upstox account |
| GET | `/api/upstox/profile` | Yes | Upstox user profile |
| GET | `/api/upstox/funds` | Yes | Account funds |
| GET | `/api/upstox/holdings` | Yes | Long-term holdings |
| GET | `/api/upstox/positions` | Yes | Intraday positions |
| GET | `/api/upstox/orders` | Yes | Order book |
| GET | `/api/upstox/trades` | Yes | Trade book |
| POST | `/api/upstox/orders` | Yes | Place order |
| PUT | `/api/upstox/orders/{id}` | Yes | Modify order |
| DELETE | `/api/upstox/orders/{id}` | Yes | Cancel order |
| GET | `/api/upstox/quote?symbols=` | Yes | Real-time market quotes |

---

### WebSocket Endpoints

**`/ws/stocks`** — Real-time market price stream

Broadcasts all tracked stock prices every 5 seconds:
```json
{
  "RELIANCE.NS": { "price": 1285.40, "change": 0.52, "changePercent": 0.04 },
  "TCS.NS": { "price": 3512.00, "change": -15.00, "changePercent": -0.43 }
}
```

**`/ws/upstox`** — Authenticated Upstox live feed

Requires a valid JWT token as a query parameter:
```
ws://localhost:8000/ws/upstox?token=eyJ...
```

---

## Services

### `services/stocks.py`

Core data-fetching service using `yfinance`.

| Function | Description |
|----------|-------------|
| `fetch_stock(symbol)` | Single stock price with 15s Redis cache |
| `fetch_all_stocks(symbols)` | Batch fetch, returns dict of prices |
| `get_candlestick_data(symbol, interval, period)` | Raw OHLC DataFrame |
| `get_candlestick_data_cached(...)` | With Redis TTL caching |
| `search_stock(query)` | Search by symbol prefix or company name |
| `get_stock_info(symbol)` | Sector, PE, market cap, 52-week high/low |

---

### `services/prediction.py`

LSTM-based price forecasting using TensorFlow.

**Model pipeline:**

1. Fetch up to 2 years of daily close prices (fallback to 1y → 6mo → 3mo)
2. Min/max normalise with `sklearn.preprocessing.MinMaxScaler`
3. Build overlapping sequences with adaptive look-back (20–60 days depending on data size)
4. Train a 2-layer LSTM with Dropout (15 epochs, batch 32)
5. Predict iteratively — each step's output feeds back as next input
6. Inverse-transform to real price scale
7. Add confidence bands: std dev of last 30 days × factor growing from 1.0 to 1.5

**Caching:**
- Trained model saved as `models/{SYMBOL}.h5`, reused for 24 hours
- Prediction results cached in Redis with 6-hour TTL per `(symbol, days)` pair

---

### `services/market.py`

| Function | Description |
|----------|-------------|
| `get_market_overview()` | Top 5 gainers, losers, most active (30s cache) |
| `get_sector_performance()` | Average % change per sector (30s cache) |
| `compare_stocks(symbols)` | Normalised 6-month price series for comparison |

---

### `services/portfolio.py`

`calculate_pnl(entries, current_prices)` — Returns per-entry and aggregate P&L:

- `invested` — total buy value
- `current_value` — quantity × current price
- `pnl` — current_value − invested
- `pnl_percent` — percentage return

---

### `services/indicators.py`

Technical indicators computed on OHLC DataFrames using the `ta` library:

| Indicator | Parameters |
|-----------|-----------|
| SMA | 20-period |
| RSI | 14-period |
| MACD | 12/26/9 EMA |
| Bollinger Bands | 20-period, 2σ |

---

## Database Models

Defined in `app/models.py` using SQLAlchemy declarative ORM.

| Model | Table | Key Columns |
|-------|-------|-------------|
| `User` | `users` | `id, username, email, hashed_password, created_at` |
| `Watchlist` | `watchlists` | `id, user_id, name` |
| `WatchlistItem` | `watchlist_items` | `id, watchlist_id, symbol` |
| `PortfolioEntry` | `portfolio_entries` | `id, user_id, symbol, buy_price, quantity, buy_date, notes` |
| `Alert` | `alerts` | `id, user_id, symbol, condition, target_price, triggered_at` |
| `UserPreference` | `user_preferences` | `id, user_id, default_symbol, interval, theme` |
| `UpstoxToken` | `upstox_tokens` | `id, user_id, access_token, refresh_token, expires_at` |
| `StockCache` | `stock_cache` | `symbol, interval, data, updated_at` |

---

## Authentication

JWT-based authentication using `python-jose`.

- **Hashing:** bcrypt via passlib
- **Algorithm:** HS256
- **Expiry:** 24 hours (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)

**Dependencies in routers:**

```python
from app.dependencies import get_current_user, get_optional_user

# Require auth
@router.get("/protected")
async def endpoint(user: User = Depends(get_current_user)):
    ...

# Optional auth (e.g., public endpoint with user-specific extras)
@router.get("/public")
async def endpoint(user: User | None = Depends(get_optional_user)):
    ...
```

---

## Caching

`app/cache.py` wraps `redis.asyncio` with a graceful fallback — if Redis is not available, all cache operations return `None` and the app continues without caching.

```python
from app.cache import cache_get_json, cache_set_json

# Read
data = await cache_get_json("key")

# Write with TTL (seconds)
await cache_set_json("key", data, ttl=60)
```

---

## Tracked Symbols

Defined in `app/config.py`:

**Indices:** `^NSEI` (NIFTY 50), `^BSESN` (SENSEX)

**Stocks (29 symbols):** RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, KOTAKBANK, SBIN, AXISBANK, LT, WIPRO, HCLTECH, BAJFINANCE, MARUTI, TITAN, NESTLEIND, HINDUNILVR, SUNPHARMA, DRREDDY, CIPLA, POWERGRID, NTPC, ONGC, COALINDIA, TATAMOTORS, TATASTEEL, JSWSTEEL, ADANIPORTS, BAJAJFINSV, ASIANPAINT *(all with `.NS` suffix)*

**Sectors:** IT, Banking, Energy, FMCG, Auto, Pharma, Metals, Infrastructure, Consumer

---

## Rate Limiting

Configured via `slowapi`:
- **Anonymous:** 30 requests/minute
- **Authenticated:** 100 requests/minute

---

## Running Tests

```bash
pytest
pytest tests/test_stocks.py         # Specific module
pytest -v --tb=short                # Verbose with short tracebacks
```

Test files are in `tests/` with `conftest.py` for shared fixtures.

---

## Adding a New Router

1. Create `app/routers/my_feature.py`
2. Define a router and endpoint:
   ```python
   from fastapi import APIRouter
   router = APIRouter(prefix="/api/my-feature", tags=["my-feature"])

   @router.get("/")
   async def get_something():
       return {"data": "..."}
   ```
3. Register in `app/main.py`:
   ```python
   from app.routers import my_feature
   app.include_router(my_feature.router)
   ```
