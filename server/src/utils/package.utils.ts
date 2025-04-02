import {Package} from '../models/package.model';
import {isBefore, parseISO} from 'date-fns';

export const filterInvalidPackagesByRulesEnforcement = (
    packages: Package[],
    originIataCode: string
): Package[] => {
    return packages.filter((pkg) => {
        const sortedFlights = [...pkg.flights].sort(
            (a, b) =>
                new Date(a.departureDate).getTime() -
                new Date(b.departureDate).getTime()
        );

        const sortedMatches = [...pkg.matches].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const firstFlight = sortedFlights[0];
        const lastFlight = sortedFlights[sortedFlights.length - 1];

        if (!firstFlight || firstFlight.origin.iataCode !== originIataCode)
            return false;

        if (!lastFlight || lastFlight.destination.iataCode !== originIataCode)
            return false;

        for (let i = 1; i < sortedFlights.length; i++) {
            const prev = parseISO(sortedFlights[i - 1].departureDate);
            const current = parseISO(sortedFlights[i].departureDate);
            if (isBefore(current, prev)) return false;
        }

        const lastMatch = sortedMatches[sortedMatches.length - 1];
        if (
            !lastMatch ||
            isBefore(parseISO(lastFlight.departureDate), parseISO(lastMatch.date))
        )
            return false;


        // TODO Need to check this part logic and fix it
        // for (const match of sortedMatches) {
        //     const matchDate = parseISO(match.date);
        //     const matchCity = match.stadium.toLowerCase(); // ← FIX: get per-match city
        //
        //     const hasInboundFlight = sortedFlights.some((flight) => {
        //         const arrivalDate = parseISO(flight.departureDate);
        //         const destCity = flight.destination.name.toLowerCase();
        //         return destCity.includes(matchCity) && isBefore(arrivalDate, matchDate);
        //     });
        //
        //     if (!hasInboundFlight) return false;
        // }

        // if (pkg.matches.length === 1 && pkg.flights.length !== 2) return false;
        // if (pkg.matches.length === 2 && pkg.flights.length !== 3) return false;

        return true;
    });
};
