import { ExtendedFixtureItem } from '../models/fixture.model';
import { FlightSearchParams } from '../models/flights-search-params.model';
import moment from 'moment';
import { PackageGenerateParams } from '../models/package-generate-params.model';
import { calculateAdjustedPrice } from '../utils/price.utils';
import { FlightsService } from '../services/flight.service';
import { CityToIATACodeMap } from '../models/iata.model';
import { ENV } from '../env/env.config';

// Shared logic to build search params once we have IATA codes
const buildFlightSearchParams = (
    fixture: ExtendedFixtureItem,
    generateParams: PackageGenerateParams,
    origin: string,
    destination: string
): FlightSearchParams => {
    const baseDate = moment(fixture.fixture.date);

    const minPrice = calculateAdjustedPrice(generateParams.price?.min, fixture.price?.min);
    const maxPrice = calculateAdjustedPrice(generateParams.price?.max, fixture.price?.min);

    return {
        origin,
        destination,
        dateFrom: baseDate.clone().subtract(ENV.FLIGHT_DATE_OFFSET_DAYS, 'days').format('YYYY-MM-DD'),
        dateTo: baseDate.clone().add(ENV.FLIGHT_DATE_OFFSET_DAYS, 'days').format('YYYY-MM-DD'),
        minPrice,
        maxPrice,
        adults: 1,
    };
};

export const generateSyncFlightSearchParamsForOneFixture = (
    fixture: ExtendedFixtureItem,
    generateParams: PackageGenerateParams,
    iataCodesMap: CityToIATACodeMap
): FlightSearchParams => {
    const originCity = generateParams.originCity;
    const destinationCity = fixture.fixture.venue.city;

    const origin = iataCodesMap[originCity];
    const destination = iataCodesMap[destinationCity];

    if (!origin && !destination) {
        throw new Error(`Could not find IATA codes for cities: ${originCity}, ${destinationCity}`);
    }

    if (!origin) {
        throw new Error(`Could not find IATA code for city: ${originCity}`);
    }

    if (!destination) {
        throw new Error(`Could not find IATA code for city: ${destinationCity}`);
    }

    return buildFlightSearchParams(fixture, generateParams, origin, destination);
};

export const generateFlightSearchParamsForFixtures = async (
    fixtures: ExtendedFixtureItem[],
    generateParams: PackageGenerateParams
): Promise<{ flightSearchParamsArray: FlightSearchParams[]; cityToIATACodeMap: CityToIATACodeMap }> => {
    const uniqueCities = [
        ...new Set([...fixtures.map((fixture) => fixture.fixture.venue.city), generateParams.originCity]),
    ];

    const cityToIATACodeMap = await FlightsService.getCityToIATACodeMap(uniqueCities);

    const flightSearchParamsArray = fixtures.map((fixture) =>
        generateSyncFlightSearchParamsForOneFixture(fixture, generateParams, cityToIATACodeMap)
    );

    return { flightSearchParamsArray, cityToIATACodeMap };
};
