import {
    PackagesGenerationParams,
    PackagesGenerationParamsFromFreeTextSchema,
} from '../models/packages/package-generate-params.model';
// @ts-ignore
import { ResponseError as AmadeusResponseError } from 'amadeus-ts';
import { soccerService } from './soccer.service';
import { convertPackageGenerateParamsToFixturesSearchQueryParams } from '../converters/package-to-fixtures';
import { ExtendedFixtureItem, FixtureItem, FixturePriceRangeListSchema } from '../models/soccer/fixture.model';
import { AIService } from '../ai/ai.service';
import { AmadeusService } from './amadeus.service';
import { FlightOffer } from '../models/flights/flight-offer.model';
import { Package, PackageArraySchema } from '../models/packages/package.model';
import { ENV } from '../env/env.config';
import Bluebird from 'bluebird';
import { Timer } from '../logs/timer';

import { tryCatch } from '../utils/try-catch.utils';
import { FlightSearchParams } from '../models/flights/flights-search-params.model';
import {
    fixDateGaps,
    packageToPackageWithMetadata,
    partitionPackagesByRules,
    withTotalPriceMin,
} from '../utils/package.utils';
import { generateFlightSearchParamsForFixtures } from '../converters/fixtures-to-flights';
import { packagesLogger } from '../logs/packages.logger';
import { PackagesGenerationProgressUpdate } from '../models/packages/package-generation-progress-update.model';
import { GeneratePackagesSteps } from '../models/packages/packages-generate-steps.model';
import {
    GeneratePackagesTimingStep,
    GeneratePackagesTimingSteps,
} from '../models/packages/packages-generate-timings.model';
import { LogLevels } from '../models/log.model';
import { PackagesContextMessagesGenerator } from '../ai/messages/package.message';
import { FixtureContextMessagesGenerator } from '../ai/messages/fixture.message';

export type GeneratePackagesParams = {
    searchParams: PackagesGenerationParams;
    emit?: (update: PackagesGenerationProgressUpdate) => void;
    maxAmountOfPackages?: number;
};

