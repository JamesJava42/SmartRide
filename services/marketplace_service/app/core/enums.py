from __future__ import annotations

from enum import Enum


class DriverStatus(str, Enum):
    PENDING_APPROVAL = "PENDING_APPROVAL"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    INACTIVE = "INACTIVE"


class VehicleType(str, Enum):
    ECONOMY = "ECONOMY"
    PREMIUM = "PREMIUM"
    XL = "XL"


class RideStatus(str, Enum):
    REQUESTED = "REQUESTED"
    MATCHING = "MATCHING"
    NO_DRIVERS_FOUND = "NO_DRIVERS_FOUND"
    DRIVER_ASSIGNED = "DRIVER_ASSIGNED"
    DRIVER_EN_ROUTE = "DRIVER_EN_ROUTE"
    DRIVER_ARRIVED = "DRIVER_ARRIVED"
    RIDE_STARTED = "RIDE_STARTED"
    RIDE_COMPLETED = "RIDE_COMPLETED"
    CANCELLED = "CANCELLED"


class RideType(str, Enum):
    ON_DEMAND = "ON_DEMAND"
    SCHEDULED = "SCHEDULED"


class RideFeedbackStatus(str, Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    SKIPPED = "SKIPPED"


class OfferStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class CancelledBy(str, Enum):
    RIDER = "RIDER"
    DRIVER = "DRIVER"
    ADMIN = "ADMIN"


class SavedPlaceLabel(str, Enum):
    HOME = "HOME"
    WORK = "WORK"
    CUSTOM = "CUSTOM"
