Problem Statement
Wonderpark Estates Residential Complex currently manages resident service requests maintenance faults (plumbing, electrical and lifts), security concerns (broken gates, faulty cameras, suspicious activity), common-area issues (pool, garden, parking), and lost property - through a fragmented mix of WhatsApp messages to the managing agent, phone calls to the security desk, and handwritten logs at the guardhouse. This issue causes requests to be duplicated, forgotten, or routed to the wrong person; residents have no way to check whether a reported issue is being handled; the managing agent struggles to prioritise urgent safety issues (such as a broken perimeter gate) over cosmetic issues (e.g. a garden hose left out); and management have no reliable record for accountability, budgeting or reporting to the body corporate at AGMs.

CivicConnect will give Wonderpark Estates a single controlled platform for residents, security and maintenance staff, and management to submit, track, and resolve service requests - improving response time on safety-relevant issues, giving residents visibility, and giving management defensible reporting data.

Business Value - faster resolution of safety-critical issues, an auditable record for body corporate accountability and levy-funded maintenance decisions, reduced friction for residents, clearer workload visibility for maintenance and security staff.

Stakeholder Analysis
Stakeholder | Role/Interest | Influence | Key Needs |
| --- | --- | --- | --- |
Resident/Homeowner | Submits requests, wants issues fixed | Medium | Easy submission, status visibility, timely feedback
Tenant (renting resident) | Same as resident, but may need landlord or agent involved | Low-Medium | Same as above, plus clarity on who is responsible for what (owner vs body corporate)
Security Guard/Staff | Logs incidents at the gate, first point  of contact for many issues | Medium | Quick loging on shift, clear escalation path for urgent items
Maintenance Staff | Resolves physical faults (plumbing, electrical, common areas) | Medium | Clear queue, priority/location info, ability to close out jobs
Managing agent/Trustee | Oversight, budgeting, accountability to body corporate | High | Reporting on open/overdue/resolved, cost visibility, audit trail
Body corporate/Trustee Committee (indirect stakeholder) | Approves budget, reviews management performance | High (indirect) | Periodic reporting; not a daily platform user

Scope Baseline
In Scope
Residents submit service requests with category (Maintenance / Security / Common Area / Lost Property), description, and unit/location.
Residents view status and full history of their own submitted requests.
Security/Maintenance staff view, filter, and sort requests relevant to them.
Staff assign/accept ownership of a request.
Staff update request status through controlled transitions (New -> Assigned -> In progress -> Resolved -> Closed)
Staff record comments/actions taken on a request
Requests carry a category and severity flag (Low/Medium/High) to distinguish safety-critical issues (broekn gate, faulty intercom) from routine ones (garden light out)
Managing Agent view open/overdue/resolved/closed counts by category and severity
Managing Agent view request history for reporting purposes (e.g. body corporate AGM reporting)
Unique reference number generated per request.

Out of Scope
Native mobile app (web-responsive only)
Levy/payment queries or any financial transactio handling
Integration with external estate access-control/boom-gate hardware
SMS notifications (in-app/email only)
Visitor/guest management (separate concern from service requests)

Future Scope
Multi-tenant support for multiple residential complexes under different managing agents.
Automated request routing or AI based categorisation
SLA-based auto-escalation of overdue high-severity requests.
Resident-facing analytics/dashboard beyond basic status/history view

Requirements Set
ID | Type | Requirement | Source | Priority | Baseline Note
| --- | --- | --- | --- | --- | --- |
FR-001 | Functional | Resident shall submit a request with category (Mainenance/Security/Common Area/Lost Property), description, and unit/location | Resident capability | High
FR-002 | Functional | Security/Maintenance staff shall update request status through defined transitions | Staff capability | High
FR-003 | Functional | Resident shall view status and history of their own submitted requests | Resident capability | High
FR-004 | Functional | System shall notify resident in-app when their request's status changes | Resident capability ("meaningful feedback") | Medium
FR-005 | Functional | Staff shall search/filter/sort requests by category, severity, status, date, or assignee | Staff capability | High
FR-006 | Functional | Staff shall assign or accept ownership of a request | Staff capability | High
FR-007 | Functional | Staff shall record comment/actions taken on a request | Staff capability | Medium
FR-008 | Functional | Managing Agent shall view counts of open/overdue/resolved/closed requests | Management capability | High
FR-009 | Functional | Managing Agent shall view requests grouped by category and severity | Management capability | Medium
FR-010 | Functional | System shall assign a unique reference number to every submitted request | Implied (traceability) | High
FR-011 | Functional | Resident/Staff shall set or view a severity flag (Low/Medium/High) on a request | Business need (prioritisation, from stakeholder conflict) | High | Updated (M2)
NFR-001 | Security | Only authenticated residents/staff shall access request details containing unit numbers or personal info | Security constraint | High
NFR-002 | Reliability | Safety-critical requests (e.g. broken perimeter security) flagged "High" severity shall be visibly distinguised from routine requests in the staff queue | Business need (prioritisation) | High | Updated (M2)
NFR-003 | Usability | A first-time resident shall submit a request in under 3 minutes | Business Need | Medium
NFR-004 | Reliability | Request status changes shall never be silently overwritten - history preserved | Accountability need | High
NFR-005 | Performance | Request list views shall load within 3 seconds under normal load (indicative - refine once hosting is chosen) | Quality constraint | Low | Pending - see §5.5 
NFR-006 | Maintainability | Data model shall associate all requests/users with a single complex entity, to avoid architectural reqork if multi-tenant support is added later | Forward Engineering Consideration (deferred multi-tenancy) | Medium | Pending - see §5.4

