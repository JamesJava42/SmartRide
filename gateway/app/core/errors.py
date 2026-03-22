from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class AppError(Exception):
    message: str
    details: Any = None
    error_code: str = "APP_ERROR"
    status_code: int = 500

    def __str__(self) -> str:
        return self.message


class ValidationError(AppError):
    def __init__(self, message: str = "The request is invalid", details: Any = None) -> None:
        super().__init__(
            message=message,
            details=details,
            error_code="VALIDATION_ERROR",
            status_code=400,
        )


class AuthenticationError(AppError):
    def __init__(self, message: str = "Authentication is required", details: Any = None) -> None:
        super().__init__(
            message=message,
            details=details,
            error_code="AUTHENTICATION_ERROR",
            status_code=401,
        )


class AuthorizationError(AppError):
    def __init__(self, message: str = "You are not authorized to perform this action", details: Any = None) -> None:
        super().__init__(
            message=message,
            details=details,
            error_code="AUTHORIZATION_ERROR",
            status_code=403,
        )


class ResourceNotFoundError(AppError):
    def __init__(self, message: str = "The requested resource was not found", details: Any = None) -> None:
        super().__init__(
            message=message,
            details=details,
            error_code="RESOURCE_NOT_FOUND",
            status_code=404,
        )


class ConflictError(AppError):
    def __init__(self, message: str = "The request conflicts with the current resource state", details: Any = None) -> None:
        super().__init__(
            message=message,
            details=details,
            error_code="CONFLICT_ERROR",
            status_code=409,
        )


class RateLimitError(AppError):
    def __init__(self, message: str = "Too many requests", details: Any = None) -> None:
        super().__init__(
            message=message,
            details=details,
            error_code="RATE_LIMIT_EXCEEDED",
            status_code=429,
        )


class DependencyUnavailableError(AppError):
    def __init__(self, message: str = "A required dependency is unavailable", details: Any = None) -> None:
        super().__init__(
            message=message,
            details=details,
            error_code="DEPENDENCY_UNAVAILABLE",
            status_code=503,
        )


class InternalServerError(AppError):
    def __init__(self, message: str = "An unexpected error occurred", details: Any = None) -> None:
        super().__init__(
            message=message,
            details=details,
            error_code="INTERNAL_ERROR",
            status_code=500,
        )


def build_error_payload(error: AppError, request_id: str | None) -> dict[str, Any]:
    return {
        "error_code": error.error_code,
        "message": error.message,
        "details": error.details,
        "request_id": request_id,
    }
