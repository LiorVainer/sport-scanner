import { ExtendedFixtureItem } from '../models/fixture.model';
import { FlightSearchParams } from '../models/flights-search-params.model';
import moment from 'moment';
import { PackageGenerateParams } from '../models/package-generate-params.model';
import { AmadeusService } from '../services/amadeus.service';
import { calculateAdjustedPrice } from '../utils/price.utils';
import { AIService } from '../ai/ai.service';
import { FlightsService } from '../services/flight.service';

export const generateFlightSearchParams = async (
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
