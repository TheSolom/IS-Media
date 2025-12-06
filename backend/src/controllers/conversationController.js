import * as conversationService from '../services/conversationService.js';
import * as participantService from '../services/participantService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';
import isContentUnchanged from '../utils/isContentUnchanged.js';
import deleteMedia from '../utils/deleteMedia.js';

export async function searchConversation(req, res, next) {
    const { title } = req.params;
    const { limit } = req.query;

    try {
        const searchConversationResult = await conversationService.searchConversation(
            title,
            req.userId,
            limit ?? '10',
        );

        if (!searchConversationResult.success)
            throw new CustomError(searchConversationResult.message, searchConversationResult.status);

        res.status(searchConversationResult.conversations.length ? 200 : 404).json({
            success: true,
            conversations: searchConversationResult.conversations
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserConversations(req, res, next) {
    const { lastId, lastDate, limit } = req.query;

    try {
        requestValidation(req);

        const getUserConversationsResult = await conversationService.getUserConversations(
            req.userId,
            lastId ?? null,
            lastDate ?? null,
            limit ?? '10',
        );

        if (!getUserConversationsResult.success)
            throw new CustomError(getUserConversationsResult.message, getUserConversationsResult.status);

        res.status(getUserConversationsResult.conversations.length ? 200 : 204).json({
            success: true,
            lastId: getUserConversationsResult.lastId,
            lastDate: getUserConversationsResult.lastDate,
            conversations: getUserConversationsResult.conversations,
        });
    } catch (error) {
        next(error);
    }
}

export async function getConversation(req, res, next) {
    const conversationId = Number(req.params.conversationId);

    try {
        if (!conversationId || conversationId < 1)
            throw new CustomError('No valid conversation id is provided', 422);

        const getConversationResult = await conversationService.getConversation(conversationId);

        if (!getConversationResult.success)
            throw new CustomError(getConversationResult.message, getConversationResult.status);

        res.status(200).json({
            success: true,
            conversation: getConversationResult.conversation
        });
    } catch (error) {
        next(error);
    }
}

export async function getDMConversation(req, res, next) {
    const userId = Number(req.params.userId);

    try {
        if (!userId || userId < 1)
            throw new CustomError('No valid user id is provided', 422);

        const getDMConversationResult = await conversationService.getDMConversation(req.userId, userId);

        if (!getDMConversationResult.success)
            throw new CustomError(getDMConversationResult.message, getDMConversationResult.status);

        res.status(200).json({
            success: true,
            conversation: getDMConversationResult.conversation
        });
    } catch (error) {
        next(error);
    }
}

export async function postConversation(req, res, next) {
    const { title, image, type, participants } = req.body;

    try {
        requestValidation(req);

        const postConversationResult = await conversationService.postConversation(
            title,
            image,
            type,
            req.userId,
        );

        if (!postConversationResult.success)
            throw new CustomError(postConversationResult.message, postConversationResult.status);

        const { insertId: conversationId } = postConversationResult.createResult;

        await Promise.all(participants.map(participantId =>
            participantService.postParticipant(participantId, conversationId)
        ));

        res.status(201).json({
            success: true,
            conversationId,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateConversation(req, res, next) {
    const { title, image } = req.body;
    const { conversationId } = req.params;

    try {
        requestValidation(req);

        if (!conversationId || conversationId < 1)
            throw new CustomError('No valid conversation id is provided', 422);

        const getConversationResult = await conversationService.getConversation(conversationId);

        if (!getConversationResult.success)
            throw new CustomError(getConversationResult.message, getConversationResult.status);

        const { conversation: currentConversation } = getConversationResult;

        if (currentConversation.type === 1)
            throw new CustomError('You are not allowed to update this conversation', 403);

        const isGroupAdmin =
            currentConversation.creator_id === req.userId ||
            await participantService.isGroupAdmin(req.userId, conversationId);

        if (!isGroupAdmin || isGroupAdmin?.success) {
            if (isGroupAdmin?.status === 500)
                throw new CustomError('An error occurred while updating the conversation', 500);

            throw new CustomError('You are not allowed to update this conversation', 403);
        }

        if (isContentUnchanged(currentConversation.title, title, currentConversation.image, image))
            return res.status(200).json({
                success: true,
                message: 'No changes detected',
            });

        const updateConversationResult = await conversationService.updateConversation(
            conversationId,
            title,
            image,
        );

        if (!updateConversationResult.success)
            throw new CustomError(updateConversationResult.message, updateConversationResult.status);

        if (image && currentConversation.image !== image)
            await deleteMedia(currentConversation.image);

        res.status(200).json({
            success: true,
            message: 'Conversation updated successfully',
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteConversation(req, res, next) {
    const { conversationId } = req.params;

    try {
        if (!conversationId || conversationId < 1)
            throw new CustomError('No valid conversation id is provided', 422);

        const getConversationResult = await conversationService.getConversation(conversationId);

        if (!getConversationResult.success)
            throw new CustomError(getConversationResult.message, getConversationResult.status);

        const { conversation: currentConversation } = getConversationResult;

        if (currentConversation.type === 1)
            throw new CustomError('You are not allowed to delete this conversation', 403);

        const isGroupAdmin =
            currentConversation.creator_id === req.userId ||
            await participantService.isGroupAdmin(req.userId, conversationId);

        if (!isGroupAdmin.success) {
            if (isGroupAdmin.status === 500)
                throw new CustomError('An error occurred while deleting the conversation', 500);

            throw new CustomError('You are not allowed to delete this conversation', 403);
        }

        const deleteConversationResult = await conversationService.deleteConversation(
            conversationId,
            req.userId,
        );

        if (!deleteConversationResult.success)
            throw new CustomError(deleteConversationResult.message, deleteConversationResult.status);

        res.status(200).json({
            success: true,
            message: 'Conversation deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}
