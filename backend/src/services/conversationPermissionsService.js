import ConversationPermissionsModel from '../models/conversationPermissionsModel.js';

export const getRestrictedPermissions = async (conversationId) => {
    const conversationPermissionsModel = new ConversationPermissionsModel();

    try {
        const [permissionsRows] = await conversationPermissionsModel.findConversationRestrictedPermissions(conversationId);

        return {
            success: true,
            restrictedPermissions: permissionsRows
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the restricted permissions',
            status: 500,
        };
    }
};

export const postRestrictedPermission = async (conversationId, permissionId) => {
    const conversationPermissionsModel = new ConversationPermissionsModel();

    try {
        const createResult = await conversationPermissionsModel.create({ conversation_id: conversationId, permission_id: permissionId });

        if (!createResult.affectedRows)
            return {
                success: false,
                message: 'An error occurred while restricting the permission',
                status: 500,
            };

        return {
            success: true,
            createResult
        };
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY')
            return {
                success: false,
                message: 'The permission already restricted',
                status: 409,
            };

        if (error.code === 'ER_NO_REFERENCED_ROW_2')
            return {
                success: false,
                message: 'The permission does not exist',
                status: 404,
            };

        return {
            success: false,
            message: 'An error occurred while restricting the permission',
            status: 500,
        };
    }
};

export const deleteRestrictedPermission = async (conversationId, permissionId) => {
    const conversationPermissionsModel = new ConversationPermissionsModel();

    try {
        const deleteResult = await conversationPermissionsModel.delete({ conversation_id: conversationId, permission_id: permissionId });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: 'An error occurred while enabling the permission',
                status: 500,
            };

        return {
            success: true,
            deleteResult
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while enabling the permission',
            status: 500,
        };
    }
};
