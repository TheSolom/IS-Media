import { Router } from 'express';

import { getPostTags, getTagPosts } from '../controllers/postTagsController.js';
import getTagPostsValidation from '../validations/postTagsValidation.js';
import cursorPaginationValidation from '../validations/cursorPaginationValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:postId/tags', getPostTags);

router.get('/tags/:tag', cursorPaginationValidation, getTagPostsValidation, getTagPosts);

export default router;
