# RideConnect

RideConnect is a microservice-based ride-hailing MVP with:
- rider web app
- driver web app
- admin panel
- FastAPI backend services
- PostgreSQL
- Redis
- Docker Compose local runtime

This repo's active backend is under `services/*`.

The old `backend/` folder is legacy and is not used by the current Docker Compose stack.

## Product Docs

- [Product Requirements Document](/docs/PRD.md)
- [Software Requirements Document](/docs/SRD.md)
- [Test Login Credentials](/docs/test_login_credentials.md)

## Repo Structure

- `services/auth_service`: authentication, JWT, roles
- `services/marketplace_service`: rides, dispatch, pricing, tracking, receipts
- `services/operations_service`: onboarding, documents, admin workflows, alerts, audit logs
- `services/notification_service`: notification/event delivery foundation
- `gateway`: API gateway
- `frontend/rider_web`: rider app
- `frontend/driver_web`: driver app
- `frontend/admin_panel`: admin panel
- `infra`: bootstrap, migration, seed, and support scripts
- `shared`: shared Python utilities and schemas
- `docs`: product and technical documentation

## Prerequisites

Install these before first run:
- Git
- Docker Desktop
- Docker Compose

Recommended:
- Windows 10/11 with Docker Desktop using Linux containers

Before running the stack, make sure Docker Desktop is open and the engine is running.

## First Successful Run

### 1. Clone the repo

```powershell
git clone <your-repo-url>
cd rideconnect
```

### 2. Create the root environment file

If `.env` does not already exist, copy it from the example:

```powershell
Copy-Item .env.example .env
```

The default local values are already suitable for Docker Compose first run.

### 3. Start the full stack

For a normal first run:

```powershell
docker compose up -d --build --force-recreate
```

What happens automatically:
- Postgres starts
- Redis starts
- `bootstrap` waits for the database
- all Alembic migrations run
- schema drift is checked
- seed scripts run
- backend services start
- gateway starts
- rider, driver, and admin frontends start

### 4. Verify containers are healthy

```powershell
docker compose ps
```

You should see these core services up:
- `postgres`
- `redis`
- `bootstrap` as completed successfully
- `auth_service`
- `marketplace_service`
- `operations_service`
- `notification_service`
- `gateway`
- `rider_web`
- `driver_web`
- `admin_panel`

### 5. Open the apps

- Rider app: `http://localhost:3001`
- Driver app: `http://localhost:3002`
- Admin panel: `http://localhost:3003`
- API gateway health: `http://localhost:8000/health`

Optional direct service health endpoints:
- Auth: `http://localhost:8001/api/v1/health`
- Marketplace: `http://localhost:8002/api/v1/health`
- Operations: `http://localhost:8003/api/v1/health`
- Notification: `http://localhost:8004/api/v1/health`

## Seeded Login Credentials

These are created during bootstrap by `infra/scripts/seed_test_users.py`.

### Admin
- Email: `admin@rideconnect.com`
- Password: `ChangeMe123!`

### Rider
- Email: `rider@rideconnect.com`
- Password: `RiderPass123!`

### Driver
- Email: `driver@rideconnect.com`
- Password: `DriverPass123!`

Notes:
- the seeded driver is already approved
- the seeded driver has a vehicle
- the seeded driver is online and available for dispatch testing

## Fresh Database Reset

If you want a completely fresh local state:

```powershell
docker compose down -v
docker compose up -d --build --force-recreate
```

This removes:
- Postgres data
- Redis data
- stored operations media

## Rebuild Only One App or Service

### Rider web

```powershell
docker compose up -d --build --force-recreate rider_web
```

### Driver web

```powershell
docker compose up -d --build --force-recreate driver_web
```

### Admin panel

```powershell
docker compose up -d --build --force-recreate admin_panel
```

### Backend services

```powershell
docker compose up -d --build --force-recreate auth_service marketplace_service operations_service notification_service gateway
```

## Logs and Troubleshooting

### See all service status

```powershell
docker compose ps
```

### Follow all logs

```powershell
docker compose logs -f
```

### Check a specific service

```powershell
docker compose logs --tail=200 marketplace_service
docker compose logs --tail=200 operations_service
docker compose logs --tail=200 gateway
```

### If Docker is not running

If you see an error like:

```text
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

then Docker Desktop is not running. Start Docker Desktop first, then rerun:

```powershell
docker compose up -d --build --force-recreate
```

### If the browser shows stale UI

After rebuilding a frontend:
- hard refresh the browser
- if needed, clear site data/cache for the app origin

## Database and Media Notes

### PostgreSQL

Local host port:
- `55432`

### Redis

Local host port:
- `6379`

### Driver documents

Driver documents are stored in the `operations_media` Docker volume.

The database stores metadata and relative file paths, not blobs, for new uploads.

## Bootstrap and Migrations

Bootstrap entrypoint:
- [infra/scripts/bootstrap.sh](/infra/scripts/bootstrap.sh)

It runs:
1. DB wait
2. stale Alembic cleanup
3. all service migrations
4. schema drift check
5. seed scripts

Migration script:
- [infra/scripts/migrate_all.sh](/infra/scripts/migrate_all.sh)

Seed script:
- [infra/scripts/seed_all.sh](/infra/scripts/seed_all.sh)

## Manual Reseed

If you need to rerun the seeded users against an existing local DB:

```powershell
docker compose run --rm bootstrap sh -lc "python /app/infra/scripts/seed_test_users.py"
```

## Backend Tests

Current backend suites:

```powershell
pytest services/marketplace_service/tests -q
pytest services/operations_service/tests -q
```

These cover:
- onboarding
- document upload
- approval flow
- dispatch
- ride completion

## Current Runtime Ports

- `3001` rider web
- `3002` driver web
- `3003` admin panel
- `8000` gateway
- `8001` auth service
- `8002` marketplace service
- `8003` operations service
- `8004` notification service
- `55432` postgres
- `6379` redis

## Important Repo Truth

- use `services/*` for backend development
- use `frontend/rider_web`, `frontend/driver_web`, and `frontend/admin_panel` for the apps
- use `docs/PRD.md` and `docs/SRD.md` as the current requirements references
- do not use `backend/` for current runtime work
