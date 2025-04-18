import { z } from 'zod';
import { PriceRangeSchema } from '../price-range.model';
import { FixtureInfoSchema } from '../soccer/fixture.model';
import { LeagueSchema, VenueSchema } from '@/models/soccer/soccer.model.ts';

export const CityInfoSchema = z.object({
    name: z.string().describe('City name'),
    iataCode: z.string().length(3).describe('IATA code of the airport'),
});

export const FlightPurposeSchema = z
    .enum(['departure', 'return', 'connecting'])
    .describe(
        'Purpose of the flight, either "departure", "return" or "connecting" ("connecting" is used for flights that are between packages destinations).'
    );

export const FlightPurposeEnum = FlightPurposeSchema.enum;

export const FlightSchema = z.object({
    id: z.number(),
    origin: CityInfoSchema,
    destination: CityInfoSchema,
    price: z.number(),
    departureDate: z.string(),
    purpose: FlightPurposeSchema,
    searchFlightTicketsLink: z.string(),
}).describe(`
  Represents a complete flight between two cities in the timeline.
  This may internally include segments (e.g. TLV → FCO → MUC), but
  only the full flight should be included here — NOT individual segments.
`);

export const TeamSchema = z.object({
    id: z.number().describe('Unique identifier of the team'),
    name: z.string().describe('Name of the team'),
    logo: z.string().describe('URL of the team logo'),
});

export const PackageTimelineItemType = {
    FLIGHT: 'flight',
    DESTINATION: 'destination',
} as const;

export const MatchSchema = FixtureInfoSchema.omit({ venue: true }).extend({
    league: LeagueSchema.describe('League associated with the fixture'),
    homeTeam: TeamSchema.describe('Home team playing in the match'),
    awayTeam: TeamSchema.describe('Away team playing in the match'),
    stadium: VenueSchema.describe('Stadium where the match takes place'),
    price: PriceRangeSchema.describe('Price range of the match tickets'),
    searchMatchTicketsLink: z
        .string()
        .describe(
            'URL to search for match tickets on StubHub. This should include relevant query parameters such as the home team, away team, date, or venue when applicable. For example: https://www.stubhub.com/search?q=FC%20Barcelona%20vs%20Real%20Betis%202025-04-05'
        ),
});

export const DestinationSchema = z.object({
    type: z
        .literal(PackageTimelineItemType.DESTINATION)
        .describe('Type of the timeline item, always "destination" for this schema'),
    city: z.string().describe('City name of the destination'),
    cityIataCode: z.string().length(3).describe('IATA code of the destination city'),
    startDate: z.string().describe('Start date of the stay in the destination'),
    endDate: z.string().describe('End date of the stay in the destination'),
    matches: z.array(MatchSchema).describe('List of matches happening in this destination'),
});

export type Destination = z.infer<typeof DestinationSchema>;

export const FlightItemSchema = FlightSchema.extend({
    type: z
        .literal(PackageTimelineItemType.FLIGHT)
        .describe('Type of the timeline item, always "flight" for this schema'),
});

export const TimelineItemSchema = z
    .discriminatedUnion('type', [FlightItemSchema, DestinationSchema])
    .describe('Timeline item, either a flight or a destination');

export const PackageMetadata = z
    .object({
        destinationsCount: z.number().describe('Number of different cities (destinations) included in this package'),

        flightsCount: z.number().describe('Total number of flights included in the timeline of the package'),

        matchesCount: z.number().describe('Total number of matches included in the package'),

        citiesVisited: z.array(z.string()).describe('List of cities visited in this package'),

        durationDays: z.number().describe('Total duration of the trip in days, based on startDate and endDate'),

        destinations: z
            .array(
                z.object({
                    cityName: z.string().describe('The name of the city visited'),
                    cityIata: z.string().length(3).describe('The IATA code of the city visited'),
                    days: z.number().describe('Number of days spent in the city'),
                    matchesCount: z
                        .number()
                        .describe('Number of matches of the package that are in the city during the trip'),
                })
            )
            .describe(
                'List of cities visited in the package, with the number of days spent in each city and the number of matches in that city'
            ),

        averageMatchTicketPrice: z.number().describe('Average of min and max ticket price across all matches'),
    })
    .describe('Supplementary metadata to help categorize, explain, or filter the travel package');

export const PackageSchema = z
    .object({
        id: z.number().describe('Unique identifier of the package'),
        title: z
            .string()
            .describe(
                'Title of the travel package. Make it catchy and attractive. If the package includes one match, include the team names and the league.'
            ),
        description: z.string().describe('Description of what the package includes: matches, flights, dates.'),
        startDate: z.string().describe('Start date of the package. This is the earliest flight or match date.'),
        endDate: z.string().describe('End date of the package. This is the latest return flight or match date.'),
        location: z.string().describe('Primary location of the package, typically the first destination city.'),
        flightsPrice: z.number().describe(
            `Total combined price of all flights in the package. 
If a flight is round trip, only count the price of the outgoing flight. 
There can be multiple flights depending on the number of destinations.`
        ),
        matchesPrice: PriceRangeSchema.describe(
            'Price range (min-max) of all match tickets in the package. Multiple matches are allowed.'
        ),
        totalPrice: PriceRangeSchema.describe(
            'Total price range of the package. This includes the flightsPrice and matchesPrice combined.'
        ),
        timeline: z.array(TimelineItemSchema).describe(`
  The timeline contains full flights and destinations in chronological order.
  Flights must represent full offers between cities (e.g. TLV → MUC) and not individual segments.
  If a flight contains multiple legs (segments), it should still appear as a single item.
  Do NOT include each segment separately. 
  Destinations group the matches at a given city.
`),
        metadata: PackageMetadata,
    })
    .describe('Travel package that combines multiple destinations, flights, and football matches');

export const PackageArraySchema = z.array(PackageSchema).describe('packages-array');

export type Match = z.infer<typeof MatchSchema>;
export type Flight = z.infer<typeof FlightSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type CityInfo = z.infer<typeof CityInfoSchema>;
export type Package = z.infer<typeof PackageSchema>;

export const PackageDocumentSchema = PackageSchema.extend({
    _id: z.string(),
});

export type PackageDocument = z.infer<typeof PackageDocumentSchema>;
