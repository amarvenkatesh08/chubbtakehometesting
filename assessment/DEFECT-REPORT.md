# Claims Management Defect Report

## DEF-API-001 — Future incident date returns HTTP 500 instead of HTTP 400

- **Defect ID:** DEF-API-001
- **Title:** `POST /api/claims` returns HTTP 500 for a future incident date
- **Description:** A claimant request with otherwise valid claim data and an
  incident date in the future receives an internal-server-error response.
  The BFF OpenAPI contract specifies HTTP 400 with a `ProblemDetail` response
  for this validation error.
- **Steps to reproduce:**
  1. Authenticate as the seeded claimant and obtain a CSRF token.
  2. Send a valid JSON claim to `POST http://localhost:8090/api/claims`, using
     `2099-12-31` as `incidentDate`.
  3. Compare the response status and body with the documented API contract.
- **Expected result:** HTTP 400 with the documented `ProblemDetail` schema.
- **Actual result:** HTTP 500 with a generic internal-server-error response.
- **Severity:** Major
- **Priority:** P1
- **Environment:** Assessment Docker stack; BFF at `http://localhost:8090`;
  Playwright Test 1.65.1; seeded claimant account; JavaScript API test suite.
- **API request/response evidence (2026-11-23):** Reproduced with an
  authenticated Claimant session and a fresh CSRF token. Credentials and
  authentication headers are intentionally omitted.

  Request:

  ```http
  POST /api/claims
  Content-Type: application/json

  {
    "incidentDate": "2099-12-31",
    "incidentLocation": "Assessment API evidence location",
    "description": "Assessment API evidence claim with a future date",
    "claimAmount": 412.75
  }
  ```

  Expected status: `400`

  Actual status: `500`

  Actual response body:

  ```json
  {"timestamp":"2026-11-23T18:25:14.720Z","status":500,"error":"Internal Server Error","path":"/api/claims"}
  ```

  Automated response evidence and assertion are also in
  [Playwright error context](../test-results/claims-api.pw.js-claim-sub-6ddac--for-a-future-incident-date-api/error-context.md)
  and the [JUnit report](../playwright-report/results.xml).

## DEF-API-002 — Missing-body error omits required ProblemDetail fields

- **Defect ID:** DEF-API-002
- **Title:** Missing claim body returns an incomplete error response
- **Description:** A claimant request with an empty JSON body receives HTTP 400,
  but the response is not a valid `ProblemDetail` object: the required `type`,
  `title`, and `detail` fields are absent.
- **Steps to reproduce:**
  1. Authenticate as the seeded claimant and obtain a CSRF token.
  2. Send an empty body to `POST http://localhost:8090/api/claims` with
     `Content-Type: application/json`.
  3. Validate the response against the BFF OpenAPI `ProblemDetail` schema.
- **Expected result:** HTTP 400 with a valid `ProblemDetail` containing all
  required fields.
- **Actual result:** HTTP 400, but the error body does not include required
  `type`, `title`, or `detail` fields.
- **Severity:** Moderate
- **Priority:** P2
- **Environment:** Assessment Docker stack; BFF at `http://localhost:8090`;
  Playwright Test 1.65.1; seeded claimant account; JavaScript API test suite.
- **API request/response evidence (2026-11-23):** Reproduced with an
  authenticated Claimant session and a fresh CSRF token. Credentials and
  authentication headers are intentionally omitted.

  Request:

  ```http
  POST /api/claims
  Content-Type: application/json

  <empty body>
  ```

  Expected status: `400`, with `type`, `title`, `status`, and `detail` fields
  in the `ProblemDetail` response.

  Actual status: `400`

  Actual response body:

  ```json
  {"timestamp":"2026-11-23T18:25:25.626Z","status":400,"error":"Bad Request","path":"/api/claims"}
  ```

  Schema validation reports the `type`, `title`, and `detail` fields missing.
  The failed assertion and test context are in
  [Playwright error context](../test-results/claims-api.pw.js-claim-sub-ce44c-response-for-a-missing-body-api/error-context.md)
  and the [JUnit report](../playwright-report/results.xml).

## Template note

The assessment-provided defect template was not present in the inspected
workspace. The report includes each required field listed in the assessment
instructions; exact template compliance cannot be confirmed without that
template.

## Summary

Two genuine API contract defects were confirmed. No UI application defect was
confirmed. These findings are based on the observed BFF responses and the
checked-in API contract; no application source code was changed.
