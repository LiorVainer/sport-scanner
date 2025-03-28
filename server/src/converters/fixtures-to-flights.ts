import { FixtureItem } from '../models/fixture.model';
import { FlightSearchParams } from '../models/flights-search-params.model';
import moment from 'moment';

export const convertFixtureToFlightSearchParams = (fixture: FixtureItem): FlightSearchParams => {
    const baseDate = moment(fixture.fixture.date);

    return {
        origin: fixture.teams.home.name.slice(0, 3).toUpperCase(),
        destination: fixture.teams.away.name.slice(0, 3).toUpperCase(),
        dateFrom: baseDate.clone().subtract(48, 'hours').format('YYYY-MM-DD'),
        dateTo: baseDate.clone().add(48, 'hours').format('YYYY-MM-DD'),
        minPrice: undefined,
        maxPrice: undefined,
        adults: 1,
    };
};
