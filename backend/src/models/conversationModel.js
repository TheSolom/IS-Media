import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class ConversationModel extends BaseModel {
    constructor() {
        super('conversations');
    }

    async searchConversation(title, userId, limit) {
        const query = `SELECT
                            ${this.getTableName()}.*,
                            CASE
                                WHEN ${this.getTableName()}.type = 1 THEN u2.id
                                ELSE NULL
                            END AS dm_receiver_id,
                            CASE
                                WHEN ${this.getTableName()}.type = 1 THEN u2.username
                                ELSE ${this.getTableName()}.title
                            END AS title,
                            CASE
                                WHEN ${this.getTableName()}.type = 1 THEN u2.profile_picture
                                ELSE ${this.getTableName()}.image
                            END AS image
                        FROM
                            ${this.getTableName()}
                        JOIN conversation_participants AS p1
                            ON p1.conversation_id = ${this.getTableName()}.id
                        LEFT JOIN conversation_participants AS p2
                            ON p2.conversation_id = ${this.getTableName()}.id
                            AND ${this.getTableName()}.type = 1
                            AND p2.user_id != ?
                        LEFT JOIN users u2
                            ON u2.id = p2.user_id
                        WHERE
                            (${this.getTableName()}.title LIKE ? OR u2.username LIKE ?)
                            AND p1.user_id = ?
                        ORDER BY
                            ${this.getTableName()}.updated_at DESC,
                            ${this.getTableName()}.id DESC
                        limit ?`;

        const result = await connection.execute(query, [userId, `%${title}%`, `%${title}%`, userId, limit.toString()]);
        return result;
    }

    async findUserConversations(userId, lastId, lastDate, limit) {
        const query = `SELECT
                            ${this.getTableName()}.*,
                            CASE
                                WHEN ${this.getTableName()}.type = 1 THEN u2.id
                                ELSE NULL
                            END AS dm_receiver_id,
                            CASE
                                WHEN ${this.getTableName()}.type = 1 THEN u2.username
                                ELSE ${this.getTableName()}.title
                            END AS title,
                            CASE
                                WHEN ${this.getTableName()}.type = 1 THEN u2.profile_picture
                                ELSE ${this.getTableName()}.image
                            END AS image
                        FROM
                            ${this.getTableName()}
                        JOIN conversation_participants AS p1
                            ON p1.conversation_id = ${this.getTableName()}.id
                        LEFT JOIN conversation_participants AS p2
                            ON p2.conversation_id = ${this.getTableName()}.id
                            AND ${this.getTableName()}.type = 1
                            AND p2.user_id != ?
                        LEFT JOIN users u2
                            ON u2.id = p2.user_id
                        WHERE
                            p1.user_id = ?
                            ${lastId && lastDate ? `
                                AND
                                (
                                    (${this.getTableName()}.updated_at < ?)
                                    OR
                                    (${this.getTableName()}.updated_at = ? AND ${this.getTableName()}.id < ?)
                                )` : ''}
                        ORDER BY
                            ${this.getTableName()}.updated_at DESC,
                            ${this.getTableName()}.id DESC
                        limit ?`;

        const params = lastId && lastDate ?
            [userId, userId, new Date(lastDate), new Date(lastDate), lastId, limit.toString()] : [userId, userId, limit.toString()];
        const result = await connection.execute(query, params);
        return result;
    }

    async findDMConversation(userId1, userId2) {
        const query = `SELECT
                            ${this.getTableName()}.*,
                            u2.id AS dm_receiver_id,
                            u2.username AS title,
                            u2.profile_picture AS image
                        FROM
                            ${this.getTableName()}
                        JOIN conversation_participants AS p1
                            ON p1.conversation_id = ${this.getTableName()}.id
                        JOIN conversation_participants AS p2
                            ON p2.conversation_id = ${this.getTableName()}.id
                        JOIN users u2
                            ON u2.id = p2.user_id
                        WHERE
                            p1.user_id = ?
                            AND p2.user_id = ?
                            AND ${this.getTableName()}.type = 1`;

        const result = await connection.execute(query, [userId1, userId2]);
        return result;
    }
}
