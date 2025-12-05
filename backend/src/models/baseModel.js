import connection from '../configs/database.js';

export default class BaseModel {
    #tableName;

    constructor(tableName) {
        this.#tableName = tableName;
    }

    getTableName() {
        return this.#tableName;
    }

    async find(conditions, options = {}) {
        const {
            select = '*',
            join = '',
            orderBy,
            limit,
            offset,
            groupBy,
            having
        } = options;

        const conditionKeys = Object.keys(conditions);

        if (conditionKeys.length === 0)
            throw new Error('Empty conditions object');

        let query = `SELECT ${select} FROM ${this.getTableName()} `;

        if (join) query += ` ${join} `;

        const values = [];
        const clauses = [];

        Object.entries(conditions).forEach(([key, value]) => {
            clauses.push(`${key} = ?`);
            values.push(value);
        });
        query += `WHERE ${clauses.join(' AND ')}`;

        if (groupBy) query += ` GROUP BY ${groupBy}`;

        if (having) query += ` HAVING ${having}`;

        if (orderBy) query += ` ORDER BY ${orderBy}`;

        if (limit) query += ` LIMIT ${limit}`;

        if (offset) query += ` OFFSET ${offset}`;

        const result = await connection.execute(query, values);
        return result;
    }

    async create(data, options = { returning: false }) {
        const keys = Object.keys(data);

        if (keys.length === 0)
            throw new Error('Empty data object');

        const query = `INSERT INTO ${this.getTableName()} (${keys.join(', ')}) VALUES (:${keys.join(', :')})`;

        const result = await connection.execute(query, data);

        if (options.returning && result[0].affectedRows) {
            const returnedResult = await this.find({ id: result[0].insertId });

            if (returnedResult.length === 0)
                throw new Error('Failed to find newly created record');

            return {
                ...result[0],
                data: returnedResult[0][0]
            };
        };

        return result[0];
    }

    async update(data, conditions) {
        const conditionKeys = Object.keys(conditions);

        if (conditionKeys.length === 0)
            throw new Error('Empty conditions object');

        const setClause = Object.keys(data).map((key) => `${key} = ?`).join(', ');
        const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');

        const values = [...Object.values(data), ...Object.values(conditions)];

        const query = `UPDATE ${this.getTableName()} SET ${setClause} WHERE ${whereClause}`;

        const result = await connection.execute(query, values);
        return result[0];
    }

    async delete(conditions) {
        const conditionKeys = Object.keys(conditions);

        if (conditionKeys.length === 0)
            throw new Error('Empty conditions object');

        const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');
        const values = conditionKeys.map(key => conditions[key]);

        const query = `DELETE FROM ${this.getTableName()} WHERE ${whereClause}`;

        const result = await connection.execute(query, values);
        return result[0];
    }

    async search(data, condition, limit) {
        const query = `SELECT * FROM ${this.getTableName()}
                        WHERE ${condition} LIKE ?
                        LIMIT ?`;

        const result = await connection.execute(query, [`%${data}%`, limit.toString()]);
        return result;
    }
}