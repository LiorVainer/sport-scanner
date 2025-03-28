import { z } from 'zod';

export const PriceRangeSchema = z.object({
    min: z.number().describe('Minimum estimated ticket price in EUR'),
    max: z.number().describe('Maximum estimated ticket price in EUR'),
});

export type PriceRange = z.infer<typeof PriceRangeSchema>;
