from __future__ import annotations

import argparse
import asyncio
import os
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


DATABASE_URL = os.getenv(
    "OPERATIONS_DATABASE_URL",
    os.getenv("AUTH_DATABASE_URL", "postgresql+asyncpg://rideconnect:changeme@localhost:55432/rideconnect"),
)


@dataclass
class AuthDriverUser:
    user_id: str
    email: str | None
    phone_number: str | None
    is_active: bool
    created_at: datetime | None
    updated_at: datetime | None


@dataclass
class DriverRow:
    driver_id: str
    user_id: str
    first_name: str
    last_name: str | None
    phone_number: str
    region_id: str | None
    status: str
    is_online: bool
    is_available: bool
    is_approved: bool
    created_at: datetime | None
    updated_at: datetime | None


@dataclass
class OnboardingRow:
    profile_id: str
    driver_id: str
    region_id: str | None
    status: str
    submitted_at: datetime | None
    reviewed_at: datetime | None
    reviewed_by_admin_id: str | None
    review_notes: str | None
    rejection_reason: str | None
    created_at: datetime | None
    updated_at: datetime | None


@dataclass
class DocumentRow:
    document_id: str
    driver_id: str
    document_type: str
    verification_status: str
    submitted_at: datetime | None
    reviewed_at: datetime | None
    file_path: str | None
    file_url: str | None


@dataclass
class RequirementRow:
    document_type: str
    region_id: str | None
    is_required: bool
    is_active: bool


@dataclass
class DriverIssue:
    driver_key: str
    email: str | None
    issues: list[str] = field(default_factory=list)
    actions: list[str] = field(default_factory=list)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def fallback_name(email: str | None, phone_number: str | None) -> str:
    if email and "@" in email:
        seed = email.split("@", 1)[0]
    elif phone_number:
        seed = phone_number
    else:
        seed = "driver"
    cleaned = "".join(ch if ch.isalnum() else " " for ch in seed).strip() or "driver"
    parts = [part.capitalize() for part in cleaned.split() if part]
    return parts[0] if parts else "Driver"


def required_doc_types(requirements: list[RequirementRow], region_id: str | None) -> set[str]:
    regional = {row.document_type for row in requirements if row.is_active and row.is_required and row.region_id == region_id}
    if regional:
        return regional
    return {row.document_type for row in requirements if row.is_active and row.is_required and row.region_id is None}


