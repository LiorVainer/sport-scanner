import { PackageSearchFilters } from '../models/package-search-filters.model';
import { AmadeusService } from './amadeus.service';

class PackageService {
    generatePackage = async (packageSearchFilters: PackageSearchFilters) => {
        const flightParams = {
            origin: 'LHR', // example default or inferred origin
            destination: 'ATH', // example default or inferred destination
            dateFrom: packageSearchFilters.date?.from ?? '2024-07-01',
            dateTo: packageSearchFilters.date?.to ?? '2024-07-07',
            minPrice: packageSearchFilters.price?.min,
            maxPrice: packageSearchFilters.price?.max,
            adults: 1,
        };

        const result = await AmadeusService.searchFlights(flightParams);


        return result;
    };
}

export const packageService = new PackageService();
