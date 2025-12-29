import 'dotenv/config';
import * as mysql from 'mysql2/promise';

const config: mysql.ConnectionOptions = {
    host: process.env.HOST,
    port: Number(process.env.PORT),
    user: process.env.USER,
    password: process.env.PASSWORD,
    multipleStatements: true // Permite ejecutar múltiples consultas en una sola llamada
};

export const excludedDbs: string[] = [
    `b2p_payments_web_service`,
    `beds2b_agencies`,
    `beds2b_clients`,
    `beds2b_empty_client`,
    `senator_pbi_test`,
    `sys`,
    'beds2b_currency_exchange',
    'beds2b_discount_suppliers',
    'beds2b_rewards',
    'information_schema',
    'performance_schema',
    'mysql'];

export const query = `
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN (${excludedDbs.map(db => `'${db}'`).join(', ')})
        `
export default config;