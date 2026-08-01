import validator from 'validator';

import CommentTagsModel from '../models/commentTagsModel.js';
import TagsModel from '../models/tagsModel.js';

export const getCommentTags = async (commentId) => {
    const commentTagsModel = new CommentTagsModel();

    try {
        const [tagsRows] = await commentTagsModel.findCommentTags(commentId);

        return {
            success: true,
            tags: tagsRows,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the tags',
            status: 500,
        };
    }
};

export const getTagComments = async (tag, lastId, limit) => {
    const commentTagsModel = new CommentTagsModel();

    try {
        const [commentsRows] = await commentTagsModel.findTagComments(tag, lastId, limit);

        const id = commentsRows[0] ? commentsRows[0].comment_tag_id : 0;

        return {
            success: true,
            lastId: id,
            comments: commentsRows,
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

export const postCommentTags = async (tags, commentId) => {
    if (!tags || !tags.length) {
        return {
            success: false,
            message: 'No tags provided',
            status: 400,
        };
    }

    const tagsModel = new TagsModel();
    const commentTagsModel = new CommentTagsModel();

    const tagsIds = [];
    try {
        const createTagsPromises = tags.map(async (tag) => {
            const tagNormalized = tag.substring(1).toLowerCase();

            if (!validator.isAlphanumeric(tagNormalized)) return Promise.resolve();

            const [tagRow] = await tagsModel.find({ tag: tagNormalized });

            if (tagRow.length) {
                tagsIds.push(tagRow[0].id);

                return commentTagsModel.create({ tag_id: tagRow[0].id, comment_id: commentId });
            }

            const createTagResult = await tagsModel.create({ tag: tagNormalized });

            tagsIds.push(createTagResult.insertId);

            return commentTagsModel.create({
                tag_id: createTagResult.insertId,
                comment_id: commentId,
            });
        });

        const createCommentTagsResults = await Promise.allSettled(createTagsPromises);

        const rejectedPromises = createCommentTagsResults.filter(
            (result) => result.status === 'rejected',
        );

        if (rejectedPromises.length) {
            console.error('Some tags failed to be added:', rejectedPromises);
            return {
                success: false,
                message: 'Failed to add some tags to the comment',
                status: 500,
            };
        }

        return {
            success: true,
            message: 'Successfully added tags to the comment',
            tagsIds,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while creating the comment tags',
            status: 500,
        };
    }
};

export const deleteCommentTags = async (commentId, tagsIds) => {
    const commentTagsModel = new CommentTagsModel();

    try {
        if (tagsIds) {
            const deleteTagsPromises = tagsIds.map(async (tagId) =>
                commentTagsModel.delete({ comment_id: commentId, tag_id: tagId }),
            );

            const deleteTagsResults = await Promise.allSettled(deleteTagsPromises);

            const rejectedPromises = deleteTagsResults.filter(
                (promise) => promise.status === 'rejected',
            );

            if (rejectedPromises.length) {
                console.error('Some comment tags failed to be deleted:', rejectedPromises);
                return {
                    success: false,
                    message: 'Failed to delete some comment tags',
                    status: 500,
                };
            }
        } else {
            const deleteResult = commentTagsModel.delete({ comment_id: commentId });

            if (!deleteResult.affectedRows)
                return {
                    success: false,
                    message: `No tags found for comment with id '${commentId}' `,
                    status: 404,
                };
        }

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while deleting the comment tags',
            status: 500,
        };
    }
};
