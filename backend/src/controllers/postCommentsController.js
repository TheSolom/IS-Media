import validator from 'validator';

import * as postCommentsService from '../services/postCommentsService.js';
import * as tagService from '../services/tagService.js';
import * as commentTagsService from '../services/commentTagsService.js';
import * as userTagsService from '../services/userTagsService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';
import isContentUnchanged from '../utils/isContentUnchanged.js';
import deleteMedia from '../utils/deleteMedia.js';

export async function getPostComment(req, res, next) {
    const commentId = Number(req.params.commentId);

    try {
        if (!commentId || commentId < 1)
            throw new CustomError('No valid comment id is provided', 422);

        const getPostCommentResult = await postCommentsService.getPostComment(commentId);

        if (!getPostCommentResult.success)
            throw new CustomError(getPostCommentResult.message, getPostCommentResult.status);

        res.status(200).json({
            success: true,
            comment: getPostCommentResult.comment
        });
    } catch (error) {
        next(error);
    }
}

export async function getPostComments(req, res, next) {
    const { postId } = req.params;
    const { lastId, limit } = req.query;

    try {
        requestValidation(req);

        const getPostCommentsResult = await postCommentsService.getPostComments(
            postId,
            lastId ?? 0,
            limit ?? 10,
        );

        if (!getPostCommentsResult.success)
            throw new CustomError(getPostCommentsResult.message, getPostCommentsResult.status);

        res.status(getPostCommentsResult.comments.length ? 200 : 204).json({
            success: true,
            lastId: getPostCommentsResult.lastId,
            comments: getPostCommentsResult.comments
        });
    } catch (error) {
        next(error);
    }
}

export async function postPostComment(req, res, next) {
    const { title, content, postId, parentId } = req.body;

    try {
        requestValidation(req);

        const postPostCommentResult = await postCommentsService.postPostComment(
            title,
            content,
            postId,
            req.userId,
            parentId
        );

        if (!postPostCommentResult.success)
            throw new CustomError(postPostCommentResult.message, postPostCommentResult.status);

        const { insertId: commentId } = postPostCommentResult.createResult;

        const tags = await tagService.exportTags(title, content);

        if (tags.length) {
            const createTagsResult = await commentTagsService.postCommentTags(tags, commentId);

            if (!createTagsResult.success) {
                await postCommentsService.deletePostComment(commentId, req.userId);

                throw new CustomError('An error occurred while creating the comment', 500);
            }

            const { tagsIds } = createTagsResult;

            const putUsedTagsResult = await userTagsService.putUserTags(tagsIds, req.userId);

            if (!putUsedTagsResult.success) {
                await postCommentsService.deletePostComment(commentId, req.userId);

                throw new CustomError('An error occurred while creating the comment', 500);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Successfully created comment',
            commentId,
        });
    } catch (error) {
        next(error);
    }
}

export async function updatePostComment(req, res, next) {
    const { title, content } = req.body;
    const { commentId } = req.params;

    try {
        requestValidation(req);

        const getPostCommentResult = await postCommentsService.getPostComment(commentId);

        if (!getPostCommentResult.success) {
            if (getPostCommentResult.status === 404)
                throw new CustomError(getPostCommentResult.message, getPostCommentResult.status);
            else
                throw new CustomError('An error occurred while updating the comment', 500);
        }

        const { comment: currentComment } = getPostCommentResult;

        if (currentComment.author_id !== req.userId)
            throw new CustomError('You are not allowed to update this comment', 401);

        if (isContentUnchanged(currentComment.title, title, currentComment.content, content))
            return res.status(200).json({
                success: true,
                message: 'No changes detected',
            });

        const getCommentTagsResult = await commentTagsService.getCommentTags(commentId);

        if (!getCommentTagsResult.success)
            throw new CustomError('An error occurred while updating the comment', 500);

        if (getCommentTagsResult.tags.length) {
            const { tags: tagsRows } = getCommentTagsResult;

            const tagsIds = tagsRows.map(tagRow => tagRow.tag_id);

            const deleteCommentTagsResult = await commentTagsService.deleteCommentTags(commentId, tagsIds);

            if (!deleteCommentTagsResult.success)
                throw new CustomError('An error occurred while updating the comment', 500);

            const deleteUserTagsResult = await userTagsService.deleteUserTags(tagsIds, req.userId);

            if (!deleteUserTagsResult.success)
                throw new CustomError('An error occurred while updating the comment', 500);
        }

        const updatePostCommentResult = await postCommentsService.updatePostComment(
            title,
            content,
            commentId,
            req.userId
        );

        if (!updatePostCommentResult.success)
            throw new CustomError(updatePostCommentResult.message, updatePostCommentResult.status);

        if (validator.isURL(currentComment.content) && currentComment.content !== content)
            await deleteMedia(currentComment.content);

        const newTags = await tagService.exportTags(title, content);

        if (newTags.length) {
            const commentTagsResult = await commentTagsService.postCommentTags(newTags, commentId);

            if (!commentTagsResult.success) {
                await postCommentsService.updatePostComment(currentComment.title, currentComment.content, commentId);

                throw new CustomError('An error occurred while updating the comment', 500);
            }

            const { tagsIds: newTagsIds } = commentTagsResult;

            if (newTagsIds) {
                const putUsedTagsResult = await userTagsService.putUserTags(newTagsIds, req.userId);

                if (!putUsedTagsResult.success) {
                    await commentTagsService.deleteCommentTags(commentId, newTagsIds);

                    await postCommentsService.updatePost(currentComment.title, currentComment.content, commentId);

                    throw new CustomError('An error occurred while updating the comment', 500);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'Successfully updated comment',
        });
    } catch (error) {
        next(error);
    }
}

export async function deletePostComment(req, res, next) {
    const commentId = Number(req.params.commentId);

    try {
        if (!commentId || commentId < 1)
            throw new CustomError('No valid comment id is provided', 422);

        const getPostCommentResult = await postCommentsService.getPostComment(commentId);

        if (!getPostCommentResult.success) {
            if (getPostCommentResult.status === 404)
                throw new CustomError(getPostCommentResult.message, getPostCommentResult.status);
            else
                throw new CustomError('An error occurred while deleting the comment', 500);
        }

        const { comment: currentComment } = getPostCommentResult;

        if (currentComment.author_id !== req.userId)
            throw new CustomError('You are not allowed to delete this comment', 401);

        const getCommentTagsResult = await commentTagsService.getCommentTags(commentId);

        if (!getCommentTagsResult.success)
            throw new CustomError(getCommentTagsResult.message, getCommentTagsResult.status);

        if (getCommentTagsResult.tags.length) {
            const { tags: tagsRows } = getCommentTagsResult;

            const tagsIds = tagsRows.map(tagRow => tagRow.tag_id);

            const deletePostTagsResult = await commentTagsService.deleteCommentTags(commentId, tagsIds);

            if (!deletePostTagsResult.success)
                throw new CustomError('An error occurred while deleting the comment', 500);

            const deleteUserTagsResult = await userTagsService.deleteUserTags(tagsIds, req.userId);

            if (!deleteUserTagsResult.success)
                throw new CustomError('An error occurred while deleting the comment', 500);

        }
        const deletePostCommentResult = await postCommentsService.deletePostComment(
            commentId,
            req.userId
        );

        if (!deletePostCommentResult.success)
            throw new CustomError(deletePostCommentResult.message, deletePostCommentResult.status);

        res.status(200).json({
            success: true,
            message: 'Successfully deleted comment',
        });
    } catch (error) {
        next(error);
    }
}
