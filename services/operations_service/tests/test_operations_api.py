from __future__ import annotations

import sys
from pathlib import Path
from uuid import uuid4

from sqlalchemy import select, text

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


async def test_self_register_driver_creates_driver_and_onboarding_profile(client, db_session, admin_auth, monkeypatch):
    import httpx

    auth_user_id = str(uuid4())

    class FakeAuthResponse:
        status_code = 200

        def json(self):
            return {"data": {"user_id": auth_user_id}}

    class FakeAsyncClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def post(self, *args, **kwargs):
            return FakeAuthResponse()

    monkeypatch.setattr(httpx, "AsyncClient", FakeAsyncClient)
    response = await client.post(
        "/api/v1/onboarding/driver-register",
        json={
            "name": "Prem Kumar",
            "email": "prem@example.com",
            "phone": "1234569877",
            "password": "ChangeMe123!",
            "region_id": admin_auth["region_id"],
        },
    )
    assert response.status_code == 201
    payload = response.json()["data"]
    driver_row = (
        await db_session.execute(
            text(
                "SELECT user_id, first_name, last_name, status "
                "FROM marketplace_schema.drivers WHERE id = :driver_id"
            ),
            {"driver_id": payload["driver_id"]},
        )
    ).mappings().one()
    onboarding_row = (
        await db_session.execute(
            text(
                "SELECT status, region_id FROM operations_schema.driver_onboarding_profiles "
                "WHERE driver_id = :driver_id"
            ),
            {"driver_id": payload["driver_id"]},
        )
    ).mappings().one()
    assert str(driver_row["user_id"]) == auth_user_id
    assert driver_row["first_name"] == "Prem"
    assert driver_row["last_name"] == "Kumar"
    assert driver_row["status"] == "PENDING_APPROVAL"
    assert onboarding_row["status"] == "SUBMITTED"
    assert str(onboarding_row["region_id"]) == admin_auth["region_id"]


async def test_driver_document_upload_enforces_requirements_and_persists_metadata(client, db_session, driver_auth, monkeypatch):
    from app.services.document_storage import LocalDocumentStorage, StoredDocumentFile

    saved_files: list[tuple[str, str, str]] = []

    async def fake_save_upload(*, entity_type: str, owner_id: str, document_type: str, file):
        saved_files.append((entity_type, owner_id, document_type))
        return StoredDocumentFile(
            file_path=f"{entity_type}/{owner_id}/{document_type.lower()}.pdf",
            original_file_name="license.pdf",
            mime_type="application/pdf",
            file_size=1024,
        )

    monkeypatch.setattr(LocalDocumentStorage, "save_upload", fake_save_upload)
    await db_session.execute(
        text(
            """
            INSERT INTO operations_schema.document_requirements
            (id, entity_type, document_type, region_id, is_required, requires_expiry, requires_document_number,
             requires_issuing_state, requires_issuing_country, is_active, created_at, updated_at)
            VALUES (:id, 'DRIVER', 'VEHICLE_REGISTRATION', :region_id, true, true, true, true, true, true, now(), now())
            """
        ),
        {"id": str(uuid4()), "region_id": driver_auth["region_id"]},
    )
    await db_session.commit()

    missing_field_response = await client.post(
        "/api/v1/onboarding/me/documents",
        headers={"Authorization": driver_auth["Authorization"]},
        files={"file": ("registration.pdf", b"fake-pdf", "application/pdf")},
        data={
            "document_type": "VEHICLE_REGISTRATION",
            "document_number": "REG-123",
            "issuing_country": "USA",
            "expires_at": "2027-03-21",
        },
    )
    assert missing_field_response.status_code == 422
    missing_payload = missing_field_response.json()
    assert "Issuing state is required" in str(missing_payload)

    response = await client.post(
        "/api/v1/onboarding/me/documents",
        headers={"Authorization": driver_auth["Authorization"]},
        files={"file": ("registration.pdf", b"fake-pdf", "application/pdf")},
        data={
            "document_type": "VEHICLE_REGISTRATION",
            "document_number": "REG-123",
            "issuing_state": "CA",
            "issuing_country": "USA",
            "expires_at": "2027-03-21",
        },
    )
    assert response.status_code == 201
    document_id = response.json()["data"]["id"]
    document_row = (
        await db_session.execute(
            text(
                "SELECT document_type, file_path, original_file_name, mime_type, file_size, document_number, "
                "issuing_state, issuing_country, verification_status "
                "FROM operations_schema.driver_documents WHERE id = :document_id"
            ),
            {"document_id": document_id},
        )
    ).mappings().one()
    assert document_row["document_type"] == "VEHICLE_REGISTRATION"
    assert document_row["file_path"].startswith(f"driver_documents/{driver_auth['driver_id']}/vehicle_registration-")
    assert document_row["file_path"].endswith(".pdf")
    assert document_row["original_file_name"] == "registration.pdf"
    assert document_row["mime_type"] == "application/pdf"
    assert document_row["file_size"] == len(b"fake-pdf")
    assert document_row["document_number"] == "REG-123"
    assert document_row["issuing_state"] == "CA"
    assert document_row["issuing_country"] == "USA"
    assert document_row["verification_status"] == "SUBMITTED"


