import {z} from 'zod';
import {PriceRangeSchema} from "@/models/packages/package.model.ts";
import {zodDate} from "@/utils/zod.utils.ts";

export const DateRangeSchema = z.object({
    from: zodDate,
    to: zodDate,
}).describe('Date range for the package generation');

export const PackagesGenerationParamsSchema = z
    .object({
        date: DateRangeSchema,
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