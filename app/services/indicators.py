import pandas as pd
import logging

logger = logging.getLogger(__name__)


def calculate_indicators(candle_data: list, indicators: list[str]) -> dict:
    if not candle_data:
        return {}

    df = pd.DataFrame(candle_data)
    df["time"] = pd.to_datetime(df["Datetime"]).astype(int) // 10**9

    result = {}

    try:
        import ta

        close = df["Close"]
        high = df["High"]
        low = df["Low"]

        for ind in indicators:
            ind_lower = ind.lower()

            if ind_lower.startswith("sma_"):
                period = int(ind_lower.split("_")[1])
                sma = ta.trend.sma_indicator(close, window=period)
                result[ind] = _series_to_points(df["time"], sma)

            elif ind_lower.startswith("ema_"):
                period = int(ind_lower.split("_")[1])
                ema = ta.trend.ema_indicator(close, window=period)
                result[ind] = _series_to_points(df["time"], ema)

            elif ind_lower.startswith("rsi"):
                period = int(ind_lower.split("_")[1]) if "_" in ind_lower else 14
                rsi = ta.momentum.rsi(close, window=period)
                result[ind] = _series_to_points(df["time"], rsi)

            elif ind_lower == "macd":
                macd_line = ta.trend.macd(close)
                macd_signal = ta.trend.macd_signal(close)
                macd_hist = ta.trend.macd_diff(close)
                result["macd_line"] = _series_to_points(df["time"], macd_line)
                result["macd_signal"] = _series_to_points(df["time"], macd_signal)
                result["macd_histogram"] = _series_to_points(df["time"], macd_hist)

            elif ind_lower == "bollinger":
                bb_high = ta.volatility.bollinger_hband(close)
                bb_mid = ta.volatility.bollinger_mavg(close)
                bb_low = ta.volatility.bollinger_lband(close)
                result["bollinger_upper"] = _series_to_points(df["time"], bb_high)
                result["bollinger_middle"] = _series_to_points(df["time"], bb_mid)
                result["bollinger_lower"] = _series_to_points(df["time"], bb_low)

    except ImportError:
        logger.warning("ta library not available, skipping indicators")
    except Exception as e:
        logger.error(f"Error calculating indicators: {e}")

    return result


def _series_to_points(time_series, value_series) -> list[dict]:
    points = []
    for t, v in zip(time_series, value_series):
        if pd.notna(v):
            points.append({"time": int(t), "value": round(float(v), 2)})
    return points
