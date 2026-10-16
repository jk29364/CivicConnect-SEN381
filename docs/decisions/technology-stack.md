# Technology-Stack Decision
This section documents the technical decisions governing the architecture of CivicConnect. All architectural layers have been evaluated against functional requirements (FRs), non-functional requirements (NFRs), team operational velocity, and project risks.

## Evaluation framework
To ensure objective selection, candidate components were assessed against six core structural dimensions:

| Dimension | Explanation |
| :--- | :--- |
|Team Capability & Velocity|Eliminating language context-switching and heavy framework configuration curves to maximize short-term feature delivery for a 3-person student team (Risk R-001 mitigations).|
|Cost & Licensing Bounds|Strict alignment with the R0.00 operational staging budget (Risk R-004) by relying exclusively on free cloud resource tiers and components utilizing permissive open-source licenses (MIT, Apache 2.0, PostgreSQL).|
|Data & Relational Integrity|Enforcing strict ACID transaction boundaries to prevent service-request status histories from ever being silently overwritten (NFR-004 / ASR-2).|
|Security & Dependency Surface|Providing reliable authentication middleware capabilities (NFR-001 / ASR-1) while maintaining managed, auditable dependency paths to minimize supply chain vulnerabilities (Risk R-005).|
|Maintainability & Ecosystem Risk|Ensuring high community adoption rates, comprehensive documentation, and predictable long-term support lifecycles.|
|Deployment Compatibility|Seamless execution across independent, decoupled hosting infrastructures without incurring runtime scaling fees or initialization execution caps.|

## Core Technology Stack Selection (ADR-STACK1)

| Layer | Options Evaluated | Selected Option | Decision Rationale & Trade-offs |
| :--- | :--- | :--- | :--- |
| **Frontend UI Layer** | • React.js<br>• Vanilla HTML/JS | **React.js (v19.x)** driven by the **Vite (v6.x)** build pipeline | **Rationale:** Maximizes development velocity by matching pre-existing team familiarity, directly preventing project schedule slippage within the fixed milestone window. Vite 6 provides highly efficient Hot Module Replacement (HMR) to optimize local developer cycles.<br><br>**Trade-off:** React 19 introduces potential breaking ecosystem library changes, requiring explicit dependency pinning. |
| **Backend Runtime Layer** | • Node.js / Express.js<br>• Java Web (Spring Boot)<br>• C# .NET Core | **Node.js (v24.x LTS)** with **Express.js (v4.21.x)** | **Rationale:** Standardizing on a unified, full-stack JavaScript runtime eliminates the cognitive load of language context-switching, directly mitigating the team capability risk (**Risk R-001**). Rejects the heavy configuration boilerplate and verbose syntax of enterprise platforms (Spring/C#) which add unnecessary friction for a 3-person student team.<br><br>**Trade-off:** Single-threaded execution loop requires structured, asynchronous programming discipline to maintain performance boundaries. |
| **Persistence Layer** | • PostgreSQL (Supabase)<br>• SQL | **PostgreSQL (v16.x)** hosted via **Supabase Cloud** | **Rationale:** Natively guarantees the strict relational integrity and ACID compliance required for the ticket status lifecycle and historical logs (**NFR-004 / ASR-2**). The Supabase free-tier satisfies the zero-cost staging mandate (**Risk R-004**).<br><br>**Trade-off:** Relational schema evolution demands formal data migration scripts, adding setup complexity compared to schemaless databases. |
| **Infrastructure & Compute** | • Render / Vercel Tiers | **Vercel (Hobby Tier)** & **Render (Free Tier)** web services | **Rationale:** Achieves absolute compliance with the R0.00 operational staging budget constraint by splitting concerns: Vercel handles static web bundles, while Render executes the application monolith containers.<br><br>**Trade-off:** Render's free tier spins down containers after 15 minutes of inactivity, causing an initial cold-start delay of up to 50 seconds. Mitigated via an automated cron-ping utility. |

# Structural Topology & Tooling Specifications

![diagram](tech-stack-topology-diagram.svg)

## Versioning, Compatibility, & Dependency Controls
- **Runtime Stability Target**: Node.js v24.x LTS is selected over odd-numbered current releases to guarantee a stable security patch lifecycle and continuous ecosystem support stretching past the project's evaluation timeline.
- **Build Optimization**: Vite (v6.x) replaces older, heavy Webpack configurations to provide near-instantaneous Hot Module Replacement (HMR) speeds, protecting local development velocity.
- **Wire-Compatibility Mapping**: Node runtime drivers utilize the pg client library configured specifically to target PostgreSQL v16.x native capabilities, preventing syntax mismatches or connection transaction drops during remote execution against Supabase instances.
- **Dependency Management**: npm (v11.x) coordinates package structures. To mitigate open-source supply chain vulnerabilities (Risk R-005), package installations across automated environments are strictly locked using verification flags (npm ci).

## Verification, Build, & Integration Tools
- **Automated Testing Harness**: Isolated unit components and pattern assertions (Factory and Observer boundaries) are validated via Jest (v29.x).
- **API Boundary Verification**: Decoupled HTTP interface endpoints are validated programmatically prior to interface completion using Supertest assertions.


## Architectural Trade-offs & Structural Mitigations


| Item | Trade-off | Mitigation |
| :--- | :--- | :--- |
| Cross-Origin Resource Sharing (CORS) Security Overheads | Separating the user interface (Vercel) from the backend service runtime (Render) maintains a clean separation of concerns and fulfills the zero-cost hosting constraint. However, it means the client must communicate across a network domain boundary, triggering browser CORS blocks. | The Express.js application engine explicitly embeds the native cors middleware at initialization. Acceptable ingress source domains are bound tightly to verified, non-wildcard configuration arrays driven by runtime environment parameters (process.env.ALLOWED_ORIGINS) to block unauthorized domain access (Risk R-009). |
| Compute Cold-Start Latencies on Ephemeral Free Tiers | Deploying the application monolith onto Render’s free tier web service eliminates infrastructure cost overheads. However, Render automatically spins down idle container processes after 15 minutes of inbound inactivity, imposing an initial cold-start delay of up to 50 seconds for the next request. | The React.js frontend interface incorporates optimistic UI state transitions and persistent loading components to manage the user experience. During critical stakeholder evaluation or milestone review windows, an automated external uptime cron workflow will hit the backend api health route (/api/health) every 14 minutes to keep the runtime container warm. |
| Open-Source Package Supply Chain Volatility | Relying on the vast Node.js / npm ecosystem maximizes feature scaffolding velocity and matches team capability constraints perfectly. However, it expands the application's attack surface due to deeply nested, third-party dependency trees that can introduce prototype pollution or remote execution exploits. | The team enforces protected branches via the repository governance policy. The GitHub Actions continuous integration pipeline executes an automated security gate (npm audit) on every active pull request, blocking branch merges if high or critical CVE vulnerabilities are detected. |