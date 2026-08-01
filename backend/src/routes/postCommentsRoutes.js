import { Router } from 'express';

import {
    getPostComment,
    getPostComments,
    postPostComment,
    updatePostComment,
    deletePostComment,
} from '../controllers/postCommentsController.js';
import {
    getPostCommentsValidation,
    createPostCommentValidation,
    updatePostCommentValidation,
} from '../validations/postCommentsValidation.js';
import cursorPaginationValidation from '../validations/cursorPaginationValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/comments/:commentId', getPostComment);

router.get(
    '/:postId/comments',
    cursorPaginationValidation,
    getPostCommentsValidation,
    getPostComments,
);

router.post('/comments', createPostCommentValidation, postPostComment);

router.put('/comments/:commentId', updatePostCommentValidation, updatePostComment);

router.delete('/comments/:commentId', deletePostComment);

export default router;
