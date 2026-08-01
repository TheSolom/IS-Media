import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class PostTagsModel extends BaseModel {
    constructor() {
        super('post_tags');
    }

    async findPostTags(postId) {
        const query = `SELECT 
                            ${this.getTableName()}.id, tags.id AS tag_id, tags.tag, ${this.getTableName()}.created_at 
                        FROM 
                            ${this.getTableName()}
                        JOIN tags
                            ON tags.id = ${this.getTableName()}.tag_id
                        WHERE 
                            ${this.getTableName()}.post_id = ?`;

        const result = await connection.execute(query, [postId]);
        return result;
    }

    async findTagPosts(tag, lastId, limit) {
        const query = `SELECT
                            p.*, ${this.getTableName()}.id as post_tag_id
                        FROM
                            ${this.getTableName()}
                        JOIN tags as t
                            ON t.id = ${this.getTableName()}.tag_id
                        JOIN posts AS p
                            ON p.id = ${this.getTableName()}.post_id
                        WHERE
                            t.tag = ?
                            AND ${this.getTableName()}.id > ?
                        ORDER BY
                            ${this.getTableName()}.created_at DESC,
                            ${this.getTableName()}.id DESC
                        limit ?`;

        const result = await connection.execute(query, [tag, lastId, limit.toString()]);
        return result;
    }
}
