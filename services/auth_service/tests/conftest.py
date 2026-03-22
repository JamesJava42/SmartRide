from __future__ import annotations

import os
import sys
from collections.abc import AsyncIterator
from pathlib import Path

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ.setdefault("AUTH_DATABASE_URL", os.getenv("AUTH_DATABASE_URL", "postgresql+asyncpg://rideconnect:changeme@localhost:55432/rideconnect"))

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

from app.db.base import Base
from app.db.session import get_db_session
from app.main import app


@pytest_asyncio.fixture(scope="session")
async def engine():
    engine = create_async_engine(os.environ["AUTH_DATABASE_URL"], future=True, poolclass=NullPool)
    async with engine.begin() as conn:
        await conn.exec_driver_sql("CREATE SCHEMA IF NOT EXISTS auth_schema")
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
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
