import bcrypt from 'bcrypt';

import UserModel from '../models/userModel.js';
import deleteMedia from '../utils/deleteMedia.js';

export const searchUser = async (username, limit) => {
    const userModel = new UserModel();

    try {
        const [usersRows] = await userModel.search(username, 'username', limit);

        // Sanitize sensitive fields before returning search results
        const sanitizedUsers = usersRows.map(({ password, email, ...rest }) => rest);

        return {
            success: true,
            users: sanitizedUsers,
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

        if (userRow[0].birth_date) {
            const date = new Date(userRow[0].birth_date);
            if (!Number.isNaN(date.getTime())) {
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                userRow[0].birth_date = date.toISOString().split('T')[0];
            }
        }

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

        const resolveField = (camel, snake) => (camel !== undefined ? camel : snake);

        const dbData = {
            firstname: userNewData.firstname,
            lastname: userNewData.lastname,
            username: userNewData.username,
            email: userNewData.email,
            password: hashedPassword,
            birth_date: resolveField(userNewData.birthDate, userNewData.birth_date),
            gender: userNewData.gender,
            about: userNewData.about,
            profile_picture: resolveField(userNewData.profilePicture, userNewData.profile_picture),
            cover_picture: resolveField(userNewData.coverPicture, userNewData.cover_picture),
            lives_in: resolveField(userNewData.livesIn, userNewData.lives_in),
            works_at: resolveField(userNewData.worksAt, userNewData.works_at),
            relationship: userNewData.relationship,
        };

        // Remove undefined fields (leaving null for fields intended to be cleared)
        Object.keys(dbData).forEach((key) => dbData[key] === undefined && delete dbData[key]);

        if (Object.keys(dbData).length === 0) {
            return { success: true, message: 'No fields provided to update' };
        }

        const userModel = new UserModel();

        const [userOldData] = await userModel.find({ id: userNewData.id });
        if (!userOldData.length) {
            return {
                success: false,
                message: 'No user found with provided id',
                status: 404,
            };
        }

        await userModel.update(dbData, { id: userNewData.id });

        const newProfilePic = resolveField(userNewData.profilePicture, userNewData.profile_picture);
        if (
            newProfilePic !== undefined &&
            userOldData[0].profile_picture &&
            userOldData[0].profile_picture !== newProfilePic
        ) {
            await deleteMedia(userOldData[0].profile_picture);
        }

        const newCoverPic = resolveField(userNewData.coverPicture, userNewData.cover_picture);
        if (
            newCoverPic !== undefined &&
            userOldData[0].cover_picture &&
            userOldData[0].cover_picture !== newCoverPic
        ) {
            await deleteMedia(userOldData[0].cover_picture);
        }

        return { success: true };
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return {
                success: false,
                message: 'Username or email is already in use',
                status: 409,
            };
        }

        return {
            success: false,
            message: 'An error occurred while updating the user',
            status: 500,
        };
    }
};
