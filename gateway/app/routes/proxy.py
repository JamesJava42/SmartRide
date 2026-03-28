from __future__ import annotations

from fastapi import Request, Response
import httpx

from app.core.errors import DependencyUnavailableError


async def forward_request(request: Request, service_base_url: str) -> Response:
    target_url = f"{service_base_url}{request.url.path}"
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {"host", "content-length", "connection"}
    }
    body = await request.body()
    async with httpx.AsyncClient(follow_redirects=True, timeout=90.0) as client:
        try:
            upstream_response = await client.request(
                request.method,
                target_url,
                params=request.query_params,
                headers=headers,
                content=body,
            )
        except httpx.HTTPError as exc:
            raise DependencyUnavailableError(
                message="A required dependency is unavailable",
                details={"service_base_url": service_base_url},
            ) from exc
    response_headers = {
        key: value
        for key, value in upstream_response.headers.items()
        if key.lower() not in {"content-encoding", "transfer-encoding", "connection"}
    }
    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=response_headers,
        media_type=upstream_response.headers.get("content-type"),
    )
