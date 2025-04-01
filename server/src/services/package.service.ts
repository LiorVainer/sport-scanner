import {PackageGenerateParams} from '../models/package-generate-params.model';
import {soccerService} from './soccer.service';
import {convertPackageGenerateParamsToFixtureQueryParams} from '../converters/package-to-fixtures';
import {FixtureItem, FixtureItemWithPrice, FixturePriceRangeListSchema} from '../models/fixture.model';
import {AIService} from '../ai/ai.service';
import {generateUserMessageForFixturePriceMap} from '../ai/utils/fixture-to-system-messages';
import {AmadeusService} from './amadeus.service';
import {
    generateContextMessagesForPackageGeneration,
    generateFilterInvalidPackagesMessages,
} from '../ai/utils/packages-generate-context-messages';
import {FlightOffer} from '../models/flight-offer.model';
import {Package, PackageArraySchema} from '../models/package.model';
import {ENV} from '../env/env.config';
import {generateFlightSearchParamsForFixtures} from '../converters/fixtures-to-flights';
import Bluebird from 'bluebird';
import {Timer} from "../logs/timer";
import {LogLevels} from "../models/log.model";
import {
    GeneratePackagesSteps,
    GeneratePackagesTimingStep,
    GeneratePackagesTimingSteps
} from "../logs/generate-packages.log";
import {Logger} from "../logs/logger";
import {tryCatch} from "../utils/try-catch.utils";
import {FlightSearchParams} from "../models/flights-search-params.model";
import {LanguageModelUsage} from "ai";
import {logService} from "./log.service";

class PackageService {
    generatePackage = async (params: PackageGenerateParams, userId?: string) => {
        const timer = new Timer<GeneratePackagesTimingStep>();
        const flightSearchErrors: { params: FlightSearchParams; error: string }[] = [];

        Logger.info(`📦 Generating package with params: ${JSON.stringify(params)}`);

        const fixtures = await this.fetchFixturesWithPrice(params, timer, userId);
        if (!fixtures) return [];

        const searchMeta = await this.generateFlightSearchMeta(fixtures, params, timer, userId);
        if (!searchMeta) return [];

        const allFlightOffers = await this.fetchFlights(searchMeta.flightSearchParamsArray, timer, flightSearchErrors);
        if (!allFlightOffers.length) return [];

        const generatedPackagesResult = await this.callAiToGeneratePackages(fixtures, allFlightOffers, params, timer, userId);
        if (!generatedPackagesResult) return [];


        const validPackagesResult = await this.filterAiGeneratedPackages(generatedPackagesResult.data, timer, userId, {
            packageGeneration: generatedPackagesResult.usage
        });
        if (!validPackagesResult) return [];

        if (flightSearchErrors.length) {
            Logger.warn(`⚠️ ${flightSearchErrors.length} flight searches failed. Logged in DB.`);
        }

        await logService.saveGeneratePackagesLog({
            message: 'Generated packages successfully',
            level: LogLevels.INFO,
            executionTime: timer.total(),
            timings: timer.timings(),
            fixturesCount: fixtures.length,
            flightsCount: allFlightOffers.length,
            packagesGenerated: generatedPackagesResult.data.length,
            packagesValid: validPackagesResult.data.length,
            requestParams: params,
            errors: flightSearchErrors.length ? {flightSearchErrors} : undefined,
            aiTokensUsage: {
                packageGeneration: generatedPackagesResult.usage,
                packagesFilter: validPackagesResult.usage,
            },
            userId,
        });

        return validPackagesResult.data;
    };

    private async fetchFixturesWithPrice(
        params: PackageGenerateParams,
        timer: Timer<GeneratePackagesTimingStep>,
        userId?: string
    ) {
        timer.start(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS);
        const {
            data: queryParams,
            error: queryError
        } = await tryCatch(Promise.resolve(convertPackageGenerateParamsToFixtureQueryParams(params)));
        timer.stop(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS);

        if (!queryParams || queryError) {
            await logService.saveGeneratePackagesStepError(GeneratePackagesSteps.GENERATE_SEARCH_FIXTURE_PARAMS, queryError, {
                requestParams: params,
                timings: timer.timings(),
                userId
            });
            return null;
        }

        timer.start(GeneratePackagesTimingSteps.FETCH_FIXTURES);
        const {data: fixtures, error: fixturesError} = await tryCatch(soccerService.getFixtures(queryParams));
        timer.stop(GeneratePackagesTimingSteps.FETCH_FIXTURES);

        if (!fixtures || fixturesError) {
            await logService.saveGeneratePackagesStepError(GeneratePackagesSteps.FETCH_FIXTURES, fixturesError, {
                timings: timer.timings(),
                userId
            });
            return null;
        }

        timer.start(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES);
        const {data: enriched, error: priceError} = await tryCatch(this.getFixturesWithTicketPriceRange(fixtures));
        timer.stop(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES);

        if (!enriched || priceError) {
            await logService.saveGeneratePackagesStepError(GeneratePackagesSteps.ADD_PRICE_RANGE_TO_FIXTURES, priceError, {
                fixturesCount: fixtures.length,
                timings: timer.timings(),
                userId
            });
            return null;
        }

        return enriched;
    }

