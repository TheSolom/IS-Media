import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class CommentTagsModel extends BaseModel {
    constructor() {
        super('comment_tags');
    }

    async findCommentTags(commentId) {
        const query = `SELECT 
                            ${this.getTableName()}.id, tags.id AS tag_id, tags.tag, ${this.getTableName()}.created_at 
                        FROM 
                            ${this.getTableName()}
                        JOIN tags
                            ON tags.id = ${this.getTableName()}.tag_id
                        WHERE 
                            ${this.getTableName()}.comment_id = ?`;

        const result = await connection.execute(query, [commentId]);
        return result;
    }

    async findTagComments(tag, lastId, limit) {
        const query = `SELECT
                            pc.*, ${this.getTableName()}.id as comment_tag_id
                        FROM
                            ${this.getTableName()}
                        JOIN tags as t
                            ON t.id = ${this.getTableName()}.tag_id
                        JOIN post_comments AS pc
                            ON pc.id = ${this.getTableName()}.comment_id
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
