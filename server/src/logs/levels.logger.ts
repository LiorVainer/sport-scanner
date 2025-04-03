export const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        success: 2,
        info: 3,
        debug: 4,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        success: 'green',
        info: 'blue',
        debug: 'gray',
    },
} as const;

export type CustomLogLevel = keyof typeof customLevels.levels;
