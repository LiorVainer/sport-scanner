import {z} from 'zod';

export const PriceRangeSchema = z.object({
    min: z.number(),
    max: z.number(),
});

export type PriceRange = z.infer<typeof PriceRangeSchema>;
