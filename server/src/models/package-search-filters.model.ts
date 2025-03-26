import { z } from 'zod';

export const PackageSearchFiltersSchema = z.object({
    date: z
        .object({
            from: z.string().optional(), // ISO date string
            to: z.string().optional(),
        })
        .optional(),
    price: z
        .object({
            min: z.number().optional(),
            max: z.number().optional(),
        })
        .optional(),
    country: z.string().optional(),
    league: z.string().optional(),
    team: z.string().optional(),
}).refine(
    (data) => {
        if (data.date?.from && data.date?.to) {
            return new Date(data.date.from) <= new Date(data.date.to);
        }
        return true;
    },
    {
        message: '`date.from` must be before or equal to `date.to`',
        path: ['date', 'to'],
    }
).refine(
    (data) => {
        if (data.price?.min !== undefined && data.price?.max !== undefined) {
            return data.price.min <= data.price.max;
        }
        return true;
    },
    {
        message: '`price.min` must be less than or equal to `price.max`',
        path: ['price', 'max'],
    }
);

export type PackageSearchFilters = z.infer<typeof PackageSearchFiltersSchema>;
