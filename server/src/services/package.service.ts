import {
    GeneratePackagesSteps,
    GeneratePackagesTimingStep,
    GeneratePackagesTimingSteps,
    PackagesGenerationParams,
} from '../models/package-generate-params.model';
import { ResponseError as AmadeusResponseError } from 'amadeus-ts';
import { soccerService } from './soccer.service';
import { convertPackageGenerateParamsToFixtureQueryParams } from '../converters/package-to-fixtures';
import { FixtureItem, FixtureItemWithPrice, FixturePriceRangeListSchema } from '../models/fixture.model';
import { AIService } from '../ai/ai.service';
import { AmadeusService } from './amadeus.service';
import {
    generateContextMessagesForPackageGeneration,
    generateFilterInvalidPackagesMessages,
} from '../ai/utils/packages-generate-context-messages';
import { FlightOffer } from '../models/flight-offer.model';
import { Package, PackageArraySchema } from '../models/package.model';
import { ENV } from '../env/env.config';
import Bluebird from 'bluebird';
import { Timer } from '../logs/timer';
import { LogLevels } from '../models/log.model';

import { tryCatch } from '../utils/try-catch.utils';
import { FlightSearchParams } from '../models/flights-search-params.model';
import { partitionPackagesByRules } from '../utils/package.utils';
import { generateUserMessageForFixturePriceMap } from '../ai/utils/fixture-to-system-messages';
import { generateFlightSearchParamsForFixtures } from '../converters/fixtures-to-flights';
import { packagesLogger } from '../logs/packages.logger';
import { PackageRepository } from '../repositories/package.repository';

class PackageService {
    generatePackage = async (params: PackagesGenerationParams, userId?: string) => {
        const timer = new Timer<GeneratePackagesTimingStep>();
        const flightSearchErrors: { params: FlightSearchParams; error: string }[] = [];

        packagesLogger.info(`📦 Generating package with params: ${JSON.stringify(params)}`);

        const fixtures = await this.fetchFixturesWithPrice(params, timer, userId);
        if (!fixtures) return [];

        const searchMeta = await this.generateFlightSearchMeta(fixtures, params, timer, userId);
        if (!searchMeta) return [];

        const { flightSearchParamsArray } = searchMeta;

        const allFlightOffers = await this.fetchFlights(flightSearchParamsArray, timer, flightSearchErrors);
        if (!allFlightOffers.length) return [];

        const generatedPackagesResponse = await this.callAiToGeneratePackages(
            fixtures,
            allFlightOffers,
            params,
            timer,
            userId
        );
        if (!generatedPackagesResponse) return [];

        const { result: generatedPackagesResult, contextMessages: aiContextMessages } = generatedPackagesResponse;

        const { valid: validPackages, invalid: invalidPackages } = await this.filterAiGeneratedPackagesByRules(
            generatedPackagesResult.data,
            params,
            timer
        );
        if (!validPackages) return [];

        if (invalidPackages.length > 0) {
            packagesLogger.warn(`⚠️ ${invalidPackages.length} invalid packages filtered out`, {
                invalidPackages,
                logId: 'invalid_packages',
            });
        }

        if (flightSearchErrors.length) {
            packagesLogger.warn(`⚠️ ${flightSearchErrors.length} flight searches failed`);
        }

        packagesLogger.structured({
            message: `🎉 Generated ${validPackages.length} valid packages in ${timer.total()}ms`,
            level: LogLevels.SUCCESS,
            step: GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES,
            executionTime: timer.total(),
            timings: timer.timings(),
            aiContextMessagesCount: aiContextMessages.length,
            aiContextMessages,
            flightsSearchRequestsParams: flightSearchParamsArray,
            flightsSearchRequestsCount: flightSearchParamsArray.length,
            fixturesCount: fixtures.length,
            fixtures,
            flightsCount: allFlightOffers.length,
            packagesGeneratedCount: generatedPackagesResult.data.length,
            packagesValidCount: validPackages.length,
            requestParams: params,
            errors: flightSearchErrors.length ? { flightSearchErrors } : undefined,
            aiTokensUsage: {
                packageGeneration: generatedPackagesResult.usage,
            },
            packagesGenerated: validPackages,
            userId,
        });

        return validPackages;
    };

