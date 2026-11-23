import { request, test as base } from '@playwright/test';
import { UserResponseSchema } from './api-schemas.js';

function credentialsFor(role) {
  const prefix = role === 'admin' ? 'ADMIN' : 'CLAIMANT';
  const email = process.env[`PLAYWRIGHT_${prefix}_EMAIL`];
  const password = process.env[`PLAYWRIGHT_${prefix}_PASSWORD`];
  if (!email || !password) {
    throw new Error(
      `Set PLAYWRIGHT_${prefix}_EMAIL and PLAYWRIGHT_${prefix}_PASSWORD to the existing demo account credentials.`
    );
  }
  return { email, password };
}

async function withApiSession(role, runTest) {
  const api = await request.newContext({
    baseURL: process.env.PLAYWRIGHT_BFF_URL || 'http://localhost:8090',
  });

  try {
    const credentials = credentialsFor(role);
    const loginResponse = await api.post('/api/auth/login', { data: credentials });
    if (loginResponse.status() !== 200) {
      throw new Error(`API login for ${role} failed with HTTP ${loginResponse.status()}.`);
    }

    const user = UserResponseSchema.parse(await loginResponse.json());
    const expectedRole = role === 'admin' ? 'ADMIN' : 'CLAIMANT';
    if (user.role !== expectedRole) {
      throw new Error(`The configured ${role} account has role ${user.role}.`);
    }

    const csrfResponse = await api.get('/api/auth/csrf');
    if (!csrfResponse.ok()) {
      throw new Error(`CSRF token request failed with HTTP ${csrfResponse.status()}.`);
    }
    const csrf = await csrfResponse.json();
    if (typeof csrf.token !== 'string' || typeof csrf.headerName !== 'string') {
      throw new Error('CSRF token response did not include token and headerName strings.');
    }

    await runTest({
      api,
      csrfHeaders: { [csrf.headerName]: csrf.token },
    });
  } finally {
    await api.dispose();
  }
}

export const test = base.extend({
  claimantApi: async ({}, runTest) => withApiSession('claimant', runTest),
  adminApi: async ({}, runTest) => withApiSession('admin', runTest),
});
