import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class MessageModel extends BaseModel {
    constructor() {
        super('messages');
    }

    async searchMessage(conversationId, content, limit) {
        const query = `SELECT * FROM ${this.getTableName()}
                        WHERE conversation_id = ? AND content LIKE ?
                        LIMIT ?`;

        const result = await connection.execute(query, [conversationId, `%${content}%`, limit.toString()]);
        return result;
    }

    async findMessage(conversationId, messageId) {
        const query = `SELECT
                            ${this.getTableName()}.*,
                            u.username,
                            u.profile_picture,
                            pu.username AS parent_username,
                            pu.profile_picture AS parent_profile_picture,
                            m.content AS parent_content,
                            m.image AS parent_image,
                            m.sender_id AS parent_sender_id,
                            m.created_at AS parent_created_at
                        FROM
                            ${this.getTableName()}
                        JOIN users AS u
                            ON u.id = ${this.getTableName()}.sender_id
                        LEFT JOIN ${this.getTableName()} AS m
                            ON m.id = ${this.getTableName()}.parent_id
                        LEFT JOIN users AS pu
                            ON pu.id = m.sender_id
                        WHERE 
                            ${this.getTableName()}.conversation_id = ?
                            AND ${this.getTableName()}.id = ?`;

        const result = await connection.execute(query, [conversationId, messageId]);
        return result;
    }

    async findMessages(conversationId, lastId, lastDate, limit) {
        const query = `SELECT
                            ${this.getTableName()}.*,
                            u.username,
                            u.profile_picture,
                            pu.username AS parent_username,
                            pu.profile_picture AS parent_profile_picture,
                            m.content AS parent_content,
                            m.image AS parent_image,
                            m.sender_id AS parent_sender_id,
                            m.created_at AS parent_created_at
                        FROM
                            ${this.getTableName()}
                        JOIN users AS u
                            ON u.id = ${this.getTableName()}.sender_id
                        LEFT JOIN ${this.getTableName()} AS m
                            ON m.id = ${this.getTableName()}.parent_id
                        LEFT JOIN users AS pu
                            ON pu.id = m.sender_id
                        WHERE 
                            ${this.getTableName()}.conversation_id = ?
                            ${lastId && lastDate ? `
                                AND
                                (
                                    (${this.getTableName()}.created_at < ?)
                                    OR
                                    (${this.getTableName()}.created_at = ? AND ${this.getTableName()}.id < ?)
                                )` : ''}
                        ORDER BY
                            ${this.getTableName()}.created_at DESC,
                            ${this.getTableName()}.id DESC
                        LIMIT ?`;

        const params = lastId && lastDate ?
            [conversationId, new Date(lastDate), new Date(lastDate), lastId, limit.toString()] : [conversationId, limit.toString()];
        const result = await connection.execute(query, params);
        return result;
    }
}
