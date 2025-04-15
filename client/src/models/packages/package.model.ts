import { z } from 'zod';

export const PriceRangeSchema = z.object({
    min: z.number(),
    max: z.number(),
});

export const CityInfoSchema = z.object({
    name: z.string().describe('City name'),
    iataCode: z.string().length(3).describe('IATA code of the airport'),
});

export const FlightPurposeSchema = z
    .enum(['departure', 'return', 'connecting'])
    .describe('Purpose of the flight, either departure or return');
export const FlightPurposeEnum = FlightPurposeSchema.Enum;

export const FlightSchema = z.object({
    id: z.number().describe('Unique identifier of the flight'),
    origin: CityInfoSchema.describe('Origin city information'),
    destination: CityInfoSchema.describe('Destination city information'),
    price: z.number(),
    departureDate: z.string().describe('Flight departure date'),
    purpose: z
        .enum(['departure', 'return', 'connecting'])
        .describe('Purpose of the flight, either departure or return'),
    searchFlightTicketsLink: z
        .string()
        .describe(
            'Real link to search for the flight on skyscanner website, use the flight details to generate the link, insert the IATA codes and dates in the link, based on the skyscanner link format'
        ),
});

export const TeamSchema = z.object({
    id: z.number().describe('Unique identifier of the team'),
    name: z.string().describe('Name of the team'),
    logo: z.string().describe('URL of the team logo'),
});

export const MatchSchema = z.object({
    id: z.number().describe('Unique identifier of the match'),
    homeTeam: TeamSchema.describe('Home team playing in the match'),
    awayTeam: TeamSchema.describe('Away team playing in the match'),
    league: z.string().describe('League in which the match is played'),
    stadium: z.string().describe('Stadium where the match takes place'),
    date: z.string().describe('Date of the match'),
    price: PriceRangeSchema.describe('Price range of the match tickets'),
    searchMatchTicketsLink: z
        .string()
        .describe(
            'Real link to search for match tickets on SeatGeek website. Use the match details to generate the link, inserting the home team, away team, and date as query parameters based on SeatGeek’s search format (e.g., https://seatgeek.com/search?performers[home_team]=FC%20Barcelona&performers[away_team]=Real%20Betis&datetime_utc=2025-04-05)'
        ),
});

export const PackageTimelineItemType = {
    FLIGHT: 'flight',
    DESTINATION: 'destination',
} as const;

export const DestinationSchema = z.object({
    type: z
        .literal(PackageTimelineItemType.DESTINATION)
        .describe('Type of the timeline item, always "destination" for this schema'),
    city: z.string().describe('City name of the destination'),
    startDate: z.string().describe('Start date of the stay in the destination'),
    endDate: z.string().describe('End date of the stay in the destination'),
    matches: z.array(MatchSchema).describe('List of matches happening in this destination'),
});

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

        daysInEachCity: z
            .array(
                z.object({
                    cityName: z.string().describe('The name of the city visited'),
                    cityIata: z.string().length(3).describe('The IATA code of the city visited'),
                    days: z.number().describe('Number of days spent in the city'),
                })
            )
            .describe('List of all cities visited with how many days were spent in each'),

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
        timeline: z.array(TimelineItemSchema).describe(
            `Ordered timeline of the package that mixes flight and destination events.
There can be multiple destinations and flights in a single package, each with one or more matches.`
        ),
        metadata: PackageMetadata,
    })
    .describe('Travel package that combines multiple destinations, flights, and football matches');

export type PriceRange = z.infer<typeof PriceRangeSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type Flight = z.infer<typeof FlightSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type CityInfo = z.infer<typeof CityInfoSchema>;
export type Package = z.infer<typeof PackageSchema>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type FlightItem = z.infer<typeof FlightItemSchema>;
export type Destination = z.infer<typeof DestinationSchema>;

export const PackageDocumentSchema = PackageSchema.extend({
    _id: z.string(),
});

export type PackageDocument = z.infer<typeof PackageDocumentSchema>;
