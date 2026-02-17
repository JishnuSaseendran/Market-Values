from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# Auth
class UserCreate(BaseModel):
    email: str
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Watchlist
class WatchlistCreate(BaseModel):
    name: str


class WatchlistItemCreate(BaseModel):
    symbol: str


class WatchlistItemResponse(BaseModel):
    id: int
    symbol: str
    added_at: datetime

    class Config:
        from_attributes = True


class WatchlistResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    items: list[WatchlistItemResponse] = []

    class Config:
        from_attributes = True


# Portfolio
class PortfolioEntryCreate(BaseModel):
    symbol: str
    buy_price: float
    quantity: int
    buy_date: Optional[str] = None
    notes: Optional[str] = None


class PortfolioEntryUpdate(BaseModel):
    buy_price: Optional[float] = None
    quantity: Optional[int] = None
    buy_date: Optional[str] = None
    notes: Optional[str] = None


class PortfolioEntryResponse(BaseModel):
    id: int
    symbol: str
    buy_price: float
    quantity: int
    buy_date: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True


class PortfolioPnL(BaseModel):
    entries: list[dict]
    total_invested: float
    total_current: float
    total_pnl: float
    total_pnl_percent: float


# Alert
class AlertCreate(BaseModel):
    symbol: str
    condition: str  # "above" or "below"
    target_price: float


class AlertResponse(BaseModel):
    id: int
    symbol: str
    condition: str
    target_price: float
    is_active: bool
    triggered_at: Optional[datetime]

    class Config:
        from_attributes = True


# Preferences
class PreferenceUpdate(BaseModel):
    default_symbol: Optional[str] = None
    default_interval: Optional[str] = None
    theme: Optional[str] = None


class PreferenceResponse(BaseModel):
    default_symbol: str
    default_interval: str
    theme: str

    class Config:
        from_attributes = True


# Upstox
class UpstoxLinkStatus(BaseModel):
    linked: bool
    token_date: Optional[str] = None


class OrderRequest(BaseModel):
    symbol: str
    qty: int
    order_type: str  # MARKET, LIMIT, SL, SL-M
    transaction_type: str  # BUY, SELL
    product: str  # CNC, MIS, D
    price: Optional[float] = None
    trigger_price: Optional[float] = None
    validity: str = "DAY"  # DAY, IOC


class OrderModifyRequest(BaseModel):
    order_id: str
    qty: Optional[int] = None
    price: Optional[float] = None
    order_type: Optional[str] = None
    trigger_price: Optional[float] = None
    validity: Optional[str] = None


class OrderResponse(BaseModel):
    order_id: Optional[str] = None
    status: str
    message: str
