# Claims Management Test Cases

> **Template note:** No assessment brief or supplied test-case template was
> present in the inspected workspace. This document uses a self-created
> replacement template based on the checklist requirements; it is not presented
> as the supplied original. Exact compliance with the unavailable template
> cannot be verified.

> **Automation alignment:** There are two functional automation suites:
> **UI** (7 Claims workflow cases, within the requested 5–10) and **API**
> (8 cases). The two auth-session tests are supporting setup checks, not
> counted as Claims workflow cases. Each automated case below uses the exact
> Playwright `test()` title as its case heading. The UI workflow suite includes
> positive and negative scenarios.

## Functional Test Suite 1 — UI test cases

### Automation and execution status

All seven Claims UI workflow cases below are automated with matching Playwright
test titles. The latest UI run on 2026-11-24 passed all 9 UI-project tests
(seven workflows and two authentication setup checks). An earlier attempt
before the account environment variables were configured stopped at setup.

| Case | Automated | Latest UI run |
|---|---|---|
| TC-UI-001 | Yes | Passed |
| TC-UI-002 | Yes | Passed |
| TC-UI-003 | Yes | Passed |
| TC-UI-004 | Yes | Passed |
| TC-UI-005 | Yes | Passed |
| TC-UI-006 | Yes | Passed |
| TC-UI-007 | Yes | Passed |

### TC-UI-001 — claimant can view claims and open the new-claim wizard

- **Test type:** UI functional, positive
- **Priority:** P1
- **Preconditions:** The Claimant storage state has been generated and the
  authenticated claims list has finished loading.
- **Test data:** Existing claimant demo account.
- **Test steps:**
  1. Open the claims page using the saved Claimant session.
  2. Select **Submit New Claim**.
- **Expected result:** The URL changes to `/claims/new` and the **Incident
  Details** step is displayed.
- **Automation:** `tests/e2e/claimant/claimant-dashboard.spec.js`

### TC-UI-002 — claimant submits a claim and sees its confirmation and details

- **Test type:** UI functional, positive
- **Priority:** P1
- **Preconditions:** The saved Claimant session is available.
- **Test data:** Previous-day incident date, unique location/description,
  positive amount within the documented limit.
- **Test steps:**
  1. Use the saved Claimant session and complete the three wizard steps.
  2. Submit the claim and note the returned Claim ID.
  3. Confirm the submission message includes the Claim ID.
  4. Open the claim details.
- **Expected result:** Submission returns a dynamic Claim ID; the claimant's
  list and details show the new claim in `SUBMITTED` status.
- **Automation:** `tests/e2e/claimant/claim-submission.spec.js`

### TC-UI-003 — admin can reject a submitted claim

- **Test type:** UI end-to-end, positive business outcome
- **Priority:** P1
- **Preconditions:** The saved Claimant and Admin sessions are available.
- **Test data:** A newly submitted claim with unique generated values.
- **Test steps:**
  1. Submit a claim using the saved Claimant session.
  2. Use the saved Admin session and locate the submitted Claim ID.
  3. Set status to `REJECTED` and confirm.
  4. Reload the claimant's claims page.
- **Expected result:** The admin sees the claim as rejected and the claimant's
  list shows `Rejected`.
- **Automation:** `tests/e2e/admin/admin-claim-review.spec.js`

### TC-UI-004 — claim form rejects invalid incident details and description

- **Test type:** UI functional, negative
- **Priority:** P1
- **Preconditions:** The saved Claimant session is active and the claims page
  has finished loading.
- **Test data:** Future date, location shorter than five characters, amount
  below $0.01, and description shorter than ten characters.
- **Test steps:**
  1. Select **Submit New Claim** and verify the Incident Details step opens.
  2. Leave required fields empty and verify **Next** is disabled.
  3. Enter the future date, short location, and zero amount one at a time.
  4. Replace incident data with valid values and proceed to Supporting Details.
  5. Enter a too-short description.
- **Expected result:** The corresponding source-defined validation messages
  appear; **Next** is enabled only with valid fields and disabled for the short
  description. No claim is submitted.
- **Automation:** `tests/e2e/claimant/claimant-dashboard.spec.js`

### TC-UI-005 — claimant can keep editing a draft after requesting cancellation

- **Test type:** UI functional, positive recovery path
- **Priority:** P2
- **Preconditions:** The saved Claimant session is active; wizard is open.
- **Test data:** Valid incident details.
- **Test steps:**
  1. Complete Incident Details and proceed to Supporting Details.
  2. Select **Cancel**.
  3. Select **Keep Editing** in the confirmation dialog.
