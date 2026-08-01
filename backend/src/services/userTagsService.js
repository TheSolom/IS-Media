import UserTagsModel from '../models/userTagsModel.js';

export const getMostUsedTags = async (userId, limit) => {
    const userTagsModel = new UserTagsModel();

    try {
        const [mostUsedTagsRows] = await userTagsModel.findMostUsedTags(userId, limit);

        return {
            success: true,
            tags: mostUsedTagsRows,
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

export const putUserTags = async (tagsIds, userId) => {
    if (!tagsIds || !tagsIds.length) {
        return {
            success: false,
            message: 'No tags provided',
            status: 400,
        };
    }

    const userTagsModel = new UserTagsModel();

    try {
        const incrementTagsPromises = tagsIds.map(async (tagId) =>
            userTagsModel.incrementUsedTag(userId, tagId),
        );

        const incrementTagsResults = await Promise.allSettled(incrementTagsPromises);

        const rejectedPromises = incrementTagsResults.filter(
            (promise) => promise.status === 'rejected',
        );

        if (rejectedPromises.length) {
            console.error('Some tags failed to be added to the user:', rejectedPromises);
            return {
                success: false,
                message: 'Failed to add some tags to the user',
                status: 500,
            };
        }

        return {
            success: true,
            message: 'Successfully added tags to the user',
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while adding user tags',
            status: 500,
        };
    }
};

export const deleteUserTags = async (tagsIds, userId) => {
    if (!tagsIds || !tagsIds.length) {
        return {
            success: false,
            message: 'No tags provided',
            status: 400,
        };
    }

    const userTagsModel = new UserTagsModel();

    try {
        const decrementTagsPromises = tagsIds.map(async (tagId) => {
            const [{ affectedRows }] = await userTagsModel.decrementUsedTag(userId, tagId);

            if (affectedRows)
                await userTagsModel.delete({ user_id: userId, tag_id: tagId, count: 0 }); // Delete the tag if it is not used by the user
        });

        const decrementTagsResults = await Promise.allSettled(decrementTagsPromises);

        const rejectedPromises = decrementTagsResults.filter(
            (promise) => promise.status === 'rejected',
        );

        if (rejectedPromises.length) {
            console.error('Some user tags failed to be deleted:', rejectedPromises);
            return {
                success: false,
                message: 'Failed to delete some user tags',
                status: 500,
            };
        }

        return {
            success: true,
            message: 'Successfully deleted user tags',
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while deleting user tags',
            status: 500,
        };
    }
};
