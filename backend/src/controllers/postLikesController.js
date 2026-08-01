import CustomError from '../utils/errorHandling.js';
import * as postLikesService from '../services/postLikesService.js';
import * as postTagsService from '../services/postTagsService.js';
import * as userTagsService from '../services/userTagsService.js';
import requestValidation from '../utils/requestValidation.js';

export async function getPostLikes(req, res, next) {
    const postId = Number(req.params.postId);
    const { lastId, limit } = req.query;

    try {
        if (!postId || postId < 1) throw new CustomError('No valid post id is provided', 422);

        requestValidation(req);

        const getPostLikesResult = await postLikesService.getPostLikes(
            postId,
            lastId ?? 0,
            limit ?? 10,
        );

        if (!getPostLikesResult.success)
            throw new CustomError(getPostLikesResult.message, getPostLikesResult.status);

        res.status(getPostLikesResult.likes.length ? 200 : 204).json({
            success: true,
            lastId: getPostLikesResult.lastId,
            likes: getPostLikesResult.likes,
        });
    } catch (error) {
        next(error);
    }
}

export async function postPostLike(req, res, next) {
    const postId = Number(req.body.postId);

    try {
        if (!postId || postId < 1) throw new CustomError('No valid post id is provided', 422);

        const postPostLikeResult = await postLikesService.postPostLike(postId, req.userId);

        if (!postPostLikeResult.success)
            throw new CustomError(postPostLikeResult.message, postPostLikeResult.status);

        const getPostTagsResult = await postTagsService.getPostTags(postId);

        if (!getPostTagsResult.success)
            throw new CustomError('An error occurred while liking the post', 500);

        if (getPostTagsResult.tags.length) {
            const { tags: tagsRows } = getPostTagsResult;

            const tagsIds = tagsRows.map((tagRow) => tagRow.tag_id);

            const putUserTagsResult = await userTagsService.putUserTags(tagsIds, req.userId);

            if (!putUserTagsResult.success)
                throw new CustomError('An error occurred while liking the post', 500);
        }

        res.status(201).json({
            success: true,
            message: 'Successfully liked post',
            likeId: postPostLikeResult.createResult.insertId,
        });
    } catch (error) {
        next(error);
    }
}

export async function deletePostLike(req, res, next) {
    const postId = Number(req.params.postId);

    try {
        if (!postId || postId < 1) throw new CustomError('No valid postId id is provided', 422);

        const deletePostLikeResult = await postLikesService.deletePostLike(postId, req.userId);

        if (!deletePostLikeResult.success)
            throw new CustomError(deletePostLikeResult.message, deletePostLikeResult.status);

        const getPostTagsResult = await postTagsService.getPostTags(postId);

        if (!getPostTagsResult.success)
            throw new CustomError('An error occurred while disliking the post', 500);

        if (getPostTagsResult.tags.length) {
            const { tags: tagsRows } = getPostTagsResult;

            const tagsIds = tagsRows.map((tagRow) => tagRow.tag_id);

            const deleteUserTagsResult = await userTagsService.deleteUserTags(tagsIds, req.userId);

            if (!deleteUserTagsResult.success)
                throw new CustomError('An error occurred while disliking the post', 500);
        }

        res.status(200).json({
            success: true,
            message: 'Successfully disliked post',
        });
    } catch (error) {
        next(error);
    }
}
