import pool from '../configs/database.js';
import { initializeDatabase } from '../scripts/initDb.js';
import { seedDatabase } from '../scripts/seed.js';

let dbInitialized = false;
let dbInitPromise = null;

const dbInitMiddleware = async (req, _res, next) => {
    if (!dbInitialized && req.path.startsWith('/api')) {
        if (!dbInitPromise) {
            dbInitPromise = (async () => {
                try {
                    const [tables] = await pool.query("SHOW TABLES LIKE 'users';");
                    if (tables.length === 0) {
                        console.log(
                            'Database tables missing. Running automatic schema initialization...',
                        );
                        await initializeDatabase();
                        await seedDatabase();
                    }
                    dbInitialized = true;
                } catch (err) {
                    console.error('Database auto-check error:', err.message);
                } finally {
                    dbInitPromise = null;
                }
            })();
        }
        await dbInitPromise;
    }
    next();
};

export default dbInitMiddleware;
