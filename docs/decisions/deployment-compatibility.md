# Deployment Compatibility

CivicConnect's layered monolith is designed to run as a single Node.js web service, with PostgreSQL providing persistent storage independently of the application process. Under ADR-STACK1, the intended hosting arrangement is a React/Vite frontend on Vercel, an Express backend on Render, and a PostgreSQL database on Supabase. This separation supports the R0.00 staging budget and allows each component to be deployed without changing the Factory, Observer, or service-layer design. The current presentation checkout includes both backend and frontend; the proposed cloud hosting arrangement remains a target rather than evidence of a completed cloud release. The reported demonstration is local.

## Runtime and Platform Compatibility

| Component | Deployment requirement | Compatibility position |
| :--- | :--- | :--- |
| Backend runtime | Node.js 24, matching the GitHub Actions configuration | The application uses ECMAScript modules through `"type": "module"`. Local imports must retain their exact filename case and `.js` extensions for compatibility with Linux hosting. |
| Dependency installation | Install the committed dependency set with `npm ci` | `package-lock.json` provides reproducible dependency resolution. The installed Express dependency is currently `^5.2.1`; the earlier Express 4.21.x selection in ADR-STACK1 requires reconciliation with this implementation baseline. |
| Application startup | Run `npm start` from the repository root | This starts `src/server.js`. No transpilation or backend build command is required. The server reads the host-provided `PORT`, defaulting to `3000` locally. |
| Database | A reachable PostgreSQL instance with the CivicConnect schema | The `pg` connection pool reads `DATABASE_URL`. Supabase is the selected host, while PostgreSQL 16.x remains the documented database target; the actual hosted version must be recorded during deployment verification. |
| Frontend | A separately built React/Vite application configured with the backend's public HTTPS address | The frontend is now included under frontend/. Full UI acceptance and browser timing remain incomplete in the updated linkage record; hosted compatibility is not established by the local demo. |

The backend does not require a Windows-specific service, a local database file, or a shared filesystem. Persistent request records and audit history reside in PostgreSQL and therefore survive application restarts and redeployments. A Docker image is not required by the current startup process, and no container configuration is supplied in this baseline.

## Environment Configuration and Integration Boundaries

Deployment configuration must be supplied through the hosting environment rather than committed credentials.

| Setting | Purpose and deployment requirement |
| :--- | :--- |
| `PORT` | Allows the hosting platform to assign the web-service listening port. |
| `DATABASE_URL` | Supplies the PostgreSQL connection URI. Credentials containing reserved URI characters must be URL-encoded. The chosen database endpoint must be reachable from the backend host. |
| `JWT_SECRET` | Supplies the secret used by the existing JWT-verification middleware. A compatible token issuer must use the expected signing configuration and user claims. The presentation build now provides login/register routes and signed tokens. This later implementation does not retrospectively verify earlier login test claims; deployment still requires compatible account/schema configuration. |

Browser-to-API communication must use HTTPS and the implemented `/api/requests` routes. The `/api/v1/requests` prefix described in the earlier integration design is not currently implemented; frontend configuration and deployment checks must use the actual route contract until versioned routing is introduced through a controlled change.

The application currently enables CORS through `cors()` without an origin restriction. The `ALLOWED_ORIGINS` allow-list described in ADR-STACK1 is therefore a planned control, not an active environment setting. Before release beyond controlled evaluation, the backend must enforce the approved frontend origins. JWT verification and role checks remain necessary regardless of CORS configuration (ASR-1).

The database connection currently enables TLS with `rejectUnauthorized: false`. This permits encrypted connections but does not verify the server certificate. Deployment hardening must configure certificate verification using the database provider's supported trust configuration and confirm successful connectivity.

## Database Preparation and Release Verification

For a fresh, empty database, `npm run db:migrate` applies the initial schema and request-filter indexes. For an existing database containing the initial schema, `npm run db:indexes` applies the supplementary indexes. The full migration command must not be treated as a safe, repeatable upgrade command: the runner has no migration-history tracking or automatic rollback facility. Existing data must be backed up before schema changes, with restoration verified separately.

GitHub Actions runs `npm ci`, `npm test`, and a separate `npm audit --audit-level=high` check on pushes and pull requests using Node.js 24 on Linux. These checks support runtime and dependency compatibility, but do not deploy the service or prove connectivity to the hosted database. Required branch-protection checks must be configured separately if failed CI is to block merging.

A deployment is accepted only after the following checks have recorded results:

1. The selected revision installs and passes the automated test and dependency-security checks.
2. The service starts on the assigned port, and `GET /api/health` returns HTTP 200. This endpoint confirms that the HTTP service responds; it does not query the database.
3. Authenticated requests can create, list, retrieve, and update records against the deployed PostgreSQL schema, while unauthenticated and unauthorised operations are rejected.
4. Status updates preserve atomic audit history and reject stale versions through optimistic concurrency control (ASR-2).
5. The integrated frontend can reach the API over HTTPS, with the intended origin policy and compatible JWTs.
6. Representative performance checks record warm-service response times and any cold-start delay separately against NFR-005. An API-only measurement does not establish the complete browser list-view loading time.

## Hosting Constraints and Residual Risk

The selected free-tier topology introduces provider availability, resource, connection, and idle-service constraints. These must be checked against the hosting accounts at deployment time; the architecture does not establish an availability guarantee or guarantee that cold starts meet the provisional three-second list-view target. Any keep-alive scheduling described elsewhere in the PED remains a proposed operational measure until configured and verified.

Redeployment must preserve the external database and use an application revision compatible with its schema. Recovery requires both a known working application revision and a verified database backup; reverting application code alone cannot reverse a schema change. These controls address deployment drift (RSK-M3-03), the hosting-budget risk (R-004), and the deployment and recovery concerns recorded under FEC-02 and FEC-07.

The current baseline demonstrates a deployable backend structure and Linux CI configuration. Cloud deployment evidence, full frontend acceptance, restricted CORS, database certificate verification and operational recovery considerations remain unresolved. The 19 October linkage record reports stronger live backend evidence, not production readiness. A new recovery platform is not a blanket M4 requirement.
