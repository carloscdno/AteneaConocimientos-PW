import dotenv from 'dotenv';
import { test, expect } from '@playwright/test';
import { PaginaLogin } from '@pages/paginaLogin';
import { PaginaDashboard } from '@pages/paginaDashboard';
import { Helpers } from '@utils/helpers';

dotenv.config();

const usuarioValido = process.env.E2E_USER;
const passwordValida = process.env.E2E_PASS;

test.skip(
    !usuarioValido || !passwordValida,
    'E2E_USER y E2E_PASS son obligatorios para este test.',
);

let helpers: Helpers;
let paginaLogin: PaginaLogin;
let paginaDashboard: PaginaDashboard;

test.beforeEach(({ page }) => {
    helpers = new Helpers(page);
    paginaLogin = new PaginaLogin(page);
    paginaDashboard = new PaginaDashboard(page);
});

test('TC-32: Login exitoso con credenciales válidas', { tag: '@smoke' }, async ({ page }) => {
    await paginaLogin.navegarALogin();
    await paginaLogin.iniciarSesion(usuarioValido!, passwordValida!);
    await helpers.esperarPorRespuestaAPI('/api/students/login', 'POST', 200);
    await paginaDashboard.esperarDashboardVisible();
    await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
    await expect(paginaDashboard.linkMisTalleres).toBeVisible();
});
