import { LogLevels, ProcessTypes } from '../models/log.model';
import { GeneratePackagesLogParams } from './generate-packages.logger';
import { GeneratePackagesStep } from '../models/packages/packages-generate-steps.model';
import { BaseLogger } from './base-logger.logger';

class PackagesLogger extends BaseLogger {
    constructor() {
        super(ProcessTypes.GENERATE_PACKAGES);
    }

    structured(params: GeneratePackagesLogParams): void {
        const {
            level,
            message,
            executionTime,
            flightsSearchRequestsCount,
            flightsSearchRequestsParams,
            fixturesCount,
            flightsCount,
            packagesGenerated,
            packagesValidCount,
            timings,
            step,
            errors,
            aiTokensUsage,
            userId,
            packagesGeneratedCount,
        } = params;

        this.info(message, {
            processType: ProcessTypes.GENERATE_PACKAGES,
            step,
            fixturesCount: fixturesCount ?? 0,
            fixtures: params.fixtures,
            flightsSearchRequestsCount,
            flightsCount: flightsCount ?? 0,
            packagesGeneratedCount: packagesGeneratedCount ?? 0,
            packagesValidCount: packagesValidCount ?? 0,
            timings: {
                ...timings,
                totalMs: executionTime,
            },
            flightsSearchRequestsParams,
            packagesGenerated,
            errors,
            aiTokensUsage,
            userId,
        });
    }

    stepError(step: GeneratePackagesStep, error: unknown, meta?: Partial<GeneratePackagesLogParams>) {
        const errMsg = error instanceof Error ? error.message : String(error);

        this.error(`❌ [${step}] ${errMsg}`);

        this.structured({
            message: `Step "${step}" failed: ${errMsg}`,
            level: LogLevels.ERROR,
            step,
            ...meta,
        });
    }
}

export const packagesLogger = new PackagesLogger();
