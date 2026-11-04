# Follow Suggestions with Neo4j Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a production-ready, graph-native follow suggestions engine powered by Neo4j Aura with cold-start MySQL fallback, real-time sync hooks, and multi-factor ranking.

**Architecture:** Social connections (`FOLLOWS` and `BLOCKED` relationships) are managed in Neo4j Aura, allowing multi-hop friend-of-friend Cypher traversal with mutual connection ranking. When graph candidates are fewer than `limit`, a relational fallback pipeline in MySQL backfills with top-followed and verified accounts, and MySQL enriches candidate IDs with user profile pictures and metadata.

**Tech Stack:** Node.js (ES modules), `neo4j-driver`, MySQL (`mysql2`), Express 5.

**Spec:** `docs/superpowers/specs/2026-11-04-follow-suggestions-enhancement-design.md`

## Global Constraints

- Backend uses native Node.js ES modules (`"type": "module"`).
- All Neo4j queries must use parameterized inputs (never concatenate user inputs into Cypher strings).
- Sessions from `driver.session()` must always be closed in `finally` blocks.
- API contract for `GET /api/v1/users/suggested-followings` must return `{ success: true, users: [...] }` where each user has `id`, `username`, `profile_picture`.
- Two-way blocklist safety: If user A blocks user B or user B blocks user A, neither must ever appear in the other's suggestions.

## Review Focus

- Cold-start user with 0 follows: Must return top verified/popular accounts instead of an empty array.
- Self-recommendation prevention: Current user must never be recommended to themselves.
- Bi-directional block exclusion: If user B has blocked user A, user B must not appear in user A's suggestions.
- Already-followed exclusion: Direct followees must never appear in suggestions even if reachable through multiple friends.
- Graceful degradation: If Neo4j query fails or times out, the service should catch the error and fall back to MySQL popular users rather than crashing the request.

---

### Task 1: Neo4j Driver Configuration and Lifecycle Management

**Files:**
- Create: `backend/src/configs/neo4j.js`
- Test: `backend/src/tests/neo4jConfig.test.js`

**Interfaces:**
- Produces: 
  - `driver`: `neo4j.Driver` singleton.
  - `getNeo4jSession(database?: string) -> neo4j.Session`.
  - `initNeo4j() -> Promise<{ success: boolean }>`.
  - `closeNeo4j() -> Promise<void>`.

- [ ] **Step 1: Write test for Neo4j driver connection and constraint verification**

Create `backend/src/tests/neo4jConfig.test.js`:
```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
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
            const res = await session.run('SHOW CONSTRAINTS YIELD name WHERE name = "user_id_unique" RETURN count(name) AS count');
            assert.equal(res.records[0].get('count').toInt(), 1);
        } finally {
            await session.close();
        }
    });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test --env-file=backend/.env backend/src/tests/neo4jConfig.test.js`
Expected: FAIL ("Cannot find module '../configs/neo4j.js'")

- [ ] **Step 3: Implement `backend/src/configs/neo4j.js`**

Implement connection handling, pooling, error management, and constraint initialization:
```javascript
import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;
const defaultDatabase = process.env.NEO4J_DATABASE || 'neo4j';

let driver = null;

if (uri && user && password) {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionPoolSize: 50,
        connectionTimeout: 10000,
    });
}

export const getNeo4jSession = (database = defaultDatabase) => {
    if (!driver) throw new Error('Neo4j driver is not configured.');
    return driver.session({ database });
};

export const initNeo4j = async () => {
    if (!driver) return { success: false, message: 'Driver not configured' };
    const session = getNeo4jSession();
    try {
        await session.run(`
            CREATE CONSTRAINT user_id_unique IF NOT EXISTS
            FOR (u:User) REQUIRE u.id IS UNIQUE
        `);
        return { success: true };
    } catch (err) {
        console.error('Failed to initialize Neo4j constraints:', err.message);
        return { success: false, error: err };
    } finally {
        await session.close();
    }
};

export const closeNeo4j = async () => {
    if (driver) await driver.close();
};

export default driver;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --env-file=backend/.env backend/src/tests/neo4jConfig.test.js`
Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add backend/src/configs/neo4j.js backend/src/tests/neo4jConfig.test.js
git commit -m "feat(neo4j): add Neo4j driver config, session helper, and constraint init"
```

---

### Task 2: Graph Data Model Service (`userGraphModel.js`)

**Files:**
- Create: `backend/src/models/userGraphModel.js`
- Test: `backend/src/tests/userGraphModel.test.js`

**Interfaces:**
- Consumes: `getNeo4jSession` from `backend/src/configs/neo4j.js`
- Produces:
  - `UserGraphModel.findSuggestions(userId: number, limit: number) -> Promise<Array<{ userId: number, username: string, mutualCount: number }>>`
  - `UserGraphModel.addFollow(followerId: number, followeeId: number) -> Promise<void>`
  - `UserGraphModel.removeFollow(followerId: number, followeeId: number) -> Promise<void>`
  - `UserGraphModel.addBlock(blockerId: number, blockedId: number) -> Promise<void>`
  - `UserGraphModel.removeBlock(blockerId: number, blockedId: number) -> Promise<void>`
  - `UserGraphModel.bulkSyncUsers(users: Array<{ id: number, username: string }>) -> Promise<void>`
  - `UserGraphModel.bulkSyncFollows(follows: Array<{ follower_id: number, user_id: number }>) -> Promise<void>`
  - `UserGraphModel.bulkSyncBlocks(blocks: Array<{ user_id: number, blocked_id: number }>) -> Promise<void>`

- [ ] **Step 1: Write test for `UserGraphModel` graph operations**

Create `backend/src/tests/userGraphModel.test.js`:
```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { initNeo4j, closeNeo4j } from '../configs/neo4j.js';
import UserGraphModel from '../models/userGraphModel.js';

