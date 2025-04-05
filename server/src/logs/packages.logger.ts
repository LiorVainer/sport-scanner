import {logger} from './logger';
import {LogLevels, ProcessTypes} from '../models/log.model';
import {GeneratePackagesLogParams} from './generate-packages.logger';
import {ENV} from '../env/env.config';
import {CustomLogLevel} from "./levels.logger";
import {GeneratePackagesStep} from "../models/package-generate-params.model";

export const packagesLogger = {
    info: (message: string, meta?: Record<string, any>) => {
        logger.local.info(message);
        logger.remote.info(message, {
            processType: ProcessTypes.GENERATE_PACKAGES,
            ...meta,
        });
    },

    success: (message: string, meta?: Record<string, any>) => {
        logger.local.success(message);
        logger.remote.success(message, {
            processType: ProcessTypes.GENERATE_PACKAGES,
            ...meta,
        });
    },

    error: (message: string, meta?: Record<string, any>) => {
        logger.local.error(message);
        logger.remote.error(message, {
            processType: ProcessTypes.GENERATE_PACKAGES,
            ...meta,
        });
    },

    warn: (message: string, meta?: Record<string, any>) => {
        logger.local.warn(message);
        logger.remote.warn(message, {
            processType: ProcessTypes.GENERATE_PACKAGES,
            ...meta,
        });
    },

    debug: (message: string, meta?: Record<string, any>) => {
        logger.local.debug(message);
        logger.remote.debug(message, {
            processType: ProcessTypes.GENERATE_PACKAGES,
            ...meta,
        });
    },

    structured: (params: GeneratePackagesLogParams): void => {
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

        logger.local.log({
            level,
            message
        })

        logger.remote.log({
            level: level.toLowerCase() as CustomLogLevel,
            message,
            meta: {
                userId,
                processType: ProcessTypes.GENERATE_PACKAGES,
                timestamp: new Date().toISOString(),
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
                variables: {
                    FLIGHT_DATE_OFFSET_DAYS: ENV.FLIGHT_DATE_OFFSET_DAYS,
                    FLIGHT_SEARCH_CONCURRENCY_LIMIT: ENV.FLIGHT_SEARCH_CONCURRENCY_LIMIT,
                    MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH: ENV.MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH,
                    MAX_FLIGHT_OFFERS_PER_REQUEST: ENV.MAX_FLIGHT_OFFERS_PER_REQUEST,
                    AMADEUS_API_URL: ENV.AMADEUS_API_URL,
                    AI_MODEL: ENV.AI_MODEL,
                    AI_TEMPERATURE: ENV.AI_TEMPERATURE,
                },
            },
        });
    },
    stepError: (
        step: GeneratePackagesStep,
        error: unknown,
        meta?: Partial<GeneratePackagesLogParams>
    ) => {
        const errMsg = error instanceof Error ? error.message : String(error);

        packagesLogger.error(`❌ [${step}] ${errMsg}`);

        packagesLogger.structured({
            message: `Step "${step}" failed: ${errMsg}`,
            level: LogLevels.ERROR,
            step,
            ...meta,
        });
    }
};