class PackageService {
    generatePackages = async ({
        searchParams,
        maxAmountOfPackages = ENV?.MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH,
        emit,
    }: GeneratePackagesParams): Promise<Package[]> => {
        const timer = new Timer<GeneratePackagesTimingStep>();
        const flightSearchErrors: { params: FlightSearchParams; error: string }[] = [];

        packagesLogger.info(`📦 Generating package with params: ${JSON.stringify(searchParams)}`);
        emit?.({
            step: GeneratePackagesSteps.GENERATE_SEARCH_FIXTURE_PARAMS,
            message: 'Creating fixture search params...',
            dateRange: searchParams.date,
        });

        const fixtures = await this.fetchFixturesWithPrice(searchParams, timer, emit);
        if (!fixtures) return [];

        emit?.({
            step: GeneratePackagesSteps.GENERATE_SEARCH_PARAMS,
            message: 'Generating flight search parameters...',
        });

        const searchMeta = await this.generateFlightSearchMeta(fixtures, searchParams, timer);
        if (!searchMeta) return [];

        const { flightSearchParamsArray, cityIataToCityMetadata } = searchMeta;

        emit?.({
            step: GeneratePackagesSteps.SEARCH_FLIGHTS,
            message: `Searching flights (${flightSearchParamsArray.length} requests)...`,
            flightOffersSearchesParams: flightSearchParamsArray,
            cityIataToCityMetadata,
        });

        const allFlightOffers = await this.fetchFlights(flightSearchParamsArray, timer, flightSearchErrors);
        if (!allFlightOffers.length) {
            packagesLogger.error('❌ No flight offers found');
            emit?.({
                step: 'error',
                message: '❌ No flight offers found',
            });
            return [];
        }

        emit?.({
            step: GeneratePackagesSteps.FOUND_FLIGHTS,
            message: `Found ${allFlightOffers.length} flight offers.`,
            totalOffers: allFlightOffers.length,
        });

        emit?.({
            step: GeneratePackagesSteps.GENERATE_PACKAGES,
            message: 'Generating packages...',
        });

        const generatedPackagesResponse = await this.callAiToGeneratePackages(
            fixtures,
            allFlightOffers,
            searchParams,
            timer,
            maxAmountOfPackages
        );

        if (!generatedPackagesResponse) {
            packagesLogger.error('❌ Error generating packages');
            emit?.({
                step: 'error',
                message: '❌ Error generating packages',
            });
            return [];
        }

        const { result: generatedPackagesResult, contextMessages } = generatedPackagesResponse;
        const rawPackages = generatedPackagesResult.data;

        const noGapsPackages = rawPackages.map(fixDateGaps);

        emit?.({
            step: GeneratePackagesSteps.AI_GENERATED_PACKAGES,
            message: `AI generated ${noGapsPackages.length} packages.`,
            aiGeneratedCount: noGapsPackages.length,
        });

        emit?.({
            step: GeneratePackagesSteps.FILTER_PACKAGES,
            message: 'Filtering packages...',
        });

        const { valid: validPackages, invalid: invalidPackages } = await this.filterAiGeneratedPackagesByRules(
            noGapsPackages,
            searchParams,
            timer
        );

        if (!validPackages) {
            packagesLogger.error(`❌ Error filtering packages`, { invalidPackages });
            emit?.({
                step: 'error',
                message: '❌ Error filtering packages',
            });
            return [];
        }

        if (invalidPackages.length > 0) {
            packagesLogger.warn(`⚠️ ${invalidPackages.length} packages were filtered out`, {
                invalidPackages,
                logId: 'invalid_packages',
            });
            emit?.({
                step: GeneratePackagesSteps.INVALID_PACKAGES_FILTERED,
                message: `⚠️ Filtered out ${invalidPackages.length} invalid packages.`,
                filteredCount: invalidPackages.length,
            });
        }

        const validPackagesWithMetadata = await this.generateMetadataForGeneratedPackages(validPackages, timer, emit);
        const fixedValidMinPricePackages = validPackagesWithMetadata.map(withTotalPriceMin);

        if (flightSearchErrors.length) {
            packagesLogger.warn(`⚠️ ${flightSearchErrors.length} flight searches failed`, { flightSearchErrors });
        }

        emit?.({
            step: GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES,
            message: `✅ Finished generating ${fixedValidMinPricePackages.length} valid packages.`,
            packages: fixedValidMinPricePackages,
            durationMs: timer.total(),
        });

        packagesLogger.structured({
            message: `🎉 Generated ${validPackages.length} valid packages in ${timer.total()}ms`,
            level: LogLevels.SUCCESS,
            step: GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES,
            executionTime: timer.total(),
            timings: timer.timings(),
            aiContextMessagesCount: contextMessages.length,
            aiContextMessages: contextMessages,
            flightsSearchRequestsParams: flightSearchParamsArray,
            flightsSearchRequestsCount: flightSearchParamsArray.length,
            fixturesCount: fixtures.length,
            fixtures,
            flightsCount: allFlightOffers.length,
            packagesGeneratedCount: generatedPackagesResult.data.length,
            packagesValidCount: fixedValidMinPricePackages.length,
            requestParams: searchParams,
            errors: flightSearchErrors.length ? { flightSearchErrors } : undefined,
            aiTokensUsage: {
                packageGeneration: generatedPackagesResult.usage,
            },
            packagesGenerated: fixedValidMinPricePackages,
        });

        return fixedValidMinPricePackages;
    };

    transformFreeTextIntoPackagesGenerationParams = async (freeText: string) => {
        const { data } = await AIService.generateObject({
            schema: PackagesGenerationParamsFromFreeTextSchema,
            saveOutputToFile: true,
            messages: PackagesContextMessagesGenerator.createWithFreeText(freeText),
            noTokensLimit: true,
        });

        const { league, teams, ...rest } = data;
        const result = await soccerService.transformFieldsToActualGenerationParams({ league, teams });

        return { ...result, ...rest };
    };

    private generateMetadataForGeneratedPackages = async (
        packages: Package[],
        timer: Timer<GeneratePackagesTimingStep>,
        emit?: (update: PackagesGenerationProgressUpdate) => void
    ) => {
        packagesLogger.info(`📦 Generating metadata for ${packages.length} packages`, { packages });
        timer.start(GeneratePackagesTimingSteps.GENERATING_PACKAGES_METADATA);
        const packagesWithMetadata = packages.map(packageToPackageWithMetadata);
        timer.stop(GeneratePackagesTimingSteps.GENERATING_PACKAGES_METADATA);

        emit?.({
            step: GeneratePackagesSteps.GENERATING_PACKAGES_METADATA,
            message: `Generated metadata for ${packagesWithMetadata.length} packages.`,
        });

        packagesLogger.info(`✅ Finished Generating metadata for ${packagesWithMetadata.length} packages`, {
            packagesWithMetadata,
            duration: timer.stepDuration(GeneratePackagesTimingSteps.GENERATING_PACKAGES_METADATA),
        });

        return packagesWithMetadata;
    };

