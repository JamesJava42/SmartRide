from __future__ import annotations

from fastapi import APIRouter

from app.core.errors import ResourceNotFoundError, ValidationError

router = APIRouter(prefix="/api/v1/test", tags=["test-errors"])


@router.get("/not-found")
async def test_not_found() -> None:
    raise ResourceNotFoundError(message="The requested test resource does not exist")


@router.get("/validation")
async def test_validation() -> None:
    raise ValidationError(message="The request parameters are invalid", details={"field": "example"})


@router.get("/internal")
async def test_internal() -> None:
    raise Exception("Simulated unexpected failure")
