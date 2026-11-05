import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';

import pool from '../configs/database.js';
import { initNeo4j, closeNeo4j } from '../configs/neo4j.js';
import { getUserFollowSuggestions } from '../services/userFollowsService.js';

describe('getUserFollowSuggestions service', () => {
    before(async () => {
        await initNeo4j();
    });

    after(async () => {
        await closeNeo4j();
        await pool.end();
    });

    it('should return suggestions for a connected user with id, username, profile_picture', async () => {
        const result = await getUserFollowSuggestions(1, 3);
        assert.equal(result.success, true);
        assert.ok(Array.isArray(result.users));
        assert.ok(result.users.length <= 3);
        if (result.users.length > 0) {
            const first = result.users[0];
            assert.ok('id' in first);
            assert.ok('username' in first);
            assert.ok('profile_picture' in first);
            assert.ok('mutual_count' in first);
        }
    });

    it('should return cold-start fallback suggestions for user with 0 follows', async () => {
        const result = await getUserFollowSuggestions(999999, 3);
        assert.equal(result.success, true);
        assert.ok(Array.isArray(result.users));
        assert.ok(result.users.length > 0, 'Cold-start user must receive suggestions');
        result.users.forEach((u) => {
            assert.ok('id' in u);
            assert.ok('username' in u);
            assert.ok('profile_picture' in u);
        });
    });
});
