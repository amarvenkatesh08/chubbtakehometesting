import { expect } from '@playwright/test';
import { test } from '../fixtures/test-fixtures.js';
import { validClaimData } from '../utils/TestData.js';

test('claimant submits a claim and sees its confirmation and details', async ({
  claimantPage,
  claimSubmissionPage,
}) => {
  await claimSubmissionPage.goto();
  const claimId = await claimSubmissionPage.submitClaim(validClaimData());

  const claimRow = claimantPage.claimRow(claimId);
  await expect(claimRow).toBeVisible();
  await claimantPage.openClaimDetails(claimId);

  const detailsDialog = claimantPage.detailsDialog();
  await expect(detailsDialog.getByText(claimId, { exact: true })).toBeVisible();
  await expect(detailsDialog).toContainText('Submitted');
});
