import validator from 'validator';

import PostTagsModel from '../models/postTagsModel.js';
import TagsModel from '../models/tagsModel.js';
import postMapper from '../utils/mappers/postMapper.js';

export const getPostTags = async (postId) => {
    const postTagsModel = new PostTagsModel();

    try {
        const [tagsRows] = await postTagsModel.findPostTags(postId);

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

export const getTagPosts = async (tag, lastId, limit) => {
    const postTagsModel = new PostTagsModel();

    try {
        const [postsRows] = await postTagsModel.findTagPosts(tag, lastId, limit);

        const posts = postsRows.forEach((postRow) => postMapper(postRow));

        const id = postsRows.length ? postsRows[0].post_tag_id : 0;

        return {
            success: true,
            lastId: id,
            posts,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the posts',
            status: 500,
        };
    }
};

export const postPostTags = async (tags, postId) => {
    if (!tags || !tags.length) {
        return {
            success: false,
            message: 'No tags provided',
            status: 400,
        };
    }

    const tagsModel = new TagsModel();
    const postTagsModel = new PostTagsModel();

    const tagsIds = [];
    try {
        const createTagsPromises = tags.map(async (tag) => {
            const tagNormalized = tag.substring(1).toLowerCase();

            if (!validator.isAlphanumeric(tagNormalized)) return Promise.resolve();

            const [tagRow] = await tagsModel.find({ tag: tagNormalized });

            if (tagRow.length) {
                tagsIds.push(tagRow[0].id);

                return postTagsModel.create({ tag_id: tagRow[0].id, post_id: postId });
            }

            const createTagResult = await tagsModel.create({ tag: tagNormalized });

            tagsIds.push(createTagResult.insertId);

            return postTagsModel.create({ tag_id: createTagResult.insertId, post_id: postId });
        });

        const createPostTagsResults = await Promise.allSettled(createTagsPromises);

        const rejectedPromises = createPostTagsResults.filter(
            (result) => result.status === 'rejected',
        );

        if (rejectedPromises.length) {
            console.error('Some tags failed to be added:', rejectedPromises);
            return {
                success: false,
                message: 'Failed to add some tags to the post',
                status: 500,
            };
        }

        return {
            success: true,
            message: 'Successfully added tags to the post',
            tagsIds,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message,
            status: error.status,
        };
    }
};

export const deletePostTags = async (postId, tagsIds) => {
    const postTagsModel = new PostTagsModel();

    try {
        if (tagsIds) {
            const deleteTagsPromises = tagsIds.map(async (tagId) =>
                postTagsModel.delete({ post_id: postId, tag_id: tagId }),
            );

            const deleteTagsResults = await Promise.allSettled(deleteTagsPromises);

            const rejectedPromises = deleteTagsResults.filter(
                (promise) => promise.status === 'rejected',
            );

            if (rejectedPromises.length) {
                console.error('Some post tags failed to be deleted:', rejectedPromises);
                return {
                    success: false,
                    message: 'Failed to delete some post tags',
                    status: 500,
                };
            }
        } else {
            const deleteResult = postTagsModel.delete({ post_id: postId });

            if (!deleteResult.affectedRows)
                return {
                    success: false,
                    message: `No tags found for post with id '${postId}' `,
                    status: 404,
                };
        }

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while deleting the post tags',
            status: 500,
        };
    }
};
