import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';

import pool from '../configs/database.js';
import { initNeo4j, closeNeo4j, getNeo4jSession } from '../configs/neo4j.js';
import { postUserBlock, deleteUserBlock } from '../services/userBlocksService.js';
import { postUserFollow, deleteUserFollow } from '../services/userFollowsService.js';

describe('Real-time Neo4j sync hooks in services', () => {
    before(async () => {
        await initNeo4j();
    });

    after(async () => {
        await closeNeo4j();
        await pool.end();
    });

    it('should sync follow and unfollow to Neo4j', async () => {
        // Use demo users 1 and 2
        // Ensure clean state in MySQL and Neo4j
        await deleteUserFollow(2, 1);

        const followRes = await postUserFollow(2, 1);
        assert.equal(followRes.success, true);

        // Verify edge in Neo4j
        const session = getNeo4jSession();
        try {
            const checkRes = await session.run(
                'MATCH (:User { id: 1 })-[r:FOLLOWS]->(:User { id: 2 }) RETURN count(r) AS count',
            );
            assert.equal(checkRes.records[0].get('count').toInt(), 1);
        } finally {
            await session.close();
        }

        // Unfollow
        const unfollowRes = await deleteUserFollow(2, 1);
        assert.equal(unfollowRes.success, true);

        // Verify edge removed in Neo4j
        const session2 = getNeo4jSession();
        try {
            const checkRes2 = await session2.run(
                'MATCH (:User { id: 1 })-[r:FOLLOWS]->(:User { id: 2 }) RETURN count(r) AS count',
            );
            assert.equal(checkRes2.records[0].get('count').toInt(), 0);
        } finally {
            await session2.close();
        }
    });

    it('should sync block and unblock to Neo4j', async () => {
        // Ensure clean state
        await deleteUserBlock(2, 1);

        const blockRes = await postUserBlock(2, 1);
        assert.equal(blockRes.success, true);

        const session = getNeo4jSession();
        try {
            const checkRes = await session.run(
                'MATCH (:User { id: 1 })-[r:BLOCKED]->(:User { id: 2 }) RETURN count(r) AS count',
            );
            assert.equal(checkRes.records[0].get('count').toInt(), 1);
        } finally {
            await session.close();
        }

        // Unblock
        const unblockRes = await deleteUserBlock(2, 1);
        assert.equal(unblockRes.success, true);

        const session2 = getNeo4jSession();
        try {
            const checkRes2 = await session2.run(
                'MATCH (:User { id: 1 })-[r:BLOCKED]->(:User { id: 2 }) RETURN count(r) AS count',
            );
            assert.equal(checkRes2.records[0].get('count').toInt(), 0);
        } finally {
            await session2.close();
        }
    });
});
