import { Package } from '../models/packages/package.model';
import { isBefore, parseISO } from 'date-fns';

type PartitionedPackages = {
    valid: Package[];
    invalid: Package[];
};

export const partitionPackagesByRules = (packages: Package[], originIataCode: string): PartitionedPackages => {
    const valid: Package[] = [];
    const invalid: Package[] = [];

    for (const pkg of packages) {
        isPackageValidByRules(pkg, originIataCode) ? valid.push(pkg) : invalid.push(pkg);
    }

    return { valid, invalid };
};

const isPackageValidByRules = (pkg: Package, originIataCode: string): boolean => {
    const flightItems = pkg.timeline.filter((item) => item.type === 'flight');
    const destinationItems = pkg.timeline.filter((item) => item.type === 'destination');

    const matchItems = destinationItems.flatMap((destination) =>
        destination.matches.map((match) => ({
            ...match,
            destinationStartDate: destination.startDate,
            destinationEndDate: destination.endDate,
            cityIataCode: destination.cityIataCode,
        }))
    );

    const sortedFlights = [...flightItems].sort(
        (flight, anotherFlight) =>
            new Date(flight.departureDate).getTime() - new Date(anotherFlight.departureDate).getTime()
    );

    const sortedMatches = [...matchItems].sort(
        (match, anotherMatch) => new Date(match.date).getTime() - new Date(anotherMatch.date).getTime()
    );

    const firstFlight = sortedFlights[0];
    const lastFlight = sortedFlights[sortedFlights.length - 1];

    if (!firstFlight || firstFlight.origin.iataCode !== originIataCode) return false;
    if (!lastFlight || lastFlight.destination.iataCode !== originIataCode) return false;

    // Flight order must be chronological
    for (let i = 1; i < sortedFlights.length; i++) {
        const prev = parseISO(sortedFlights[i - 1].departureDate);
        const current = parseISO(sortedFlights[i].departureDate);
        if (isBefore(current, prev)) return false;
    }

    // Matches must be before return flight
    if (sortedMatches.length > 0) {
        const lastMatch = sortedMatches[sortedMatches.length - 1];
        if (isBefore(parseISO(lastFlight.departureDate), parseISO(lastMatch.date))) return false;
    }

    // Each match must have an inbound flight arriving before it
    for (const match of sortedMatches) {
        const matchDate = parseISO(match.date);
        const matchCityIata = match.cityIataCode.toLowerCase();

        const hasInboundFlight = sortedFlights.some((flight) => {
            const arrivalDate = parseISO(flight.departureDate);
            const destCityIata = flight.destination.iataCode.toLowerCase();
            return destCityIata === matchCityIata && isBefore(arrivalDate, matchDate);
        });

        if (!hasInboundFlight) return false;
    }

    // Each destination must include at least one match
    for (const destination of destinationItems) {
        if (!destination.matches || destination.matches.length === 0) return false;
    }

    return true;
};
