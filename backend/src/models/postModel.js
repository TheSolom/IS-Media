import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class PostModel extends BaseModel {
    constructor() {
        super('posts');
    }

    async findFeedPosts(userId, lastId, limit) {
        const query = `SELECT 
                            ${this.getTableName()}.*,
                            u.username,
                            u.profile_picture,
                            pu.username AS parent_username,
                            pu.profile_picture AS parent_profile_picture,
                            p.author_id AS parent_author_id,
                            p.title AS parent_title,
                            p.content AS parent_content,
                            p.created_at AS parent_created_at
                        FROM 
                            ${this.getTableName()}
                        JOIN users AS u
                            ON u.id = ${this.getTableName()}.author_id
                        JOIN user_followers AS f
                            ON f.user_id = u.id
                        LEFT JOIN ${this.getTableName()} AS p
                            ON p.id = ${this.getTableName()}.parent_id
                        LEFT JOIN users AS pu
                            ON pu.id = p.author_id
                        WHERE
                            ${this.getTableName()}.author_id != ?
                            AND f.follower_id = ?
                            AND ${this.getTableName()}.id > ?
                        ORDER BY
                            ${this.getTableName()}.created_at DESC,
                            ${this.getTableName()}.id DESC
                        LIMIT ?`;

        const result = await connection.execute(query, [userId, userId, lastId, limit.toString()]);
        return result;
    }

    async findUserPosts(userId, lastId, limit) {
        const query = `SELECT 
                            ${this.getTableName()}.*,
                            u.username,
                            u.profile_picture,
                            pu.username AS parent_username,
                            pu.profile_picture AS parent_profile_picture,
                            p.author_id AS parent_author_id,
                            p.title AS parent_title,
                            p.content AS parent_content,
                            p.created_at AS parent_created_at 
                        FROM 
                            ${this.getTableName()}
                        JOIN users AS u
                            ON u.id = ${this.getTableName()}.author_id
                        LEFT JOIN ${this.getTableName()} AS p
                            ON p.id = ${this.getTableName()}.parent_id
                        LEFT JOIN users AS pu
                            ON pu.id = p.author_id
                        WHERE 
                            ${this.getTableName()}.author_id = ? 
                            AND ${this.getTableName()}.id > ? 
                        ORDER BY 
                            ${this.getTableName()}.created_at DESC,
                            ${this.getTableName()}.id DESC 
                        limit ?`;

        const result = await connection.execute(query, [userId, lastId, limit.toString()]);
        return result;
    }

    async findSuggestedPosts(tagsIds, userId, limit) {
        const tagPlaceholders = tagsIds.map(() => '?').join(',');

        const query = `SELECT
                            ${this.getTableName()}.*
                        FROM
                            ${this.getTableName()}
                        JOIN post_tags AS pt
                            ON pt.post_id = ${this.getTableName()}.id
                        LEFT JOIN post_likes AS pl
                            ON pl.post_id = ${this.getTableName()}.id
                        WHERE
                            pt.tag_id IN (${tagPlaceholders})
                            AND ${this.getTableName()}.author_id != ?
                        GROUP BY
                            ${this.getTableName()}.id
                        ORDER BY
                            COUNT(pl.post_id) DESC
                        LIMIT ?`;

        const result = await connection.execute(query, [...tagsIds, userId, limit.toString()]);
        return result;
    }
}
