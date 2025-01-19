const getItem = (key: string, defaultValue: any = null): any => {
    const value = localStorage.getItem(key);
    if (value === null && defaultValue !== null) {
        return defaultValue;
    }
    return value !== null ? value : defaultValue;
};

const setItem = (key: string, value: string): void => {
    if (value === "") {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, value);
    }
};

export { getItem, setItem };