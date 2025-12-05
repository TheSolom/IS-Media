import { verifyToken } from '../services/tokenService.js';
import CustomError from '../utils/errorHandling.js';
import { parseCookies } from '../utils/parseUtil.js';

export default function authMiddleware(req, _res, next) {
    const { cookie } = req.headers;

    if (!cookie)
        throw new CustomError('You must be logged in', 401);

    const parsedCookies = parseCookies(cookie);

    if (!parsedCookies || !parsedCookies.accessToken)
        throw new CustomError('You must be logged in', 401);

    const token = parsedCookies.accessToken;

    const verifyTokenResult = verifyToken(token);

    if (!verifyTokenResult.success)
        throw new CustomError('Invalid token, Please login again', 401);

    const { userId, username, exp } = verifyTokenResult.decoded;

    const currentTime = Math.floor(Date.now() / 1000);

    if (exp < currentTime)
        throw new CustomError('Token expired, Please login again', 401);

    req.user = { id: userId, username };

    next();
};
