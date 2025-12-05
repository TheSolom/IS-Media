import jwt from 'jsonwebtoken';

import TokenModel from '../models/tokenModel.js';

export const verifyToken = (token, secretKey) => {
    try {
        const decoded = jwt.verify(token, secretKey);

        return { success: true, decoded };
    } catch (error) {
        return { success: false };
    }
};

export const blacklistToken = async (token) => {
    const tokenModel = new TokenModel();

    try {
        const updateResult = await tokenModel.update({ token }, { blacklisted: 1 });

        if (!updateResult.affectedRows)
            return {
                success: false,
                message: 'No token found',
                status: 404,
            };

        return {
            success: true,
            updateResult
        };

    } catch (error) {
        return {
            success: false,
            message: 'An error occurred while blacklisting the token',
            status: 500,
        };
    }
};

export const getToken = async (token) => {
    const tokenModel = new TokenModel();

    try {
        const [tokenRow] = await tokenModel.find({ token });

        if (!tokenRow.length)
            return {
                success: false,
                message: 'No token found',
                status: 404,
            };

        return {
            success: true,
            token: tokenRow[0]
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const createToken = (userData, secretKey, expirationDurationSeconds) => {
    try {
        const token = jwt.sign(userData, secretKey, {
            expiresIn: expirationDurationSeconds,
        });

        const currentTimestampSeconds = Math.floor(Date.now() / 1000);
        const expiryTimestampSeconds = currentTimestampSeconds + parseInt(expirationDurationSeconds, 10);
        const expirationDate = new Date(expiryTimestampSeconds * 1000);

        return {
            success: true,
            token,
            exp: expirationDate
        };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
};

export const createLoginTokens = async (userData) => {
    const createAccessTokenResult = createToken(
        userData,
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRES_IN
    );

    if (!createAccessTokenResult.success)
        return { success: false };

    const createRefreshTokenResult = createToken(
        userData,
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_EXPIRES_IN
    );

    if (!createRefreshTokenResult.success)
        return { success: false };

    const tokenModel = new TokenModel();

    try {
        await tokenModel.create({ user_id: userData.userId, token: createRefreshTokenResult.token, expiration_date: createRefreshTokenResult.exp });

        return {
            success: true,
            accessToken: createAccessTokenResult.token,
            refreshToken: createRefreshTokenResult.token
        };
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return {
                success: true,
                accessToken: createAccessTokenResult.token,
                refreshToken: createRefreshTokenResult.token
            };
        }

        return {
            success: false,
            message: 'An error occurred while creating the token',
            status: 500,
        };
    }
};

export const deleteToken = async (token) => {
    const tokenModel = new TokenModel();

    try {
        const deleteResult = await tokenModel.delete({ token });

        if (!deleteResult.affectedRows)
            return {
                success: false,
                message: 'No token found',
                status: 404,
            };

        return {
            success: true
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while deleting the token',
            status: 500,
        };
    }
};
