# RideConnect Product Requirements Document

## 1. Document Purpose

This PRD defines the product requirements for RideConnect MVP.

It consolidates the repo's existing planning across:
- product direction
- user journeys
- service boundaries
- API-driven state
- operational workflows
- launch scope

This document is intended to align:
- product decisions
- backend implementation
- frontend implementation
- QA
- launch readiness

---

## 2. Product Summary

RideConnect is a ride-hailing platform with three primary surfaces:
- rider app
- driver app
- admin panel

The MVP must support the full core marketplace loop:
1. rider signs up and requests a ride
2. system estimates fare and dispatches the request
3. approved driver receives and accepts the offer
4. ride progresses through live trip states
5. ride completes
6. rider receives receipt, activity history, and post-trip rating flow
7. admin monitors operations and manages driver onboarding

RideConnect should feel:
- fast
- operationally clear
- map-led
- trust-building after the ride
- structured enough for real operational control

---

## 3. Product Goals

### Primary goals
- Let riders request and complete trips with minimal friction.
- Let drivers onboard, get approved, receive ride offers, and complete trips.
- Let admins review drivers, monitor ride operations, and intervene when needed.
- Keep critical marketplace truth backend-driven rather than frontend-synthesized.

### Secondary goals
- Build the MVP on a microservice-ready foundation.
- Ensure role enforcement, auditability, and protected document access.
- Support a controlled launch or pilot with realistic operational workflows.

### Non-goals for MVP
- advanced route optimization
- dynamic surge marketplace complexity
- full wallet/credit/promo platform
- multi-country compliance
- native mobile apps
- customer support tooling beyond basic admin visibility
- fully automated driver verification by OCR/KYC vendors

---

## 4. Target Users

### Rider
Needs to:
- sign up and log in
- search pickup and destination
- see fare estimate
- request ride
- track assigned driver
- complete trip
- access receipt
- review trip history
- rate driver

### Driver
Needs to:
- register
- access profile while pending approval
- upload required documents
- get reviewed and approved
- go online only after approval
- receive offers
- accept ride
- progress ride stages
- review ride history and earnings basics

### Admin
Needs to:
- log in securely
- review onboarding queue
- approve/reject documents
- approve/reject drivers
- view active rides and online drivers
- redispatch unmatched rides
- review audit logs and operational alerts

---

## 5. Product Principles

### 5.1 Backend truth first
Critical business state must come from backend contracts, not local fallbacks.

### 5.2 One primary action per step
Each major screen should make the next action obvious:
- search
- select ride
- request ride
- accept ride
- complete ride
- rate ride

### 5.3 Operational clarity
Ride stages, driver approval state, document review state, and admin actions must be explicit.

### 5.4 Progressive disclosure
Do not overload the user early. Reveal detail when it matters:
- route first
- options next
- active trip next
- post-trip detail last

### 5.5 Role isolation
Rider, driver, and admin actions must remain clearly separated in both UI and API access.

---

## 6. In-Scope MVP Features

### Rider
- signup/login
- route search
- fare estimate
- ride request
- driver matching flow
- live ride tracking
- trip completion summary
- receipt download
- activity/history
- profile and payment settings basics
- rider rating submission

### Driver
- signup/login
- onboarding pending flow
- profile access while unapproved
- document upload
- vehicle/profile metadata management
- admin-gated activation
- online/offline toggle
- ride offers
- active ride lifecycle updates
- ride history and earnings basics

### Admin
- admin authentication
- onboarding queue
- document review
- driver approval/rejection
- online driver visibility
- active rides visibility
- unmatched rides report
- manual redispatch
- alerts
- audit logs

---

## 7. Core User Flows

### 7.1 Rider booking flow
1. Rider logs in.
2. Rider enters pickup and dropoff.
3. System returns fare estimate.
4. Rider selects ride option and payment method.
5. Rider confirms ride request.
6. Ride enters `MATCHING`.
7. Rider sees searching / matching state.
8. Driver accepts.
9. Rider sees assigned driver and live ride progression.
10. Ride completes.
11. Rider sees completion summary.
12. Rider can download receipt, skip feedback, or rate driver.
13. Trip appears in activity/history.

