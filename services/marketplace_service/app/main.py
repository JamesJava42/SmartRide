from __future__ import annotations

import asyncio

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.api.dispatch import router as dispatch_router
from app.api.drivers import router as drivers_router
from app.api.pricing import router as pricing_router
from app.api.riders import router as riders_router
from app.api.rides import router as rides_router
from app.api.tracking import router as tracking_router
from app.core.security import error_response, map_http_exception
from app.events.handlers import consume_onboarding_events
from app.services.alert_reporter import report_database_error
from app.workers.offer_expiry import run_offer_expiry_worker

app = FastAPI(title="RideConnect Marketplace Service", version="0.1.0")
app.include_router(riders_router)
app.include_router(drivers_router)
app.include_router(pricing_router)
app.include_router(rides_router)
app.include_router(dispatch_router)
app.include_router(tracking_router)


@app.on_event("startup")
async def startup_tasks() -> None:
    asyncio.create_task(run_offer_expiry_worker())
    asyncio.create_task(consume_onboarding_events())


@app.exception_handler(HTTPException)
async def handle_http_exception(_request: Request, exc: HTTPException):
    return map_http_exception(exc)


@app.exception_handler(RequestValidationError)
async def handle_request_validation(_request: Request, exc: RequestValidationError):
    return error_response("Validation error", "VALIDATION_ERROR", details={"errors": exc.errors()}, status_code=422)


@app.exception_handler(SQLAlchemyError)
async def handle_sqlalchemy_error(_request: Request, exc: SQLAlchemyError):
    await report_database_error(str(exc))
    return error_response("Database error", "DATABASE_ERROR", status_code=500)


@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "marketplace_service"}
