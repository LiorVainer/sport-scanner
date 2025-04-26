import { axiosInstance } from '../config/axios-instance';
import { z } from 'zod';

export const CityLocationSchema = z.object({
    type: z.literal('location'),
    subType: z.literal('city'),
    name: z.string(),
    iataCode: z.string().optional(),
    address: z.object({
        countryCode: z.string().length(2),
        stateCode: z.string().optional(),
    }),
    geoCode: z
        .object({
            latitude: z.number().optional(),
            longitude: z.number().optional(),
        })
        .optional(),
});

export type CityLocation = z.infer<typeof CityLocationSchema>;

export const GeoService = {
    async getCities(keyword: string): Promise<CityLocation[]> {
        try {
            const { data } = await axiosInstance.get<CityLocation[]>('/geo/cities', {
                params: { keyword, withIataCode: true },
            });
            return data;
        } catch (error) {
            console.error('Error fetching cities:', (error as any).message);
            throw error;
        }
    },
};
