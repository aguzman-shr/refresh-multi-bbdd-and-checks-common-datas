import * as mysql from 'mysql2/promise';
import config, { excludedDbs } from '../config/config';
import { ColumnRow } from '../config/types';
export default async function compararEstructuraDetallada(dbMaestra: string) {
    let connection: mysql.Connection | null = null;

    try {
        connection = await mysql.createConnection(config);
        console.log(`🔎 Comparando columnas contra maestra: [${dbMaestra}]\n`);

        // 1. Obtener TODAS las columnas de todas las bases de datos
        const [rows] = await connection.query<ColumnRow[]>(`
            SELECT table_schema, table_name, column_name, column_type, collation_name, is_nullable
            FROM information_schema.columns
            WHERE table_schema NOT IN (${excludedDbs.map(db => `'${db}'`).join(', ')})
            ORDER BY table_schema, table_name, ordinal_position
        `);

        // 2. Organizar datos: Map<DB, Map<Tabla, Columnas[]>>
        const dbsData = new Map<string, Map<string, ColumnRow[]>>();

        rows.forEach(row => {
            if (!dbsData.has(row.TABLE_SCHEMA)) dbsData.set(row.TABLE_SCHEMA, new Map());
            const tablesMap = dbsData.get(row.TABLE_SCHEMA)!;
            if (!tablesMap.has(row.TABLE_NAME)) tablesMap.set(row.TABLE_NAME, []);
            tablesMap.get(row.TABLE_NAME)!.push(row);
        });

        const maestraTables = dbsData.get(dbMaestra);
        if (!maestraTables) throw new Error("La base de datos maestra no existe.");

        // 3. Comparar cada DB contra la Maestra
        for (const [dbNombre, tablasMap] of dbsData) {
            if (dbNombre === dbMaestra) continue;

            console.log(`🏠 Analizando Base de Datos: [${dbNombre}]`);
            let tieneDiferencias = false;

            maestraTables.forEach((columnasMaestras, nombreTabla) => {
                const columnasDestino = tablasMap.get(nombreTabla);

                if (!columnasDestino) {
                    console.log(`   ❌ Tabla faltante: ${nombreTabla}`);
                    tieneDiferencias = true;
                    return;
                }

                // Comparar columna por columna
                columnasMaestras.forEach(colM => {
                    const colD = columnasDestino.find(c => c.column_name === colM.column_name);

                    if (!colD) {
                        console.log(`   🔸 [${nombreTabla}]: Falta columna '${colM.column_name}'`);
                        tieneDiferencias = true;
                    } else if (colM.column_type !== colD.column_type || colM.collation_name !== colD.collation_name) {
                        console.log(`   ⚠️ [${nombreTabla}.${colM.column_name}]: Desajuste detectado`);
                        console.log(`      Maestra: ${colM.column_type} (${colM.collation_name})`);
                        console.log(`      Destino: ${colD.column_type} (${colD.collation_name})`);
                        tieneDiferencias = true;
                    }
                });
            });

            if (!tieneDiferencias) console.log(`   ✅ Estructura de columnas perfecta.`);
            console.log('---');
        }

    } catch (error: any) {
        console.error('🔴 Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}