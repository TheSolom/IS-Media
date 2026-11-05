const IS_MEDIA_VERCEL_REGEX = /^https:\/\/is-media(-[a-z0-9-]+)?\.vercel\.app$/i;

export const allowedOrigins = new Set([
    'http://localhost:3000',
    'https://is-media.vercel.app',
    'http://localhost:4000',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]);

export const isOriginAllowed = (origin) => {
    return !origin || allowedOrigins.has(origin) || IS_MEDIA_VERCEL_REGEX.test(origin);
};

export const corsOptions = {
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
};

export default corsOptions;
