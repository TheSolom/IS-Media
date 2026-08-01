import PostLikesModel from '../models/postLikesModel.js';

export const getPostLikes = async (postId, lastId, limit) => {
    const postLikesModel = new PostLikesModel();

    try {
        const [likesRows] = await postLikesModel.findPostLikes(postId, lastId, limit);

        const id = likesRows[0] ? likesRows[0].id : 0;

        return {
            success: true,
            lastId: id,
            likes: likesRows,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the likes',
            status: 500,
        };
    }
};

export const postPostLike = async (postId, userId) => {
    const postLikesModel = new PostLikesModel();

    try {
        const createResult = await postLikesModel.create({ post_id: postId, user_id: userId });

        if (!createResult.affectedRows)
            return {
                success: false,
                message: `Failed to like post with id '${postId}' `,
                status: 500,
            };

        return {
            success: true,
            createResult,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while liking the post',
            status: 500,
        };
    }
};

export const deletePostLike = async (postId, userId) => {
    const postLikesModel = new PostLikesModel();

    try {
        const deleteResult = await postLikesModel.delete({ post_id: postId, user_id: userId });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: `No like found for user with id '${userId}' `,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while disliking the post',
            status: 500,
        };
    }
};
