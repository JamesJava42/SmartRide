from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.core.enums import OnboardingStatus


class AdminDriverVehicleResponse(BaseModel):
    id: str
    driver_id: str
    make: str
    model: str
    year: int
    color: str | None
    plate_number: str
    vehicle_type: str
    seat_capacity: int
    fuel_type: str | None = None
    mileage_city: float | None = None
    mileage_highway: float | None = None
    is_active: bool


class AdminDriverDocumentResponse(BaseModel):
    id: str
    driver_id: str
    document_type: str
    file_url: str | None = None
    file_path: str | None = None
    original_file_name: str | None = None
    mime_type: str | None = None
    file_size: int | None = None
    document_number: str | None = None
    issuing_state: str | None = None
    issuing_country: str | None = None
    issued_at: datetime | None = None
    expires_at: datetime | None = None
    download_path: str | None = None
    verification_status: str
    submitted_at: datetime
    reviewed_at: datetime | None = None
    reviewed_by_admin_id: str | None = None
    notes: str | None = None
    rejection_reason: str | None = None
    metadata_json: dict | None = None


class AdminDriverOnboardingResponse(BaseModel):
    driver_id: str
    region_id: str
    status: str
    submitted_at: datetime | None = None
    review_started_at: datetime | None = None
    reviewed_at: datetime | None = None
    reviewed_by_admin_id: str | None = None
    review_notes: str | None = None
    rejection_reason: str | None = None


class AdminDriverDetailResponse(BaseModel):
    driver_id: str
    user_id: str
    first_name: str
    last_name: str | None
    phone_number: str
    region_id: str | None
    status: str
    is_approved: bool
    is_online: bool
    is_available: bool
    rating_avg: float | None
    total_rides_completed: int
    created_at: datetime | None
    vehicle: AdminDriverVehicleResponse | None
    onboarding: AdminDriverOnboardingResponse | None
    documents: list[AdminDriverDocumentResponse]


class SaveNotesRequest(BaseModel):
    review_notes: str


class OnboardingQueueItem(BaseModel):
    driver_id: str
    driver_name: str
    phone_number: str
    region_name: str
    driver_status: str
    is_approved: bool
    doc_submitted_count: int
    doc_approved_count: int
    status: OnboardingStatus
    submitted_at: datetime | None


class PaginationResponse(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class OnboardingQueueResponse(BaseModel):
    items: list[OnboardingQueueItem]
    pagination: PaginationResponse


class ApproveOnboardingRequest(BaseModel):
    review_notes: str | None = None


class RejectOnboardingRequest(BaseModel):
    rejection_reason: str


class OnboardingActionResponse(BaseModel):
    driver_id: str
    status: OnboardingStatus
    reviewed_at: datetime | None = None


class OnboardingDetailResponse(BaseModel):
    driver_id: str
    driver_name: str
    driver_email: str
    region_name: str
    status: OnboardingStatus
    review_notes: str | None = None
    rejection_reason: str | None = None
    submitted_at: datetime | None = None
    reviewed_at: datetime | None = None


class CreateDriverRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    region_id: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    vehicle_color: str
    vehicle_class: str
    vehicle_license_plate: str
    vehicle_mpg: str | None = None


class DriverSelfRegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    region_id: str


class RequestInfoRequest(BaseModel):
    notes: str