describe('UserGraphModel graph suggestions and edges', () => {
    const graphModel = new UserGraphModel();

    before(async () => {
        await initNeo4j();
        // Setup a small triangle: User 901 -> User 902 -> User 903
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
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test --env-file=backend/.env backend/src/tests/userGraphModel.test.js`
Expected: FAIL ("Cannot find module '../models/userGraphModel.js'")

- [ ] **Step 3: Implement `backend/src/models/userGraphModel.js`**

Implement Cypher queries with parameterized inputs:
```javascript
import { getNeo4jSession } from '../configs/neo4j.js';

export default class UserGraphModel {
    async findSuggestions(userId, limit = 10) {
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
                userId: Number(userId),
                limit: Number(limit),
            });

            return result.records.map((record) => ({
                userId: record.get('userId').toInt ? record.get('userId').toInt() : Number(record.get('userId')),
                username: record.get('username') || '',
                mutualCount: record.get('mutualCount').toInt ? record.get('mutualCount').toInt() : Number(record.get('mutualCount')),
            }));
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
                followerId: Number(followerId),
                followeeId: Number(followeeId),
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
                followerId: Number(followerId),
                followeeId: Number(followeeId),
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
                blockerId: Number(blockerId),
                blockedId: Number(blockedId),
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
                blockerId: Number(blockerId),
                blockedId: Number(blockedId),
            });
        } finally {
            await session.close();
        }
    }

    async bulkSyncUsers(users) {
        if (!users.length) return;
        const session = getNeo4jSession();
        try {
            const query = `
                UNWIND $users AS u
                MERGE (node:User { id: u.id })
                SET node.username = u.username
            `;
            await session.run(query, {
                users: users.map((u) => ({ id: Number(u.id), username: u.username })),
            });
        } finally {
            await session.close();
        }
    }

    async bulkSyncFollows(follows) {
        if (!follows.length) return;
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
                    follower_id: Number(f.follower_id),
                    user_id: Number(f.user_id),
                })),
            });
        } finally {
            await session.close();
        }
    }

    async bulkSyncBlocks(blocks) {
        if (!blocks.length) return;
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
                    user_id: Number(b.user_id),
                    blocked_id: Number(b.blocked_id),
                })),
            });
        } finally {
            await session.close();
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --env-file=backend/.env backend/src/tests/userGraphModel.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/userGraphModel.js backend/src/tests/userGraphModel.test.js
git commit -m "feat(neo4j): create UserGraphModel for suggestions and graph mutations"
```

---

### Task 3: Migration Sync Script (`syncNeo4j.js`)

**Files:**
- Create: `backend/src/scripts/syncNeo4j.js`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: MySQL pool (`configs/database.js`), `initNeo4j`, `UserGraphModel`.
- Produces: Executable CLI script that synchronizes all MySQL users, follows, and blocks to Neo4j.

- [ ] **Step 1: Implement `backend/src/scripts/syncNeo4j.js`**

Query MySQL for all users, follows, and blocks, then batch insert them into Neo4j:
```javascript
import pool from '../configs/database.js';
import { initNeo4j, closeNeo4j } from '../configs/neo4j.js';
import UserGraphModel from '../models/userGraphModel.js';

export async function syncNeo4j() {
    console.log('🔄 Initializing Neo4j constraint...');
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
}

if (process.argv[1]?.endsWith('syncNeo4j.js')) {
    syncNeo4j()
        .catch((err) => {
            console.error('❌ Sync failed:', err);
            process.exit(1);
        })
        .finally(async () => {
            await closeNeo4j();
            await pool.end();
            process.exit(0);
        });
}
```

- [ ] **Step 2: Add script to `backend/package.json`**

Add `"neo4j:sync": "node --env-file=.env src/scripts/syncNeo4j.js"` to `scripts`.

- [ ] **Step 3: Execute sync script to verify data sync**

Run: `node --env-file=backend/.env backend/src/scripts/syncNeo4j.js`
Expected: "Neo4j synchronization complete!" with non-negative entity counts.

- [ ] **Step 4: Commit**

```bash
git add backend/src/scripts/syncNeo4j.js backend/package.json
git commit -m "feat(neo4j): add MySQL to Neo4j database sync script"
```

---

### Task 4: MySQL Fallback & Profile Enrichment in `UserFollowersModel`

**Files:**
- Modify: `backend/src/models/userFollowersModel.js`
- Test: `backend/src/tests/userFollowersFallback.test.js`

**Interfaces:**
- Produces:
  - `UserFollowersModel.findPopularFollowFallback(userId, excludeUserIds, limit) -> Promise<[Array<any>]>`
  - `UserFollowersModel.findUsersWithProfileByIds(userIds) -> Promise<[Array<any>]>`

- [ ] **Step 1: Write test for fallback and enrichment methods**

Create `backend/src/tests/userFollowersFallback.test.js`:
```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import UserFollowersModel from '../models/userFollowersModel.js';

describe('UserFollowersModel fallback and profile enrichment', () => {
    const model = new UserFollowersModel();

    it('should return popular accounts when excluding given user and exclusions', async () => {
        const [rows] = await model.findPopularFollowFallback(1, [2], 5);
        assert.ok(Array.isArray(rows));
        assert.ok(rows.every((u) => u.id !== 1 && u.id !== 2));
    });

    it('should fetch user profile details by IDs', async () => {
        const [rows] = await model.findUsersWithProfileByIds([1, 2]);
        assert.ok(Array.isArray(rows));
        if (rows.length) {
            assert.ok('username' in rows[0]);
            assert.ok('profile_picture' in rows[0]);
        }
    });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `node --test --env-file=backend/.env backend/src/tests/userFollowersFallback.test.js`
Expected: FAIL ("model.findPopularFollowFallback is not a function")

- [ ] **Step 3: Implement methods in `backend/src/models/userFollowersModel.js`**

Add `findPopularFollowFallback` and `findUsersWithProfileByIds` to `UserFollowersModel`:
```javascript
    async findPopularFollowFallback(userId, excludeUserIds = [], limit = 10) {
        const safeExcludeIds = excludeUserIds.length ? excludeUserIds : [0];
        const query = `
            SELECT 
                u.id,
                u.username,
                u.profile_picture,
                0 AS mutual_count,
                COUNT(f.id) AS followers_count
            FROM users u
            LEFT JOIN ${this.getTableName()} f ON f.user_id = u.id
            LEFT JOIN ${this.getTableName()} already_following 
                ON already_following.follower_id = ? AND already_following.user_id = u.id
            LEFT JOIN user_blocklist blocker 
                ON (blocker.user_id = ? AND blocker.blocked_id = u.id)
                OR (blocker.user_id = u.id AND blocker.blocked_id = ?)
            WHERE u.id != ?
              AND u.id NOT IN (${safeExcludeIds.map(() => '?').join(', ')})
              AND already_following.id IS NULL
              AND blocker.id IS NULL
            GROUP BY u.id
            ORDER BY u.is_verified DESC, followers_count DESC, u.created_at DESC
            LIMIT ?
        `;

        const params = [
            userId,
            userId,
            userId,
            userId,
            ...safeExcludeIds,
            limit.toString(),
        ];

        return connection.execute(query, params);
    }

    async findUsersWithProfileByIds(userIds) {
        if (!userIds.length) return [[]];
        const query = `
            SELECT id, username, profile_picture
            FROM users
            WHERE id IN (${userIds.map(() => '?').join(', ')})
        `;
        return connection.execute(query, userIds);
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --env-file=backend/.env backend/src/tests/userFollowersFallback.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/userFollowersModel.js backend/src/tests/userFollowersFallback.test.js
git commit -m "feat(models): add popular fallback and profile enrichment to UserFollowersModel"
```

---

### Task 5: Real-Time Sync Hooks in `userFollowsService` and `userBlocksService`

**Files:**
- Modify: `backend/src/services/userFollowsService.js`
- Modify: `backend/src/services/userBlocksService.js`

**Interfaces:**
- Consumes: `UserGraphModel`
- Produces: Automatic real-time graph synchronization for follows and blocks.

- [ ] **Step 1: Update `postUserFollow` and `deleteUserFollow` in `userFollowsService.js`**

Import `UserGraphModel` and call `addFollow`/`removeFollow` inside try blocks after successful MySQL changes:
```javascript
// in postUserFollow:
await userGraphModel.addFollow(followerId, followeeId).catch((err) => {
    console.error('Failed to sync follow to Neo4j:', err.message);
});

// in deleteUserFollow:
await userGraphModel.removeFollow(followerId, followeeId).catch((err) => {
    console.error('Failed to sync unfollow to Neo4j:', err.message);
});
```

- [ ] **Step 2: Update `postUserBlock` and `deleteUserBlock` in `userBlocksService.js`**

Import `UserGraphModel` and call `addBlock`/`removeBlock`:
```javascript
// in postUserBlock:
await userGraphModel.addBlock(blockerId, blockedId).catch((err) => {
    console.error('Failed to sync block to Neo4j:', err.message);
});

// in deleteUserBlock:
await userGraphModel.removeBlock(blockerId, blockedId).catch((err) => {
    console.error('Failed to sync unblock to Neo4j:', err.message);
});
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/services/userFollowsService.js backend/src/services/userBlocksService.js
git commit -m "feat(services): sync follow and block events in real time to Neo4j"
```

---

### Task 6: Orchestrate Hybrid Follow Suggestions in `userFollowsService.js`

**Files:**
- Modify: `backend/src/services/userFollowsService.js`
- Test: `backend/src/tests/userFollowSuggestions.test.js`

**Interfaces:**
- Produces: `getUserFollowSuggestions(currentUserId: number, limit: number) -> Promise<{ success: boolean, users: Array<{ id: number, username: string, profile_picture: string, mutual_count: number }> }>`

- [ ] **Step 1: Write integration test for `getUserFollowSuggestions`**

Create `backend/src/tests/userFollowSuggestions.test.js`:
```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { getUserFollowSuggestions } from '../services/userFollowsService.js';
import { initNeo4j, closeNeo4j } from '../configs/neo4j.js';

describe('getUserFollowSuggestions service', () => {
    before(async () => {
        await initNeo4j();
    });

    after(async () => {
        await closeNeo4j();
    });

    it('should return suggestions for a connected user with id, username, profile_picture', async () => {
        const result = await getUserFollowSuggestions(1, 3);
        assert.equal(result.success, true);
        assert.ok(Array.isArray(result.users));
        assert.ok(result.users.length <= 3);
        if (result.users.length > 0) {
            assert.ok('id' in result.users[0]);
            assert.ok('username' in result.users[0]);
            assert.ok('profile_picture' in result.users[0]);
            assert.ok('mutual_count' in result.users[0]);
        }
    });

    it('should return cold-start fallback suggestions for user with 0 follows', async () => {
        const result = await getUserFollowSuggestions(999999, 3);
        assert.equal(result.success, true);
        assert.ok(Array.isArray(result.users));
        assert.ok(result.users.length > 0, 'Cold-start user must receive suggestions');
    });
});
```

- [ ] **Step 2: Refactor `getUserFollowSuggestions` in `backend/src/services/userFollowsService.js`**

Remove the `Denque` import and in-memory BFS loop. Replace with:
1. Call `userGraphModel.findSuggestions(currentUserId, limit)`.
2. If `graphResults.length < limit`, call `userFollowersModel.findPopularFollowFallback(currentUserId, candidateIds, limit - graphResults.length)`.
3. Enrich graph results with `profile_picture` from MySQL.
4. Merge results and return `{ success: true, users }`.

- [ ] **Step 3: Run test to verify it passes**

Run: `node --test --env-file=backend/.env backend/src/tests/userFollowSuggestions.test.js`
Expected: PASS

- [ ] **Step 4: Run linter to ensure code style consistency**

Run: `npm run lint --prefix backend` or verify with ESLint.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/userFollowsService.js backend/src/tests/userFollowSuggestions.test.js
git commit -m "feat(services): implement Neo4j graph recommendations with MySQL fallback"
```

---

### Task 7: Full Story Verification & Cleanup

**Files:**
- Test: All tests in `backend/src/tests/`

- [ ] **Step 1: Run all test suites together**

Run: `node --test --env-file=backend/.env backend/src/tests/*.test.js`
Expected: All suites PASS.

- [ ] **Step 2: Verify `server.js` starts cleanly**

Run server in background/probe `GET /api/v1/users/suggested-followings`.

- [ ] **Step 3: Final commit**

```bash
git commit --allow-empty -m "chore: complete Neo4j follow suggestions integration"
```

