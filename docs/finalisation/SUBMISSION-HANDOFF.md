# Submission Handoff

The ready-to-insert closing text is `PED-v4-closure.md`. It continues the existing PED; it is not a replacement project report. The Word document has not been edited because it is open and the closure must still be reconciled with incoming frontend work.

## Immediate PED edits

1. Save the current PED v3.0 as the continuing v4.0 Final document. Its existing cover still says v2.0; update the cover, milestone number, version history and submission date. Preserve the earlier baseline history.
2. Insert `../decisions/deployment-compatibility.md` at the currently blank Deployment Compatibility section.
3. Use `PED-v4-closure.md` to update the existing RTM implementation/verification/status fields and add the closing scope, release, reflection and evidence sections. Keep the original requirements and design columns.
4. Reconcile historical login/admin PASS claims with the tested revision. They do not describe the current routes. Keep the correction note visible rather than leaving an unqualified claim that all authentication acceptance criteria are met.
5. Confirm the five **[TEAM CONFIRM]** fields, update frontend acceptance rows and recompute completion from the approved M1 baseline. The 28.125% describes the historical backend-only review; replace it with the verified merged-product result, not an assumed frontend score.
6. Refresh the table of contents, check page breaks/tables and export the submission PDF. Read the first and final pages and check that all inserted tables are visible.

## Facts only the team can finish

- Final frozen commit/tag after integrated work is reviewed and included.
- Actual submission date, frontend address and the evaluation/staging database identity; never publish credentials.
- Results of the combined frontend/backend/database journeys and any genuine stakeholder feedback.
- Applicable approved M1 acceptance-criterion denominator and genuine change/approval references.
- Adoption or correction of the proposed production no-go decision.
- Any actual schedule dates, spending, PR/CI links and review approvals relied on in the final conclusion.

## Final demo focus

Show one resident submitting a request and receiving a reference; show staff finding it and making a valid status update; show the resident's history. Demonstrate denied access and stale-version handling if the final setup supports them. Do not imply that setting status to Assigned assigns a staff owner.

The current API has no login issuer. Agree a valid identity setup with the frontend developer. Keep signing secrets on the server; never solve integration by putting `JWT_SECRET` in frontend code.

The default list returns 100 records and caps results at 200. Do not calculate whole-dataset dashboard counts from one truncated response. Actual status values include `InProgress`; routes use `/api/requests`.

## Controlled submission

The master brief requires substantive changes to enter the controlled branch through a PR with two independent team-member approvals. These files are prepared locally; no commit, approval, push or merge is claimed. Review these documentation changes and retain authentic review evidence. Finish the new AI-use declaration using the existing declarations workflow; the new entry has no fabricated signature or approval.

Submit the continuing PED v4.0 Final, repository URL, exact release identifier and required access details. Keep evidence in the repository and link it from the PED; do not create a separate source ZIP unless specifically required.

## Individual defence prompts

Each member should locate one authentic contribution/PR, trace one original requirement to code and evidence, explain one decision consequence, and name one limitation. The 42 passing tests do not establish live database correctness or complete stakeholder acceptance. The local demo and production no-go must be described accurately.