    private async fetchFixturesWithPrice(
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>,
        emit?: (update: PackagesGenerationProgressUpdate) => void
    ): Promise<ExtendedFixtureItem[] | null> {
        packagesLogger.info(`🔍 Starting fixture search with filters: ${JSON.stringify(params)}`);

        timer.start(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS);
        const { data: fixturesSearchQueryParamsArray, error: conversionError } = await tryCatch(
            Promise.resolve(convertPackageGenerateParamsToFixturesSearchQueryParams(params))
        );
        timer.stop(GeneratePackagesTimingSteps.GENERATE_SEARCH_FIXTURE_PARAMS);

        if (!fixturesSearchQueryParamsArray || conversionError) {
            packagesLogger.stepError(GeneratePackagesSteps.GENERATE_SEARCH_FIXTURE_PARAMS, conversionError, {
                requestParams: params,
                timings: timer.timings(),
            });
            return null;
        }

        packagesLogger.info(`📡 Fetching fixtures with ${fixturesSearchQueryParamsArray.length} search queries`);
        emit?.({
            step: GeneratePackagesSteps.FETCH_FIXTURES,
            message: 'Fetching fixtures...',
            fixturesSearchQueryParamsArray,
        });

        timer.start(GeneratePackagesTimingSteps.FETCH_FIXTURES);

        const results = await Bluebird.map(
            fixturesSearchQueryParamsArray,
            async (queryParams) => {
                const { data: fixtures, error } = await tryCatch(soccerService.getFixtures(queryParams));
                if (error) {
                    packagesLogger.warn(`⚠️ Error fetching fixtures with query: ${JSON.stringify(queryParams)}`, {
                        error,
                    });
                    return [];
                }
                return fixtures ?? [];
            },
            { concurrency: ENV.FIXTURE_SEARCH_CONCURRENCY_LIMIT || 3 }
        );

        timer.stop(GeneratePackagesTimingSteps.FETCH_FIXTURES);

        const allFixtures = results.flat();
        const uniqueFixturesMap = new Map<number, FixtureItem>();
        allFixtures.forEach((fixture) => uniqueFixturesMap.set(fixture.fixture.id, fixture));
        const uniqueFixtures = Array.from(uniqueFixturesMap.values());

        packagesLogger.info(`📅 Found ${uniqueFixtures.length} unique fixtures`);
        emit?.({
            step: GeneratePackagesSteps.FOUND_FIXTURES,
            message: `Found ${uniqueFixtures.length} fixtures.`,
            fixtures: uniqueFixtures,
        });

        timer.start(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES);
        const { data: enriched, error: priceError } = await tryCatch(
            this.getFixturesWithTicketPriceRange(uniqueFixtures)
        );
        timer.stop(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES);

        if (!enriched || priceError) {
            packagesLogger.stepError(GeneratePackagesSteps.ADD_PRICE_RANGE_TO_FIXTURES, priceError, {
                fixturesCount: uniqueFixtures.length,
                timings: timer.timings(),
            });
            return null;
        }

        packagesLogger.info(`💰 Fixtures enriched with price ranges`, {
            fixturesWithPriceRange: enriched,
            duration: timer.stepDuration(GeneratePackagesTimingSteps.ADD_PRICE_RANGE_TO_FIXTURES),
        });
        emit?.({
            step: GeneratePackagesSteps.ADD_PRICE_RANGE_TO_FIXTURES,
            message: `Enriched fixtures with price ranges.`,
            fixtures: enriched,
        });

        return enriched;
    }

