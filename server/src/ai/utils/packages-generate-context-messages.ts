import { CoreMessage } from 'ai';
import { ExtendedFixtureItem } from '../../models/fixture.model';
import { message } from './message.utils';
import { FlightOffer } from '../../models/flight-offer.model';

const introMessage = () =>
    message.system(
        `You are a travel assistant helping create exciting travel packages that combine soccer matches and available flights. Each package should include: flight details (with all segments), match info, and cost breakdown.`
    );

const badExampleMessage = () =>
    message.system(
        `Invalid package example due to missing connecting flight:

Raw JSON:
{
  "id": 5678,
  "title": "Barcelona & Leganes Double Match Package",
  "description": "Catch two exciting La Liga matches! See Barcelona play Real Betis and Leganes, with flights included.",
  "fromDate": "2025-04-02",
  "toDate": "2025-04-09",
  "location": "Barcelona & Leganés",
  "flightsPrice": 254.61,
  "matchesPrice": { "min": 160, "max": 750 },
  "totalPrice": { "min": 414.61, "max": 1004.61 },
  "flights": [
    {
      "id": 3,
      "origin": "TLV",
      "destination": "BCN",
      "price": 254.61,
      "departureDate": "2025-04-02T05:15:00"
    },
    {
      "id": 4,
      "origin": "BCN",
      "destination": "TLV",
      "price": 0,
      "departureDate": "2025-04-09T06:20:00"
    }
  ],
  "matches": [
    {
      "id": 1208755,
      "homeTeam": "Barcelona",
      "awayTeam": "Real Betis",
      "league": "La Liga",
      "stadium": "Estadi Olímpic Lluís Companys",
      "date": "2025-04-05T19:00:00+00:00",
      "price": { "min": 100, "max": 450 }
    },
    {
      "id": 1208769,
      "homeTeam": "Leganes",
      "awayTeam": "Barcelona",
      "league": "La Liga",
      "stadium": "Estadio Municipal de Butarque",
      "date": "2025-04-12T19:00:00+00:00",
      "price": { "min": 60, "max": 300 }
    }
  ]
}

❌ Problem:
- There are two matches in different cities (Barcelona and Leganés), but the flights only include a round-trip to Barcelona (BCN).
- It is missing a connecting flight from Barcelona to Leganés (nearest airport: MAD).
- The return flight should depart from Madrid (MAD), not from Barcelona.

✅ Rule:
- If a package has 1 match, it must include 2 flights (to and from).
- If a package has 2 matches in different cities, it must include 3 flights: to the first city, a connection between cities, and return from the last city.`
    );

const rulesMessage = (maxPackages: number) =>
    message.user(
        `Generate a maximum of ${maxPackages} tailored travel packages that combine the above flight options and matches.
Each package should include:
- title, description
- fromDate and toDate
- list of flights (with full segment details)
- list of matches
- total flight price and total match price

Rules:
- If the package contains 1 match, it must have 2 flights: one to the destination and one returning.
- If it contains 2 matches, it must have 3 flights: one to the first destination, one between the match cities, and one returning to origin.

Ensure all packages are logically consistent in time and pricing.`
    );

const fixtureMessages = (fixtures: ExtendedFixtureItem[]): CoreMessage[] =>
    fixtures.map((fixture) => {
        const { id, date, venue } = fixture.fixture;
        const priceRange = fixture.price
            ? `Estimated ticket price: €${fixture.price.min} - €${fixture.price.max}`
            : `Ticket price is unknown`;

        return message.system(
            `Match ID ${id}: ${fixture.teams.home.name} vs ${fixture.teams.away.name}, league ${fixture.league.name} (${fixture.league.country}) season ${fixture.league.season}. Date: ${date}. Venue: ${venue.name}, ${venue.city}. ${priceRange}.`
        );
    });

const flightMessages = (flights: FlightOffer[]): CoreMessage[] =>
    flights.map((flight) => {
        const segments = flight.itineraries
            .flatMap((itinerary) => itinerary.segments)
            .map((seg) => {
                return `Segment ${seg.id}: ${seg.departure.iataCode} -> ${seg.arrival.iataCode} | Departure: ${seg.departure.at} | Arrival: ${seg.arrival.at} | Airline: ${seg.carrierCode}${seg.number} | Duration: ${seg.duration}`;
            })
            .join('\n');

        return message.system(
            `Flight Offer ${flight.id}: Total Price: €${flight.price.total}, Currency: ${flight.price.currency}, One Way: ${flight.oneWay}, Bookable Seats: ${flight.numberOfBookableSeats}\n${segments}`
        );
    });

export const generateSystemMessageForPackageGeneration = (
    fixtures: ExtendedFixtureItem[],
    flightOffers: FlightOffer[],
    maxPackages: number
): CoreMessage[] => {
    return [
        badExampleMessage(),
        introMessage(),
        ...fixtureMessages(fixtures),
        ...flightMessages(flightOffers),
        rulesMessage(maxPackages),
    ];
};
