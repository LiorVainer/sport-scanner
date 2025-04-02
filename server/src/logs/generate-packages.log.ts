import {Log, LogLevel, ProcessTypes} from '../models/log.model';
import {PackagesGenerationParams} from '../models/package-generate-params.model';
import {ENV} from '../env/env.config';
import {LanguageModelUsage} from "ai";
import mongoose from "mongoose";
import {ValueOf} from "../types/general.types";

export const GeneratePackagesSteps = {
    GENERATE_SEARCH_FIXTURE_PARAMS: 'generate_search_fixture_params',
    FETCH_FIXTURES: 'fetch_fixtures',
    ADD_PRICE_RANGE_TO_FIXTURES: 'add_price_range_to_fixtures',
    GENERATE_SEARCH_PARAMS: 'generate_search_params',
    SEARCH_FLIGHTS: 'search_flights',
    GENERATE_PACKAGES: 'generate_packages',
    FILTER_PACKAGES: 'filter_packages',
} as const;

export type GeneratePackagesStep = ValueOf<typeof GeneratePackagesSteps>;

export type GeneratePackagesStepKey = keyof typeof GeneratePackagesSteps;

export const GeneratePackagesTimingSteps = {
    GENERATE_SEARCH_FIXTURE_PARAMS: 'generateSearchFixtureParamsMs',
    FETCH_FIXTURES: 'fetchFixturesMs',
    ADD_PRICE_RANGE_TO_FIXTURES: 'addPriceRangeToFixturesMs',
    GENERATE_SEARCH_PARAMS: 'generateSearchParamsMs',
    SEARCH_FLIGHTS: 'searchFlightsMs',
    GENERATE_PACKAGES: 'generatePackagesMs',
    FILTER_PACKAGES: 'filterPackagesMs',
} satisfies Record<GeneratePackagesStepKey, any>;

export type GeneratePackagesTimingStep = typeof GeneratePackagesTimingSteps[keyof typeof GeneratePackagesTimingSteps];

export type GeneratePackagesLogTimings = Partial<Record<GeneratePackagesTimingStep, number>>;


export type GeneratePackagesLogParams = {
    message: string;
    level: LogLevel;
    executionTime?: number;
    fixturesCount?: number;
    flightsCount?: number;
    packagesGenerated?: number;
    packagesValid?: number;
    timings?: Partial<GeneratePackagesLogTimings>;
    requestParams?: PackagesGenerationParams;
    step?: string;
    errors?: Record<string, unknown>;
    aiTokensUsage?: Record<string, LanguageModelUsage>
    userId?: string;
};

export const createGeneratePackagesLog = (params: GeneratePackagesLogParams): Log => ({
    message: params.message,
    processType: ProcessTypes.GENERATE_PACKAGES,
    level: params.level,
    executionTime: params.executionTime,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: new mongoose.Types.ObjectId(params.userId),
    additionalInfo: {
        step: params.step,
        requestParams: params.requestParams,
        fixturesCount: params.fixturesCount ?? 0,
        flightsCount: params.flightsCount ?? 0,
        packagesGenerated: params.packagesGenerated ?? 0,
        packagesValid: params.packagesValid ?? 0,
        timings: params.timings,
        errors: params.errors,
        variables: {
            FLIGHT_DATE_OFFSET_DAYS: ENV.FLIGHT_DATE_OFFSET_DAYS,
            FLIGHT_SEARCH_CONCURRENCY_LIMIT: ENV.FLIGHT_SEARCH_CONCURRENCY_LIMIT,
            MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH: ENV.MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH,
            MAX_FLIGHT_OFFERS_PER_FIXTURE: ENV.MAX_FLIGHT_OFFERS_PER_FIXTURE,
            AMADEUS_API_URL: ENV.AMADEUS_API_URL,
            AI_MODEL: ENV.AI_MODEL,
            AI_TEMPERATURE: ENV.AI_TEMPERATURE
        },
        aiTokensUsage: params.aiTokensUsage,
    },
});
