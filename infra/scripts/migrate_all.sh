#!/usr/bin/env sh
set -eu

cd /app/services/auth_service && alembic upgrade head
cd /app/services/operations_service && alembic upgrade head
cd /app/services/marketplace_service && alembic upgrade head
cd /app/services/notification_service && alembic upgrade head
