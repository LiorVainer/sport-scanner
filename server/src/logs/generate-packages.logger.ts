import {GeneratePackagesTimingStep, PackagesGenerationParams} from '../models/package-generate-params.model';
import {CoreMessage, LanguageModelUsage} from "ai";
import {CustomLogLevel} from "./levels.logger";
import {Package} from "../models/package.model";
import {FlightSearchParams} from "../models/flights-search-params.model";
import {FixtureItem} from "../models/fixture.model";

export type GeneratePackagesLogTimings = Partial<Record<GeneratePackagesTimingStep, number>>;

export type GeneratePackagesLogParams = {
    message: string;
    level: CustomLogLevel;
    executionTime?: number;
    aiContextMessagesCount?: number;
    aiContextMessages?: CoreMessage[];
    fixtures?: FixtureItem[]
    fixturesCount?: number;
    flightsCount?: number;
    flightsSearchRequestsCount?: number;
    flightsSearchRequestsParams?: FlightSearchParams[];
    packagesGeneratedCount?: number;
    packagesValidCount?: number;
    timings?: GeneratePackagesLogTimings;
    requestParams?: PackagesGenerationParams;
    step?: string;
    errors?: Record<string, unknown>;
    packagesGenerated?: Package[];
    aiTokensUsage?: Record<string, LanguageModelUsage>
    userId?: string;
};