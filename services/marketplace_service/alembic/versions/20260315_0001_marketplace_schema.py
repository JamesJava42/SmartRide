"""create marketplace schema tables

Revision ID: 20260315_0001
Revises:
Create Date: 2026-03-15 22:15:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260315_0001"
down_revision = None
branch_labels = None
depends_on = None


driver_status_enum = postgresql.ENUM("PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "INACTIVE", name="driver_status", create_type=False)
ride_status_enum = postgresql.ENUM(
    "REQUESTED",
    "MATCHING",
    "DRIVER_ASSIGNED",
    "DRIVER_EN_ROUTE",
    "DRIVER_ARRIVED",
    "RIDE_STARTED",
    "RIDE_COMPLETED",
    "CANCELLED",
    name="ride_status",
    create_type=False,
)
ride_type_enum = postgresql.ENUM("ON_DEMAND", "SCHEDULED", name="ride_type", create_type=False)
offer_status_enum = postgresql.ENUM("PENDING", "ACCEPTED", "REJECTED", "EXPIRED", name="offer_status", create_type=False)
cancelled_by_enum = postgresql.ENUM("RIDER", "DRIVER", "ADMIN", name="cancelled_by_actor", create_type=False)


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS marketplace_schema")
    postgresql.ENUM("PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "INACTIVE", name="driver_status").create(op.get_bind(), checkfirst=True)
    postgresql.ENUM(
        "REQUESTED",
        "MATCHING",
        "DRIVER_ASSIGNED",
        "DRIVER_EN_ROUTE",
        "DRIVER_ARRIVED",
        "RIDE_STARTED",
        "RIDE_COMPLETED",
        "CANCELLED",
        name="ride_status",
    ).create(op.get_bind(), checkfirst=True)
    postgresql.ENUM("ON_DEMAND", "SCHEDULED", name="ride_type").create(op.get_bind(), checkfirst=True)
    postgresql.ENUM("PENDING", "ACCEPTED", "REJECTED", "EXPIRED", name="offer_status").create(op.get_bind(), checkfirst=True)
    postgresql.ENUM("RIDER", "DRIVER", "ADMIN", name="cancelled_by_actor").create(op.get_bind(), checkfirst=True)

    op.create_table(
        "riders",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=True),
        sa.Column("default_payment_method", sa.String(length=64), nullable=True),
        sa.Column("rating_avg", sa.Numeric(3, 2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "drivers",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=True),
        sa.Column("phone_number", sa.String(length=32), nullable=False),
        sa.Column("region_id", sa.UUID(), nullable=True),
        sa.Column("status", driver_status_enum, nullable=False),
        sa.Column("is_online", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("rating_avg", sa.Numeric(3, 2), nullable=True),
        sa.Column("total_rides_completed", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "vehicles",
        sa.Column("driver_id", sa.UUID(), nullable=False),
        sa.Column("make", sa.String(length=64), nullable=False),
        sa.Column("model", sa.String(length=64), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("color", sa.String(length=32), nullable=True),
        sa.Column("plate_number", sa.String(length=32), nullable=False),
        sa.Column("vehicle_type", sa.String(length=32), nullable=False),
        sa.Column("seat_capacity", sa.Integer(), nullable=False),
        sa.Column("fuel_type", sa.String(length=32), nullable=True),
        sa.Column("mileage_city", sa.Numeric(6, 2), nullable=True),
        sa.Column("mileage_highway", sa.Numeric(6, 2), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["driver_id"], ["marketplace_schema.drivers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "fare_estimates",
        sa.Column("ride_id", sa.UUID(), nullable=True),
        sa.Column("vehicle_type", sa.String(length=32), nullable=False),
        sa.Column("region_id", sa.UUID(), nullable=True),
        sa.Column("distance_miles", sa.Numeric(10, 2), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("base_fare", sa.Numeric(10, 2), nullable=False),
        sa.Column("distance_fare", sa.Numeric(10, 2), nullable=False),
        sa.Column("time_fare", sa.Numeric(10, 2), nullable=False),
        sa.Column("surge_multiplier", sa.Numeric(5, 2), nullable=False, server_default="1.00"),
        sa.Column("booking_fee", sa.Numeric(10, 2), nullable=False, server_default="0.00"),
        sa.Column("platform_fee", sa.Numeric(10, 2), nullable=False, server_default="0.00"),
        sa.Column("total_estimated_fare", sa.Numeric(10, 2), nullable=False),
        sa.Column("driver_payout_estimate", sa.Numeric(10, 2), nullable=True),
        sa.Column("pricing_snapshot", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "rides",
        sa.Column("rider_id", sa.UUID(), nullable=False),
        sa.Column("driver_id", sa.UUID(), nullable=True),
        sa.Column("vehicle_id", sa.UUID(), nullable=True),
        sa.Column("region_id", sa.UUID(), nullable=True),
        sa.Column("status", ride_status_enum, nullable=False),
        sa.Column("ride_type", ride_type_enum, nullable=False),
        sa.Column("pickup_address", sa.String(length=255), nullable=False),
        sa.Column("pickup_latitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("pickup_longitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("dropoff_address", sa.String(length=255), nullable=False),
        sa.Column("dropoff_latitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("dropoff_longitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("driver_en_route_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("driver_arrived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_by", cancelled_by_enum, nullable=True),
        sa.Column("cancel_reason", sa.Text(), nullable=True),
        sa.Column("estimated_distance_miles", sa.Numeric(10, 2), nullable=True),
        sa.Column("estimated_duration_minutes", sa.Integer(), nullable=True),
        sa.Column("actual_distance_miles", sa.Numeric(10, 2), nullable=True),
        sa.Column("actual_duration_minutes", sa.Integer(), nullable=True),
        sa.Column("fare_estimate_id", sa.UUID(), nullable=True),
        sa.Column("final_fare_amount", sa.Numeric(10, 2), nullable=True),
        sa.Column("driver_payout_amount", sa.Numeric(10, 2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["driver_id"], ["marketplace_schema.drivers.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["fare_estimate_id"], ["marketplace_schema.fare_estimates.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["rider_id"], ["marketplace_schema.riders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["marketplace_schema.vehicles.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "rider_saved_places",
        sa.Column("rider_id", sa.UUID(), nullable=False),
        sa.Column("label", sa.String(length=64), nullable=False),
        sa.Column("address_line", sa.String(length=255), nullable=False),
        sa.Column("latitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("longitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("place_provider_id", sa.String(length=128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["rider_id"], ["marketplace_schema.riders.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "ride_stops",
        sa.Column("ride_id", sa.UUID(), nullable=False),
        sa.Column("stop_order", sa.Integer(), nullable=False),
        sa.Column("address", sa.String(length=255), nullable=False),
        sa.Column("latitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("longitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["ride_id"], ["marketplace_schema.rides.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "ride_events",
        sa.Column("ride_id", sa.UUID(), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("event_payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["ride_id"], ["marketplace_schema.rides.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "driver_offers",
        sa.Column("ride_id", sa.UUID(), nullable=False),
        sa.Column("driver_id", sa.UUID(), nullable=False),
        sa.Column("offer_status", offer_status_enum, nullable=False),
        sa.Column("offered_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("responded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["driver_id"], ["marketplace_schema.drivers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ride_id"], ["marketplace_schema.rides.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "pricing_rate_cards",
        sa.Column("region_id", sa.UUID(), nullable=False),
        sa.Column("vehicle_type", sa.String(length=32), nullable=False),
        sa.Column("base_fare", sa.Numeric(10, 2), nullable=False),
        sa.Column("per_mile_rate", sa.Numeric(10, 4), nullable=False),
        sa.Column("per_minute_rate", sa.Numeric(10, 4), nullable=False),
        sa.Column("minimum_fare", sa.Numeric(10, 2), nullable=False),
        sa.Column("booking_fee", sa.Numeric(10, 2), nullable=False, server_default="0.00"),
        sa.Column("platform_fee", sa.Numeric(10, 2), nullable=False, server_default="0.00"),
        sa.Column("driver_payout_percent", sa.Numeric(5, 2), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("effective_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("effective_to", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "tracking_pings",
        sa.Column("ride_id", sa.UUID(), nullable=True),
        sa.Column("driver_id", sa.UUID(), nullable=False),
        sa.Column("latitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("longitude", sa.Numeric(10, 7), nullable=False),
        sa.Column("heading", sa.Numeric(6, 2), nullable=True),
        sa.Column("speed_mph", sa.Numeric(6, 2), nullable=True),
        sa.Column("accuracy_meters", sa.Numeric(6, 2), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["driver_id"], ["marketplace_schema.drivers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ride_id"], ["marketplace_schema.rides.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )
    op.create_table(
        "driver_availability_logs",
        sa.Column("driver_id", sa.UUID(), nullable=False),
        sa.Column("is_online", sa.Boolean(), nullable=False),
        sa.Column("is_available", sa.Boolean(), nullable=False),
        sa.Column("reason", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["driver_id"], ["marketplace_schema.drivers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="marketplace_schema",
    )


def downgrade() -> None:
    op.drop_table("driver_availability_logs", schema="marketplace_schema")
    op.drop_table("tracking_pings", schema="marketplace_schema")
    op.drop_table("pricing_rate_cards", schema="marketplace_schema")
    op.drop_table("driver_offers", schema="marketplace_schema")
    op.drop_table("ride_events", schema="marketplace_schema")
    op.drop_table("ride_stops", schema="marketplace_schema")
    op.drop_table("rider_saved_places", schema="marketplace_schema")
    op.drop_table("rides", schema="marketplace_schema")
    op.drop_table("fare_estimates", schema="marketplace_schema")
    op.drop_table("vehicles", schema="marketplace_schema")
    op.drop_table("drivers", schema="marketplace_schema")
    op.drop_table("riders", schema="marketplace_schema")
    postgresql.ENUM("RIDER", "DRIVER", "ADMIN", name="cancelled_by_actor").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM("PENDING", "ACCEPTED", "REJECTED", "EXPIRED", name="offer_status").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM("ON_DEMAND", "SCHEDULED", name="ride_type").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(
        "REQUESTED",
        "MATCHING",
        "DRIVER_ASSIGNED",
        "DRIVER_EN_ROUTE",
        "DRIVER_ARRIVED",
        "RIDE_STARTED",
        "RIDE_COMPLETED",
        "CANCELLED",
        name="ride_status",
    ).drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM("PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "INACTIVE", name="driver_status").drop(op.get_bind(), checkfirst=True)
