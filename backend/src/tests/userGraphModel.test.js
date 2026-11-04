import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { initNeo4j, closeNeo4j } from '../configs/neo4j.js';
import UserGraphModel from '../models/userGraphModel.js';

describe('UserGraphModel graph suggestions and edges', () => {
    const graphModel = new UserGraphModel();

    before(async () => {
        await initNeo4j();
        // Setup a test triangle: User 901 -> User 902 -> User 903
        await graphModel.addFollow(901, 902);
        await graphModel.addFollow(902, 903);
    });

    after(async () => {
        await graphModel.removeFollow(901, 902);
        await graphModel.removeFollow(902, 903);
        await closeNeo4j();
    });

    it('should find 903 as a suggestion for 901 with mutualCount = 1', async () => {
        const suggestions = await graphModel.findSuggestions(901, 5);
        const match = suggestions.find((s) => s.userId === 903);
        assert.ok(match, 'Candidate 903 should be suggested');
        assert.equal(match.mutualCount, 1);
    });

    it('should exclude candidate if blocked in either direction', async () => {
        await graphModel.addBlock(901, 903);
        try {
            const suggestions = await graphModel.findSuggestions(901, 5);
            const match = suggestions.find((s) => s.userId === 903);
            assert.equal(match, undefined, 'Candidate 903 must not be suggested when blocked');
        } finally {
            await graphModel.removeBlock(901, 903);
        }
    });

    it('should handle bulk synchronization of users, follows, and blocks', async () => {
        await graphModel.bulkSyncUsers([{ id: 910, username: 'test_sync_user' }]);
        await graphModel.bulkSyncFollows([{ follower_id: 910, user_id: 902 }]);
        await graphModel.bulkSyncBlocks([{ user_id: 910, blocked_id: 903 }]);

        // cleanup
        await graphModel.removeFollow(910, 902);
        await graphModel.removeBlock(910, 903);
    });
});
