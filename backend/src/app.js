import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import errorMiddleware from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userFollowsRoutes from './routes/userFollowsRoutes.js';
import userBlocksRoutes from './routes/userBlocksRoutes.js';
import userTagsRoutes from './routes/userTagsRoutes.js';
import postRoutes from './routes/postRoutes.js';
import postLikesRoutes from './routes/postLikesRoutes.js';
import postCommentsRoutes from './routes/postCommentsRoutes.js';
import postTagsRoutes from './routes/postTagsRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import commentTagsRoutes from './routes/commentTagsRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import conversationPermissionsRoutes from './routes/conversationPermissionsRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({ origin: ['http://localhost:3000', 'https://is-media.vercel.app', 'http://localhost:4000'], credentials: true }));
app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV !== "production")
    app.use(morgan("dev"));
else
    app.use(morgan("combined"));

app.get(['/', '/api', '/api/v1'], (_req, res) => {
    res.status(418).json({
        success: true,
        message: 'Welcome to IS Media API V1',
        author: 'Islam Ashraf',
        repo: 'https://github.com/TheSolom/IS-Media',
    });
});

app.use('/api/v1/auth', authRoutes, verificationRoutes);
app.use('/api/v1/users', userRoutes, userFollowsRoutes, userBlocksRoutes, userTagsRoutes);
app.use('/api/v1/posts', postRoutes, postLikesRoutes, postCommentsRoutes, postTagsRoutes);
app.use('/api/v1/stories', storyRoutes);
app.use('/api/v1/comments', commentTagsRoutes);
app.use('/api/v1/conversations',
    conversationRoutes,
    conversationPermissionsRoutes,
    participantRoutes,
    messageRoutes,
);

app.use(errorMiddleware);

export default app;
