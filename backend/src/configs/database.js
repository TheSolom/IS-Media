import mysql from 'mysql2/promise';

const sslConfig =
    process.env.MYSQL_SSL === 'true'
        ? {
              rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false',
              ...(process.env.MYSQL_CA_CERT && { ca: process.env.MYSQL_CA_CERT }),
          }
        : undefined;

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? Number.parseInt(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: process.env.VERCEL ? 2 : 10,
    queueLimit: 0,
    ssl: sslConfig,
    multipleStatements: true,
});

if (!process.env.VERCEL) {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database pool connected successfully.');
        connection.release();
    } catch (err) {
        console.error('❌ Database pool initialization failed:', err.message);
    }
}

export default pool;
