import { Locator, Page } from '@playwright/test';

export class PaginaDashboard {
    readonly page: Page;
    readonly linkMisTalleres: Locator;
    readonly botonMenuUsuario: Locator;
    readonly opcionCerrarSesion: Locator;

    constructor(page: Page) {
        this.page = page;
        this.linkMisTalleres = page.getByRole('tab', { name: 'Mis Talleres' });
        this.botonMenuUsuario = page.getByRole('button', { name: /account of current user/i });
        this.opcionCerrarSesion = page.getByRole('menuitem', { name: 'Cerrar Sesión' });
    }

    async navegarADashboard() {
        await this.page.goto('/dashboard');
    }

    async esperarDashboardVisible() {
        await this.linkMisTalleres.waitFor({ state: 'visible' });
    }

    async abrirMenuUsuario() {
        await this.botonMenuUsuario.click();
        await this.opcionCerrarSesion.waitFor({ state: 'visible' });
    }

    async cerrarSesionDesdeMenu() {
        await this.abrirMenuUsuario();
        await this.opcionCerrarSesion.click();
    }
}
