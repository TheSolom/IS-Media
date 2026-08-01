import { Router } from 'express';

import {
    getUserPosts,
    getFeedPosts,
    getSuggestedPosts,
    getPost,
    postPost,
    updatePost,
    deletePost,
} from '../controllers/postController.js';
import {
    getUserPostsValidation,
    createPostValidation,
    updatePostValidation,
} from '../validations/postValidation.js';
import cursorPaginationValidation from '../validations/cursorPaginationValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/user', cursorPaginationValidation, getUserPostsValidation, getUserPosts);

router.get('/feed', cursorPaginationValidation, getFeedPosts);

router.get('/suggestions', cursorPaginationValidation, getSuggestedPosts);

router.get('/:postId', getPost);

router.post('/', createPostValidation, postPost);

router.put('/:postId', updatePostValidation, updatePost);

router.delete('/:postId', deletePost);

export default router;
