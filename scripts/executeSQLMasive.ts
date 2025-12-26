import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';
import config, { query } from '../config/config';
import { DatabaseRow } from '../config/types';
export default async function ejecutarScriptMasivo(): Promise<void> {
    let connection;

    try {
        const rutaArchivo = path.join(__dirname, '..', 'consulta.sql');
        const sqlOriginal = fs.readFileSync(rutaArchivo, 'utf8');

        // 1. Conexión inicial al servidor
        connection = await mysql.createConnection(config);
        console.log('✅ Conectado al servidor MySQL');

        // 2. Obtener nombres de bases de datos (excluyendo las del sistema)
        const [rows] = await connection.query<DatabaseRow[]>(query);
         console.log(`Bases de datos encontradas: ${rows.length}`);
        // 3. Iterar y ejecutar tu SQL
        for (const dbRow of rows) {
            const dbName = dbRow.SCHEMA_NAME;
            
            try {
                // 3. "Usar" la base de datos actual
                await connection.query(`USE \`${dbName}\``);
                
                // 4. Ejecutar el contenido del archivo SQL
                // Nota: Si el archivo tiene varias consultas, mysql2 permite 
                // habilitar 'multipleStatements: true' en la config inicial.
                await connection.query(sqlOriginal);

                console.log(`  ✔ Procesada: ${dbName}`);
            } catch (err:any) {
                console.error(`  ✘ Error en ${dbName}: ${err.message}`);
            }
            console.log(`--------------------------------------`);
        }

    } catch (error) {
        console.error('Error crítico:', error);
    } finally {
        if (connection) await connection.end();
        console.log('Terminado.');
    }
}