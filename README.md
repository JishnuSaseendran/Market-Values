# Market Values

A full-featured Indian stock market tracker and trading platform built with FastAPI and React. Tracks real-time NSE/BSE prices, provides candlestick charting with technical indicators, portfolio management, AI-powered price predictions, and live trading through Upstox broker integration.

---

## Features

- **Real-time prices** — WebSocket streaming updates every 5 seconds for 29 NSE/BSE stocks and major indices
- **Candlestick charts** — OHLC charts with SMA, RSI, MACD, and Bollinger Band overlays across 1m–1mo intervals
- **Portfolio management** — Track holdings with real-time P&L calculations
- **Watchlists** — Create and manage multiple watchlists per user
- **Price alerts** — Set above/below conditions with browser notifications
- **Market analytics** — Gainers/losers, sector heatmap, multi-stock comparison
- **AI price prediction** — LSTM neural network forecasts for 7/14/30-day horizons with confidence bands
- **Upstox integration** — OAuth 2.0 login, live order placement, holdings, positions, and account funds
- **News feed** — Aggregated financial news via RSS
- **Dark/light theme** — Fully responsive, dark-first design

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.11 |
| Database | SQLite (async via aiosqlite) + SQLAlchemy ORM |
| Cache | Redis (optional, graceful fallback) |
| Auth | JWT (HS256) + bcrypt |
| Stock data | yfinance |
| ML | TensorFlow (LSTM), scikit-learn |
| Broker API | Upstox Python SDK |
| Frontend | React 18, Vite, TailwindCSS |
| State | Zustand |
| Charts | lightweight-charts |
| HTTP | Axios |

---

## Project Structure

```
Market-Values/
├── app/                    # FastAPI backend
│   ├── main.py             # App entry point, routers, WebSocket endpoints
│   ├── config.py           # Settings, symbols, cache TTLs
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── auth.py             # JWT + password hashing
│   ├── cache.py            # Redis helpers
│   ├── database.py         # Async DB engine + session factory
│   ├── dependencies.py     # Auth dependencies (required/optional)
│   ├── services/           # Business logic
│   │   ├── stocks.py       # yfinance fetch, candles, search
│   │   ├── prediction.py   # LSTM model training and inference
│   │   ├── portfolio.py    # P&L calculation
│   │   ├── market.py       # Gainers, losers, sector performance
│   │   ├── upstox.py       # Upstox API client wrapper
│   │   ├── upstox_ws.py    # Upstox WebSocket streaming manager
│   │   ├── indicators.py   # Technical indicator calculations
│   │   ├── alerts.py       # Alert checking logic
│   │   └── news.py         # News RSS aggregation
│   └── routers/            # API route handlers
│       ├── auth.py         # /api/auth
│       ├── stocks.py       # /api/stocks
│       ├── watchlists.py   # /api/watchlists
│       ├── portfolio.py    # /api/portfolio
│       ├── alerts.py       # /api/alerts
│       ├── market.py       # /api/market
│       ├── prediction.py   # /api/predictions
│       ├── upstox.py       # /api/upstox
│       ├── news.py         # /api/news
│       └── preferences.py  # /api/preferences
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx         # Routes and global setup
│   │   ├── lib/api.js      # Axios instance with auth interceptor
│   │   ├── pages/          # Full-page route components
│   │   ├── components/     # Reusable UI components
│   │   └── stores/         # Zustand state stores
│   ├── package.json
│   └── vite.config.js
├── alembic/                # Database migrations
├── models/                 # Persisted LSTM model files (.h5)
├── tests/                  # Backend pytest suite
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── nginx.conf
├── requirements.txt
└── .env.example
```

---

## Ports

| Service | Mode | Port | URL |
|---------|------|------|-----|
| Backend (FastAPI) | Local dev & Docker | `8000` | http://localhost:8000 |
| Frontend (Vite) | Local dev only | `5173` | http://localhost:5173 |
| Frontend (Nginx) | Docker only | `3000` | http://localhost:3000 |
| Redis | Docker | `6379` | internal |

In local dev, the Vite dev server (`5173`) proxies all `/api` and `/ws` traffic to the backend on `8000`, so you never need to configure CORS manually.

In Docker, Nginx on `3000` serves the React build and proxies `/api` and `/ws` to the backend container on `8000` internally.

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Redis (optional but recommended)
- Docker + Docker Compose (for containerised setup)

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
DATABASE_URL=sqlite+aiosqlite:///./data/market_values.db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=change-me-to-a-random-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=false
LOG_LEVEL=info

# Upstox broker credentials (optional)
UPSTOX_API_KEY=
UPSTOX_API_SECRET=
UPSTOX_REDIRECT_URI=http://localhost:3000/upstox/callback
```

### Docker (Recommended)

Starts backend, frontend, and Redis in one command:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Local Development

**Backend:**

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev                     # Starts at http://localhost:5173
```

The Vite dev server proxies `/api` and `/ws` requests to `localhost:8000` automatically.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/stocks` | All live stock prices |
| GET | `/api/stocks/candles/{symbol}` | OHLC candles with indicators |
| GET | `/api/stocks/search?q=` | Search by name/symbol |
| GET | `/api/portfolio` | User portfolio with P&L |
| GET | `/api/watchlists` | User watchlists |
| GET | `/api/market/overview` | Gainers, losers, active |
| GET | `/api/predictions/{symbol}?days=7` | LSTM price forecast |
| GET | `/api/upstox/auth-url` | Upstox OAuth URL |
| WS | `/ws/stocks` | Real-time price stream |
| WS | `/ws/upstox` | Upstox live feed |

Full interactive docs at `/docs` (Swagger UI) and `/redoc`.

---

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | Registered users |
| `watchlists` | Named watchlists per user |
| `watchlist_items` | Stocks within a watchlist |
| `portfolio_entries` | Holdings (symbol, price, qty, date) |
| `alerts` | Price alert rules |
| `user_preferences` | Per-user settings |
| `upstox_tokens` | OAuth tokens for Upstox |
| `stock_cache` | DB-level cache for stock data |

Migrations are managed with Alembic:

```bash
# Generate migration from model changes
alembic revision --autogenerate -m "description"

# Apply
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

---

## Caching Strategy

| Data | TTL | Layer |
|------|-----|-------|
| Live prices | 15s | Redis |
| Intraday candles (≤1h) | 60s | Redis |
| Daily+ candles | 5m | Redis |
| Stock info | 1h | Redis |
| Search results | 10m | Redis |
| Market overview | 30s | Redis |
| Predictions | 6h | Redis |
| LSTM model files | 24h | Filesystem |

Redis is optional. The app falls back to uncached responses if Redis is unavailable.

---

## Deployment

The Docker setup includes:

- **backend** — FastAPI on port 8000, SQLite volume mounted at `/app/data`
- **frontend** — Nginx serving the React build on port 3000, proxies `/api` and `/ws` to backend
- **redis** — Redis 7 Alpine on port 6379

For production, set `SECRET_KEY` to a strong random value and set `DEBUG=false`.

---

## Testing

**Backend:**

```bash
pytest
```

**Frontend:**

```bash
cd frontend
npm test
```

---

## License

MIT
