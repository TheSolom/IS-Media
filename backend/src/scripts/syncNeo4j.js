import pool from '../configs/database.js';
import { initNeo4j, closeNeo4j } from '../configs/neo4j.js';
import UserGraphModel from '../models/userGraphModel.js';

export async function syncNeo4j() {
    console.log('🔄 Initializing Neo4j constraints...');
    await initNeo4j();

    const graphModel = new UserGraphModel();

    console.log('📥 Fetching users from MySQL...');
    const [users] = await pool.query('SELECT id, username FROM users');
    console.log(`Loaded ${users.length} users. Syncing to Neo4j...`);
    await graphModel.bulkSyncUsers(users);

    console.log('📥 Fetching follows from MySQL...');
    const [follows] = await pool.query('SELECT follower_id, user_id FROM user_followers');
    console.log(`Loaded ${follows.length} follow relationships. Syncing to Neo4j...`);
    await graphModel.bulkSyncFollows(follows);

    console.log('📥 Fetching blocklist from MySQL...');
    const [blocks] = await pool.query('SELECT user_id, blocked_id FROM user_blocklist');
    console.log(`Loaded ${blocks.length} block relationships. Syncing to Neo4j...`);
    await graphModel.bulkSyncBlocks(blocks);

    console.log('✅ Neo4j synchronization complete!');
    return {
        usersCount: users.length,
        followsCount: follows.length,
        blocksCount: blocks.length,
    };
}

if (process.argv[1]?.endsWith('syncNeo4j.js')) {
    syncNeo4j()
        .then((counts) => {
            console.log('Summary:', counts);
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ Sync failed:', err);
            process.exit(1);
        })
        .finally(async () => {
            await closeNeo4j();
            await pool.end();
        });
}
