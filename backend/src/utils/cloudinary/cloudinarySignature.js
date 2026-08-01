import cloudinary from '../../configs/cloudinary.js';

const signUploadForm = () => {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            folder: 'SocialMedia',
        },
        process.env.CLOUDINARY_API_SECRET,
    );

    return { timestamp, signature };
};

export default signUploadForm;