### 7.2 Driver onboarding flow
1. Driver registers.
2. System creates:
   - auth user
   - marketplace driver row
   - operations onboarding profile
3. Driver signs in.
4. Driver cannot access operational pages until approved.
5. Driver can access profile and documents while pending.
6. Driver uploads required documents and metadata.
7. Admin reviews and approves or rejects.
8. Once approved, driver can access dashboard and go online.

### 7.3 Driver ride flow
1. Approved driver signs in.
2. Driver goes online.
3. Driver receives ride offer.
4. Driver accepts.
5. Ride progresses:
   - `DRIVER_ASSIGNED`
   - `DRIVER_EN_ROUTE`
   - `DRIVER_ARRIVED`
   - `RIDE_STARTED`
   - `RIDE_COMPLETED`
6. Driver becomes available again after completion.

### 7.4 Admin onboarding flow
1. Admin opens KYC/onboarding queue.
2. Admin reviews driver profile and documents.
3. Admin approves/rejects documents individually.
4. Admin approves/rejects the onboarding profile.
5. Audit logs are created for approvals, rejections, and edits.

### 7.5 Unmatched ride flow
1. Ride enters `MATCHING`.
2. Offers are sent to eligible drivers.
3. Expired/rejected offers advance to next candidates.
4. When retries exceed the configured cap, ride becomes `NO_DRIVERS_FOUND`.
5. Admin can review unmatched rides and trigger redispatch.

---

## 8. Canonical Ride Lifecycle

The system must use the following canonical ride statuses:

- `REQUESTED`
- `MATCHING`
- `NO_DRIVERS_FOUND`
- `DRIVER_ASSIGNED`
- `DRIVER_EN_ROUTE`
- `DRIVER_ARRIVED`
- `RIDE_STARTED`
- `RIDE_COMPLETED`
- `CANCELLED`

These statuses must match across:
- backend
- rider app
- driver app
- admin panel

Offer lifecycle:
- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `EXPIRED`

Post-ride feedback lifecycle:
- `PENDING`
- `SUBMITTED`
- `SKIPPED`

---

## 9. Driver Approval and Compliance Requirements

Driver activation must be controlled by admin approval only.

### Rules
- New driver registration must not grant dashboard access.
- Driver cannot go online without approval.
- Operational routes must remain blocked until backend `is_approved=true`.
- Driver profile and document upload remain available while unapproved.

### Required onboarding documents
- `PROFILE_PHOTO`
- `GOVT_ID_FRONT`
- `GOVT_ID_BACK`
- `DRIVER_LICENSE`
- `VEHICLE_REGISTRATION`
- `INSURANCE`

### Required metadata for selected documents
For `DRIVER_LICENSE`, `VEHICLE_REGISTRATION`, and `INSURANCE`, the system must support:
- document number
- issuing state
- issuing country
- expiry date

### Document review states
- `SUBMITTED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`

---

## 10. Functional Requirements

### 10.1 Authentication and authorization
- Users must authenticate with JWTs.
- Roles must include:
  - `RIDER`
  - `DRIVER`
  - `ADMIN`
- Protected endpoints must enforce role requirements.
- Sensitive document downloads must require authorization.

### 10.2 Rider booking
- Rider must be able to request fare estimates with route data.
- Ride creation must be idempotent.
- A rider must not accidentally create duplicate active rides via repeated submits.

### 10.3 Driver dispatch
- Only approved, active, online, available drivers may receive offers.
- Matching must support retry cap logic.
- System must mark rides `NO_DRIVERS_FOUND` after retry exhaustion.
- Admin must be able to redispatch unmatched rides.

### 10.4 Ride completion
- Completion must stop active ride polling and live trip state.
- Receipt availability must be backend-driven.
- Feedback must be optional and independent from completion.
- Refresh after completion must recover correctly from backend truth.

### 10.5 Activity and receipts
- Rider activity/history must be backend-driven.
- Trip detail must be backend-driven.
- Receipts must be backend-generated.

### 10.6 Documents
- Uploaded documents must be stored on local filesystem for MVP.
- Database stores metadata only, not document blobs.
- File storage must use a dedicated storage abstraction for future S3 migration.
- Files must be organized by entity type and owner id.

