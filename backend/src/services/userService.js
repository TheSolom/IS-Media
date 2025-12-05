import bcrypt from 'bcrypt';

import UserModel from '../models/userModel.js';
import deleteMedia from '../utils/deleteMedia.js';

export const searchUser = async (username, limit) => {
    const userModel = new UserModel();

    try {
        const [usersRows] = await userModel.search(username, 'username', limit);

        return {
            success: true,
            users: usersRows
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while searching the users',
            status: 500,
        };
    }
};

export const getUser = async (userId) => {
    const userModel = new UserModel();

    try {
        const [userRow] = await userModel.find({ id: userId });

        if (!userRow.length)
            return {
                success: false,
                message: `No user found with provided id '${userId}' `,
                status: 404,
            };

        delete userRow[0].password;

        const date = new Date(userRow[0].birth_date);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        const datePart = date.toISOString().split('T')[0];
        userRow[0].birth_date = datePart;

        return {
            success: true,
            user: userRow[0]
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while fetching the user',
            status: 500,
        };
    }
};

export const updateUser = async (userNewData) => {
    try {
        const userNewDataHashed = userNewData;
        userNewDataHashed.password = await bcrypt.hash(userNewData.password, 10);

        const userModel = new UserModel();

        const updateResult = await userModel.update(userNewDataHashed, { id: userNewData.id });

        if (!updateResult.affectedRows)
            throw new Error('No user found with provided id');

        const [userOldData] = await userModel.find({ id: userNewData.id });

        if (userOldData[0].profile_picture !== userNewData.profilePicture)
            await deleteMedia(userOldData[0].profile_picture);

        if (userOldData[0].cover_picture !== userNewData.coverPicture)
            await deleteMedia(userOldData[0].cover_picture);

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while updating the user',
            status: 500,
        };
    }
};
