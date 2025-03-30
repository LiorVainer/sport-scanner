import z from 'zod';

export const CountrySchema = z.object({
    name: z.string(),
    code: z.string(),
    flag: z.string().url(),
});
export type Country = z.infer<typeof CountrySchema>;

export const CitySearchParamsSchema = z.object({
    keyword: z.string(),
    countryCode: z.string().optional(),
    withIataCode: z
        .string()
        .transform((val) => val === 'true')
});

export const CityLocationSchema = z.object({
    type: z.literal('location'),
    subType: z.literal('city'),
    name: z.string(),
    iataCode: z.string().optional(),
    address: z.object({
        countryCode: z.string().length(2),
        stateCode: z.string().optional()
    }),
    geoCode: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }).optional(),
});

export type CityLocation = z.infer<typeof CityLocationSchema>;
export type CitySearchParams = z.infer<typeof CitySearchParamsSchema>;
