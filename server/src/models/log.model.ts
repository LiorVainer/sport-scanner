import {z} from 'zod';
import {StringToObjectId} from '../utils/zod.utils';
import {ValueOf} from "../types/general.types"; // Utility to convert/validate strings as ObjectIds

export const ProcessTypes = {
    GENERATE_PACKAGES: 'generate-packages',
} as const;

export type ProcessType = ValueOf<typeof ProcessTypes>;

export const LogLevels = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal',
} as const;

export type LogLevel = ValueOf<typeof LogLevels>;

export const ProcessTypeEnum = z.enum(
    Object.values(ProcessTypes) as [ProcessType, ...ProcessType[]]
);

export const LogLevelEnum = z.enum(
    Object.values(LogLevels) as [LogLevel, ...LogLevel[]]
);

export const LogSchema = z
    .object({
        message: z.string(),
        processType: ProcessTypeEnum,
        level: LogLevelEnum,
        executionTime: z.number().optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
        userId: StringToObjectId.optional(),
        additionalInfo: z.record(z.any()).optional(),
    })
    .catchall(z.any());

export type Log = z.infer<typeof LogSchema>;

export const LogWithId = LogSchema.extend({
    _id: StringToObjectId,
});
export type LogWithId = z.infer<typeof LogWithId>;
