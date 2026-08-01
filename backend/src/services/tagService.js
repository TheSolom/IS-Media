import validator from 'validator';

import TagsModel from '../models/tagsModel.js';

export const exportTags = async (title, content) => {
    const tags = validator.isURL(content)
        ? title.match(/#([^#\s]+)/g)
        : content.match(/#([^#\s]+)/g);

    const uniqueTags = [...new Set(tags)];

    return uniqueTags;
};

export const postTags = async (tags) => {
    if (!tags || !tags.length) {
        return {
            success: false,
            message: 'No tags provided',
            status: 400,
        };
    }

    const tagsModel = new TagsModel();

    const tagsIds = [];
    try {
        const createTagsPromises = tags.map(async (tag) => {
            const tagNormalized = tag.substring(1).toLowerCase();

            if (!validator.isAlphanumeric(tagNormalized)) return Promise.resolve();

            const [tagRow] = await tagsModel.find({ tag: tagNormalized });

            let tagId = null;

            if (!tagRow.length) {
                const createTagResult = await tagsModel.create({ tag: tagNormalized });

                if (!createTagResult.affectedRows) return Promise.reject();

                tagId = createTagResult.insertId;
            } else tagId = tagRow[0].id;

            tagsIds.push(tagId);

            return Promise.resolve();
        });

        const createPostTagsResults = await Promise.allSettled(createTagsPromises);

        const rejectedPromises = createPostTagsResults.filter(
            (result) => result.status === 'rejected',
        );

        if (rejectedPromises.length) {
            console.error('Some tags failed to be added:', rejectedPromises);
            return {
                success: false,
                message: 'Failed to add some tags to the post',
                status: 500,
            };
        }

        return {
            success: true,
            message: 'Successfully added tags to the post',
            tagsIds,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'An error occurred while adding tags',
            status: 500,
        };
    }
};
