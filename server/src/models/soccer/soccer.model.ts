import { z } from 'zod';

export const LeagueSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: z.string().optional(), // optional for flexibility
    logo: z.string(),
    country: z.string().optional(),
    flag: z.string().nullable().optional(),
    season: z.number().optional(),
    round: z.string().optional(),
});
export type League = z.infer<typeof LeagueSchema>;

export const VenueSchema = z.object({
    id: z.number().nullable().optional(),
    name: z.string(),
    address: z.string().optional(),
    city: z.string(),
    country: z.string().optional(),
    capacity: z.number().optional(),
    surface: z.string().optional(),
    image: z.string().optional(),
});
export type Venue = z.infer<typeof VenueSchema>;

export const TeamSchema = z.object({
    id: z.number(),
    name: z.string(),
    code: z.string().optional(),
    country: z.string().optional(),
    founded: z.number().optional(),
    national: z.boolean().optional(),
    logo: z.string(),
    winner: z.boolean().nullable().optional(),
});

export type Team = z.infer<typeof TeamSchema>;
