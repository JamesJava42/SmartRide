from __future__ import annotations

from datetime import datetime, timezone
from math import ceil
from uuid import UUID

import httpx
from fastapi import HTTPException, status
from sqlalchemy import Integer, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.enums import OnboardingStatus
from app.models import Admin, DriverOnboardingProfile, DriverRecord, Region, VehicleRecord
from app.schemas.onboarding import (
    DriverSelfRegisterRequest,
    CreateDriverRequest,
    OnboardingActionResponse,
    OnboardingDetailResponse,
    OnboardingQueueItem,
    OnboardingQueueResponse,
    PaginationResponse,
)
from app.services.audit_service import audit_service
from shared.python.events.streams import ONBOARDING_EVENTS_STREAM, publish_event


class OnboardingService:
    async def _get_active_region(self, db: AsyncSession, region_id: str) -> Region:
        region = await db.scalar(select(Region).where(Region.id == region_id, Region.is_active.is_(True)))
        if not region:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected region is not available for onboarding",
            )
        return region

    async def list_queue(self, db: AsyncSession, *, status_filter: str | None, page: int, page_size: int) -> OnboardingQueueResponse:
        query = select(DriverOnboardingProfile, Region).join(Region, Region.id == DriverOnboardingProfile.region_id)
        if status_filter:
            query = query.where(DriverOnboardingProfile.status == OnboardingStatus(status_filter))
        rows = (await db.execute(query.order_by(DriverOnboardingProfile.submitted_at.desc()))).all()
        total_items = len(rows)
        start = (page - 1) * page_size

        # Bulk-fetch driver names from marketplace_schema
        driver_ids = [str(profile.driver_id) for profile, _ in rows[start: start + page_size]]
        driver_map: dict[str, DriverRecord] = {}
        if driver_ids:
            driver_rows = (await db.execute(
                select(DriverRecord).where(DriverRecord.id.in_(driver_ids))
            )).scalars().all()
            driver_map = {str(d.id): d for d in driver_rows}

        # Bulk-fetch document counts
        from sqlalchemy import func as sqlfunc
        from app.models import DriverDocument
        from app.core.enums import VerificationStatus
        doc_count_rows = (await db.execute(
            select(
                DriverDocument.driver_id,
                sqlfunc.count(DriverDocument.id).label("submitted_count"),
                sqlfunc.sum(
                    sqlfunc.cast(DriverDocument.verification_status == VerificationStatus.APPROVED, Integer)
                ).label("approved_count"),
            ).where(DriverDocument.driver_id.in_(driver_ids)).group_by(DriverDocument.driver_id)
        )).all()
        doc_count_map = {row.driver_id: (row.submitted_count, int(row.approved_count or 0)) for row in doc_count_rows}

        items = []
        for profile, region in rows[start: start + page_size]:
            drv = driver_map.get(str(profile.driver_id))
            if drv:
                name = f"{drv.first_name} {drv.last_name or ''}".strip()
                phone = drv.phone_number
                driver_status = drv.status
                is_approved = drv.is_approved
            else:
                name = f"Driver {str(profile.driver_id)[:8]}"
                phone = ""
                driver_status = "PENDING_APPROVAL"
                is_approved = False
            submitted_count, approved_count = doc_count_map.get(str(profile.driver_id), (0, 0))
            items.append(OnboardingQueueItem(
                driver_id=str(profile.driver_id),
                driver_name=name,
                phone_number=phone,
                region_name=region.name,
                driver_status=driver_status,
                is_approved=is_approved,
                doc_submitted_count=submitted_count,
                doc_approved_count=approved_count,
                status=profile.status,
                submitted_at=profile.submitted_at,
            ))

        return OnboardingQueueResponse(
            items=items,
            pagination=PaginationResponse(
                page=page,
                page_size=page_size,
                total_items=total_items,
                total_pages=ceil(total_items / page_size) if page_size else 1,
            ),
        )

    async def approve(self, db: AsyncSession, *, driver_id: str, admin: Admin, review_notes: str | None) -> OnboardingActionResponse:
        driver_uuid = UUID(driver_id)
        profile = await db.scalar(select(DriverOnboardingProfile).where(DriverOnboardingProfile.driver_id == driver_uuid))
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Onboarding profile not found")
        profile.status = OnboardingStatus.APPROVED
        profile.review_notes = review_notes
        profile.reviewed_by_admin_id = admin.id
        profile.reviewed_at = datetime.now(timezone.utc)
        db.add(profile)

        # Activate the driver in marketplace_schema
        driver_row = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
        if driver_row:
            driver_row.status = "ACTIVE"
            driver_row.is_approved = True
            db.add(driver_row)

        await db.commit()
        await db.refresh(profile)

        await audit_service.log(
            db,
            admin_id=admin.id,
            action_type="APPROVED_DRIVER",
            entity_type="DRIVER_ONBOARDING_PROFILE",
            entity_id=profile.id,
            details_json={"driver_id": driver_id, "region_id": profile.region_id},
        )
        await publish_event(
            ONBOARDING_EVENTS_STREAM,
            "onboarding_approved",
            {"driver_id": driver_id, "region_id": profile.region_id, "admin_id": admin.id},
        )
        return OnboardingActionResponse(driver_id=driver_id, status=profile.status, reviewed_at=profile.reviewed_at)

    async def reject(self, db: AsyncSession, *, driver_id: str, admin: Admin, rejection_reason: str) -> OnboardingActionResponse:
        driver_uuid = UUID(driver_id)
        profile = await db.scalar(select(DriverOnboardingProfile).where(DriverOnboardingProfile.driver_id == driver_uuid))
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Onboarding profile not found")
        profile.status = OnboardingStatus.REJECTED
        profile.rejection_reason = rejection_reason
        profile.reviewed_by_admin_id = admin.id
        profile.reviewed_at = datetime.now(timezone.utc)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

        await audit_service.log(
            db,
            admin_id=admin.id,
            action_type="REJECTED_DRIVER",
            entity_type="DRIVER_ONBOARDING_PROFILE",
            entity_id=profile.id,
            details_json={"driver_id": driver_id, "region_id": profile.region_id},
        )
        await publish_event(
            ONBOARDING_EVENTS_STREAM,
            "onboarding_rejected",
            {"driver_id": driver_id, "region_id": profile.region_id, "admin_id": admin.id},
        )
        return OnboardingActionResponse(driver_id=driver_id, status=profile.status, reviewed_at=profile.reviewed_at)

    async def get_detail(self, db: AsyncSession, *, driver_id: str) -> OnboardingDetailResponse:
        driver_uuid = UUID(driver_id)
        profile = await db.scalar(
            select(DriverOnboardingProfile).where(DriverOnboardingProfile.driver_id == driver_uuid)
        )
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Onboarding profile not found")
        region = await db.scalar(select(Region).where(Region.id == profile.region_id))
        driver_row = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
        if driver_row:
            driver_name = f"{driver_row.first_name} {driver_row.last_name or ''}".strip()
        else:
            driver_name = f"Driver {driver_id[:8]}"
        return OnboardingDetailResponse(
            driver_id=driver_id,
            driver_name=driver_name,
            driver_email="",
            region_name=region.name if region else "Unknown",
            status=profile.status,
            review_notes=profile.review_notes,
            rejection_reason=profile.rejection_reason,
            submitted_at=profile.submitted_at,
            reviewed_at=profile.reviewed_at,
        )

    async def request_info(self, db: AsyncSession, *, driver_id: str, admin: Admin, notes: str) -> OnboardingActionResponse:
        driver_uuid = UUID(driver_id)
        profile = await db.scalar(select(DriverOnboardingProfile).where(DriverOnboardingProfile.driver_id == driver_uuid))
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Onboarding profile not found")
        profile.status = OnboardingStatus.DOCS_PENDING
        profile.review_notes = notes
        profile.reviewed_by_admin_id = admin.id
        profile.reviewed_at = datetime.now(timezone.utc)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        await audit_service.log(
            db,
            admin_id=admin.id,
            action_type="REQUESTED_INFO",
            entity_type="DRIVER_ONBOARDING_PROFILE",
            entity_id=profile.id,
            details_json={"driver_id": driver_id, "notes": notes},
        )
        return OnboardingActionResponse(driver_id=driver_id, status=profile.status, reviewed_at=profile.reviewed_at)

    async def create_driver(self, db: AsyncSession, *, payload: CreateDriverRequest) -> OnboardingDetailResponse:
        # Validate region
        region = await db.scalar(select(Region).where(Region.id == payload.region_id))
        if not region:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")

        # Check license plate uniqueness in marketplace_schema
        existing_plate = await db.scalar(
            select(VehicleRecord).where(VehicleRecord.plate_number == payload.vehicle_license_plate)
        )
        if existing_plate:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License plate already in use")

        # Create user via auth_service
        name_parts = payload.name.strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else None

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.auth_service_url}/api/v1/auth/signup",
                json={"email": payload.email, "phone_number": payload.phone, "password": payload.password, "role": "DRIVER"},
                timeout=10.0,
            )

        if resp.status_code in (400, 409):
            body = resp.json()
            detail = body.get("message") or body.get("detail") or "Email or phone already in use"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to create user account (auth_service returned {resp.status_code})",
            )

        user_id: str = resp.json()["data"]["user_id"]

        try:
            # Create driver row in marketplace_schema
            driver = DriverRecord(
                user_id=user_id,
                first_name=first_name,
                last_name=last_name,
                phone_number=payload.phone,
                region_id=payload.region_id,
                status="PENDING_APPROVAL",
            )
            db.add(driver)
            await db.flush()

            # Create vehicle row in marketplace_schema
            vehicle = VehicleRecord(
                driver_id=str(driver.id),
                make=payload.vehicle_make,
                model=payload.vehicle_model,
                year=payload.vehicle_year,
                color=payload.vehicle_color or None,
                plate_number=payload.vehicle_license_plate,
                vehicle_type=payload.vehicle_class,
                seat_capacity=4,
            )
            db.add(vehicle)
            await db.flush()

            # Create onboarding profile in operations_schema
            profile = DriverOnboardingProfile(
                driver_id=str(driver.id),
                region_id=payload.region_id,
                status=OnboardingStatus.SUBMITTED,
                submitted_at=datetime.now(timezone.utc),
            )
            db.add(profile)
            await db.commit()
        except Exception:
            await db.rollback()
            # Clean up the auth user so the same email can be retried
            async with httpx.AsyncClient() as client:
                await client.delete(
                    f"{settings.auth_service_url}/api/v1/auth/users/{user_id}",
                    headers={"X-Internal-Service-Token": settings.internal_service_token},
                    timeout=5.0,
                )
            raise

        return OnboardingDetailResponse(
            driver_id=str(driver.id),
            driver_name=payload.name,
            driver_email=payload.email,
            region_name=region.name,
            status=OnboardingStatus.SUBMITTED,
            submitted_at=profile.submitted_at,
        )

    async def self_register_driver(self, db: AsyncSession, *, payload: DriverSelfRegisterRequest) -> OnboardingDetailResponse:
        region = await self._get_active_region(db, payload.region_id)

        name_parts = payload.name.strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else None

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.auth_service_url}/api/v1/auth/signup",
                json={
                    "email": payload.email,
                    "phone_number": payload.phone,
                    "password": payload.password,
                    "role": "DRIVER",
                },
                timeout=10.0,
            )

        if resp.status_code in (400, 409):
            body = resp.json()
            detail = body.get("message") or body.get("detail") or "Email or phone already in use"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to create user account (auth_service returned {resp.status_code})",
            )

        user_id: str = resp.json()["data"]["user_id"]

        try:
            driver = DriverRecord(
                user_id=user_id,
                first_name=first_name,
                last_name=last_name,
                phone_number=payload.phone,
                region_id=region.id,
                status="PENDING_APPROVAL",
            )
            db.add(driver)
            await db.flush()

            profile = DriverOnboardingProfile(
                driver_id=str(driver.id),
                region_id=region.id,
                status=OnboardingStatus.SUBMITTED,
                submitted_at=datetime.now(timezone.utc),
                review_notes=f"Self-registered from driver_web for region {region.name}. Pending admin review.",
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
        except Exception:
            await db.rollback()
            async with httpx.AsyncClient() as client:
                await client.delete(
                    f"{settings.auth_service_url}/api/v1/auth/users/{user_id}",
                    headers={"X-Internal-Service-Token": settings.internal_service_token},
                    timeout=5.0,
                )
            raise

        return OnboardingDetailResponse(
            driver_id=str(driver.id),
            driver_name=payload.name,
            driver_email=payload.email,
            region_name=region.name,
            status=OnboardingStatus.SUBMITTED,
            review_notes=profile.review_notes,
            submitted_at=profile.submitted_at,
        )


onboarding_service = OnboardingService()
