## Test design and results for factory unit tests
This document records the design and results of the unit-level verification of the request-creation logic (RequestFactory, ADR-DRP-002), which supports FR-001 and FR-011. Each test documented (RF-01 to RF-10) states its engineering basis, the reason for selection, and the technique used (mainly equivalence partitioning) and aspecific input. The expected result was derived from the requirements, acceptance criteria and design decisions and was written and committed before the tests were executed, so a result is evidence only if it could have failed. Where a test rests on a team rule not yet in the baseline Milestone 1 requirements, this is stated and logged as a clarification. Actual results are recorded separately with an interpretation of what each result demonstrates and what it does not prove.These tests verify factory behaviour only, so FR-001 and FR-011 are recorded as partially verified until integration and E2E evidence.

### Table A: test design (RF-01 to RF-10)
ID | Basis (type) | Why selected | Technique and partition | Input | Expected result |
| --- | --- | --- | --- | --- | --- | 
RF-01 | FR-001 Acceptance Criteria (AC): "creates a request with status "New" ...and default severity "Low" unless otherwise selected (**Req**) | Core success path. The default is what staff see first. | Equivalence Partitioning (EP): valid request, severity omitted | Maintenance; description, location, faultType set; no severity | Accepted; category **Maintenance**; status **New**; severity **Low** |
RF-02 | FR-011: "set or view a severity flag (Low/Medium/High)" (**Req**, partial: its AC about visual distinction is not tested here) | High-priority requirement. Losing a High flag defeats the prioritisation purpose behind ASR-3 | Equivalence Partitioning (EP): valid explicit severity | Maintenance request with severity **High** | Accepted; severity stays **High** |
RF-03 | FR-011: the valid values are Low/Medium/High (**Req**) | HKeeps junk severity values out of storage and the staff queue | Equivalence Partitioning (EP): invalid severity value | Maintenance request with severity **Urgent** | Rejected with a ValidationError naming **severity**; no request created |
RF-04 | ADR-DP-002 category-specific validation; **faultType** is not in Milestone 1 (**Assumption**) | A missing mandatory category field is the commonest bad submission | Equivalence Partitioning (EP): missing category-specific field | Maintenance; description and location set; no faultType | Rejected with a ValidationError naming **faultType** |
RF-05 | Team rule: an incident time cannot be in the future (**Assumption**) | Negative case on a safety category; bad times corrupt the incident record | Equivalence Partitioning (EP): invalid (future) date | Security; incidentTime = now + 24 h; threatLevel set; common fields valid | Rejected with a ValidationError naming **incidentTime** |
RF-06 | Team rule: Common Area requests need **areaName** (**Assumption**) | Negative case for another category-specific rule | Equivalence Partitioning (EP): missing category-specific field | Common Area; description and location set; no areaName | Rejected with a ValidationError naming **areaName** |
RF-07 | FR-001: category is one of "Maintenance/Security/Common Area/Lost Property (**Req**); **itemName** and **dateLastSeen** are team rules (**Assumption**) | Confirms the fouth category works through the factory | Equivalence Partitioning (EP): valid Lost Property | itemName **keys**; dateLastSeen **2020-01-01**; description and location set | Accepted; category **Lost Property**; status **New** |
RF-08 | FR-001: category must be one of the four listed (**Req**) | Unsupported categories must not enter the system | Equivalence Partitioning (EP): invalid category | Category **Pets**; common fields valid | Rejected with a ValidationError naming **unknown category** |
RF-09 | FR-001 AC: "with category description and unit/location completed" (**Req**) | The mandatory common field applies to every category. This test comes from satisfying the AC and exposed a real defect, because the code originally enforced location only for Maintenance | Equivalence Partitioning (EP): missing mandatory common field (location) | Common Area; description and areaName set; no location | Rejected with a ValidationError naming **location** |
RF-10 | FR-001 AC: description must be "completed" (**Req**) | The second mandatory common field. Whitespace-only counts as not completed | Equivalence Partitioning (EP): blank mandatory field (description) | Maintenance; description **" "**; location and faultType set | Rejected wit a ValidationError naming "description" |

