import { Router } from 'express';

import {
    getUserStories,
    getFeedStories,
    getStory,
    postStory,
    deleteStory,
} from '../controllers/storyController.js';
import { getUserStoriesValidation, createStoryValidation } from '../validations/storyValidation.js';
import cursorPaginationValidation from '../validations/cursorPaginationValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/user', cursorPaginationValidation, getUserStoriesValidation, getUserStories);

router.get('/feed', cursorPaginationValidation, getFeedStories);

router.get('/:storyId', getStory);

router.post('/', createStoryValidation, postStory);

router.delete('/:storyId', deleteStory);

export default router;
