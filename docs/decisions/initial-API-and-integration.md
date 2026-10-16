# Initial API / Integration Decisions

### Integration Boundary Strategy & Architectural Context
To support a decoupled client-server architecture while maintaining a zero-budget, low-overhead system boundary, CivicConnect rejects distributed microservice orchestrations (such as gRPC or Message Queues). Instead, the system establishes a proportionate, technology-agnostic Stateless RESTful API as the definitive communication boundary between the React frontend Single Page Application (SPA) and the Node.js backend monolith.

This RESTful boundary provides structural longevity: if the web-responsive client is extended into a native mobile application in the future, the backend integration interfaces remain completely unchanged.

Furthermore, this selection directly aligns with team capability and schedule risk mitigation. The developer team possesses substantial prior experience and higher comfort levels with RESTful integration patterns compared to distributed messaging protocols or RPC frameworks. Given the fixed, non-extendable academic delivery window for Milestone 2 and downstream construction phases, leveraging a highly familiar communication pattern ensures rapid interface baseline stabilization without risking development bottlenecks or configuration delays.

![API bounday diagram](api-boundary-diagram-1.svg)

### All network data transactions exchange strict JSON payloads over HTTPS. The initial core endpoints supporting the baselined Milestone 2 ticketing features are structured as follows:
- `POST /api/requests` (Submit Service Request)
	- Responsibility: Validates inbound payloads through the `RequestFactory` and commits new tickets to storage.
	- Payload: `{ "category": "Maintenance", "description": "Pipe leaking in laundry room", "location": "Unit 45" }`
	- Success Return (201 Created): Returns the full created entity containing system-generated tracking values (`id`, `referenceNumber`, `status: "New"`, `severity: "Low"`).
- `GET /api/requests/:id` (View Request Status/History)
	- Responsibility: Fetches a single request along with its chronological, non-destructive audit history log.
	- Success Return (200 OK): Nested JSON object reflecting current status and tracking arrays.
- `PUT /api/requests/:id/status` (Update Request Status)
	- Responsibility: Processes state changes (e.g., Assigned → In Progress) through transactional state-machine rules and fires local Observers.
	- Payload: `{ "status": "In Progress", "comment": "Plumber dispatched to site" }`
	- Success Return (200 OK): Updated request record confirming state mutation.

### Edge Security Boundary & Authorization Model
To satisfy the privacy requirements of ASR-1 (Authenticated Access to Personal/Unit Data), security is built directly into the integration boundary via stateless JSON Web Tokens (JWT).

- Token Transport: Clients must transmit a valid token inside the `Authorization: Bearer <JWT_TOKEN>` header for every operational endpoint.
- Edge Middleware: The API presentation layer intercepts incoming requests using an Express authentication middleware pipeline. Unauthenticated or malformed requests are terminated at the boundary, returning a `401 Unauthorized` or `403 Forbidden` response before reaching the inner service layers.
- Context Injection: Upon token validation, the middleware extracts the encrypted identity and role metadata (Resident, Staff, or Managing Agent) and injects it directly into the request execution context, ensuring the `submittedBy` data fields are structurally bulletproof.

### System Validation & Boundary Error Behaviors
The integration layer enforces strict input sanitization and schema verification before passing payloads downstream.
- Schema Enforcement: Missing mandatory parameters (such as category or description during submission) trigger an immediate 400 Bad Request containing an explicit validation payload outlining the missing fields.
- Structural Error Mappings: Internal exceptions are trapped gracefully to prevent runtime crash states or database leak exposures:

| HTTP Status Code | Scenario | Trigger Condition | Response Payload Example |
| :--- | :--- | :--- | :--- |
| **`400 Bad Request`** | Input Validation Failure | Missing mandatory field or invalid enum string supplied. | `{"error": "Validation Failed", "missing": ["location"]}` |
| **`401 Unauthorized`** | Missing Credentials | Request lack an explicit HTTP Authorization header entirely. | `{"error": "Authentication token required"}` |
| **`403 Forbidden`** | Privilege Violation | Resident attempts to call a staff-only status mutation endpoint. | `{"error": "Access Denied: Insufficient permissions"}` |
| **`404 Not Found`** | Missing Entity Target | Client requests a specific tracking ticket ID that does not exist in storage. | `{"error": "Requested ticket record not found"}` |
| **`422 Unprocessable`** | State Machine Violation | Staff member tries to move a ticket from "Closed" backward to "New". | `{"error": "Invalid state transition requested"}` |

### Localized Evolution & Future Versioning Strategy
Because the backend is configured as a monolithic runtime environment, changes to these interfaces do not cause distributed version synchronization errors across the network.

To protect existing frontend installations from breaking as development advances into Milestone 3 and 4, all core operational API contracts will follow a strict URI prefix path structure (`/api/v1/requests`). Any destructive modifications to the payload schemas or data structures will result in the deployment of an isolated `/api/v2/` routing tier, preserving backward compatibility for legacy system workflows.