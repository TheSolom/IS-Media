import socketAuthMiddleware from './middlewares/socketAuthMiddleware.js';

export default class SocketManager {
    static #instance = null;

    static #io;

    static #userSocketMap;

    #socket = null;

    constructor(io) {
        if (SocketManager.#instance)
            throw new Error('Cannot create another instance of SocketManager');

        SocketManager.#io = io;
        SocketManager.#userSocketMap = {};

        this.initializeAuthMiddleware();
        this.initializeErrorMiddleware();
        this.#onUserConnection();
    }

    static getInstance (io) {
        if (!SocketManager.#instance && io)
            SocketManager.#instance = new SocketManager(io);

        return SocketManager.#instance;
    }

    static getUserSocketId (userId) {
        return this.#userSocketMap[userId];
    }

    initializeAuthMiddleware () {
        SocketManager.#io.use(socketAuthMiddleware);
    }

    initializeErrorMiddleware () {
        SocketManager.#io.use((socket, next) => {
            this.#socket.errorHandler = (error) => {
                socket.emit("error", { success: false, message: error });
            };

            next();
        });
    }

    #onUserConnection () {
        SocketManager.#io.on('connection', async (socket) => {
            this.#socket = socket;

            const { userId } = this.#socket.handshake.query;

            if (userId)
                SocketManager.#userSocketMap[userId] = this.#socket.id;

            SocketManager.#io.emit('getOnlineUsers', SocketManager.#userSocketMap);

            this.#onUserDisconnection();
            this.#onUserJoinConversations();
        });
    }

    #onUserDisconnection () {
        this.#socket.on('disconnect', () => {
            const { userId } = this.#socket.handshake.query;

            if (userId)
                delete SocketManager.#userSocketMap[userId];

            SocketManager.#io.emit('getOnlineUsers', SocketManager.#userSocketMap);
        });
    }

    #onUserJoinConversations () {
        this.#socket.on('joinConversations', (conversationsIds) => {
            if (!conversationsIds || !conversationsIds.length)
                return;

            this.#socket.join(conversationsIds);
        });
    }

    emitNewMessage (message, conversationId) {
        if (!message || !conversationId)
            return;

        SocketManager.#io.to(conversationId).emit('newMessage', message);
    }
}
