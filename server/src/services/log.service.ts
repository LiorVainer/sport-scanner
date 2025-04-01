import {Log, LogLevels} from '../models/log.model';
import {LogRepository} from "../repositories/log.repository";
import {
    createGeneratePackagesLog,
    GeneratePackagesLogParams,
    GeneratePackagesStep
} from "../logs/generate-packages.log";
import {Logger} from "../logs/logger";

class LogService {
    saveGeneratePackagesLog = async (params: GeneratePackagesLogParams): Promise<Log> => {
        const log = createGeneratePackagesLog(params);
        return await LogRepository.create(log);
    };

    async saveGeneratePackagesStepError(step: GeneratePackagesStep, error: unknown, meta?: Partial<GeneratePackagesLogParams>) {
        const errMsg = error instanceof Error ? error.message : String(error);
        Logger.error(`[${step}] Failed - ${errMsg}`);
        await this.saveGeneratePackagesLog({
            message: `Step "${step}" failed: ${errMsg}`,
            level: LogLevels.ERROR,
            step,
            ...meta,
        });
    }
}

export const logService = new LogService();