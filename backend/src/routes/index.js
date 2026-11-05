import { Router } from 'express';

import authRoutes from './authRoutes.js';
import commentTagsRoutes from './commentTagsRoutes.js';
import conversationPermissionsRoutes from './conversationPermissionsRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import messageRoutes from './messageRoutes.js';
import participantRoutes from './participantRoutes.js';
import postCommentsRoutes from './postCommentsRoutes.js';
import postLikesRoutes from './postLikesRoutes.js';
import postRoutes from './postRoutes.js';
import postTagsRoutes from './postTagsRoutes.js';
import storyRoutes from './storyRoutes.js';
import userBlocksRoutes from './userBlocksRoutes.js';
import userFollowsRoutes from './userFollowsRoutes.js';
import userRoutes from './userRoutes.js';
import userTagsRoutes from './userTagsRoutes.js';
import verificationRoutes from './verificationRoutes.js';

const router = Router();

router.use('/auth', authRoutes, verificationRoutes);
router.use('/users', userRoutes, userFollowsRoutes, userBlocksRoutes, userTagsRoutes);
router.use('/posts', postRoutes, postLikesRoutes, postCommentsRoutes, postTagsRoutes);
router.use('/stories', storyRoutes);
router.use('/comments', commentTagsRoutes);
router.use(
    '/conversations',
    conversationRoutes,
    conversationPermissionsRoutes,
    participantRoutes,
    messageRoutes,
);

export default router;
