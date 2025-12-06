import { body } from 'express-validator';

export const sendVerificationOTPValidation = [
    body('userId', 'Please enter the account\'s id')
        .trim()
        .notEmpty()
        .isNumeric()
        .custom(value => value > 0),
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Please enter the account\'s username')
        .isLength({ min: 5, max: 20 })
        .withMessage('Username must be between 5-20 characters long')
        .isAlphanumeric()
        .withMessage('Username must only contain letters and numbers'),
    body('email', 'Please enter the account\'s email address')
        .normalizeEmail({ gmail_remove_dots: false })
        .isEmail(),
];

export const send2FAValidation = [];

export const verifyOTPValidation = [
    body('userId', 'Please enter the account\'s id')
        .trim()
        .notEmpty()
        .isNumeric()
        .custom(value => value > 0),
    body('otp', 'Invalid OTP')
        .trim()
        .notEmpty()
        .isNumeric()
        .isLength({ min: 6, max: 6 }),
    body('purpose')
        .trim()
        .notEmpty()
        .withMessage('Please enter the purpose of the OTP')
        .isIn(['email_verification', '2fa_verification'])
        .withMessage('Invalid purpose'),
];
