import { AIService } from '../ai/ai.service';
import { generateMessagesForGettingCitiesIATACodes } from '../ai/utils/cities-to-iata-messages';
import { CityToIATACodeMap, CityWithIATASchemaArray } from '../models/iata.model';
import { AmadeusService } from './amadeus.service';

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
    getCityToIATACodeMap: async (cities: string[]): Promise<CityToIATACodeMap> => {
        try {
            const iataCodes = await AIService.generateObject({
                schema: CityWithIATASchemaArray,
                saveOutputToFile: true,
                messages: generateMessagesForGettingCitiesIATACodes(cities),
            });

            return Object.fromEntries(cities.map((city, index) => [city, iataCodes[index].iataCode]));
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
    getAirportsByCountry: async (country: string): Promise<string[]> => {
        try {
            const airports = await AmadeusService.getCities(country);
            return airports.map((airport) => airport.iataCode);
        } catch (err) {
            console.error(`Failed to get airports for country ${country}:`, err);
            throw new Error(`Failed to get airports for country ${country}`);
        }
    },
};
