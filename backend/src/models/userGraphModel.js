import neo4j from 'neo4j-driver';

import { getNeo4jSession } from '../configs/neo4j.js';

export default class UserGraphModel {
    async findSuggestions(userId, limit) {
        const session = getNeo4jSession();
        try {
            const query = `
                MATCH (me:User { id: $userId })
                OPTIONAL MATCH (me)-[:FOLLOWS]->(friend:User)
                WITH me, collect(friend) AS directFriends
                OPTIONAL MATCH (me)-[:BLOCKED]-(blocked:User)
                WITH me, directFriends, collect(blocked) AS blockedUsers
                UNWIND directFriends AS friend
                MATCH (friend)-[:FOLLOWS]->(candidate:User)
                WHERE NOT candidate IN directFriends
                  AND NOT candidate IN blockedUsers
                  AND candidate <> me
                RETURN candidate.id AS userId,
                       candidate.username AS username,
                       count(DISTINCT friend) AS mutualCount
                ORDER BY mutualCount DESC, candidate.id ASC
                LIMIT $limit
            `;

            const result = await session.run(query, {
                userId: neo4j.int(userId),
                limit: neo4j.int(limit),
            });

            return result.records.map((record) => {
                const uId = record.get('userId');
                const mCount = record.get('mutualCount');
                return {
                    userId: neo4j.isInt(uId) ? uId.toNumber() : Number(uId),
                    username: record.get('username') || '',
                    mutualCount: neo4j.isInt(mCount) ? mCount.toNumber() : Number(mCount),
                };
            });
        } finally {
            await session.close();
        }
    }

    async addFollow(followerId, followeeId) {
        const session = getNeo4jSession();
        try {
            const query = `
                MERGE (follower:User { id: $followerId })
                MERGE (followee:User { id: $followeeId })
                MERGE (follower)-[:FOLLOWS]->(followee)
            `;
            await session.run(query, {
                followerId: neo4j.int(followerId),
                followeeId: neo4j.int(followeeId),
            });
        } finally {
            await session.close();
        }
    }

    async removeFollow(followerId, followeeId) {
        const session = getNeo4jSession();
        try {
            const query = `
                MATCH (follower:User { id: $followerId })-[r:FOLLOWS]->(followee:User { id: $followeeId })
                DELETE r
            `;
            await session.run(query, {
                followerId: neo4j.int(followerId),
                followeeId: neo4j.int(followeeId),
            });
        } finally {
            await session.close();
        }
    }

    async addBlock(blockerId, blockedId) {
        const session = getNeo4jSession();
        try {
            const query = `
                MERGE (blocker:User { id: $blockerId })
                MERGE (blocked:User { id: $blockedId })
                MERGE (blocker)-[:BLOCKED]->(blocked)
            `;
            await session.run(query, {
                blockerId: neo4j.int(blockerId),
                blockedId: neo4j.int(blockedId),
            });
        } finally {
            await session.close();
        }
    }

    async removeBlock(blockerId, blockedId) {
        const session = getNeo4jSession();
        try {
            const query = `
                MATCH (blocker:User { id: $blockerId })-[r:BLOCKED]->(blocked:User { id: $blockedId })
                DELETE r
            `;
            await session.run(query, {
                blockerId: neo4j.int(blockerId),
                blockedId: neo4j.int(blockedId),
            });
        } finally {
            await session.close();
        }
    }

    async bulkSyncUsers(users) {
        if (!users?.length) return;
        const session = getNeo4jSession();
        try {
            const query = `
                UNWIND $users AS u
                MERGE (node:User { id: u.id })
                SET node.username = u.username
            `;
            await session.run(query, {
                users: users.map((u) => ({
                    id: neo4j.int(u.id),
                    username: u.username,
                })),
            });
        } finally {
            await session.close();
        }
    }

    async bulkSyncFollows(follows) {
        if (!follows?.length) return;
        const session = getNeo4jSession();
        try {
            const query = `
                UNWIND $follows AS f
                MERGE (follower:User { id: f.follower_id })
                MERGE (followee:User { id: f.user_id })
                MERGE (follower)-[:FOLLOWS]->(followee)
            `;
            await session.run(query, {
                follows: follows.map((f) => ({
                    follower_id: neo4j.int(f.follower_id),
                    user_id: neo4j.int(f.user_id),
                })),
            });
        } finally {
            await session.close();
        }
    }

    async bulkSyncBlocks(blocks) {
        if (!blocks?.length) return;
        const session = getNeo4jSession();
        try {
            const query = `
                UNWIND $blocks AS b
                MERGE (blocker:User { id: b.user_id })
                MERGE (blocked:User { id: b.blocked_id })
                MERGE (blocker)-[:BLOCKED]->(blocked)
            `;
            await session.run(query, {
                blocks: blocks.map((b) => ({
                    user_id: neo4j.int(b.user_id),
                    blocked_id: neo4j.int(b.blocked_id),
                })),
            });
        } finally {
            await session.close();
        }
    }
}
