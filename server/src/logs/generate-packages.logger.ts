import {GeneratePackagesTimingStep, PackagesGenerationParams} from '../models/package-generate-params.model';
import {LanguageModelUsage} from "ai";
import {CustomLogLevel} from "./levels.logger";
import {Package} from "../models/package.model";

export type GeneratePackagesLogTimings = Partial<Record<GeneratePackagesTimingStep, number>>;

export type GeneratePackagesLogParams = {
    message: string;
    level: CustomLogLevel;
    executionTime?: number;
    fixturesCount?: number;
    flightsCount?: number;
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