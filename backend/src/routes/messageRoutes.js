import { Router } from 'express';

import {
    searchMessage,
    getMessages,
    postMessage,
    updateMessage,
    deleteMessage,
} from '../controllers/messageController.js';
import {
    searchMessageValidation,
    getMessagesValidation,
    postMessageValidation,
    updateMessageValidation,
    deleteMessageValidation,
} from '../validations/messageValidation.js';
import cursorPaginationValidation from '../validations/cursorPaginationValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:conversationId/messages/:message/search', cursorPaginationValidation, searchMessageValidation, searchMessage);

router.get('/:conversationId/messages', cursorPaginationValidation, getMessagesValidation, getMessages);

router.post('/:conversationId/messages', postMessageValidation, postMessage);

router.patch('/:conversationId/messages/:messageId', updateMessageValidation, updateMessage);

router.delete('/:conversationId/messages/:messageId', deleteMessageValidation, deleteMessage);

export default router;