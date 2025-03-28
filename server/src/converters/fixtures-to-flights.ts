import { ExtendedFixtureItem } from '../models/fixture.model';
import { FlightSearchParams } from '../models/flights-search-params.model';
import moment from 'moment';
import { PackageGenerateParams } from '../models/package-generate-params.model';
import { AmadeusService } from '../services/amadeus.service';
import { calculateAdjustedPrice } from '../utils/price.utils';

export const generateFlightSearchParams = async (
    fixture: ExtendedFixtureItem,
    generateParams: PackageGenerateParams
): Promise<FlightSearchParams> => {
    const baseDate = moment(fixture.fixture.date);

    const originCity = generateParams.originCity;
    const destinationCity = fixture.fixture.venue.city;

    const [originResult, destination] = await Promise.all([
        AmadeusService.getIATACodeByCity(originCity).catch((err) => {
            console.error(`Failed to get IATA code for city: ${originCity}`, err);
            return null;
        }),
        AmadeusService.getIATACodeByCity(destinationCity),
    ]);

    const origin = originResult ?? 'TLV';

    const minPrice = calculateAdjustedPrice(generateParams.price?.min, fixture.price?.min);
    const maxPrice = calculateAdjustedPrice(generateParams.price?.max, fixture.price?.min);

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
