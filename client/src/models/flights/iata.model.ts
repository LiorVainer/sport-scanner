import { z } from 'zod';

export const CityWithIATASchema = z.object({
    cityName: z.string().describe('City name'),
    iataCode: z.string().length(3).describe('IATA code of the airport'),
});

export const CityWithIATASchemaArray = z.array(CityWithIATASchema).describe('cities-with-iata-array');
export const CityToIATACodeMapSchema = z
    .record(CityWithIATASchema.shape.cityName, CityWithIATASchema.shape.iataCode)
    .describe('cities-with-iata-map');

export type CityWithIATA = z.infer<typeof CityWithIATASchema>;
export type CityWithIATAArray = z.infer<typeof CityWithIATASchemaArray>;
export type CityToIATACodeMap = z.infer<typeof CityToIATACodeMapSchema>;
