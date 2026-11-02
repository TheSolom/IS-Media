import * as storyService from '../services/storyService.js';
import CustomError from '../utils/errorHandling.js';
import requestValidation from '../utils/requestValidation.js';

export async function getUserStories(req, res, next) {
    const { activeOnly, pastOnly, lastId, limit } = req.query;

    try {
        requestValidation(req);

        let getUserStoriesResult = null;

        if (activeOnly === 'true') {
            getUserStoriesResult = await storyService.getActiveUserStories(
                req.user.id,
                lastId ?? 0,
                limit ?? 10,
            );
        } else if (pastOnly === 'true') {
            getUserStoriesResult = await storyService.getPastUserStories(
                req.user.id,
                lastId ?? 0,
                limit ?? 10,
            );
        } else {
            getUserStoriesResult = await storyService.getUserStories(
                req.user.id,
                lastId ?? 0,
                limit ?? 10,
            );
        }

        if (!getUserStoriesResult.success)
            throw new CustomError(getUserStoriesResult.message, getUserStoriesResult.status);

        res.status(getUserStoriesResult.stories.length ? 200 : 204).json({
            success: true,
            lastId: getUserStoriesResult.lastId,
            stories: getUserStoriesResult.stories,
        });
    } catch (error) {
        next(error);
    }
}

export async function getFeedStories(req, res, next) {
    const { lastId, limit } = req.query;

    try {
        requestValidation(req);

        const getFeedStoriesResult = await storyService.getFeedStories(
            req.user.id,
            lastId ?? 0,
            limit ?? 10,
        );

        if (!getFeedStoriesResult.success)
            throw new CustomError(getFeedStoriesResult.message, getFeedStoriesResult.status);

        res.status(getFeedStoriesResult.stories.length ? 200 : 204).json({
            success: true,
            lastId: getFeedStoriesResult.lastId,
            stories: getFeedStoriesResult.stories,
        });
    } catch (error) {
        next(error);
    }
}

export async function getStory(req, res, next) {
    const storyId = Number(req.params.storyId);

    try {
        if (!storyId || storyId < 1) throw new CustomError('No valid story id is provided', 422);

        const getStoryResult = await storyService.getStory(storyId);

        if (!getStoryResult.success)
            throw new CustomError(getStoryResult.message, getStoryResult.status);

        res.status(200).json({
            success: true,
            story: getStoryResult.story,
        });
    } catch (error) {
        next(error);
    }
}

export async function postStory(req, res, next) {
    const { content } = req.body;

    try {
        requestValidation(req);

        const postStoryResult = await storyService.postStory(content, req.user.id);

        if (!postStoryResult.success)
            throw new CustomError(postStoryResult.message, postStoryResult.status);

        res.status(201).json({
            success: true,
            message: 'Successfully created story',
            storyId: postStoryResult.createResult.insertId,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteStory(req, res, next) {
    const storyId = Number(req.params.storyId);

    try {
        if (!storyId || storyId < 1) throw new CustomError('No valid story id is provided', 422);

        const deleteStoryResult = await storyService.deleteStory(storyId, req.user.id);

        if (!deleteStoryResult.success)
            throw new CustomError(deleteStoryResult.message, deleteStoryResult.status);

        res.status(200).json({
            success: true,
            message: 'Successfully deleted story',
        });
    } catch (error) {
        next(error);
    }
}