- **Expected result:** The dialog closes, the wizard remains on Supporting
  Details, and the claimant can continue entering the draft.
- **Automation:** `tests/e2e/claimant/claimant-dashboard.spec.js`

### TC-UI-006 — claimant can discard a draft and return to their claims page

- **Test type:** UI functional, negative/destructive confirmation
- **Priority:** P2
- **Preconditions:** The saved Claimant session is active; valid incident
  details have been entered and the wizard has advanced to Supporting Details.
- **Test data:** Valid incident details; no submitted claim.
- **Test steps:**
  1. Select **Cancel**.
  2. Select **Discard & Leave**.
- **Expected result:** The wizard returns to `/claims` and **My Claims** is
  displayed. The test stops before submitting a claim.
- **Automation:** `tests/e2e/claimant/claimant-dashboard.spec.js`

### TC-UI-007 — admin reviews and approves a claim submitted by the claimant

- **Test type:** UI end-to-end, positive
- **Priority:** P1
- **Preconditions:** Saved Claimant and Admin sessions are available.
- **Test data:** A newly submitted claim with unique generated values.
- **Test steps:**
  1. Submit a claim using the saved Claimant session.
  2. Open the submitted claim in Admin's claims list.
  3. Change the status to `UNDER_REVIEW`, then to `APPROVED`.
  4. Return to the Claimant session and verify the updated status.
- **Expected result:** Admin sees the submitted claim and can move it through
  the supported review and approval transitions; Claimant sees `APPROVED`.
- **Automation:** `tests/e2e/admin/admin-claim-review.spec.js`

> **Admin details limitation:** The Admin “View Details” action is a
> “Details view coming soon” placeholder in the application. Admin claim
> details are therefore not asserted as a supported workflow.

## Supporting UI authentication setup checks

The two cases below validate saved Claimant/Admin sessions that support the UI
suite setup. They are not part of the 7 Claims workflow-case count. Both
passed in the latest UI run; an earlier attempt was blocked before login
because the required account environment variables were not configured.

### TC-UI-AUTH-001 — logs in once and saves the Claimant session

- **Test type:** UI authentication/session validation, positive
- **Priority:** P1
- **Preconditions:** The seeded Claimant account exists and
  `PLAYWRIGHT_CLAIMANT_EMAIL` and `PLAYWRIGHT_CLAIMANT_PASSWORD` are set.
- **Test data:** Claimant account configured in the environment.
- **Test steps:**
  1. Run the authentication setup project.
  2. Confirm it logs in once and saves the root state file
     `playwright/.auth/claimant.json`.
  3. Open a fresh browser context with that state and navigate to `/claims`.
- **Expected result:** The restored session reaches **My Claims** without
  another interactive login.
- **Automation:** `tests/e2e/auth/auth.setup.js`

### TC-UI-AUTH-002 — logs in once and saves the Admin session

- **Test type:** UI authentication/session validation, positive
- **Priority:** P1
- **Preconditions:** The seeded Admin account exists and
  `PLAYWRIGHT_ADMIN_EMAIL` and `PLAYWRIGHT_ADMIN_PASSWORD` are set.
- **Test data:** Admin account configured in the environment.
- **Test steps:**
  1. Run the authentication setup project.
  2. Confirm it logs in once and saves the root state file
     `playwright/.auth/admin.json`.
  3. Open a fresh browser context with that state and navigate to
     `/admin/claims`.
- **Expected result:** The restored Admin session reaches **Claims Management**
  without another interactive login.
- **Automation:** `tests/e2e/auth/auth.setup.js`

## Functional Test Suite 2 — API test cases

### Automation and execution status

All eight API cases remain automated. The latest authenticated API run on
2026-11-24 passed six cases; the two API contract failures reproduced and are
documented as DEF-API-001 and DEF-API-002. An earlier targeted attempt was
blocked before requests because claimant credentials were not configured.

| Case | Latest API run |
|---|---|
| TC-API-001 | Passed |
| TC-API-002 | Passed |
| TC-API-003 | Failed: DEF-API-001 reproduced (HTTP 500 instead of 400) |
| TC-API-004 | Passed |
| TC-API-005 | Failed: DEF-API-002 reproduced (required fields missing) |
| TC-API-006 | Passed |
| TC-API-007 | Passed |
| TC-API-008 | Passed |

### TC-API-001 — claimant can list claims with the documented summary schema

