import { CoreMessage } from 'ai';
import { ExtendedFixtureItem } from '../../models/soccer/fixture.model';
import { message } from './message.utils';
import { FlightOffer } from '../../models/flights/flight-offer.model';
import { Package } from '../../models/packages/package.model';
import { ENV } from '../../env/env.config';

const introMessage = () =>
    message.system(
        `You are a travel assistant. Your job is to generate realistic and complete travel packages.

Each package must include:
- Title and description
- From and to dates
- Timeline: an ordered array of **flights** and **destinations**
  - Flights are full route flights (with segments), not individual segments
  - Destinations contain matches in that city with ticket info
- Flights and match ticket prices
- Price breakdown: total flight cost + total match ticket range

You will receive:
- A list of available flights (with their full route segments)
- A list of football matches with their date, location, and price range

Build travel packages using this information.`
    );

const rulesMessage = (maxPackages: number) =>
    message.user(
        `Generate up to ${maxPackages} valid travel packages from the data above.

Each package must include:
- title, description, startDate, endDate
- a timeline array: consists of **full flights** and **destination blocks**
- destinations include one or more matches with ticket prices
- flights include origin, destination, departure date, purpose, price, and ticket link
- a total price breakdown (flightsPrice + matchesPrice)

📦 Timeline Structure:
- Timeline is a **chronological array** of 'flight' and 'destination' items
- ✈️ Each flight must represent a **complete flight offer** between cities (e.g. TLV → MUC)
- ❌ DO NOT include individual segments like TLV → FCO and FCO → MUC
- 🛬 Each destination includes matches and stay dates

⚠️ HARD RULES (MUST follow):
- Packages must start with a flight from the user's origin (e.g. TLV)
- Packages must end with a return flight to the user's origin (e.g. TLV)
- No flights to cities with no matches
- Each city visited must be a match city
- Every match must be reachable by a flight that arrives **before** kickoff
- Flights must follow chronological order

✈️ Match Rules:
- 1 match (any city): TLV → match → TLV (2 flights + 1 destination)
- 2 matches in same city: TLV → city → TLV (2 flights + 1 destination)
- 2 matches in different cities: TLV → city1 → city2 → TLV (3 flights + 2 destinations)

❌ Invalid Examples:
- Flights from/to Rome if there's no match there
- Segments shown as separate timeline items

✅ Valid Examples:
- TLV → MUC → LEJ → TLV (3 full flights + 2 destinations)
- TLV → BCN → TLV (2 full flights + 1 destination with 2 matches)

Return only fully valid and complete packages that follow all structure and rules.`
    );

const fixtureMessages = (fixtures: ExtendedFixtureItem[]): CoreMessage[] =>
    fixtures.map((fixture) => {
        const { id, date, venue } = fixture.fixture;
        const range = fixture.price ? `${fixture.price.min} - ${fixture.price.max} (${ENV.CURRENCY_CODE})` : `unknown`;
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
                const purpose = getFlightPurpose(
                    seg.departure.iataCode,
                    seg.arrival.iataCode,
                    originIataCode,
                    matchCities
                );
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
