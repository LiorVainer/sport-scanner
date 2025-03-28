import { PackageGenerateParams } from '../models/package-generate-params.model';
import { convertPackageGenerateParamsToFlightSearchParams } from '../converters/package-to-flights';
import { soccerService } from './soccer.service';
import { convertPackageGenerateParamsToFixtureQueryParams } from '../converters/package-to-fixtures';
import { convertFixtureToFlightSearchParams } from '../converters/fixtures-to-flights';
import { ExtendedFixtureItem, FixtureItem, FixturePriceRangeListSchema } from '../models/fixture.model';
import { AIService } from '../ai/ai.service';
import { PriceRangeSchema } from '../models/price-range.model';
import {
    generateSystemMessagesFromFixture,
    generateUserMessageForFixturePriceMap,
} from '../ai/utils/fixture-to-system-messages';
import { AmadeusService } from './amadeus.service';

class PackageService {
    generatePackage = async (packageSearchFilters: PackageGenerateParams) => {
        const fixturesQueryParams = convertPackageGenerateParamsToFixtureQueryParams(packageSearchFilters);
        const soccerFixtures = await soccerService.getFixtures(fixturesQueryParams);
        const soccerFixturesWithCountryCodes = await this.getFixturesWithCountryCodes(soccerFixtures);

        console.dir({ soccerFixturesWithCountryCodes }, { depth: Infinity });

        const flightParamsFromGenerateParams = convertPackageGenerateParamsToFlightSearchParams(packageSearchFilters);
        const flightParamsFromSoccerFixtures = convertFixtureToFlightSearchParams(soccerFixtures[0]);

        const extendedInfoFixtures = await this.getExtendedInfoFixtures(soccerFixturesWithCountryCodes);

        // TODO: Implement flight search after soccer fixtures are fetched
        const flightParams = convertPackageGenerateParamsToFlightSearchParams(packageSearchFilters);
        const flightOffers = await AmadeusService.searchFlights(flightParams);

        console.log({ flightOffers });

        return flightOffers;
    };

    getFixturesWithCountryCodes = async (fixtures: FixtureItem[]) => {
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

    getFixturesWithTicketPriceRange = async (fixtures: ExtendedFixtureItem[]) => {
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

    getExtendedInfoFixtures = async (fixtures: FixtureItem[]) => {
        const fixturesWithCountryCodes = await this.getFixturesWithCountryCodes(fixtures);
        return this.getFixturesWithTicketPriceRange(fixturesWithCountryCodes);
    };
}

export const packageService = new PackageService();
