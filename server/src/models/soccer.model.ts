import { z } from 'zod';

// -- Country
export const CountrySchema = z.object({
    name: z.string(),
    code: z.string(),
    flag: z.string().url(),
});
export type Country = z.infer<typeof CountrySchema>;

// -- League (reused in fixture + standalone)
export const LeagueSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: z.string().optional(), // optional for flexibility
    logo: z.string().url(),
    country: z.string().optional(),
    flag: z.string().nullable().optional(),
    season: z.number().optional(),
    round: z.string().optional(),
});
export type League = z.infer<typeof LeagueSchema>;

// -- Venue (reused in fixture + team)
export const VenueSchema = z.object({
    id: z.number().nullable().optional(),
    name: z.string(),
    address: z.string().optional(),
    city: z.string(),
    country: z.string().optional(),
    capacity: z.number().optional(),
    surface: z.string().optional(),
    image: z.string().url().optional(),
});
export type Venue = z.infer<typeof VenueSchema>;

// -- Team (reused in fixture + teams API)
export const TeamSchema = z.object({
    id: z.number(),
    name: z.string(),
    code: z.string().optional(),
    country: z.string().optional(),
    founded: z.number().optional(),
    national: z.boolean().optional(),
    logo: z.string().url(),
    winner: z.boolean().nullable().optional(),
});
export type Team = z.infer<typeof TeamSchema>;
