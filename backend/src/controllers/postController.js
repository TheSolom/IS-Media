import validator from 'validator';

import * as postService from '../services/postService.js';
import * as tagService from '../services/tagService.js';
import * as postTagsService from '../services/postTagsService.js';
import * as userTagsService from '../services/userTagsService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';
import isContentUnchanged from '../utils/isContentUnchanged.js';
import deleteMedia from '../utils/deleteMedia.js';

export async function getUserPosts(req, res, next) {
    const { userId, lastId, limit } = req.query;

    try {
        requestValidation(req);

        const getUserPostsResult = await postService.getUserPosts(
            userId ?? req.userId,
            lastId ?? 0,
            limit ?? 10
        );

        if (!getUserPostsResult.success)
            throw new CustomError(getUserPostsResult.message, getUserPostsResult.status);

        res.status(getUserPostsResult.posts.length ? 200 : 204).json({
            success: true,
            lastId: getUserPostsResult.lastId,
            posts: getUserPostsResult.posts
        });
    } catch (error) {
        next(error);
    }
}

export async function getFeedPosts(req, res, next) {
    const { lastId, limit } = req.query;

    try {
        requestValidation(req);

        const getFeedPostsResult = await postService.getFeedPosts(
            req.userId,
            lastId ?? 0,
            limit ?? 10
        );

        if (!getFeedPostsResult.success)
            throw new CustomError(getFeedPostsResult.message, getFeedPostsResult.status);

        res.status(getFeedPostsResult.posts.length ? 200 : 204).json({
            success: true,
            lastId: getFeedPostsResult.lastId,
            posts: getFeedPostsResult.posts,
        });
    } catch (error) {
        next(error);
    }
}

export async function getSuggestedPosts(req, res, next) {
    const { limit } = req.query;

    try {
        requestValidation(req);

        const getMostUsedTagsResult = await userTagsService.getMostUsedTags(
            req.userId,
            limit ?? 5
        );

        const { tags: tagsRows } = getMostUsedTagsResult;

        const getSuggestedPostsResult = await postService.getSuggestedPosts(
            tagsRows,
            req.userId,
            limit ?? 5
        );

        if (!getSuggestedPostsResult.success)
            throw new CustomError(getSuggestedPostsResult.message, getSuggestedPostsResult.status);

        res.status(getSuggestedPostsResult.posts.length ? 200 : 204).json({
            success: true,
            posts: getSuggestedPostsResult.posts,
        });
    } catch (error) {
        next(error);
    }
}

export async function getPost(req, res, next) {
    const postId = Number(req.params.postId);

    try {
        if (!postId || postId < 1)
            throw new CustomError('No valid post id is provided', 422);

        const getPostResult = await postService.getPost(postId);

        if (!getPostResult.success)
            throw new CustomError(getPostResult.message, getPostResult.status);

        res.status(200).json({
            success: true,
            post: getPostResult.post
        });
    } catch (error) {
        next(error);
    }
}

export async function postPost(req, res, next) {
    const { title, content, parentId } = req.body;

    try {
        requestValidation(req);

        const postPostResult = await postService.postPost(
            title,
            content,
            req.userId,
            parentId
        );

        if (!postPostResult.success)
            throw new CustomError(postPostResult.message, postPostResult.status);

        const { insertId: postId } = postPostResult.createResult;

        const tags = await tagService.exportTags(title, content);

        if (tags.length) {
            const createTagsResult = await postTagsService.postPostTags(tags, postId);

            if (!createTagsResult.success) {
                await postService.deletePost(postId, req.userId);

                throw new CustomError('An error occurred while creating the post', 500);
            }

            const { tagsIds } = createTagsResult;

            const putUsedTagsResult = await userTagsService.putUserTags(tagsIds, req.userId);

            if (!putUsedTagsResult.success) {
                await postService.deletePost(postId, req.userId);

                throw new CustomError('An error occurred while creating the post', 500);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Successfully created post',
            postId,
        });
    } catch (error) {
        next(error);
    }
}

