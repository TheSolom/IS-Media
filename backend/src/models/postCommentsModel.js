import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class PostCommentsModel extends BaseModel {
    constructor() {
        super('post_comments');
    }

    async findPostComments(postId, lastId, limit) {
        const query = `SELECT ${this.getTableName()}.*, u.username, u.profile_picture FROM ${this.getTableName()}
                        JOIN users AS u
                        ON u.id = ${this.getTableName()}.author_id
                        WHERE ${this.getTableName()}.post_id = ? AND ${this.getTableName()}.id > ?
                        ORDER BY ${this.getTableName()}.created_at DESC, ${this.getTableName()}.id DESC
                        limit ?`;

        const result = await connection.execute(query, [postId, lastId, limit.toString()]);
        return result;
    }
}
