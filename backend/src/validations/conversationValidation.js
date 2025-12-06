import { body, param } from 'express-validator';

import checkImageUrl from '../utils/isValidImageUrl.js';

export const searchConversationValidation = [
    param('title')
        .trim()
        .notEmpty()
        .withMessage('No valid title is provided')
        .isAlphanumeric()
        .withMessage('Title must only contain letters and numbers'),
];

export const postConversationValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 90 })
        .withMessage('Title must be between 1-90 characters long'),
    body('image', 'image must be a valid URL')
        .default(null)
        .custom(async (value) => !value ? true : checkImageUrl(value)),
    body('type', 'No valid type is provided')
        .isIn(['1', '2']),
    body('participants', 'No valid participants are provided')
        .isArray({ min: 1 })
        .withMessage('Participants must be an array with at least 1 participant')
        .custom((value) => value.every((participant) => typeof participant === 'number' && participant > 0))
];

export const updateConversationValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 90 })
        .withMessage('Title must be between 1-90 characters long'),
    body('image', 'image must be a valid URL')
        .default(null)
        .custom(async (value) => !value ? true : checkImageUrl(value)),
];
