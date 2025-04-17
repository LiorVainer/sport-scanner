import { AIService } from '../ai/ai.service';
import {
    CityIataToCityMetadataCodeMap,
    CityNameToCityMetadataCodeMap,
    CityWithIATASchemaArray,
} from '../models/flights/iata.model';
import { AmadeusService } from './amadeus.service';
import { CityIataContextMessagesGenerator } from '../ai/messages/city-iata.message';

export const FlightsService = {
    getIATACodeByCity: async (city: string): Promise<string | null> => {
        try {
            const code = await FlightsService.getOneIATAFromAI(city);
            if (code) return code;
            return await AmadeusService.getIATACodeByCity(city);
        } catch (err) {
            console.error(`Failed to get IATA for city ${city}:`, err);
            return null;
        }
    },
    getCityToIATACodeMap: async (
        cities: string[]
    ): Promise<{
        cityNameToCityMetadata: CityNameToCityMetadataCodeMap;
        cityIataToCityMetadata: CityIataToCityMetadataCodeMap;
    }> => {
        try {
            const { data: iataCodes } = await AIService.generateObject({
                schema: CityWithIATASchemaArray,
                saveOutputToFile: true,
                messages: CityIataContextMessagesGenerator.create(cities),
            });

            const cityNameToCityMetadata = Object.fromEntries(cities.map((city, index) => [city, iataCodes[index]]));
            const cityIataToCityMetadata = Object.fromEntries(
                Object.entries(cityNameToCityMetadata).map(([_, metadata]) => [metadata.iataCode, metadata])
            );

            return {
                cityNameToCityMetadata,
                cityIataToCityMetadata,
            };
        } catch (err) {
            console.error(`AI failed to provide IATA codes for ${cities}`, err);
            throw new Error(`AI failed to provide IATA codes for ${cities}`);
        }
    },
    getOneIATAFromAI: async (city: string): Promise<string | null> => {
        try {
            const response = await AIService.generateText(
                `What is the most likely IATA airport code for the city "${city}"? Respond with only the 3-letter code.`
            );

            return response.trim().toUpperCase().slice(0, 3);
        } catch (err) {
            console.error(`AI failed to provide IATA code for ${city}`, err);
            return null;
        }
    },
};
