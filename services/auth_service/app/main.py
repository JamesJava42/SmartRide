from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.api.admin_auth import router as admin_auth_router
from app.api.auth import router as auth_router
from app.core.security import error_response, map_http_exception
from app.services.alert_reporter import report_database_error


app = FastAPI(title="RideConnect Auth Service", version="0.1.0")

app.include_router(auth_router)
app.include_router(admin_auth_router)


@app.exception_handler(HTTPException)
async def handle_http_exception(_request: Request, exc: HTTPException):
    return map_http_exception(exc)


@app.exception_handler(RequestValidationError)
async def handle_request_validation(_request: Request, exc: RequestValidationError):
    return error_response(
        "Validation error",
        "VALIDATION_ERROR",
        details={"errors": exc.errors()},
        status_code=422,
    )


@app.exception_handler(SQLAlchemyError)
async def handle_sqlalchemy_error(_request: Request, exc: SQLAlchemyError):
    await report_database_error(str(exc))
    return error_response("Database error", "DATABASE_ERROR", status_code=500)


@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "auth_service"}
