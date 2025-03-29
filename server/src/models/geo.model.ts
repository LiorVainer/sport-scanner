import z from 'zod';

export const CountrySchema = z.object({
    name: z.string(),
    code: z.string(),
    flag: z.string().url(),
});
export type Country = z.infer<typeof CountrySchema>;

export const CitySearchParamsSchema = z.object({
    countryName: z.string(),
    countryCode: z.string(),
});

export type CitySearchParams = z.infer<typeof CitySearchParamsSchema>;
