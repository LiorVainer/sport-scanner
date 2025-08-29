import {
    DestinationItem,
    FlightItem,
    Package,
    PackageMetadata,
    PackageWithMetadata,
} from '../models/packages/package.model';
import { isBefore, parseISO } from 'date-fns';
import { packagesLogger } from '../logs/packages.logger';
import moment from 'moment';

type InvalidPackage = {
    reason: string;
    params: Record<string, any>;
    package: Package;
};

type PartitionedPackages = {
    valid: Package[];
    invalid: InvalidPackage[];
};

export const partitionPackagesByRules = (packages: Package[], originIataCode: string): PartitionedPackages => {
    const valid: Package[] = [];
    const invalid: InvalidPackage[] = [];

    for (const pkg of packages) {
        const validationError = getInvalidReason(pkg, originIataCode);
        if (validationError) {
            packagesLogger.info(`Package validation failed`, { validationError, package: pkg });
            invalid.push({ ...validationError, package: pkg });
        } else {
            valid.push(pkg);
        }
    }

    return { valid, invalid };
};

const getInvalidReason = (
    pkg: Package,
    originIataCode: string
): { reason: string; params: Record<string, any> } | null => {
    const flightItems = pkg.timeline.filter((item) => item.type === 'flight');
    const destinationItems = pkg.timeline.filter((item) => item.type === 'destination');

    const allMatches = destinationItems.flatMap((destination) =>
        destination.matches.map((match) => ({
            ...match,
            destinationStartDate: destination.startDate,
            destinationEndDate: destination.endDate,
            cityIataCode: destination.cityIataCode,
        }))
    );

    const flightsSortedByDate = [...flightItems].sort(
        (flightA, flightB) => new Date(flightA.departureDate).getTime() - new Date(flightB.departureDate).getTime()
    );

    const matchesSortedByDate = [...allMatches].sort(
        (matchA, matchB) => new Date(matchA.date).getTime() - new Date(matchB.date).getTime()
    );

    const firstFlight = flightsSortedByDate[0];
    const lastFlight = flightsSortedByDate[flightsSortedByDate.length - 1];

    if (!firstFlight || firstFlight.origin.iataCode !== originIataCode) {
        return {
            reason: 'First flight must depart from origin airport',
            params: {
                originExpected: originIataCode,
                originActual: firstFlight?.origin.iataCode,
            },
        };
    }

    if (!lastFlight || lastFlight.destination.iataCode !== originIataCode) {
        return {
            reason: 'Last flight must return to origin airport',
            params: {
                expectedReturn: originIataCode,
                actualReturn: lastFlight?.destination.iataCode,
            },
        };
    }

    for (let index = 1; index < flightsSortedByDate.length; index++) {
        const prevDate = parseISO(flightsSortedByDate[index - 1].departureDate);
        const currDate = parseISO(flightsSortedByDate[index].departureDate);
        if (isBefore(currDate, prevDate)) {
            return {
                reason: 'Flights are not in chronological order',
                params: {
                    previous: prevDate.toISOString(),
                    current: currDate.toISOString(),
                    index,
                },
            };
        }
    }

    if (matchesSortedByDate.length > 0) {
        const lastMatch = matchesSortedByDate[matchesSortedByDate.length - 1];
        if (isBefore(parseISO(lastFlight.departureDate), parseISO(lastMatch.date))) {
            return {
                reason: 'Last match occurs after return flight',
                params: {
                    lastMatchDate: lastMatch.date,
                    lastFlightDate: lastFlight.departureDate,
                },
            };
        }
    }

    for (const match of matchesSortedByDate) {
        const matchDate = parseISO(match.date);
        const matchCityIata = match.cityIataCode.toLowerCase();

        const hasInbound = flightsSortedByDate.some((flight) => {
            const arrivalDate = parseISO(flight.departureDate);
            const destinationIata = flight.destination.iataCode.toLowerCase();
            return destinationIata === matchCityIata && isBefore(arrivalDate, matchDate);
        });

        if (!hasInbound) {
            return {
                reason: `No inbound flight to match city (${match.cityIataCode}) before match`,
                params: { matchDate: match.date },
            };
        }
    }

    for (const destination of destinationItems) {
        if (!destination.matches || destination.matches.length === 0) {
            return {
                reason: `Destination ${destination.city} has no matches`,
                params: { city: destination.city },
            };
        }
    }

    return null;
};

export const calculateMetadata = (pkg: Package): PackageMetadata => {
    const destinationBlocks = pkg.timeline.filter((item) => item.type === 'destination');
    const flightItems = pkg.timeline.filter((item) => item.type === 'flight');

    const destinationSummaries = destinationBlocks.map((destination) => ({
        cityName: destination.city,
        cityIata: destination.cityIataCode,
        days: Math.max(1, new Date(destination.endDate).getDate() - new Date(destination.startDate).getDate()),
        matchesCount: destination.matches.length,
    }));

    const allMatches = destinationBlocks.flatMap((destination) => destination.matches);
    const averageTicketPrice =
        allMatches.length > 0
            ? allMatches.reduce((total, match) => total + (match.price.min + match.price.max) / 2, 0) /
              allMatches.length
            : 0;

    return {
        destinationsCount: destinationBlocks.length,
        flightsCount: flightItems.length,
        matchesCount: allMatches.length,
        citiesVisited: destinationBlocks.map((destination) => destination.city),
        durationDays: Math.max(1, new Date(pkg.endDate).getDate() - new Date(pkg.startDate).getDate()),
        destinations: destinationSummaries,
        averageMatchTicketPrice: Number(averageTicketPrice.toFixed(2)),
    };
};

export const packageToPackageWithMetadata = (pkg: Package): PackageWithMetadata => {
    const metadata = calculateMetadata(pkg);
    return { ...pkg, metadata };
};

export const fixDateGaps = (pkg: Package): Package => {
    const fixedTimeline = pkg.timeline.map((item, idx, arr) => {
        if (item.type === 'destination') {
            const prev = arr[idx - 1] as FlightItem | undefined;
            const next = arr[idx + 1] as FlightItem | undefined;
            if (prev?.type === 'flight' && next?.type === 'flight') {
                return {
                    ...item,
                    startDate: moment(prev.arrivalDate).add(1, 'hours').toISOString(),
                    endDate: moment(next.departureDate).subtract(1, 'hours').toISOString(),
                } as DestinationItem;
            }
        }
        return item;
    });

    return { ...pkg, timeline: fixedTimeline };
};

export function calculateTotalPriceMin(pkg: Package): number {
    const flightsTotal = pkg.timeline
        .filter((item): item is FlightItem => item.type === 'flight')
        .reduce((sum, f) => sum + f.price, 0);

    const matchesTotal = pkg.timeline
        .filter((item): item is DestinationItem => item.type === 'destination')
        .flatMap((dest) => dest.matches.map((match) => match.price.min))
        .reduce((sum, minPrice) => sum + minPrice, 0);

    return Number((flightsTotal + matchesTotal).toFixed(2));
}

// Optionally, update a package object with the computed field:
export function withTotalPriceMin(pkg: Package): Package {
    const min = calculateTotalPriceMin(pkg);
    return {
        ...pkg,
        totalPrice: {
            ...pkg.totalPrice,
            min,
        },
    };
}
