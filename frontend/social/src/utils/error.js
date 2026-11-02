const extractValidationMessage = (cause) => {
    if (!Array.isArray(cause) || cause.length === 0) return null;

    const messages = cause
        .flatMap((item) => {
            if (item.nestedErrors) {
                return item.nestedErrors.flat().map((nested) => nested.msg);
            }
            return item.msg ? [item.msg] : [];
        })
        .filter(Boolean);

    return messages.length > 0 ? [...new Set(messages)].join('. ') : null;
};

export const extractErrorMessage = (err, fallbackMessage = 'An error occurred') => {
    if (!err) return null;
    if (typeof err === 'string') return err;

    const data = err.response?.data;
    if (data) {
        const validationMessage = extractValidationMessage(data.cause);
        if (validationMessage) return validationMessage;
        if (data.message) return data.message;
    }

    return err.message || fallbackMessage;
};
