// generic-logger.ts
import { logger } from './logger';
import { LogLevels, ProcessType } from '../models/log.model';
import { CustomLogLevel } from './levels.logger';

export class BaseLogger {
    constructor(private processType: ProcessType) {}

    private log(level: CustomLogLevel, message: string, meta?: Record<string, any>) {
        logger.local.log({ level, message });
        logger.remote.log({
            level,
            message,
            meta: {
                processType: this.processType,
                timestamp: new Date().toISOString(),
                ...meta,
            },
        });
    }

    info(message: string, meta?: Record<string, any>) {
        this.log(LogLevels.INFO, message, meta);
    }

    success(message: string, meta?: Record<string, any>) {
        this.log(LogLevels.SUCCESS, message, meta);
    }

    error(message: string, meta?: Record<string, any>) {
        this.log(LogLevels.ERROR, message, meta);
    }

    warn(message: string, meta?: Record<string, any>) {
        this.log(LogLevels.WARN, message, meta);
    }

    debug(message: string, meta?: Record<string, any>) {
        this.log(LogLevels.DEBUG, message, meta);
    }
}
