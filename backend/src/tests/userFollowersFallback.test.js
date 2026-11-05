import assert from 'node:assert/strict';
import { describe, it, after } from 'node:test';

import pool from '../configs/database.js';
import UserFollowersModel from '../models/userFollowersModel.js';

describe('UserFollowersModel fallback and profile enrichment', () => {
    const model = new UserFollowersModel();

    after(async () => {
        await pool.end();
    });

    it('should return popular accounts when excluding given user and exclusions', async () => {
        const [rows] = await model.findPopularFollowFallback(1, [2], 5);
        assert.ok(Array.isArray(rows));
        assert.ok(rows.every((u) => u.id !== 1 && u.id !== 2));
        if (rows.length) {
            assert.ok('username' in rows[0]);
            assert.ok('profile_picture' in rows[0]);
            assert.ok('followers_count' in rows[0]);
        }
    });

    it('should fetch user profile details by IDs', async () => {
        const [rows] = await model.findUsersWithProfileByIds([1, 2]);
        assert.ok(Array.isArray(rows));
        if (rows.length) {
            assert.ok('id' in rows[0]);
            assert.ok('username' in rows[0]);
            assert.ok('profile_picture' in rows[0]);
        }
    });

    it('should return empty array for empty IDs list', async () => {
        const [rows] = await model.findUsersWithProfileByIds([]);
        assert.deepEqual(rows, []);
    });
});
