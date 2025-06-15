import moment from 'moment';
import { FlightSearchParams } from '@/models/flights/flights-search-params.model.ts';

type RouteKey = string;

export function aggregateFlightSearches(searches: FlightSearchParams[]) {
    const map = new Map<RouteKey, { origin: string; destination: string; dates: Date[] }>();

    for (const search of searches) {
        const key = `${search.origin}_${search.destination}`;
        const date = new Date(search.dateTo);

        if (!map.has(key)) {
            map.set(key, { origin: search.origin, destination: search.destination, dates: [date] });
        } else {
            map.get(key)!.dates.push(date);
        }
    }

    // Sort and return list
    return Array.from(map.values()).map((entry) => {
        const sortedDates = entry.dates.sort((a, b) => a.getTime() - b.getTime());
        return {
            ...entry,
            dateRange: {
                from: moment(sortedDates[0]).format('DD/MM'),
                to: moment(sortedDates[sortedDates.length - 1]).format('DD/MM'),
            },
        };
    });
}
