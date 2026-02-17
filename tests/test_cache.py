import pytest
from app.cache import cache_get, cache_set, cache_get_json, cache_set_json


@pytest.mark.asyncio
async def test_cache_fallback_without_redis():
    # Without Redis, cache operations should gracefully return None
    result = await cache_get("nonexistent_key")
    assert result is None


@pytest.mark.asyncio
async def test_cache_json_fallback():
    result = await cache_get_json("nonexistent_key")
    assert result is None


@pytest.mark.asyncio
async def test_cache_set_fallback():
    # Should not raise even without Redis
    await cache_set("test_key", "test_value", ttl=60)
    await cache_set_json("test_key", {"foo": "bar"}, ttl=60)
