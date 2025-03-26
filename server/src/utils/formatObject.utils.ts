export const formatObject = (object: Record<string, any>): string => {
    return Object.entries(object)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
};
