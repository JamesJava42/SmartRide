# Contributing to RideConnect

## Prerequisites

Install these before anything else:

| Tool | Download | Why |
|------|----------|-----|
| **Docker Desktop** | https://www.docker.com/products/docker-desktop | Runs the entire stack |
| **Git** | https://git-scm.com | Version control |
| **VS Code** | https://code.visualstudio.com | Recommended editor |

> Python and Node.js are **not** needed on your machine — they run inside Docker containers.

---

## First-time setup

```bash
# 1. Clone
git clone https://github.com/samara5818/rideconnect.git
cd rideconnect

# 2. Open in VS Code (install recommended extensions when prompted)
code .

# 3. Start Docker Desktop, then launch the full stack
docker compose up -d --build --force-recreate

# 4. Verify all services are up
docker compose ps
```

That's it — the bootstrap container handles migrations and seeding automatically.

---

## Development workflow

### Backend (FastAPI / Python)

All backend services are in `services/`. Each follows the same pattern:

```
services/<name>_service/
  app/
    main.py       ← FastAPI app entry point
    config.py     ← Pydantic settings
    routes/       ← API routers
    models/       ← SQLAlchemy models
    schemas/      ← Pydantic request/response schemas
    crud/         ← Database operations
  alembic/        ← Migrations
  tests/          ← pytest tests
  requirements.txt
  Dockerfile
```

**Editing backend code:**
1. Edit files in `services/<name>_service/`
2. Rebuild that service: `docker compose up -d --build --force-recreate <service_name>`
3. Check logs: `docker compose logs --tail=100 <service_name>`

**Adding a migration:**
```bash
# Enter the service container
docker compose exec <service_name> bash

# Inside container
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

### Frontend (React / TypeScript)

Frontends are in `frontend/`:
- `rider_web/` → Rider app (port 3001)
- `driver_web/` → Driver app (port 3002)
- `admin_panel/` → Admin panel (port 3003)

Each uses Vite + React + TailwindCSS. After editing:
```bash
docker compose up -d --build --force-recreate rider_web   # or driver_web / admin_panel
```

Do a hard refresh in your browser after rebuild (Ctrl+Shift+R).

---

## Running tests

```bash
# Marketplace service
pytest services/marketplace_service/tests -q

# Operations service
pytest services/operations_service/tests -q

# Auth service
pytest services/auth_service/tests -q
```

Tests require the stack to be running (they connect to the real database).

---

## Branching

- Branch from `main`
- Branch names: `feature/<short-description>` or `fix/<short-description>`
- Keep PRs focused — one feature or fix per PR

---

## Key rules

- **Never** put backend code in `backend/` — use `services/*` only
- Shared Python code goes in `shared/python/`
- `docs/PRD.md` and `docs/SRD.md` define requirements — check them before adding features
- The `.env` file is pre-configured for local Docker — don't change it unless you know why

---

## Quick links

| Resource | Path |
|----------|------|
| Architecture overview | `docs/rideconnect_microservices_architecture_spec.md` |
| API contract | `docs/rideconnect_api_contract_spec.md` |
| DB schema | `docs/rideconnect_service_db_schema_spec.md` |
| Implementation roadmap | `docs/rideconnect_implementation_roadmap.md` |
| UX blueprint | `docs/rideconnect_ux_blueprint.md` |
| Test credentials | `docs/test_login_credentials.md` |
