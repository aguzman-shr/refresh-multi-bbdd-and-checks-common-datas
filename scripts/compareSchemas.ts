import * as mysql from 'mysql2/promise';
import config, { query } from '../config/config';
import { TableRow } from '../config/types';
export default async function compararContraMaestra(dbMaestra: string) {

    let connection: mysql.Connection | null = null;

    try {
        connection = await mysql.createConnection(config);
        console.log(`🔍 Comparando bases de datos contra la maestra: [${dbMaestra}]`);

        // 1. Obtener todas las tablas del servidor
        const [rows] = await connection.query<TableRow[]>(query);

        // 2. Agrupar tablas por base de datos
        const dbsMap = new Map<string, string[]>();
        rows.forEach(row => {
            if (!dbsMap.has(row.TABLE_SCHEMA)) dbsMap.set(row.TABLE_SCHEMA, []);
            dbsMap.get(row.TABLE_SCHEMA)?.push(row.TABLE_NAME);
        });

        // 3. Extraer las tablas de la maestra
        const tablasMaestras = dbsMap.get(dbMaestra);

        if (!tablasMaestras) {
            console.error(`❌ Error: La base de datos maestra '${dbMaestra}' no existe o no tiene tablas.`);
            return;
        }

        console.log(`📋 La maestra tiene ${tablasMaestras.length} tablas.\n`);

        // 4. Comparar cada base de datos contra la maestra
        dbsMap.forEach((tablasEnEstaDB, dbNombre) => {
            if (dbNombre === dbMaestra) return; // Saltamos la maestra en la comparación

            const faltantes = tablasMaestras.filter(t => !tablasEnEstaDB.includes(t));
            const sobrantes = tablasEnEstaDB.filter(t => !tablasMaestras.includes(t));

            if (faltantes.length === 0 && sobrantes.length === 0) {
                console.log(`✅ [${dbNombre}]: Estructura idéntica.`);
            } else {
                console.log(`⚠️ [${dbNombre}]: Diferencias detectadas:`);
                if (faltantes.length > 0) {
                    console.log(`   ❌ Faltan en esta DB: ${faltantes.join(', ')}`);
                }
                if (sobrantes.length > 0) {
                    console.log(`   ➕ Sobran (no están en maestra): ${sobrantes.join(', ')}`);
                }
            }
            console.log('---');
        });

    } catch (error: any) {
        console.error('🔴 Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}
