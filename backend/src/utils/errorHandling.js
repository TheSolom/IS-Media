export default class CustomError extends Error {
    constructor(message, statusCode, cause) {
        super(message);
        this.name = this.constructor.name;
        this.status = statusCode || 500;
        if (cause) this.cause = cause;
        Error.captureStackTrace(this, this.constructor);
    }
}
