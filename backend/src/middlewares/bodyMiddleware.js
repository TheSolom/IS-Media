import CustomError from '../utils/errorHandling.js';

const requireBody = (req, _res, next) => {
    const methodsWithBody = ['POST', 'PUT', 'PATCH'];

    if (!methodsWithBody.includes(req.method)) return next();

    const hasBody =
        req.body !== undefined &&
        req.body !== null &&
        (!Object.keys(req.body).length ||
            typeof req.body !== 'object' ||
            req.body.constructor === Object);

    if (!hasBody) {
        return next(new CustomError('Request body is required', 400));
    }

    next();
};

export default requireBody;
