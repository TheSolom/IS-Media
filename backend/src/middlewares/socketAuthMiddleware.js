import { verifyToken } from '../services/tokenService.js';
import CustomError from '../utils/errorHandling.js';
import { parseCookies } from '../utils/parseUtil.js';

export default function socketAuthMiddleware(socket, next) {
    const { cookie } = socket.handshake.headers;

    if (!cookie) {
        return next(new CustomError('You must be logged in', 401));
    }

    const parsedCookies = parseCookies(cookie);

    if (!parsedCookies?.accessToken) {
        return next(new CustomError('You must be logged in', 401));
    }

    const verifyTokenResult = verifyToken(
        parsedCookies.accessToken,
        process.env.ACCESS_TOKEN_SECRET,
    );

    if (!verifyTokenResult.success) {
        return next(new CustomError('Invalid token, Please login again', 401));
    }

    const { userId, username, exp, isGuest } = verifyTokenResult.decoded;

    const currentTime = Math.floor(Date.now() / 1000);

    if (exp < currentTime) {
        return next(new CustomError('Token expired, Please login again', 401));
    }

    socket.user = { id: userId, username, isGuest: Boolean(isGuest) };

    next();
}
