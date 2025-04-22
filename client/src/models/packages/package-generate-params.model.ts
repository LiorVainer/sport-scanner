import { z } from 'zod';
import { zodDate } from '@/utils/zod.utils.ts';

export const DateRangeSchema = z.object({
  from: zodDate,
  to: zodDate,
}).describe('Date range for the package generation');

export const PackagesGenerationParamsSchema = z
  .object({
    originIATA: z.string().min(1, { message: 'Origin Airport is required' }),
    date: z.object({
      from: z.string().nonempty({ message: 'Start Date is required' }),
      to: z.string().nonempty({ message: 'End Date is required' }),
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
    team: z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
        })
      )
      .max(5, 'You can select up to 5 teams')
      .optional(),
  })
  .refine(
    (data) =>
      (!!data.league && !data.team?.length) || (!data.league && !!data.team?.length),
    {
      message: 'You must select either a league or one or more teams (not both)',
      path: ['league'], // points the error to "league"
    }
  );

export type PackagesGenerationParams = z.infer<typeof PackagesGenerationParamsSchema>;
