import connection from '../configs/database.js';
import BaseModel from './baseModel.js';

export default class ConversationPermissionsModel extends BaseModel {
    constructor() {
        super('conversation_restricted_permissions');
    }

    async findConversationRestrictedPermissions(conversationId) {
        const query = `SELECT
                            ${this.getTableName()}.*,
                            rp.permission
                        FROM
                            ${this.getTableName()}
                        LEFT JOIN restricted_permissions AS rp
                            ON rp.id = ${this.getTableName()}.permission_id
                        WHERE
                            ${this.getTableName()}.conversation_id = ?`;

        const result = await connection.execute(query, [conversationId]);
        return result;
    }
}
