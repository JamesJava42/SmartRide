# RideConnect Software Requirements Document

## 1. Purpose

This Software Requirements Document defines the technical and functional software requirements for RideConnect MVP.

It complements the product-facing requirements in [PRD.md](/c:/Users/samar/source/rideconnect/docs/PRD.md) and translates them into implementation-oriented requirements for:
- backend services
- frontend applications
- data storage
- integrations
- security
- testing
- deployment

---

## 2. System Overview

RideConnect is a ride-hailing platform with three user-facing applications:
- rider web app
- driver web app
- admin panel

The platform is implemented on a microservice-oriented backend with these active services:
- `auth_service`
- `marketplace_service`
- `operations_service`
- `notification_service`

Supporting runtime components:
- PostgreSQL
- Redis
- API gateway
- Docker Compose for local/integration runtime

The active backend code lives under `services/*`.

---

## 3. Actors

### Rider
Uses the system to:
- register and authenticate
- request fare estimates
- book rides
- track rides
- download receipts
- review trip activity
- rate drivers

### Driver
Uses the system to:
- register
- access onboarding profile
- upload documents
- await approval
- go online after approval
- accept ride offers
- progress ride stages
- review ride history and earnings basics

### Admin
Uses the system to:
- authenticate
- review onboarding queue
- review documents
- approve/reject drivers
- monitor live operations
- view alerts and audit logs
- redispatch unmatched rides

---

## 4. Technical Goals

- Ensure core marketplace state is backend-driven.
- Enforce role-based access for rider, driver, and admin.
- Keep ride lifecycle consistent across all applications.
- Keep schema changes migration-managed through Alembic.
- Support operational auditability for approvals, rejections, and edits.
- Allow local MVP media storage with a storage abstraction for future cloud migration.

---

## 5. System Architecture Requirements

### 5.1 auth_service
Responsibilities:
- signup
- login
- JWT issuance
- current user identity
- role enforcement foundation

Required outputs:
- access token
- refresh token
- authenticated user context

### 5.2 marketplace_service
Responsibilities:
- rider profile state
- driver operational profile state
- rides
- dispatch
- fare estimates
- tracking
- ride completion
- receipts
- rider feedback

### 5.3 operations_service
Responsibilities:
- onboarding
- driver documents
- document requirements
- admin workflows
- regions
- audit logs
- alerts

### 5.4 notification_service
Responsibilities:
- notification event handling foundation
- delivery logging
- future outbound alert/message extensibility

---

## 6. Functional Requirements

## 6.1 Authentication

- The system shall support signup for `RIDER` and `DRIVER`.
- The system shall support login for `RIDER`, `DRIVER`, and `ADMIN`.
- The system shall issue signed JWT access tokens.
- The system shall validate token issuer and signature in all backend services.
- The system shall reject unauthorized access to protected endpoints.

## 6.2 Rider booking

- The system shall provide ride fare estimates before booking.
- The system shall allow the rider to request a ride with:
  - pickup coordinates and address
  - dropoff coordinates and address
  - ride type
  - vehicle type
  - fare estimate reference
  - payment method
- Ride creation shall be idempotent.

## 6.3 Ride lifecycle

The system shall support these canonical ride statuses:
- `REQUESTED`
- `MATCHING`
- `NO_DRIVERS_FOUND`
- `DRIVER_ASSIGNED`
- `DRIVER_EN_ROUTE`
- `DRIVER_ARRIVED`
- `RIDE_STARTED`
- `RIDE_COMPLETED`
- `CANCELLED`

The system shall reject invalid ride transitions.

## 6.4 Dispatch

- Only drivers meeting all of the following shall be eligible:
  - approved
  - active
  - online
  - available
- Driver offers shall support:
  - `PENDING`
  - `ACCEPTED`
  - `REJECTED`
  - `EXPIRED`
- Offer expiry shall be handled automatically.
- Dispatch retry count shall be tracked on each ride.
- Max retry logic shall move the ride to `NO_DRIVERS_FOUND`.
- Admin shall be able to redispatch eligible unmatched rides.

## 6.5 Driver onboarding

- Driver registration shall create:
  - auth user
  - marketplace driver row
  - operations onboarding profile
- Unapproved drivers shall not access operational driver pages.
- Unapproved drivers shall still access profile and documents.
- Driver activation shall be determined by backend approval state only.

## 6.6 Documents

The system shall support driver documents:
- `PROFILE_PHOTO`
- `GOVT_ID_FRONT`
- `GOVT_ID_BACK`
- `DRIVER_LICENSE`
- `VEHICLE_REGISTRATION`
- `INSURANCE`

The system shall support per-document metadata requirements.

For required compliance documents, the system shall support:
- `document_number`
- `issuing_state`
- `issuing_country`
- `issued_at` where required
- `expires_at` where required

Document review statuses shall support:
- `SUBMITTED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`

## 6.7 Ride completion

- Ride completion shall compute and persist final fare state.
- Ride completion shall reset driver availability.
- Receipt availability shall be determined from backend ride state.
- Rider feedback submission shall be independent from ride completion.
- Rider completion acknowledgement shall be persisted.

## 6.8 Rider post-trip

The system shall support backend-driven fields:
- `feedback_status`
- `completion_acknowledged`
- `receipt_available`
- `can_rate_driver`
- `can_tip`

