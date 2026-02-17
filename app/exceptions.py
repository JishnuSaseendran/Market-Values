from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


class StockNotFound(AppException):
    def __init__(self, symbol: str):
        super().__init__(404, f"Stock not found: {symbol}")


class InvalidInterval(AppException):
    def __init__(self, interval: str):
        super().__init__(400, f"Invalid interval: {interval}")


async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
