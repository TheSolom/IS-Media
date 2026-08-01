import { validationResult } from 'express-validator';

import CustomError from './errorHandling.js';

const validateRequest = (req) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) throw new CustomError('Validation failed', 422, errors.array());
};

export default validateRequest;
