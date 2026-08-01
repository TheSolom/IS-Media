import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

try {
    const connection = await pool.getConnection();
    console.log('✅ Database pool connected successfully.');
    connection.release();
} catch (err) {
    console.error('❌ Database pool initialization failed:', err.message);
}

export default pool;
