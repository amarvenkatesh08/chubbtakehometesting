import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { AdminPage } from '../pages/AdminPage.js';
import { ClaimantPage } from '../pages/ClaimantPage.js';
import { LoginPage, appBaseUrl } from '../pages/LoginPage.js';
import { authStatePaths } from '../utils/TestData.js';

async function saveAndVerifySession(page, browser, role) {
  const statePath = authStatePaths[role];
  await mkdir(path.dirname(statePath), { recursive: true });

  await new LoginPage(page).loginAs(role);
  await page.context().storageState({ path: statePath });

  const restoredContext = await browser.newContext({
    baseURL: appBaseUrl(),
    storageState: statePath,
  });
  try {
    const restoredPage = await restoredContext.newPage();
    if (role === 'claimant') {
      const claimsPage = new ClaimantPage(restoredPage);
      await claimsPage.goto();
      await claimsPage.waitUntilLoaded();
      await expect(restoredPage.getByRole('heading', { name: 'My Claims' })).toBeVisible();
    } else {
      await new AdminPage(restoredPage).goto();
      await expect(restoredPage.getByRole('heading', { name: 'Claims Management' })).toBeVisible();
    }
  } finally {
    await restoredContext.close();
  }
}

test('logs in once and saves the Claimant session', async ({ page, browser }) => {
  await saveAndVerifySession(page, browser, 'claimant');
});

test('logs in once and saves the Admin session', async ({ page, browser }) => {
  await saveAndVerifySession(page, browser, 'admin');
});
