from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.schemas.pricing import FareEstimateRequest
from app.services.pricing_service import pricing_service
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(tags=["pricing"])


@router.post("/api/v1/rides/estimate", response_model=SuccessResponse)
async def estimate_ride_fare(
    payload: FareEstimateRequest,
    db: AsyncSession = Depends(get_db_session),
):
    return SuccessResponse(data=await pricing_service.estimate_fare(db, payload))
