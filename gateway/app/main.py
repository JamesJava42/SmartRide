from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.logging import setup_logging
from app.core.errors import RateLimitError
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.metrics_middleware import MetricsMiddleware
from app.middleware.request_context import RequestContextMiddleware
from app.middleware.rate_limit import check_rate_limit
from app.routes.auth_proxy import router as auth_proxy_router
from app.routes.health import router as health_router
from app.routes.marketplace_proxy import router as marketplace_proxy_router
from app.routes.metrics import router as metrics_router
from app.routes.notification_proxy import router as notification_proxy_router
from app.routes.operations_proxy import router as operations_proxy_router
from app.routes.readiness import router as readiness_router
from app.routes.test_errors import router as test_errors_router


setup_logging()
app = FastAPI(title="RideConnect Gateway", version="0.1.0")
app.state.startup_complete = False
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(MetricsMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
    ],
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(metrics_router)
app.include_router(readiness_router)
app.include_router(auth_proxy_router)
app.include_router(marketplace_proxy_router)
app.include_router(operations_proxy_router)
app.include_router(notification_proxy_router)
app.include_router(test_errors_router)


@app.on_event("startup")
async def mark_startup_complete() -> None:
    app.state.startup_complete = True


@app.middleware("http")
async def apply_public_rate_limits(request, call_next):
    if request.method == "POST" and request.url.path == "/api/v1/onboarding/driver-register":
        allowed, retry_after = await check_rate_limit(
            request,
            bucket="driver-register",
            limit=settings.driver_register_rate_limit,
            window_seconds=settings.driver_register_rate_window_seconds,
        )
        if not allowed:
            raise RateLimitError(
                message="Too many driver registration attempts. Try again later.",
                details={"retry_after": retry_after},
            )
    return await call_next(request)
