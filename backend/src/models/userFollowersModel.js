import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class UserFollowersModel extends BaseModel {
    constructor() {
        super('user_followers');
    }

    async findFollowers(followeeId, lastId, limit) {
        const query = `SELECT ${this.getTableName()}.*, users.username, users.profile_picture FROM ${this.getTableName()}
                        JOIN users
                        ON users.id = ${this.getTableName()}.follower_id
                        WHERE ${this.getTableName()}.user_id = ? AND ${this.getTableName()}.id > ?
                        ORDER BY ${this.getTableName()}.created_at DESC, ${this.getTableName()}.id DESC
                        limit ?`;

        const result = await connection.execute(query, [followeeId, lastId, limit.toString()]); // https://blog.stackademic.com/nodejs-with-mysql2-parameterized-query-with-limit-and-offset-e7091bfe3c47
        return result;
    }

    async findFollower(followeeId) {
        const query = `SELECT * FROM ${this.getTableName()}
                        WHERE ${this.getTableName()}.user_id = ?`;

        const result = await connection.execute(query, [followeeId]);
        return result;
    }

    async findFollowees(followerId, lastId, limit) {
        const query = `SELECT ${this.getTableName()}.*, users.username, users.profile_picture FROM ${this.getTableName()}
                        JOIN users
                        ON users.id = ${this.getTableName()}.user_id
                        WHERE ${this.getTableName()}.follower_id = ? AND ${this.getTableName()}.id > ?
                        ORDER BY ${this.getTableName()}.created_at DESC, ${this.getTableName()}.id DESC
                        limit ?`;

        const result = await connection.execute(query, [followerId, lastId, limit.toString()]); // https://blog.stackademic.com/nodejs-with-mysql2-parameterized-query-with-limit-and-offset-e7091bfe3c47
        return result;
    }

    async findFollowee(followeeId) {
        const query = `SELECT * FROM ${this.getTableName()}
                        WHERE ${this.getTableName()}.follower_id = ?`;

        const result = await connection.execute(query, [followeeId]);
        return result;
    }

    async DeleteFollowStatus(userId1, userId2) {
        const query = `DELETE FROM ${this.getTableName()}
                        WHERE (${this.getTableName()}.user_id = ? AND ${this.getTableName()}.follower_id = ?)
                        OR (${this.getTableName()}.user_id = ? AND ${this.getTableName()}.follower_id = ?)`;

        const result = await connection.execute(query, [userId1, userId2, userId2, userId1]);
        return result[0];
    }

    async findAllFollows(limit) {
        const query = `SELECT * FROM ${this.getTableName()}
                        LIMIT ?`;

        const result = await connection.execute(query, [limit.toString()]);
        return result;
    }

    async findValidFollowSuggestions(suggestionsIds, userId, limit) {
        if (!suggestionsIds.length) return [[]];

        const query = `SELECT
                            users.id,
                            users.username,
                            users.profile_picture
                        FROM
                            users
                        LEFT JOIN ${this.getTableName()} AS f
                            ON f.user_id = users.id AND f.follower_id = ?
                        LEFT JOIN user_blocklist AS blocker
                            ON (blocker.user_id = ? AND blocker.blocked_id = users.id)
                                OR (blocker.user_id = users.id AND blocker.blocked_id = ?)
                        WHERE
                            users.id IN (${suggestionsIds.map(() => '?').join(', ')})
                            AND f.id IS NULL
                            AND blocker.id IS NULL
                        LIMIT ?`;

        const result = await connection.execute(query, [
            userId,
            userId,
            userId,
            ...suggestionsIds,
            limit.toString(),
        ]);
        return result;
    }

    async findPopularFollowFallback(userId, excludeUserIds = [], limit = 10) {
        const safeExcludeIds = excludeUserIds.length ? excludeUserIds : [0];
        const query = `SELECT 
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
                        LIMIT ?`;

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
        if (!userIds || !userIds.length) return [[]];
        const query = `SELECT id, username, profile_picture
                        FROM users
                        WHERE id IN (${userIds.map(() => '?').join(', ')})`;
        return connection.execute(query, userIds);
    }
}
