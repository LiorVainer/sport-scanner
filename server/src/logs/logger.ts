import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { customLevels, CustomLogLevel } from './levels.logger';
import { ENV } from '../env/env.config';
import { LogLevels } from '../models/log.model';
import { injectRequestContextFormat } from './utils.logger';

const logtail = new Logtail(ENV.LOGTAIL_SOURCE_TOKEN, {
    endpoint: ENV.LOGTAIL_INGESTING_HOST,
});

winston.addColors(customLevels.colors);

const emojiMap: Record<CustomLogLevel, string> = {
    error: '❌',
    warn: '⚠️',
    success: '✅',
    info: 'ℹ️',
    debug: '🐛',
};

const baseFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, meta }) => {
        const emoji = emojiMap[level as CustomLogLevel] || '';
        const typedMeta = meta as { requestId?: string };

        const requestId = typedMeta?.requestId;
        const extra = Object.keys(typedMeta || {}).length ? ` | ${JSON.stringify(typedMeta, null, 2)}` : '';

        return `${timestamp} ${emoji} [${level.toUpperCase()}]: ${message}${requestId ? ` (requestId="${requestId}")` : ''}`;
    })
);

const consoleLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'debug',
    format: winston.format.combine(injectRequestContextFormat(), baseFormat, winston.format.colorize({ all: true })),
    transports: [new winston.transports.Console()],
});

const logtailLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'debug',
    format: winston.format.combine(winston.format.timestamp(), injectRequestContextFormat(), winston.format.json()),
    transports: [new LogtailTransport(logtail)],
});

type LogMethod = (message: string, meta?: Record<string, any>) => void;

type LogInput = {
    level: CustomLogLevel;
    message: string;
    meta?: Record<string, any>;
};

type LogInterface = {
    info: LogMethod;
    error: LogMethod;
    success: LogMethod;
    debug: LogMethod;
    warn: LogMethod;
    log: (entry: LogInput) => void;
};

export const logger: LogInterface & {
    local: LogInterface;
    remote: LogInterface;
} = {
    info: (message, meta) => {
        consoleLogger.info(message);
        logtailLogger.info(message, meta);
    },

    error: (message, meta) => {
        consoleLogger.error(message);
        logtailLogger.error(message, meta);
    },

    success: (message, meta) => {
        consoleLogger.log({ level: LogLevels.SUCCESS, message });
        logtailLogger.log({ level: LogLevels.SUCCESS, message, ...(meta ?? {}) });
    },

    debug: (message, meta) => {
        consoleLogger.debug(message);
        logtailLogger.debug(message, meta);
    },

    warn: (message, meta) => {
        consoleLogger.warn(message);
        logtailLogger.warn(message, meta);
    },

    log: ({ level, message, meta }) => {
        consoleLogger.log({ level, message, ...(meta ?? {}) });
        logtailLogger.log({ level, message, ...(meta ?? {}) });
    },

    local: {
        info: (msg, meta) => consoleLogger.info(msg, meta),
        error: (msg, meta) => consoleLogger.error(msg, meta),
        success: (msg, meta) => consoleLogger.log({ level: 'success', message: msg, ...(meta ?? {}) }),
        debug: (msg, meta) => consoleLogger.debug(msg, meta),
        warn: (msg, meta) => consoleLogger.warn(msg, meta),
        log: ({ level, message, meta }) => {
            consoleLogger.log({ level, message, ...(meta ?? {}) });
        },
    },

    remote: {
        info: (msg, meta) => logtailLogger.info(msg, meta),
        error: (msg, meta) => logtailLogger.error(msg, meta),
        success: (msg, meta) => logtailLogger.log({ level: 'success', message: msg, ...(meta ?? {}) }),
        debug: (msg, meta) => logtailLogger.debug(msg, meta),
        warn: (msg, meta) => logtailLogger.warn(msg, meta),
        log: ({ level, message, meta }) => {
            logtailLogger.log({ level, message, ...(meta ?? {}) });
        },
    },
};
