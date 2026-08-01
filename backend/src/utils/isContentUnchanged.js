const isContentUnchanged = (...args) => {
    for (let i = 0; i < args.length - 1; i += 2) {
        if (args[i] !== args[i + 1]) return false;
    }
    return true;
};

export default isContentUnchanged;
