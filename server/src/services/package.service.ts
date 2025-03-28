import { PackageGenerateParams } from '../models/package-generate-params.model';
import { convertPackageGenerateParamsToFlightSearchParams } from '../converters/package-to-flights';
import { soccerService } from './soccer.service';
import { convertPackageGenerateParamsToFixtureQueryParams } from '../converters/package-to-fixtures';
import { generateFlightSearchParams } from '../converters/fixtures-to-flights';
import { ExtendedFixtureItem, FixtureItem, FixturePriceRangeListSchema } from '../models/fixture.model';
import { AIService } from '../ai/ai.service';
import { PriceRangeSchema } from '../models/price-range.model';
import {
    generateSystemMessagesFromFixture,
    generateUserMessageForFixturePriceMap,
} from '../ai/utils/fixture-to-system-messages';
import { AmadeusService } from './amadeus.service';
import { FlightSearchParams } from '../models/flights-search-params.model';

class PackageService {
    generatePackage = async (packageSearchFilters: PackageGenerateParams) => {
        const fixturesQueryParams = convertPackageGenerateParamsToFixtureQueryParams(packageSearchFilters);
        const soccerFixtures = await soccerService.getFixtures(fixturesQueryParams);
        const extendedInfoFixtures = await this.getExtendedInfoFixtures(soccerFixtures);

        const generateflightSearchParamsPromises = extendedInfoFixtures.map((fixture) =>
            generateFlightSearchParams(fixture, packageSearchFilters)
        );

        const flightSearchParamsArray: FlightSearchParams[] = await Promise.all(generateflightSearchParamsPromises);

        const flightOffersSearchPromises = flightSearchParamsArray.map((params) =>
            AmadeusService.searchFlights(params)
        );

        const flightOffers = await Promise.all(flightOffersSearchPromises);

        return flightOffers;
    };

    private getFixturesWithTicketPriceRange = async (fixtures: FixtureItem[]) => {
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

    private getExtendedInfoFixtures = async (fixtures: FixtureItem[]) => this.getFixturesWithTicketPriceRange(fixtures);

    private getFixturesWithCountryCodes = async (fixtures: FixtureItem[]) => {
        const countries = await soccerService.getCountries();
        const countryNamesToCodesMap = countries.reduce(
            (acc, country) => {
                acc[country.name] = country.code;
                return acc;
            },
            {} as Record<string, string>
        );

        const extendedFixtures: ExtendedFixtureItem[] = fixtures.map((fixture) => {
            const homeCountryName =
                fixture.fixture.venue.country ?? fixture.teams.home.country ?? fixture.league.country;

            return homeCountryName
                ? {
                      ...fixture,
                      fixture: {
                          ...fixture.fixture,
                          venue: {
                              ...fixture.fixture.venue,
                              countryCode: countryNamesToCodesMap[homeCountryName],
                          },
                      },
                  }
                : fixture;
        });

        return extendedFixtures;
    };
}

export const packageService = new PackageService();
