import cloudinary from '../../configs/cloudinary.js';

const deleteCloudinaryMedia = async (publicId, resourceType) => {
    if (!publicId) throw new Error('No valid public id is provided');

    if (!resourceType) throw new Error('No valid resource type is provided');

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
    });

    return result;
};

export default deleteCloudinaryMedia;