async def fetch_all(conn, sql: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    result = await conn.execute(text(sql), params or {})
    return [dict(row._mapping) for row in result]


async def main() -> int:
    parser = argparse.ArgumentParser(description="Backfill broken driver/onboarding/document data.")
    parser.add_argument("--apply", action="store_true", help="Persist repairs. Default is dry-run.")
    parser.add_argument("--email", help="Limit processing to a single auth driver email.")
    args = parser.parse_args()

    engine = create_async_engine(DATABASE_URL)
    now = utcnow()

    async with engine.begin() as conn:
        auth_sql = """
            SELECT id AS user_id, email, phone_number, is_active, created_at, updated_at
            FROM auth_schema.users
            WHERE role = 'DRIVER'
        """
        auth_params: dict[str, Any] = {}
        if args.email:
            auth_sql += " AND email = :email"
            auth_params["email"] = args.email
        auth_sql += " ORDER BY created_at ASC"
        auth_rows = await fetch_all(conn, auth_sql, auth_params)
        driver_rows = await fetch_all(
            conn,
            """
            SELECT id AS driver_id, user_id, first_name, last_name, phone_number, region_id,
                   status, is_online, is_available, is_approved, created_at, updated_at
            FROM marketplace_schema.drivers
            ORDER BY created_at ASC
            """,
        )
        onboarding_rows = await fetch_all(
            conn,
            """
            SELECT id AS profile_id, driver_id, region_id, status, submitted_at, reviewed_at,
                   reviewed_by_admin_id, review_notes, rejection_reason, created_at, updated_at
            FROM operations_schema.driver_onboarding_profiles
            ORDER BY created_at ASC
            """,
        )
        document_rows = await fetch_all(
            conn,
            """
            SELECT id AS document_id, driver_id, document_type, verification_status, submitted_at,
                   reviewed_at, file_path, file_url
            FROM operations_schema.driver_documents
            ORDER BY submitted_at ASC NULLS LAST, created_at ASC
            """,
        )
        requirement_rows = await fetch_all(
            conn,
            """
            SELECT document_type, region_id, is_required, is_active
            FROM operations_schema.document_requirements
            WHERE entity_type = 'DRIVER'
            """,
        )
        region_rows = await fetch_all(
            conn,
            """
            SELECT id, name, is_active
            FROM operations_schema.regions
            ORDER BY created_at ASC
            """,
        )

        auth_users = [AuthDriverUser(**row) for row in auth_rows]
        drivers_by_user_id = {row["user_id"]: DriverRow(**row) for row in driver_rows}
        onboarding_by_driver_id = {row["driver_id"]: OnboardingRow(**row) for row in onboarding_rows}
        documents_by_driver_id: dict[str, list[DocumentRow]] = defaultdict(list)
        for row in document_rows:
            documents_by_driver_id[row["driver_id"]].append(DocumentRow(**row))
        requirements = [RequirementRow(**row) for row in requirement_rows]
        active_region_ids = [str(row["id"]) for row in region_rows if row["is_active"]]
        fallback_region_id = active_region_ids[0] if active_region_ids else None

        if not fallback_region_id:
            raise RuntimeError("No active region available; cannot backfill driver onboarding data safely.")

        issues: list[DriverIssue] = []

        for auth_user in auth_users:
            issue = DriverIssue(driver_key=auth_user.user_id, email=auth_user.email)
            driver = drivers_by_user_id.get(auth_user.user_id)

            if not driver:
                issue.issues.append("missing_marketplace_driver")
                if args.apply:
                    driver_id = str(uuid4())
                    first_name = fallback_name(auth_user.email, auth_user.phone_number)
                    await conn.execute(
                        text(
                            """
                            INSERT INTO marketplace_schema.drivers (
                                id, user_id, first_name, last_name, phone_number, region_id, status,
                                is_online, is_available, is_approved, total_rides_completed, created_at, updated_at
                            ) VALUES (
                                :id, :user_id, :first_name, NULL, :phone_number, :region_id, 'PENDING_APPROVAL',
                                false, false, false, 0, :created_at, :updated_at
                            )
                            """
                        ),
                        {
                            "id": driver_id,
                            "user_id": auth_user.user_id,
                            "first_name": first_name,
                            "phone_number": auth_user.phone_number or "",
                            "region_id": fallback_region_id,
                            "created_at": auth_user.created_at or now,
                            "updated_at": now,
                        },
                    )
                    driver = DriverRow(
                        driver_id=driver_id,
                        user_id=auth_user.user_id,
                        first_name=first_name,
                        last_name=None,
                        phone_number=auth_user.phone_number or "",
                        region_id=fallback_region_id,
                        status="PENDING_APPROVAL",
                        is_online=False,
                        is_available=False,
                        is_approved=False,
                        created_at=auth_user.created_at or now,
                        updated_at=now,
                    )
                    issue.actions.append(f"created_marketplace_driver:{driver_id}")
                else:
                    issue.actions.append("would_create_marketplace_driver")

            if not driver:
                issues.append(issue)
                continue

            profile = onboarding_by_driver_id.get(driver.driver_id)

            if not profile:
                issue.issues.append("missing_onboarding_profile")
                derived_status = "APPROVED" if driver.is_approved else "SUBMITTED"
                derived_region_id = driver.region_id or fallback_region_id
                submitted_at = driver.created_at or now
                reviewed_at = driver.updated_at if derived_status == "APPROVED" else None
                if args.apply:
                    profile_id = str(uuid4())
                    review_notes = "Backfilled missing onboarding profile."
                    await conn.execute(
                        text(
                            """
                            INSERT INTO operations_schema.driver_onboarding_profiles (
                                id, driver_id, region_id, status, submitted_at, reviewed_at, review_notes, created_at, updated_at
                            ) VALUES (
                                :id, :driver_id, :region_id, :status, :submitted_at, :reviewed_at, :review_notes, :created_at, :updated_at
                            )
                            """
                        ),
                        {
                            "id": profile_id,
                            "driver_id": driver.driver_id,
                            "region_id": derived_region_id,
                            "status": derived_status,
                            "submitted_at": submitted_at,
                            "reviewed_at": reviewed_at,
                            "review_notes": review_notes,
                            "created_at": submitted_at,
                            "updated_at": now,
                        },
                    )
                    profile = OnboardingRow(
                        profile_id=profile_id,
                        driver_id=driver.driver_id,
                        region_id=derived_region_id,
                        status=derived_status,
                        submitted_at=submitted_at,
                        reviewed_at=reviewed_at,
                        reviewed_by_admin_id=None,
                        review_notes=review_notes,
                        rejection_reason=None,
                        created_at=submitted_at,
                        updated_at=now,
                    )
                    issue.actions.append(f"created_onboarding_profile:{profile_id}")
                else:
                    issue.actions.append("would_create_onboarding_profile")

            if not profile:
                issues.append(issue)
                continue

            updates: dict[str, Any] = {}
            set_clauses: list[str] = []

            target_region_id = profile.region_id or driver.region_id or fallback_region_id
            if profile.region_id != target_region_id:
                issue.issues.append("onboarding_region_missing_or_inconsistent")
                updates["region_id"] = target_region_id
                set_clauses.append("region_id = :region_id")

            if driver.region_id != target_region_id:
                issue.issues.append("driver_region_missing_or_inconsistent")
                if args.apply:
                    await conn.execute(
                        text(
                            """
                            UPDATE marketplace_schema.drivers
                            SET region_id = :region_id, updated_at = :updated_at
                            WHERE id = :driver_id
                            """
                        ),
                        {"region_id": target_region_id, "updated_at": now, "driver_id": driver.driver_id},
                    )
                    driver.region_id = target_region_id
                    issue.actions.append("updated_driver_region")
                else:
                    issue.actions.append("would_update_driver_region")

            submitted_at = profile.submitted_at
            if profile.status in {"SUBMITTED", "UNDER_REVIEW", "DOCS_PENDING", "APPROVED", "REJECTED"} and not submitted_at:
                issue.issues.append("missing_submitted_at")
                submitted_at = profile.created_at or driver.created_at or now
                updates["submitted_at"] = submitted_at
                set_clauses.append("submitted_at = :submitted_at")

            reviewed_at = profile.reviewed_at
            if profile.status in {"APPROVED", "REJECTED", "DOCS_PENDING"} and not reviewed_at:
                issue.issues.append("missing_reviewed_at")
                reviewed_at = profile.updated_at or driver.updated_at or submitted_at or now
                updates["reviewed_at"] = reviewed_at
                set_clauses.append("reviewed_at = :reviewed_at")

            driver_documents = documents_by_driver_id.get(driver.driver_id, [])
            required_types = required_doc_types(requirements, target_region_id)
            existing_types = {document.document_type for document in driver_documents}
            missing_required_types = sorted(required_types - existing_types)
            if missing_required_types:
                issue.issues.append(f"missing_required_documents:{','.join(missing_required_types)}")

            broken_document_rows = [
                document.document_id
                for document in driver_documents
                if not document.file_path and not document.file_url
            ]
            if broken_document_rows:
                issue.issues.append(f"broken_document_rows:{','.join(broken_document_rows)}")

            for document in driver_documents:
                if document.verification_status in {"APPROVED", "REJECTED", "UNDER_REVIEW"} and not document.reviewed_at:
                    issue.issues.append(f"document_missing_reviewed_at:{document.document_id}")
                    if args.apply:
                        repaired_reviewed_at = document.submitted_at or reviewed_at or now
                        await conn.execute(
                            text(
                                """
                                UPDATE operations_schema.driver_documents
                                SET reviewed_at = :reviewed_at, updated_at = :updated_at
                                WHERE id = :document_id
                                """
                            ),
                            {
                                "reviewed_at": repaired_reviewed_at,
                                "updated_at": now,
                                "document_id": document.document_id,
                            },
                        )
                        issue.actions.append(f"updated_document_reviewed_at:{document.document_id}")
                    else:
                        issue.actions.append(f"would_update_document_reviewed_at:{document.document_id}")

            should_be_approved = profile.status == "APPROVED" and not missing_required_types
            if profile.status == "APPROVED" and missing_required_types:
                issue.issues.append("approved_profile_missing_required_documents")
                updates["status"] = "DOCS_PENDING"
                set_clauses.append("status = :status")
                should_be_approved = False

            desired_driver_status = "ACTIVE" if should_be_approved else "PENDING_APPROVAL"
            desired_is_approved = should_be_approved
            desired_is_online = driver.is_online if desired_is_approved else False
            desired_is_available = driver.is_available if desired_is_approved else False

            if (
                driver.status != desired_driver_status
                or driver.is_approved != desired_is_approved
                or driver.is_online != desired_is_online
                or driver.is_available != desired_is_available
            ):
                issue.issues.append("driver_activation_state_inconsistent")
                if args.apply:
                    await conn.execute(
                        text(
                            """
                            UPDATE marketplace_schema.drivers
                            SET status = :status,
                                is_approved = :is_approved,
                                is_online = :is_online,
                                is_available = :is_available,
                                updated_at = :updated_at
                            WHERE id = :driver_id
                            """
                        ),
                        {
                            "status": desired_driver_status,
                            "is_approved": desired_is_approved,
                            "is_online": desired_is_online,
                            "is_available": desired_is_available,
                            "updated_at": now,
                            "driver_id": driver.driver_id,
                        },
                    )
                    issue.actions.append("updated_driver_activation_state")
                else:
                    issue.actions.append("would_update_driver_activation_state")

            if set_clauses:
                updates["updated_at"] = now
                updates["profile_id"] = profile.profile_id
                if args.apply:
                    await conn.execute(
                        text(
                            f"""
                            UPDATE operations_schema.driver_onboarding_profiles
                            SET {", ".join(set_clauses)}, updated_at = :updated_at
                            WHERE id = :profile_id
                            """
                        ),
                        updates,
                    )
                    issue.actions.append("updated_onboarding_profile")
                else:
                    issue.actions.append("would_update_onboarding_profile")

            if issue.issues:
                issues.append(issue)

        orphan_drivers = await fetch_all(
            conn,
            """
            SELECT d.id AS driver_id, d.user_id
            FROM marketplace_schema.drivers d
            LEFT JOIN auth_schema.users u ON u.id = d.user_id
            WHERE u.id IS NULL
            ORDER BY d.created_at ASC
            """,
        )

        orphan_profiles = await fetch_all(
            conn,
            """
            SELECT p.id AS profile_id, p.driver_id
            FROM operations_schema.driver_onboarding_profiles p
            LEFT JOIN marketplace_schema.drivers d ON d.id = p.driver_id
            WHERE d.id IS NULL
            ORDER BY p.created_at ASC
            """,
        )

    await engine.dispose()

    mode = "APPLY" if args.apply else "DRY_RUN"
    print(f"[backfill] mode={mode} scanned_driver_users={len(auth_users)} issue_count={len(issues)}")

    for issue in issues:
        print(f"[driver] key={issue.driver_key} email={issue.email or '—'}")
        for item in issue.issues:
            print(f"  issue: {item}")
        for action in issue.actions:
            print(f"  action: {action}")

    if orphan_drivers:
        print(f"[orphan-drivers] count={len(orphan_drivers)}")
        for row in orphan_drivers:
            print(f"  driver_id={row['driver_id']} user_id={row['user_id']}")

    if orphan_profiles:
        print(f"[orphan-onboarding-profiles] count={len(orphan_profiles)}")
        for row in orphan_profiles:
            print(f"  profile_id={row['profile_id']} driver_id={row['driver_id']}")

    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
