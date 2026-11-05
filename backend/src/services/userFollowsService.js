import UserFollowersModel from '../models/userFollowersModel.js';
import UserGraphModel from '../models/userGraphModel.js';

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

export const getUserFollowSuggestions = async (userId, limit) => {
    const userFollowersModel = new UserFollowersModel();
    const userGraphModel = new UserGraphModel();

    try {
        let graphCandidates = [];
        try {
            graphCandidates = await userGraphModel.findSuggestions(userId, limit);
        } catch (graphErr) {
            console.error(
                'Neo4j graph suggestion lookup failed, falling back to relational:',
                graphErr.message,
            );
        }

        const candidateIds = graphCandidates.map((c) => c.userId);
        const [profileRows] = await userFollowersModel.findUsersWithProfileByIds(candidateIds);
        const profilesMap = new Map(profileRows.map((p) => [p.id, p]));

        const enrichedUsers = [];
        graphCandidates.forEach((candidate) => {
            const profile = profilesMap.get(candidate.userId);
            if (profile) {
                enrichedUsers.push({
                    id: profile.id,
                    username: profile.username,
                    profile_picture: profile.profile_picture,
                    mutual_count: candidate.mutualCount,
                });
            }
        });

        if (enrichedUsers.length < limit) {
            const remaining = limit - enrichedUsers.length;
            const excludeIds = enrichedUsers.map((u) => u.id);
            const [fallbackRows] = await userFollowersModel.findPopularFollowFallback(
                userId,
                excludeIds,
                remaining,
            );

            fallbackRows.forEach((row) => {
                enrichedUsers.push({
                    id: row.id,
                    username: row.username,
                    profile_picture: row.profile_picture,
                    mutual_count: 0,
                });
            });
        }

        return {
            success: true,
            users: enrichedUsers,
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

        const userGraphModel = new UserGraphModel();
        await userGraphModel.addFollow(followerId, followeeId).catch((err) => {
            console.error('Failed to sync follow to Neo4j:', err.message);
        });

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

        const userGraphModel = new UserGraphModel();
        await userGraphModel.removeFollow(followerId, followeeId).catch((err) => {
            console.error('Failed to sync unfollow to Neo4j:', err.message);
        });

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
