import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import pool from './configs/database.js';
import bodyMiddleware from './middlewares/bodyMiddleware.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import commentTagsRoutes from './routes/commentTagsRoutes.js';
import conversationPermissionsRoutes from './routes/conversationPermissionsRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import postCommentsRoutes from './routes/postCommentsRoutes.js';
import postLikesRoutes from './routes/postLikesRoutes.js';
import postRoutes from './routes/postRoutes.js';
import postTagsRoutes from './routes/postTagsRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import userBlocksRoutes from './routes/userBlocksRoutes.js';
import userFollowsRoutes from './routes/userFollowsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userTagsRoutes from './routes/userTagsRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import { initializeDatabase } from './scripts/initDb.js';
import { seedDatabase } from './scripts/seed.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyMiddleware);

const IS_MEDIA_VERCEL_REGEX = /^https:\/\/is-media(-[a-z0-9-]+)?\.vercel\.app$/i;
const allowedOrigins = new Set([
    'http://localhost:3000',
    'https://is-media.vercel.app',
    'http://localhost:4000',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]);

app.use(
    cors({
        origin: (origin, callback) => {
            if (
                !origin ||
                allowedOrigins.has(origin) ||
                IS_MEDIA_VERCEL_REGEX.test(origin)
            ) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true,
    }),
);
app.use(helmet());
app.use(compression());

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get(['/', '/api', '/api/v1'], (_req, res) => {
    res.status(418).json({
        success: true,
        message: 'Welcome to IS Media API V1',
        author: 'Islam Ashraf',
        repo: 'https://github.com/TheSolom/IS-Media',
    });
});

let dbInitialized = false;
let dbInitPromise = null;

app.use(async (req, res, next) => {
    if (!dbInitialized && req.path.startsWith('/api')) {
        if (!dbInitPromise) {
            dbInitPromise = (async () => {
                try {
                    const [tables] = await pool.query("SHOW TABLES LIKE 'users';");
                    if (tables.length === 0) {
                        console.log("Database tables missing. Running automatic schema initialization...");
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
});

app.use('/api/v1/auth', authRoutes, verificationRoutes);
app.use('/api/v1/users', userRoutes, userFollowsRoutes, userBlocksRoutes, userTagsRoutes);
app.use('/api/v1/posts', postRoutes, postLikesRoutes, postCommentsRoutes, postTagsRoutes);
app.use('/api/v1/stories', storyRoutes);
app.use('/api/v1/comments', commentTagsRoutes);
app.use(
    '/api/v1/conversations',
    conversationRoutes,
    conversationPermissionsRoutes,
    participantRoutes,
    messageRoutes,
);

app.use(errorMiddleware);

export default app;
