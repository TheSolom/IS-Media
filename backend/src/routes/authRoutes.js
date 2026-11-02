import { Router } from 'express';

import {
    login,
    guestLogin,
    refreshLogin,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    getUploadSignature,
} from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
    loginValidation,
    signupValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
} from '../validations/authValidation.js';

const router = Router();

router.post('/login', loginValidation, login);

router.post('/guest-login', guestLogin);

router.get('/refresh-token', refreshLogin);

router.post('/signup', signupValidation, signup);

router.post('/logout', logout);

router.post('/forgot-password', forgotPasswordValidation, forgotPassword);

router.patch('/reset-password/:token', resetPasswordValidation, resetPassword);

router.get('/uploadSignature', authMiddleware, getUploadSignature);

export default router;
