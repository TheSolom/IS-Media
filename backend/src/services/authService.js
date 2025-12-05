import bcrypt from 'bcrypt';
import isEmail from 'validator/lib/isEmail.js';

import * as tokenService from './tokenService.js';
import UserModel from '../models/userModel.js';
import * as parseUtil from '../utils/parseUtil.js';

export const checkUser = async (emailOrUsername) => {
    const userModel = new UserModel();

    try {
        let userRow = [];

        if (isEmail(emailOrUsername)) {
            const email = emailOrUsername;
            [userRow] = await userModel.find({ email });
        } else {
            const username = emailOrUsername;
            [userRow] = await userModel.find({ username });
        }

        if (!userRow.length)
            return {
                success: false,
                message: 'Incorrect username or email. Please try again',
                status: 401,
            };

        return {
            success: true,
            user: userRow[0]
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while verifying the user',
            status: 500,
        };
    }
};

export const loginUser = async (emailOrUsername, password) => {
    const checkUserResult = await checkUser(emailOrUsername);

    if (!checkUserResult.success)
        return {
            success: false,
            message: checkUserResult.message,
            status: checkUserResult.status,
        };

    const { user } = checkUserResult;

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch)
        return {
            success: false,
            message: 'Incorrect username or email or password. Please try again',
            status: 401,
        };

    return {
        success: true,
        isVerified: user.is_verified,
        userId: user.id,
        username: user.username,
        email: user.email
    };
};

export const refreshLogin = async (cookies) => {
    const parsedCookies = parseUtil.parseCookies(cookies);

    if (!parsedCookies || !parsedCookies.refreshToken)
        return {
            success: false,
            message: 'You must be logged in',
            status: 401,
        };

    const token = parsedCookies.accessToken;

    const verifyTokenResult = tokenService.verifyToken(token, process.env.REFRESH_TOKEN_SECRET);

    if (!verifyTokenResult.success)
        return {
            success: false,
            message: 'Invalid token, Please login again',
            status: 401,
        };

    const { userId: decodedUserId, username: decodedUsername, exp: decodedExp } = verifyTokenResult.decoded;

    const currentTime = Math.floor(Date.now() / 1000);

    if (decodedExp < currentTime)
        return {
            success: false,
            message: 'Token expired, Please login again',
            status: 401,
        };

    const getTokenResult = await tokenService.getToken(token);

    if (!getTokenResult.success || getTokenResult.token.blacklisted)
        return {
            success: false,
            message: 'Invalid token, Please login again',
            status: 401,
        };

    if (decodedUserId !== getTokenResult.token.user_id) {
        const blacklistTokenResult = await tokenService.blacklistToken(token);

        if (!blacklistTokenResult.success)
            return {
                success: false,
                message: 'An error occurred while blacklisting the token',
                status: 500,
            };

        return {
            success: false,
            message: 'Invalid token, Please login again',
            status: 401,
        };
    }

    return {
        success: true,
        userId: decodedUserId,
        username: decodedUsername
    };
};

export const signupUser = async (firstname, lastname, username, email, password, birthDate, gender) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword,
            birth_date: birthDate,
            gender,
        };

        const userModel = new UserModel();

        const createResult = await userModel.create(newUser);

        return {
            success: true,
            createResult
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while signing up the user',
            status: 500,
        };
    }
};

export const resetPassword = async (token, password) => {
    try {
        const getTokenResult = await tokenService.getToken(token);

        if (!getTokenResult.success || getTokenResult.token.blacklisted)
            return {
                success: false,
                message: 'Invalid token, Please try again',
                status: 401,
            };

        const { token: tokenRow } = getTokenResult;

        const currentTime = Math.floor(Date.now() / 1000);

        if (tokenRow.expiration_date < currentTime)
            return {
                success: false,
                message: 'Token expired, Please try again',
                status: 401,
            };

        const deleteResult = await tokenService.deleteToken(token);

        if (!deleteResult.success)
            return {
                success: false,
                message: 'An error occurred while resetting the password',
                status: 500,
            };

        const hashedPassword = await bcrypt.hash(password, 10);

        const userModel = new UserModel();

        const updateResult = await userModel.update({ password: hashedPassword }, { id: tokenRow.user_id });

        if (!updateResult.affectedRows)
            return {
                success: false,
                message: 'Failed to update password',
                status: 401,
            };

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while resetting the password',
            status: 500,
        };
    }
};
