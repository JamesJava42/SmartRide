from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AdminAuditLog


class AuditService:
    async def log(
        self,
        db: AsyncSession,
        *,
        admin_id: str | None,
        action_type: str,
        entity_type: str,
        entity_id: str | None,
        details_json: dict | None = None,
    ) -> AdminAuditLog:
        log = AdminAuditLog(
            admin_id=admin_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            details_json=details_json,
            created_at=datetime.now(timezone.utc),
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log

    async def list_logs(self, db: AsyncSession) -> list[AdminAuditLog]:
        return list((await db.scalars(select(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()))).all())


audit_service = AuditService()
