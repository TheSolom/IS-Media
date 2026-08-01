import { body, param, query } from 'express-validator';
import validator from 'validator';

import UserModel from '../models/userModel.js';
import PostModel from '../models/postModel.js';

export const getUserPostsValidation = [
    query('userId', 'No valid user id is provided')
        .if(query('userId').exists())
        .custom(async (value) => {
            if (!validator.isInt(value, { min: 1 })) return false;

            const userModel = new UserModel();
            const [userRow] = await userModel.find({ id: value });

            if (!userRow.length) throw new Error('user is not found');

            return true;
        }),
];

export const createPostValidation = [
    body('title')
        .trim()
        .default('')
        .if(body('title').exists())
        .isLength({ max: 255 })
        .withMessage('Title must be at most 255 characters'),
    body('content')
        .trim()
        .notEmpty()
        .withMessage('No valid content is provided')
        .isLength({ max: 500 })
        .withMessage('Content must be at most 500 characters'),
    body('parentId', 'No valid parent post id is provided')
        .default(null)
        .custom(async (value) => {
            if (!value) return true;

            if (!validator.isInt(value, { min: 1 })) return false;

            const postModel = new PostModel();
            const [postRow] = await postModel.find({ id: value });

            if (!postRow.length) throw new Error('parent post is not found');

            return true;
        }),
];

export const updatePostValidation = [
    body('title')
        .trim()
        .default('')
        .if(body('title').exists())
        .isLength({ max: 255 })
        .withMessage('Title must be at most 255 characters'),
    body('content')
        .trim()
        .notEmpty()
        .withMessage('No valid content is provided')
        .isLength({ max: 500 })
        .withMessage('Content must be at most 500 characters'),
    param('postId', 'No valid post id is provided').isInt({ min: 1 }),
];
