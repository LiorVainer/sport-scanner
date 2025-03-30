import { CoreMessage } from 'ai';
import { ExtendedFixtureItem } from '../../models/fixture.model';
import { message } from './message.utils';
import { FlightOffer } from '../../models/flight-offer.model';
import { Package } from '../../models/package.model';

const introMessage = () =>
    message.system(
        `You are a travel assistant helping create exciting travel packages that combine soccer matches and available flights. Each package should include: flight details (with all segments), match info, and cost breakdown.`
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
- If it contains 2 matches in different cities, it must have 3 flights: one to the first destination, one between the match cities, and one returning to origin.

Ensure all packages are logically consistent in both **timeline** and **geographic flow**. Avoid flights that are disconnected from the match cities or that skip essential segments.

---

❌ **Bad Example (Invalid Travel Package due to Flight Issues)**:

Raw JSON:
{
  "id": 5678,
  "title": "Barcelona & Leganes Double Match Package",
  "description": "Experience two exciting La Liga matches! See Barcelona play Real Betis and Leganes, with flights included.",
  "fromDate": "2025-04-02",
  "toDate": "2025-04-15",
  "location": "Barcelona & Leganés",
  "flightsPrice": 765.67,
  "matchesPrice": { "min": 160, "max": 750 },
  "totalPrice": { "min": 925.67, "max": 1515.67 },
  "flights": [
    {
      "id": 3,
      "origin": { "name": "Tel Aviv", "iataCode": "TLV" },
      "destination": { "name": "Barcelona", "iataCode": "BCN" },
      "price": 254.61,
      "departureDate": "2025-04-02T05:15:00"
    },
    {
      "id": 7,
      "origin": { "name": "Rome", "iataCode": "FCO" },
      "destination": { "name": "Madrid", "iataCode": "MAD" },
      "price": 255.53,
      "departureDate": "2025-04-09T09:15:00"
    },
    {
      "id": 17,
      "origin": { "name": "Madrid", "iataCode": "MAD" },
      "destination": { "name": "Tel Aviv", "iataCode": "TLV" },
      "price": 255.53,
      "departureDate": "2025-04-15T05:50:00"
    }
  ],
  "matches": [
    {
      "id": 1208755,
      "homeTeam": { "id": 529, "name": "Barcelona" },
      "awayTeam": { "id": 543, "name": "Real Betis" },
      "league": "La Liga",
      "stadium": "Estadi Olímpic Lluís Companys",
      "date": "2025-04-05T19:00:00+00:00",
      "price": { "min": 100, "max": 450 }
    },
    {
      "id": 1208769,
      "homeTeam": { "id": 537, "name": "Leganes" },
      "awayTeam": { "id": 529, "name": "Barcelona" },
      "league": "La Liga",
      "stadium": "Estadio Municipal de Butarque",
      "date": "2025-04-12T19:00:00+00:00",
      "price": { "min": 60, "max": 300 }
    }
  ]
}

🚫 Problems:
- The traveler starts in Tel Aviv and arrives in Barcelona for the first match (✅ correct).
- Then a flight appears from **Rome to Madrid**, but the traveler was never in Rome (❌ illogical).
- There’s no flight connecting **Barcelona to Madrid**, so the second match in Leganés (near Madrid) cannot be reached.
- The return flight is correctly from Madrid to Tel Aviv — but it’s unclear how the traveler arrived in Madrid.

✅ Expected fix:
- Add a proper connecting flight between Barcelona and Madrid (or another nearby airport).
- Remove unrelated cities (like Rome) unless it's a real connection in the flight path.
- Ensure that the flights cover the full journey in a logical, connected order.

---

Make sure all generated packages follow the logical rules, have correct flight segments, and avoid broken travel paths.`
    );

const fixtureMessages = (fixtures: ExtendedFixtureItem[]): CoreMessage[] =>
    fixtures.map((fixture) => {
        const { id, date, venue } = fixture.fixture;
        const priceRange = fixture.price
            ? `Estimated ticket price: €${fixture.price.min} - €${fixture.price.max}`
            : `Ticket price is unknown`;

        return message.system(
            `Match ID ${id}: ${fixture.teams.home.name} vs ${fixture.teams.away.name}, league ${fixture.league.name} (${fixture.league.country}) season ${fixture.league.season}. Date: ${date}. Venue: ${venue.name}, ${venue.city}. ${priceRange}. Home Team Logo URL: ${fixture.teams.home.logo}, Away Team Logo URL: ${fixture.teams.away.logo}.`
        );
    });

const getFlightPurpose = (origin: string, destination: string, userOrigin: string, matchCities: string[]): string => {
    const isFromOrigin = origin === userOrigin;
    const isToOrigin = destination === userOrigin;
    const isToMatchCity = matchCities.includes(destination);
    const isFromMatchCity = matchCities.includes(origin);

    if (isFromOrigin && isToMatchCity) return 'Purpose: Outbound flight to match city';
    if (isFromMatchCity && isToOrigin) return 'Purpose: Return flight to origin';
    if (isFromMatchCity && isToMatchCity) return 'Purpose: Inter-city flight between matches';
    return 'Purpose: Unknown (verify if needed)';
};

const flightMessages = (
    flights: FlightOffer[],
    fixtures: ExtendedFixtureItem[],
    originIataCode: string
): CoreMessage[] => {
    const matchCities = fixtures.map((f) => f.fixture.venue.city?.toUpperCase().trim());

    return flights.map((flight) => {
        const itinerariesDescription = flight.itineraries
            .map((itinerary, idx) => {
                const segmentsDescription = itinerary.segments
                    .map((seg, i) => {
                        const purpose = getFlightPurpose(
                            seg.departure.iataCode,
                            seg.arrival.iataCode,
                            originIataCode,
                            matchCities
                        );

                        return `    Segment ${i + 1} of ${itinerary.segments.length}:
          From ${seg.departure.iataCode} at ${seg.departure.at}
          To ${seg.arrival.iataCode} at ${seg.arrival.at}
          Airline: ${seg.carrierCode}${seg.number}
          Duration: ${seg.duration}
          ${purpose}`;
                    })
                    .join('\n');

                const firstSeg = itinerary.segments[0];
                const lastSeg = itinerary.segments[itinerary.segments.length - 1];

                return `Itinerary ${idx + 1} (${firstSeg.departure.iataCode} → ${lastSeg.arrival.iataCode}):
    ${segmentsDescription}`;
            })
            .join('\n\n');

        return message.system(
            `Flight Offer ${flight.id}:
      Total Price: €${flight.price.total} ${flight.price.currency}
      One Way: ${flight.oneWay}
      Bookable Seats: ${flight.numberOfBookableSeats}
    
    ${itinerariesDescription}`
        );
    });
};

export const generateContextMessagesForPackageGeneration = (
    fixtures: ExtendedFixtureItem[],
    flightOffers: FlightOffer[],
    maxPackages: number,
    originIataCode: string
): CoreMessage[] => {
    return [
        introMessage(),
        ...fixtureMessages(fixtures),
        ...flightMessages(flightOffers, fixtures, originIataCode),
        rulesMessage(maxPackages),
    ];
};

export const generateFilterInvalidPackagesMessages = (packages: Package[]): CoreMessage[] => {
    const messages: CoreMessage[] = [];

    messages.push(
        message.system(
            `You are a travel assistant verifying the validity of generated travel packages that combine soccer matches and flights.`
        )
    );

    messages.push(
        message.system(`Here are the rules that MUST be enforced for a valid travel package:
- A match must never occur after the final return flight.
- There must be a flight before each match that gets the traveler to the match city.
- If multiple matches exist in different cities, there must be a connecting flight between those cities.
- The last flight must return the traveler to the origin city.
- Flights and matches must follow chronological order.`)
    );

    messages.push(message.system(`Here are the generated packages (raw JSON):\n${JSON.stringify(packages, null, 2)}`));

    messages.push(
        message.user(
            `From the above, return only the valid packages that fully satisfy the rules. Discard any invalid ones.`
        )
    );

    return messages;
};
