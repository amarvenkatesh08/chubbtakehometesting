import { test as base } from '@playwright/test';
import { AdminPage } from '../pages/AdminPage.js';
import { ClaimantPage } from '../pages/ClaimantPage.js';
import { ClaimSubmissionPage } from '../pages/ClaimSubmissionPage.js';
import { appBaseUrl } from '../pages/LoginPage.js';
import { authStatePaths } from '../utils/TestData.js';

export const test = base.extend({
  claimantPage: async ({ page }, runTest) => {
    const claimantPage = new ClaimantPage(page);
    await claimantPage.goto();
    await claimantPage.waitUntilLoaded();
    await runTest(claimantPage);
  },
  claimSubmissionPage: async ({ page }, runTest) => {
    await runTest(new ClaimSubmissionPage(page));
  },
  adminPage: async ({ page }, runTest) => {
    await runTest(new AdminPage(page));
  },
  claimantContext: async ({ browser }, runTest) => {
    const context = await browser.newContext({
      baseURL: appBaseUrl(),
      storageState: authStatePaths.claimant,
    });
    try {
      await runTest(context);
    } finally {
      await context.close();
    }
  },
});
