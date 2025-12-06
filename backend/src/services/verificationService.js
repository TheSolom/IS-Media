import { randomInt } from 'node:crypto';

import transporter from '../configs/transporter.js';
import resetPasswordTemplate from "../Templates/Mail/resetPassword.js";
import accountVerificationTemplate from '../Templates/Mail/accountVerification.js';
import TokenModel from '../models/tokenModel.js';
import OTPModel from '../models/otpModel.js';

export const isDisposableEmail = async (email) => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("apikey", process.env.DISPOSABLE_EMAIL_CHECKER_API_KEY);

        const requestOptions = {
            method: 'GET',
            redirect: 'follow',
            headers: myHeaders
        };

        const response = await fetch(`https://api.apilayer.com/disposable_email/${email}`, requestOptions);
        if (!response.ok)
            throw new Error('API request failed');

        const result = await response.json();
        return result.is_disposable;
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while verifying the email',
            status: 500,
        };
    }
};

export const sendEmail = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            info,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while sending the email',
            status: 500,
        };
    }
};

export const sendResetPasswordMail = async (userId, email, username) => {
    const token = crypto.randomBytes(32).toString('hex');

    const currentTimestampSeconds = Math.floor(Date.now() / 1000);
    const expiryTimestampSeconds = currentTimestampSeconds + parseInt(process.env.RESET_PASSWORD_EXPIRES_IN, 10);
    const expirationDate = new Date(expiryTimestampSeconds * 1000);

    const tokenModel = new TokenModel();

    try {
        const createResult = await tokenModel.create({ user_id: userId, token, expiration_date: expirationDate });

        if (!createResult.success)
            throw new Error('An error occurred while storing the password reset token');

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        const mailOptions = {
            to: process.env.EMAIL_SENDER,
            subject: 'IS Media Password reset',
            html: resetPasswordTemplate(username, resetUrl),
            tags: [
                {
                    name: "category",
                    value: "reset_password",
                },
            ],
        };

        const sendEmailResult = await sendEmail(mailOptions);

        if (!sendEmailResult.success)
            throw new Error('An error occurred while sending the password reset email');

        return {
            success: true,
            info: sendEmailResult.info
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while sending the password reset email',
            status: 500,
        };
    };
};

export const sendVerificationEmail = async (email, username, otp) => {
    const mailOptions = {
        to: process.env.EMAIL_SENDER,
        subject: 'IS Media Account verification',
        html: accountVerificationTemplate(username, otp),
        tags: [
            {
                name: "category",
                value: "account_verification",
            },
        ],
    };

    try {
        const sendEmailResult = await sendEmail(mailOptions);

        if (!sendEmailResult.success)
            throw new Error('An error occurred while sending the account verification email');

        return {
            success: true,
            info: sendEmailResult.info
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message,
            status: 500,
        };
    };
};

export const checkOTPCoolDown = async (userId, purpose) => {
    const COOL_DOWN_PERIOD = 90 * 1000; // 1 minute and 30 seconds in milliseconds

    const otpModel = new OTPModel();

    try {
        const [otpRow] = await otpModel.find({ user_id: userId, purpose }, { orderBy: 'created_at DESC', limit: 1 });

        if (
            otpRow.length &&
            Date.now() - otpRow[0].created_at < COOL_DOWN_PERIOD
        ) {
            const timeRemaining = Math.ceil((COOL_DOWN_PERIOD - (Date.now() - otpRow[0].created_at)) / 1000);
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const remainingTimeString = minutes > 0 ? `${minutes}min ${seconds}s` : `${seconds}s`;

            return {
                success: true,
                isCoolDown: true,
                remainingTime: remainingTimeString,
            };
        }

        return {
            success: true,
            isCoolDown: false,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while verifying the otp',
            status: 500,
        };
    }
};

function generateOTP(length = 6) {
    const min = 10 ** (length - 1);
    const max = (10 ** length) - 1;

    return randomInt(min, max);
}

export const createOTP = async (userId, purpose) => {
    const otp = generateOTP(6);

    const otpModel = new OTPModel();
    try {
        const createResult = await otpModel.create({ user_id: userId, otp, purpose });

        if (!createResult.affectedRows)
            throw Error('An error occurred while creating the otp');

        return {
            success: true,
            otp
        };
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return {
                success: false,
                message: 'Invalid user id',
                status: 400,
            };
        }

        return {
            success: false,
            message: error.message,
            status: 500,
        };
    }
};

export const verifyOTP = async (userId, otp, purpose) => {
    const otpModel = new OTPModel();

    try {
        const [otpRow] = await otpModel.find({ user_id: userId, otp, purpose }, { orderBy: 'created_at DESC', limit: 1 });

        if (!otpRow.length)
            throw Error('Invalid OTP');

        const otpExp = new Date(otpRow[0].expiration_date);
        otpExp.setMinutes(otpExp.getMinutes() - otpExp.getTimezoneOffset());

        if (otpExp < Date.now())
            throw Error('OTP expired');

        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message,
            status: 500,
        };
    }
};
