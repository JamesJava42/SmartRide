from enum import Enum


class UserRole(str, Enum):
    RIDER = "RIDER"
    DRIVER = "DRIVER"
    ADMIN = "ADMIN"