- **Test type:** API positive/schema
- **Priority:** P1
- **Preconditions:** Claimant account exists and can authenticate to the BFF.
- **Test data:** Existing claimant demo account.
- **Test steps:**
  1. Authenticate at `POST /api/auth/login`.
  2. Request `GET /api/claims`.
  3. Validate each item against the OpenAPI `ClaimSummaryResponse` schema.
- **Expected result:** HTTP 200 and a JSON array with UUID, date, description,
  amount, valid status, and creation timestamp fields.
- **Automation:** `tests/api/claims-api.pw.js`

### TC-API-002 — claimant can submit a claim with the documented response schema

- **Test type:** API positive/schema
- **Priority:** P1
- **Preconditions:** Claimant is authenticated and has a valid CSRF token.
- **Test data:** All required fields; valid previous-day date, location of 5–200
  characters, description of 10–1000 characters, amount from $0.01 to
  $1,000,000.
- **Test steps:**
  1. Send JSON to `POST /api/claims`.
  2. Validate the response using the OpenAPI `ClaimResponse` schema.
- **Expected result:** HTTP 201; response fields match the submitted data;
  Claim ID/User ID are UUIDs and status is `SUBMITTED`.
- **Automation:** `tests/api/claims-api.pw.js`

### TC-API-003 — claim submission returns the documented validation error for a future incident date

- **Test type:** API negative/contract
- **Priority:** P1
- **Preconditions:** Claimant is authenticated with a valid CSRF token.
- **Test data:** Otherwise valid request with incident date `2099-12-31`.
- **Test steps:**
  1. Send the request to `POST /api/claims`.
  2. Validate the status and RFC 7807 `ProblemDetail` response.
- **Expected result:** HTTP 400 with a valid `ProblemDetail` response as
  specified by the OpenAPI contract.
- **Observed result:** HTTP 500 with a generic Internal Server Error body.
  This is tracked as `DEF-API-001`.
- **Automation:** `tests/api/claims-api.pw.js`

### TC-API-004 — claim submission rejects a missing required field

- **Test type:** API negative/schema
- **Priority:** P1
- **Preconditions:** Claimant is authenticated with a valid CSRF token.
- **Test data:** Valid request with required `description` omitted.
- **Test steps:**
  1. Send JSON to `POST /api/claims`.
  2. Validate HTTP status and `ProblemDetail` response fields.
- **Expected result:** HTTP 400 and a valid `ProblemDetail`.
- **Automation:** `tests/api/claims-api.pw.js`

### TC-API-005 — claim submission returns a documented problem response for a missing body

- **Test type:** API negative/contract
- **Priority:** P2
- **Preconditions:** Claimant is authenticated with a valid CSRF token.
- **Test data:** Empty body with `Content-Type: application/json`.
- **Test steps:**
  1. Send the empty request to `POST /api/claims`.
  2. Validate HTTP status and `ProblemDetail` schema.
- **Expected result:** OpenAPI specifies HTTP 400 with all required
  `ProblemDetail` fields.
- **Observed result:** HTTP 400 is returned, but the body omits required
  `type`, `title`, and `detail` fields. This is tracked as `DEF-API-002`.
- **Automation:** `tests/api/claims-api.pw.js`

### TC-API-006 — claimant is forbidden from listing all admin claims

- **Test type:** API negative/authorization
- **Priority:** P1
- **Preconditions:** Claimant is authenticated.
- **Test data:** Existing claimant demo account.
- **Test steps:**
  1. Request `GET /api/admin/claims` as claimant.
- **Expected result:** HTTP 403.
- **Automation:** `tests/api/claims-api.pw.js`

### TC-API-007 — admin can list claims with the documented claim response schema

- **Test type:** API positive/schema/authorization
- **Priority:** P1
- **Preconditions:** Admin is authenticated.
- **Test data:** Existing admin demo account and existing claims.
- **Test steps:**
  1. Request `GET /api/admin/claims` as admin.
  2. Validate each claim against the OpenAPI `ClaimResponse` schema.
- **Expected result:** HTTP 200 and a JSON array of valid claim responses.
- **Automation:** `tests/api/claims-api.pw.js`

### TC-API-008 — unauthenticated requests cannot list claims

- **Test type:** API negative/authorization
- **Priority:** P1
- **Preconditions:** No authentication cookies.
- **Test data:** None.
- **Test steps:**
  1. Request `GET /api/claims` without logging in.
- **Expected result:** HTTP 401.
- **Automation:** `tests/api/claims-api.pw.js`
