import { expect, Locator, Page, Response } from '@playwright/test';

export class PaginaTopAtenienses {
    readonly page: Page;
    readonly tituloSeccion: Locator;
    readonly botonActualizarRanking: Locator;
    readonly posicionesNumeradas: Locator;
    readonly alertaSesionObligatoria: Locator;
    readonly medallaOro: Locator;
    readonly medallaPlata: Locator;
    readonly medallaBronce: Locator;
    readonly headingPosicionActual: Locator;

    constructor(page: Page) {
        this.page = page;
        this.tituloSeccion = page.getByRole('heading', { name: 'Top Atenienses' });
        this.botonActualizarRanking = page.getByRole('button', {
            name: /Actualizar (ranking|mi posición)/i,
        });
        this.medallaOro = page.getByText('🥇');
        this.medallaPlata = page.getByText('🥈');
        this.medallaBronce = page.getByText('🥉');
        this.posicionesNumeradas = page.getByText(/^#(4|5|6|7|8|9|10)$/);
        this.alertaSesionObligatoria = page.getByText('Inicia sesión como estudiante', {
            exact: false,
        });
        this.headingPosicionActual = page.getByRole('heading', {
            name: 'Tu posición actual',
            level: 5,
        });
    }

    async navegarALTopAtenienses() {
        await this.page.goto('/top-atenienses');
    }

    async actualizarRanking() {
        await this.actualizarMiPosicion();
    }

    async actualizarMiPosicion() {
        await this.botonActualizarRanking.click();
    }

    async validarSeccionVisible() {
        await expect(this.tituloSeccion).toBeVisible();
        await expect(this.botonActualizarRanking).toBeVisible();
    }

    async validarPodioCompleto() {
        await expect(this.medallaOro).toBeVisible();
        await expect(this.medallaPlata).toBeVisible();
        await expect(this.medallaBronce).toBeVisible();
    }

    async validarParticipantesTop10() {
        await expect(this.posicionesNumeradas).toHaveCount(7);
    }

    async validarAlertasDeshabilitadas() {
        await expect(this.alertaSesionObligatoria).toHaveCount(0);
    }

    async validarTarjetaPersonal(
        nombre: string,
        rango: number,
        puntos: number,
        totalEstudiantes: number,
    ) {
        const tarjeta = this.obtenerTarjetaPosicionActual();
        await expect(this.headingPosicionActual).toBeVisible();

        const resumenPattern = new RegExp(
            `#${rango}\\s*de\\s*${totalEstudiantes}\\s+atenienses`,
            'i',
        );
        await expect(tarjeta.getByText(resumenPattern)).toBeVisible();

        const nombrePattern = new RegExp(`#${rango}\\s+${this.escapeRegExp(nombre)}`, 'i');
        await expect(tarjeta.getByText(nombrePattern)).toBeVisible();

        const regexPuntos = new RegExp(`${puntos}\\s*pts`, 'i');
        await expect(tarjeta.getByText(regexPuntos).first()).toBeVisible();
    }

    async validarVecinosPersonales(
        vecinos: Array<{ rank: number; displayName?: string; totalPoints?: number }>,
    ) {
        const tarjeta = this.obtenerTarjetaPosicionActual();
        for (const vecino of vecinos) {
            if (!vecino.displayName) {
                continue;
            }
            const nombrePattern = new RegExp(
                `#${vecino.rank}\\s+${this.escapeRegExp(vecino.displayName)}`,
                'i',
            );
            await expect(tarjeta.getByText(nombrePattern)).toBeVisible();

            if (typeof vecino.totalPoints === 'number') {
                const puntosPattern = new RegExp(`${vecino.totalPoints}\\s*pts`, 'i');
                await expect(tarjeta.getByText(puntosPattern).first()).toBeVisible();
            }
        }
    }

    esperarSnapshotPersonal(): Promise<Response> {
        return this.page.waitForResponse(
            (response) =>
                response.url().includes('/api/students/leaderboard/personal') &&
                response.request().method() === 'GET',
        );
    }

    private obtenerHeadingDeEstudiante(nombre: string): Locator {
        const pattern = new RegExp(`^${this.escapeRegExp(nombre)}$`, 'i');
        return this.page.getByRole('heading', { level: 6, name: pattern });
    }

    private obtenerTarjetaPosicionActual(): Locator {
        return this.headingPosicionActual.locator(
            'xpath=ancestor::div[contains(@class,"MuiPaper-root")][1]',
        );
    }

    private obtenerContenedorTarjeta(nombre: string): Locator {
        return this.obtenerHeadingDeEstudiante(nombre)
            .first()
            .locator('xpath=ancestor::div[contains(@class,"MuiPaper-root")][1]');
    }

    private escapeRegExp(texto: string): string {
        return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
