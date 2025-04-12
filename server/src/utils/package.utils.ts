import { Package, TimelineItemSchema } from '../models/packages/package.model';
import { isBefore, parseISO } from 'date-fns';

type PartitionedPackages = {
    valid: Package[];
    invalid: Package[];
};

export const partitionPackagesByRules = (packages: Package[], originIataCode: string): PartitionedPackages => {
    const valid: Package[] = [];
    const invalid: Package[] = [];

    for (const pkg of packages) {
        if (isPackageValidByRules(pkg, originIataCode)) {
            valid.push(pkg);
        } else {
            invalid.push(pkg);
        }
    }

    return { valid, invalid };
};

const isPackageValidByRules = (pkg: Package, originIataCode: string): boolean => {
    // Extract flights and destinations from timeline
    const flightItems = pkg.timeline.filter((item) => item.type === 'flight').map((item) => ({ ...item }));

    // Extract all matches from all destinations
    const matchItems = pkg.timeline
        .filter((item) => item.type === 'destination')
        .flatMap((item) =>
            item.matches.map((match) => ({
                ...match,
                destinationStartDate: item.startDate,
                destinationEndDate: item.endDate,
            }))
        );

    // Sort flights by departure date
    const sortedFlights = [...flightItems].sort(
        (flight, anotherFlight) =>
            new Date(flight.departureDate).getTime() - new Date(anotherFlight.departureDate).getTime()
    );

    // Sort matches by date
    const sortedMatches = [...matchItems].sort(
        (match, anotherMatch) => new Date(match.date).getTime() - new Date(anotherMatch.date).getTime()
    );

    const firstFlight = sortedFlights[0];
    const lastFlight = sortedFlights[sortedFlights.length - 1];

    // Validate first flight starts from origin
    if (!firstFlight || firstFlight.origin.iataCode !== originIataCode) return false;

    // Validate last flight returns to origin
    if (!lastFlight || lastFlight.destination.iataCode !== originIataCode) return false;

    // Validate flights are in chronological order
    for (let i = 1; i < sortedFlights.length; i++) {
        const prev = parseISO(sortedFlights[i - 1].departureDate);
        const current = parseISO(sortedFlights[i].departureDate);
        if (isBefore(current, prev)) return false;
    }

    // Validate last match happens before return flight
    const lastMatch = sortedMatches[sortedMatches.length - 1];
    if (!lastMatch || isBefore(parseISO(lastFlight.departureDate), parseISO(lastMatch.date))) {
        return false;
    }

    // Validate each match has an inbound flight before it
    for (const match of sortedMatches) {
        const matchDate = parseISO(match.date);
        const matchCityIata = match.cityIataCode.toLowerCase();

        const hasInboundFlight = sortedFlights.some((flight) => {
            const arrivalDate = parseISO(flight.departureDate);
            const destCityIata = flight.destination.iataCode.toLowerCase();
            return (
                (destCityIata.includes(matchCityIata) || matchCityIata.includes(destCityIata)) &&
                isBefore(arrivalDate, matchDate)
            );
        });

        if (!hasInboundFlight) return false;
    }

    return true;
};
