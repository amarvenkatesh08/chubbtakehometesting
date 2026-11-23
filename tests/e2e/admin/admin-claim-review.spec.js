import { expect } from '@playwright/test';
import { ClaimantPage } from '../pages/ClaimantPage.js';
import { ClaimSubmissionPage } from '../pages/ClaimSubmissionPage.js';
import { test } from '../fixtures/test-fixtures.js';
import { validClaimData } from '../utils/TestData.js';

test('admin reviews and approves a claim submitted by the claimant', async ({
  claimantContext,
  adminPage,
}) => {
  test.setTimeout(90_000);
  const claimantPage = new ClaimantPage(await claimantContext.newPage());
  await claimantPage.goto();
  await claimantPage.waitUntilLoaded();

  const submissionPage = new ClaimSubmissionPage(claimantPage.page);
  await submissionPage.goto();
  const claimId = await submissionPage.submitClaim(validClaimData());

  const adminClaims = await adminPage.goto();
  expect(adminClaims.some((claim) => claim.claimId === claimId)).toBe(true);
  await expect(adminPage.claimRow(claimId)).toBeVisible();
  await adminPage.updateClaimStatus(claimId, 'UNDER_REVIEW');
  await adminPage.updateClaimStatus(claimId, 'APPROVED');

  await claimantPage.page.reload();
  await expect(claimantPage.claimRow(claimId)).toContainText('Approved');
});

test('admin can reject a submitted claim', async ({ claimantContext, adminPage }) => {
  test.setTimeout(90_000);
  const claimantPage = new ClaimantPage(await claimantContext.newPage());
  await claimantPage.goto();
  await claimantPage.waitUntilLoaded();

  const submissionPage = new ClaimSubmissionPage(claimantPage.page);
  await submissionPage.goto();
  const claimId = await submissionPage.submitClaim(validClaimData());

  const adminClaims = await adminPage.goto();
  expect(adminClaims.some((claim) => claim.claimId === claimId)).toBe(true);
  await adminPage.updateClaimStatus(claimId, 'REJECTED');

  await claimantPage.page.reload();
  await expect(claimantPage.claimRow(claimId)).toContainText('Rejected');
});
