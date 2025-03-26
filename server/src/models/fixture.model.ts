import {z} from 'zod';
import {LeagueSchema, TeamSchema, VenueSchema} from "./soccer.model";


export const FixtureQueryParamsSchema = z.object({
    id: z.number().optional(),
    ids: z.string().optional(),
    live: z.enum(['all']).or(z.string()).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    league: z.number().optional(),
    season: z.number().optional(),
    team: z.number().optional(),
    last: z.number().max(99).optional(),
    next: z.number().max(99).optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    round: z.string().optional(),
    status: z.string().optional(),
    venue: z.number().optional(),
    timezone: z.string().optional(),
});

export type FixtureQueryParams = z.infer<typeof FixtureQueryParamsSchema>;

export const StatusSchema = z.object({
    long: z.string(),
    short: z.string(),
    elapsed: z.number(),
    extra: z.number().nullable(),
});

export const FixtureInfoSchema = z.object({
    id: z.number(),
    referee: z.string().nullable(),
    timezone: z.string(),
    date: z.string(),
    timestamp: z.number(),
    venue: VenueSchema,
    status: StatusSchema,
});

export const ExtendedFixtureInfoSchema = FixtureInfoSchema.extend({
    countryCode: z.string().optional(),
})

export const TeamsSchema = z.object({
    home: TeamSchema,
    away: TeamSchema,
});

export const FixtureItemSchema = z.object({
    fixture: FixtureInfoSchema,
    league: LeagueSchema,
    teams: TeamsSchema,
});

export const ExtendedFixtureItemSchema = FixtureItemSchema.extend({
    fixture: ExtendedFixtureInfoSchema,
});

export type FixtureItem = z.infer<typeof FixtureItemSchema>;

export type ExtendedFixtureItem = z.infer<typeof ExtendedFixtureItemSchema>;

export const FixtureResponseSchema = z.object({
    get: z.string(),
    parameters: z.object({
        live: z.string().optional(),
    }),
    errors: z.union([z.array(z.string()), z.record(z.string())]),
    results: z.number(),
    paging: z.object({
        current: z.number(),
        total: z.number(),
    }),
    response: z.array(FixtureItemSchema),
});

export type FixtureResponse = z.infer<typeof FixtureResponseSchema>;
