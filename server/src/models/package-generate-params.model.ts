import {z} from 'zod';
import {zodDate} from '../utils/zod.utils';
import {PriceRangeSchema} from './price-range.model';
import {ValueOf} from "../types/general.types";

export const PackagesGenerationParamsSchema = z
    .object({
        date: z.object({
            from: zodDate,
            to: zodDate,
        }),
        price: PriceRangeSchema,
        originIATA: z.string(),
        league: z.number(),
        team: z.number(),
    })
    .refine(
        (data) => {
            if (data.date.from && data.date.to) {
                return new Date(data.date.from) <= new Date(data.date.to);
            }
            return true;
        },
        {
            message: '`date.from` must be before or equal to `date.to`',
            path: ['date', 'to'],
        }
    )
    .refine(
        (data) => {
            if (data.price.min !== undefined && data.price.max !== undefined) {
                return data.price.min <= data.price.max;
            }
            return true;
        },
        {
            message: '`price.min` must be less than or equal to `price.max`',
            path: ['price', 'max'],
        }
    );

export type PackagesGenerationParams = z.infer<typeof PackagesGenerationParamsSchema>;


export const GeneratePackagesSteps = {
    GENERATE_SEARCH_FIXTURE_PARAMS: 'generate_search_fixture_params',
    FETCH_FIXTURES: 'fetch_fixtures',
    ADD_PRICE_RANGE_TO_FIXTURES: 'add_price_range_to_fixtures',
    GENERATE_SEARCH_PARAMS: 'generate_search_params',
    SEARCH_FLIGHTS: 'search_flights',
    GENERATE_PACKAGES: 'generate_packages',
    FILTER_PACKAGES: 'filter_packages',
    FINISHED_GENERATING_PACKAGES: 'finished_generating_packages',
    TOTAL: 'total',
} as const;

export type GeneratePackagesStep = ValueOf<typeof GeneratePackagesSteps>;

export type GeneratePackagesStepKey = keyof typeof GeneratePackagesSteps;

export const GeneratePackagesTimingSteps = {
    GENERATE_SEARCH_FIXTURE_PARAMS: 'generateSearchFixtureParamsMs',
    FETCH_FIXTURES: 'fetchFixturesMs',
    ADD_PRICE_RANGE_TO_FIXTURES: 'addPriceRangeToFixturesMs',
    GENERATE_SEARCH_PARAMS: 'generateSearchParamsMs',
    SEARCH_FLIGHTS: 'searchFlightsMs',
    GENERATE_PACKAGES: 'generatePackagesMs',
    FINISHED_GENERATING_PACKAGES: 'finishedGeneratingPackagesMs',
    FILTER_PACKAGES: 'filterPackagesMs',
    TOTAL: 'totalMs',
} satisfies Record<GeneratePackagesStepKey, any>;

export type GeneratePackagesTimingStep = typeof GeneratePackagesTimingSteps[keyof typeof GeneratePackagesTimingSteps];
