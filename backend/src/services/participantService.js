import ParticipantModel from '../models/participantModel.js';

export const searchParticipant = async (conversationId, username, limit) => {
    const participantModel = new ParticipantModel();

    try {
        const [participantsRows] = await participantModel.searchParticipant(conversationId, username, limit);

        return {
            success: true,
            participants: participantsRows
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while searching the participant',
            status: 500,
        };
    }
};

export const getParticipant = async (userId, conversationId) => {
    const participantModel = new ParticipantModel();

    try {
        const [participantRow] = await participantModel.findParticipant(userId, conversationId);

        if (!participantRow.length)
            return {
                success: false,
                message: `No participant found with provided id '${userId}' `,
                status: 404,
            };

        return {
            success: true,
            participant: participantRow[0]
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the participant',
            status: 500,
        };
    }
};

export const getParticipants = async (conversationId) => {
    const participantModel = new ParticipantModel();

    try {
        const [participantsRows] = await participantModel.findParticipants(conversationId);

        return {
            success: true,
            participants: participantsRows
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the participants',
            status: 500,
        };
    }
};

export const getAdminParticipants = async (conversationId) => {
    const participantModel = new ParticipantModel();

    try {
        const [participantsRows] = await participantModel.findAdminParticipants(conversationId);

        return {
            success: true,
            participants: participantsRows
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the participants',
            status: 500,
        };
    }
};

export const getPastParticipants = async (conversationId) => {
    const participantModel = new ParticipantModel();

    try {
        const [participantsRows] = await participantModel.findPastParticipants(conversationId);

        return {
            success: true,
            participants: participantsRows
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the participants',
            status: 500,
        };
    }
};

export const isGroupAdmin = async (userId, conversationId) => {
    const getParticipantResult = await getParticipant(userId, conversationId);

    if (!getParticipantResult.success)
        return {
            success: false,
            message: getParticipantResult.message,
            status: getParticipantResult.status
        };

    return {
        success: true,
        isAdmin: getParticipantResult.participant.role === 'admin',
    };
};

export const postParticipant = async (userId, conversationId) => {
    const participantModel = new ParticipantModel();

    try {
        const createResult = await participantModel.create({ user_id: userId, conversation_id: conversationId });

        if (!createResult.affectedRows)
            return {
                success: false,
                message: 'An error occurred while adding the participant',
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
                message: 'User is already a participant',
                status: 409,
            };

        if (error.code === 'ER_NO_REFERENCED_ROW_2')
            return {
                success: false,
                message: 'The conversation or user does not exist',
                status: 404,
            };

        return {
            success: false,
            message: 'An error occurred while adding the participant',
            status: 500,
        };
    }
};

export const deleteParticipant = async (participantId, conversationId) => {
    const participantModel = new ParticipantModel();

    try {
        const deleteResult = await participantModel.update({ deleted_at: new Date() }, { id: participantId, conversation_id: conversationId });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: `No participant found with provided id '${participantId}' `,
                status: 404,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while deleting the participant',
            status: 500,
        };
    }
};
