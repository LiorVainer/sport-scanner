import { z } from 'zod';
import { PriceRangeSchema } from './price-range.model';
import { ENV } from '../env/env.config';

export const CityInfoSchema = z.object({
    name: z.string().describe('City name'),
    iataCode: z.string().length(3).describe('IATA code of the airport'),
});

export const FlightSchema = z.object({
    id: z.number().describe('Unique identifier of the flight'),
    origin: CityInfoSchema.describe('Origin city information'),
    destination: CityInfoSchema.describe('Destination city information'),
    price: z.number().describe(`Total flight price in ${ENV.CURRENCY_CODE}`),
    departureDate: z.string().describe('Flight departure date'),
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
    city: z.string().describe('The city where the match takes place'),
    cityIataCode: z.string().describe('IATA code of the city where the match takes place'),
    stadium: z.string().describe('Stadium where the match takes place'),
    date: z.string().describe('Date of the match'),
    price: PriceRangeSchema.describe('Price range of the match tickets'),
    searchMatchTicketsLink: z
        .string()
        .describe(
            'URL to search for match tickets on StubHub. This should include relevant query parameters such as the home team, away team, date, or venue when applicable. For example: https://www.stubhub.com/search?q=FC%20Barcelona%20vs%20Real%20Betis%202025-04-05'
        ),
});

export const DestinationSchema = z.object({
    type: z.literal('destination').describe('Type of the timeline item, always "destination" for this schema'),
    city: z.string().describe('City name of the destination'),
    startDate: z.string().describe('Start date of the stay in the destination'),
    endDate: z.string().describe('End date of the stay in the destination'),
    matches: z.array(MatchSchema).describe('List of matches happening in this destination'),
});

export const FlightItemSchema = FlightSchema.extend({
    type: z.literal('flight').describe('Type of the timeline item, always "flight" for this schema'),
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
                'Title of the travel package, make it catchy and attractive, if it is only one match, include the name of the teams and the league'
            ),
        description: z.string().describe('Description of what the package includes'),
        fromDate: z.string().describe('Start date of the package'),
        toDate: z.string().describe('End date of the package'),
        location: z.string().describe('Main location of the package'),
        flightsPrice: z.number()
            .describe(`Total combined price of all flights in the package, if a flight is round trip dont count it twice in price.
         take just the price of the flight listed in flight to the destination and without the return flight`),
        matchesPrice: PriceRangeSchema.describe('Price range of all matches in the package'),
        totalPrice: PriceRangeSchema.describe('Total price of the package, flightsPrice + matchesPrice'),
        timeline: z
            .array(TimelineItemSchema)
            .describe('Timeline of the package, consisting of flights and destinations in chronological order'),
        metadata: PackageMetadata,
    })
    .describe('travel package that combines flights and matches');

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
