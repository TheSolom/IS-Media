import { param } from 'express-validator';

const getTagCommentsValidation = [
    param('tag')
        .trim()
        .notEmpty()
        .withMessage('No valid tag is provided')
        .isLength({ max: 499 })
        .withMessage('Tag must be between 1 - 499 characters long')
        .isAlphanumeric()
        .withMessage('Tag must only contain letters and numbers'),
];

export default getTagCommentsValidation;