    private async generateFlightSearchMeta(
        fixtures: FixtureItemWithPrice[],
        params: PackageGenerateParams,
        timer: Timer<GeneratePackagesTimingStep>,
        userId?: string
    ) {
        timer.start(GeneratePackagesTimingSteps.GENERATE_SEARCH_PARAMS);
        const {data, error} = await tryCatch(generateFlightSearchParamsForFixtures(fixtures, params));
        timer.stop(GeneratePackagesTimingSteps.GENERATE_SEARCH_PARAMS);

        if (!data || error) {
            await logService.saveGeneratePackagesStepError(GeneratePackagesSteps.GENERATE_SEARCH_PARAMS, error, {
                timings: timer.timings(),
                userId
            });
            return null;
        }

        return data;
    }

    private async fetchFlights(
        flightSearchParamsArray: FlightSearchParams[],
        timer: Timer<GeneratePackagesTimingStep>,
        flightSearchErrors: { params: FlightSearchParams; error: string }[],
        userId?: string
    ) {
        timer.start(GeneratePackagesTimingSteps.SEARCH_FLIGHTS);
        const results = await Bluebird.map(
            flightSearchParamsArray,
            async (params) => {
                const {data, error} = await tryCatch(AmadeusService.searchFlights(params));
                if (error || !data) {
                    flightSearchErrors.push({params, error: error?.message ?? 'Unknown error'});
                    return [];
                }
                return data;
            },
            {concurrency: ENV.FLIGHT_SEARCH_CONCURRENCY_LIMIT}
        );
        timer.stop(GeneratePackagesTimingSteps.SEARCH_FLIGHTS);

        return results.flat();
    }

    private async callAiToGeneratePackages(
        fixtures: FixtureItemWithPrice[],
        flightOffers: FlightOffer[],
        params: PackageGenerateParams,
        timer: Timer<GeneratePackagesTimingStep>,
        userId?: string
    ) {
        timer.start(GeneratePackagesTimingSteps.GENERATE_PACKAGES);
        const {result, error} = await this.generatePackageCombinations(fixtures, flightOffers, params.originIATA);

        if (error) {
            await logService.saveGeneratePackagesStepError(GeneratePackagesSteps.GENERATE_PACKAGES, error, {
                flightsCount: flightOffers.length,
                timings: timer.timings(),
                userId,
            });
            return null;
        }

        timer.stop(GeneratePackagesTimingSteps.GENERATE_PACKAGES);


        return result
    }

    private async filterAiGeneratedPackages(
        packages: Package[],
        timer: Timer<GeneratePackagesTimingStep>,
        userId?: string,
        aiTokensUsage: Record<string, LanguageModelUsage> = {}
    ) {
        timer.start(GeneratePackagesTimingSteps.FILTER_PACKAGES);
        const {result, error} = await this.filterInvalidPackages(packages);
        timer.stop(GeneratePackagesTimingSteps.FILTER_PACKAGES);

        if (error) {
            await logService.saveGeneratePackagesStepError(GeneratePackagesSteps.FILTER_PACKAGES, error, {
                packagesGenerated: packages.length,
                timings: timer.timings(),
                aiTokensUsage,
                userId,
            });
            return null;
        }

        return result
    }


    private getFixturesWithTicketPriceRange = async (fixtures: FixtureItem[]): Promise<FixtureItemWithPrice[]> => {
        const {data: priceRangeList} = await AIService.generateObject({
            schema: FixturePriceRangeListSchema,
            saveOutputToFile: true,
            messages: generateUserMessageForFixturePriceMap(fixtures),
        });

        const priceMap = Object.fromEntries(priceRangeList.map(({id, ...rest}) => [id, rest]));

        return fixtures.map((fixture) => ({
            ...fixture,
            price: priceMap[fixture.fixture.id.toString()],
        }));
    };

    private generatePackageCombinations = async (
        fixtures: FixtureItemWithPrice[],
        flightOffers: FlightOffer[],
        originIATACode: string
    ) => {
        const contextMessages = generateContextMessagesForPackageGeneration(
            fixtures,
            flightOffers,
            ENV.MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH,
            originIATACode
        );

        const {data: result, error} = await tryCatch(AIService.generateObject({
            schema: PackageArraySchema,
            saveOutputToFile: true,
            messages: contextMessages,
            noTokensLimit: true,
        }));

        if (!result || error) {
            Logger.error(`❌ Error generating packages: ${error.message}`);
            return {error}
        } else {
            Logger.info(`🧠 AI generated ${result.usage.totalTokens} tokens for ${result.data.length} packages`);

            return {result}
        }
    };

    private filterInvalidPackages = async (packages: Package[]) => {
        const contextMessages = generateFilterInvalidPackagesMessages(packages);

        const {data: result, error} = await tryCatch(AIService.generateObject({
            schema: PackageArraySchema,
            saveOutputToFile: true,
            messages: contextMessages,
            noTokensLimit: true,
        }));

        if (!result || error) {
            Logger.error(`❌ Error filtering invalid packages: ${error.message}`);

            return {error}
        } else {
            Logger.info(`🧠 AI generated ${result.usage.totalTokens} tokens for ${result.data.length} valid packages`);

            return {result}
        }
    };
}

export const packageService = new PackageService();
