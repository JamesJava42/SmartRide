from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class NotificationJobListItem(BaseModel):
    id: str
    event_type: str
    recipient_type: str
    channel: str
    status: str
    created_at: datetime


class PaginationResponse(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class NotificationJobListResponse(BaseModel):
    items: list[NotificationJobListItem]
    pagination: PaginationResponse
