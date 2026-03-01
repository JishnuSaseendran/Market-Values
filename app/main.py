from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging

from app.database import init_db, async_session
from app.logging_config import setup_logging
from app.middleware import RequestLoggingMiddleware
from app.exceptions import AppException, app_exception_handler
from app.config import STOCK_CODES
from app.services.stocks import fetch_all_stocks
from app.services.alerts import check_alerts

from app.routers import auth, stocks, watchlists, portfolio, alerts, news, market, preferences, upstox, prediction

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Market Values API")
    await init_db()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down Market Values API")


app = FastAPI(title="Indian Market Live API", lifespan=lifespan)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)

# Rate limiting
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded

    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
except ImportError:
    logger.warning("slowapi not available, rate limiting disabled")

# Routers
app.include_router(auth.router)
app.include_router(stocks.router)
app.include_router(watchlists.router)
app.include_router(portfolio.router)
app.include_router(alerts.router)
app.include_router(news.router)
app.include_router(market.router)
app.include_router(preferences.router)
app.include_router(upstox.router)
app.include_router(prediction.router)


@app.get("/")
def root():
    return {"message": "Stock Market API Running"}


# Legacy endpoints for backward compatibility
@app.get("/stocks")
async def get_stocks_legacy():
    data = await fetch_all_stocks(STOCK_CODES)
    return {"data": data}


@app.get("/candles/{symbol}")
async def get_candles_legacy(symbol: str):
    from app.services.stocks import get_candlestick_data_cached
    data = await get_candlestick_data_cached(symbol)
    return {"data": data, "indicators": {}}


@app.websocket("/ws/stocks")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await fetch_all_stocks(STOCK_CODES)
            price_map = {s["symbol"]: s["current_price"] for s in data}

            # Check alerts
            triggered_alerts = []
            try:
                async with async_session() as db:
                    triggered_alerts = await check_alerts(db, price_map)
            except Exception as e:
                logger.debug(f"Alert check skipped: {e}")

            await websocket.send_json({
                "type": "prices",
                "data": data,
            })

            for alert in triggered_alerts:
                await websocket.send_json({
                    "type": "alert",
                    "data": alert,
                })

            await asyncio.sleep(5)
    except WebSocketDisconnect:
        logger.debug("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")


@app.websocket("/ws/upstox")
async def upstox_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = None
    try:
        from app.services.upstox_ws import streamer_manager
        from app.auth import decode_access_token
        from sqlalchemy import select
        from app.models import UpstoxToken

        # Wait for auth message from client
        auth_msg = await asyncio.wait_for(websocket.receive_json(), timeout=10)
        token = auth_msg.get("token")
        if not token:
            await websocket.send_json({"type": "error", "message": "No auth token"})
            await websocket.close()
            return

        payload = decode_access_token(token)
        if not payload:
            await websocket.send_json({"type": "error", "message": "Invalid token"})
            await websocket.close()
            return

        user_id = int(payload.get("sub", 0))

        async with async_session() as db:
            result = await db.execute(
                select(UpstoxToken).where(UpstoxToken.user_id == user_id)
            )
            upstox_token = result.scalar_one_or_none()

        if not upstox_token:
            await websocket.send_json({"type": "error", "message": "Upstox not linked"})
            await websocket.close()
            return

        await streamer_manager.connect_user(user_id, upstox_token.access_token, websocket)
        await websocket.send_json({"type": "connected", "message": "Upstox stream connected"})

        # Handle incoming messages (subscribe/unsubscribe)
        while True:
            msg = await websocket.receive_json()
            if msg.get("type") == "subscribe" and msg.get("instruments"):
                await streamer_manager.subscribe(user_id, msg["instruments"])

    except WebSocketDisconnect:
        logger.debug("Upstox WebSocket client disconnected")
    except asyncio.TimeoutError:
        logger.debug("Upstox WebSocket auth timeout")
    except Exception as e:
        logger.error(f"Upstox WebSocket error: {e}")
    finally:
        if user_id is not None:
            from app.services.upstox_ws import streamer_manager
            await streamer_manager.disconnect_user(user_id, websocket)
