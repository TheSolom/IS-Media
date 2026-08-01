import { body, param, query } from 'express-validator';

export const isUserFolloweeValidation = [
    param('userId', 'No valid follower id is provided')
        .isInt({ min: 1 })
        .custom(async (value, { req }) => value === req.userId)
        .withMessage('You can not check yourself'),
];

export const getUserFollowersValidation = [
    query('userId', 'No valid user id is provided').if(query('userId').exists()).isInt({ min: 1 }),
];

export const isUserFollowerValidation = [
    param('userId', 'No valid followee id is provided')
        .isInt({ min: 1 })
        .custom(async (value, { req }) => value === req.userId)
        .withMessage('You can not check yourself'),
];

export const getUserFollowingsValidation = [
    query('userId', 'No valid user id is provided').if(query('userId').exists()).isInt({ min: 1 }),
];

export const postUserFollowValidation = [
    body('followeeId', 'No valid followee id is provided')
        .isInt({ min: 1 })
        .custom(async (value, { req }) => value === req.userId)
        .withMessage('You can not follow yourself'),
];

export const deleteUserFollowValidation = [
    param('followeeId', 'No valid followee id is provided')
        .isInt({ min: 1 })
        .custom(async (value, { req }) => value === req.userId)
        .withMessage('You can not unfollow yourself'),
];