    private async generateFlightSearchMeta(
        fixtures: ExtendedFixtureItem[],
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>
    ) {
        timer.start(GeneratePackagesTimingSteps.GENERATE_SEARCH_PARAMS);
        const { data, error } = await tryCatch(generateFlightSearchParamsForFixtures(fixtures, params));
        timer.stop(GeneratePackagesTimingSteps.GENERATE_SEARCH_PARAMS);

        if (!data || error) {
            packagesLogger.stepError(GeneratePackagesSteps.GENERATE_SEARCH_PARAMS, error, {
                timings: timer.timings(),
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

        packagesLogger.info(`✈️ Flight offers search complete. Fetched ${uniqueOffers.length} unique offers`, {
            allFlightOffers: allOffers,
            uniqueFlightOffers: uniqueOffers,
        });

        packagesLogger.info(
            `⏱️ Flight offers search took ${timer.stepDuration(GeneratePackagesTimingSteps.SEARCH_FLIGHTS)}ms`
        );

        return uniqueOffers;
    }

    private async fetchFlightsForParams(
        params: FlightSearchParams,
        flightSearchErrors: { params: FlightSearchParams; error: any }[]
    ): Promise<FlightOffer[]> {
        packagesLogger.info(
            `🔍 Searching flights offers for ${params.origin} -> ${params.destination} from ${params.dateFrom} to ${params.dateTo} (Round Trip: ${params.isRoundTrip})`,
            { searchParams: params }
        );

        const { data: flightOffers, error } = await tryCatch<FlightOffer[] | undefined, AmadeusResponseError>(
            AmadeusService.searchFlights(params)
        );

        if (error || !flightOffers) {
            packagesLogger.warn(
                `❌ Error fetching flight offers for ${params.origin} → ${params.destination} on ${params.dateFrom}: ${error?.description?.[0]?.detail}`,
                {
                    error: error,
                    searchParams: params,
                }
            );
            flightSearchErrors.push({ params, error });
            return [];
        }

        if (!flightOffers.length) {
            packagesLogger.warn(
                `❌ No flight offers found for ${params.origin} -> ${params.destination} from ${params.dateFrom} to ${params.dateTo} (Round Trip: ${params.isRoundTrip})`,
                {
                    searchParams: params,
                }
            );
        } else {
            packagesLogger.info(
                `✈️ Found ${flightOffers.length} flight offers for ${params.origin} -> ${params.destination} from ${params.dateFrom} to ${params.dateTo} (Round Trip: ${params.isRoundTrip})`,
                {
                    flightOffers,
                    searchParams: params,
                }
            );
        }

        return flightOffers;
    }

    private async callAiToGeneratePackages(
        fixtures: ExtendedFixtureItem[],
        flightOffers: FlightOffer[],
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>,
        maxAmountOfPackages?: number
    ) {
        packagesLogger.info(`🧠 Generating packages from ${fixtures.length} fixtures & ${flightOffers.length} flights`);

        timer.start(GeneratePackagesTimingSteps.GENERATE_PACKAGES);

        const { result, contextMessages, error } = await this.generatePackageCombinations(
            fixtures,
            flightOffers,
            params.originIATA,
            maxAmountOfPackages
        );
        timer.stop(GeneratePackagesTimingSteps.GENERATE_PACKAGES);

        packagesLogger.info(
            `⏱️ Packages generation took ${timer.stepDuration(GeneratePackagesTimingSteps.GENERATE_PACKAGES)}ms`
        );

        if (error) {
            packagesLogger.stepError(GeneratePackagesSteps.GENERATE_PACKAGES, error, {
                flightsCount: flightOffers.length,
                timings: timer.timings(),
            });
            return null;
        }

        packagesLogger.info(`📊 Tokens used in request (prompt): ${result.usage.promptTokens}`);
        packagesLogger.info(`📊 Tokens used in response (completion): ${result.usage.completionTokens}`);
        packagesLogger.info(`📦 AI returned ${result.data.length} packages`, { packages: result.data });

        return { result, contextMessages };
    }

    private async filterAiGeneratedPackagesByRules(
        packages: Package[],
        params: PackagesGenerationParams,
        timer: Timer<GeneratePackagesTimingStep>
    ) {
        packagesLogger.info(`🧪 Validating ${packages.length} packages by hardcoded rules`, { packages });

        timer.start(GeneratePackagesTimingSteps.FILTER_PACKAGES);
        const partitionPackages = partitionPackagesByRules(packages, params.originIATA);
        timer.stop(GeneratePackagesTimingSteps.FILTER_PACKAGES);

        packagesLogger.info(`✅ ${partitionPackages.valid.length} packages passed rule-based validation`);
        packagesLogger.info(`⏱️ Filter step took ${timer.stepDuration(GeneratePackagesTimingSteps.FILTER_PACKAGES)}ms`);

        return partitionPackages;
    }

    private getFixturesWithTicketPriceRange = async (fixtures: FixtureItem[]): Promise<ExtendedFixtureItem[]> => {
        const { data: priceRangeList } = await AIService.generateObject({
            schema: FixturePriceRangeListSchema,
            saveOutputToFile: true,
            messages: FixtureContextMessagesGenerator.priceMapGenerationContext(fixtures),
            noTokensLimit: true,
        });

        const priceMap = Object.fromEntries(priceRangeList.map(({ id, ...rest }) => [id, rest]));

        return fixtures.map((fixture) => ({
            ...fixture,
            price: priceMap[fixture.fixture.id.toString()],
        }));
    };

    private generatePackageCombinations = async (
        fixtures: ExtendedFixtureItem[],
        flightOffers: FlightOffer[],
        originIATACode: string,
        maxAmountOfPackages: number = ENV.MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH
    ) => {
        const contextMessages = PackagesContextMessagesGenerator.create(
            fixtures,
            flightOffers,
            maxAmountOfPackages,
            originIATACode
        );

        packagesLogger.info(`💬 Prepared ${contextMessages.length} context messages for AI`, { contextMessages });

        packagesLogger.info(`📦 Sending Context Messages to AI for Package Generation and waiting for response...`);

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
}

export const packageService = new PackageService();
