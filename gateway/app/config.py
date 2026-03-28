from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _ensure_scheme(url: str) -> str:
    if url and not url.startswith("http://") and not url.startswith("https://"):
        return "https://" + url
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    auth_service_url: str = Field(default="http://auth_service:8001", validation_alias="AUTH_SERVICE_URL")
    marketplace_service_url: str = Field(default="http://marketplace_service:8002", validation_alias="MARKETPLACE_SERVICE_URL")
    operations_service_url: str = Field(default="http://operations_service:8003", validation_alias="OPERATIONS_SERVICE_URL")
    notification_service_url: str = Field(default="http://notification_service:8004", validation_alias="NOTIFICATION_SERVICE_URL")
    redis_url: str = Field(default="redis://redis:6379/0", validation_alias="REDIS_URL")
    driver_register_rate_limit: int = Field(default=5, validation_alias="DRIVER_REGISTER_RATE_LIMIT")
    driver_register_rate_window_seconds: int = Field(default=900, validation_alias="DRIVER_REGISTER_RATE_WINDOW_SECONDS")

    @field_validator("auth_service_url", "marketplace_service_url", "operations_service_url", "notification_service_url", mode="before")
    @classmethod
    def ensure_scheme(cls, v: str) -> str:
        return _ensure_scheme(v)


settings = Settings()
