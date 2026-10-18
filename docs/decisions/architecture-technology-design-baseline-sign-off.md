# Architecture, Technology and Initial Design Baseline Sign-off

## Approval outcome

**Baseline: Milestone 2 architecture, technology and initial design.**  
**Outcome: ACCEPTED.**  
**Approval channel: team WhatsApp discussion during Milestone 2.**  
**Documentation update: recorded during finalisation on 18 October 2026.**

The team discussed and approved the CivicConnect architecture, technology and initial design baseline during Milestone 2. The sign-off was omitted from the PED at that time. This entry records that existing approval; it is not a new approval or a change to the original baseline. The approval history is recorded on Johni Kruger's confirmation of the team discussion.

## Approved baseline

| Baseline area | Approved decision | Supporting record |
| :--- | :--- | :--- |
| Architecture | Layered backend monolith with a separate frontend, with API, service and persistence responsibilities | ADR-ARCH-001 and the architecture diagram |
| Technology | JavaScript/Node.js and Express backend, React/Vite frontend, PostgreSQL persistence and the hosting topology proposed in the technology decision | ADR-STACK1 and technology-stack decision |
| Persistence | Relational request storage, optimistic concurrency control and atomic status-history updates | ADR-DATA-001 and data/persistence baseline |
| Request creation | Factory pattern for category-specific request construction and validation | ADR-DP-002 |
| Status-change reactions | Observer pattern to separate audit, notification and dashboard responsibilities | ADR-DP-001 |
| Integration | JSON REST interfaces with centralised authentication and role-based access boundaries | Initial API/integration decision |

## Team sign-off record

| Team member | Decision |
| :--- | :--- |
| Karabo Masoka (601644) | Approved |
| Jimmy Junior Baloyi (601713) | Approved | 
| Johni Kruger (601710) | Approved |
