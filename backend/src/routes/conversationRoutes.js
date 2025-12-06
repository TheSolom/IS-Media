import { Router } from 'express';

import {
    searchConversation,
    getUserConversations,
    getConversation,
    getDMConversation,
    postConversation,
    updateConversation,
    deleteConversation,
} from '../controllers/conversationController.js';
import {
    searchConversationValidation,
    postConversationValidation,
    updateConversationValidation
} from '../validations/conversationValidation.js';
import cursorPaginationValidation from '../validations/cursorPaginationValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:title/search', cursorPaginationValidation, searchConversationValidation, searchConversation);

router.get('/', cursorPaginationValidation, getUserConversations);

router.get('/:conversationId', getConversation);

router.get('/users/:userId', getDMConversation);

router.post('/', postConversationValidation, postConversation);

router.put('/:conversationId', updateConversationValidation, updateConversation);

router.delete('/:conversationId', deleteConversation);

export default router;