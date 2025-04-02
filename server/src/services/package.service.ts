import {PackagesGenerationParams} from '../models/package-generate-params.model';
import {ResponseError as AmadeusResponseError} from 'amadeus-ts';
import {soccerService} from './soccer.service';
import {convertPackageGenerateParamsToFixtureQueryParams} from '../converters/package-to-fixtures';
import {FixtureItem, FixtureItemWithPrice, FixturePriceRangeListSchema} from '../models/fixture.model';
import {AIService} from '../ai/ai.service';
import {AmadeusService} from './amadeus.service';
import {
    generateContextMessagesForPackageGeneration,
    generateFilterInvalidPackagesMessages,
} from '../ai/utils/packages-generate-context-messages';
import {FlightOffer} from '../models/flight-offer.model';
import {Package, PackageArraySchema} from '../models/package.model';
import {ENV} from '../env/env.config';
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
import {logService} from "./log.service";
import {filterInvalidPackagesByRulesEnforcement} from "../utils/package.utils";
import {generateUserMessageForFixturePriceMap} from "../ai/utils/fixture-to-system-messages";
import {generateFlightSearchParamsForFixtures} from "../converters/fixtures-to-flights";

class PackageService {
    generatePackage = async (params: PackagesGenerationParams, userId?: string) => {
        const timer = new Timer<GeneratePackagesTimingStep>();
        const flightSearchErrors: { params: FlightSearchParams; error: string }[] = [];

        Logger.info(`📦 Generating package with params: ${JSON.stringify(params)}`);

        const fixtures = await this.fetchFixturesWithPrice(params, timer, userId);
        if (!fixtures) return [];

        const searchMeta = await this.generateFlightSearchMeta(fixtures, params, timer, userId);
        if (!searchMeta) return [];

        const {flightSearchParamsArray} = searchMeta;

        const allFlightOffers = await this.fetchFlights(flightSearchParamsArray, timer, flightSearchErrors);
        if (!allFlightOffers.length) return [];

        const generatedPackagesResult = await this.callAiToGeneratePackages(fixtures, allFlightOffers, params, timer, userId);
        if (!generatedPackagesResult) return [];


        const validPackagesResult = await this.filterAiGeneratedPackagesByRules(generatedPackagesResult.data, params, timer);
        if (!validPackagesResult) return [];

        if (flightSearchErrors.length) {
            Logger.warn(`⚠️ ${flightSearchErrors.length} flight searches failed. Logged in DB.`);
        }

        Logger.success(`🎉 Generated ${validPackagesResult.length} valid packages in ${timer.total()}ms`);

        await logService.saveGeneratePackagesLog({
            message: 'Generated packages successfully',
            level: LogLevels.INFO,
            executionTime: timer.total(),
            timings: timer.timings(),
            fixturesCount: fixtures.length,
            flightsCount: allFlightOffers.length,
            packagesGenerated: generatedPackagesResult.data.length,
            packagesValid: validPackagesResult.length,
            requestParams: params,
            errors: flightSearchErrors.length ? {flightSearchErrors} : undefined,
            aiTokensUsage: {
                packageGeneration: generatedPackagesResult.usage,
            },
            userId,
        });

        return validPackagesResult;
    };

    private async fetchFixturesWithPrice(
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>,
        userId?: string
    ) {
        Logger.info(`🔍 Starting fixture search with filters: ${JSON.stringify(params)};`);

        timer.start(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS);
        const {data: queryParams, error: queryError} = await tryCatch(
            Promise.resolve(convertPackageGenerateParamsToFixtureQueryParams(params))
        );
        timer.stop(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS);

        Logger.info(`⏱️ Query conversion took ${timer.stepDuration(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS)}ms`);

        if (!queryParams || queryError) {
            await logService.saveGeneratePackagesStepError(
                GeneratePackagesSteps.GENERATE_SEARCH_FIXTURE_PARAMS,
                queryError,
                {requestParams: params, timings: timer.timings(), userId}
            );
            return null;
        }

        Logger.info(`📡 Fetching fixtures with query: ${JSON.stringify(queryParams)}`);

        timer.start(GeneratePackagesTimingSteps.FETCH_FIXTURES);
        const {data: fixtures, error: fixturesError} = await tryCatch(
            soccerService.getFixtures(queryParams)
        );
        timer.stop(GeneratePackagesTimingSteps.FETCH_FIXTURES);

        Logger.info(`⏱️ Fetch fixtures took ${timer.stepDuration(GeneratePackagesTimingSteps.FETCH_FIXTURES)}ms`);

        if (!fixtures || fixturesError) {
            await logService.saveGeneratePackagesStepError(
                GeneratePackagesSteps.FETCH_FIXTURES,
                fixturesError,
                {timings: timer.timings(), userId}
            );
            return null;
        }

        Logger.info(`📅 Found ${fixtures.length} fixtures`);

        timer.start(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES);
        const {data: enriched, error: priceError} = await tryCatch(
            this.getFixturesWithTicketPriceRange(fixtures)
        );
        timer.stop(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES);

        Logger.info(`⏱️ Price enrichment took ${timer.stepDuration(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES)}ms`);

        if (!enriched || priceError) {
            await logService.saveGeneratePackagesStepError(
                GeneratePackagesSteps.ADD_PRICE_RANGE_TO_FIXTURES,
                priceError,
                {fixturesCount: fixtures.length, timings: timer.timings(), userId}
            );
            return null;
        }

        Logger.info(`💰 Fixtures enriched with price ranges`);

        return enriched;
    }

