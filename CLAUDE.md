# RideConnect — Claude Code Quick Reference

## Stack
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2 (async), Alembic, PostgreSQL 16, Redis 7
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, React Query, React Router
- **Runtime:** Docker Compose (everything runs in containers — no local Python/Node needed)

## Project layout
```
services/          ← ALL backend work goes here (never backend/)
  auth_service/    ← JWT auth, roles
  marketplace_service/ ← rides, dispatch, pricing, tracking
  operations_service/  ← onboarding, KYC, admin workflows
  notification_service/ ← notifications
gateway/           ← API gateway (port 8000)
frontend/
  rider_web/       ← port 3001
  driver_web/      ← port 3002
  admin_panel/     ← port 3003
shared/python/     ← shared schemas, db base, enums, utils
infra/scripts/     ← bootstrap, migrate, seed scripts
docs/              ← PRD.md, SRD.md, API spec, architecture
```

## Essential commands

### Start / stop
```bash
docker compose up -d --build --force-recreate   # full start (builds everything)
docker compose down                              # stop (keep data)
docker compose down -v                           # stop + wipe all data
```

### Rebuild single service
```bash
docker compose up -d --build --force-recreate auth_service
docker compose up -d --build --force-recreate marketplace_service
docker compose up -d --build --force-recreate operations_service
docker compose up -d --build --force-recreate notification_service
docker compose up -d --build --force-recreate gateway
docker compose up -d --build --force-recreate rider_web driver_web admin_panel
```

### Logs
```bash
docker compose ps                              # status of all services
docker compose logs -f                         # stream all logs
docker compose logs --tail=200 <service>       # last 200 lines of one service
```

### Tests
```bash
pytest services/marketplace_service/tests -q
pytest services/operations_service/tests -q
pytest services/auth_service/tests -q
```

### Migrations (via Docker)
```bash
docker compose run --rm bootstrap sh -lc "bash /app/infra/scripts/migrate_all.sh"
```

### Re-seed data
```bash
docker compose run --rm bootstrap sh -lc "python /app/infra/scripts/seed_test_users.py"
docker compose run --rm bootstrap sh -lc "bash /app/infra/scripts/seed_all.sh"
```

## Service ports
| Service | URL |
|---------|-----|
| API Gateway | http://localhost:8000 |
| Auth service | http://localhost:8001 |
| Marketplace service | http://localhost:8002 |
| Operations service | http://localhost:8003 |
| Notification service | http://localhost:8004 |
| Rider web | http://localhost:3001 |
| Driver web | http://localhost:3002 |
| Admin panel | http://localhost:3003 |
| PostgreSQL | localhost:55432 |
| Redis | localhost:6379 |

## Health checks
```
http://localhost:8000/health
http://localhost:8001/api/v1/health
http://localhost:8002/api/v1/health
http://localhost:8003/api/v1/health
http://localhost:8004/api/v1/health
```

## Test credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rideconnect.com | ChangeMe123! |
| Rider | rider@rideconnect.com | RiderPass123! |
| Driver | driver@rideconnect.com | DriverPass123! |

## Architecture rules
- Backend code lives in `services/*` — never in `backend/`
- Each service has its own Alembic migrations under `services/<name>/alembic/`
- Shared Python utilities live in `shared/python/`
- `docs/PRD.md` and `docs/SRD.md` are the source of truth for requirements
- `.env` is pre-configured for Docker Compose — no edits needed for local dev

## Key docs
| File | Purpose |
|------|---------|
| `docs/PRD.md` | Product requirements |
| `docs/SRD.md` | Software requirements |
| `docs/rideconnect_api_contract_spec.md` | Full API contract |
| `docs/rideconnect_microservices_architecture_spec.md` | Architecture spec |
| `docs/rideconnect_service_db_schema_spec.md` | DB schema spec |
| `docs/rideconnect_implementation_roadmap.md` | Implementation roadmap |
| `docs/test_login_credentials.md` | Test credentials detail |
