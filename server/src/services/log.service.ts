import {LogLevels} from '../models/log.model';
import {
    createGeneratePackagesLog,
    GeneratePackagesLogParams,
    GeneratePackagesStep
} from '../logs/generate-packages.logger';
import {logger} from "../logs/logger";

class LogService {
    async saveGeneratePackagesLog(params: GeneratePackagesLogParams): Promise<void> {
        const log = createGeneratePackagesLog(params);
        logger.remote.info(log)
    }

    async saveGeneratePackagesStepError(
        step: GeneratePackagesStep,
        error: unknown,
        meta?: Partial<GeneratePackagesLogParams>
    ): Promise<void> {
        const errMsg = error instanceof Error ? error.message : String(error);

        logger.local.error(`[${step}] Failed - ${errMsg}`);
        const params = {
            message: `Step "${step}" failed: ${errMsg}`,
            level: LogLevels.ERROR,
            step,
            ...meta,
        }

        const log = createGeneratePackagesLog(params);
        logger.local.error(log);
    }
}

export const logService = new LogService();
