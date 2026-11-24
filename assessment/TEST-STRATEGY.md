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

Use the seeded accounts configured through `PLAYWRIGHT_CLAIMANT_EMAIL`,
`PLAYWRIGHT_CLAIMANT_PASSWORD`, `PLAYWRIGHT_ADMIN_EMAIL`, and
`PLAYWRIGHT_ADMIN_PASSWORD`. All four variables are required by the UI and API
test fixtures. Do not put credential values in source or assessment documents.

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
   claimant/admin workflow test; disable media capture in the authentication
   setup project.

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
- On 2026-11-24, the UI and API suite commands were attempted separately after
  the functional suites were clarified. The first attempt found no Compose
  project services; existing assessment containers were running under another
  Compose project and caused a container-name conflict when startup was
  attempted. The API endpoint then became reachable, while local UI startup
  initially failed because the ignored generated OpenAPI client was absent.
- The UI package's existing `generate:api` command generated the ignored client
  required to run Next.js. The first UI run then exposed a timing-sensitive
  invalid-date test; after changing that test to open the wizard from the
  already-loaded claims page, the UI suite passed **9/9** (7 workflow cases
  plus 2 auth setup checks).
- The API suite passed **6/8**. The future-date test again received HTTP 500
  rather than 400, and the empty-body test again found missing required
  `ProblemDetail` fields. Thus the split latest result is **15 passed, 2
  failed**; the two API failures remain the documented application defects.
- The future-incident-date request returned HTTP 500 instead of the expected
  HTTP 400. The empty-body request returned HTTP 400 but omitted the required
  `type`, `title`, and `detail` fields from `ProblemDetail`.
- The Playwright HTML and JUnit reports were generated. The latest run produced
  9 PNG screenshots and 7 videos; two Admin workflows use two pages and
  therefore produced an additional screenshot apiece.
- Copies of those latest UI captures are organized in root `Screenshots/` and
  `Videos/`; originals remain under their per-test folders in `test-results/`.
- Both auth setup tests generated the ignored Claimant and Admin storage-state
  files under `playwright/.auth/`.
- ESLint passed for the UI and API automation JavaScript files.
- Frontend unit tests were removed from the assessment as requested; only the
  Playwright UI and API suites were run after removal.
- The six UI workflow tests created persistent claim records in the assessment
  stack in the earlier run. The latest UI and API executions also submit
  claims, so additional records persist in the assessment database.

### Latest review verification (2026-11-24)

- `npm run test:e2e -- --list` discovered **17 tests**: 2 authentication setup
  checks, 7 UI workflow cases, and 8 API cases.
- An initial `npm run test:ui` attempt stopped at authentication setup because
  the role email/password environment variables were not configured; the 7
  dependent UI workflow tests did not run in that attempt.
- After the credentials were configured in the user's environment, a
  successful `npm run test:ui` run completed **9/9 tests** (2 auth setup checks
  and 7 UI workflow cases), with **0 failures**. The JUnit result records a
  duration of about 119 seconds. This confirms the UI automation passed; no
  UI application defect was observed.
- An initial targeted API attempt stopped in the claimant authentication
  fixture before sending requests because credentials were not configured.
  After the credentials were supplied, the full API run executed all 8 cases:
  **6 passed and 2 failed**. The future-date case reproduced HTTP 500 instead
  of HTTP 400; the missing-body case returned HTTP 400 but failed `ProblemDetail`
  schema validation because `type`, `title`, and `detail` were absent.
- The latest split-suite result is **15 passed, 2 failed**: UI 9/9 passed and
  API 6/8 passed. Both API failures are confirmed defects documented in
  `DEFECT-REPORT.md`; the current JUnit report records 8 tests, 1 assertion
  failure, and 1 schema-validation error.
- The successful UI run produced 9 PNG screenshots and 7 WebM videos under
  `test-results/`. These actual artifacts were copied into the root
  `Screenshots/` and `Videos/` folders using filenames tied to each test
  result; the copied files were hash-verified against their sources.
- The root Playwright configuration already enables screenshot and video
  recording for the claimant/admin UI projects. The auth setup project
  intentionally disables media capture so login setup is not recorded.

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
| Supplied assessment templates are absent from the checked project files | Cannot compare with the original format | Use self-created replacements based on the checklist; clearly state that exact compliance cannot be verified without the originals |

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

The exit criteria for having no unresolved high-priority defects are not met:
the API contract tests expose confirmed response discrepancies. The
assessment-provided templates were not found; the self-created replacements
cover the required checklist fields, but exact compliance with the originals
cannot be verified.