    private async generateFlightSearchMeta(
        fixtures: FixtureItemWithPrice[],
        params: PackagesGenerationParams,
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
        flightSearchErrors: { params: FlightSearchParams; error: any }[],
    ) {
        Logger.info(`🛫 Starting flight search for ${flightSearchParamsArray.length} requests`);
        flightSearchParamsArray.forEach((params) => {
            Logger.info(`🔍 Searching flights for ${params.origin} -> ${params.destination} for ${params.dateFrom}`);
        });

        timer.start(GeneratePackagesTimingSteps.SEARCH_FLIGHTS);
        const results = await Bluebird.map(
            flightSearchParamsArray,
            async (params) => {
                const {
                    data,
                    error
                } = await tryCatch<FlightOffer[] | undefined, AmadeusResponseError>(AmadeusService.searchFlights(params));
                if (error || !data) {
                    flightSearchErrors.push({params, error});
                    Logger.warn(`❌ Error fetching flights for ${params.origin} -> ${params.destination} on ${params.dateFrom} due to ${error?.description.at(0)?.detail}`);
                    return [];
                }
                return data;
            },
            {concurrency: ENV.FLIGHT_SEARCH_CONCURRENCY_LIMIT}
        );
        timer.stop(GeneratePackagesTimingSteps.SEARCH_FLIGHTS);

        const flat = results.flat();
        Logger.info(`✈️ Flight search complete. Fetched ${flat.length} offers`);
        Logger.info(`⏱️ Flight search took ${timer.stepDuration(GeneratePackagesTimingSteps.SEARCH_FLIGHTS)}ms`);

        return flat;
    }

    private async callAiToGeneratePackages(
        fixtures: FixtureItemWithPrice[],
        flightOffers: FlightOffer[],
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>,
        userId?: string
    ) {
        Logger.info(`🧠 Generating packages from ${fixtures.length} fixtures & ${flightOffers.length} flights`);

        timer.start(GeneratePackagesTimingSteps.GENERATE_PACKAGES);
        const {result, error} = await this.generatePackageCombinations(
            fixtures,
            flightOffers,
            params.originIATA,
        );
        timer.stop(GeneratePackagesTimingSteps.GENERATE_PACKAGES);

        const duration = timer.stepDuration(GeneratePackagesTimingSteps.GENERATE_PACKAGES);

        Logger.info(`⏱️ Packages generation took ${duration}ms`);

        if (error) {
            Logger.error(`❌ Error generating packages: ${error?.message}`);
            await logService.saveGeneratePackagesStepError(
                GeneratePackagesSteps.GENERATE_PACKAGES,
                error,
                {flightsCount: flightOffers.length, timings: timer.timings(), userId}
            );
            return null;
        }

        Logger.info(`📊 Tokens used: ${JSON.stringify(result.usage)}`);
        Logger.info(`📦 AI returned ${result.data.length} packages`);
        return result;
    }

    private async filterAiGeneratedPackagesByRules(
        packages: Package[],
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>,
    ) {
        Logger.info(`🧪 Validating ${packages.length} packages by hardcoded rules`);
        timer.start(GeneratePackagesTimingSteps.FILTER_PACKAGES);
        const validPackages = filterInvalidPackagesByRulesEnforcement(packages, params.originIATA);
        timer.stop(GeneratePackagesTimingSteps.FILTER_PACKAGES);
        Logger.info(`✅ ${validPackages.length} packages passed rule-based validation`);
        Logger.info(`⏱️ Filter step took ${timer.stepDuration(GeneratePackagesTimingSteps.FILTER_PACKAGES)}ms`);
        return validPackages;
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
        originIATACode: string,
    ) => {


        const contextMessages = generateContextMessagesForPackageGeneration(
            fixtures,
            flightOffers,
            ENV.MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH,
            originIATACode
        );

        Logger.info(`💬 Prepared ${contextMessages.length} context messages for AI`);

        const {data: result, error} = await tryCatch(
            AIService.generateObject({
                schema: PackageArraySchema,
                saveOutputToFile: true,
                messages: contextMessages,
                noTokensLimit: true,
            })
        );

        if (!result || error) {
            return {error};
        }


        return {result};
    };


    private filterInvalidPackagesWithAI = async (packages: Package[]) => {
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
