import { PackageGenerateParams } from '../models/package-generate-params.model';
import { soccerService } from './soccer.service';
import { convertPackageGenerateParamsToFixtureQueryParams } from '../converters/package-to-fixtures';
import { generateFlightSearchParams } from '../converters/fixtures-to-flights';
import { FixtureItem, FixtureItemWithPrice, FixturePriceRangeListSchema } from '../models/fixture.model';
import { AIService } from '../ai/ai.service';
import { generateUserMessageForFixturePriceMap } from '../ai/utils/fixture-to-system-messages';
import { AmadeusService } from './amadeus.service';
import { FlightSearchParams } from '../models/flights-search-params.model';
import { generateSystemMessageForPackageGeneration } from '../ai/utils/packages-generate-context-messages';
import { FlightOffer } from '../models/flight-offer.model';
import { Package, PackageArraySchema } from '../models/package.model';
import { ENV } from '../env/env.config';

class PackageService {
    generatePackage = async (packageSearchFilters: PackageGenerateParams) => {
        const fixturesQueryParams = convertPackageGenerateParamsToFixtureQueryParams(packageSearchFilters);
        const soccerFixtures = await soccerService.getFixtures(fixturesQueryParams);
        const soccerFixturesWithPriceRange = await this.getFixturesWithTicketPriceRange(soccerFixtures);

        const generateflightSearchParamsPromises = soccerFixturesWithPriceRange.map((fixture) =>
            generateFlightSearchParams(fixture, packageSearchFilters)
        );

        const flightSearchParamsArray: FlightSearchParams[] = await Promise.all(generateflightSearchParamsPromises);

        const flightOffersSearchPromises = flightSearchParamsArray.map((params) =>
            AmadeusService.searchFlights(params)
        );

        const flightOffersNested: FlightOffer[][] = await Promise.all(flightOffersSearchPromises);

        const allFlightOffers = flightOffersNested.flat();

        return this.generatePackageCombinations(soccerFixturesWithPriceRange, allFlightOffers);
    };

    private getFixturesWithTicketPriceRange = async (fixtures: FixtureItem[]): Promise<FixtureItemWithPrice[]> => {
        const priceRangeList = await AIService.generateObject({
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
        flightOffers: FlightOffer[]
    ): Promise<Package[]> => {
        const contextMessages = generateSystemMessageForPackageGeneration(
            fixtures,
            flightOffers,
            ENV.MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH
        );

        return await AIService.generateObject({
            schema: PackageArraySchema,
            saveOutputToFile: true,
            messages: contextMessages,
        });
    };
}

export const packageService = new PackageService();
