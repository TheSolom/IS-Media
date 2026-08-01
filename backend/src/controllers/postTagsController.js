import * as postTagsService from '../services/postTagsService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';

export async function getPostTags(req, res, next) {
    const postId = Number(req.params.postId);

    try {
        if (!postId || postId < 1) throw new CustomError('No valid post id is provided', 422);

        const getPostTagsResult = await postTagsService.getPostTags(postId);

        if (!getPostTagsResult.success)
            throw new CustomError(getPostTagsResult.message, getPostTagsResult.status);

        res.status(getPostTagsResult.tags.length ? 200 : 204).json({
            success: true,
            tags: getPostTagsResult.tags,
        });
    } catch (error) {
        next(error);
    }
}

export async function getTagPosts(req, res, next) {
    const { tag } = req.params;
    const { lastId, limit } = req.query;

    try {
        requestValidation(req);

        const getTagPostsResult = await postTagsService.getTagPosts(tag, lastId ?? 0, limit ?? 10);

        if (!getTagPostsResult.success)
            throw new CustomError(getTagPostsResult.message, getTagPostsResult.status);

        res.status(getTagPostsResult.posts.length ? 200 : 204).json({
            success: true,
            lastId: getTagPostsResult.lastId,
            posts: getTagPostsResult.posts,
        });
    } catch (error) {
        next(error);
    }
}
