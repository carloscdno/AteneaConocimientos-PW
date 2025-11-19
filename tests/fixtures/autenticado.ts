import { test as base } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { PaginaLogin } from '@pages/paginaLogin';
import { Helpers } from '@utils/helpers';

dotenv.config();

const authStatePath =
    process.env.AUTH_STATE_PATH ?? path.join(process.cwd(), 'assets', 'auth', 'state.json');
const storageStateDisponible = fs.existsSync(authStatePath);

type Fixtures = {
    sesionActiva: void;
};

export const test = base.extend<Fixtures>({
    sesionActiva: async ({ page }, use) => {
        if (!storageStateDisponible) {
            const email = process.env.E2E_USER;
            const password = process.env.E2E_PASS;

            if (!email || !password) {
                throw new Error('Debes configurar E2E_USER y E2E_PASS para ejecutar este flujo.');
            }

            const paginaLogin = new PaginaLogin(page);
            const helpers = new Helpers(page);

            await paginaLogin.navegarALogin();
            await paginaLogin.iniciarSesion(email, password);
            await helpers.esperarPorRespuestaAPI('/api/students/login', 'POST', 200);
        }

        await use();
    },
});

if (storageStateDisponible) {
    test.use({ storageState: authStatePath });
}

export const expect = test.expect;
