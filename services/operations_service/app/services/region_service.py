from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Region
from app.schemas.region import RegionResponse, RegionUpdateRequest


class RegionService:
    async def get_or_create_default_region(self, db: AsyncSession) -> Region:
        region = await db.scalar(select(Region).where(Region.code == "long_beach_ca"))
        if region:
            return region
        region = Region(
            code="long_beach_ca",
            name="Long Beach",
            city="Long Beach",
            state="CA",
            country="USA",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(region)
        await db.commit()
        await db.refresh(region)
        return region

    async def list_active_regions_count(self, db: AsyncSession) -> int:
        return len(list((await db.scalars(select(Region).where(Region.is_active.is_(True)))).all()))

    async def list_regions(self, db: AsyncSession) -> list[RegionResponse]:
        rows = (await db.scalars(select(Region).order_by(Region.name.asc()))).all()
        return [
            RegionResponse(
                id=str(r.id),
                code=r.code,
                name=r.name,
                city=r.city,
                state=r.state,
                country=r.country,
                is_active=r.is_active,
            )
            for r in rows
        ]

    async def update_region(self, db: AsyncSession, *, region_id: str, payload: RegionUpdateRequest) -> RegionResponse:
        region = await db.scalar(select(Region).where(Region.id == region_id))
        if not region:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
        region.name = payload.name
        region.city = payload.city
        region.state = payload.state
        region.country = payload.country
        region.updated_at = datetime.now(timezone.utc)
        db.add(region)
        await db.commit()
        await db.refresh(region)
        return RegionResponse(
            id=str(region.id),
            code=region.code,
            name=region.name,
            city=region.city,
            state=region.state,
            country=region.country,
            is_active=region.is_active,
        )

    async def toggle_active(self, db: AsyncSession, *, region_id: str) -> RegionResponse:
        region = await db.scalar(select(Region).where(Region.id == region_id))
        if not region:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
        region.is_active = not region.is_active
        region.updated_at = datetime.now(timezone.utc)
        db.add(region)
        await db.commit()
        await db.refresh(region)
        return RegionResponse(
            id=str(region.id),
            code=region.code,
            name=region.name,
            city=region.city,
            state=region.state,
            country=region.country,
            is_active=region.is_active,
        )


region_service = RegionService()