    private async fetchFixturesWithPrice(
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>,
        userId?: string
    ) {
        packagesLogger.info(`🔍 Starting fixture search with filters: ${JSON.stringify(params)}`);

        timer.start(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS);
        const { data: queryParams, error: queryError } = await tryCatch(
            Promise.resolve(convertPackageGenerateParamsToFixtureQueryParams(params))
        );
        timer.stop(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS);

        packagesLogger.info(
            `⏱️ Query conversion took ${timer.stepDuration(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS)}ms`
        );

        if (!queryParams || queryError) {
            packagesLogger.stepError(GeneratePackagesSteps.GENERATE_SEARCH_FIXTURE_PARAMS, queryError, {
                requestParams: params,
                timings: timer.timings(),
                userId,
            });
            return null;
        }

        packagesLogger.info(`📡 Fetching fixtures with query: ${JSON.stringify(queryParams)}`);

        timer.start(GeneratePackagesTimingSteps.FETCH_FIXTURES);
        const { data: fixtures, error: fixturesError } = await tryCatch(soccerService.getFixtures(queryParams));
        timer.stop(GeneratePackagesTimingSteps.FETCH_FIXTURES);

        packagesLogger.info(
            `⏱️ Fetch fixtures took ${timer.stepDuration(GeneratePackagesTimingSteps.FETCH_FIXTURES)}ms`
        );

        if (!fixtures || fixturesError) {
            packagesLogger.stepError(GeneratePackagesSteps.FETCH_FIXTURES, fixturesError, {
                timings: timer.timings(),
                userId,
            });
            return null;
        }

        packagesLogger.info(`📅 Found ${fixtures.length} fixtures`);

        timer.start(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES);
        const { data: enriched, error: priceError } = await tryCatch(this.getFixturesWithTicketPriceRange(fixtures));
        timer.stop(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES);

        packagesLogger.info(
            `⏱️ Price enrichment took ${timer.stepDuration(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES)}ms`
        );

        if (!enriched || priceError) {
            packagesLogger.stepError(GeneratePackagesSteps.ADD_PRICE_RANGE_TO_FIXTURES, priceError, {
                fixturesCount: fixtures.length,
                timings: timer.timings(),
                userId,
            });
            return null;
        }

        packagesLogger.info(`💰 Fixtures enriched with price ranges`);
        return enriched;
    }

    private async generateFlightSearchMeta(
        fixtures: FixtureItemWithPrice[],
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>,
        userId?: string
    ) {
        timer.start(GeneratePackagesTimingSteps.GENERATE_SEARCH_PARAMS);
        const { data, error } = await tryCatch(generateFlightSearchParamsForFixtures(fixtures, params));
        timer.stop(GeneratePackagesTimingSteps.GENERATE_SEARCH_PARAMS);

        if (!data || error) {
            packagesLogger.stepError(GeneratePackagesSteps.GENERATE_SEARCH_PARAMS, error, {
                timings: timer.timings(),
                userId,
            });
            return null;
        }

        packagesLogger.info('📅 Generated flight search params', {
            flightSearchParams: data.flightSearchParamsArray,
            fixturesCount: fixtures.length,
        });

        return data;
    }

    private async fetchFlights(
        flightSearchParamsArray: FlightSearchParams[],
        timer: Timer<GeneratePackagesTimingStep>,
        flightSearchErrors: { params: FlightSearchParams; error: any }[]
    ) {
        packagesLogger.info(`🛫 Starting flight search for ${flightSearchParamsArray.length} requests`);

        flightSearchParamsArray.forEach((params) => {
            packagesLogger.info(
                `🔍 Preparing flight search for ${params.origin} -> ${params.destination} from ${params.dateFrom} to ${params.dateTo} (Round Trip: ${params.isRoundTrip})`
            );
        });

        timer.start(GeneratePackagesTimingSteps.SEARCH_FLIGHTS);

        const results = await Bluebird.map(
            flightSearchParamsArray,
            async (params) => await this.fetchFlightsForParams(params, flightSearchErrors),
            { concurrency: ENV.FLIGHT_SEARCH_CONCURRENCY_LIMIT }
        );

        timer.stop(GeneratePackagesTimingSteps.SEARCH_FLIGHTS);

        const allOffers = results.flat();
        const unique = new Map<string, FlightOffer[]>();

        allOffers.forEach((offer) => {
            const key = `${offer.itineraries[0].segments[0].departure.iataCode}-${offer.itineraries[0].segments.at(-1)?.arrival.iataCode}`;
            if (!unique.has(key)) unique.set(key, []);
            unique.get(key)?.push(offer);
        });

        const uniqueOffers = Array.from(unique.values()).flat();

        packagesLogger.info(`✈️ Flight search complete. Fetched ${uniqueOffers.length} unique offers`, {
            allFlightOffers: allOffers,
            uniqueFlightOffers: uniqueOffers,
        });

        packagesLogger.info(
            `⏱️ Flight search took ${timer.stepDuration(GeneratePackagesTimingSteps.SEARCH_FLIGHTS)}ms`
        );

        return uniqueOffers;
    }

