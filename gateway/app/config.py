from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    auth_service_url: str = Field(default="http://auth_service:8001", validation_alias="AUTH_SERVICE_URL")
    marketplace_service_url: str = Field(default="http://marketplace_service:8002", validation_alias="MARKETPLACE_SERVICE_URL")
    operations_service_url: str = Field(default="http://operations_service:8003", validation_alias="OPERATIONS_SERVICE_URL")
    notification_service_url: str = Field(default="http://notification_service:8004", validation_alias="NOTIFICATION_SERVICE_URL")
    redis_url: str = Field(default="redis://redis:6379/0", validation_alias="REDIS_URL")
    driver_register_rate_limit: int = Field(default=5, validation_alias="DRIVER_REGISTER_RATE_LIMIT")
    driver_register_rate_window_seconds: int = Field(default=900, validation_alias="DRIVER_REGISTER_RATE_WINDOW_SECONDS")


settings = Settings()
