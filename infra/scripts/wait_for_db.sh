#!/usr/bin/env sh
set -eu

host="${POSTGRES_HOST:-postgres}"
port="${POSTGRES_PORT:-5432}"

until nc -z "$host" "$port"; do
  echo "Waiting for PostgreSQL at $host:$port..."
  sleep 2
done
