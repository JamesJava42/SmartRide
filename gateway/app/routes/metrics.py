from __future__ import annotations

from fastapi import APIRouter

from app.core.metrics import gateway_metrics

router = APIRouter(tags=["metrics"])


@router.get("/metrics")
async def metrics() -> dict[str, object]:
    snapshot = gateway_metrics.snapshot()
    return {
        "service": snapshot["service"],
        "total_requests": snapshot["total_requests"],
        "requests_by_method": snapshot["requests_by_method"],
        "requests_by_path": snapshot["requests_by_path"],
        "responses_by_status": snapshot["responses_by_status"],
        "total_4xx": snapshot["total_4xx"],
        "total_5xx": snapshot["total_5xx"],
        "average_latency_ms": snapshot["average_latency_ms"],
    }
