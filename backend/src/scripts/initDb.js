import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import mysql from 'mysql2/promise';

async function initializeDatabase() {
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.MYSQL_PORT) || 3306;
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_ROOT_PASSWORD;
    const database = process.env.MYSQL_DATABASE || 'is_media';

    console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

    // 1. Ensure database exists
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

    // 2. Connect to target database and execute schema
    const connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
        multipleStatements: true,
    });

    try {
        console.log(`Connected to database '${database}'. Running schema.sql...`);

        const schemaPath = join(import.meta.dirname, 'schema.sql');
        const sql = readFileSync(schemaPath, 'utf-8');

        await connection.query(sql);
        console.log('Schema executed successfully!');

        // 3. Verify created tables
        const [tables] = await connection.query('SHOW TABLES;');
        const tableNames = tables.map((row) => Object.values(row)[0]);

        console.log(`\nVerified ${tableNames.length} tables in '${database}':`);
        tableNames.forEach((name, idx) => {
            console.log(`  ${idx + 1}. ${name}`);
        });

        const [roles] = await connection.query('SELECT id, role FROM user_roles;');
        console.log(
            `\nSeed user_roles (${roles.length} records):`,
            roles.map((r) => r.role).join(', '),
        );

        const [permissions] = await connection.query(
            'SELECT id, permission FROM restricted_permissions;',
        );
        console.log(
            `Seed restricted_permissions (${permissions.length} records):`,
            permissions.map((p) => p.permission).join(', '),
        );
    } finally {
        await connection.end();
    }

    console.log('\nDatabase initialization completed successfully!');
}

initializeDatabase().catch((err) => {
    console.error('\n❌ Database initialization failed:');
    console.error(err.sqlMessage || err.message);
    if (err.sql) {
        console.error('Failing SQL statement:\n', err.sql);
    }
    process.exit(1);
});
