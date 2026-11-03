import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

import mysql from 'mysql2/promise';

import pool from '../configs/database.js';

export async function initializeDatabase(targetConnection) {
    const conn = targetConnection || pool;
    console.log('Running schema.sql...');
    const schemaPath = new URL('./schema.sql', import.meta.url);
    const sql = readFileSync(schemaPath, 'utf-8');
    await conn.query(sql);
    console.log('Schema executed successfully!');
}

async function runStandalone() {
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.MYSQL_PORT) || 3306;
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD;
    const database = process.env.MYSQL_DATABASE || 'is_media';

    console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

    try {
        const rootConnection = await mysql.createConnection({
            host,
            port,
            user,
            password,
            multipleStatements: true,
        });

        try {
            console.log(`Ensuring database '${database}' exists...`);
            await rootConnection.query(
                `CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
            );
        } finally {
            await rootConnection.end();
        }
    } catch (err) {
        console.warn(
            'Could not run CREATE DATABASE (normal for restricted/cloud users):',
            err.message,
        );
    }

    await initializeDatabase();
    console.log('\nDatabase initialization completed successfully!');
}

if (process.argv[1]?.endsWith('initDb.js')) {
    try {
        await runStandalone();
    } catch (err) {
        console.error('\n❌ Database initialization failed:', err);
        process.exit(1);
    }
}
