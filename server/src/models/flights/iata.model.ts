import { z } from 'zod';

export const CityWithIATASchema = z.object({
    cityName: z.string().describe('City name'),
    iataCode: z.string().length(3).describe('IATA code of the airport'),
    bigCityInIata: z.string().describe('The Cloest Biggest city that has the IATA code'),
});

export const CityWithIATASchemaArray = z.array(CityWithIATASchema).describe('cities-with-iata-array');
export const CityNameToCityMetadataCodeMapSchema = z
    .record(CityWithIATASchema.shape.cityName, CityWithIATASchema)
    .describe('cities-with-iata-map');

export const CityIataToCityMetadataCodeMapSchema = z
    .record(CityWithIATASchema.shape.iataCode, CityWithIATASchema)
    .describe('cities-with-iata-map');

export type CityWithIATA = z.infer<typeof CityWithIATASchema>;
export type CityWithIATAArray = z.infer<typeof CityWithIATASchemaArray>;
export type CityNameToCityMetadataCodeMap = z.infer<typeof CityNameToCityMetadataCodeMapSchema>;
export type CityIataToCityMetadataCodeMap = z.infer<typeof CityIataToCityMetadataCodeMapSchema>;
