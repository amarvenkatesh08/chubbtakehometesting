# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\claims-api.pw.js >> claim submission returns a documented problem response for a missing body
- Location: tests\api\claims-api.pw.js:112:1

# Error details

```
ZodError: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "type"
    ],
    "message": "Invalid input: expected string, received undefined"
  },
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "title"
    ],
    "message": "Invalid input: expected string, received undefined"
  },
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "detail"
    ],
    "message": "Invalid input: expected string, received undefined"
  }
]
```

# Test source

```ts
  33  |     data: claimRequest,
  34  |     headers: claimantApi.csrfHeaders,
  35  |   });
  36  |   expect(response.status()).toBe(201);
  37  | 
  38  |   const body = await response.json();
  39  |   ClaimResponseSchema.parse(body);
  40  |   expect(body).toMatchObject({
  41  |     ...claimRequest,
  42  |     status: 'SUBMITTED',
  43  |   });
  44  | });
  45  | 
  46  | test('claim submission returns the documented validation error for a future incident date', async ({
  47  |   claimantApi,
  48  | }, testInfo) => {
  49  |   const claimRequest = validClaimRequest();
  50  |   claimRequest.incidentDate = '2099-12-31';
  51  | 
  52  |   const response = await claimantApi.api.post('/api/claims', {
  53  |     data: claimRequest,
  54  |     headers: claimantApi.csrfHeaders,
  55  |   });
  56  |   const responseBody = await response.text();
  57  |   await testInfo.attach('future-date-api-response', {
  58  |     body: JSON.stringify({
  59  |       status: response.status(),
  60  |       contentType: response.headers()['content-type'],
  61  |       body: responseBody,
  62  |     }, null, 2),
  63  |     contentType: 'application/json',
  64  |   });
  65  |   expect(response.status(), `API response body: ${responseBody}`).toBe(400);
  66  | 
  67  |   const problem = ProblemDetailSchema.parse(JSON.parse(responseBody));
  68  |   expect(problem.status).toBe(400);
  69  | });
  70  | 
  71  | test('claim submission rejects a missing required field', async ({ claimantApi }) => {
  72  |   const { description, ...incompleteRequest } = validClaimRequest();
  73  |   expect(description).toBeTruthy();
  74  | 
  75  |   const response = await claimantApi.api.post('/api/claims', {
  76  |     data: incompleteRequest,
  77  |     headers: claimantApi.csrfHeaders,
  78  |   });
  79  |   expect(response.status()).toBe(400);
  80  | 
  81  |   const problem = ProblemDetailSchema.parse(await response.json());
  82  |   expect(problem.status).toBe(400);
  83  | });
  84  | 
  85  | test('claimant is forbidden from listing all admin claims', async ({ claimantApi }) => {
  86  |   const response = await claimantApi.api.get('/api/admin/claims');
  87  |   expect(response.status()).toBe(403);
  88  | });
  89  | 
  90  | test('admin can list claims with the documented claim response schema', async ({ adminApi }) => {
  91  |   const response = await adminApi.api.get('/api/admin/claims');
  92  |   expect(response.status()).toBe(200);
  93  | 
  94  |   const body = await response.json();
  95  |   expect(Array.isArray(body)).toBe(true);
  96  |   body.forEach((claim) => ClaimResponseSchema.parse(claim));
  97  | });
  98  | 
  99  | test('unauthenticated requests cannot list claims', async () => {
  100 |   const api = await request.newContext({
  101 |     baseURL: process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:8090',
  102 |   });
  103 | 
  104 |   try {
  105 |     const response = await api.get('/api/claims');
  106 |     expect(response.status()).toBe(401);
  107 |   } finally {
  108 |     await api.dispose();
  109 |   }
  110 | });
  111 | 
  112 | test('claim submission returns a documented problem response for a missing body', async ({
  113 |   claimantApi,
  114 | }, testInfo) => {
  115 |   const response = await claimantApi.api.post('/api/claims', {
  116 |     data: '',
  117 |     headers: {
  118 |       ...claimantApi.csrfHeaders,
  119 |       'Content-Type': 'application/json',
  120 |     },
  121 |   });
  122 |   expect(response.status()).toBe(400);
  123 | 
  124 |   const responseBody = await response.text();
  125 |   await testInfo.attach('missing-body-api-response', {
  126 |     body: JSON.stringify({
  127 |       status: response.status(),
  128 |       contentType: response.headers()['content-type'],
  129 |       body: responseBody,
  130 |     }, null, 2),
  131 |     contentType: 'application/json',
  132 |   });
> 133 |   const problem = ProblemDetailSchema.parse(JSON.parse(responseBody));
      |                                       ^ ZodError: [
  134 |   expect(problem.status).toBe(400);
  135 | });
  136 | 
```