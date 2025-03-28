import { ExtendedFixtureItem } from '../models/fixture.model';
import { FlightSearchParams } from '../models/flights-search-params.model';
import moment from 'moment';
import { PackageGenerateParams } from '../models/package-generate-params.model';
import { AmadeusService } from '../services/amadeus.service';
import { calculateAdjustedPrice } from '../utils/price.utils';
import { AIService } from '../ai/ai.service';
import { FlightsService } from '../services/flight.service';
import { CityToIATACodeMap } from '../models/iata.model';

export const generateAsyncFlightSearchParamsForOneFixture = async (
    fixture: ExtendedFixtureItem,
    generateParams: PackageGenerateParams
): Promise<FlightSearchParams> => {
    const baseDate = moment(fixture.fixture.date);

    const originCity = generateParams.originCity;
    const destinationCity = fixture.fixture.venue.city;

    const [origin, destination] = await Promise.all([
        FlightsService.getIATACodeByCity(originCity),
        FlightsService.getIATACodeByCity(destinationCity),
    ]);

    const minPrice = calculateAdjustedPrice(generateParams.price?.min, fixture.price?.min);
    const maxPrice = calculateAdjustedPrice(generateParams.price?.max, fixture.price?.min);

    if (!origin && !destination) {
        throw new Error(`Could not find IATA codes for cities: ${originCity}, ${destinationCity}`);
    }

    if (!origin) {
        throw new Error(`Could not find IATA code for city: ${originCity}`);
    }

    if (!destination) {
        throw new Error(`Could not find IATA code for city: ${destinationCity}`);
    }

    return {
        origin,
        destination,
        dateFrom: baseDate.clone().subtract(72, 'hours').format('YYYY-MM-DD'),
        dateTo: baseDate.clone().add(72, 'hours').format('YYYY-MM-DD'),
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
    const baseDate = moment(fixture.fixture.date);

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

    const minPrice = calculateAdjustedPrice(generateParams.price?.min, fixture.price?.min);
    const maxPrice = calculateAdjustedPrice(generateParams.price?.max, fixture.price?.min);

    return {
        origin,
        destination,
        dateFrom: baseDate.clone().subtract(72, 'hours').format('YYYY-MM-DD'),
        dateTo: baseDate.clone().add(72, 'hours').format('YYYY-MM-DD'),
        minPrice,
        maxPrice,
        adults: 1,
    };
};

export const generateFlightSearchParamsForFixtures = async (
    fixtures: ExtendedFixtureItem[],
    generateParams: PackageGenerateParams
): Promise<{ flightSearchParamsArray: FlightSearchParams[]; cityToIATACodeMap: CityToIATACodeMap }> => {
    const uniqueCities = [
        ...new Set([...fixtures.map((fixture) => fixture.fixture.venue.city), generateParams.originCity]),
    ];

    const cityToIATACodeMap = await FlightsService.getCityToIATACodeMap(uniqueCities);

    console.log(`City to IATA code map: ${JSON.stringify(cityToIATACodeMap)}`);

    const flightSearchParamsArray = fixtures.map((fixture) =>
        generateSyncFlightSearchParamsForOneFixture(fixture, generateParams, cityToIATACodeMap)
    );

    return { flightSearchParamsArray, cityToIATACodeMap };
};
