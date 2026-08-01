import Denque from 'denque';

import UserFollowersModel from '../models/userFollowersModel.js';

export const isUserFollowee = async (followerId, userId) => {
    const userFollowersModel = new UserFollowersModel();

    try {
        const [followRow] = await userFollowersModel.find({
            user_id: userId,
            follower_id: followerId,
        });

        return {
            success: true,
            followStatus: followRow,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the follow status',
            status: 500,
        };
    }
};

export const getUserFollowers = async (userId, lastId, limit) => {
    const userFollowersModel = new UserFollowersModel();

    try {
        const [followersRows] = await userFollowersModel.findFollowers(userId, lastId, limit);

        const id = followersRows.length ? followersRows[0].id : 0;

        return {
            success: true,
            lastId: id,
            followers: followersRows,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the followers',
            status: 500,
        };
    }
};

export const isUserFollower = async (followeeId, userId) => {
    const userFollowersModel = new UserFollowersModel();

    try {
        const [followRow] = await userFollowersModel.find({
            user_id: followeeId,
            follower_id: userId,
        });

        return {
            success: true,
            followStatus: followRow,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the follow status',
            status: 500,
        };
    }
};

export const getUserFollowings = async (userId, lastId, limit) => {
    const userFollowersModel = new UserFollowersModel();

    try {
        const [followeesRows] = await userFollowersModel.findFollowees(userId, lastId, limit);

        const id = followeesRows.length ? followeesRows[0].id : 0;

        return {
            success: true,
            lastId: id,
            followings: followeesRows,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the followings',
            status: 500,
        };
    }
};

export const getUserFollowSuggestions = async (currentUserId, limit) => {
    const userFollowersModel = new UserFollowersModel();

    try {
        const MAX_LIMIT = 1000;
        const [followsRows] = await userFollowersModel.findAllFollows(MAX_LIMIT);

        const graph = new Map();

        followsRows.forEach((follow) => {
            const { user_id: userId, follower_id: followerId } = follow;

            if (!graph.has(followerId)) graph.set(followerId, new Set());
            graph.get(followerId).add(userId);
        });

        const visited = new Map();
        const queue = new Denque();

        visited.set(currentUserId, true);
        queue.push(currentUserId);

        const suggestedUsers = [];
        while (!queue.isEmpty()) {
            const current = queue.pop();
            const neighbours = graph.get(current);

            if (neighbours) {
                // eslint-disable-next-line no-restricted-syntax
                for (const neighbour of neighbours) {
                    if (!visited.has(neighbour)) {
                        visited.set(neighbour, true);
                        queue.push(neighbour);
                        suggestedUsers.push(neighbour);
                    }
                }
            }
        }

        const [usersRows] = await userFollowersModel.findValidFollowSuggestions(
            suggestedUsers,
            currentUserId,
            limit,
        );

        return {
            success: true,
            users: usersRows,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the followings suggestions',
            status: 500,
        };
    }
};

export const postUserFollow = async (followeeId, followerId) => {
    const userFollowersModel = new UserFollowersModel();

    try {
        const createResult = await userFollowersModel.create({
            user_id: followeeId,
            follower_id: followerId,
        });

        if (!createResult.affectedRows)
            return {
                success: false,
                message: `Failed to follow the user with provided id '${followeeId}' `,
                status: 500,
            };

        return { success: true };
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY')
            return {
                success: false,
                message: `User is already following`,
                status: 409,
            };

        if (error.code === 'ER_NO_REFERENCED_ROW_2')
            return {
                success: false,
                message: `No user found with provided id '${followeeId}' `,
                status: 404,
            };

        return {
            success: false,
            message: 'An error occurred while following the user',
            status: 500,
        };
    }
};

export const deleteUserFollow = async (followeeId, followerId) => {
    const userFollowersModel = new UserFollowersModel();

    try {
        const deleteResult = await userFollowersModel.delete({
            user_id: followeeId,
            follower_id: followerId,
        });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: `No user found with provided id '${followeeId}' `,
                status: 404,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while unfollowing the user',
            status: 500,
        };
    }
};