The system shall support rider receipt generation through the backend.

## 6.9 Admin operations

Admin workflows shall support:
- onboarding queue listing
- onboarding detail
- onboarding approval
- onboarding rejection
- request additional info
- document approval/rejection/under-review
- unmatched ride reporting
- online driver visibility
- audit log visibility
- alerts visibility

---

## 7. Data Requirements

## 7.1 Primary schemas

- `auth_schema`
- `marketplace_schema`
- `operations_schema`
- `notification_schema`

## 7.2 Required entity groups

### auth_schema
- users
- refresh tokens

### marketplace_schema
- riders
- drivers
- vehicles
- rides
- driver_offers
- fare_estimates
- ride_events
- tracking_pings
- idempotency_keys

### operations_schema
- admins
- regions
- driver_onboarding_profiles
- driver_documents
- document_requirements
- admin_audit_logs
- alerts

### notification_schema
- notification jobs
- notification delivery logs

---

## 8. Document Storage Requirements

- Uploaded document files shall be stored on local filesystem for MVP.
- Database shall store metadata and relative file paths only.
- File blobs shall not be stored in the database for new uploads.
- Storage logic shall be isolated behind a storage service abstraction.
- Files shall be organized by entity type and owner id, for example:
  - `driver_documents/<driver_id>/...`
- File names shall be unique and sanitized.
- Only authorized users shall be able to download sensitive documents.
- No public static media access shall be exposed for protected documents.

---

## 9. API Requirements

- All primary API routes shall be under `/api/v1`.
- Protected routes shall use bearer token authentication.
- APIs shall use a consistent response envelope for success and error responses.
- Admin internal/reporting endpoints may be proxied between services but must remain protected.

Required route groups:
- `/api/v1/auth/*`
- `/api/v1/riders/*`
- `/api/v1/drivers/*`
- `/api/v1/rides/*`
- `/api/v1/tracking/*`
- `/api/v1/onboarding/*`
- `/api/v1/admin/*`

---

## 10. Security Requirements

- JWT secret must be non-placeholder and strong outside development.
- JWT issuer must be validated.
- Role enforcement must exist on rider, driver, and admin endpoints.
- Ownership checks must exist for rider-only and driver-only resources.
- Document download must require authorization.
- Internal service-to-service destructive operations must require internal service credentials.
- Upload validation must enforce:
  - allowed extensions
  - allowed MIME types
  - max file size

---

## 11. Reliability Requirements

- Ride creation shall support idempotency keys.
- Driver offer accept shall be idempotent for repeated successful accepts.
- Payment-setting updates shall support idempotency keys.
- Dispatch retry protection shall prevent infinite uncontrolled offer cycling.
- Schema drift checks shall run after migrations in bootstrap flows.

---

## 12. Audit and Monitoring Requirements

### Audit logging
The system shall record admin audit logs for:
- approvals
- rejections
- edits

### Alerts
The system shall support operational alerts for:
- service downtime
- database errors
- dispatch failures
- file upload failures
- auth failures

---

## 13. Frontend Requirements

### Rider app
- must support desktop and mobile layouts
- must show backend-driven trip state
- must not synthesize ride truth in local storage for critical flows

### Driver app
- must enforce admin-gated operational access
- must allow profile/documents while pending
- must support desktop and mobile navigation

### Admin panel
- must support desktop and tablet usage
- must expose onboarding review, live operations, alerts, and audit views

---

## 14. Testing Requirements

The system shall include backend automated tests for:
- onboarding flow
- document upload
- approval flow
- dispatch
- ride completion

The system should additionally include:
- browser-based smoke or E2E coverage
- regression coverage for critical rider-driver-admin lifecycle paths

---

## 15. Deployment Requirements

### Local/integration runtime
- Docker Compose shall be supported.
- Migrations shall run before seeded/test data is used.

### Production expectations
- managed secret configuration
- TLS/domain setup
- persistent storage
- backup and restore strategy
- centralized logs
- alert routing
- rollout and rollback plan

---

## 16. Out of Scope for MVP

- native mobile apps
- automated third-party KYC/OCR verification
- advanced payout engine
- wallet/credit/promotions platform
- sophisticated dispatch optimization
- enterprise-grade support tooling
- full multi-region compliance automation

---

## 17. Acceptance Criteria

The software shall be considered MVP-complete when:
- rider can register, book, complete, and review a trip
- driver can register, upload documents, get approved, go online, and complete trips
- admin can review documents and approve drivers
- unmatched rides are surfaced and redispatchable
- receipts and ratings are backend-driven
- critical role and document security requirements are enforced
- backend tests for onboarding, documents, approvals, dispatch, and ride completion pass

---

## 18. Repo Documentation Relationship

This document is the software-oriented requirements reference.

Related documents:
- [PRD.md](/c:/Users/samar/source/rideconnect/docs/PRD.md)
- [rideconnect_api_contract_spec.md](/c:/Users/samar/source/rideconnect/rideconnect_api_contract_spec.md)
- [rideconnect_microservices_architecture_spec.md](/c:/Users/samar/source/rideconnect/rideconnect_microservices_architecture_spec.md)
- [rideconnect_ux_blueprint.md](/c:/Users/samar/source/rideconnect/rideconnect_ux_blueprint.md)
