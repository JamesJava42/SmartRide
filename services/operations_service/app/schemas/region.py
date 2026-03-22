from __future__ import annotations

from pydantic import BaseModel


class RegionResponse(BaseModel):
    id: str
    code: str
    name: str
    city: str | None
    state: str | None
    country: str
    is_active: bool


class RegionUpdateRequest(BaseModel):
    name: str
    city: str | None = None
    state: str | None = None
    country: str
