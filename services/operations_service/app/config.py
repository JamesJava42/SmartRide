from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from shared.python.utils.jwt_settings import (
    DEFAULT_JWT_ISSUER,
    DEFAULT_JWT_SECRET,
    validate_common_jwt_settings,
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = Field(default="development", validation_alias="APP_ENV")
    service_name: str = "operations_service"
    database_url: str = Field(default="postgresql+asyncpg://rideconnect:changeme@postgres:5432/rideconnect", validation_alias="OPERATIONS_DATABASE_URL")
    redis_url: str = Field(default="redis://redis:6379/0", validation_alias="REDIS_URL")
    marketplace_service_url: str = Field(default="http://marketplace_service:8002", validation_alias="MARKETPLACE_SERVICE_URL")
    auth_service_url: str = Field(default="http://auth_service:8001", validation_alias="AUTH_SERVICE_URL")
    notification_service_url: str = Field(default="http://notification_service:8003", validation_alias="NOTIFICATION_SERVICE_URL")
    jwt_secret_key: str = Field(default=DEFAULT_JWT_SECRET, validation_alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    jwt_issuer: str = Field(default=DEFAULT_JWT_ISSUER, validation_alias="JWT_ISSUER")
    internal_service_token: str = Field(default="rideconnect-internal-dev-token", validation_alias="INTERNAL_SERVICE_TOKEN")
    media_root: str = Field(default="/app/media", validation_alias="MEDIA_ROOT")
    document_max_size_bytes: int = Field(default=10 * 1024 * 1024, validation_alias="DOCUMENT_MAX_SIZE_BYTES")

    @model_validator(mode="after")
    def validate_jwt_settings(self) -> "Settings":
        validate_common_jwt_settings(
            app_env=self.app_env,
            jwt_secret_key=self.jwt_secret_key,
            jwt_algorithm=self.jwt_algorithm,
            jwt_issuer=self.jwt_issuer,
        )
        return self


settings = Settings()
