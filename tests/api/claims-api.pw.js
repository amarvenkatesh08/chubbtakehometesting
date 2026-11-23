import { expect, request } from '@playwright/test';
import { test } from './api-fixtures.js';
import {
  ClaimResponseSchema,
  ClaimSummaryResponseSchema,
  ProblemDetailSchema,
} from './api-schemas.js';

function validClaimRequest() {
  const incidentDate = new Date();
  incidentDate.setUTCDate(incidentDate.getUTCDate() - 1);

  return {
    incidentDate: incidentDate.toISOString().slice(0, 10),
    incidentLocation: `API test location ${Date.now()}`,
    description: `API test claim created at ${new Date().toISOString()}`,
    claimAmount: 412.75,
  };
}

test('claimant can list claims with the documented summary schema', async ({ claimantApi }) => {
  const response = await claimantApi.api.get('/api/claims');
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  body.forEach((claim) => ClaimSummaryResponseSchema.parse(claim));
});

test('claimant can submit a claim with the documented response schema', async ({ claimantApi }) => {
  const claimRequest = validClaimRequest();
  const response = await claimantApi.api.post('/api/claims', {
    data: claimRequest,
    headers: claimantApi.csrfHeaders,
  });
  expect(response.status()).toBe(201);

  const body = await response.json();
  ClaimResponseSchema.parse(body);
  expect(body).toMatchObject({
    ...claimRequest,
    status: 'SUBMITTED',
  });
});

test('claim submission returns the documented validation error for a future incident date', async ({
  claimantApi,
}, testInfo) => {
  const claimRequest = validClaimRequest();
  claimRequest.incidentDate = '2099-12-31';

  const response = await claimantApi.api.post('/api/claims', {
    data: claimRequest,
    headers: claimantApi.csrfHeaders,
  });
  const responseBody = await response.text();
  await testInfo.attach('future-date-api-response', {
    body: JSON.stringify({
      status: response.status(),
      contentType: response.headers()['content-type'],
      body: responseBody,
    }, null, 2),
    contentType: 'application/json',
  });
  expect(response.status(), `API response body: ${responseBody}`).toBe(400);

  const problem = ProblemDetailSchema.parse(JSON.parse(responseBody));
  expect(problem.status).toBe(400);
});

test('claim submission rejects a missing required field', async ({ claimantApi }) => {
  const { description, ...incompleteRequest } = validClaimRequest();
  expect(description).toBeTruthy();

  const response = await claimantApi.api.post('/api/claims', {
    data: incompleteRequest,
    headers: claimantApi.csrfHeaders,
  });
  expect(response.status()).toBe(400);

  const problem = ProblemDetailSchema.parse(await response.json());
  expect(problem.status).toBe(400);
});

test('claimant is forbidden from listing all admin claims', async ({ claimantApi }) => {
  const response = await claimantApi.api.get('/api/admin/claims');
  expect(response.status()).toBe(403);
});

test('admin can list claims with the documented claim response schema', async ({ adminApi }) => {
  const response = await adminApi.api.get('/api/admin/claims');
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  body.forEach((claim) => ClaimResponseSchema.parse(claim));
});

test('unauthenticated requests cannot list claims', async () => {
  const api = await request.newContext({
    baseURL: process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:8090',
  });

  try {
    const response = await api.get('/api/claims');
    expect(response.status()).toBe(401);
  } finally {
    await api.dispose();
  }
});

test('claim submission returns a documented problem response for a missing body', async ({
  claimantApi,
}, testInfo) => {
  const response = await claimantApi.api.post('/api/claims', {
    data: '',
    headers: {
      ...claimantApi.csrfHeaders,
      'Content-Type': 'application/json',
    },
  });
  expect(response.status()).toBe(400);

  const responseBody = await response.text();
  await testInfo.attach('missing-body-api-response', {
    body: JSON.stringify({
      status: response.status(),
      contentType: response.headers()['content-type'],
      body: responseBody,
    }, null, 2),
    contentType: 'application/json',
  });
  const problem = ProblemDetailSchema.parse(JSON.parse(responseBody));
  expect(problem.status).toBe(400);
});
