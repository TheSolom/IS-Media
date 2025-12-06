import * as verificationService from '../services/verificationService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';

export async function sendVerificationOTP(req, res, next) {
    const { userId, username, email } = req.body;

    try {
        requestValidation(req);

        const checkOTPCoolDown = await verificationService.checkOTPCoolDown(userId, 'email_verification');

        if (!checkOTPCoolDown.success)
            throw new CustomError(checkOTPCoolDown.message, checkOTPCoolDown.status);

        if (checkOTPCoolDown.isCoolDown)
            return res.status(429).json({
                success: true,
                message: `Please wait ${checkOTPCoolDown.remainingTime} before requesting a new OTP`,
            });

        const createOTPResult = await verificationService.createOTP(userId, 'email_verification');

        if (!createOTPResult.success)
            throw new CustomError(createOTPResult.message, createOTPResult.status);

        const sendMailResult = await verificationService.sendVerificationEmail(email, username, createOTPResult.otp);

        if (!sendMailResult.success)
            throw new CustomError(sendMailResult.message, sendMailResult.status);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
        });
    } catch (error) {
        next(error);
    }
};

export function send2FA(req, res, next) { }

export async function verifyOTP(req, res, next) {
    const { userId, otp, purpose } = req.body;

    try {
        requestValidation(req);

        const verifyOTPResult = await verificationService.verifyOTP(userId, otp, purpose);

        if (!verifyOTPResult.success)
            throw new CustomError(verifyOTPResult.message, verifyOTPResult.status);

        res.status(200).json({
            status: "success",
            message: "OTP verified successfully",
        });
    } catch (error) {
        next(error);
    }
};
