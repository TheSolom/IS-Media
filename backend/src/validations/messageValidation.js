import { body, param } from 'express-validator';
import validator from 'validator';

import ConversationModel from '../models/conversationModel.js';
import PostModel from '../models/postModel.js';
import checkImageUrl from '../utils/isValidImageUrl.js';

export const searchMessageValidation = [
    param('content')
        .trim()
        .notEmpty()
        .withMessage('No valid content is provided')
];

export const getMessagesValidation = [
    param('conversationId', 'No valid conversation id is provided')
        .custom(async (value) => {
            if (!validator.isInt(value, { min: 1 }))
                return false;

            const conversationModel = new ConversationModel();
            const [conversationRow] = await conversationModel.find({ id: value });

            if (!conversationRow.length)
                return false;

            return true;
        })
];

export const postMessageValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('No valid content is provided')
        .isLength({ max: 1000 })
        .withMessage('Message must be at most 1000 characters'),
    body('image', 'image must be a valid URL')
        .default(null)
        .custom(async (value) => !value ? true : checkImageUrl(value)),
    param('conversationId', 'No valid conversation id is provided')
        .custom(async (value) => {
            if (!validator.isInt(value, { min: 1 }))
                return false;

            const conversationModel = new ConversationModel();
            const [conversationRow] = await conversationModel.find({ id: value });

            if (!conversationRow.length)
                return false;

            return true;
        }),
    body('parentId', 'No valid parent post id is provided')
        .default(null)
        .custom(async (value) => {
            if (!value)
                return true;

            if (!validator.isInt(value, { min: 1 }))
                return false;

            const postModel = new PostModel();
            const [postRow] = await postModel.find({ id: value });

            if (!postRow.length)
                return false;

            return true;
        }),
];

export const updateMessageValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('No valid content is provided')
        .isLength({ max: 1000 })
        .withMessage('Message must be at most 1000 characters'),
    param('conversationId', 'No valid conversation id is provided')
        .custom(async (value) => {
            if (!validator.isInt(value, { min: 1 }))
                return false;

            const conversationModel = new ConversationModel();
            const [conversationRow] = await conversationModel.find({ id: value });

            if (!conversationRow.length)
                return false;

            return true;
        }),
];

export const deleteMessageValidation = [
    param('conversationId', 'No valid conversation id is provided')
        .custom(async (value) => {
            if (!validator.isInt(value, { min: 1 }))
                return false;

            const conversationModel = new ConversationModel();
            const [conversationRow] = await conversationModel.find({ id: value });

            if (!conversationRow.length)
                return false;

            return true;
        }),
];
