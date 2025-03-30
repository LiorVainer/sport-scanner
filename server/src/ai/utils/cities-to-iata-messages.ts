import { CoreMessage } from 'ai';
import { message } from './message.utils';

export const generateMessagesForGettingCitiesIATACodes = (cities: string[]): CoreMessage[] => [
    message.system(
        `You are a travel assistant responsible for mapping city names to their primary airport IATA codes. Return only the main IATA code used for international or major regional flights from that city.`
    ),
    message.user(
        `Provide the main IATA airport code for each of the following cities:\n\n${cities
            .map((city, index) => `${index + 1}. ${city}`)
            .join('\n')}`
    ),
];