    private async fetchFlightsForParams(
        params: FlightSearchParams,
        flightSearchErrors: { params: FlightSearchParams; error: any }[]
    ): Promise<FlightOffer[]> {
        packagesLogger.info(
            `🔍 Searching flights for ${params.origin} -> ${params.destination} from ${params.dateFrom} to ${params.dateTo} (Round Trip: ${params.isRoundTrip})`,
            { searchParams: params }
        );

        const { data: flightOffers, error } = await tryCatch<FlightOffer[] | undefined, AmadeusResponseError>(
            AmadeusService.searchFlights(params)
        );

        if (error || !flightOffers) {
            packagesLogger.warn(
                `❌ Error fetching flights for ${params.origin} → ${params.destination} on ${params.dateFrom}: ${error?.description?.[0]?.detail}`,
                {
                    error: error?.description?.[0]?.detail,
                    searchParams: params,
                }
            );
            flightSearchErrors.push({ params, error });
            return [];
        }

        if (!flightOffers.length) {
            packagesLogger.warn(
                `❌ No flight offers found for ${params.origin} -> ${params.destination} on ${params.dateFrom}`,
                {
                    searchParams: params,
                }
            );
        }

        packagesLogger.info(
            `✈️ Found ${flightOffers.length} flight offers for ${params.origin} -> ${params.destination} from ${params.dateFrom} to ${params.dateTo} (Round Trip: ${params.isRoundTrip})`,
            {
                flightOffers,
                searchParams: params,
            }
        );

        return flightOffers;
    }

    private async callAiToGeneratePackages(
        fixtures: FixtureItemWithPrice[],
        flightOffers: FlightOffer[],
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>,
        userId?: string
    ) {
        packagesLogger.info(`🧠 Generating packages from ${fixtures.length} fixtures & ${flightOffers.length} flights`);

        timer.start(GeneratePackagesTimingSteps.GENERATE_PACKAGES);

        const { result, contextMessages, error } = await this.generatePackageCombinations(
            fixtures,
            flightOffers,
            params.originIATA
        );
        timer.stop(GeneratePackagesTimingSteps.GENERATE_PACKAGES);

        packagesLogger.info(
            `⏱️ Packages generation took ${timer.stepDuration(GeneratePackagesTimingSteps.GENERATE_PACKAGES)}ms`
        );

        if (error) {
            packagesLogger.stepError(GeneratePackagesSteps.GENERATE_PACKAGES, error, {
                flightsCount: flightOffers.length,
                timings: timer.timings(),
                userId,
            });
            return null;
        }

        packagesLogger.info(`📊 Tokens used in request (prompt): ${result.usage.promptTokens}`);
        packagesLogger.info(`📊 Tokens used in response (completion): ${result.usage.completionTokens}`);
        packagesLogger.info(`📦 AI returned ${result.data.length} packages`);

        return { result, contextMessages };
    }

    private async filterAiGeneratedPackagesByRules(
        packages: Package[],
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>
    ) {
        packagesLogger.info(`🧪 Validating ${packages.length} packages by hardcoded rules`);

        timer.start(GeneratePackagesTimingSteps.FILTER_PACKAGES);
        const partitionPackages = partitionPackagesByRules(packages, params.originIATA);
        timer.stop(GeneratePackagesTimingSteps.FILTER_PACKAGES);

        packagesLogger.info(`✅ ${partitionPackages.valid.length} packages passed rule-based validation`);
        packagesLogger.info(`⏱️ Filter step took ${timer.stepDuration(GeneratePackagesTimingSteps.FILTER_PACKAGES)}ms`);

        return partitionPackages;
    }

    private getFixturesWithTicketPriceRange = async (fixtures: FixtureItem[]): Promise<FixtureItemWithPrice[]> => {
        const { data: priceRangeList } = await AIService.generateObject({
            schema: FixturePriceRangeListSchema,
            saveOutputToFile: true,
            messages: generateUserMessageForFixturePriceMap(fixtures),
        });

        const priceMap = Object.fromEntries(priceRangeList.map(({ id, ...rest }) => [id, rest]));

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

        packagesLogger.info(`💬 Prepared ${contextMessages.length} context messages for AI`);

        const { data: result, error } = await tryCatch(
            AIService.generateObject({
                schema: PackageArraySchema,
                saveOutputToFile: true,
                messages: contextMessages,
                noTokensLimit: true,
            })
        );

        if (!result || error) return { error };

        return { result, contextMessages };
    };

    private filterInvalidPackagesWithAI = async (packages: Package[]) => {
        const contextMessages = generateFilterInvalidPackagesMessages(packages);

        const { data: result, error } = await tryCatch(
            AIService.generateObject({
                schema: PackageArraySchema,
                saveOutputToFile: true,
                messages: contextMessages,
                noTokensLimit: true,
            })
        );

        if (!result || error) {
            packagesLogger.error(`❌ Error filtering invalid packages: ${error.message}`);
            return { error };
        }

        packagesLogger.info(
            `🧠 AI used ${result.usage.completionTokens} tokens for ${result.data.length} valid packages`
        );

        return { result };
    };
}

export const packageService = new PackageService();
