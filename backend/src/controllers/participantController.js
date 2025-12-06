import * as participantService from '../services/participantService.js';
import * as conversationPermissionsService from '../services/conversationPermissionsService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';

export async function searchParticipant(req, res, next) {
    const { conversationId, username } = req.params;
    const { limit } = req.query;

    try {
        requestValidation(req);

        const searchParticipantResult = await participantService.searchParticipant(
            conversationId,
            username,
            limit ?? 10
        );

        if (!searchParticipantResult.success)
            throw new CustomError(searchParticipantResult.message, searchParticipantResult.status);

        res.status(searchParticipantResult.participants.length ? 200 : 404).json({
            success: true,
            Participants: searchParticipantResult.participants,
        });
    } catch (error) {
        next(error);
    }
}

export async function getParticipant(req, res, next) {
    const { conversationId, userId } = req.params;

    try {
        const getParticipantResult = await participantService.getParticipant(
            userId,
            conversationId,
        );

        if (!getParticipantResult.success)
            throw new CustomError(getParticipantResult.message, getParticipantResult.status);

        res.status(200).json({
            success: true,
            participant: getParticipantResult.participant
        });
    } catch (error) {
        next(error);
    }
}

export async function getParticipants(req, res, next) {
    const { conversationId } = req.params;
    const { adminsOnly, pastOnly } = req.query;

    try {
        requestValidation(req);

        let getParticipantsResult = null;

        if (adminsOnly === 'true') {
            getParticipantsResult = await participantService.getAdminParticipants(
                conversationId
            );
        }
        else if (pastOnly === 'true') {
            getParticipantsResult = await participantService.getPastParticipants(
                conversationId
            );
        } else {
            getParticipantsResult = await participantService.getParticipants(
                conversationId
            );
        }

        if (!getParticipantsResult.success)
            throw new CustomError(getParticipantsResult.message, getParticipantsResult.status);

        res.status(getParticipantsResult.participants.length ? 200 : 204).json({
            success: true,
            participants: getParticipantsResult.participants,
        });
    } catch (error) {
        next(error);
    }
}

export async function postParticipant(req, res, next) {
    const { userId } = req.body;
    const { conversationId } = req.params;

    try {
        requestValidation(req);

        if (userId !== req.userId) {
            const isAdmin = await participantService.validateAdminPrivileges(req.userId, conversationId);

            if (!isAdmin)
                throw new CustomError('Only admins can add other participants', 403);
        }

        const getRestrictedPermissionsResult = await conversationPermissionsService.getRestrictedPermissions(
            conversationId,
        );

        if (!getRestrictedPermissionsResult.success)
            throw new CustomError('An error occurred while adding the participant', 500);

        const restrictedPermission = getRestrictedPermissionsResult.restrictedPermissions
            .find(permission => permission.conversation_id === conversationId && permission.permission === 'add_members');

        if (restrictedPermission)
            throw new CustomError('You are not allowed to add members to this conversation', 401);

        const postParticipantResult = await participantService.postParticipant(
            userId ?? req.userId,
            conversationId,
        );

        if (!postParticipantResult.success)
            throw new CustomError(postParticipantResult.message, postParticipantResult.status);

        res.status(201).json({
            success: true,
            participantId: postParticipantResult.createResult.insertId,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteParticipant(req, res, next) {
    const { conversationId, participantId } = req.params;

    try {
        requestValidation(req);

        if (participantId !== req.userId) {
            const isAdmin = await participantService.validateAdminPrivileges(req.userId, conversationId);

            if (!isAdmin)
                throw new CustomError('Only admins can delete other participants', 403);
        }

        const deleteParticipantResult = await participantService.deleteParticipant(
            participantId ?? req.userId,
            conversationId,
        );

        if (!deleteParticipantResult.success)
            throw new CustomError(deleteParticipantResult.message, deleteParticipantResult.status);

        res.status(200).json({
            success: true,
            message: 'Participant deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}
