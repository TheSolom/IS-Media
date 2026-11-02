import { validationResult } from 'express-validator';

import CustomError from './errorHandling.js';

const validateRequest = (req) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorArray = errors.array();
        let firstMsg = 'Validation failed';
        const firstError = errorArray[0];
        if (firstError) {
            if (firstError.msg && firstError.msg !== 'Invalid value(s)') {
                firstMsg = firstError.msg;
            } else if (firstError.nestedErrors && firstError.nestedErrors.length > 0) {
                const nested = firstError.nestedErrors.flat()[0];
                firstMsg = nested?.msg || 'Validation failed';
            }
        }
        throw new CustomError(firstMsg, 422, errorArray);
    }
};

export default validateRequest;
