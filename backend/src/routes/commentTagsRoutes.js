import { Router } from 'express';

import { getCommentTags, getTagComments } from '../controllers/commentTagsController.js';
import getTagCommentsValidation from '../validations/commentTagsValidation.js';
import cursorPaginationValidation from '../validations/cursorPaginationValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:commentId/tags', getCommentTags);

router.get('/tags/:tag', cursorPaginationValidation, getTagCommentsValidation, getTagComments);

export default router;
