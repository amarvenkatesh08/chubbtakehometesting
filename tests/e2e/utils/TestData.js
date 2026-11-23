import path from 'node:path';

const accounts = {
  claimant: {
    email: 'claimant@demo.com',
    emailVariable: 'PLAYWRIGHT_CLAIMANT_EMAIL',
    passwordVariable: 'PLAYWRIGHT_CLAIMANT_PASSWORD',
  },
  admin: {
    email: 'admin@demo.com',
    emailVariable: 'PLAYWRIGHT_ADMIN_EMAIL',
    passwordVariable: 'PLAYWRIGHT_ADMIN_PASSWORD',
  },
};

const projectDirectory = path.resolve(__dirname, '..', '..', '..');
const authDirectory = path.join(projectDirectory, 'playwright', '.auth');

export const authStatePaths = Object.freeze({
  claimant: path.join(authDirectory, 'claimant.json'),
  admin: path.join(authDirectory, 'admin.json'),
});

export function credentialsFor(role) {
  const account = accounts[role];
  if (!account) {
    throw new Error(`Unsupported test role: ${role}`);
  }

  const email = process.env[account.emailVariable] || account.email;
  const password = process.env[account.passwordVariable];
  if (!password) {
    throw new Error(`Set ${account.passwordVariable} to the demo ${role} password before running E2E tests.`);
  }

  return { email, password };
}

export function validClaimData() {
  const incidentDate = new Date();
  incidentDate.setUTCDate(incidentDate.getUTCDate() - 1);

  return {
    incidentDate: incidentDate.toISOString().slice(0, 10),
    incidentLocation: `Playwright test location ${Date.now()}`,
    claimAmount: '275.50',
    description: `Playwright QA claim created at ${new Date().toISOString()}`,
  };
}
