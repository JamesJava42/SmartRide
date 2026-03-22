from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError

from app.api.audit_logs import router as audit_logs_router
from app.api.alerts import internal_router as internal_alerts_router
from app.api.alerts import router as alerts_router
from app.api.dashboard import router as dashboard_router
from app.api.documents import router as documents_router
from app.api.drivers import router as drivers_router
from app.api.onboarding import public_router as public_onboarding_router
from app.api.onboarding import router as onboarding_router
from app.api.regions import router as regions_router
from app.api.rides import router as rides_router
from app.core.security import error_response, map_http_exception


app = FastAPI(title="RideConnect Operations Service", version="0.1.0")
app.include_router(dashboard_router)
app.include_router(rides_router)
app.include_router(drivers_router)
app.include_router(documents_router)
app.include_router(onboarding_router)
app.include_router(public_onboarding_router)
app.include_router(regions_router)
app.include_router(audit_logs_router)
app.include_router(alerts_router)
app.include_router(internal_alerts_router)


@app.exception_handler(HTTPException)
async def handle_http_exception(_request: Request, exc: HTTPException):
    return map_http_exception(exc)


@app.exception_handler(RequestValidationError)
async def handle_request_validation(_request: Request, exc: RequestValidationError):
    return error_response("Validation error", "VALIDATION_ERROR", details={"errors": exc.errors()}, status_code=422)


@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "operations_service"}
