import jwt from 'jsonwebtoken';

import CustomError from '../utils/errorHandling.js';
import * as parseUtil from '../utils/parseUtil.js';

export default function socketAuthMiddleware (socket, next) {
    const { cookie } = socket.handshake.headers;

    if (!cookie)
        throw new CustomError('You must be logged in', 401);

    const parsedCookies = parseUtil.parseCookies(cookie);

    if (!parsedCookies || !parsedCookies.jwt)
        throw new CustomError('You must be logged in', 401);

    try {
        const decoded = jwt.verify(parsedCookies.jwt, process.env.JWT_SECRET);

        socket.userId = decoded.id;

        next();
    } catch (error) {
        console.error(error);
        next(error.status === 401 ? error : new CustomError('Something went wrong while authenticating', 500));
    }
};
