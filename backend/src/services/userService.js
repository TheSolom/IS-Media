import bcrypt from 'bcrypt';

import UserModel from '../models/userModel.js';
import deleteMedia from '../utils/deleteMedia.js';

export const searchUser = async (username, limit) => {
    const userModel = new UserModel();

    try {
        const [usersRows] = await userModel.search(username, 'username', limit);

        return {
            success: true,
            users: usersRows,
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
            user: userRow[0],
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
        const hashedPassword = userNewData.password
            ? await bcrypt.hash(userNewData.password, 10)
            : undefined;

        const dbData = {
            firstname: userNewData.firstname,
            lastname: userNewData.lastname,
            username: userNewData.username,
            email: userNewData.email,
            password: hashedPassword,
            birth_date: userNewData.birthDate ?? userNewData.birth_date,
            gender: userNewData.gender,
            about: userNewData.about,
            profile_picture: userNewData.profilePicture ?? userNewData.profile_picture,
            cover_picture: userNewData.coverPicture ?? userNewData.cover_picture,
            lives_in: userNewData.livesIn ?? userNewData.lives_in,
            works_at: userNewData.worksAt ?? userNewData.works_at,
            relationship: userNewData.relationship,
        };

        // Remove undefined fields
        Object.keys(dbData).forEach((key) => dbData[key] === undefined && delete dbData[key]);

        const userModel = new UserModel();

        const [userOldData] = await userModel.find({ id: userNewData.id });
        if (!userOldData.length) throw new Error('No user found with provided id');

        const updateResult = await userModel.update(dbData, { id: userNewData.id });

        if (!updateResult.affectedRows) throw new Error('No user found with provided id');

        const newProfilePic = userNewData.profilePicture ?? userNewData.profile_picture;
        if (
            newProfilePic &&
            userOldData[0].profile_picture &&
            userOldData[0].profile_picture !== newProfilePic
        ) {
            await deleteMedia(userOldData[0].profile_picture);
        }

        const newCoverPic = userNewData.coverPicture ?? userNewData.cover_picture;
        if (
            newCoverPic &&
            userOldData[0].cover_picture &&
            userOldData[0].cover_picture !== newCoverPic
        ) {
            await deleteMedia(userOldData[0].cover_picture);
        }

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
