import deleteCloudinaryMedia from './cloudinary/cloudinaryDelete.js';

const getResourceType = (format) => {
    if (!format) throw new Error('No valid format is provided');

    const imageFormats = [
        'gif',
        'png',
        'jpg',
        'bmp',
        'ico',
        'pdf',
        'tiff',
        'eps',
        'jpc',
        'jp2',
        'psd',
        'webp',
        'zip',
        'svg',
        'webm',
        'wdp',
        'hpx',
        'djvu',
        'ai',
        'flif',
        'bpg',
        'miff',
        'tga',
        'heic',
    ];

    return imageFormats.includes(format) ? 'image' : 'video';
};

const deleteMedia = async (mediaUrl) => {
    const REGEX = /\/SocialMedia\/([^/]+)/;
    const match = mediaUrl.match(REGEX);

    if (match) {
        const publicId = match[0].slice(1, -4);

        const formatType = match[0].slice(-3);

        let resourceType;
        try {
            resourceType = getResourceType(formatType);
        } catch (error) {
            console.error(error);
            return { success: false };
        }

        try {
            const deleteResult = await deleteCloudinaryMedia(publicId, resourceType);

            return {
                success: true,
                message: deleteResult,
            };
        } catch (error) {
            console.error(error);
            return { success: false };
        }
    } else {
        console.error('No public id found in the image url');
        return { success: false };
    }
};

export default deleteMedia;
