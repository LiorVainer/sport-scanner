import { z } from 'zod';
import {zodDate} from "../utils/zod.utils";

export const FlightSchema = z.object({
    id: z.number(),
    origin: z.string(),
    destination: z.string(),
    price: z.number(),
    departureDate: zodDate,
});

export const MatchSchema = z.object({
    id: z.number(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    league: z.string(),
    stadium: z.string(),
    date: zodDate,
    price: z.number(),
});

export const PackageSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    fromDate: zodDate,
    toDate: zodDate,
    location: z.string(),
    flightsPrice: z.number(),
    matchesPrice: z.number(),
    flights: z.array(FlightSchema),
    matches: z.array(MatchSchema),
});

export type Package = z.infer<typeof PackageSchema>;
