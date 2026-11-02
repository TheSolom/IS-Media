import * as authService from '../services/authService.js';
import * as tokenService from '../services/tokenService.js';
import { sendResetPasswordMail } from '../services/verificationService.js';
import signUploadForm from '../utils/cloudinary/cloudinarySignature.js';
import CustomError from '../utils/errorHandling.js';
import { parseCookies } from '../utils/parseUtil.js';
import requestValidation from '../utils/requestValidation.js';

export async function login(req, res, next) {
    const { emailOrUsername, password } = req.body;

    try {
        requestValidation(req);

        const loginResult = await authService.loginUser(emailOrUsername, password);

        if (!loginResult.success) throw new CustomError(loginResult.message, loginResult.status);

        if (!loginResult.isVerified) {
            req.user = {
                id: loginResult.userId,
                username: loginResult.username,
                email: loginResult.email,
            };

            return res.status(403).json({
                success: false,
                message: 'Account is not verified. Please check your email for verification otp',
                user: {
                    id: loginResult.userId,
                    username: loginResult.username,
                    email: loginResult.email,
                },
            });
        }

        const createTokensResult = await tokenService.createLoginTokens({
            userId: loginResult.userId,
            username: loginResult.username,
            isSecure: true,
        });

        if (!createTokensResult.success)
            throw new CustomError('An error occurred while logging in the user', 500);

        res.setHeader('Set-Cookie', [
            `accessToken=${createTokensResult.accessToken}; Path=/; Max-Age=${process.env.ACCESS_TOKEN_EXPIRES_IN}; HttpOnly; SameSite=None; Secure`,
            `refreshToken=${createTokensResult.refreshToken}; Path=/; Max-Age=${process.env.REFRESH_TOKEN_EXPIRES_IN}; HttpOnly; SameSite=None; Secure`,
        ]);

        res.status(200).json({
            success: true,
            message: 'Successfully logged in',
            user: {
                id: loginResult.userId,
                username: loginResult.username,
                email: loginResult.email,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function refreshLogin(req, res, next) {
    try {
        if (!req.headers.cookie) throw new CustomError('You must be logged in', 401);

        const refreshLoginResult = await authService.refreshLogin(req.headers.cookie);

        if (!refreshLoginResult.success)
            throw new CustomError(refreshLoginResult.message, refreshLoginResult.status);

        const { userId, username, isGuest } = refreshLoginResult;

        const accessTokenResult = tokenService.createToken(
            {
                userId,
                username,
                isGuest: Boolean(isGuest),
                isSecure: false,
            },
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_EXPIRES_IN,
        );

        if (!accessTokenResult.success)
            return {
                success: false,
                message: 'An error occurred while refreshing login',
                status: 500,
            };

        res.setHeader(
            'Set-Cookie',
            `accessToken=${accessTokenResult.token}; Path=/; Max-Age=${process.env.ACCESS_TOKEN_EXPIRES_IN}; HttpOnly; SameSite=None; Secure`,
        );

        res.status(200).json({
            success: true,
            message: 'Successfully refreshed login',
        });
    } catch (error) {
        next(error);
    }
}

export async function signup(req, res, next) {
    const { firstname, lastname, username, email, password, birthDate, gender } = req.body;

    try {
        requestValidation(req);

        const signupResult = await authService.signupUser(
            firstname,
            lastname,
            username,
            email,
            password,
            birthDate,
            gender,
        );

        if (!signupResult.success) throw new CustomError(signupResult.error, signupResult.status);

        const { insertId: userId } = signupResult.createResult;

        req.user = { id: userId, username, email };

        res.status(201).json({
            success: true,
            message: 'Successfully signed up',
            user: {
                id: userId,
                username,
                email,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function logout(req, res, next) {
    try {
        const { cookie } = req.headers;

        if (!cookie) throw new CustomError('You must be logged in', 401);

        const parsedCookies = parseCookies(cookie);

        if (!parsedCookies || !parsedCookies.accessToken || !parsedCookies.refreshToken)
            throw new CustomError('You must be logged in', 401);

        res.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
        })
            .clearCookie('refreshToken', {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                path: '/',
            })
            .status(200)
            .json({
                success: true,
                message: 'Successfully logged out',
            });
    } catch (error) {
        next(error);
    }
}

export async function forgotPassword(req, res, next) {
    const { emailOrUsername } = req.body;

    try {
        requestValidation(req);

        if (emailOrUsername === 'demo_user' || emailOrUsername === 'demo@ismedia.com') {
            throw new CustomError('Password reset is not permitted for the demo account', 403);
        }

        const checkUserResult = await authService.checkUser(emailOrUsername);

        if (!checkUserResult.success)
            throw new CustomError(checkUserResult.message, checkUserResult.status);

        const { user } = checkUserResult;

        const sendMailResult = await sendResetPasswordMail(user.id, user.email, user.username);

        if (!sendMailResult.success)
            return {
                success: false,
                message: sendMailResult.message,
                status: sendMailResult.status,
            };

        res.status(201).json({
            success: true,
            message: 'Successfully sent password reset link to email',
        });
    } catch (error) {
        next(error);
    }
}

export async function resetPassword(req, res, next) {
    const { token } = req.params;
    const { password } = req.body;

    try {
        requestValidation(req);

        const resetPasswordResult = await authService.resetPassword(token, password);

        if (!resetPasswordResult.success)
            throw new CustomError(resetPasswordResult.message, resetPasswordResult.status);

        res.status(200).json({
            success: true,
            message: 'Successfully reset password',
        });
    } catch (error) {
        next(error);
    }
}

export async function getUploadSignature(req, res, _next) {
    const { timestamp, signature } = signUploadForm();

    res.status(200).json({
        signature,
        timestamp,
        cloudname: process.env.CLOUDINARY_NAME,
        apikey: process.env.CLOUDINARY_API_KEY,
    });
}

export async function guestLogin(req, res, next) {
    try {
        const guestResult = await authService.loginGuestUser();

        if (!guestResult.success) throw new CustomError(guestResult.message, guestResult.status);

        const createTokensResult = await tokenService.createLoginTokens({
            userId: guestResult.userId,
            username: guestResult.username,
            isGuest: true,
            isSecure: true,
        });

        if (!createTokensResult.success)
            throw new CustomError('An error occurred while logging in the guest user', 500);

        res.setHeader('Set-Cookie', [
            `accessToken=${createTokensResult.accessToken}; Path=/; Max-Age=${process.env.ACCESS_TOKEN_EXPIRES_IN}; HttpOnly; SameSite=None; Secure`,
            `refreshToken=${createTokensResult.refreshToken}; Path=/; Max-Age=${process.env.REFRESH_TOKEN_EXPIRES_IN}; HttpOnly; SameSite=None; Secure`,
        ]);

        res.status(200).json({
            success: true,
            message: 'Successfully logged in as guest',
            user: {
                id: guestResult.userId,
                username: guestResult.username,
                email: guestResult.email,
                isGuest: true,
            },
        });
    } catch (error) {
        next(error);
    }
}
