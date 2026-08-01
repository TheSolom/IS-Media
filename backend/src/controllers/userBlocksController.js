import * as userBlocksService from '../services/userBlocksService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';

export async function getUserBlockStatus(req, res, next) {
    const { userId } = req.params;

    try {
        requestValidation(req);

        const getUserBlocksResult = await userBlocksService.getUserBlockStatus(userId, req.userId);

        if (!getUserBlocksResult.success)
            throw new CustomError(getUserBlocksResult.message, getUserBlocksResult.status);

        res.status(200).json({
            success: true,
            blockStatus: !!getUserBlocksResult.blockStatus.length,
            since: getUserBlocksResult.blockStatus.length
                ? getUserBlocksResult.blockStatus[0].created_at
                : null,
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserBlocks(req, res, next) {
    const { lastId, limit } = req.query;

    try {
        requestValidation(req);

        const getUserBlocksResult = await userBlocksService.getUserBlocks(
            req.userId,
            lastId ?? 0,
            limit ?? 10,
        );

        if (!getUserBlocksResult.success)
            throw new CustomError(getUserBlocksResult.message, getUserBlocksResult.status);

        res.status(getUserBlocksResult.blocks.length ? 200 : 204).json({
            success: true,
            lastId: getUserBlocksResult.lastId,
            blocks: getUserBlocksResult.blocks,
        });
    } catch (error) {
        next(error);
    }
}

export async function postUserBlock(req, res, next) {
    const { blockedId } = req.body;

    try {
        requestValidation(req);

        const postUserBlockResult = await userBlocksService.postUserBlock(blockedId, req.userId);

        if (!postUserBlockResult.success)
            throw new CustomError(postUserBlockResult.message, postUserBlockResult.status);

        res.status(201).json({
            success: true,
            message: `Successfully blocked user with id '${blockedId}' `,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteUserBlock(req, res, next) {
    const { blockedId } = req.params;

    try {
        requestValidation(req);

        const deleteUserBlockResult = await userBlocksService.deleteUserBlock(
            blockedId,
            req.userId,
        );

        if (!deleteUserBlockResult.success)
            throw new CustomError(deleteUserBlockResult.message, deleteUserBlockResult.status);

        res.status(200).json({
            success: true,
            message: `Successfully unblocked user with id '${blockedId}' `,
        });
    } catch (error) {
        next(error);
    }
}
