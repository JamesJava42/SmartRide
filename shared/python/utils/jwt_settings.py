from __future__ import annotations

DEFAULT_JWT_SECRET = "change-this-in-production"
DEFAULT_JWT_ISSUER = "rideconnect"
ALLOWED_JWT_ALGORITHMS = {"HS256", "HS384", "HS512"}
MIN_JWT_SECRET_LENGTH = 32
MIN_ACCESS_TOKEN_EXPIRE_MINUTES = 5
MAX_ACCESS_TOKEN_EXPIRE_MINUTES = 60
MIN_REFRESH_TOKEN_EXPIRE_DAYS = 1
MAX_REFRESH_TOKEN_EXPIRE_DAYS = 30
STRICT_ENVIRONMENTS = {"production", "staging"}


def validate_common_jwt_settings(*, app_env: str, jwt_secret_key: str, jwt_algorithm: str, jwt_issuer: str) -> None:
    if jwt_algorithm not in ALLOWED_JWT_ALGORITHMS:
        raise ValueError(f"JWT_ALGORITHM must be one of {sorted(ALLOWED_JWT_ALGORITHMS)}")

    if not jwt_issuer.strip():
        raise ValueError("JWT_ISSUER must not be empty")

    normalized_env = app_env.strip().lower()
    if normalized_env in STRICT_ENVIRONMENTS:
        if jwt_secret_key == DEFAULT_JWT_SECRET:
            raise ValueError("JWT_SECRET_KEY must be overridden in non-development environments")
        if len(jwt_secret_key) < MIN_JWT_SECRET_LENGTH:
            raise ValueError(f"JWT_SECRET_KEY must be at least {MIN_JWT_SECRET_LENGTH} characters in non-development environments")


def validate_auth_jwt_expiry(*, jwt_access_token_expire_minutes: int, jwt_refresh_token_expire_days: int) -> None:
    if not (MIN_ACCESS_TOKEN_EXPIRE_MINUTES <= jwt_access_token_expire_minutes <= MAX_ACCESS_TOKEN_EXPIRE_MINUTES):
        raise ValueError(
            f"JWT_ACCESS_TOKEN_EXPIRE_MINUTES must be between {MIN_ACCESS_TOKEN_EXPIRE_MINUTES} and {MAX_ACCESS_TOKEN_EXPIRE_MINUTES}"
        )
    if not (MIN_REFRESH_TOKEN_EXPIRE_DAYS <= jwt_refresh_token_expire_days <= MAX_REFRESH_TOKEN_EXPIRE_DAYS):
        raise ValueError(
            f"JWT_REFRESH_TOKEN_EXPIRE_DAYS must be between {MIN_REFRESH_TOKEN_EXPIRE_DAYS} and {MAX_REFRESH_TOKEN_EXPIRE_DAYS}"
        )
