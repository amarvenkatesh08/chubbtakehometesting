import { expect } from '@playwright/test';

const statusLabels = {
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export class AdminPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    const responsePromise = this.page.waitForResponse((response) => {
      const requestUrl = new URL(response.url());
      return requestUrl.pathname === '/api/admin/claims'
        && response.request().method() === 'GET';
    });
    await this.page.goto('/admin/claims');
    await expect(this.page.getByRole('heading', { name: 'Claims Management' })).toBeVisible();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    return response.json();
  }

  claimRow(claimId) {
    return this.page.getByRole('row').filter({ hasText: claimId.slice(0, 8) });
  }

  async updateClaimStatus(claimId, status) {
    const statusLabel = statusLabels[status];
    if (!statusLabel) {
      throw new Error(`Unsupported status in this workflow: ${status}`);
    }

    const select = this.page.getByRole('combobox', {
      name: `Update status for claim ${claimId.slice(0, 8)}`,
    });
    const responsePromise = this.page.waitForResponse((response) => {
      const requestUrl = new URL(response.url());
      return requestUrl.pathname === `/api/admin/claims/${claimId}/status`
        && response.request().method() === 'PATCH';
    }, { timeout: 20_000 });
    await select.selectOption(status);

    const dialog = this.page.getByRole('dialog', { name: 'Confirm Status Change' });
    await expect(dialog).toContainText(`Change status to ${statusLabel}?`);
    await dialog.getByRole('button', { name: 'Confirm', exact: true }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await expect(this.claimRow(claimId)).toContainText(statusLabel);
  }
}
