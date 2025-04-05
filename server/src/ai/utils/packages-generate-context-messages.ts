import {CoreMessage} from 'ai';
import {ExtendedFixtureItem} from '../../models/fixture.model';
import {message} from './message.utils';
import {FlightOffer} from '../../models/flight-offer.model';
import {Package} from '../../models/package.model';
import {ENV} from "../../env/env.config";

const introMessage = () =>
    message.system(
        `You are a travel assistant. Create realistic travel packages that include: 
- flights (with segments)
- match info (with ticket price)
- total cost breakdown`
    );

const rulesMessage = (maxPackages: number) =>
    message.user(
        `Generate up to ${maxPackages} valid travel packages from the data above.

Each package must include:
- title, description, fromDate, toDate
- list of flights (with segments, dates, prices)
- list of matches (with location, date, ticket price)
- total price breakdown (flightsPrice + matchesPrice)

⚠️ HARD RULES (DO NOT BREAK):
- Packages must start with a flight from the user's origin (TLV)
- Packages must end with a return flight to the user's origin (TLV)
- No flights from or to unrelated cities (e.g. Rome unless there's a match there)
- Every city visited must be part of a match
- Each match must be reachable by a flight arriving **before** its kickoff
- Flights must follow a chronological timeline (no time travel)

✈️ Match Rules:
- A package can include **1 or 2 matches maximum**
- 1 match in any city → 2 flights: TLV → match city → TLV
- 2 matches in **different cities** → 3 flights: TLV → match1 → match2 → TLV
- 2 matches in the **same city** → still only 2 flights: TLV → city → TLV

❌ Bad Example:
- TLV → Munich → Leipzig → Munich → Rome → TLV
⛔ Rome is not a match city → INVALID
⛔ Too many flight hops → INVALID

✅ Good Example:
- TLV → Munich → Leipzig → TLV → VALID (if there's one match in each city)

Return only fully valid packages.`
    );


const fixtureMessages = (fixtures: ExtendedFixtureItem[]): CoreMessage[] =>
    fixtures.map((fixture) => {
        const {id, date, venue} = fixture.fixture;
        const range = fixture.price
            ? `${fixture.price.min} - ${fixture.price.max} (${ENV.CURRENCY_CODE})`
            : `unknown`;
        return message.system(
            `Match ${id}: ${fixture.teams.home.name} (logo url: ${fixture.teams.home.logo}) vs ${fixture.teams.away.name} (logo url: ${fixture.teams.away.logo}) on ${date} at ${venue.name}, ${venue.city}. Price: ${range}.`
        );
    });

const getFlightPurpose = (origin: string, destination: string, userOrigin: string, matchCities: string[]): string => {
    const isFromOrigin = origin === userOrigin;
    const isToOrigin = destination === userOrigin;
    const isToMatch = matchCities.includes(destination);
    const isFromMatch = matchCities.includes(origin);

    if (isFromOrigin && isToMatch) return '→ To match city';
    if (isFromMatch && isToOrigin) return '→ Back to origin';
    if (isFromMatch && isToMatch) return '→ Between match cities';
    return '';
};

const flightMessages = (
    flights: FlightOffer[],
    fixtures: ExtendedFixtureItem[],
    originIataCode: string
): CoreMessage[] => {
    const matchCities = fixtures.map((f) => f.fixture.venue.city?.toUpperCase().trim());

    return flights.map((flight) => {
        const segments = flight.itineraries.flatMap((itinerary, i) =>
            itinerary.segments.map((seg) => {
                const purpose = getFlightPurpose(seg.departure.iataCode, seg.arrival.iataCode, originIataCode, matchCities);
                return `  - ${seg.departure.iataCode} → ${seg.arrival.iataCode} on ${seg.departure.at} ${purpose}`;
            })
        );

        return message.system(
            `Flight ${flight.id}: ${flight.price.total} ${flight.price.currency}, oneWay: ${flight.oneWay}\n${segments.join('\n')}`
        );
    });
};

export const generateContextMessagesForPackageGeneration = (
    fixtures: ExtendedFixtureItem[],
    flightOffers: FlightOffer[],
    maxPackages: number,
    originIataCode: string
): CoreMessage[] => [
    introMessage(),
    ...fixtureMessages(fixtures),
    ...flightMessages(flightOffers, fixtures, originIataCode),
    rulesMessage(maxPackages),
];

export const generateFilterInvalidPackagesMessages = (packages: Package[]): CoreMessage[] => [
    message.system(
        `You are reviewing generated travel packages. Only keep those that:
- have flights before each match (to that city)
- follow timeline
- contain a return flight to origin
- connect multiple match cities
Discard any package that violates these rules.`
    ),
    message.system(`Raw packages:\n${JSON.stringify(packages, null, 2)}`),
    message.user(`Return only the valid packages.`),
];
