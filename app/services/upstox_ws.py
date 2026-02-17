import asyncio
import logging
from typing import Dict, Set, Optional

import upstox_client
from upstox_client.feeder import MarketDataStreamerV3

logger = logging.getLogger(__name__)


class UpstoxStreamerManager:
    """Manages Upstox WebSocket streamers per user."""

    def __init__(self):
        self._streamers: Dict[int, MarketDataStreamerV3] = {}
        self._clients: Dict[int, Set] = {}  # user_id -> set of websocket connections
        self._tasks: Dict[int, asyncio.Task] = {}

    async def connect_user(self, user_id: int, access_token: str, websocket):
        if user_id not in self._clients:
            self._clients[user_id] = set()
        self._clients[user_id].add(websocket)

        if user_id not in self._streamers:
            await self._start_streamer(user_id, access_token)

    async def disconnect_user(self, user_id: int, websocket):
        if user_id in self._clients:
            self._clients[user_id].discard(websocket)
            if not self._clients[user_id]:
                await self._stop_streamer(user_id)
                del self._clients[user_id]

    async def _start_streamer(self, user_id: int, access_token: str):
        try:
            configuration = upstox_client.Configuration()
            configuration.access_token = access_token

            streamer = MarketDataStreamerV3(
                upstox_client.ApiClient(configuration),
                instrument_keys=[],
                mode="full",
            )

            def on_message(message):
                asyncio.create_task(self._broadcast(user_id, {
                    "type": "market_data",
                    "data": message,
                }))

            def on_error(error):
                logger.error(f"Upstox streamer error for user {user_id}: {error}")

            def on_close():
                logger.info(f"Upstox streamer closed for user {user_id}")
                self._streamers.pop(user_id, None)

            streamer.on("message", on_message)
            streamer.on("error", on_error)
            streamer.on("close", on_close)

            loop = asyncio.get_running_loop()
            self._tasks[user_id] = loop.run_in_executor(None, streamer.connect)
            self._streamers[user_id] = streamer
            logger.info(f"Started Upstox streamer for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to start Upstox streamer for user {user_id}: {e}")

    async def _stop_streamer(self, user_id: int):
        streamer = self._streamers.pop(user_id, None)
        if streamer:
            try:
                streamer.disconnect()
            except Exception as e:
                logger.warning(f"Error stopping streamer for user {user_id}: {e}")
        task = self._tasks.pop(user_id, None)
        if task:
            task.cancel()
        logger.info(f"Stopped Upstox streamer for user {user_id}")

    async def subscribe(self, user_id: int, instrument_keys: list):
        streamer = self._streamers.get(user_id)
        if streamer:
            try:
                streamer.subscribe(instrument_keys, "full")
            except Exception as e:
                logger.error(f"Subscribe error for user {user_id}: {e}")

    async def _broadcast(self, user_id: int, message: dict):
        clients = self._clients.get(user_id, set()).copy()
        for ws in clients:
            try:
                await ws.send_json(message)
            except Exception:
                self._clients.get(user_id, set()).discard(ws)


streamer_manager = UpstoxStreamerManager()
