import { expect } from '@playwright/test';
import { credentialsFor } from '../utils/TestData.js';

const roles = {
  claimant: {
    destination: /\/claims$/,
    heading: 'My Claims',
  },
  admin: {
    destination: /\/admin\/dashboard$/,
    heading: 'Admin Dashboard',
  },
};

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Log In', exact: true });
  }

  async loginAs(role) {
    const config = roles[role];
    if (!config) {
      throw new Error(`Unsupported test role: ${role}`);
    }

    const { email, password } = credentialsFor(role);

    await this.page.goto('/login');
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    const responsePromise = this.page.waitForResponse((response) => {
      const requestUrl = new URL(response.url());
      return requestUrl.pathname === '/api/auth/login'
        && response.request().method() === 'POST';
    });
    const claimsResponsePromise = role === 'claimant'
      ? this.page.waitForResponse((response) => {
        const requestUrl = new URL(response.url());
        return requestUrl.pathname === '/api/claims'
          && response.request().method() === 'GET';
      })
      : null;
    await this.loginButton.click();

    const response = await responsePromise;
    if (!response.ok()) {
      throw new Error(`Login request failed with HTTP ${response.status()}.`);
    }

    await expect(this.page).toHaveURL(config.destination);
    await expect(this.page.getByRole('heading', { name: config.heading })).toBeVisible();
    if (claimsResponsePromise) {
      const claimsResponse = await claimsResponsePromise;
      expect(claimsResponse.status()).toBe(200);
    }
  }
}

export function appBaseUrl() {
  return process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
}
