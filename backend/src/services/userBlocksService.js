import UserBlocksModel from '../models/userBlocksModel.js';
import UserFollowersModel from '../models/userFollowersModel.js';

export const getUserBlockStatus = async (userId1, userId2) => {
    const userBlocksModel = new UserBlocksModel();

    try {
        const [blockRow] = await userBlocksModel.findUserBlockStatus(userId1, userId2);

        return {
            success: true,
            blockStatus: blockRow,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the block status',
            status: 500,
        };
    }
};

export const getUserBlocks = async (userId, lastId, limit) => {
    const userBlocksModel = new UserBlocksModel();

    try {
        const [blocksRows] = await userBlocksModel.findBlocks(userId, lastId, limit);

        const id = blocksRows.length ? blocksRows[0].id : 0;

        return {
            success: true,
            lastId: id,
            blocks: blocksRows,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching user blocks',
            status: 500,
        };
    }
};

export const postUserBlock = async (blockedId, blockerId) => {
    const userBlocksModel = new UserBlocksModel();
    const userFollowersModel = new UserFollowersModel();

    try {
        const createResult = await userBlocksModel.create({
            user_id: blockerId,
            blocked_id: blockedId,
        });

        if (!createResult.affectedRows)
            return {
                success: false,
                message: `No user found with provided id '${blockedId}' `,
                status: 404,
            };

        await userFollowersModel.DeleteFollowStatus(blockedId, blockerId);

        return { success: true };
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY')
            return {
                success: false,
                message: `User is already blocked`,
                status: 409,
            };

        if (error.code === 'ER_NO_REFERENCED_ROW_2')
            return {
                success: false,
                message: `No user found with provided id '${blockedId}' `,
                status: 404,
            };

        return {
            success: false,
            message: 'An error occurred while blocking the user',
            status: 500,
        };
    }
};

export const deleteUserBlock = async (blockedId, blockerId) => {
    const userBlocksModel = new UserBlocksModel();

    try {
        const deleteResult = await userBlocksModel.delete({
            user_id: blockerId,
            blocked_id: blockedId,
        });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: `No user found with provided id '${blockedId}' `,
                status: 404,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while unblocking the user',
            status: 500,
        };
    }
};
