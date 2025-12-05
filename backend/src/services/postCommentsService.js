import validator from 'validator';

import PostCommentsModel from '../models/postCommentsModel.js';
import deleteMedia from '../utils/deleteMedia.js';

export const getPostComment = async (commentId) => {
    const postCommentsModel = new PostCommentsModel();

    try {
        const [commentRow] = await postCommentsModel.find({ id: commentId });

        if (!commentRow.length)
            return {
                success: false,
                message: `No comment found with id '${commentId}' `,
                status: 404
            };

        return {
            success: true,
            comment: commentRow[0]
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the comment',
            status: 500,
        };
    }
};

export const getPostComments = async (postId, lastId, limit) => {
    const postCommentsModel = new PostCommentsModel();

    try {
        const [commentsRows] = await postCommentsModel.findPostComments(postId, lastId, limit);

        const id = commentsRows[0] ? commentsRows[0].id : 0;

        return {
            success: true,
            lastId: id,
            comments: commentsRows
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the comments',
            status: 500,
        };
    }
};

export const postPostComment = async (title, content, postId, authorId, parentId) => {
    const postCommentsModel = new PostCommentsModel();

    try {
        const createResult = await postCommentsModel.create({ title, content, author_id: authorId, post_id: postId, parent_id: parentId });

        if (!createResult.affectedRows)
            return {
                success: false,
                message: `Failed to create comment for user with id '${authorId}' `,
                status: 500,
            };

        return {
            success: true,
            createResult
        };
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return {
                success: false,
                message: 'Referenced post or comment is not found',
                status: 404
            };
        }

        return {
            success: false,
            message: 'An error occurred while creating the comment',
            status: 500,
        };
    }
};

export const updatePostComment = async (title, content, commentId, authorId) => {
    const postCommentsModel = new PostCommentsModel();

    try {
        const [commentRow] = await postCommentsModel.find({ id: commentId, author_id: authorId });

        if (!commentRow.length)
            return {
                success: false,
                message: `No comment found with id '${commentId}' `,
                status: 404,
            };

        const updateResult = await postCommentsModel.update({ title, content }, { id: commentId });

        if (validator.isURL(commentRow[0].content) && commentRow[0].content !== content)
            await deleteMedia(commentRow[0].content);

        return {
            success: true,
            updateResult
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while updating the comment',
            status: 500,
        };
    }
};

export const deletePostComment = async (commentId, authorId) => {
    const postCommentsModel = new PostCommentsModel();

    try {
        const deleteResult = await postCommentsModel.delete({ id: commentId, author_id: authorId });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: `No comment found with id '${commentId}' for user with id '${authorId}' `,
                status: 404,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while deleting the comment',
            status: 500,
        };
    }
};
