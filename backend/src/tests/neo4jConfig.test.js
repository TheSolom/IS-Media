import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';

import { getNeo4jSession, initNeo4j, closeNeo4j } from '../configs/neo4j.js';

describe('Neo4j Config and Driver', () => {
    before(async () => {
        await initNeo4j();
    });

    after(async () => {
        await closeNeo4j();
    });

    it('should establish a session and execute a simple query', async () => {
        const session = getNeo4jSession();
        try {
            const res = await session.run('RETURN 1 AS num');
            assert.equal(res.records[0].get('num').toInt(), 1);
        } finally {
            await session.close();
        }
    });

    it('should have user_id_unique constraint defined', async () => {
        const session = getNeo4jSession();
        try {
            const res = await session.run(
                'SHOW CONSTRAINTS YIELD name WHERE name = "user_id_unique" RETURN count(name) AS count',
            );
            assert.equal(res.records[0].get('count').toInt(), 1);
        } finally {
            await session.close();
        }
    });
});
