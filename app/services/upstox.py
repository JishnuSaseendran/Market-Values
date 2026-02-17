import logging
from typing import Optional

import upstox_client
from upstox_client.rest import ApiException

logger = logging.getLogger(__name__)


def get_upstox_client(access_token: str) -> upstox_client.ApiClient:
    configuration = upstox_client.Configuration()
    configuration.access_token = access_token
    return upstox_client.ApiClient(configuration)


def get_profile(access_token: str) -> Optional[dict]:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.UserApi(client)
        response = api.get_profile("2.0")
        return response.data.to_dict() if response.data else None
    except ApiException as e:
        logger.error(f"Upstox get_profile error: {e}")
        return None


def get_holdings(access_token: str) -> Optional[list]:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.PortfolioApi(client)
        response = api.get_holdings("2.0")
        if response.data:
            return [h.to_dict() for h in response.data]
        return []
    except ApiException as e:
        logger.error(f"Upstox get_holdings error: {e}")
        return None


def get_positions(access_token: str) -> Optional[list]:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.PortfolioApi(client)
        response = api.get_positions("2.0")
        if response.data:
            return [p.to_dict() for p in response.data]
        return []
    except ApiException as e:
        logger.error(f"Upstox get_positions error: {e}")
        return None


def get_funds(access_token: str) -> Optional[dict]:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.UserApi(client)
        response = api.get_user_fund_margin("2.0")
        return response.data.to_dict() if response.data else None
    except ApiException as e:
        logger.error(f"Upstox get_funds error: {e}")
        return None


def get_market_quote(access_token: str, symbols: str) -> Optional[dict]:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.MarketQuoteApi(client)
        response = api.get_full_market_quote(symbols, "2.0")
        if response.data:
            return {k: v.to_dict() for k, v in response.data.items()}
        return {}
    except ApiException as e:
        logger.error(f"Upstox get_market_quote error: {e}")
        return None


def get_historical_candles(
    access_token: str,
    instrument_key: str,
    interval: str,
    from_date: str,
    to_date: str,
) -> Optional[list]:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.HistoryApi(client)
        response = api.get_historical_candle_data1(
            instrument_key, interval, to_date, from_date, "2.0"
        )
        if response.data and response.data.candles:
            return response.data.candles
        return []
    except ApiException as e:
        logger.error(f"Upstox get_historical_candles error: {e}")
        return None


def place_order(access_token: str, order_params: dict) -> dict:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.OrderApi(client)
        body = upstox_client.PlaceOrderRequest(
            quantity=order_params["qty"],
            product=order_params["product"],
            validity=order_params.get("validity", "DAY"),
            price=order_params.get("price", 0),
            tag="MarketValues",
            instrument_token=order_params["symbol"],
            order_type=order_params["order_type"],
            transaction_type=order_params["transaction_type"],
            disclosed_quantity=0,
            trigger_price=order_params.get("trigger_price", 0),
            is_amo=False,
        )
        response = api.place_order(body, "2.0")
        return {
            "order_id": response.data.order_id if response.data else None,
            "status": "success",
            "message": "Order placed successfully",
        }
    except ApiException as e:
        logger.error(f"Upstox place_order error: {e}")
        return {"order_id": None, "status": "error", "message": str(e)}


def modify_order(access_token: str, order_id: str, params: dict) -> dict:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.OrderApi(client)
        body = upstox_client.ModifyOrderRequest(
            quantity=params.get("qty"),
            validity=params.get("validity", "DAY"),
            price=params.get("price", 0),
            order_id=order_id,
            order_type=params.get("order_type", "LIMIT"),
            trigger_price=params.get("trigger_price", 0),
            disclosed_quantity=0,
        )
        response = api.modify_order(body, "2.0")
        return {
            "order_id": order_id,
            "status": "success",
            "message": "Order modified successfully",
        }
    except ApiException as e:
        logger.error(f"Upstox modify_order error: {e}")
        return {"order_id": order_id, "status": "error", "message": str(e)}


def cancel_order(access_token: str, order_id: str) -> dict:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.OrderApi(client)
        response = api.cancel_order(order_id, "2.0")
        return {
            "order_id": order_id,
            "status": "success",
            "message": "Order cancelled successfully",
        }
    except ApiException as e:
        logger.error(f"Upstox cancel_order error: {e}")
        return {"order_id": order_id, "status": "error", "message": str(e)}


def get_order_book(access_token: str) -> Optional[list]:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.OrderApi(client)
        response = api.get_order_book("2.0")
        if response.data:
            return [o.to_dict() for o in response.data]
        return []
    except ApiException as e:
        logger.error(f"Upstox get_order_book error: {e}")
        return None


def get_trade_book(access_token: str) -> Optional[list]:
    try:
        client = get_upstox_client(access_token)
        api = upstox_client.OrderApi(client)
        response = api.get_trade_history("2.0")
        if response.data:
            return [t.to_dict() for t in response.data]
        return []
    except ApiException as e:
        logger.error(f"Upstox get_trade_book error: {e}")
        return None
