import MessageModel from '../models/messageModel.js';
import messageMapper from '../utils/mappers/messageMapper.js';

export const getMessage = async (conversationId, messageId) => {
    const messageModel = new MessageModel();

    try {
        const [messageRows] = await messageModel.findMessage(conversationId, messageId);

        if (!messageRows.length)
            return {
                success: false,
                message: 'The message does not exist',
                status: 404,
            };

        const message = messageMapper(messageRows[0]);

        return {
            success: true,
            message
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the message',
            status: 500,
        };
    }
};

export const searchMessage = async (conversationId, content, limit) => {
    const messageModel = new MessageModel();

    try {
        const [messagesRows] = await messageModel.searchMessage(conversationId, content, limit);

        return {
            success: true,
            messages: messagesRows
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while searching the message',
            status: 500,
        };
    }
};

export const getMessages = async (conversationId, lastId, lastDate, limit) => {
    const messageModel = new MessageModel();

    try {
        const [messagesRows] = await messageModel.findMessages(conversationId, lastId, lastDate, limit);

        const id = messagesRows.length ? messagesRows.at(-1).id : null;
        const date = messagesRows.length ? messagesRows.at(-1).created_at : null;

        const messages = messagesRows.map((messageRow) => messageMapper(messageRow));

        return {
            success: true,
            lastId: id,
            lastDate: date,
            messages
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the messages',
            status: 500,
        };
    }
};

export const postMessage = async (content, image, userId, conversationId, parentId) => {
    const messageModel = new MessageModel();

    try {
        const createResult = await messageModel.create({ content, image, sender_id: userId, conversation_id: conversationId, parent_id: parentId });

        if (!createResult.affectedRows)
            return {
                success: false,
                message: 'An error occurred while sending the message',
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
                message: 'Message already exists',
                status: 409,
            };

        if (error.code === 'ER_NO_REFERENCED_ROW_2')
            return {
                success: false,
                message: 'The conversation or replied message does not exist',
                status: 404,
            };

        return {
            success: false,
            message: 'An error occurred while sending the message',
            status: 500,
        };
    }
};

export const updateMessage = async (messageId, content, userId, conversationId) => {
    const messageModel = new MessageModel();

    try {
        const updateResult = await messageModel.update({ content }, { id: messageId, sender_id: userId, conversation_id: conversationId });

        if (!updateResult.affectedRows)
            return {
                success: false,
                message: `No message found`,
                status: 404,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while updating the message',
            status: 500,
        };
    }
};

export const deleteMessage = async (messageId, userId, conversationId) => {
    const messageModel = new MessageModel();

    try {
        const deleteResult = await messageModel.update({ deleted_at: new Date() }, { id: messageId, sender_id: userId, conversation_id: conversationId });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: `No message found`,
                status: 404,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while deleting the message',
            status: 500,
        };
    }
};
