from __future__ import annotations

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import DocumentType
from app.models import DocumentRequirement


async def get_document_requirement(
    db: AsyncSession,
    *,
    entity_type: str,
    document_type: DocumentType,
    region_id: str | None,
) -> DocumentRequirement | None:
    result = (
        await db.execute(
            select(DocumentRequirement)
            .where(
                DocumentRequirement.entity_type == entity_type,
                DocumentRequirement.document_type == document_type,
                DocumentRequirement.is_active.is_(True),
                or_(DocumentRequirement.region_id == region_id, DocumentRequirement.region_id.is_(None)),
            )
            .order_by(DocumentRequirement.region_id.is_(None))
        )
    ).scalars().first()
    return result
