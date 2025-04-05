import {z} from 'zod';
import {StringToObjectId} from '../utils/zod.utils';
import {ValueOf} from "../types/general.types";
import {CustomLogLevel} from "../logs/levels.logger"; // Utility to convert/validate strings as ObjectIds

export const ProcessTypes = {
    GENERATE_PACKAGES: 'generate-packages',
    SEARCH_FIXTURES: 'fetch-fixtures',
    SEARCH_FLIGHTS: 'search-flights',
} as const;

export type ProcessType = ValueOf<typeof ProcessTypes>;

export const LogLevels = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    SUCCESS: 'success',
    DEBUG: 'debug',
} satisfies Record<string, CustomLogLevel>


export const ProcessTypeEnum = z.enum(
    Object.values(ProcessTypes) as [ProcessType, ...ProcessType[]]
);

export const LogLevelEnum = z.enum(
    Object.values(LogLevels) as [CustomLogLevel, ...CustomLogLevel[]]
);

export const LogSchema = z.object({
    message: z.string(),
    level: LogLevelEnum,
    processType: ProcessTypeEnum,
    timestamp: z.string().datetime(),
    updatedAt: z.string().datetime(),
    executionTime: z.number().optional(),
    userId: z.string().optional(),
    meta: z
        .record(z.any())
        .optional(),
}).catchall(z.any());

export type Log = z.infer<typeof LogSchema>;

export const LogWithId = LogSchema.extend({
    _id: StringToObjectId,
});
export type LogWithId = z.infer<typeof LogWithId>;
