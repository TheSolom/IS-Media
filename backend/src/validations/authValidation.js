import { body, oneOf } from 'express-validator';
import { isDisposableEmail } from '../services/verificationService.js';

import UserModel from '../models/userModel.js';

export const loginValidation = [
    oneOf([
        body('emailOrUsername')
            .trim()
            .notEmpty()
            .withMessage('Please enter an email or username')
            .isEmail()
            .withMessage('Please enter a valid email'),
        body('emailOrUsername')
            .trim()
            .notEmpty()
            .withMessage('Please enter an email or username')
            .isLength({ min: 5, max: 20 })
            .withMessage(
                'Username must only contain letters and numbers between 5-20 characters long'
            )
            .isAlphanumeric()
            .withMessage(
                'Username must only contain letters and numbers'
            ),
    ]),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('You must type a password')
        .isLength({ min: 8, max: 64 })
        .withMessage('Password must be 8 to 64 characters long')
        .isAlphanumeric()
        .withMessage(
            'Password must contains only numbers and letters without spaces'
        ),
];

export const signupValidation = [
    body('firstname')
        .trim()
        .isLength({ min: 1, max: 45 })
        .withMessage('First name must be between 1-45 characters long')
        .isAlpha()
        .withMessage('First name must only contain letters'),
    body('lastname')
        .trim()
        .isLength({ min: 1, max: 45 })
        .withMessage('Last name must be between 1-45 characters long')
        .isAlpha()
        .withMessage('Last name must only contain letters'),
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Please enter a username')
        .isLength({ min: 5, max: 20 })
        .withMessage('Username must be between 5-20 characters long')
        .isAlphanumeric()
        .withMessage('Username must only contain letters and numbers')
        .custom(async (signingUsername) => {
            const userModel = new UserModel();
            const [userRow] = await userModel.find({ username: signingUsername });

            if (userRow.length)
                throw Error('This username is already in use, please try another username');
        }),
    body('email')
        .normalizeEmail({ gmail_remove_dots: false })
        .isEmail()
        .withMessage('Please enter a valid email address')
        .custom(async (signingEmail) => {
            if (isDisposableEmail(signingEmail))
                throw Error('This Email is not allowed to used');

            const userModel = new UserModel();
            const [userRow] = await userModel.find({ email: signingEmail });

            if (userRow.length)
                throw Error('This Email is already in use, please try another email');
        }),
    body('password')
        .trim()
        .exists({ values: 'falsy' })
        .withMessage('You must type a password')
        .isLength({ min: 8, max: 64 })
        .withMessage('Password must be 8 to 64 characters long')
        .isAlphanumeric()
        .withMessage('Password must contains only numbers and letters without spaces'),
    body(
        'confirmPassword',
        'Password does not match with the confirm password'
    ).custom(
        (signingConfirmPassword, { req }) =>
            signingConfirmPassword === req.body.password
    ),
    body('birthDate')
        .notEmpty()
        .withMessage('Birth date is required')
        .isISO8601()
        .withMessage('Birth date must be a valid yyyy-mm-dd date')
        .custom((signingBirthDate) => {
            const age = Math.floor(
                (new Date() - new Date(signingBirthDate)) / (1000 * 60 * 60 * 24 * 365) // convert ms to years
            );
            return age >= 13;
        })
        .withMessage('You must be at least 13 years old'),
    body('gender')
        .trim()
        .isIn(['male', 'female', 'Male', 'Female'])
        .withMessage('Gender must be male or female'),
];

export const forgotPasswordValidation = [
    oneOf([
        body('emailOrUsername')
            .trim()
            .notEmpty()
            .withMessage('Please enter an email or username')
            .isEmail()
            .withMessage('Please enter a valid email'),
        body('emailOrUsername')
            .trim()
            .notEmpty()
            .withMessage('Please enter an email or username')
            .isLength({ min: 5, max: 20 })
            .withMessage('Username must be between 5-20 characters long')
            .isAlphanumeric()
            .withMessage('Username must only contain letters and numbers between 5-20 characters long'),
    ]),
];

export const resetPasswordValidation = [
    body('password')
        .trim()
        .notEmpty()
        .withMessage('You must type a password')
        .isLength({ min: 8, max: 64 })
        .withMessage('Password must be between 8-64 characters long')
        .isAlphanumeric()
        .withMessage('Password must contains only numbers and letters without spaces'),
    body(
        'confirmPassword',
        'Password does not match with the confirm password'
    ).custom(
        (signingConfirmPassword, { req }) =>
            signingConfirmPassword === req.body.password
    ),
];

export const sendOTPValidation = [
    body('email', "Please enter the account's email address")
        .normalizeEmail({ gmail_remove_dots: false })
        .isEmail(),
    body('purpose')
        .trim()
        .isIn(['email_verification', '2fa'])
        .withMessage('Purpose must be email_verification or 2fa'),
];