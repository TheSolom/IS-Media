import { Router } from 'express';

import { searchUser, getUser, updateUser } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { blockGuestCredentialChanges } from '../middlewares/guestGuard.js';
import cursorPaginationValidation from '../validations/cursorPaginationValidation.js';
import { searchUserValidation, updateUserValidation } from '../validations/userValidation.js';

const router = Router();

router.use(authMiddleware);

router.get('/:username/search', cursorPaginationValidation, searchUserValidation, searchUser);

router.get('/:userId/profile', getUser);

router.put('/profile', blockGuestCredentialChanges, updateUserValidation, updateUser);

export default router;
