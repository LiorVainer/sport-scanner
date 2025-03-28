import { z } from 'zod';
import { PriceRangeSchema } from './price-range.model';

export const FlightSchema = z.object({
    id: z.number().describe('Unique identifier of the flight'),
    origin: z.string().describe('IATA code of the origin airport'),
    destination: z.string().describe('IATA code of the destination airport'),
    price: z.number().describe('Total flight price in EUR'),
    departureDate: z.string().describe('Flight departure date'),
});

export const MatchSchema = z.object({
    id: z.number().describe('Unique identifier of the match'),
    homeTeam: z.string().describe('Name of the home team'),
    awayTeam: z.string().describe('Name of the away team'),
    league: z.string().describe('League in which the match is played'),
    stadium: z.string().describe('Stadium where the match takes place'),
    date: z.string().describe('Date of the match'),
    price: PriceRangeSchema.describe('Price range of the match tickets'),
});

export const PackageSchema = z
    .object({
        id: z.number().describe('Unique identifier of the package'),
        title: z.string().describe('Title of the travel package'),
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

export type Package = z.infer<typeof PackageSchema>;
