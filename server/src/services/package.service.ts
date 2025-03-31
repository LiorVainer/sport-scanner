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

class PackageService {
    generatePackage = async (packageSearchFilters: PackageGenerateParams) => {
        try {
            // Step 1: Convert the package search filters into fixture API query params
            const fixturesQueryParams = convertPackageGenerateParamsToFixtureQueryParams(packageSearchFilters);

            // Step 2: Fetch soccer fixtures matching the filters
            const soccerFixtures = await soccerService.getFixtures(fixturesQueryParams);

            // Step 3: Use AI to estimate ticket price range for each fixture
            const soccerFixturesWithPriceRange = await this.getFixturesWithTicketPriceRange(soccerFixtures);

            // Step 4: Generate all necessary flight search params per fixture
            const {flightSearchParamsArray, cityToIATACodeMap} = await generateFlightSearchParamsForFixtures(
                soccerFixturesWithPriceRange,
                packageSearchFilters
            );

            // Step 5: Call Amadeus API concurrently to search for flight offers
            const allFlightOffersResults = await Bluebird.map(
                flightSearchParamsArray,
                (params) => AmadeusService.searchFlights(params),
                {concurrency: ENV.FLIGHT_SEARCH_CONCURRENCY_LIMIT}
            );

            // Step 6: Flatten the results into a single array of flight offers
            const allFlightOffers = allFlightOffersResults.flat();

            // Step 7: Resolve user's origin IATA code for flight path validation later
            const originIataCode = cityToIATACodeMap[packageSearchFilters.originIATA];

            // Step 8: Generate package suggestions using AI
            const generatedPackages = await this.generatePackageCombinations(
                soccerFixturesWithPriceRange,
                allFlightOffers,
                originIataCode
            );

            // Step 9: Filter out invalid packages using AI validation
            return await this.filterInvalidPackages(generatedPackages);
        } catch (error) {
            console.error('Error in generatePackage:', error);
            return [];
        }
    };

    private getFixturesWithTicketPriceRange = async (fixtures: FixtureItem[]): Promise<FixtureItemWithPrice[]> => {
        const priceRangeList = await AIService.generateObject({
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
    ): Promise<Package[]> => {
        const contextMessages = generateContextMessagesForPackageGeneration(
            fixtures,
            flightOffers,
            ENV.MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH,
            originIATACode
        );

        return await AIService.generateObject({
            schema: PackageArraySchema,
            saveOutputToFile: true,
            messages: contextMessages,
            noTokensLimit: true,
        });
    };

    private filterInvalidPackages = async (packages: Package[]) => {
        const contextMessages = generateFilterInvalidPackagesMessages(packages);

        return await AIService.generateObject({
            schema: PackageArraySchema,
            saveOutputToFile: true,
            messages: contextMessages,
            noTokensLimit: true,
        });
    };
}

export const packageService = new PackageService();
