from __future__ import annotations

import os
import sys
from collections.abc import AsyncIterator
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from jose import jwt
from sqlalchemy import Column, Table, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ.setdefault("MARKETPLACE_DATABASE_URL", os.getenv("MARKETPLACE_DATABASE_URL", "postgresql+asyncpg://rideconnect:changeme@localhost:55432/rideconnect"))

SERVICE_ROOT = Path(__file__).resolve().parents[1]
SERVICES_ROOT = SERVICE_ROOT.parent
for path in list(sys.path):
    try:
        resolved = Path(path).resolve()
    except Exception:
        continue
    if resolved.parent == SERVICES_ROOT and resolved.name.endswith("_service"):
        sys.path.remove(path)
sys.path.insert(0, str(SERVICE_ROOT))
for module_name in list(sys.modules):
    if module_name == "app" or module_name.startswith("app."):
        del sys.modules[module_name]

from app.config import settings
from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
import app.services.dispatch_service as dispatch_service_module
import shared.python.events.streams as streams_module
from app.models import Driver, DriverOffer, FareEstimate, PricingRateCard, Ride, Vehicle
from app.services.dispatch_service import dispatch_service
from app.services.driver_service import driver_service
from app.services.ride_service import ride_service

Table(
    "users",
    Base.metadata,
    Column("id", UUID(as_uuid=False), primary_key=True),
    schema="auth_schema",
    extend_existing=True,
)


def make_token(user_id: str, role: str) -> str:
    return jwt.encode(
        {"sub": user_id, "role": role, "iss": settings.jwt_issuer, "exp": int(datetime.now(timezone.utc).timestamp()) + 3600},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


@pytest_asyncio.fixture(scope="session")
async def engine():
    engine = create_async_engine(os.environ["MARKETPLACE_DATABASE_URL"], future=True, poolclass=NullPool)
    async with engine.begin() as conn:
        await conn.exec_driver_sql("CREATE SCHEMA IF NOT EXISTS auth_schema")
        await conn.exec_driver_sql(
            """
            CREATE TABLE IF NOT EXISTS auth_schema.users (
                id uuid primary key,
                email varchar(255),
                phone_number varchar(32),
                password_hash varchar(255) not null,
                role varchar(32) not null,
                is_active boolean not null default true,
                is_verified boolean not null default false,
                last_login_at timestamptz null,
                created_at timestamptz not null default now(),
                updated_at timestamptz not null default now()
            )
            """
        )
        await conn.exec_driver_sql("CREATE SCHEMA IF NOT EXISTS marketplace_schema")
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.exec_driver_sql("DROP SCHEMA IF EXISTS marketplace_schema CASCADE")
        await conn.exec_driver_sql("DROP SCHEMA IF EXISTS auth_schema CASCADE")
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(engine) -> AsyncIterator[AsyncSession]:
    async with engine.connect() as connection:
        transaction = await connection.begin()
        session_factory = async_sessionmaker(bind=connection, class_=AsyncSession, expire_on_commit=False)
        session = session_factory()
        try:
            yield session
        finally:
            await session.close()
            await transaction.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncIterator[AsyncClient]:
    async def override_get_db_session():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def rider_auth(db_session: AsyncSession):
    user_id = str(uuid4())
    await db_session.execute(
        text(
            """
            INSERT INTO auth_schema.users (id, email, password_hash, role, is_active, is_verified, created_at, updated_at)
            VALUES (:id, :email, 'x', 'RIDER', true, true, now(), now())
            """
        ),
        {"id": user_id, "email": "rider@test.local"},
    )
    await db_session.commit()
    return {"Authorization": f"Bearer {make_token(user_id, 'RIDER')}", "user_id": user_id}


@pytest_asyncio.fixture
async def driver_auth(db_session: AsyncSession):
    user_id = str(uuid4())
    driver_id = str(uuid4())
    await db_session.execute(
        text(
            """
            INSERT INTO auth_schema.users (id, email, password_hash, role, is_active, is_verified, created_at, updated_at)
            VALUES (:id, :email, 'x', 'DRIVER', true, true, now(), now())
            """
        ),
        {"id": user_id, "email": "driver@test.local"},
    )
    await db_session.execute(
        text(
            """
            INSERT INTO marketplace_schema.drivers
            (id, user_id, first_name, last_name, phone_number, status, is_online, is_available, is_approved, total_rides_completed, created_at, updated_at)
            VALUES (:id, :user_id, 'Driver', 'Test', '+15550000000', 'PENDING_APPROVAL', false, false, false, 0, now(), now())
            """
        ),
        {"id": driver_id, "user_id": user_id},
    )
    await db_session.commit()
    return {"Authorization": f"Bearer {make_token(user_id, 'DRIVER')}", "user_id": user_id, "driver_id": driver_id}


@pytest.fixture(autouse=True)
def fake_redis(monkeypatch):
    class FakeRedis:
        def __init__(self):
            self.values: dict[str, str] = {}
            self.events: list[tuple[str, dict]] = []

        async def get(self, key: str):
            return self.values.get(key)

        async def set(self, key: str, value: str, ex: int | None = None):
            self.values[key] = value
            return True

        async def xadd(self, stream_name: str, message: dict):
            self.events.append((stream_name, message))
            return "1-0"

    fake = FakeRedis()

    monkeypatch.setattr(dispatch_service_module, "get_redis_client", lambda: fake)
    monkeypatch.setattr(dispatch_service_module, "publish_event", streams_module.publish_event)
    monkeypatch.setattr(streams_module, "get_redis_client", lambda: fake)
    yield fake


@pytest_asyncio.fixture(scope="session")
async def marketplace_objects():
    return {
        "Driver": Driver,
        "DriverOffer": DriverOffer,
        "FareEstimate": FareEstimate,
        "PricingRateCard": PricingRateCard,
        "Ride": Ride,
        "Vehicle": Vehicle,
        "dispatch_service": dispatch_service,
        "driver_service": driver_service,
        "ride_service": ride_service,
    }
