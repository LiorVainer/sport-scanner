import {PackageGenerateParams} from '../models/package-generate-params.model';
import {convertPackageGenerateParamsToFlightSearchParams} from "../converters/package-to-flights";
import {soccerService} from "./soccer.service";
import {convertPackageGenerateParamsToFixtureQueryParams} from "../converters/package-to-fixtures";
import {convertFixtureToFlightSearchParams} from "../converters/fixtures-to-flights";
import {ExtendedFixtureItem, FixtureItem} from "../models/fixture.model";
import {AIService} from "./ai.service";

class PackageService {
    generatePackage = async (packageSearchFilters: PackageGenerateParams) => {
        const fixturesQueryParams = convertPackageGenerateParamsToFixtureQueryParams(packageSearchFilters);
        const soccerFixtures = await soccerService.getFixtures(fixturesQueryParams);
        const soccerFixturesWithCountryCodes = await this.getFixturesWithCountryCodes(soccerFixtures);

        console.dir({soccerFixturesWithCountryCodes}, {depth: Infinity});

        const flightParamsFromGenerateParams = convertPackageGenerateParamsToFlightSearchParams(packageSearchFilters);
        const flightParamsFromSoccerFixtures = convertFixtureToFlightSearchParams(soccerFixtures[0]);

        console.log({flightParamsFromGenerateParams, flightParamsFromSoccerFixtures});

        const avgPriceForFixture = await AIService.generateObject(
            soccerFixturesWithCountryCodes[0],
            packageSearchFilters
        )


        // TODO: Implement flight search after soccer fixtures are fetched
        // const flightParams = convertPackageGenerateParamsToFlightSearchParams(packageSearchFilters);
        // const flightOffers = await AmadeusService.searchFlights(flightParams);

        return soccerFixtures;
    };

    getFixturesWithCountryCodes = async (fixtures: FixtureItem[]) => {
        const countries = await soccerService.getCountries();
        const countryNamesToCodesMap = countries.reduce((acc, country) => {
            acc[country.name] = country.code;
            return acc;
        }, {} as Record<string, string>);

        const extendedFixtures: ExtendedFixtureItem[] = fixtures.map((fixture) => {
            const homeCountryName = fixture.fixture.venue.country ?? fixture.teams.home.country ?? fixture.league.country

            return homeCountryName ? ({
                ...fixture,
                fixture: {
                    ...fixture.fixture,
                    countryCode: countryNamesToCodesMap[homeCountryName]
                }
            }) : fixture;
        });

        return extendedFixtures;
    }
}

export const packageService = new PackageService();
