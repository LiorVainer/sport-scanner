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
    destination: string
): FlightSearchParams => {
    const baseDate = moment(fixture.fixture.date);

    const maxPrice = calculateAdjustedPrice(generateParams.price?.max, fixture.price?.min);

    return {
        origin,
        destination,
        dateFrom: baseDate.clone().subtract(ENV.FLIGHT_DATE_OFFSET_DAYS, 'days').format('YYYY-MM-DD'),
        dateTo: baseDate.clone().add(ENV.FLIGHT_DATE_OFFSET_DAYS, 'days').format('YYYY-MM-DD'),
        maxPrice,
        adults: 1,
    };
};

export const generateSyncFlightSearchParamsForOneFixture = (
    fixtureItem: ExtendedFixtureItem,
    generateParams: PackagesGenerationParams,
    iataCodesMap: CityToIATACodeMap
): FlightSearchParams => {
    const destinationCity = fixtureItem.fixture.venue.city;

    const origin = generateParams.originIATA;
    const destination = iataCodesMap[destinationCity];

    if (!destination) {
        throw new Error(`Could not find IATA code for city: ${destinationCity}`);
    }

    return buildFlightSearchParams(fixtureItem, generateParams, origin, destination);
};

export const generateFlightSearchParamsForFixtures = async (
    fixtures: ExtendedFixtureItem[],
    generateParams: PackagesGenerationParams
): Promise<{ flightSearchParamsArray: FlightSearchParams[]; cityToIATACodeMap: CityToIATACodeMap }> => {
    const uniqueCities = [...new Set([...fixtures.map((fixture) => fixture.fixture.venue.city)])];

    const cityToIATACodeMap = await FlightsService.getCityToIATACodeMap(uniqueCities);
    
    const flightSearchParamsArray = [
        ...fixtures.map((fixture) =>
            generateSyncFlightSearchParamsForOneFixture(fixture, generateParams, cityToIATACodeMap)
        ),
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
        (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );

    return sortedFixtures.flatMap((fromFixture, i) => {
        const toFixture = sortedFixtures[i + 1];
        if (!toFixture) return [];

        const fromCity = fromFixture.fixture.venue.city;
        const toCity = toFixture.fixture.venue.city;

        const fromIATA = cityToIATACodeMap[fromCity];
        const toIATA = cityToIATACodeMap[toCity];

        if (!fromIATA || !toIATA || fromIATA === toIATA) return [];

        return [buildFlightSearchParams(toFixture, generateParams, fromIATA, toIATA)];
    });
};


