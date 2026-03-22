from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from math import asin, cos, radians, sin, sqrt


def to_decimal(value: float | int | str | Decimal, places: str = "0.01") -> Decimal:
    return Decimal(str(value)).quantize(Decimal(places), rounding=ROUND_HALF_UP)


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_miles = 3958.7613
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    a = sin(d_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(d_lon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return radius_miles * c
