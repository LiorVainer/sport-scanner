/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        'socket.service.ts',
        'ai.logger.ts',
        'error.middleware.ts',
        'file.middleware.ts',
        'ai.service.ts',
        'socket.ts',
        'date.utils.ts',
        'formatObject.utils.ts',
        'soccer.utils.ts',
        'zod.utils.ts',
        'file.controller.ts',
    ],
};