These tests verify creation and validation at factory level only. “Unique reference number” (FR-001) and “visually distinguished in the staff queue” (FR-011) are not verified here; they need persistence, API and UI evidence.

## Actual testing of tests in Table A (actual results)
Upon seeing the specified tests in Table A, here are the following results of the tests, and log any failures and reason for failures:

✔ RF-01: valid Maintenance request gets default severity Low and status New (3.4874ms)
✔ RF-02: explicit severity High is preserved (0.2503ms)
✔ RF-03: severity outside Low/Medium/High is rejected (0.4386ms)
✔ RF-04: Maintenance request without faultType is rejected(0.1133ms)
✔ RF-05: Security request with a future incidentTime is rejected (0.8656ms)
✔ RF-06: Common Area request without areaName is rejected (0.1887ms)
✔ RF-07: valid Lost Property request is created (0.1693ms)
✖ RF-08: unknown category is rejected (1.7738ms)
✔ RF-09: request without location is rejected for any category (0.225ms)
✔ RF-10: request with blank description is rejected (0.2942ms)
ℹ tests 10
ℹ suites 0
ℹ pass 9
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 638.9206

✖ failing tests:

test at test\requestFactory.test.js:52:1
✖ RF-08: unknown category is rejected (1.7738ms)

### Logging of failed test 
RF-08 failed because it looks for "unknown category" in lowercase. The code's message is "Unknown category: Pets", and "includes" is case sensitive
**Fix to ensure test pass**: change the search text to "Unknown category". After that, all 10 pass with both **node --test test/requestFactory.test.js** and the plain **node --test** that **npm test** runs.

## Indication of results after "Unknown category" fix
✔ RF-01: valid Maintenance request gets default severity Low and status New (2.2709ms)
✔ RF-02: explicit severity High is preserved (0.1572ms)
✔ RF-03: severity outside Low/Medium/High is rejected (0.5815ms)
✔ RF-04: Maintenance request without faultType is rejected(0.1761ms)
✔ RF-05: Security request with a future incidentTime is rejected (2.1514ms)
✔ RF-06: Common Area request without areaName is rejected (0.6369ms)
✔ RF-07: valid Lost Property request is created (0.4415ms)
✔ RF-08: Unknown category is rejected (0.1584ms)
✔ RF-09: request without location is rejected for any category (0.1845ms)
✔ RF-10: request with blank description is rejected (0.2389ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 200.8882

### Table B: results (after npm test)
ID | Actual result | Status | Interpretation (what it shows, and what it does not prove) |
| --- | --- | --- | --- | 
RF-01 | valid Maintenance request gets default severity Low and status New (2.2709ms) | Pass | Shows the factory applies the default and initial state. Does not prove they are saved or displayed. |
RF-02 | explicit severity High is preserved (0.1572ms) | Pass | Shows an explicit High survives creation. Does not prove it is stored or highlighted in the staff queue (FR-011 AC, NFR-002). | 
RF-03 | severity outside Low/Medium/High is rejected (0.5815ms) | Pass | Shows invalid severities are rejected at creation. Does not prove other routes (for example direct DB writes) are protected. |
RF-04 | Maintenance request without faultType is rejected(0.1761ms) | Pass | Shows one missing-field rule works. Does not cover other missing fields or wrong types | 
RF-05 | Security request with a future incidentTime is rejected (2.1514ms) | Pass | Shows a future time is rejected. Does not test time zones or the exact boundary. | 
RF-06 | Common Area request without areaName is rejected (0.6369ms) | Pass | Shows the rule for one missing field. Rests on an assumption, not an M1 requirement.|
RF-07 | valid Lost Property request is created (0.4415ms) | Pass | Shows a valid Lost Property request passes. Does not prove the proposed fields suit residents. |
RF-08 | Unknown category is rejected (0.1584ms) | Pass | Shows unknown categories are rejected. Does not prove the API returns 400 (needs an integration test). |
RF-09 | request without location is rejected for any category (0.1845ms) | Pass | Shows location is enforced for every category (FR-001 AC). Found a defect, now fixed. |
RF-10 | request with blank description is rejected (0.2389ms) | Pass | Shows blank descriptions are rejected. Does not test other invalid text. |