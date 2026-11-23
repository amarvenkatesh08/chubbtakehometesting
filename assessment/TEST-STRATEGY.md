# Claims Management QA Test Strategy

## Objective

Assess the claimant and administrator claim workflows through the UI and the
BFF API, using observable behavior and the checked-in OpenAPI contract. Keep
the application and Docker configuration unchanged.

## Test environment

| Component | Address / version | Verification |
|---|---|---|
| UI | `http://localhost:3001` | Login page returned HTTP 200 |
| BFF | `http://localhost:8090` | API tests authenticate and exercise BFF routes |
| Claims Service | `http://localhost:8080` | Called by the BFF |
| PostgreSQL | Docker Compose, port 5432 | Compose container healthy |
| Keycloak | Docker Compose, port 8180 | Compose container running |
| Redis | Docker Compose, port 6379 | Compose container running |
| Kafka | Docker Compose, port 9092 | Healthy at the latest environment check |
| Debezium | Optional, port 8083 | CDC mode is not required for this suite |
| Test runner | Playwright Test 1.65.1, JavaScript | One `playwright.config.js` |
| Browser | Playwright Chromium | Headed for UI tests |

Use the seeded accounts `claimant@demo.com` and `admin@demo.com`. Passwords
are supplied through `PLAYWRIGHT_CLAIMANT_PASSWORD` and
`PLAYWRIGHT_ADMIN_PASSWORD`; optional email overrides are supported. Do not put
password values in source or assessment documents.

## Scope

### In scope

- Claimant and admin authentication and role-specific access.
- Claimant claims list, opening the claim wizard, client-side input validation,
  claim submission, confirmation, and claim details.
- Draft cancellation, retaining a draft, and discarding a draft.
- Admin claim listing and the supported `SUBMITTED → UNDER_REVIEW → APPROVED`
  and `SUBMITTED → REJECTED` workflows.
- BFF API status codes, response fields and schemas, invalid and missing claim
  input, and claimant/admin/anonymous authorization.
- Existing UI/API automation artifacts, test reports, screenshots, and videos.

### Out of scope

- Features not present in the project, including supporting-document upload.
- Admin claim details: the current action displays “Details view coming soon”
  rather than a details view.
- Load, performance, penetration, and disaster-recovery testing.
- Database migration, Docker, and infrastructure changes.
- Contract testing between services beyond using the checked-in BFF OpenAPI
  document as the API response/request reference.

## Test approach

1. Use risk-based functional testing of the claimant submission and admin
   decision paths.
2. Use a Playwright setup project to authenticate once as each seeded role,
   save separate storage states under `playwright/.auth`, and verify each
   restored session. UI specs use page objects and those role-specific states.
   Use role, label, and test-ID locators; wait for API responses and rendered
   state rather than sleeping.
3. Use Playwright `APIRequestContext` against the real BFF routes. Reuse
   environment-configured demo accounts, acquire the CSRF token, and validate
   responses with Zod schemas derived from the BFF OpenAPI schemas.
4. Keep the Java/JUnit tests intact. The frontend unit-test suite is removed
   from this assessment; the Playwright suites cover the requested UI and API
   behaviors.
5. Execute UI and API suites separately and together. Preserve actual failures
   as evidence; do not make a failing test pass by weakening the contract.
6. Generate an HTML and JUnit report. Capture a screenshot and video for each
   UI test.

## Execution results

- Playwright discovery found **6 UI workflow tests** and **8 API tests** at
  the earlier configuration. The reorganized suite was then executed with
  **17 tests**: 2 auth-setup tests, 7 UI workflow tests, and 8 API tests.
- The complete suite was rerun from the repository root after relocating the
  tests and correcting auth-state paths: **15 passed and 2 failed**. Both
  auth-setup tests and all 7 UI workflow tests passed. Six API tests passed;
  the two failures are the confirmed BFF contract defects documented in
  `DEFECT-REPORT.md`.
- The latest complete run after refreshing the API defect evidence also
  resulted in **15 passed and 2 failed**, with the same two API contract
  failures; all auth setup and UI workflow tests passed again.
- The future-incident-date request returned HTTP 500 instead of the expected
  HTTP 400. The empty-body request returned HTTP 400 but omitted the required
  `type`, `title`, and `detail` fields from `ProblemDetail`.
- The Playwright HTML and JUnit reports were generated. The latest run produced
  9 PNG screenshots and 7 videos; two Admin workflows use two pages and
  therefore produced an additional screenshot apiece.
- Both auth setup tests generated the ignored Claimant and Admin storage-state
  files under `playwright/.auth/`.
- ESLint passed for the UI and API automation JavaScript files.
- Frontend unit tests were removed from the assessment as requested; only the
  Playwright UI and API suites were run after removal.
- The six UI workflow tests created persistent claim records in the assessment
  stack in the earlier run. The latest UI and API executions also submit
  claims, so additional records persist in the assessment database.

## Test data approach

- Use the pre-provisioned README demo accounts; credentials are supplied only
  through environment variables.
- Generate unique location and description values for successful submissions.
- Use a dynamically generated incident date from the previous day for valid
  requests, a future date for invalid-date checks, and omit required fields for
  missing-input checks.
- Read Claim IDs from actual submission responses; never hardcode IDs.
- UI and API tests create real records in the assessment database. There is no
  claim deletion API, so test data persists. Run only against the dedicated
  assessment stack and do not reset or manually delete data.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Tests write persistent claim data | Database accumulates generated records | Unique test descriptions; disclose the side effect; use the assessment stack |
| BFF and Claims Service can expose contract drift | Clients may receive a 500 or non-contract error body | Validate actual response status and schema against OpenAPI; retain failures |
| Login depends on Keycloak and cookie/CSRF behavior | Authentication failures can mask workflow results | Use the real login endpoint and fetch CSRF tokens in setup fixtures |
| Kafka/CDC mode can affect realtime notifications | Duplicate or delayed events | CDC is optional; use the default direct Kafka mode unless explicitly testing CDC |
| Claim status transitions are constrained | Tests may request an invalid transition | Use the domain-supported transitions documented in source |
| Some UI actions are placeholders | Tests could assert functionality that does not exist | Treat admin details and upload as limitations, not implemented flows |
| Exact assessment templates are absent from the checked project files | Cannot verify exact template compliance | Keep the requested fields, mark template-dependent work as pending, and request the supplied template before final submission |

## Entry criteria

- Docker Compose application and infrastructure services are running.
- UI returns HTTP 200 and the BFF is reachable.
- Existing claimant/admin accounts can log in; credentials are set in the test
  process environment.
- Playwright dependencies and Chromium are installed.
- The test target is the assessment database, not a production or shared
  non-assessment environment.

## Exit criteria

- All planned UI and API cases have an actual execution result.
- Every high-priority scenario has been executed and has no unexplained
  automation failure.
- Confirmed defects are documented with actual response evidence and priority.
- HTML/JUnit reports and requested UI media have been generated and inspected.
- All seven deliverables are present and checked against the assessment brief
  and its templates.
- No unresolved critical/high defect remains unless explicitly accepted by the
  assessment owner.

The final two criteria are not yet met: API contract tests currently expose
confirmed error-response discrepancies, and the assessment-provided test-case
and defect templates were not found in the inspected project folder.
