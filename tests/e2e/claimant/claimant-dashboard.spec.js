import { expect } from '@playwright/test';
import { test } from '../fixtures/test-fixtures.js';
import { validClaimData } from '../utils/TestData.js';

test('claimant can view claims and open the new-claim wizard', async ({ claimantPage }) => {
  await expect(claimantPage.page.getByRole('heading', { name: 'My Claims' })).toBeVisible();
  await claimantPage.openNewClaimWizard();
  await expect(claimantPage.page).toHaveURL(/\/claims\/new$/);
  await expect(claimantPage.page.getByRole('heading', { name: 'Incident Details' })).toBeVisible();
});

test('claim form rejects invalid incident details and description', async ({
  claimantPage,
  claimSubmissionPage,
}) => {
  await claimSubmissionPage.goto();
  await expect(claimantPage.page).toHaveURL(/\/claims\/new$/);

  await expect(claimSubmissionPage.nextButton).toBeDisabled();
  await claimSubmissionPage.incidentDateInput.fill('2099-12-31');
  await expect(claimSubmissionPage.validationMessage('Incident date cannot be in the future')).toBeVisible();
  await claimSubmissionPage.incidentLocationInput.fill('Road');
  await expect(claimSubmissionPage.validationMessage('Location must be at least 5 characters')).toBeVisible();
  await claimSubmissionPage.claimAmountInput.fill('0');
  await expect(claimSubmissionPage.validationMessage('Claim amount must be at least $0.01')).toBeVisible();

  await claimSubmissionPage.fillIncidentDetails(validClaimData());
  await expect(claimSubmissionPage.nextButton).toBeEnabled();
  await claimSubmissionPage.nextButton.click();

  await claimSubmissionPage.fillDescription('Too short');
  await expect(claimSubmissionPage.validationMessage('Description must be at least 10 characters')).toBeVisible();
  await expect(claimSubmissionPage.nextButton).toBeDisabled();
});

test('claimant can keep editing a draft after requesting cancellation', async ({
  claimantPage,
  claimSubmissionPage,
}) => {
  await claimSubmissionPage.goto();
  await claimSubmissionPage.fillIncidentDetails(validClaimData());
  await claimSubmissionPage.nextButton.click();
  await expect(claimantPage.page.getByRole('heading', { name: 'Supporting Details' })).toBeVisible();

  await claimSubmissionPage.requestCancel();
  await expect(claimSubmissionPage.cancelDialog).toBeVisible();
  await claimSubmissionPage.keepEditing();

  await expect(claimSubmissionPage.cancelDialog).not.toBeVisible();
  await expect(claimantPage.page.getByRole('heading', { name: 'Supporting Details' })).toBeVisible();
  await expect(claimSubmissionPage.descriptionInput).toBeVisible();
});

test('claimant can discard a draft and return to their claims page', async ({
  claimantPage,
  claimSubmissionPage,
}) => {
  await claimSubmissionPage.goto();
  await claimSubmissionPage.fillIncidentDetails(validClaimData());
  await claimSubmissionPage.nextButton.click();
  await expect(claimantPage.page.getByRole('heading', { name: 'Supporting Details' })).toBeVisible();

  await claimSubmissionPage.requestCancel();
  await expect(claimSubmissionPage.cancelDialog).toBeVisible();
  await claimSubmissionPage.discardAndLeave();

  await expect(claimantPage.page).toHaveURL(/\/claims$/);
  await expect(claimantPage.page.getByRole('heading', { name: 'My Claims' })).toBeVisible();
});
