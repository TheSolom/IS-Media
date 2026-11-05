import { createServer } from 'node:http';

import { Server } from 'socket.io';

import app from './app.js';
import { isOriginAllowed } from './configs/cors.js';
import SocketManager from './socket.js';

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (isOriginAllowed(origin)) {
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
