import { createServer } from 'node:http';
import { Server } from 'socket.io';

import app from "./app.js";
import SocketManager from "./socket.js";

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:4000'],
        methods: ['GET', 'POST'],
    },
});

SocketManager.getInstance(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`App running on port ${PORT}`));
