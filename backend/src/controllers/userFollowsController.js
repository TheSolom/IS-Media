import * as userFollowsService from '../services/userFollowsService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';

export async function isUserFollowee(req, res, next) {
    const { userId } = req.params;

    try {
        requestValidation(req);

        const isUserFolloweeResult = await userFollowsService.isUserFollowee(userId, req.user.id);

        if (!isUserFolloweeResult.success)
            throw new CustomError(isUserFolloweeResult.message, isUserFolloweeResult.status);

        res.status(200).json({
            success: true,
            isFollowing: !!isUserFolloweeResult.followStatus.length,
            since: isUserFolloweeResult.followStatus.length
                ? isUserFolloweeResult.followStatus[0].created_at
                : null,
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserFollowers(req, res, next) {
    const { userId, lastId, limit } = req.query;

    try {
        requestValidation(req);

        const getUserFollowersResult = await userFollowsService.getUserFollowers(
            userId ?? req.user.id,
            lastId ?? 0,
            limit ?? 10,
        );

        if (!getUserFollowersResult.success)
            throw new CustomError(getUserFollowersResult.message, getUserFollowersResult.status);

        res.status(getUserFollowersResult.followers.length ? 200 : 204).json({
            success: true,
            lastId: getUserFollowersResult.lastId,
            followers: getUserFollowersResult.followers,
        });
    } catch (error) {
        next(error);
    }
}

export async function isUserFollower(req, res, next) {
    const { userId } = req.params;

    try {
        requestValidation(req);

        const isUserFollowerResult = await userFollowsService.isUserFollower(userId, req.user.id);

        if (!isUserFollowerResult.success)
            throw new CustomError(isUserFollowerResult.message, isUserFollowerResult.status);

        res.status(200).json({
            success: true,
            isFollowing: !!isUserFollowerResult.followStatus.length,
            since: isUserFollowerResult.followStatus.length
                ? isUserFollowerResult.followStatus[0].created_at
                : null,
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserFollowings(req, res, next) {
    const { userId, lastId, limit } = req.query;

    try {
        requestValidation(req);

        const getUserFollowingsResult = await userFollowsService.getUserFollowings(
            userId ?? req.user.id,
            lastId ?? 0,
            limit ?? 10,
        );

        if (!getUserFollowingsResult.success)
            throw new CustomError(getUserFollowingsResult.message, getUserFollowingsResult.status);

        res.status(getUserFollowingsResult.followings.length ? 200 : 204).json({
            success: true,
            lastId: getUserFollowingsResult.lastId,
            followings: getUserFollowingsResult.followings,
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserFollowSuggestions(req, res, next) {
    const { limit } = req.query;

    try {
        requestValidation(req);

        const getSuggestionsResult = await userFollowsService.getUserFollowSuggestions(
            req.user.id,
            limit ?? 10,
        );

        if (!getSuggestionsResult.success)
            throw new CustomError(getSuggestionsResult.message, getSuggestionsResult.status);

        res.status(getSuggestionsResult.users.length ? 200 : 204).json({
            success: true,
            users: getSuggestionsResult.users,
        });
    } catch (error) {
        next(error);
    }
}

export async function postUserFollow(req, res, next) {
    const { followeeId } = req.body;

    try {
        requestValidation(req);

        const postUserFollowResult = await userFollowsService.postUserFollow(
            followeeId,
            req.user.id,
        );

        if (!postUserFollowResult.success)
            throw new CustomError(postUserFollowResult.message, postUserFollowResult.status);

        res.status(201).json({
            success: true,
            message: `Successfully followed user with id '${followeeId}' `,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteUserFollow(req, res, next) {
    const { followeeId } = req.params;

    try {
        requestValidation(req);

        const deleteUserFollowResult = await userFollowsService.deleteUserFollow(
            followeeId,
            req.user.id,
        );

        if (!deleteUserFollowResult.success)
            throw new CustomError(deleteUserFollowResult.message, deleteUserFollowResult.status);

        res.status(200).json({
            success: true,
            message: `Successfully unfollowed user with id '${followeeId}' `,
        });
    } catch (error) {
        next(error);
    }
}
