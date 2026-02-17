import os
from dotenv import load_dotenv

load_dotenv()

# App settings
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
ALGORITHM = "HS256"

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/market_values.db")

# Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Stock codes - expanded list
STOCK_CODES = [
    "RELIANCE.NS",
    "TCS.NS",
    "INFY.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "HINDUNILVR.NS",
    "ITC.NS",
    "SBIN.NS",
    "BHARTIARTL.NS",
    "KOTAKBANK.NS",
    "LT.NS",
    "HCLTECH.NS",
    "AXISBANK.NS",
    "ASIANPAINT.NS",
    "MARUTI.NS",
    "SUNPHARMA.NS",
    "TITAN.NS",
    "BAJFINANCE.NS",
    "WIPRO.NS",
    "ULTRACEMCO.NS",
    "NESTLEIND.NS",
    "POWERGRID.NS",
    "NTPC.NS",
    "ADANIENT.NS",
    "TATASTEEL.NS",
    "TECHM.NS",
    "ONGC.NS",
    "COALINDIA.NS",
    "JSWSTEEL.NS",
]

# Indices
INDEX_SYMBOLS = [
    "^NSEI",   # NIFTY 50
    "^BSESN",  # SENSEX
]

# Sector mapping
SECTORS = {
    "IT": ["TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "TECHM.NS"],
    "Banking": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS"],
    "Energy": ["RELIANCE.NS", "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "COALINDIA.NS"],
    "FMCG": ["HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS"],
    "Auto": ["MARUTI.NS"],
    "Pharma": ["SUNPHARMA.NS"],
    "Metals": ["TATASTEEL.NS", "JSWSTEEL.NS"],
    "Infrastructure": ["LT.NS", "ULTRACEMCO.NS", "ADANIENT.NS"],
    "Consumer": ["ASIANPAINT.NS", "TITAN.NS", "BAJFINANCE.NS", "BHARTIARTL.NS"],
}

# Valid intervals for candle data
VALID_INTERVALS = ["1m", "5m", "15m", "1h", "1d", "1wk", "1mo"]

# Timeframe presets
TIMEFRAME_PRESETS = {
    "1m": {"interval": "1m", "period": "1d"},
    "5m": {"interval": "5m", "period": "5d"},
    "15m": {"interval": "15m", "period": "5d"},
    "1h": {"interval": "1h", "period": "1mo"},
    "1d": {"interval": "1d", "period": "6mo"},
    "1wk": {"interval": "1wk", "period": "2y"},
    "1mo": {"interval": "1mo", "period": "5y"},
}

# Cache TTLs (seconds)
CACHE_TTL_LIVE = 15
CACHE_TTL_CANDLES_INTRADAY = 60
CACHE_TTL_CANDLES_DAILY = 300
CACHE_TTL_STOCK_INFO = 3600
CACHE_TTL_SEARCH = 600

# Rate limits
RATE_LIMIT_ANONYMOUS = "30/minute"
RATE_LIMIT_AUTHENTICATED = "100/minute"

# Upstox Broker Integration
UPSTOX_API_KEY = os.getenv("UPSTOX_API_KEY", "")
UPSTOX_API_SECRET = os.getenv("UPSTOX_API_SECRET", "")
UPSTOX_REDIRECT_URI = os.getenv("UPSTOX_REDIRECT_URI", "http://localhost:3000/upstox/callback")
