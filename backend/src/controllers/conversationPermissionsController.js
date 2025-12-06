import * as conversationPermissionsService from '../services/conversationPermissionsService.js';
import * as conversationService from '../services/conversationService.js';
import * as participantService from '../services/participantService.js';
import CustomError from '../utils/errorHandling.js';

export const getRestrictedPermissions = async (req, res, next) => {
    const { conversationId } = req.params;

    try {
        const getRestrictedPermissionsResult = await conversationPermissionsService.getRestrictedPermissions(
            conversationId
        );

        if (!getRestrictedPermissionsResult.success)
            throw new CustomError(getRestrictedPermissionsResult.message, getRestrictedPermissionsResult.status);

        res.status(200).json({
            success: true,
            restrictedPermissions: getRestrictedPermissionsResult.restrictedPermissions,
        });
    } catch (error) {
        next(error);
    }
};

export const postRestrictedPermission = async (req, res, next) => {
    const { conversationId, permissionId } = req.body;

    try {
        const getConversationResult = await conversationService.getConversation(conversationId);

        if (!getConversationResult.success)
            throw new CustomError(getConversationResult.message, getConversationResult.status);

        const { conversation: currentConversation } = getConversationResult;

        if (currentConversation.type === 1)
            throw new CustomError('You are not allowed to restrict this permission', 403);

        const isGroupAdmin =
            currentConversation.creator_id === req.userId ||
            await participantService.isGroupAdmin(req.userId, conversationId);

        if (!isGroupAdmin || isGroupAdmin?.success) {
            if (isGroupAdmin?.status === 500)
                throw new CustomError('An error occurred while restricting the permission', 500);

            throw new CustomError('You are not allowed to restrict this permission', 403);
        }

        const postRestrictedPermissionResult = await conversationPermissionsService.postRestrictedPermission(
            conversationId,
            permissionId,
        );

        if (!postRestrictedPermissionResult.success)
            throw new CustomError(postRestrictedPermissionResult.message, postRestrictedPermissionResult.status);

        res.status(201).json({
            success: true,
            message: 'Conversation permission restricted successfully',
        });

    } catch (error) {
        next(error);
    }
};

export const deleteRestrictedPermission = async (req, res, next) => {
    const { conversationId, permissionId } = req.params;

    try {
        const getConversationResult = await conversationService.getConversation(conversationId);

        if (!getConversationResult.success)
            throw new CustomError(getConversationResult.message, getConversationResult.status);

        const { conversation: currentConversation } = getConversationResult;

        if (currentConversation.type === 1)
            throw new CustomError('You are not allowed to enable this permission', 403);

        const isGroupAdmin =
            currentConversation.creator_id === req.userId ||
            await participantService.isGroupAdmin(req.userId, conversationId);

        if (!isGroupAdmin || isGroupAdmin?.success) {
            if (isGroupAdmin?.status === 500)
                throw new CustomError('An error occurred while enabling the permission', 500);

            throw new CustomError('You are not allowed to enable this permission', 403);
        }

        const deleteRestrictedPermissionResult = await conversationPermissionsService.deleteRestrictedPermission(
            conversationId,
            permissionId,
        );

        if (!deleteRestrictedPermissionResult.success)
            throw new CustomError(deleteRestrictedPermissionResult.message, deleteRestrictedPermissionResult.status);

        res.status(200).json({
            success: true,
            message: 'Conversation permission enabled successfully',
        });
    } catch (error) {
        next(error);
    }
};