async def test_document_approval_updates_status_and_writes_audit_log(client, db_session, admin_auth):
    document_id = str(uuid4())
    driver_id = str(uuid4())
    await db_session.execute(
        text(
            """
            INSERT INTO operations_schema.driver_documents
            (id, driver_id, document_type, file_path, original_file_name, mime_type, file_size,
             verification_status, submitted_at, created_at, updated_at)
            VALUES (:id, :driver_id, 'INSURANCE', 'driver_documents/test/insurance.pdf', 'insurance.pdf',
                    'application/pdf', 1000, 'SUBMITTED', now(), now(), now())
            """
        ),
        {"id": document_id, "driver_id": driver_id},
    )
    await db_session.commit()
    response = await client.post(
        f"/api/v1/admin/documents/{document_id}/approve",
        headers={"Authorization": admin_auth["Authorization"]},
    )
    assert response.status_code == 200
    doc_status = (
        await db_session.execute(
            text(
                "SELECT verification_status, reviewed_by_admin_id, notes "
                "FROM operations_schema.driver_documents WHERE id = :id"
            ),
            {"id": document_id},
        )
    ).mappings().one()
    audit = (
        await db_session.execute(
            text(
                "SELECT 1 FROM operations_schema.admin_audit_logs "
                "WHERE action_type = 'APPROVED_DOCUMENT' AND entity_id = :entity_id LIMIT 1"
            ),
            {"entity_id": document_id},
        )
    ).scalar_one_or_none()
    assert doc_status["verification_status"] == "APPROVED"
    assert str(doc_status["reviewed_by_admin_id"]) == admin_auth["admin_id"]
    assert doc_status["notes"] == "Approved"
    assert audit == 1

async def test_approve_onboarding_updates_status_and_writes_audit_log(client, db_session, admin_auth, monkeypatch):
    from shared.python.events import streams

    class FakeRedis:
        async def xadd(self, *args, **kwargs):
            return "1-0"

    monkeypatch.setattr(streams, "get_redis_client", lambda: FakeRedis())
    driver_id = "00000000-0000-0000-0000-000000000111"
    await db_session.execute(
        text(
            """
            INSERT INTO operations_schema.driver_onboarding_profiles
            (id, driver_id, region_id, status, submitted_at, created_at, updated_at)
            VALUES ('00000000-0000-0000-0000-000000000211', :driver_id, :region_id, 'SUBMITTED', now(), now(), now())
            """
        ),
        {"driver_id": driver_id, "region_id": admin_auth["region_id"]},
    )
    await db_session.commit()
    response = await client.post(
        f"/api/v1/admin/onboarding/{driver_id}/approve",
        headers={"Authorization": admin_auth["Authorization"]},
        json={"review_notes": "ok"},
    )
    assert response.status_code == 200
    profile = (
        await db_session.execute(
            text("SELECT status FROM operations_schema.driver_onboarding_profiles WHERE driver_id = :driver_id"),
            {"driver_id": driver_id},
        )
    ).scalar_one()
    audit = (
        await db_session.execute(
            text("SELECT 1 FROM operations_schema.admin_audit_logs WHERE action_type = 'APPROVED_DRIVER' LIMIT 1")
        )
    ).scalar_one_or_none()
    assert profile == "APPROVED"
    assert audit == 1


async def test_reject_onboarding_updates_status_and_writes_audit_log(client, db_session, admin_auth, monkeypatch):
    from shared.python.events import streams

    class FakeRedis:
        async def xadd(self, *args, **kwargs):
            return "1-0"

    monkeypatch.setattr(streams, "get_redis_client", lambda: FakeRedis())
    driver_id = "00000000-0000-0000-0000-000000000112"
    await db_session.execute(
        text(
            """
            INSERT INTO operations_schema.driver_onboarding_profiles
            (id, driver_id, region_id, status, submitted_at, created_at, updated_at)
            VALUES ('00000000-0000-0000-0000-000000000212', :driver_id, :region_id, 'SUBMITTED', now(), now(), now())
            """
        ),
        {"driver_id": driver_id, "region_id": admin_auth["region_id"]},
    )
    await db_session.commit()
    response = await client.post(
        f"/api/v1/admin/onboarding/{driver_id}/reject",
        headers={"Authorization": admin_auth["Authorization"]},
        json={"rejection_reason": "missing docs"},
    )
    assert response.status_code == 200
    profile = (
        await db_session.execute(
            text("SELECT status FROM operations_schema.driver_onboarding_profiles WHERE driver_id = :driver_id"),
            {"driver_id": driver_id},
        )
    ).scalar_one()
    audit = (
        await db_session.execute(
            text("SELECT 1 FROM operations_schema.admin_audit_logs WHERE action_type = 'REJECTED_DRIVER' LIMIT 1")
        )
    ).scalar_one_or_none()
    assert profile == "REJECTED"
    assert audit == 1


async def test_suspend_driver_updates_driver_status(client, admin_auth, monkeypatch):
    from app.services.driver_admin_service import driver_admin_service

    async def fake_suspend_driver(driver_id: str, reason: str, auth_header: str | None):
        return {"driver_id": driver_id, "status": "SUSPENDED"}

    monkeypatch.setattr(driver_admin_service, "suspend_driver", fake_suspend_driver)
    response = await client.post(
        "/api/v1/admin/drivers/00000000-0000-0000-0000-000000000113/suspend",
        headers={"Authorization": admin_auth["Authorization"]},
        json={"reason": "policy"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "SUSPENDED"
