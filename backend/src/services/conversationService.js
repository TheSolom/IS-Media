import ConversationModel from '../models/conversationModel.js';

export const searchConversation = async (title, userId, limit) => {
    const conversationModel = new ConversationModel();

    try {
        const [conversationRow] = await conversationModel.searchConversation(title, userId, limit);

        return {
            success: true,
            conversations: conversationRow
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while searching the conversation',
            status: 500,
        };
    }
};

export const getDMConversation = async (userId1, userId2) => {
    const conversationModel = new ConversationModel();

    try {
        const [conversationRow] = await conversationModel.findDMConversation(
            userId1,
            userId2
        );

        if (!conversationRow.length)
            return {
                success: false,
                message: 'No conversation found',
                status: 404
            };

        return {
            success: true,
            conversation: conversationRow[0]
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the conversation',
            status: 500,
        };
    }
};

export const getUserConversations = async (userId, lastId, lastDate, limit) => {
    const conversationModel = new ConversationModel();

    try {
        const [conversationsRows] = await conversationModel.findUserConversations(
            userId,
            lastId,
            lastDate,
            limit
        );

        const id = conversationsRows.length ? conversationsRows.at(-1).id : null;
        const date = conversationsRows.length ? conversationsRows.at(-1).updated_at : null;

        return {
            success: true,
            lastId: id,
            lastDate: date,
            conversations: conversationsRows,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching conversations',
            status: 500,
        };
    }
};

export const getConversation = async (conversationId) => {
    const conversationModel = new ConversationModel();

    try {
        const [conversationRow] = await conversationModel.find({ id: conversationId });

        if (!conversationRow.length)
            return {
                success: false,
                message: `No conversation found with provided id '${conversationId}' `,
                status: 404
            };

        return {
            success: true,
            conversation: conversationRow[0]
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the conversation',
            status: 500,
        };
    }
};

export const isGroupConversation = async (conversationId) => {
    const getConversationResult = await getConversation(conversationId);

    if (!getConversationResult.success)
        return {
            success: false,
            message: getConversationResult.message,
            status: getConversationResult.status
        };

    return {
        success: true,
        isGroup: getConversationResult.conversation.type === 2
    };
};

export const postConversation = async (title, image, type, creatorId) => {
    const conversationModel = new ConversationModel();

    try {
        const createResult = await conversationModel.create({ title, image, type, creator_id: creatorId });

        if (!createResult.affectedRows)
            return {
                success: false,
                message: 'An error occurred while creating the conversation',
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
                message: `Conversation is already exists`,
                status: 409,
            };

        if (error.code === 'ER_NO_REFERENCED_ROW_2')
            return {
                success: false,
                message: `No user found with provided id '${creatorId}' `,
                status: 404,
            };

        return {
            success: false,
            message: 'An error occurred while creating the conversation',
            status: 500,
        };
    }
};

export const updateConversation = async (conversationId, title, image) => {
    const conversationModel = new ConversationModel();

    try {
        const updateResult = await conversationModel.update({ title, image }, { id: conversationId });

        if (!updateResult.affectedRows)
            return {
                success: false,
                message: `No conversation found with provided id '${conversationId}' `,
                status: 404,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while updating the conversation',
            status: 500,
        };
    }
};

export const deleteConversation = async (conversationId) => {
    const conversationModel = new ConversationModel();

    try {
        const deleteResult = await conversationModel.delete({ id: conversationId });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: `No conversation found with provided id '${conversationId}' `,
                status: 404,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while deleting the conversation',
            status: 500,
        };
    }
};
