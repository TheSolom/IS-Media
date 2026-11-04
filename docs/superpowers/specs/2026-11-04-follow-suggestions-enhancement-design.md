# Design Specification: Follow Suggestions Algorithm with Neo4j Graph Database

## 1. Intent & Context

The follow suggestions feature in `IS-Media` (`/api/v1/users/suggested-followings`) provides user recommendations displayed in the right sidebar (`RightBar.jsx`).

The original implementation in `backend/src/services/userFollowsService.js` attempted to build an in-memory graph using `denque` over a hardcoded `LIMIT 1000` MySQL query. This caused:
1. Missing nodes outside the arbitrary 1,000-row slice.
2. Unranked FIFO exploration with no topological scoring.
3. Complete failure on cold-start (new users with 0 follows).

To achieve true graph-native recommendations, we are integrating **Neo4j Aura** as the dedicated graph engine for relationship traversal, coupled with MySQL as the relational store for user profiles and cold-start fallback.

---

## 2. Goals & Non-Goals

### Goals
- **Level 1 (Graph Database with Neo4j):** Store social relationships in Neo4j Aura and execute optimized Cypher queries for multi-hop / friend-of-friend discovery with mutual connection ranking.
- **Level 2 (Cold-Start Fallback Pipeline):** If a user follows 0 people or the graph yields fewer recommendations than `limit`, backfill from MySQL with top verified and most-followed users.
- **Level 3 (Hybrid Metadata & Profile Enrichment):** Fetch full user profiles (`profile_picture`, `username`, `is_verified`, `mutual_count`) from MySQL for candidates returned by the graph, with optional tag/interest bonus scoring.
- **Dual Data Synchronization:**
  - Real-time updates: Sync `[:FOLLOWS]` and `[:BLOCKED]` relationships to Neo4j on follow/unfollow and block/unblock actions.
  - Initial/Migration sync: Script to bootstrap Neo4j with all existing MySQL users, follows, and blocks.
- **Strict Privacy & Safety:**
  - Exclude self (`candidate <> me`).
  - Exclude existing followees (`NOT candidate IN directFriends`).
  - Exclude blocked users bi-directionally (`(me)-[:BLOCKED]-(blocked:User)`).
- **100% Backward Compatibility:** API output `{ success: true, users: [...] }` matching [`RightBar.jsx`](file:///c:/Users/eslam/source/Fullstack/IS-Media/frontend/social/src/components/rightBar/RightBar.jsx).

---

## 3. Architecture & Technical Design

### 3.1 Neo4j Graph Model
- **Nodes:** `(:User { id: $userId, username: $username })`
- **Edges:**
  - `(:User)-[:FOLLOWS]->(:User)`
  - `(:User)-[:BLOCKED]->(:User)`
- **Constraint:**
  ```cypher
  CREATE CONSTRAINT user_id_unique IF NOT EXISTS
  FOR (u:User) REQUIRE u.id IS UNIQUE;
  ```

### 3.2 Improved Cypher Suggestion Query
Building on the provided query with optimizations for bi-directional blocking, safety, and performance:

```cypher
// Step 1: Match the current user
MATCH (me:User { id: $userId })

// Step 2: Collect 1st-hop direct followings (in-memory lookup list)
OPTIONAL MATCH (me)-[:FOLLOWS]->(friend:User)
WITH me, collect(friend) AS directFriends

// Step 3: Collect bi-directional blocks (either party blocked the other)
OPTIONAL MATCH (me)-[:BLOCKED]-(blocked:User)
WITH me, directFriends, collect(blocked) AS blockedUsers

// Step 4: Traverse 2nd-hop network (Friends of Friends)
UNWIND directFriends AS friend
MATCH (friend)-[:FOLLOWS]->(candidate:User)

// Step 5: Fast evaluate filters using memory-list lookups
WHERE NOT candidate IN directFriends
  AND NOT candidate IN blockedUsers
  AND candidate <> me

// Step 6: Rank by mutual connection count, then tie-break by candidate id
RETURN candidate.id AS userId,
       candidate.username AS username,
       count(DISTINCT friend) AS mutualCount
ORDER BY mutualCount DESC, candidate.id ASC
LIMIT $limit
```

### 3.3 Cold-Start Fallback Pipeline (MySQL)
If the Cypher query returns fewer than `limit` candidates (e.g. `graphCandidates.length < limit`):
1. Extract existing candidate IDs to avoid duplicates.
2. Query MySQL for top accounts:
```sql
SELECT 
    u.id, 
    u.username, 
    u.profile_picture,
    0 AS mutual_count,
    COUNT(f.id) AS followers_count
FROM users u
LEFT JOIN user_followers f ON f.user_id = u.id
LEFT JOIN user_followers already_following 
    ON already_following.follower_id = ? AND already_following.user_id = u.id
LEFT JOIN user_blocklist blocker 
    ON (blocker.user_id = ? AND blocker.blocked_id = u.id)
    OR (blocker.user_id = u.id AND blocker.blocked_id = ?)
WHERE u.id != ?
  AND u.id NOT IN (?)
  AND already_following.id IS NULL
  AND blocker.id IS NULL
GROUP BY u.id
ORDER BY u.is_verified DESC, followers_count DESC, u.created_at DESC
LIMIT ?;
```
3. Merge graph candidates with fallback candidates up to `limit`.

### 3.4 Real-Time & Migration Synchronization

1. **`backend/src/configs/neo4j.js`**:
   - Singleton `neo4j.driver(...)` configured from `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE`.
   - Helper function `getNeo4jSession()` with automatic session management.
2. **Follow/Unfollow Hooks (`userFollowsService.js`)**:
   - `postUserFollow(followeeId, followerId)`:
     ```cypher
     MERGE (follower:User { id: $followerId })
     MERGE (followee:User { id: $followeeId })
     MERGE (follower)-[:FOLLOWS]->(followee)
     ```
   - `deleteUserFollow(followeeId, followerId)`:
     ```cypher
     MATCH (follower:User { id: $followerId })-[r:FOLLOWS]->(followee:User { id: $followeeId })
     DELETE r
     ```
3. **Block/Unblock Hooks (`userBlocksService.js`)**:
   - `postUserBlock(blockerId, blockedId)`:
     ```cypher
     MERGE (blocker:User { id: $blockerId })
     MERGE (blocked:User { id: $blockedId })
     MERGE (blocker)-[:BLOCKED]->(blocked)
     ```
   - `deleteUserBlock(blockerId, blockedId)`:
     ```cypher
     MATCH (blocker:User { id: $blockerId })-[r:BLOCKED]->(blocked:User { id: $blockedId })
     DELETE r
     ```
4. **Migration Script (`backend/src/scripts/syncNeo4j.js`)**:
   - Runs `CREATE CONSTRAINT` on startup/migration.
   - Bulk upserts all existing `users`, `user_followers`, and `user_blocklist` from MySQL into Neo4j Aura using batched `UNWIND`.

---

## 4. Testing & Verification

1. **Database Sync Test:** Run `syncNeo4j.js` and verify node count and relationship counts match MySQL.
2. **Graph Suggestions Test:** Test with a connected user (e.g. `demo_user` or `alex_rivers`) and verify that friends-of-friends with multiple mutual connections rank first.
3. **Cold-Start Test:** Test with a brand-new user (0 followings) and verify that top verified/popular accounts are returned instead of an empty list.
4. **Safety & Blocklist Test:** Create a block between two users and verify neither appears in suggestions for the other.
5. **UI Compatibility:** Verify the returned JSON structure satisfies `RightBar.jsx` (`id`, `username`, `profile_picture`, with extra `mutual_count`).
