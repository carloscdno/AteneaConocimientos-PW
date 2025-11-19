import { Locator, Page } from '@playwright/test';

export class PaginaDashboard {
    readonly page: Page;
    readonly linkMisTalleres: Locator;

    constructor(page: Page) {
        this.page = page;
        this.linkMisTalleres = page.getByRole('tab', { name: 'Mis Talleres' });
    }

    async navegarADashboard() {
        await this.page.goto('/dashboard');
    }

    async esperarDashboardVisible() {
        await this.linkMisTalleres.waitFor({ state: 'visible' });
    }
}
