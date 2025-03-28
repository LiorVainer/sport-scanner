import { z } from 'zod';

export const PriceRangeSchema = z
    .object({
        min: z.number().describe('Minimum estimated ticket price in EUR'),
        max: z.number().describe('Maximum estimated ticket price in EUR'),
    })
    .describe('Represents a price range for a soccer match ticket in EUR');

export type PriceRange = z.infer<typeof PriceRangeSchema>;
