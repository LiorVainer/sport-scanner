import { ExtendedFixtureItem } from '../models/soccer/fixture.model';
import { FlightSearchParams } from '../models/flights/flights-search-params.model';
import moment from 'moment';
import { PackagesGenerationParams } from '../models/packages/package-generate-params.model';
import { calculateAdjustedPrice } from '../utils/price.utils';
import { FlightsService } from '../services/flight.service';
import { CityNameToCityMetadataCodeMap } from '../models/flights/iata.model';
import { ENV } from '../env/env.config';

const buildFlightSearchParams = (
    fixture: ExtendedFixtureItem,
    generateParams: PackagesGenerationParams,
    origin: string,
    destination: string,
    isRoundTrip: boolean
): FlightSearchParams => {
    const baseDate = moment(fixture.fixture.date);
    const now = moment();

    const calculatedDateFrom = baseDate.clone().subtract(ENV.FLIGHT_DATE_OFFSET_DAYS, 'days');
    const safeDateFrom = calculatedDateFrom.isBefore(now) ? now.clone().add(2, 'hours') : calculatedDateFrom;

    const maxPrice = calculateAdjustedPrice(generateParams.price?.max, fixture.price?.min);

    return {
        origin,
        destination,
        dateFrom: safeDateFrom.format('YYYY-MM-DD'),
        dateTo: baseDate.clone().add(ENV.FLIGHT_DATE_OFFSET_DAYS, 'days').format('YYYY-MM-DD'),
        maxPrice,
        isRoundTrip,
        adults: 1,
    };
};

export const generateSyncFlightSearchParamsForOneFixture = (
    fixtureItem: ExtendedFixtureItem,
    generateParams: PackagesGenerationParams,
    iataCodesMap: CityNameToCityMetadataCodeMap,
    isRoundTrip: boolean = true
): FlightSearchParams => {
    const destinationCity = fixtureItem.fixture.venue.city;

    const origin = generateParams.originIATA;
    const destination = iataCodesMap[destinationCity].iataCode;

    if (!destination) {
        throw new Error(`Could not find IATA code for city: ${destinationCity}`);
    }

    return buildFlightSearchParams(fixtureItem, generateParams, origin, destination, isRoundTrip);
};

export const generateFlightSearchParamsForFixtures = async (
    fixtures: ExtendedFixtureItem[],
    generateParams: PackagesGenerationParams
) => {
    const uniqueCities = [
        ...new Set([...fixtures.map((fixture) => fixture.fixture.venue.city), generateParams.originIATA]),
    ];

    const { cityNameToCityMetadata, cityIataToCityMetadata } = await FlightsService.getCityToIATACodeMap(uniqueCities);

    const flightSearchParamsArray = [
        ...fixtures
            .map((fixture) => [
                generateSyncFlightSearchParamsForOneFixture(fixture, generateParams, cityNameToCityMetadata, true),
                generateSyncFlightSearchParamsForOneFixture(fixture, generateParams, cityNameToCityMetadata, false),
            ])
            .flat(1),
        ...generateInterCityFlightParams(fixtures, generateParams, cityNameToCityMetadata),
    ];

    return { flightSearchParamsArray, cityNameToCityMetadata, cityIataToCityMetadata };
};

const generateInterCityFlightParams = (
    fixtures: ExtendedFixtureItem[],
    generateParams: PackagesGenerationParams,
    cityToIATACodeMap: CityNameToCityMetadataCodeMap
): FlightSearchParams[] => {
    const sortedFixtures = [...fixtures].sort(
        (fixture, anotherFixture) =>
            new Date(fixture.fixture.date).getTime() - new Date(anotherFixture.fixture.date).getTime()
    );

    return sortedFixtures.flatMap((fromFixture, i) => {
        const toFixture = sortedFixtures[i + 1];
        if (!toFixture) return [];

        const fromCity = fromFixture.fixture.venue.city;
        const toCity = toFixture.fixture.venue.city;

        const fromIATA = cityToIATACodeMap[fromCity].iataCode;
        const toIATA = cityToIATACodeMap[toCity].iataCode;

        if (!fromIATA || !toIATA || fromIATA === toIATA) return [];

        return [buildFlightSearchParams(toFixture, generateParams, fromIATA, toIATA, false)];
    });
};
