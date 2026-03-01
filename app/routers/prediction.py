from fastapi import APIRouter, HTTPException, Query

from app.services.prediction import predict_stock

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


@router.get("/{symbol}")
async def get_prediction(
    symbol: str,
    days: int = Query(14, ge=7, le=30, description="Forecast horizon: 7, 14, or 30"),
):
    if days not in (7, 14, 30):
        raise HTTPException(status_code=400, detail="days must be 7, 14, or 30")

    try:
        result = await predict_stock(symbol.upper(), forecast_days=days)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    if result is None:
        raise HTTPException(status_code=404, detail=f"No data available for {symbol}")

    return result
