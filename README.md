# CivicConnect Core API (Wonderpark Estates)

**Course:** SEN381 — Milestone 3 core request journey (built on the Milestone 2 foundation)  
**System:** Residential service ticketing backend (Node.js / Express / PostgreSQL)

CivicConnect manages resident fault and service requests for Wonderpark Estates.
Its layered monolith uses the existing **RequestFactory** for category-specific
validation and an **Observer** for transaction-bound status audit history.

## Getting started

```sh
npm ci
cp .env.example .env
# Edit .env: supply DATABASE_URL and JWT_SECRET.
npm run db:migrate      # ONLY on a fresh/empty database
# OR, on an existing database:
# npm run db:indexes
npm start
```

The API listens on port `3000` unless `PORT` is set. `GET /api/health`
can be used without authentication to check that the server is running.
The four request endpoints require a verified Bearer JWT with a valid user ID and
role. See **[REQUEST_API_IMPLEMENTATION.md](REQUEST_API_IMPLEMENTATION.md)** for
full contract details, example requests, filter parameters and response codes.

## Request API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/requests` | Resident creates a request and receives a reference number |
| `GET` | `/api/requests` | Request list; search/filter/sort with role-based data scoping |
| `GET` | `/api/requests/:id` | One request and its status history |
| `PUT` | `/api/requests/:id/status` | Staff/agent updates status with OCC version checking |

To run all tests (including an ephemeral HTTP server and mocked persistence):

```sh
npm test
```

`npm run test:unit` runs controller and service-level tests without HTTP.
The package deliberately excludes `node_modules` and secrets.

**Note:** The original Milestone 2 repository did not contain a login/token-issuing
endpoint. This issue uses the existing JWT-verification middleware rather than
adding an unrelated authentication provider or login flow.
