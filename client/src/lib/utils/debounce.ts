type CallbackFunction = (...args: Array<unknown>) => unknown;

const debounce = (callback: CallbackFunction, delay = 250) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: unknown[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback(...args);
        }, delay);
    };
}

export default debounce;