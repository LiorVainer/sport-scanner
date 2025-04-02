import {CoreMessage} from 'ai';
import {ExtendedFixtureItem} from '../../models/fixture.model';
import {message} from './message.utils';
import {FlightOffer} from '../../models/flight-offer.model';
import {Package} from '../../models/package.model';

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

⚠️ Important:
- A package can include **at most 2 matches**
- Do **not** generate packages with more than 2 matches

✈️ Flight Rules:
- 1 match → 2 flights: origin → match city, then back to origin
- 2 matches in different cities → 3 flights:
  1. from origin to first match city
  2. between match cities
  3. return to origin
- 2 matches in the **same city** → only 2 flights needed (to and from), no inter-city flight required

🧠 Example:
✅ Match 1 in "Estadi Olímpic Lluís Companys", Match 2 in "Spotify Camp Nou"  
Both are in **Barcelona** → no BCN→BCN flight needed

⚠️ Flights must follow timeline (no going back in time)  
⚠️ Each match must be reachable by a flight **before** its date  
⚠️ Final flight must return to the origin city  
❌ Avoid flights between unrelated cities

❌ Bad Example:
Match 1 in Barcelona, Match 2 in Leganés  
Flights: TLV→BCN ✅, FCO→MAD ❌, MAD→TLV ✅  
⛔ Rome (FCO) wasn’t part of the trip  
⛔ Missing BCN→MAD flight for second match

✅ Fix: Add BCN→MAD flight, remove FCO

Only return packages that follow all rules.`
    );
    

const fixtureMessages = (fixtures: ExtendedFixtureItem[]): CoreMessage[] =>
    fixtures.map((fixture) => {
        const {id, date, venue} = fixture.fixture;
        const range = fixture.price
            ? `€${fixture.price.min} - €${fixture.price.max}`
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
            itinerary.segments.map((seg, j) => {
                const purpose = getFlightPurpose(seg.departure.iataCode, seg.arrival.iataCode, originIataCode, matchCities);
                return `  - ${seg.departure.iataCode} → ${seg.arrival.iataCode} on ${seg.departure.at} ${purpose}`;
            })
        );

        return message.system(
            `Flight ${flight.id}: €${flight.price.total} ${flight.price.currency}, oneWay: ${flight.oneWay}\n${segments.join('\n')}`
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
