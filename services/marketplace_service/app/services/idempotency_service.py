from __future__ import annotations

import hashlib
import json

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import IdempotencyKey


class IdempotencyService:
    def request_hash(self, payload: object) -> str:
        normalized = json.dumps(payload, sort_keys=True, default=str, separators=(",", ":"))
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    async def begin(
        self,
        db: AsyncSession,
        *,
        actor_user_id: str,
        action_scope: str,
        idempotency_key: str | None,
        payload: object,
    ) -> tuple[IdempotencyKey | None, dict | None]:
        if not idempotency_key:
            return None, None

        request_hash = self.request_hash(payload)
        existing = await db.scalar(
            select(IdempotencyKey).where(
                IdempotencyKey.actor_user_id == actor_user_id,
                IdempotencyKey.action_scope == action_scope,
                IdempotencyKey.idempotency_key == idempotency_key,
            )
        )
        if existing:
            if existing.request_hash != request_hash:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Idempotency key reused with different payload")
            if existing.response_json is not None:
                return existing, existing.response_json
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Request with this idempotency key is already in progress")

        record = IdempotencyKey(
            actor_user_id=actor_user_id,
            action_scope=action_scope,
            idempotency_key=idempotency_key,
            request_hash=request_hash,
            response_json=None,
        )
        db.add(record)
        try:
            await db.flush()
        except IntegrityError as exc:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate request in progress") from exc
        return record, None

    async def complete(self, db: AsyncSession, record: IdempotencyKey | None, response_json: dict) -> None:
        if record is None:
            return
        record.response_json = response_json
        db.add(record)
        await db.commit()


idempotency_service = IdempotencyService()
