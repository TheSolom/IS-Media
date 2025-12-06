import * as messageService from '../services/messageService.js';
import * as conversationPermissionsService from '../services/conversationPermissionsService.js';
import SocketManager from "../socket.js";
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';

export async function getMessage(req, res, next) {
    const { conversationId, messageId } = req.params;

    try {
        const getMessageResult = await messageService.getMessage(conversationId, messageId);

        if (!getMessageResult.success)
            throw new CustomError(getMessageResult.message, getMessageResult.status);

        res.status(200).json({
            success: true,
            message: getMessageResult.message,
        });
    } catch (error) {
        next(error);
    }
}

export async function searchMessage(req, res, next) {
    const { conversationId, content } = req.params;
    const { limit } = req.query;

    try {
        requestValidation(req);

        const searchMessageResult = await messageService.searchMessage(
            conversationId,
            content,
            limit ?? '10',
        );

        if (!searchMessageResult.success)
            throw new CustomError(searchMessageResult.message, searchMessageResult.status);

        res.status(searchMessageResult.messages.length ? 200 : 404).json({
            success: true,
            messages: searchMessageResult.messages,
        });
    } catch (error) {
        next(error);
    }
}

export async function getMessages(req, res, next) {
    const { conversationId } = req.params;
    const { lastId, lastDate, limit } = req.query;

    try {
        requestValidation(req);

        const getMessagesResult = await messageService.getMessages(
            conversationId,
            lastId ?? null,
            lastDate ?? null,
            limit ?? '10',
        );

        if (!getMessagesResult.success)
            throw new CustomError(getMessagesResult.message, getMessagesResult.status);

        res.status(getMessagesResult.messages.length ? 200 : 204).json({
            success: true,
            lastId: getMessagesResult.lastId,
            lastDate: getMessagesResult.lastDate,
            messages: getMessagesResult.messages,
        });
    } catch (error) {
        next(error);
    }
}

export async function postMessage(req, res, next) {
    const { content, image, parentId } = req.body;
    const { conversationId } = req.params;

    try {
        requestValidation(req);

        const getRestrictedPermissionsResult = await conversationPermissionsService.getRestrictedPermissions(
            conversationId,
        );

        if (!getRestrictedPermissionsResult.success)
            throw new CustomError('An error occurred while sending the message', 500);

        if (getRestrictedPermissionsResult.restrictedPermissions.includes('send_messages'))
            throw new CustomError('You are not allowed to send messages in this conversation', 401);

        const postMessageResult = await messageService.postMessage(
            content,
            image,
            req.userId,
            conversationId,
            parentId,
        );

        if (!postMessageResult.success)
            throw new CustomError(postMessageResult.message, postMessageResult.status);

        const getConversationResult = await messageService.getMessage(
            conversationId,
            postMessageResult.createResult.insertId
        );

        if (!getConversationResult.success)
            throw new CustomError('An error occurred while sending the message', 500);

        const socketManager = SocketManager.getInstance();
        socketManager.emitNewMessage(getConversationResult.message, conversationId);

        res.status(201).json({
            success: true,
            message: getConversationResult.message,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateMessage(req, res, next) {
    const { conversationId, messageId } = req.params;
    const { content } = req.body;

    try {
        requestValidation(req);

        const updateMessageResult = await messageService.updateMessage(
            messageId,
            content,
            req.userId,
            conversationId,
        );

        if (!updateMessageResult.success)
            throw new CustomError(updateMessageResult.message, updateMessageResult.status);

        res.status(200).json({
            success: true,
            message: 'Message updated successfully',
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteMessage(req, res, next) {
    const { conversationId, messageId } = req.params;

    try {
        requestValidation(req);

        const deleteMessageResult = await messageService.deleteMessage(
            messageId,
            req.userId,
            conversationId,
        );

        if (!deleteMessageResult.success)
            throw new CustomError(deleteMessageResult.message, deleteMessageResult.status);

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}
