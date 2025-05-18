import { z } from 'zod';
import { zodDate } from '../../utils/zod.utils';

export const DateRangeSchema = z
    .object({
        from: zodDate.describe('Earliest possible departure date'),
        to: zodDate.describe('Latest possible return date'),
    })
    .describe('Date range for the package generation');

export const PackagesGenerationParamsSchema = z
    .object({
        originIATA: z
            .string()
            .min(1, { message: 'Origin Airport is required' })
            .describe('Three-letter IATA airport code of the origin (e.g., TLV)'),

        date: z
            .object({
                from: zodDate.describe('Earliest departure date (inclusive)'),
                to: zodDate.describe('Latest return date (inclusive)'),
            })
            .describe('Date range of the user’s availability for travel'),

        price: z
            .object({
                min: z.number().describe('Minimum acceptable total price (e.g., 0)'),
                max: z.number().describe('Maximum acceptable total price (e.g., 1000)'),
            })
            .describe('Price constraints for the entire trip'),

        country: z.string().optional().describe('Preferred country of destination (optional)'),

        league: z
            .object({
                id: z.number().describe('Unique ID of the league'),
                name: z.string().describe('Name of the preferred league'),
            })
            .optional()
            .describe('Target football league (optional)'),

        teams: z
            .object({
                id: z.number().describe('Unique ID of the team'),
                name: z.string().describe('Name of the preferred team'),
            })
            .array()
            .optional()
            .describe('List of preferred teams (optional)'),
    })
    .describe('Structured input used to generate travel packages based on user preferences');

export const PackagesGenerationParamsWithFreeTextSchema = PackagesGenerationParamsSchema.extend({
    freeText: z.string().optional(),
});

export const zodDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const PackagesGenerationParamsWithStringDatesAndFreeTextSchema =
    PackagesGenerationParamsWithFreeTextSchema.extend({
        date: z
            .object({
                from: zodDateString.describe('Earliest departure date (ISO format: YYYY-MM-DD)'),
                to: zodDateString.describe('Latest return date (ISO format: YYYY-MM-DD)'),
            })
            .describe('Date range of the user’s availability for travel'),
    }).describe('Structured input used to generate travel packages based on user preferences');

export const PackagesGenerationParamsFromFreeTextSchema = PackagesGenerationParamsSchema.extend({
    date: z.object({
        from: zodDateString.describe('Earliest departure date (ISO format: YYYY-MM-DD)'),
        to: zodDateString.describe('Latest return date (ISO format: YYYY-MM-DD)'),
    }),
    country: z.string().optional().describe('Preferred country of destination (optional)'),
    league: z.string().optional().describe('Target football league (optional)'),
    teams: z
        .object({
            name: z.string().describe('Name of the preferred team'),
        })
        .array()
        .optional()
        .describe('List of preferred teams (optional)'),
}).describe('Structured input used to generate travel packages based on user free text input');

export type PackagesGenerationParams = z.infer<typeof PackagesGenerationParamsSchema>;
export type PackagesGenerationParamsWithFreeText = z.infer<typeof PackagesGenerationParamsWithFreeTextSchema>;
export type PackagesGenerationParamsFromFreeText = z.infer<typeof PackagesGenerationParamsFromFreeTextSchema>;
export type PackagesGenerationParamsWithStringDatesAndFreeText = z.infer<
    typeof PackagesGenerationParamsWithStringDatesAndFreeTextSchema
>;
