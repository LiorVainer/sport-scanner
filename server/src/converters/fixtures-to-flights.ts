import {ExtendedFixtureItem} from '../models/fixture.model';
import {FlightSearchParams} from '../models/flights-search-params.model';
import moment from 'moment';
import {PackagesGenerationParams} from '../models/package-generate-params.model';
import {calculateAdjustedPrice} from '../utils/price.utils';
import {FlightsService} from '../services/flight.service';
import {CityToIATACodeMap} from '../models/iata.model';
import {ENV} from '../env/env.config';

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
    const safeDateFrom = calculatedDateFrom.isBefore(now)
        ? now.clone().add(2, 'hours')
        : calculatedDateFrom;

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
    iataCodesMap: CityToIATACodeMap,
    isRoundTrip: boolean = true,
): FlightSearchParams => {
    const destinationCity = fixtureItem.fixture.venue.city;

    const origin = generateParams.originIATA;
    const destination = iataCodesMap[destinationCity];

    if (!destination) {
        throw new Error(`Could not find IATA code for city: ${destinationCity}`);
    }

    return buildFlightSearchParams(fixtureItem, generateParams, origin, destination, isRoundTrip);
};

export const generateFlightSearchParamsForFixtures = async (
    fixtures: ExtendedFixtureItem[],
    generateParams: PackagesGenerationParams
): Promise<{ flightSearchParamsArray: FlightSearchParams[]; cityToIATACodeMap: CityToIATACodeMap }> => {
    const uniqueCities = [...new Set([...fixtures.map((fixture) => fixture.fixture.venue.city)])];

    const cityToIATACodeMap = await FlightsService.getCityToIATACodeMap(uniqueCities);

    const flightSearchParamsArray = [
        ...fixtures.map((fixture) =>
            [generateSyncFlightSearchParamsForOneFixture(fixture, generateParams, cityToIATACodeMap, true),
                generateSyncFlightSearchParamsForOneFixture(fixture, generateParams, cityToIATACodeMap, false)],
        ).flat(1),
        ...generateInterCityFlightParams(fixtures, generateParams, cityToIATACodeMap),
    ];

    return {flightSearchParamsArray, cityToIATACodeMap};
};

const generateInterCityFlightParams = (
    fixtures: ExtendedFixtureItem[],
    generateParams: PackagesGenerationParams,
    cityToIATACodeMap: CityToIATACodeMap
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

        const fromIATA = cityToIATACodeMap[fromCity];
        const toIATA = cityToIATACodeMap[toCity];

        if (!fromIATA || !toIATA || fromIATA === toIATA) return [];

        return [buildFlightSearchParams(toFixture, generateParams, fromIATA, toIATA, false)];
    });
};


