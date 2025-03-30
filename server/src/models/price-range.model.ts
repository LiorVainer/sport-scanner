import { z } from 'zod';
import { ENV } from '../env/env.config';

export const PriceRangeSchema = z.object({
    min: z.number().describe(`Minimum estimated ticket price in ${ENV.CURRENCY_CODE}`),
    max: z.number().describe(`Maximum estimated ticket price in ${ENV.CURRENCY_CODE}`),
});

export type PriceRange = z.infer<typeof PriceRangeSchema>;
