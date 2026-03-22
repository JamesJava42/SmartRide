from __future__ import annotations

import sys
from pathlib import Path

from jose import jwt
from sqlalchemy import text

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

async def test_signup_creates_user_with_hashed_password(client, db_session):
    response = await client.post(
        "/api/v1/auth/signup",
        json={"email": "rider@example.com", "password": "RideConnect123!", "role": "RIDER"},
    )
    assert response.status_code == 200
    row = (
        await db_session.execute(
            text("SELECT password_hash FROM auth_schema.users WHERE email = :email"),
            {"email": "rider@example.com"},
        )
    ).first()
    assert row is not None
    assert row.password_hash != "RideConnect123!"
    assert row.password_hash.startswith("$2")


async def test_login_returns_valid_jwt(client):
    from app.config import settings

    await client.post(
        "/api/v1/auth/signup",
        json={"email": "login@example.com", "password": "RideConnect123!", "role": "RIDER"},
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={"email_or_phone": "login@example.com", "password": "RideConnect123!"},
    )
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    assert payload["role"] == "RIDER"


async def test_invalid_password_returns_401(client):
    await client.post(
        "/api/v1/auth/signup",
        json={"email": "badpass@example.com", "password": "RideConnect123!", "role": "RIDER"},
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={"email_or_phone": "badpass@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "INVALID_CREDENTIALS"


async def test_admin_cannot_signup_via_auth_signup(client):
    response = await client.post(
        "/api/v1/auth/signup",
        json={"email": "admin@example.com", "password": "RideConnect123!", "role": "ADMIN"},
    )
    assert response.status_code == 403
