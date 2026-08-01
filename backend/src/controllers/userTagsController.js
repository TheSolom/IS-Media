import * as userTagsService from '../services/userTagsService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';

export default async function getMostUsedTags(req, res, next) {
    const { limit } = req.query;

    try {
        requestValidation(req);

        const getMostUsedTagsResult = await userTagsService.getMostUsedTags(req.userId, limit ?? 5);

        if (!getMostUsedTagsResult.success)
            throw new CustomError(getMostUsedTagsResult.message, getMostUsedTagsResult.status);

        res.status(getMostUsedTagsResult.tags.length ? 200 : 204).json({
            success: true,
            tags: getMostUsedTagsResult.tags,
        });
    } catch (error) {
        next(error);
    }
}
