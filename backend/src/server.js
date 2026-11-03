import { createServer } from 'node:http';

import { Server } from 'socket.io';

import app from './app.js';
import SocketManager from './socket.js';

const server = createServer(app);

const IS_MEDIA_VERCEL_REGEX = /^https:\/\/is-media(-[a-z0-9-]+)?\.vercel\.app$/i;
const allowedOrigins = new Set([
    'http://localhost:3000',
    'https://is-media.vercel.app',
    'http://localhost:4000',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.has(origin) || IS_MEDIA_VERCEL_REGEX.test(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

SocketManager.getInstance(io);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
    server.listen(PORT, () => console.log(`App running on port ${PORT}`));
}

export default server;
