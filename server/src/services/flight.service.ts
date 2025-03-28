import { AIService } from '../ai/ai.service';
import { AmadeusService } from './amadeus.service';

export const FlightsService = {
    getIATACodeByCity: async (city: string): Promise<string | null> => {
        try {
            const code = await FlightsService.getIATAFromAI(city);
            if (code) return code;
            return await AmadeusService.getIATACodeByCity(city);
        } catch (err) {
            console.error(`Failed to get IATA for city ${city}:`, err);
            return null;
        }
    },

    getIATAFromAI: async (city: string): Promise<string | null> => {
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
