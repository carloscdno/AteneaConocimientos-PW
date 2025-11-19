import { test } from '@tests/fixtures/autenticado';
import { PaginaTopAtenienses } from '@pages/paginaTopAtenienses';
import { Helpers } from '@utils/helpers';

let paginaTopAtenienses: PaginaTopAtenienses;
let helpers: Helpers;

test.beforeEach(({ page, sesionActiva }) => {
    void sesionActiva;
    paginaTopAtenienses = new PaginaTopAtenienses(page);
    helpers = new Helpers(page);
});

test('TC-15: Visualizar top 10 público', { tag: '@smoke' }, async () => {
    await Promise.all([
        helpers.esperarPorRespuestaAPI('/leaderboard?limit=10', 'GET', 200),
        paginaTopAtenienses.navegarALTopAtenienses(),
    ]);

    await paginaTopAtenienses.validarSeccionVisible();
    await paginaTopAtenienses.validarPodioCompleto();
    await paginaTopAtenienses.validarParticipantesTop10();
    await paginaTopAtenienses.validarAlertasDeshabilitadas();

    const refrescarLeaderboard = helpers.esperarPorRespuestaAPI('/leaderboard?limit=10', 'GET', 200);
    await paginaTopAtenienses.actualizarRanking();
    await refrescarLeaderboard;
    await paginaTopAtenienses.validarParticipantesTop10();
});
