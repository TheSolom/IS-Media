import { Router } from 'express';

import {
    searchParticipant,
    getParticipant,
    getParticipants,
    postParticipant,
    deleteParticipant,
} from '../controllers/participantController.js';
import {
    searchParticipantValidation,
    getParticipantsValidation,
    postParticipantsValidation,
    deleteParticipantValidation,
} from '../validations/participantValidation.js';
import cursorPaginationValidation from '../validations/cursorPaginationValidation.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:conversationId/participants/:username/search', cursorPaginationValidation, searchParticipantValidation, searchParticipant);

router.get('/:conversationId/participants/:userId', getParticipant);

router.get('/:conversationId/participants', getParticipantsValidation, getParticipants);

router.post('/:conversationId/participants', postParticipantsValidation, postParticipant);

router.delete('/:conversationId/participants/:participantId', deleteParticipantValidation, deleteParticipant);

export default router;