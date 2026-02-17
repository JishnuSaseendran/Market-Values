import feedparser
import asyncio
import logging
from app.cache import cache_get_json, cache_set_json

logger = logging.getLogger(__name__)

RSS_FEEDS = [
    {"name": "MoneyControl", "url": "https://www.moneycontrol.com/rss/marketreports.xml"},
    {"name": "Economic Times", "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"},
    {"name": "LiveMint", "url": "https://www.livemint.com/rss/markets"},
]


def _fetch_feeds_sync(limit: int = 20, symbol: str | None = None) -> list[dict]:
    articles = []
    for feed_info in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_info["url"])
            for entry in feed.entries[:10]:
                article = {
                    "title": entry.get("title", ""),
                    "link": entry.get("link", ""),
                    "published": entry.get("published", ""),
                    "source": feed_info["name"],
                    "summary": entry.get("summary", "")[:200],
                }
                if symbol:
                    name = symbol.replace(".NS", "").lower()
                    text = (article["title"] + " " + article["summary"]).lower()
                    if name not in text:
                        continue
                articles.append(article)
        except Exception as e:
            logger.warning(f"Error fetching feed {feed_info['name']}: {e}")

    return articles[:limit]


async def fetch_news(limit: int = 20, symbol: str | None = None) -> list[dict]:
    cache_key = f"news:{symbol or 'all'}:{limit}"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    loop = asyncio.get_running_loop()
    articles = await loop.run_in_executor(None, _fetch_feeds_sync, limit, symbol)

    await cache_set_json(cache_key, articles, 300)
    return articles
