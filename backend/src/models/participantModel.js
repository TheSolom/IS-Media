import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class ParticipantModel extends BaseModel {
    constructor() {
        super('conversation_participants');
    }

    async searchParticipant(conversationId, username, limit) {
        const query = `SELECT
                            ${this.getTableName()}.*
                        FROM
                            ${this.getTableName()}
                        JOIN users
                            ON users.id = ${this.getTableName()}.user_id
                        WHERE
                            ${this.getTableName()}.conversation_id = ?
                            AND users.username LIKE ?
                        LIMIT ?`;

        const result = await connection.execute(query, [conversationId, `%${username}%`, limit.toString()]);
        return result;
    }

    async findParticipant(userId, conversationId) {
        const query = `SELECT
                            ${this.getTableName()}.*,
                            u.username,
                            u.profile_picture,
                            IFNULL(r.role, 'normal') AS role
                        FROM
                            ${this.getTableName()}
                        JOIN users AS u
                            ON u.id = ${this.getTableName()}.user_id
                        LEFT JOIN conversation_admins AS pr
                            ON pr.user_id = u.id
                        LEFT JOIN user_roles AS r
                            ON r.id = pr.role_id
                        WHERE
                            ${this.getTableName()}.user_id = ?
                            AND ${this.getTableName()}.conversation_id = ?`;

        const result = await connection.execute(query, [userId, conversationId]);
        return result;
    }

    async findParticipants(conversationId) {
        const query = `SELECT
                            ${this.getTableName()}.*,
                            u.username,
                            u.profile_picture,
                            IFNULL(r.role, 'normal') AS role
                        FROM
                            ${this.getTableName()}
                        JOIN users AS u
                            ON u.id = ${this.getTableName()}.user_id
                        LEFT JOIN conversation_admins AS pr
                            ON pr.user_id = u.id
                        LEFT JOIN user_roles AS r
                            ON r.id = pr.role_id
                        WHERE
                            ${this.getTableName()}.conversation_id = ?
                        ORDER BY
                            pr.role_id DESC,
                            ${this.getTableName()}.created_at DESC`;

        const result = await connection.execute(query, [conversationId]);
        return result;
    }

    async findAdminParticipants(conversationId) {
        const query = `SELECT
                            ${this.getTableName()}.*, u.username, u.profile_picture, r.role
                        FROM
                            ${this.getTableName()}
                        JOIN users AS u
                            ON u.id = ${this.getTableName()}.user_id
                        JOIN conversation_admins AS pr
                            ON pr.user_id = u.id
                        JOIN user_roles AS r
                            ON r.id = pr.role_id
                        WHERE
                            ${this.getTableName()}.conversation_id = ?
                            AND r.role != 'normal'
                        ORDER BY
                            pr.role_id DESC,
                            ${this.getTableName()}.created_at DESC`;

        const result = await connection.execute(query, [conversationId]);
        return result;
    }

    async findPastParticipants(conversationId) {
        const query = `SELECT
                            ${this.getTableName()}.*, u.username, u.profile_picture
                        FROM
                            ${this.getTableName()}
                        JOIN users AS u
                            ON u.id = ${this.getTableName()}.user_id
                        WHERE
                            ${this.getTableName()}.conversation_id = ?
                            AND ${this.getTableName()}.deleted_at IS NOT NULL
                        ORDER BY
                            ${this.getTableName()}.created_at DESC`;

        const result = await connection.execute(query, [conversationId]);
        return result;
    }
}
