export const parseCookies = (cookies) =>
    cookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key.trim()] = value;
        return acc;
    }, {});

export const parseJwt = (token) =>
    JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
