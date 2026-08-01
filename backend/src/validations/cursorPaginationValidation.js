import { query } from 'express-validator';

const cursorPaginationValidation = [
    query('lastId', 'No valid last id is provided').if(query('lastId').exists()).isInt({ min: 0 }),
    query('limit', 'No valid limit is provided').if(query('limit').exists()).isInt({ min: 1 }),
];

export default cursorPaginationValidation;