Acceptance Criteria
FR-001: Given a logged-in resident, when they submit a request with category, description and unit/location completed, then the system creates a request with status "New", a unique reference number, and deault severity "Low" unless otherwise selected.
FR-002: Given a request assigned to a staff member, when they select a valid next status, then the system updates the status and records the timestamp and user who made the change.
FR-003: Given a logged-in resident, when they open "My Requests", then they see all their submitted requests with current status and a chronological history of changes.
FR-004: Given a request whose status changes, when the change is saved, then the submitting resident receives an in-app notification within the same session or on next login.
FR-005: Given a staff member viewing the request queue, when they apply a filter (e.g. severity = High), then only matching requests are displayed.
FR-006: Given an unassigned request, when an authorised staff member selects "Accept", then the request's assignee field updates and it no longer appears in the unassigned queue.
FR-007: Given an assigned request, when staff add a comment or action note, then it is appended to the request's visible history with timestamp and author.
FR-008: Given a managing agent viewing the dashboard, when they select a date range, then counts of open/overdue/resolved/closed requests for that range are displayed.
FR-009: Given a managing agent viewing the requests view, when they select "Group by category" or "Group by severity", then requests are displayed grouped under the selected with counts per group.
FR-010: Given any new request submission, when it is saved, then the system generates a reference number unique across all requests.
FR-011: Given a resident or staff member creating/editing a request, when they set severity to High, then the request is visually distinguished (e.g. flagged/highlighted) in the staff queue.
NFR-001: Given an unauthenticated user, when they attemt to access a request detail page directl by URL, then the system denies access and redirects to login.
(didn't Add acceptance criteria of NFR-002 - overlaps with FR-011)
NFR-003: Given a first-time resident with no prior training, when they submit a request from landing on the submission form to confirmation, then the process shall take under 3 minutes in a usability test with a representative user.
NFR-004: Given a request whose status is changed, when the change is saved, then the previous status and timestamp remain visible in the request's history log (not deleted or overwritten).
NFR-005: Given a request list view is loaded under normal conditions (e.g. up to 200 active requests), when a user navigates to it, then the page shall render within 3 seconds.

Requirements Traceability Matrix (RTM)
Req ID | Source/Stakeholder | Acceptance Criteria | Design (to be determined) | Test (to be determined) | Status
| --- | --- | --- | --- | --- | --- |
FR-001 | Resident | Drafted | - | - | Baselined
FR-002 | Staff | Drafted | - | - | Baselined
FR-003 | Resident | Drafted | - | - | Baselined
FR-004 | Resident (feedback need) | Drafted | - | - | Baselined
FR-005 | Staff | Drafted | - | - | Baselined
FR-006 | Staff | Drafted | - | - | Baselined
FR-007 | Staff | Drafted | - | - | Baselined
FR-008 | Managing Agent | Drafted | - | - | Baselined
FR-009 | Managing Agent | Drafted | - | - | Baselined
FR-010 | Implied (traceability) | Drafted | - | - | Baselined
FR-011 | Business Need (stakeholder conflict) | Drafted | - | - | Baselined
NFR-001 | Security constraint | Drafted | - | - | Baselined
NFR-002 | Business need | Drafted | - | - | overlaps with FR-011
NFR-003 | Business need | Drafted | - | - | Baselined
NFR-004 | Accountability need | Drafted | - | - | Baselined
NFR-005 | Quality need | Drafted | - | - | Baselined
NFR-006 | Forward Engineering Consideration | still needed | - | - | Draft