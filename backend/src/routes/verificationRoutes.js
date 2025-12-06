import { Router } from 'express';

import {
    sendVerificationOTP,
    send2FA,
    verifyOTP
} from '../controllers/verificationController.js';
import {
    sendVerificationOTPValidation,
    send2FAValidation,
    verifyOTPValidation,
} from '../validations/verificationValidation.js';

const router = Router();

router.post('/send-verification-otp', sendVerificationOTPValidation, sendVerificationOTP);

router.post('/send-2fa', send2FAValidation, send2FA);

router.post('/verify-otp', verifyOTPValidation, verifyOTP);

export default router;
