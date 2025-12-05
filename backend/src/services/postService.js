import PostModel from '../models/postModel.js';
import shuffleArray from '../utils/shuffleArray.js';
import postMapper from '../utils/mappers/postMapper.js';

export const getUserPosts = async (userId, lastId, limit) => {
    const postModel = new PostModel();

    try {
        const [postsRows] = await postModel.findUserPosts(userId, lastId, limit);

        const posts = postsRows.map((postRow) => postMapper(postRow));

        const id = postsRows.length ? postsRows[0].id : 0;

        return {
            success: true,
            lastId: id,
            posts
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

export const getFeedPosts = async (userId, lastId, limit) => {
    const postModel = new PostModel();

    try {
        const [postsRows] = await postModel.findFeedPosts(userId, lastId, limit);

        const posts = postsRows.map((postRow) => postMapper(postRow));

        const id = postsRows.length ? postsRows[0].id : 0;

        return {
            success: true,
            lastId: id,
            posts
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

const getTagsProbability = (tagsRows, limit) => {
    if (!tagsRows || !tagsRows.length)
        return {};

    const tagsUsageProbability = {};

    tagsRows.forEach(({ tag_id: tagId, count, probability }) => {
        tagsUsageProbability[tagId] = Math.round(probability * Math.min(count, limit));
    });

    return tagsUsageProbability;
};

const getSelectedTags = (tagsUsageProbability, limit) => {
    if (!tagsUsageProbability)
        return [];

    const selectedTags = [];

    const tagsTotalCount = Object.values(tagsUsageProbability).reduce((a, b) => a + b);

    let remainingTags = Math.min(limit, tagsTotalCount);

    // eslint-disable-next-line no-restricted-syntax
    for (const [tagId, count] of Object.entries(tagsUsageProbability)) {
        if (remainingTags >= count) {
            selectedTags.push(...Array(count).fill(tagId));
            remainingTags -= count;
        } else {
            selectedTags.push(...Array(remainingTags).fill(tagId));
            break;
        }
    }

    return selectedTags;
};

export const getSuggestedPosts = async (tagsRows, userId, limit) => {
    const postModel = new PostModel();

    try {
        if (!tagsRows)
            return {
                success: false,
                message: 'An error occurred while fetching the suggested posts',
                status: 500,
            };

        if (!tagsRows.length)
            return {
                success: false,
                message: 'No suggested posts found',
                status: 404,
            };

        const tagsProbability = getTagsProbability(tagsRows, limit);

        const selectedTags = getSelectedTags(tagsProbability, limit);

        const tagIds = shuffleArray(selectedTags);

        const [postsRows] = await postModel.findSuggestedPosts(tagIds, userId, limit);

        const posts = postsRows.map((postRow) => postMapper(postRow));

        return {
            success: true,
            posts
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the suggested posts',
            status: 500,
        };
    }
};

export const getPost = async (postId) => {
    const postModel = new PostModel();

    try {
        const [postRow] = await postModel.find({ id: postId });

        if (!postRow.length)
            return {
                success: false,
                message: `No post found with id '${postId}' `,
                status: 404,
            };

        const post = postMapper(postRow[0]);

        return {
            success: true,
            post
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the post',
            status: 500,
        };
    }
};

export const postPost = async (title, content, authorId, parentId) => {
    const postModel = new PostModel();

    try {
        const createResult = await postModel.create({ title, content, author_id: authorId, parent_id: parentId });

        if (!createResult.affectedRows)
            return {
                success: false,
                message: 'An error occurred while creating the post',
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
                message: 'Referenced post is not found',
                status: 404,
            };
        }

        return {
            success: false,
            message: 'An error occurred while creating the post',
            status: 500,
        };
    }
};

export const updatePost = async (title, content, postId) => {
    const postModel = new PostModel();

    try {
        const updateResult = await postModel.update({ title, content }, { id: postId });

        if (!updateResult.affectedRows)
            return {
                success: false,
                message: `No post found with id '${postId}'`,
                status: 404,
            };

        return {
            success: true,
            updateResult
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while updating the post',
            status: 500,
        };
    }
};

export const deletePost = async (postId, authorId) => {
    const postModel = new PostModel();

    try {
        const deleteResult = await postModel.delete({ id: postId, author_id: authorId });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: `No post found with id '${postId}'`,
                status: 404,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while deleting the post',
            status: 500,
        };
    }
};
