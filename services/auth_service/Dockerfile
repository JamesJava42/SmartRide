FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY infra/requirements-base.txt /tmp/requirements-base.txt
RUN pip install --no-cache-dir -r /tmp/requirements-base.txt

COPY services/auth_service /app/services/auth_service
COPY shared /app/shared

WORKDIR /app/services/auth_service

CMD sh -c "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}"
