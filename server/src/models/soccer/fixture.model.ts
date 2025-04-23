import { z } from 'zod';
import { LeagueSchema, TeamSchema, VenueSchema } from './soccer.model';
import { PriceRangeSchema } from '../price-range.model';
import { ENV } from '../../env/env.config';

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

export const FixtureInfoSchema = z
    .object({
        id: z.number().describe('Unique fixture ID'),
        timezone: z.string().describe('Timezone of the fixture start time'),
        date: z.string().describe('Fixture start date and time (ISO string)'),
        timestamp: z.number().describe('Unix timestamp of fixture date'),
        venue: VenueSchema.describe('Venue where the fixture is played'),
    })
    .describe('Core fixture information');

export const TeamsSchema = z
    .object({
        home: TeamSchema.describe('Home team information'),
        away: TeamSchema.describe('Away team information'),
    })
    .describe('Information about both teams in a fixture');

export const FixtureItemSchema = z
    .object({
        fixture: FixtureInfoSchema,
        league: LeagueSchema.describe('League associated with the fixture'),
        teams: TeamsSchema,
    })
    .strip()
    .describe('Basic fixture structure combining fixture info, league, and teams');

export const ExtendedFixtureItemSchema = FixtureItemSchema.extend({
    price: PriceRangeSchema.optional().describe(`Optional ticket price range in ${ENV.CURRENCY_CODE}`),
}).describe('Fixture item with optional price info');

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

export const FixturePriceRangeSchema = z
    .object({
        id: z.string().describe('The fixture ID as a string'),
        min: z.number().describe(`Minimum estimated ticket price in ${ENV.CURRENCY_CODE}`),
        max: z.number().describe(`Maximum estimated ticket price in ${ENV.CURRENCY_CODE}`),
    })
    .describe('Price range details for a specific fixture');

export const FixturePriceRangeListSchema = z
    .array(FixturePriceRangeSchema)
    .describe(`An array of price range objects, each with fixture ID, min and max price in ${ENV.CURRENCY_CODE}`);

export type FixturePriceRange = z.infer<typeof FixturePriceRangeSchema>;
export type FixturePriceRangeList = z.infer<typeof FixturePriceRangeListSchema>;
