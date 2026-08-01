import { body, param } from 'express-validator';

export const getUserBlockStatusValidation = [
    param('userId', 'No valid user id is provided')
        .isInt({ min: 1 })
        .custom(async (value, { req }) => value === req.userId)
        .withMessage('You can not check yourself'),
];

export const postUserBlockValidation = [
    body('blockedId', 'No valid blocked id is provided')
        .isInt({ min: 1 })
        .custom(async (value, { req }) => value === req.userId)
        .withMessage('You can not block yourself'),
];

export const deleteUserBlockValidation = [
    param('blockedId', 'No valid blocked id is provided')
        .isInt({ min: 1 })
        .custom(async (value, { req }) => value === req.userId)
        .withMessage('You can not unblock yourself'),
];
