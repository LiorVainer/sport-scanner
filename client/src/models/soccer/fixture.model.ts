import {z} from 'zod';
import {LeagueSchema, TeamSchema, VenueSchema} from './soccer.model';
import {PriceRangeSchema} from '../price-range.model';

export const FixtureQueryParamsSchema = z.object({
    id: z.number().optional(),
    ids: z.string().optional(),
    live: z.enum(['all']).or(z.string()).optional(),
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    league: z.number().optional(),
    season: z.number().optional(),
    team: z.number().optional(),
    last: z.number().max(99).optional(),
    next: z.number().max(99).optional(),
    from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    round: z.string().optional(),
    status: z.string().optional(),
    venue: z.number().optional(),
    timezone: z.string().optional(),
});

export type FixtureQueryParams = z.infer<typeof FixtureQueryParamsSchema>;

export const FixtureInfoSchema = z.object({
    id: z.number(),
    timezone: z.string(),
    date: z.string(),
    timestamp: z.number(),
    venue: VenueSchema,
});

export const ExtendedFixtureInfoSchema = FixtureInfoSchema.extend({
    venue: VenueSchema.extend({
        countryCode: z.string().optional(),
    }),
});

export const TeamsSchema = z.object({
    home: TeamSchema,
    away: TeamSchema,
});

export const FixtureItemSchema = z
    .object({
        fixture: FixtureInfoSchema,
        league: LeagueSchema,
        teams: TeamsSchema,
    })
    .strip();

export const ExtendedFixtureItemSchema = FixtureItemSchema.extend({
    fixture: ExtendedFixtureInfoSchema,
    price: PriceRangeSchema.optional(),
});

export const FixtureItemWithPriceSchema = FixtureItemSchema.extend({
    price: PriceRangeSchema.optional(),
});

export type FixtureItem = z.infer<typeof FixtureItemSchema>;
export type FixtureItemWithPrice = z.infer<typeof FixtureItemWithPriceSchema>;
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

export const FixturePriceRangeSchema = z
    .object({
        id: z.string().describe('The fixture ID as a string'),
        min: z.number(),
        max: z.number(),
    })
    .describe('Price range details for a specific fixture');

export const FixturePriceRangeListSchema = z
    .array(FixturePriceRangeSchema)

export type FixturePriceRange = z.infer<typeof FixturePriceRangeSchema>;
export type FixturePriceRangeList = z.infer<typeof FixturePriceRangeListSchema>;
