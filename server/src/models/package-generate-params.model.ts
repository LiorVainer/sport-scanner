import {z} from 'zod';
import {zodDate} from "../utils/zod.utils";
import {PriceRangeSchema} from "./price-range.model";

export const PackageGenerateParamsSchema = z.object({
    date: z
        .object({
            from: zodDate, // ISO date string
            to: zodDate,
        })
        .optional(),
    price: PriceRangeSchema
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

export type PackageGenerateParams = z.infer<typeof PackageGenerateParamsSchema>;
