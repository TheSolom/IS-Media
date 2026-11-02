const extractFieldPathAndMsg = (item) => {
    if (!item) return null;

    let fieldPath = item.path;
    const message = item.msg;

    if (item.nestedErrors?.length > 0) {
        const firstNested = item.nestedErrors.flat()[0];
        if (firstNested?.path) {
            fieldPath = firstNested.path;
        }
    }

    if (!fieldPath || !message) return null;
    return { path: fieldPath, message };
};

export const extractFormErrors = (err, defaultGeneralMessage = 'An error occurred') => {
    const result = {
        general: null,
        fields: {},
    };

    if (!err) return result;

    if (typeof err === 'string') {
        result.general = err;
        return result;
    }

    const data = err.response?.data;
    if (!data) {
        result.general = err.message || defaultGeneralMessage;
        return result;
    }

    if (Array.isArray(data.cause) && data.cause.length > 0) {
        data.cause.forEach((item) => {
            const extracted = extractFieldPathAndMsg(item);
            if (extracted && !result.fields[extracted.path]) {
                result.fields[extracted.path] = extracted.message;
            }
        });

        if (Object.keys(result.fields).length === 0) {
            result.general = data.message || defaultGeneralMessage;
        }
        return result;
    }

    result.general = data.message || err.message || defaultGeneralMessage;
    return result;
};

export const extractErrorMessage = (err, fallbackMessage = 'An error occurred') => {
    const formErrors = extractFormErrors(err, fallbackMessage);
    if (formErrors.general) return formErrors.general;

    const fieldMessages = Object.values(formErrors.fields);
    if (fieldMessages.length > 0) {
        return fieldMessages[0];
    }

    return fallbackMessage;
};
