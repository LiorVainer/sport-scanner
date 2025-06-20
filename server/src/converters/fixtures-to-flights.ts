import { ExtendedFixtureItem } from '../models/soccer/fixture.model';
import { FlightSearchParams } from '../models/flights/flights-search-params.model';
import { PackagesGenerationParams } from '../models/packages/package-generate-params.model';
import { FlightsService } from '../services/flight.service';
import { CityNameToCityMetadataCodeMap } from '../models/flights/iata.model';
import { calculateAdjustedPrice } from '../utils/price.utils';
import { ENV } from '../env/env.config';
import moment from 'moment';

// const buildFlightToFixtureSearchParams = (
//     fixture: ExtendedFixtureItem,
//     generateParams: PackagesGenerationParams,
//     origin: string,
//     destination: string,
//     isRoundTrip: boolean
// ): FlightSearchParams[] => {
//     const flightSearchParamsForFixture: FlightSearchParams[] = [];
//     const baseDate = moment(fixture.fixture.date);
//     const now = moment();
//
//     const calculatedDateFrom = baseDate.clone().subtract(ENV.FLIGHT_DATE_OFFSET_DAYS, 'days');
//     const safeDateFrom = calculatedDateFrom.isBefore(now) ? now.clone().add(2, 'hours') : calculatedDateFrom;
//
//     const maxPrice = calculateAdjustedPrice(generateParams.price?.max, fixture.price?.min);
//
//     flightSearchParamsForFixture.push({
//         origin,
//         destination,
//         dateFrom: safeDateFrom.format('YYYY-MM-DD'),
//         dateTo: baseDate.clone().add(ENV.FLIGHT_DATE_OFFSET_DAYS, 'days').format('YYYY-MM-DD'),
//         maxPrice,
//         isRoundTrip,
//         adults: 1,
//     });
//
//     return flightSearchParamsForFixture;
// };

const buildFlightToFixtureSearchParams = (
    fixture: ExtendedFixtureItem,
    generateParams: PackagesGenerationParams,
    origin: string,
    destination: string
): FlightSearchParams[] => {
    const flightSearchParams: FlightSearchParams[] = [];
    const fixtureDate = moment(fixture.fixture.date); // Match date
    const now = moment();

    const calculatedDateFrom = fixtureDate.clone().subtract(ENV?.FLIGHT_DATE_OFFSET_DAYS_BEFORE_FIXTURE, 'days');
    const safeDateFrom = calculatedDateFrom.isBefore(now) ? now.clone().add(2, 'hours') : calculatedDateFrom;

    const maxPrice = calculateAdjustedPrice(generateParams.price?.max, fixture.price?.min);

    let current = safeDateFrom.clone();

    while (current.isSameOrBefore(fixtureDate, 'day')) {
        flightSearchParams.push({
            origin,
            destination,
            dateFrom: current.format('YYYY-MM-DD'),
            dateTo: current.format('YYYY-MM-DD'),
            maxPrice,
            isRoundTrip: false,
            adults: 1,
        });
        current.add(1, 'days');
    }

    return flightSearchParams;
};

const buildFlightToHomeOriginSearchParams = (
    fixture: ExtendedFixtureItem,
    generateParams: PackagesGenerationParams,
    origin: string,
    destination: string
): FlightSearchParams[] => {
    const flightSearchParams: FlightSearchParams[] = [];
    const fixtureDate = moment(fixture.fixture.date);

    const maxPrice = calculateAdjustedPrice(generateParams.price?.max, fixture.price?.min);

    let current = fixtureDate.clone();
    const offsetFixtureDate = fixtureDate.add(ENV?.FLIGHT_DATE_OFFSET_DAYS_BACK_HOME, 'days');

    while (current.isSameOrBefore(offsetFixtureDate, 'day')) {
        flightSearchParams.push({
            origin,
            destination,
            dateFrom: current.format('YYYY-MM-DD'),
            dateTo: current.format('YYYY-MM-DD'),
            maxPrice,
            isRoundTrip: false,
            adults: 1,
        });
        current.add(1, 'days');
    }

    return flightSearchParams;
};

export const generateSyncFlightSearchParamsForOneFixture = (
    fixtureItem: ExtendedFixtureItem,
    generateParams: PackagesGenerationParams,
    iataCodesMap: CityNameToCityMetadataCodeMap
): FlightSearchParams[] => {
    const destinationCity = fixtureItem.fixture.venue.city;

    const origin = generateParams.originIATA;
    const destination = iataCodesMap[destinationCity].iataCode;

    if (!destination) {
        throw new Error(`Could not find IATA code for city: ${destinationCity}`);
    }

    return [
        ...buildFlightToFixtureSearchParams(fixtureItem, generateParams, origin, destination),
        ...buildFlightToHomeOriginSearchParams(fixtureItem, generateParams, destination, origin),
    ];
};

export const generateFlightSearchParamsForFixtures = async (
    fixtures: ExtendedFixtureItem[],
    generateParams: PackagesGenerationParams
) => {
    const uniqueCities = [
        ...new Set([...fixtures.map((fixture) => fixture.fixture.venue.city), generateParams.originIATA]),
    ];

    const { cityNameToCityMetadata, cityIataToCityMetadata } = await FlightsService.getCityToIATACodeMap(uniqueCities);

    const flightSearchParamsForHomeOrigin = fixtures
        .map((fixture) => generateSyncFlightSearchParamsForOneFixture(fixture, generateParams, cityNameToCityMetadata))
        .flat(1);

    const flightSearchParamsArray = [
        ...flightSearchParamsForHomeOrigin,
        ...generateInterCityFlightParams(fixtures, generateParams, cityNameToCityMetadata),
    ];

    console.warn(`Generated ${flightSearchParamsArray.length} flight search params for ${fixtures.length} fixtures.`);

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

        return [...buildFlightToFixtureSearchParams(toFixture, generateParams, fromIATA, toIATA)];
    });
};
