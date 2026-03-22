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
    service_name: str = "notification_service"
    database_url: str = Field(default="postgresql+asyncpg://rideconnect:changeme@postgres:5432/rideconnect", validation_alias="NOTIFICATION_DATABASE_URL")
    redis_url: str = Field(default="redis://redis:6379/0", validation_alias="REDIS_URL")
    operations_service_url: str = Field(default="http://operations_service:8004", validation_alias="OPERATIONS_SERVICE_URL")
    jwt_secret_key: str = Field(default=DEFAULT_JWT_SECRET, validation_alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    jwt_issuer: str = Field(default=DEFAULT_JWT_ISSUER, validation_alias="JWT_ISSUER")

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
