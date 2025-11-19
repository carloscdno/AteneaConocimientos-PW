import { test as base } from '@playwright/test';
import { Helpers } from '@utils/helpers';

type Usuario = {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
};

export const test = base.extend<{ usuarioNuevo: Usuario }>({
    usuarioNuevo: async ({ page }, use) => {
        const helpers = new Helpers(page);
        const usuario: Usuario = {
            nombre: 'Juan',
            apellido: 'Pérez',
            email: `estudiante${Date.now()}@automation.com`,
            password: 'Password123',
        };

        await helpers.crearNuevoEstudiantePorApi(
            usuario.nombre,
            usuario.apellido,
            usuario.email,
            usuario.password,
        );

        await use(usuario);
    },
});

export const expect = test.expect;
