import asyncio
import logging
import os
import re
import time
from datetime import datetime, timedelta
from typing import Optional

import numpy as np
import pandas as pd
import yfinance as yf

from app.cache import cache_get_json, cache_set_json

logger = logging.getLogger(__name__)

CACHE_TTL_PREDICTION = 6 * 3600  # 6 hours
MODEL_MAX_AGE_SECONDS = 24 * 3600  # 24 hours
LOOK_BACK = 60
EPOCHS = 15
BATCH_SIZE = 32
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")


def _symbol_to_filename(symbol: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9_-]", "_", symbol)
    return os.path.join(MODELS_DIR, f"{safe}.h5")


MIN_LOOK_BACK = 20


def _train_and_predict(symbol: str, forecast_days: int) -> dict:
    from sklearn.preprocessing import MinMaxScaler

    # Try progressively shorter periods to handle stocks with limited history
    ticker = yf.Ticker(symbol)
    df = pd.DataFrame()
    for period in ("2y", "1y", "6mo", "3mo"):
        df = ticker.history(period=period)
        if not df.empty:
            break

    if df.empty:
        raise ValueError(f"No data found for {symbol}. Check the symbol is valid on Yahoo Finance.")

    # Adapt look_back to however much data is available
    look_back = min(LOOK_BACK, max(MIN_LOOK_BACK, len(df) // 3))

    if len(df) < look_back + 10:
        raise ValueError(
            f"Insufficient data for {symbol}: only {len(df)} trading days available "
            f"(need at least {look_back + 10})."
        )

    close_prices = df["Close"].values.reshape(-1, 1)
    dates = df.index

    # Normalize
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(close_prices)

    # Build sequences
    X, y = [], []
    for i in range(look_back, len(scaled)):
        X.append(scaled[i - look_back:i, 0])
        y.append(scaled[i, 0])
    X, y = np.array(X), np.array(y)
    X = X.reshape(X.shape[0], X.shape[1], 1)

    # Build or load model (cache key includes look_back since it affects input shape)
    model_path = _symbol_to_filename(f"{symbol}_lb{look_back}")
    model = None

    if os.path.exists(model_path):
        age = time.time() - os.path.getmtime(model_path)
        if age < MODEL_MAX_AGE_SECONDS:
            try:
                import tensorflow as tf
                model = tf.keras.models.load_model(model_path)
                logger.info(f"Loaded cached model for {symbol} (look_back={look_back})")
            except Exception as e:
                logger.warning(f"Failed to load cached model for {symbol}: {e}")
                model = None

    if model is None:
        import tensorflow as tf
        model = tf.keras.Sequential([
            tf.keras.layers.LSTM(50, return_sequences=True, input_shape=(look_back, 1)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.LSTM(50, return_sequences=False),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(25),
            tf.keras.layers.Dense(1),
        ])
        model.compile(optimizer="adam", loss="mean_squared_error")
        model.fit(
            X, y,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            validation_split=0.1,
            verbose=0,
        )
        os.makedirs(MODELS_DIR, exist_ok=True)
        model.save(model_path)
        logger.info(f"Trained and saved model for {symbol} (look_back={look_back})")

    # Generate future predictions iteratively
    last_sequence = scaled[-look_back:].copy()
    future_predictions_scaled = []

    for _ in range(forecast_days):
        seq = last_sequence.reshape(1, look_back, 1)
        pred = model.predict(seq, verbose=0)[0, 0]
        future_predictions_scaled.append(pred)
        last_sequence = np.append(last_sequence[1:], [[pred]], axis=0)

    future_predictions = scaler.inverse_transform(
        np.array(future_predictions_scaled).reshape(-1, 1)
    ).flatten().tolist()

    # Build future trading dates (skip weekends)
    last_date = dates[-1].to_pydatetime() if hasattr(dates[-1], "to_pydatetime") else dates[-1]
    future_dates = []
    current_date = last_date
    while len(future_dates) < forecast_days:
        current_date = current_date + timedelta(days=1)
        if current_date.weekday() < 5:  # Mon–Fri
            future_dates.append(current_date)

    # Historical last 90 days
    hist_df = df.tail(90).copy()
    historical = []
    for ts, row in hist_df.iterrows():
        dt = ts.to_pydatetime() if hasattr(ts, "to_pydatetime") else ts
        historical.append({
            "time": int(dt.timestamp()),
            "value": round(float(row["Close"]), 2),
        })

    # Predicted series
    predicted = []
    for dt, val in zip(future_dates, future_predictions):
        predicted.append({
            "time": int(dt.timestamp()),
            "value": round(float(val), 2),
        })

    # Confidence bands: growing uncertainty based on last 30-day std dev
    last_30_std = float(np.std(close_prices[-30:]))
    confidence_band = []
    for i, (dt, val) in enumerate(zip(future_dates, future_predictions)):
        factor = 1.0 + 0.5 * (i / max(forecast_days - 1, 1))  # 1.0 → 1.5
        margin = last_30_std * factor
        confidence_band.append({
            "time": int(dt.timestamp()),
            "upper": round(float(val) + margin, 2),
            "lower": round(float(val) - margin, 2),
        })

    return {
        "symbol": symbol,
        "historical": historical,
        "predicted": predicted,
        "confidence_band": confidence_band,
        "model_info": {
            "look_back": look_back,
            "epochs": EPOCHS,
            "forecast_days": forecast_days,
            "training_samples": len(X),
            "model_cached": os.path.exists(model_path),
        },
    }


async def predict_stock(symbol: str, forecast_days: int = 14) -> Optional[dict]:
    cache_key = f"prediction:{symbol}:{forecast_days}"
    cached = await cache_get_json(cache_key)
    if cached:
        logger.info(f"Returning cached prediction for {symbol}")
        return cached

    loop = asyncio.get_running_loop()
    try:
        result = await loop.run_in_executor(None, _train_and_predict, symbol, forecast_days)
    except Exception as e:
        logger.error(f"Prediction failed for {symbol}: {e}")
        raise

    await cache_set_json(cache_key, result, CACHE_TTL_PREDICTION)
    return result
