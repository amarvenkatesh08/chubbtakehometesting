import { expect } from '@playwright/test';

export class ClaimSubmissionPage {
  constructor(page) {
    this.page = page;
    this.incidentDateInput = page.getByLabel(/When did the incident occur/);
    this.incidentLocationInput = page.getByLabel(/Where did the incident occur/);
    this.claimAmountInput = page.getByLabel('Claim Amount');
    this.descriptionInput = page.getByLabel(/Describe what happened/);
    this.nextButton = page.getByRole('button', { name: 'Next', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.cancelDialog = page.getByRole('dialog', { name: 'Cancel Claim Submission?' });
    this.keepEditingButton = this.cancelDialog.getByRole('button', {
      name: 'Keep Editing',
      exact: true,
    });
    this.discardAndLeaveButton = this.cancelDialog.getByRole('button', {
      name: 'Discard & Leave',
      exact: true,
    });
  }

  async goto() {
    await this.page.goto('/claims/new');
    await expect(this.page).toHaveURL(/\/claims\/new$/);
    await expect(this.page.getByRole('heading', { name: 'Incident Details' })).toBeVisible();
  }

  async fillIncidentDetails(claim) {
    await this.incidentDateInput.fill(claim.incidentDate);
    await this.incidentLocationInput.fill(claim.incidentLocation);
    await this.claimAmountInput.fill(claim.claimAmount);
  }

  async fillDescription(description) {
    await this.descriptionInput.fill(description);
  }

  async requestCancel() {
    await this.cancelButton.click();
  }

  async keepEditing() {
    await this.keepEditingButton.click();
  }

  async discardAndLeave() {
    await this.discardAndLeaveButton.click();
  }

  validationMessage(message) {
    return this.page.getByText(message, { exact: true });
  }

  async submitClaim(claim) {
    await this.fillIncidentDetails(claim);
    await this.nextButton.click();
    await expect(this.page.getByRole('heading', { name: 'Supporting Details' })).toBeVisible();

    await this.fillDescription(claim.description);
    await this.nextButton.click();
    await expect(this.page.getByRole('heading', { name: 'Review Your Claim' })).toBeVisible();
    await expect(this.page.getByText(claim.incidentLocation, { exact: true })).toBeVisible();
    await expect(this.page.getByText(claim.description, { exact: true })).toBeVisible();

    const responsePromise = this.page.waitForResponse((response) => {
      const requestUrl = new URL(response.url());
      return requestUrl.pathname === '/api/claims'
        && response.request().method() === 'POST';
    });
    await this.page.getByTestId('wizard-step-3')
      .getByRole('button', { name: 'Submit Claim', exact: true })
      .click();

    const response = await responsePromise;
    if (response.status() !== 201) {
      throw new Error(`Claim submission failed with HTTP ${response.status()}.`);
    }
    const result = await response.json();
    const claimId = result.claimId;
    if (typeof claimId !== 'string') {
      throw new Error('Claim submission response did not include a string Claim ID.');
    }

    expect(claimId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    await expect(
      this.page.getByText(`Claim submitted successfully! Claim ID: ${claimId}`, { exact: true })
    ).toBeVisible();
    await expect(this.page).toHaveURL(/\/claims$/);

    return claimId;
  }
}
