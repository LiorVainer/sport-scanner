import { z } from 'zod';
import { zodDate } from '../../utils/zod.utils';

export const DateRangeSchema = z
    .object({
        from: zodDate,
        to: zodDate,
    })
    .describe('Date range for the package generation');

export const PackagesGenerationParamsSchema = z.object({
    originIATA: z.string().min(1, { message: 'Origin Airport is required' }),
    date: z.object({
        from: zodDate,
        to: zodDate,
    }),
    price: z.object({
        min: z.number(),
        max: z.number(),
    }),
    country: z.string().optional(),
    league: z
        .object({
            id: z.number(),
            name: z.string(),
        })
        .optional(),
    teams: z
        .object({
            id: z.number(),
            name: z.string(),
        })
        .array()
        .optional(),
});

export const InnerPackagesGenerationParamsSchema = PackagesGenerationParamsSchema.omit({ date: true }).extend({
    date: z.object({
        from: z.date(),
        to: z.date(),
    }),
});

export type PackagesGenerationParams = z.infer<typeof PackagesGenerationParamsSchema>;
