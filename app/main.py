from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.services import fetch_all_stocks, get_candlestick_data
from app.config import STOCK_CODES

app = FastAPI(title="Indian Market Live API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Root
# -----------------------------
@app.get("/")
def root():
    return {"message": "Stock Market API Running 🚀"}


# -----------------------------
# REST Endpoint
# -----------------------------
@app.get("/stocks")
async def get_stocks():
    data = await fetch_all_stocks(STOCK_CODES)
    return {"data": data}


# -----------------------------
# WebSocket Live Streaming
# -----------------------------
@app.websocket("/ws/stocks")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await fetch_all_stocks(STOCK_CODES)
            await websocket.send_json(data)
            await asyncio.sleep(5)  # Push every 5 sec
    except WebSocketDisconnect:
        print("Client disconnected")


# -----------------------------
# Candlestick Endpoint
# -----------------------------
@app.get("/candles/{symbol}")
def get_candles(symbol: str):
    data = get_candlestick_data(symbol)
    return {"data": data}
