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
    stadium: z.string().describe('Stadium where the match takes place'),
    date: z.string().describe('Date of the match'),
    price: PriceRangeSchema.describe('Price range of the match tickets'),
    searchMatchTicketsLink: z
        .string()
        .describe(
            'Real link to search for match tickets on SeatGeek website. Use the match details to generate the link, inserting the home team, away team, and date as query parameters based on SeatGeek’s search format (e.g., https://seatgeek.com/search?performers[home_team]=FC%20Barcelona&performers[away_team]=Real%20Betis&datetime_utc=2025-04-05)'
        ),
});

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
        flightsPrice: z.number().describe('Total combined price of all flights in the package'),
        matchesPrice: PriceRangeSchema.describe('Price range of all matches in the package'),
        totalPrice: PriceRangeSchema.describe('Total price of the package'),
        flights: z.array(FlightSchema).describe('List of flights included in the package'),
        matches: z.array(MatchSchema).describe('List of matches included in the package'),
    })
    .describe('travel package that combines flights and matches');

export const PackageArraySchema = z.array(PackageSchema).describe('packages-array');

export type Match = z.infer<typeof MatchSchema>;
export type Flight = z.infer<typeof FlightSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type CityInfo = z.infer<typeof CityInfoSchema>;
export type Package = z.infer<typeof PackageSchema>;
