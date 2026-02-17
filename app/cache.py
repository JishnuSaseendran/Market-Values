import json
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

_redis = None


async def get_redis():
    global _redis
    if _redis is not None:
        return _redis
    try:
        import redis.asyncio as aioredis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        _redis = aioredis.from_url(redis_url, decode_responses=True)
        await _redis.ping()
        logger.info("Redis connected")
        return _redis
    except Exception as e:
        logger.warning(f"Redis unavailable, using no cache: {e}")
        _redis = None
        return None


async def cache_get(key: str) -> Optional[str]:
    r = await get_redis()
    if r is None:
        return None
    try:
        return await r.get(key)
    except Exception:
        return None


async def cache_set(key: str, value: str, ttl: int = 60):
    r = await get_redis()
    if r is None:
        return
    try:
        await r.set(key, value, ex=ttl)
    except Exception:
        pass


async def cache_get_json(key: str):
    data = await cache_get(key)
    if data:
        return json.loads(data)
    return None


async def cache_set_json(key: str, value, ttl: int = 60):
    await cache_set(key, json.dumps(value, default=str), ttl)
