import { param, query } from 'express-validator';
import validator from 'validator';

import ConversationModel from '../models/conversationModel.js';

export const searchParticipantValidation = [
    param('username')
        .trim()
        .notEmpty()
        .withMessage('No valid username is provided')
        .isAlphanumeric()
        .withMessage('Username must only contain letters and numbers'),
];

export const getParticipantsValidation = [
    param('conversationId', 'No valid conversation id is provided')
        .custom(async (value) => {
            if (!validator.isInt(value, { min: 1 }))
                return false;

            const conversationModel = new ConversationModel();
            const [conversationRow] = await conversationModel.find({ id: value });

            if (!conversationRow.length)
                throw new Error('conversation is not found');

            return true;
        }),
    query('adminsOnly', 'adminsOnly must be a boolean value true/false')
        .if(query('adminsOnly').exists())
        .isBoolean()
        .isIn([true, false]),
    query('pastOnly', 'pastOnly must be a boolean value true/false')
        .if(query('pastOnly').exists())
        .isBoolean()
        .isIn([true, false]),
];

export const postParticipantsValidation = [
    param('conversationId', 'No valid conversation id is provided')
        .custom(async (value) => {
            if (!validator.isInt(value, { min: 1 }))
                return false;

            const conversationModel = new ConversationModel();
            const [conversationRow] = await conversationModel.find({ id: value });

            if (!conversationRow.length)
                throw new Error('conversation is not found');

            return true;
        }),
];

export const deleteParticipantValidation = [
    param('conversationId', 'No valid conversation id is provided')
        .custom(async (value) => {
            if (!validator.isInt(value, { min: 1 }))
                return false;

            const conversationModel = new ConversationModel();
            const [conversationRow] = await conversationModel.find({ id: value });

            if (!conversationRow.length)
                throw new Error('conversation is not found');

            return true;
        }),
];