### 10.7 Admin operations
- Admin must see onboarding queue.
- Admin must see active rides and online drivers.
- Admin must see unmatched rides reporting.
- Admin must have audit log visibility.
- Admin must have alerts visibility.

---

## 11. Non-Functional Requirements

### Security
- JWT config must be production-safe.
- Roles and ownership checks must be enforced on sensitive endpoints.
- Documents must not be publicly accessible.
- File type, MIME type, extension, and size validation must be enforced.

### Reliability
- Idempotency must exist for:
  - ride creation
  - driver accept
  - payment-setting changes
- Retry protection must exist for critical request paths.

### Auditability
- Approvals, rejections, and edits must create admin audit logs.

### Maintainability
- SQLAlchemy models and DB schema must remain migration-aligned.
- Alembic migration smoke checks must exist to prevent schema drift.

---

## 12. System Architecture

RideConnect MVP uses four backend services:
- `auth_service`
- `marketplace_service`
- `operations_service`
- `notification_service`

### Responsibilities

#### auth_service
- signup/login
- JWT issuance
- identity and role context

#### marketplace_service
- rider profiles
- driver operational profiles
- ride lifecycle
- dispatch
- pricing
- tracking
- receipts
- rider post-ride state

#### operations_service
- onboarding
- documents
- admin workflows
- regions
- audit logs
- alerts

#### notification_service
- internal notification delivery foundation

The current active backend is `services/*`.
The legacy `backend/` monolith is not part of the live runtime architecture.

---

## 13. Data Requirements

### Key entities
- users
- riders
- drivers
- vehicles
- rides
- driver offers
- fare estimates
- tracking pings
- onboarding profiles
- driver documents
- document requirements
- admin audit logs
- alerts

### Document storage model
Actual file contents:
- stored on local filesystem under media storage

Database metadata:
- `document_type`
- `file_path`
- `original_file_name`
- `mime_type`
- `file_size`
- `document_number`
- `issuing_state`
- `issuing_country`
- `issued_at`
- `expires_at`
- `status`
- `submitted_at`
- `reviewed_at`
- `reviewed_by`
- `notes`

---

## 14. Metrics and Success Criteria

### Product success metrics for MVP
- rider can complete full booking lifecycle without manual DB intervention
- driver can register, upload docs, and get approved through admin workflow
- admin can review and activate drivers end to end
- unmatched rides are visible and recoverable
- rider can receive receipt and submit rating after completion

### Operational success metrics
- no duplicate rides from repeated confirm requests
- no unauthorized document access
- no frontend-only business truth for core ride state
- ride lifecycle status consistency across all apps

### Launch-readiness checklist themes
- backend-driven critical flows
- passing backend tests
- role enforcement
- protected document access
- schema/migration integrity
- QA across target device classes
- production deployment setup

---

## 15. MVP Launch Scope

The MVP is considered functionally ready when all of the following are true:
- rider register/login works
- driver register works
- driver onboarding records are created correctly
- document upload and review work
- admin approval gates driver activation
- approved driver can go online
- rider can request a ride
- driver can accept and complete the ride
- rider can access receipt and activity
- rider can submit or skip rating
- unmatched rides are reported and redispatchable

---

## 16. Known Post-MVP Extensions

The following are intentionally deferred:
- real email/phone verification
- advanced payout system
- promo codes and ride credits
- richer support workflows
- external object storage provider
- OCR/compliance automation
- advanced dispatch optimization
- stronger mobile-native experiences
- automated browser E2E suite and full CI/CD hardening

---

## 17. Open Risks

### Product risks
- incomplete frontend QA across all breakpoints can still hide UX defects
- operational workflows depend on admin correctness during onboarding

### Technical risks
- legacy docs and legacy `backend/` folder can create confusion
- production infrastructure is not complete until TLS, secrets, backups, and alert routing are finalized

### Launch risk
- controlled pilot readiness is closer than general production readiness

---

## 18. Current Repo Direction

This repo should now be treated as:
- active product code in `services/*`, `frontend/*`, `gateway/`, `infra/`, and `shared/`
- legacy monolith reference in `backend/`

Documentation should be progressively aligned to the microservice implementation, with this `PRD.md` serving as the top-level product document.
