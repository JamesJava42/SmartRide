# SmartRide

SmartRide is a microservice-based ride platform with:

- `gateway` (public API entrypoint)
- `auth_service`
- `marketplace_service`
- `operations_service`
- `notification_service`
- web frontends in `frontend/`

## Local workflow

### 1) Start the full stack

```bash
docker compose up --build
```

The bootstrap container runs migrations and seed scripts before app services start.

### 2) Health checks

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health
curl http://localhost:8001/api/v1/health
curl http://localhost:8002/api/v1/health
curl http://localhost:8003/api/v1/health
curl http://localhost:8004/api/v1/health
```

### 3) Test signup and login

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"rider1@example.com","password":"Passw0rd!","role":"RIDER"}'

curl -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email_or_phone":"rider1@example.com","password":"Passw0rd!"}'
```

## Render deployment checklist (signup/signin failures)

If users cannot create accounts or sign in, verify these first:

1. **Use gateway as frontend API base URL**
   - Set frontend env `VITE_API_BASE_URL=https://<gateway-service>.onrender.com`.
   - Do not point rider web directly at `auth_service` unless you intentionally split API routing.

2. **Run migrations before web services are live**
   - Ensure bootstrap/migration job (`infra/scripts/bootstrap.sh`) has run successfully for the target database.

3. **Database URLs per service are set**
   - `AUTH_DATABASE_URL`, `MARKETPLACE_DATABASE_URL`, `OPERATIONS_DATABASE_URL`, `NOTIFICATION_DATABASE_URL`.

4. **CORS for direct auth-service calls**
   - If frontend calls `auth_service` directly (without gateway), configure:
     - `CORS_ALLOW_ORIGINS=https://<frontend>.onrender.com`
     - Multiple origins may be comma-separated.

5. **JWT values are aligned across services**
   - `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_ISSUER` must match where token verification occurs.

6. **Service-to-service URLs are reachable**
   - `AUTH_SERVICE_URL`, `MARKETPLACE_SERVICE_URL`, `OPERATIONS_SERVICE_URL`, `NOTIFICATION_SERVICE_URL` in gateway must resolve correctly.

## Notes on sockets/realtime

Current rider signup/signin flows are HTTP-based. The repository does not require browser WebSocket channels for account creation/login; auth paths are synchronous API requests.
