import { expect, test } from '@tests/fixtures/autenticado';
import { PaginaTopAtenienses } from '@pages/paginaTopAtenienses';
import { Helpers } from '@utils/helpers';

type VecinoPersonal = {
    rank: number;
    displayName?: string;
    totalPoints?: number;
};

type SnapshotPersonal = {
    inLeaderboard: boolean;
    rank: number;
    totalStudents?: number;
    neighbours: VecinoPersonal[];
};

let paginaTopAtenienses: PaginaTopAtenienses;
let helpers: Helpers;

test.beforeEach(({ page, sesionActiva }) => {
    void sesionActiva;
    paginaTopAtenienses = new PaginaTopAtenienses(page);
    helpers = new Helpers(page);
});

test('TC-16: Snapshot personal dentro del ranking', async () => {
    await Promise.all([
        helpers.esperarPorRespuestaAPI('/leaderboard?limit=10', 'GET', 200),
        paginaTopAtenienses.navegarALTopAtenienses(),
    ]);

    await paginaTopAtenienses.validarSeccionVisible();
    await paginaTopAtenienses.validarAlertasDeshabilitadas();

    const snapshotPersonalPromesa = paginaTopAtenienses.esperarSnapshotPersonal();
    const recargaLeaderboard = helpers.esperarPorRespuestaAPI('/leaderboard?limit=10', 'GET', 200);

    await paginaTopAtenienses.actualizarMiPosicion();

    const snapshotResponse = await snapshotPersonalPromesa;
    await recargaLeaderboard;

    expect(snapshotResponse.status()).toBe(200);

    const snapshot = (await snapshotResponse.json()) as SnapshotPersonal;

    expect(snapshot.inLeaderboard).toBeTruthy();
    expect(typeof snapshot.rank).toBe('number');
    expect(Array.isArray(snapshot.neighbours)).toBeTruthy();
    expect(snapshot.neighbours.length).toBeGreaterThan(0);

    const estudianteActual =
        snapshot.neighbours.find((vecino) => vecino.rank === snapshot.rank) ??
        snapshot.neighbours[0];

    const totalEstudiantes = snapshot.totalStudents ?? snapshot.neighbours.length;
    const puntosEstudiante = estudianteActual?.totalPoints ?? 0;
    const nombreEstudiante = estudianteActual?.displayName ?? 'Estudiante';

    await paginaTopAtenienses.validarTarjetaPersonal(
        nombreEstudiante,
        snapshot.rank,
        puntosEstudiante,
        totalEstudiantes,
    );

    await paginaTopAtenienses.validarVecinosPersonales(snapshot.neighbours);
});
