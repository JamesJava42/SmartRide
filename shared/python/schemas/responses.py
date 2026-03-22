from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class SuccessResponse(BaseModel):
    success: bool = True
    message: str | None = None
    data: Any = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: str
    details: dict[str, Any] | None = None
