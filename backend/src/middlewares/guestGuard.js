import CustomError from '../utils/errorHandling.js';

export function blockGuestCredentialChanges(req, _res, next) {
    if (!req.user?.isGuest) return next();

    const hasPassword = Boolean(req.body?.password);
    const hasEmail = Boolean(req.body?.email);
    const hasUsername = Boolean(req.body?.username);

    if (hasPassword || hasEmail || hasUsername) {
        throw new CustomError(
            'Demo user credentials (username, email, password) cannot be modified',
            403,
        );
    }

    next();
}