export async function updatePost(req, res, next) {
    const { title, content } = req.body;
    const { postId } = req.params;

    try {
        requestValidation(req);

        const getPostResult = await postService.getPost(postId);

        if (!getPostResult.success) {
            if (getPostResult.status === 404)
                throw new CustomError(getPostResult.message, getPostResult.status);
            else
                throw new CustomError('An error occurred while updating the post', 500);
        }

        const { post: currentPost } = getPostResult;

        if (currentPost.author.id !== req.userId)
            throw new CustomError('You are not allowed to update this post', 401);

        if (isContentUnchanged(currentPost.title, title, currentPost.content, content))
            return res.status(200).json({
                success: true,
                message: 'No changes detected',
            });

        const getPostTagsResult = await postTagsService.getPostTags(postId);

        if (!getPostTagsResult.success)
            throw new CustomError('An error occurred while updating the post', 500);

        const postTagsIds = getPostTagsResult.tags.map(tag => tag.tag_id);

        if (postTagsIds.length) {
            const deletePostTagsResult = await postTagsService.deletePostTags(postId, postTagsIds);

            if (!deletePostTagsResult.success)
                throw new CustomError('An error occurred while updating the post', 500);

            const deleteUserTagsResult = await userTagsService.deleteUserTags(postTagsIds, req.userId);

            if (!deleteUserTagsResult.success)
                throw new CustomError('An error occurred while updating the post', 500);
        }

        const updatePostResult = await postService.updatePost(
            title,
            content,
            postId,
        );

        if (!updatePostResult.success)
            throw new CustomError(updatePostResult.message, updatePostResult.status);

        if (validator.isURL(currentPost.content) && currentPost.content !== content)
            await deleteMedia(currentPost.content);

        const newTags = await tagService.exportTags(title, content);

        if (newTags.length) {
            const postPostTagsResult = await postTagsService.postPostTags(newTags, postId);

            if (!postPostTagsResult.success) {
                await postService.updatePost(currentPost.title, currentPost.content, postId);

                throw new CustomError('An error occurred while updating the post', 500);
            }

            const { tagsIds: newTagsIds } = postPostTagsResult;

            if (newTagsIds) {
                const putUsedTagsResult = await userTagsService.putUserTags(newTagsIds, req.userId);

                if (!putUsedTagsResult.success) {
                    await postTagsService.deletePostTags(postId, newTagsIds);

                    await postService.updatePost(currentPost.title, currentPost.content, postId);

                    throw new CustomError('An error occurred while updating the post', 500);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'Successfully updated post',
        });
    } catch (error) {
        next(error);
    }
}

export async function deletePost(req, res, next) {
    const postId = Number(req.params.postId);

    try {
        if (!postId || postId < 1)
            throw new CustomError('No valid post id is provided', 422);

        const getPostResult = await postService.getPost(postId);

        if (!getPostResult.success) {
            if (getPostResult.status === 404)
                throw new CustomError(getPostResult.message, getPostResult.status);
            else
                throw new CustomError('An error occurred while deleting the post', 500);
        }

        const { post: currentPost } = getPostResult;

        if (currentPost.author.id !== req.userId)
            throw new CustomError('You are not allowed to delete this post', 401);

        const getPostTagsResult = await postTagsService.getPostTags(postId);

        if (!getPostTagsResult.success)
            throw new CustomError('An error occurred while deleting the post', 500);

        const postTagsIds = getPostTagsResult.tags.map(tag => tag.tag_id);

        if (postTagsIds.length) {
            const deletePostTagsResult = await postTagsService.deletePostTags(postId, postTagsIds);

            if (!deletePostTagsResult.success)
                throw new CustomError('An error occurred while deleting the post', 500);

            const deleteUserTagsResult = await userTagsService.deleteUserTags(postTagsIds, req.userId);

            if (!deleteUserTagsResult.success)
                throw new CustomError('An error occurred while deleting the post', 500);
        }

        const deletePostResult = await postService.deletePost(
            postId,
            req.userId
        );

        if (!deletePostResult.success)
            throw new CustomError(deletePostResult.message, deletePostResult.status);

        res.status(200).json({
            success: true,
            message: 'Successfully deleted post',
        });
    } catch (error) {
        next(error);
    }
}
