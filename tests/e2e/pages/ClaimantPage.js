import { expect } from '@playwright/test';

export class ClaimantPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/claims');
    await expect(this.page).toHaveURL(/\/claims$/);
  }

  async openNewClaimWizard() {
    await this.page.getByRole('button', { name: 'Submit New Claim', exact: true }).click();
  }

  async waitUntilLoaded() {
    await expect(this.page.getByRole('status', { name: 'Loading claims' })).toHaveCount(0);
    await expect.poll(async () => (
      await this.page.getByRole('table').count()
      + await this.page.getByRole('heading', { name: 'No claims yet' }).count()
    )).toBeGreaterThan(0);
  }

  claimRow(claimId) {
    return this.page.getByRole('row').filter({ hasText: claimId.slice(0, 8) });
  }

  async openClaimDetails(claimId) {
    await this.claimRow(claimId)
      .getByRole('button', { name: 'View Details', exact: true })
      .click();
  }

  detailsDialog() {
    return this.page.getByRole('dialog', { name: 'Claim Details' });
  }
}
